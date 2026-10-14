import { DOCUMENT } from '@angular/common';
import { Service, computed, inject, signal } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import {
  type AvailableResult,
  type BiometricOptions,
  BiometryType,
  NativeBiometric,
} from '@capgo/capacitor-native-biometric';
import { Observable, catchError, defer, finalize, map, of, switchMap, tap } from 'rxjs';

const STORAGE_KEY = 'boreas-lock';
const IOS = Capacitor.getPlatform() === 'ios';

const NAMES: Partial<Record<BiometryType, string>> = {
  [BiometryType.TOUCH_ID]: 'Touch ID',
  [BiometryType.FACE_ID]: 'Face ID',
  [BiometryType.FINGERPRINT]: 'Fingerprint',
  [BiometryType.FACE_AUTHENTICATION]: 'Face Unlock',
};

const PROMPT: BiometricOptions = {
  reason: 'Unlock Boreas',
  title: 'Unlock Boreas',
  useFallback: true,
  maxAttempts: 5,
  allowedBiometryTypes: [BiometryType.MULTIPLE, BiometryType.DEVICE_CREDENTIAL],
};

@Service()
export class AppLockStore {
  private readonly document = inject(DOCUMENT);
  private readonly enabledState = signal(this.read());
  private readonly lockedState = signal(Capacitor.isNativePlatform() && this.enabledState());
  private readonly supportState = signal<AvailableResult | undefined>(undefined);
  private busy = false;
  private away = false;

  readonly enabled = this.enabledState.asReadonly();
  readonly locked = this.lockedState.asReadonly();
  readonly support = this.supportState.asReadonly();
  readonly name = computed(() => {
    const support = this.supportState();
    if (support?.isAvailable) return NAMES[support.biometryType] ?? 'Biometrics';
    return IOS ? 'Passcode' : 'Screen Lock';
  });

  constructor() {
    if (!Capacitor.isNativePlatform()) return;
    /* The prompt makes iOS inactive and is an Activity on Android: only pause/stop is leaving. */
    if (IOS) void App.addListener('pause', () => this.leave());
    void App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) this.back();
      else if (!IOS) this.leave();
    });
    if (this.lockedState()) this.unlock();
    else this.refresh();
  }

  unlock(): void {
    this.verify().subscribe((passed) => passed !== false && this.lockedState.set(false));
  }

  setEnabled(on: boolean): Observable<unknown> {
    return this.verify().pipe(tap((passed) => passed && this.save(on)));
  }

  private leave(): void {
    this.away = true;
    if (this.enabledState() && !this.busy) this.lockedState.set(true);
  }

  private back(): void {
    if (this.away && this.lockedState()) this.unlock();
    else if (!this.busy) this.refresh();
    this.away = false;
  }

  private refresh(): void {
    defer(() => NativeBiometric.isAvailable())
      .pipe(catchError(() => of(undefined)))
      .subscribe((support) => support && this.adopt(support));
  }

  /* No passcode, no lock: removing it took the passcode itself. */
  private adopt(support: AvailableResult): void {
    this.supportState.set(support);
    if (!support.deviceIsSecure) this.save(false);
  }

  private verify(): Observable<boolean | null> {
    return defer(() => {
      if (this.busy) return of(false);
      this.busy = true;
      return defer(() => NativeBiometric.isAvailable()).pipe(
        tap((support) => this.adopt(support)),
        switchMap(({ deviceIsSecure }) =>
          deviceIsSecure
            ? defer(() => NativeBiometric.verifyIdentity(PROMPT)).pipe(map(() => true))
            : of(null),
        ),
        catchError(() => of(false)),
        finalize(() => (this.busy = false)),
      );
    });
  }

  private save(on: boolean): void {
    this.enabledState.set(on);
    try {
      const storage = this.document.defaultView?.localStorage;
      if (on) storage?.setItem(STORAGE_KEY, '1');
      else storage?.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
  }

  private read(): boolean {
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }
}
