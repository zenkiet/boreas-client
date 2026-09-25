import { DOCUMENT } from '@angular/common';
import { InjectionToken, Service, Type, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/modal-controller';
import { Observable, defer, filter, from, map, switchMap } from 'rxjs';

import { WIDE_QUERY } from '../breakpoint/wide-screen';

export const SHEET_DONE = 'done';

/** iPad dialog loaders: a page may not import another page, so `app` provides them. */
export const NEW_PROJECT_DIALOG = new InjectionToken<() => Promise<Type<unknown>>>(
  'NEW_PROJECT_DIALOG',
);
export const NEW_TASK_DIALOG = new InjectionToken<() => Promise<Type<unknown>>>('NEW_TASK_DIALOG');

@Service()
export class SheetService {
  private readonly modals = inject(ModalController);
  private readonly window = inject(DOCUMENT).defaultView;

  /**
   * Emits only a `SHEET_DONE` dismissal; a swipe or backdrop tap completes empty. A `detent` above
   * 1 is the content's height in px: a screen share sized on one phone clips on the next.
   */
  open<T>(
    component: Type<unknown>,
    label: string,
    props: Record<string, unknown> = {},
    detent = 0.6,
  ): Observable<T> {
    const wide = this.window?.matchMedia(WIDE_QUERY).matches;
    const share = detent > 1 ? Math.min(1, detent / (this.window?.innerHeight || detent)) : detent;

    return defer(() =>
      this.modals.create({
        component,
        componentProps: props,
        htmlAttributes: { 'aria-label': label },
        ...(wide
          ? { cssClass: 'app-sheet app-dialog' }
          : {
              breakpoints: share < 1 ? [0, share, 1] : [0, 1],
              initialBreakpoint: share,
              cssClass: 'app-sheet',
              /* Keeps a sheet's footer (its primary action) on screen at every detent. */
              expandToScroll: false,
            }),
      }),
    ).pipe(
      switchMap((modal) => from(modal.present().then(() => modal.onWillDismiss<T>()))),
      filter((result) => result.role === SHEET_DONE),
      map((result) => result.data as T),
    );
  }
}
