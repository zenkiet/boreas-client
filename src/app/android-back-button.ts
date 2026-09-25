import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { NavController } from '@ionic/angular/nav-controller';
import { Platform } from '@ionic/angular/platform';

/* Capacitor forwards the key to Ionic only while a JS listener exists, hence the no-op one. */
export function provideAndroidBackButton(): EnvironmentProviders {
  return provideAppInitializer(() => {
    if (Capacitor.getPlatform() !== 'android') return;

    const nav = inject(NavController);
    void App.addListener('backButton', () => undefined);
    inject(Platform).backButton.subscribeWithPriority(1, () =>
      nav.pop().then((popped) => (popped ? undefined : App.exitApp())),
    );
  });
}
