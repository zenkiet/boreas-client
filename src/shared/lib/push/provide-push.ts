import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { FCM_CONFIG, FcmConfig, PushStore } from './model/push.store';

export function providePushNotifications(config: FcmConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: FCM_CONFIG, useValue: config },
    provideAppInitializer(() => inject(PushStore).init()),
  ]);
}
