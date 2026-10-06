import {
  ApplicationConfig,
  ErrorHandler,
  computed,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/provide';
import {
  iosTransitionAnimation,
  popoverEnterAnimation,
  popoverLeaveAnimation,
} from '@rdlabo/ionic-theme-ios27';

import { SessionStore } from '@features/auth';
import { provideAppHttpClient } from '@shared/api/http';
import { IS_ADMIN } from '@shared/api/role';
import { providePushNotifications } from '@shared/lib/push';
import { ThemeStore } from '@shared/lib/theme/theme.store';
import { NEW_PROJECT_DIALOG, NEW_TASK_DIALOG } from '@shared/ui/sheet/sheet.service';
import { provideAndroidBackButton } from './android-back-button';
import { routes } from './app.routes';
import { provideDynamicType } from './dynamic-type';
import { AppErrorHandler } from './error-handler';
import { provideNavigationFailureToast, withNavigationFailures } from './navigation-error';
import { provideSplash } from './splash';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: AppErrorHandler },
    provideAppHttpClient(),
    provideAndroidBackButton(),
    provideDynamicType(),
    provideSplash(),
    provideNavigationFailureToast(),
    provideAppInitializer(() => void inject(ThemeStore)),
    providePushNotifications({
      apiKey: 'AIzaSyCRR2ROcaF0iIqEopsQ8ifeGZFylse_Lrc',
      authDomain: 'zen-boreas.firebaseapp.com',
      projectId: 'zen-boreas',
      storageBucket: 'zen-boreas.firebasestorage.app',
      messagingSenderId: '407388055368',
      appId: '1:407388055368:web:662aa7e373bd8d57d6357d',
      vapidKey:
        'BNxruyU5YFKqLZKtgOLcozHpF7Y9eNiaY-ajytpZv3wYBu-Y4p7zIHiZ5fvK65dhNyoi9vhC-7yCDM73kQDzLmY',
    }),
    {
      provide: NEW_PROJECT_DIALOG,
      useValue: () =>
        import('@pages/project-create/project-create-page').then((m) => m.ProjectCreatePage),
    },
    {
      provide: NEW_TASK_DIALOG,
      useValue: () => import('@pages/task-create/task-create-page').then((m) => m.TaskCreatePage),
    },
    {
      provide: IS_ADMIN,
      useFactory: () => {
        const session = inject(SessionStore);
        return computed(() => {
          const user = session.user();
          return user && user.role === 'admin';
        });
      },
    },
    provideRouter(routes, withComponentInputBinding(), withNavigationFailures()),
    provideIonicAngular({
      mode: 'ios',
      useSetInputAPI: true,
      backButtonText: '',
      navAnimation: iosTransitionAnimation,
      popoverEnter: popoverEnterAnimation,
      popoverLeave: popoverLeaveAnimation,
    }),
  ],
};
