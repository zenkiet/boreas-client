import { DOCUMENT, Location } from '@angular/common';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { ActivationStart, Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { TUI_DIALOGS_CLOSE } from '@taiga-ui/core';
import { Subject, filter, merge } from 'rxjs';

// Taiga exposes dialog and sheet dismissal only through TUI_DIALOGS_CLOSE.
const backRequested$ = new Subject<void>();

export function provideAndroidBackButton(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: TUI_DIALOGS_CLOSE,
      useFactory: () =>
        merge(
          // Preserve Taiga's default navigation dismissal when overriding the token.
          inject(Router).events.pipe(filter((event) => event instanceof ActivationStart)),
          backRequested$,
        ),
    },
    provideAppInitializer(() => {
      if (Capacitor.getPlatform() !== 'android') {
        return;
      }

      const location = inject(Location);
      const document = inject(DOCUMENT);

      void App.addListener('backButton', ({ canGoBack }) => {
        if (document.querySelector('tui-dialog, tui-sheet-dialog')) {
          backRequested$.next();
          return;
        }

        // These overlays accept synthetic Escape events, unlike CloseWatcher-based dialogs.
        if (document.querySelector('tui-dropdown, tui-bottom-sheet')) {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          return;
        }

        if (canGoBack) {
          location.back();
          return;
        }

        void App.exitApp();
      });
    }),
  ]);
}
