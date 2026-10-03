import { DestroyRef, Directive, ElementRef, Signal, effect, inject, input } from '@angular/core';
import { IonRefresher } from '@ionic/angular/ion-refresher';
import { IonRefresherContent } from '@ionic/angular/ion-refresher-content';

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
