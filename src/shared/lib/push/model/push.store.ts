import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { effect, inject, InjectionToken, Service, signal } from '@angular/core';
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
            catchError((error: unknown) =>
              error instanceof HttpErrorResponse && error.status === 409 ? of(undefined) : EMPTY,
            ),
          )
          .subscribe(() => this.setRegisteredToken(token));
      } else if (!token && registered) {
        /* Best effort: the row may belong to another user or be gone already. */
        this.api
          .unsubscribe(registered)
          .pipe(catchError(() => of(undefined)))
          .subscribe(() => this.setRegisteredToken(''));
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
    this.errorState.set('');
    this.busyState.set(true);

    const flow = Capacitor.isNativePlatform() ? this.enableNative() : this.enableWeb();

    return flow.pipe(
      tap(() => this.setOptedIn(true)),
      catchError((error: unknown) => {
        this.errorState.set(error instanceof Error ? error.message : String(error));
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

    if (
      !view ||
      !this.config?.vapidKey ||
      !('Notification' in view) ||
      !('serviceWorker' in view.navigator) ||
      !('PushManager' in view)
    ) {
      this.permissionState.set('unsupported');
      return;
    }

    this.permissionState.set(view.Notification.permission);

    if (this.optedIn() && view.Notification.permission === 'granted') {
      /* Offline at boot is not an error state; the next toggle attempt surfaces real failures. */
      this.connectWeb()
        .pipe(catchError(() => EMPTY))
        .subscribe();
    }
  }

  private initNative(): void {
    /* Listeners attach first so a registration fired by the boot reconnect is never missed. */
    void PushNotifications.addListener('registration', ({ value }) => {
      this.tokenState.set(value);
      this.enabledState.set(true);
    });
    void PushNotifications.addListener('registrationError', ({ error }) => {
      this.errorState.set(error);
      this.enabledState.set(false);
    });
    void PushNotifications.addListener('pushNotificationReceived', (notification) => {
      this.messageState.set(toNativeMessage(notification));
    });

    defer(() => PushNotifications.checkPermissions()).subscribe(({ receive }) => {
      this.permissionState.set(toPushPermission(receive));
      if (this.optedIn() && receive === 'granted') {
        void PushNotifications.register();
      }
    });
  }

  private enableWeb(): Observable<void> {
    const view = this.document.defaultView;
    if (!view) {
      return EMPTY;
    }

    /* Permission runs before the firebase import: Safari drops transient activation on async hops. */
    return defer(() => view.Notification.requestPermission()).pipe(
      switchMap((permission) => {
        this.permissionState.set(permission);
        return permission === 'granted' ? this.connectWeb() : EMPTY;
      }),
    );
  }

  private enableNative(): Observable<void> {
    return defer(() => PushNotifications.requestPermissions()).pipe(
      switchMap(({ receive }) => {
        this.permissionState.set(toPushPermission(receive));
        if (receive !== 'granted') {
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
