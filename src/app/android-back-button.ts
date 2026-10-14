import { EnvironmentProviders, Injector, inject, provideAppInitializer } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { NavController } from '@ionic/angular/nav-controller';
import { Platform } from '@ionic/angular/platform';

import { AppLockStore } from '@shared/lib/app-lock/app-lock.store';

/* Capacitor forwards the key to Ionic only while a JS listener exists, hence the no-op one. */
export function provideAndroidBackButton(): EnvironmentProviders {
  return provideAppInitializer(() => {
    if (Capacitor.getPlatform() !== 'android') return;

    const nav = inject(NavController);
    const lock = inject(AppLockStore);
    const injector = inject(Injector);
    const back = inject(Platform).backButton;
    void App.addListener('backButton', () => undefined);
    /* Above Ionic's overlays (100): a locked, hidden app leaves instead of changing unseen. */
    back.subscribeWithPriority(101, (next) => (lock.locked() ? void App.minimizeApp() : next()));
    back.subscribeWithPriority(1, () =>
      nav.pop().then((popped) => popped || confirmExit(injector)),
    );
  });
}

/* Lazy, so the alert stays out of the initial bundle. */
function confirmExit(injector: Injector): void {
  void import('@shared/ui/confirm-action/confirm-action').then(({ ConfirmActionService }) =>
    injector
      .get(ConfirmActionService)
      .confirm({
        title: 'Exit Boreas?',
        message: 'Live updates stop until you open it again.',
        confirmLabel: 'Exit',
      })
      .subscribe((exit) => exit && void App.exitApp()),
  );
}
