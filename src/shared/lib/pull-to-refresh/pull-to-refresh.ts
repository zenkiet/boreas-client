import { DestroyRef, Service, Signal, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, Subject, filter, map, merge, pairwise } from 'rxjs';

export interface PullRefreshSource {
  readonly busy: Signal<boolean>;
  readonly trigger: () => void;
}

@Service()
export class PullToRefresh {
  private readonly sources = signal<readonly PullRefreshSource[]>([]);
  private readonly idlePull = new Subject<void>();

  private readonly busy = computed(() => this.sources().some((source) => source.busy()));

  readonly loaded$: Observable<void> = merge(
    toObservable(this.busy).pipe(
      pairwise(),
      filter(([was, is]) => was && !is),
      map(() => undefined),
    ),
    this.idlePull,
  );

  register(source: PullRefreshSource): () => void {
    this.sources.update((list) => [...list, source]);
    return () => {
      this.sources.update((list) => list.filter((entry) => entry !== source));
    };
  }

  refresh(): void {
    const sources = this.sources();
    if (sources.length === 0) {
      this.idlePull.next();
      return;
    }
    sources.forEach((source) => source.trigger());
  }
}

export function registerPullRefresh(source: PullRefreshSource): void {
  const unregister = inject(PullToRefresh).register(source);
  inject(DestroyRef).onDestroy(unregister);
}
