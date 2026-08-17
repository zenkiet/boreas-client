import { DOCUMENT } from '@angular/common';
import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { WA_IS_MOBILE } from '@ng-web-apis/platform';
import { TUI_PLATFORM } from '@taiga-ui/cdk';
import { provideTaiga } from '@taiga-ui/core';

import { provideAppHttpClient } from '@shared/api/http';
import { provideAndroidBackButton } from './android-back-button';
import { routes } from './app.routes';

const MOBILE_QUERY = '(max-width: 768px)';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppHttpClient(),
    provideAndroidBackButton(),
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
