import { DOCUMENT } from '@angular/common';
import { Injector, inject, provideAppInitializer } from '@angular/core';
import {
  NavigationEnd,
  NavigationError,
  Router,
  withNavigationErrorHandler,
} from '@angular/router';
import { defer, first, shareReplay, switchMap } from 'rxjs';

/* Chrome, Safari and Firefox word a failed lazy chunk three ways. */
const CHUNK_FAILED =
  /dynamically imported module|importing a module script failed|error loading dynamically/i;

/* Lazy keeps ion-toast out of main; shared so the preloaded chunk still toasts offline. */
const notifier = defer(() => import('@shared/ui/notify/notify')).pipe(shareReplay(1));

/** A lazy chunk failing online means a new deploy: reload at the target. Otherwise, toast. */
export function withNavigationFailures() {
  return withNavigationErrorHandler((failure: NavigationError) => {
    const view = inject(DOCUMENT).defaultView;
    const injector = inject(Injector);
    const chunk = CHUNK_FAILED.test(String(failure.error));

    /* Not on the first navigation: that document is already fresh, and reloading it could loop. */
    if (chunk && view?.navigator.onLine && inject(Router).navigated) {
      view.location.assign(failure.url);
      return;
    }

    notifier.subscribe({
      next: ({ NotifyService }) =>
        injector
          .get(NotifyService)
          .failure(
            chunk
              ? 'Could not open that screen. Check your connection and try again.'
              : 'Could not open that screen.',
          ),
      error: () => undefined,
    });
  });
}

/** Loads the toast once the first screen is up, so an offline failure can still say so. */
export function provideNavigationFailureToast() {
  return provideAppInitializer(() => {
    inject(Router)
      .events.pipe(
        first((event) => event instanceof NavigationEnd),
        switchMap(() => notifier),
      )
      .subscribe({ error: () => undefined });
  });
}
