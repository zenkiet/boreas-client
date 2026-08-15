import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap, timer } from 'rxjs';

import { SystemStatsApi } from '@entities/system-stats';

export interface StatsSample {
  readonly at: number;
  readonly running: number;
}

const SAMPLE_INTERVAL_MS = 30_000;
const MAX_SAMPLES = 121;

/* The backend has no history endpoint; root scope preserves session samples across routes. */
@Injectable({ providedIn: 'root' })
export class StatsHistoryStore {
  private readonly api = inject(SystemStatsApi);
  private readonly buffer = signal<readonly StatsSample[]>([]);

  readonly samples = this.buffer.asReadonly();

  constructor() {
    /* Skip failed samples; the fixed interval supplies the next attempt. */
    timer(0, SAMPLE_INTERVAL_MS)
      .pipe(
        switchMap(() => this.api.get().pipe(catchError(() => EMPTY))),
        takeUntilDestroyed(),
      )
      .subscribe((stats) => {
        this.buffer.update((samples) =>
          [...samples, { at: Date.now(), running: stats.runningTasks }].slice(-MAX_SAMPLES),
        );
      });
  }
}
