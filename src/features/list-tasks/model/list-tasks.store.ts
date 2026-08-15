import { Injectable, computed, inject, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { SystemStats, SystemStatsApi } from '@entities/system-stats';
import { Task, TaskApi } from '@entities/task';
import { mapApiError } from '@shared/api/api-error';

interface DashboardSnapshot {
  readonly tasks: readonly Task[];
  readonly stats: SystemStats;
}

@Injectable()
export class ListTasksStore {
  private readonly taskApi = inject(TaskApi);
  private readonly statsApi = inject(SystemStatsApi);

  private readonly snapshot = rxResource({
    stream: () => forkJoin({ tasks: this.taskApi.list(), stats: this.statsApi.get() }),
  });

  /* Keep the last good snapshot when a reload fails. */
  private readonly current = linkedSignal<DashboardSnapshot | undefined, DashboardSnapshot | undefined>({
    source: () => (this.snapshot.hasValue() ? this.snapshot.value() : undefined),
    computation: (value, previous) => value ?? previous?.value,
  });

  readonly tasks = computed(() => this.current()?.tasks ?? []);
  readonly stats = computed(() => this.current()?.stats);
  readonly loading = this.snapshot.isLoading;
  readonly hasLoaded = computed(() => this.current() !== undefined);

  readonly error = computed(() => {
    const error = this.snapshot.error();
    return error ? mapApiError(error).message : undefined;
  });

  load(): void {
    this.snapshot.reload();
  }
}
