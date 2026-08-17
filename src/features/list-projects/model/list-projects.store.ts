import { Injectable, computed, inject, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { Project, ProjectApi } from '@entities/project';
import { SystemStats, SystemStatsApi } from '@entities/system-stats';
import { Task, TaskApi } from '@entities/task';
import { mapApiError } from '@shared/api/api-error';

export interface ProjectSummary {
  readonly project: Project;
  readonly tasks: readonly Task[];
}

interface OverviewSnapshot {
  readonly summaries: readonly ProjectSummary[];
  readonly stats: SystemStats;
}

@Injectable()
export class ListProjectsStore {
  private readonly projectApi = inject(ProjectApi);
  private readonly taskApi = inject(TaskApi);
  private readonly statsApi = inject(SystemStatsApi);

  /* The API has no cross-project task view, so the overview fans out one list per project. */
  private readonly snapshot = rxResource({
    stream: () =>
      forkJoin({ projects: this.projectApi.list(), stats: this.statsApi.get() }).pipe(
        switchMap(({ projects, stats }) =>
          projects.length === 0
            ? of<OverviewSnapshot>({ summaries: [], stats })
            : forkJoin(
                projects.map((project) =>
                  this.taskApi.list(project.slug).pipe(
                    /* One broken project must not blank the whole overview. */
                    catchError(() => of<readonly Task[]>([])),
                    map((tasks) => ({ project, tasks })),
                  ),
                ),
              ).pipe(map((summaries) => ({ summaries, stats }))),
        ),
      ),
  });

  /* Keep the last good snapshot when a reload fails. */
  private readonly current = linkedSignal<OverviewSnapshot | undefined, OverviewSnapshot | undefined>({
    source: () => (this.snapshot.hasValue() ? this.snapshot.value() : undefined),
    computation: (value, previous) => value ?? previous?.value,
  });

  readonly summaries = computed(() => this.current()?.summaries ?? []);
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
