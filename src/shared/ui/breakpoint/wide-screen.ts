import { DOCUMENT } from '@angular/common';
import { DestroyRef, Signal, inject, signal } from '@angular/core';

/** Every iPad-chrome CSS `@media` repeats this; 11" iPads upright and landscape phones stay out. */
export const WIDE_QUERY = '(min-width: 64rem) and (min-height: 31.25rem)';

export const DESKTOP_QUERY = '(min-width: 1280px)';

/** List beside detail: landscape iPads and desktop, not iPad portrait panes. */
export const TWO_PANE_QUERY = '(min-width: 68.75rem)';

/** Injection context only: the listener dies with the caller. */
export function mediaQuery(query: string): Signal<boolean> {
  const media = inject(DOCUMENT).defaultView?.matchMedia(query);
  const matches = signal(media?.matches ?? false);

  if (media) {
    const update = (event: MediaQueryListEvent) => matches.set(event.matches);
    media.addEventListener('change', update);
    inject(DestroyRef).onDestroy(() => media.removeEventListener('change', update));
  }

  return matches.asReadonly();
}

export function wideScreen(): Signal<boolean> {
  return mediaQuery(WIDE_QUERY);
}

export function desktopScreen(): Signal<boolean> {
  return mediaQuery(DESKTOP_QUERY);
}
