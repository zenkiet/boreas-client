import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, combineLatest, interval, of, scan, switchMap } from 'rxjs';

import { ProjectApi } from '@entities/project';
import { EMPTY_WINDOW, NO_SAMPLES, advance, holdSample } from '@entities/system-stats';
import { createLogger } from '@shared/lib/logging/logger';
import { onScreen } from '@shared/lib/on-screen/on-screen';
import { TICK_MS, metricsFeed } from './metrics-feed';

export interface UsageTarget {
  readonly slug: string;
  readonly task: string;
}

@Injectable()
export class TaskUsageStore {
  private readonly logger = createLogger('task-usage');
  private readonly api = inject(ProjectApi);
  private readonly screen = onScreen();
  private readonly target = signal<UsageTarget | undefined>(undefined, { equal: sameTarget });

  private readonly held = toSignal(
    combineLatest([this.screen, toObservable(this.target)]).pipe(
      switchMap(([on, target]) =>
        on && target
          ? metricsFeed(
              this.api.taskMetricsStream(target.slug, target.task),
              target.slug,
              this.logger,
            ).pipe(scan(holdSample, NO_SAMPLES))
          : of(NO_SAMPLES),
      ),
    ),
    { initialValue: NO_SAMPLES },
  );

  private readonly window = toSignal(
    this.screen.pipe(
      switchMap((on) => (on ? interval(TICK_MS) : EMPTY)),
      scan((window) => advance(window, this.held(), Date.now()), EMPTY_WINDOW),
    ),
    { initialValue: EMPTY_WINDOW },
  );

  readonly points = computed(() => {
    const target = this.target();
    return target ? (this.window().projects.get(target.slug) ?? []) : [];
  });

  /** Call from the page constructor: the effect must die with the page. */
  watch(target: Signal<UsageTarget | undefined>): void {
    effect(() => this.target.set(target()));
  }
}

function sameTarget(a: UsageTarget | undefined, b: UsageTarget | undefined): boolean {
  return a?.slug === b?.slug && a?.task === b?.task;
}
