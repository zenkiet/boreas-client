import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, ElementRef, Signal, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonRefresher } from '@ionic/angular/ion-refresher';
import { IonRefresherContent } from '@ionic/angular/ion-refresher-content';
import {
  EMPTY,
  Observable,
  combineLatest,
  distinctUntilChanged,
  filter,
  fromEvent,
  interval,
  map,
  merge,
  startWith,
  switchMap,
} from 'rxjs';

export interface PullRefreshSource {
  readonly busy: Signal<boolean>;
  readonly trigger: () => void;
}

/** Completes the pull when `busy` falls, or at once when the trigger started nothing. */
@Directive({
  selector: 'ion-refresher[appRefresh]',
  host: { slot: 'fixed', '(ionRefresh)': 'start()' },
})
export class Refresh {
  private readonly el = inject<ElementRef<{ complete(): Promise<void> }>>(ElementRef).nativeElement;
  private pending = false;

  readonly source = input.required<PullRefreshSource>({ alias: 'appRefresh' });

  constructor() {
    effect(() => {
      if (!this.source().busy()) this.finish();
    });
  }

  protected start(): void {
    this.pending = true;
    this.source().trigger();
    if (!this.source().busy()) this.finish();
  }

  private finish(): void {
    if (!this.pending) return;
    this.pending = false;
    void this.el.complete();
  }
}

export const PULL_REFRESH = [IonRefresher, IonRefresherContent, Refresh] as const;

/** Runs `fn` each time this cached page returns to the top of the stack, never on first entry. */
export function onReturn(fn: () => void): void {
  const host: HTMLElement = inject(ElementRef).nativeElement;
  let entered = false;
  const listener = (): void => {
    if (entered) fn();
    entered = true;
  };

  host.addEventListener('ionViewWillEnter', listener);
  inject(DestroyRef).onDestroy(() => host.removeEventListener('ionViewWillEnter', listener));
}

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

/** Calls `tick` every `ms` while this page is on screen and `active()` holds; call from its constructor. */
export function pollOnScreen(active: () => boolean, tick: () => void, ms = 10_000): void {
  onScreen()
    .pipe(
      switchMap((on) => (on ? interval(ms) : EMPTY)),
      filter(active),
      takeUntilDestroyed(),
    )
    .subscribe(tick);
}
