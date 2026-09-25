import { DOCUMENT } from '@angular/common';
import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { NavigationEnd, NavigationError, Router } from '@angular/router';
import { catchError, filter, from, of, switchMap, take, tap, timer } from 'rxjs';

const FADE_MS = 300;

/** Waits for the first route and the wordmark, so a fast boot never cuts the intro short. */
export function provideSplash(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const splash = inject(DOCUMENT).getElementById('splash');
    if (!splash) return;
    const intro = () => {
      const playing = splash
        .querySelector('.word')
        ?.getAnimations()
        .find((animation) => animation.playState !== 'finished');
      return playing ? from(playing.finished).pipe(catchError(() => of(null))) : of(null);
    };
    inject(Router)
      .events.pipe(
        /* Not whenStable(): the SSE streams keep the app busy for good. */
        filter((event) => event instanceof NavigationEnd || event instanceof NavigationError),
        take(1),
        switchMap(intro),
        tap(() => splash.classList.add('splash-out')),
        switchMap(() => timer(FADE_MS)),
      )
      .subscribe(() => splash.remove());
  });
}
