import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, InjectionToken, Service, signal } from '@angular/core';
import { Capacitor, type PermissionState } from '@capacitor/core';
import { PushNotifications, type PushNotificationSchema } from '@capacitor/push-notifications';
import type { FirebaseOptions } from 'firebase/app';
import type { MessagePayload, Messaging } from 'firebase/messaging';
import {
  catchError,
  defer,
  EMPTY,
  finalize,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';

// eslint-disable-next-line boundaries/dependencies -- push keeps its whole stack in one folder; deliberate crossing
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { createLogger } from '@shared/lib/logging/logger';
import { PushSubscriptionApi } from '../api/push-subscription.api';

/** Firebase web-app options plus the Web Push certificate key that getToken() requires. */
export interface FcmConfig extends FirebaseOptions {
  /** Console → Cloud Messaging → Web Push certificates; empty keeps web push off. */
  readonly vapidKey: string;
}

export const FCM_CONFIG = new InjectionToken<FcmConfig>('FCM_CONFIG');

const STORAGE_KEY = 'boreas-push';
/* The server INSERTs without upsert, so only a changed token may be posted again. */
const REGISTERED_KEY = 'boreas-push-registered';

/* A knob that snaps back explains nothing, so every refusal names its next step. */
const BLOCKED_WEB =
  'Notifications are blocked for this site. Allow them in the browser settings, then try again.';
const BLOCKED_NATIVE =
  'Notifications are blocked for Boreas. Allow them in the system settings, then try again.';
const DISMISSED = 'The permission request closed without an answer. Try again to decide.';
const UNSUPPORTED_MESSAGE = 'This browser cannot receive push notifications.';
const REGISTER_FAILED =
  'The server did not accept this device. Boreas retries the registration at the next launch.';

const blockedMessage = (): string => (Capacitor.isNativePlatform() ? BLOCKED_NATIVE : BLOCKED_WEB);

export type PushPermission = NotificationPermission | 'unsupported';

/** Foreground push payload, unified across the web SDK and the native plugin. */
export interface PushMessage {
  readonly title: string;
  readonly body: string;
  readonly data: Readonly<Record<string, string>>;
}

const toPushPermission = (state: PermissionState): PushPermission =>
  state === 'granted' || state === 'denied' ? state : 'default';

const toWebMessage = (payload: MessagePayload): PushMessage => ({
  title: payload.notification?.title ?? '',
  body: payload.notification?.body ?? '',
  data: payload.data ?? {},
});

const toNativeMessage = (notification: PushNotificationSchema): PushMessage => ({
  title: notification.title ?? '',
  body: notification.body ?? '',
  data: (notification.data as Record<string, string> | undefined) ?? {},
});

/** Push registration for every platform: FCM web SDK in browsers, the Capacitor plugin natively. */
@Service()
export class PushStore {
  private readonly config = inject(FCM_CONFIG, { optional: true });
  private readonly document = inject(DOCUMENT);
  private readonly api = inject(PushSubscriptionApi);
  private readonly auth = inject(AuthTokenStore);
  private readonly logger = createLogger('push');

  private readonly permissionState = signal<PushPermission>('default');
  private readonly tokenState = signal('');
  private readonly messageState = signal<PushMessage | undefined>(undefined);
  private readonly enabledState = signal(false);
  private readonly busyState = signal(false);
  private readonly errorState = signal('');

  readonly permission = this.permissionState.asReadonly();
  /** Device registration token, mirrored to the backend while signed in. */
  readonly token = this.tokenState.asReadonly();
  /** Last foreground push; background delivery belongs to the OS and the service worker. */
  readonly message = this.messageState.asReadonly();
  readonly enabled = this.enabledState.asReadonly();
  readonly busy = this.busyState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly hint = computed(() =>
    this.permissionState() === 'denied' ? blockedMessage() : this.errorState(),
  );

  private messaging: Messaging | undefined;

  constructor() {
    effect(() => {
      const token = this.tokenState();
      if (!this.auth.authenticated()) {
        return;
      }
      const registered = this.registeredToken();

      if (token && token !== registered) {
        this.api
          .subscribe(token)
          .pipe(
            /* 409 means the token already sits on the server; adopt it instead of failing. */
            catchError((error: unknown) => {
              if (error instanceof HttpErrorResponse && error.status === 409) {
                return of(undefined);
              }
              this.errorState.set(REGISTER_FAILED);
              this.logger.error('device registration rejected', {
                status: error instanceof HttpErrorResponse ? error.status : undefined,
              });
              return EMPTY;
            }),
          )
          .subscribe(() => {
            this.setRegisteredToken(token);
            this.logger.info('device registered');
          });
      } else if (!token && registered) {
        /* Best effort: the row may belong to another user or be gone already. */
        this.api
          .unsubscribe(registered)
          .pipe(catchError(() => of(undefined)))
          .subscribe(() => {
            this.setRegisteredToken('');
            this.logger.debug('device unregistered');
          });
      }
    });
  }

  /** Boot hook for providePushNotifications: reconnects devices that opted in, never prompts. */
  init(): void {
    if (Capacitor.isNativePlatform()) {
      this.initNative();
    } else {
      this.initWeb();
    }
  }

  /** Must run inside a user gesture: browsers only honor the first permission prompt in one. */
  enable(): Observable<void> {
    const native = Capacitor.isNativePlatform();

    this.errorState.set('');
    this.busyState.set(true);
    this.logger.debug('enable requested', { native, permission: this.permissionState() });

    const flow = native ? this.enableNative() : this.enableWeb();

    return flow.pipe(
      tap(() => this.setOptedIn(true)),
      catchError((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);

        this.errorState.set(message);
        this.logger.error('enable failed', { message });
        return EMPTY;
      }),
      finalize(() => this.busyState.set(false)),
    );
  }

  /** Turns push off for this device; the browser/OS permission itself stays granted. */
  disable(): Observable<void> {
    /* Opt-out is recorded first so a failed remote revoke cannot resurrect push at next boot. */
    this.setOptedIn(false);
    this.tokenState.set('');
    this.enabledState.set(false);
    this.busyState.set(true);
    /* A stale failure must not outlive the switch it explained. */
    this.errorState.set('');

    const revoke: Observable<unknown> = Capacitor.isNativePlatform()
      ? defer(() => PushNotifications.unregister())
      : defer(() => import('firebase/messaging')).pipe(
          switchMap((fcm) => (this.messaging ? fcm.deleteToken(this.messaging) : of(true))),
        );

    return revoke.pipe(
      map(() => undefined),
      catchError(() => of(undefined)),
      finalize(() => this.busyState.set(false)),
    );
  }

  private initWeb(): void {
    const view = this.document.defaultView;

    if (!view) {
      this.permissionState.set('unsupported');
      this.logger.warn('web push unsupported', { missing: ['window'] });
      return;
    }

    /* Listed by name so one production console line says which capability is absent. */
    const missing = (
      [
        ['vapidKey', Boolean(this.config?.vapidKey)],
        ['Notification', 'Notification' in view],
        ['serviceWorker', 'serviceWorker' in view.navigator],
        ['PushManager', 'PushManager' in view],
        ['secureContext', view.isSecureContext],
      ] as const
    ).filter(([, present]) => !present);

    if (missing.length) {
      this.permissionState.set('unsupported');
      this.logger.warn('web push unsupported', { missing: missing.map(([name]) => name) });
      return;
    }

    this.permissionState.set(view.Notification.permission);
    this.logger.debug('web init', {
      permission: view.Notification.permission,
      optedIn: this.optedIn(),
    });

    if (this.optedIn() && view.Notification.permission === 'granted') {
      /* Offline at boot is not an error state; the next toggle attempt surfaces real failures. */
      this.connectWeb()
        .pipe(
          catchError((error: unknown) => {
            this.logger.warn('boot reconnect failed', {
              message: error instanceof Error ? error.message : String(error),
            });
            return EMPTY;
          }),
        )
        .subscribe();
    }
  }

  private initNative(): void {
    /* Listeners attach first so a registration fired by the boot reconnect is never missed. */
    void PushNotifications.addListener('registration', ({ value }) => {
      this.tokenState.set(value);
      this.enabledState.set(true);
      this.logger.debug('native registration token received');
    });
    void PushNotifications.addListener('registrationError', ({ error }) => {
      this.errorState.set(error);
      this.enabledState.set(false);
      /* Missing google-services.json / GoogleService-Info.plist lands here, silently until now. */
      this.logger.error('native registration failed', { error });
    });
    void PushNotifications.addListener('pushNotificationReceived', (notification) => {
      this.messageState.set(toNativeMessage(notification));
    });

    defer(() => PushNotifications.checkPermissions()).subscribe(({ receive }) => {
      this.permissionState.set(toPushPermission(receive));
      this.logger.debug('native init', { receive, optedIn: this.optedIn() });
      if (this.optedIn() && receive === 'granted') {
        void PushNotifications.register();
      }
    });
  }

  private enableWeb(): Observable<void> {
    const view = this.document.defaultView;
    if (!view) {
      this.errorState.set(UNSUPPORTED_MESSAGE);
      this.logger.error('no window to request permission from');
      return EMPTY;
    }

    /* Permission runs before the firebase import: Safari drops transient activation on async hops. */
    return defer(() => view.Notification.requestPermission()).pipe(
      switchMap((permission) => {
        this.permissionState.set(permission);
        if (permission === 'granted') {
          return this.connectWeb();
        }

        /* Chrome answers "denied" with no prompt once a site is blocked; that must not read as a no-op. */
        this.errorState.set(permission === 'denied' ? blockedMessage() : DISMISSED);
        this.logger.warn('web permission refused', { permission });
        return EMPTY;
      }),
    );
  }

  private enableNative(): Observable<void> {
    return defer(() => PushNotifications.requestPermissions()).pipe(
      switchMap(({ receive }) => {
        this.permissionState.set(toPushPermission(receive));
        if (receive !== 'granted') {
          this.errorState.set(receive === 'denied' ? blockedMessage() : DISMISSED);
          this.logger.warn('native permission refused', { receive });
          return EMPTY;
        }
        return from(PushNotifications.register()).pipe(tap(() => this.enabledState.set(true)));
      }),
      map(() => undefined),
    );
  }

  /* Lazy import keeps firebase out of the initial bundle for users who never enable push. */
  private connectWeb(): Observable<void> {
    return defer(() => forkJoin([import('firebase/app'), import('firebase/messaging')])).pipe(
      switchMap(([{ initializeApp }, fcm]) =>
        from(fcm.isSupported()).pipe(
          switchMap((supported) => {
            if (!supported || !this.config) {
              this.permissionState.set('unsupported');
              this.errorState.set(UNSUPPORTED_MESSAGE);
              this.logger.warn('firebase messaging unsupported', {
                supported,
                configured: Boolean(this.config),
              });
              return EMPTY;
            }
            if (!this.messaging) {
              this.messaging = fcm.getMessaging(initializeApp(this.config));
              fcm.onMessage(this.messaging, (payload) =>
                this.messageState.set(toWebMessage(payload)),
              );
            }
            return from(fcm.getToken(this.messaging, { vapidKey: this.config.vapidKey }));
          }),
          tap((token) => {
            this.tokenState.set(token);
            this.enabledState.set(true);
            this.logger.debug('web token acquired');
          }),
          map(() => undefined),
        ),
      ),
    );
  }

  private optedIn(): boolean {
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  private setOptedIn(value: boolean): void {
    try {
      if (value) {
        this.document.defaultView?.localStorage.setItem(STORAGE_KEY, '1');
      } else {
        this.document.defaultView?.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      return;
    }
  }

  private registeredToken(): string {
    try {
      return this.document.defaultView?.localStorage.getItem(REGISTERED_KEY) ?? '';
    } catch {
      return '';
    }
  }

  private setRegisteredToken(value: string): void {
    try {
      if (value) {
        this.document.defaultView?.localStorage.setItem(REGISTERED_KEY, value);
      } else {
        this.document.defaultView?.localStorage.removeItem(REGISTERED_KEY);
      }
    } catch {
      return;
    }
  }
}
