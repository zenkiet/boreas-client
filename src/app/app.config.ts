import { DOCUMENT } from '@angular/common';
import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { WA_IS_MOBILE } from '@ng-web-apis/platform';
import { TUI_PLATFORM } from '@taiga-ui/cdk';
import { provideTaiga } from '@taiga-ui/core';

import { provideAppHttpClient } from '@shared/api/http';
import { provideAndroidBackButton } from './android-back-button';
import { routes } from './app.routes';

// Keep platform selection aligned with the shell's mobile breakpoint.
const MOBILE_QUERY = '(max-width: 47.9375rem)';

function routeDepth(snapshot: ActivatedRouteSnapshot): number {
  let depth = 0;
  let current: ActivatedRouteSnapshot | null = snapshot;

  while (current) {
    depth += current.url.length;
    current = current.firstChild;
  }

  return depth;
}

function routePath(snapshot: ActivatedRouteSnapshot): string {
  let path = '';
  let current: ActivatedRouteSnapshot | null = snapshot;

  while (current) {
    path += `/${current.url.map((segment) => segment.path).join('/')}`;
    current = current.firstChild;
  }

  return path;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppHttpClient(),
    provideAndroidBackButton(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition, from, to }) => {
          // The welcome flow animates its own same-route step changes.
          if (routePath(from) === routePath(to)) {
            transition.skipTransition();
            return;
          }

          const document = inject(DOCUMENT);
          const html = document.documentElement;
          const delta = routeDepth(to) - routeDepth(from);
          html.dataset['nav'] = delta > 0 ? 'push' : delta < 0 ? 'pop' : 'fade';
          void transition.finished.finally(() => delete html.dataset['nav']);

          // Frozen animation frames can leave the view-transition overlay dimming the app indefinitely.
          if (document.hidden) {
            transition.skipTransition();
            return;
          }

          const watchdog = document.defaultView?.setTimeout(
            () => transition.skipTransition(),
            1000,
          );
          void transition.finished.finally(() => document.defaultView?.clearTimeout(watchdog));
        },
      }),
    ),
    // Liquid Glass also requires taiga-ui-mobile.less and the iOS platform selection below.
    provideTaiga({ apis: { liquidGlass: true } }),
    // Taiga snapshots this startup-only iOS skin for touch or narrow viewports.
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
