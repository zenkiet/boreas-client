import { DOCUMENT } from '@angular/common';
import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { WA_IS_MOBILE } from '@ng-web-apis/platform';
import { TUI_PLATFORM } from '@taiga-ui/cdk';
import { provideTaiga } from '@taiga-ui/core';

import { provideAppHttpClient } from '@shared/api/http';
import { providePushNotifications } from '@shared/lib/push';
import { provideAndroidBackButton } from './android-back-button';
import { routes } from './app.routes';

const MOBILE_QUERY = '(max-width: 768px)';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppHttpClient(),
    provideAndroidBackButton(),
    providePushNotifications({
      apiKey: 'AIzaSyCRR2ROcaF0iIqEopsQ8ifeGZFylse_Lrc',
      authDomain: 'zen-boreas.firebaseapp.com',
      projectId: 'zen-boreas',
      storageBucket: 'zen-boreas.firebasestorage.app',
      messagingSenderId: '407388055368',
      appId: '1:407388055368:web:662aa7e373bd8d57d6357d',
      vapidKey: 'BNxruyU5YFKqLZKtgOLcozHpF7Y9eNiaY-ajytpZv3wYBu-Y4p7zIHiZ5fvK65dhNyoi9vhC-7yCDM73kQDzLmY',
    }),
    provideRouter(routes, withComponentInputBinding()),
    provideTaiga({ apis: { liquidGlass: true } }),
    {
      provide: TUI_PLATFORM,
      useFactory: (): 'ios' | 'web' => {
        const view = inject(DOCUMENT).defaultView;
        const narrow = view?.matchMedia(MOBILE_QUERY).matches ?? false;

        return inject(WA_IS_MOBILE) || narrow ? 'ios' : 'web';
      },
    },
  ],
};
