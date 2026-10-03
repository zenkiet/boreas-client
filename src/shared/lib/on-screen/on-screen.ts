import { DOCUMENT } from '@angular/common';
import { ElementRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Observable,
  combineLatest,
  distinctUntilChanged,
  fromEvent,
  map,
  merge,
  startWith,
  switchMap,
} from 'rxjs';

/* Apart from pull-to-refresh, so the app shell can use it without loading Ionic's refresher. */

/** An Observable, not a signal: a covered Ionic page's effects stay frozen until it is on top. */
export function onScreen(): Observable<boolean> {
  const host: HTMLElement = inject(ElementRef).nativeElement;
  const document = inject(DOCUMENT);
  const entered = merge(
    fromEvent(host, 'ionViewWillEnter').pipe(map(() => true)),
    fromEvent(host, 'ionViewDidLeave').pipe(map(() => false)),
  ).pipe(startWith(true));
  /* Starts visible: some environments load hidden and never fire visibilitychange. */
  const visible = fromEvent(document, 'visibilitychange').pipe(
    map(() => !document.hidden),
    startWith(true),
  );

  return combineLatest([entered, visible]).pipe(
    map(([top, shown]) => top && shown),
    distinctUntilChanged(),
  );
}

/** Calls `tick` on each `source` value while this page is on screen; call from its constructor. */
export function whileOnScreen(source: Observable<unknown>, tick: () => void): void {
  onScreen()
    .pipe(
      switchMap((on) => (on ? source : EMPTY)),
      takeUntilDestroyed(),
    )
    .subscribe(() => tick());
}
