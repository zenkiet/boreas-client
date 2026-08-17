import { Injectable, computed, inject, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';

import { Project, ProjectApi } from '@entities/project';
import { SystemStats, SystemStatsApi } from '@entities/system-stats';
import { Task, TaskApi } from '@entities/task';
import { mapApiError } from '@shared/api/api-error';
import { AuthTokenStore } from '@shared/api/auth-token.store';

export interface ProjectSummary {
  readonly project: Project;
  readonly tasks: readonly Task[];
}

interface OverviewSnapshot {
  readonly summaries: readonly ProjectSummary[];
  readonly stats: SystemStats;
}

/* Matches the /stats poll interval; an ops console must not show a fleet older than this. */
const STALE_AFTER_MS = 30_000;

/** Fleet overview for Home and Search; root-provided so its `2 + N` fan-out survives route changes. */
@Injectable({ providedIn: 'root' })
export class ListProjectsStore {
  private readonly projectApi = inject(ProjectApi);
  private readonly taskApi = inject(TaskApi);
  private readonly statsApi = inject(SystemStatsApi);
  private readonly tokens = inject(AuthTokenStore);

  private loadedAt = 0;

  /* The API has no cross-project task view, so the overview fans out one list per project. */
  private readonly snapshot = rxResource({
    /* Keyed by token: idle until sign-in, refetched for whoever signs in next. */
    params: () => this.tokens.token() || undefined,
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
        tap(() => (this.loadedAt = Date.now())),
      ),
  });

  /* Keep the last good snapshot across reloads and routes, but never across tokens. */
  private readonly current = linkedSignal<
    { readonly token: string; readonly value: OverviewSnapshot | undefined },
    OverviewSnapshot | undefined
  >({
    source: () => ({
      token: this.tokens.token(),
      value: this.snapshot.hasValue() ? this.snapshot.value() : undefined,
    }),
    computation: (source, previous) =>
      source.value ??
      (previous && previous.source.token === source.token ? previous.value : undefined),
  });

  readonly summaries = computed(() => this.current()?.summaries ?? []);
  readonly stats = computed(() => this.current()?.stats);
  readonly loading = this.snapshot.isLoading;
  readonly hasLoaded = computed(() => this.current() !== undefined);

  readonly error = computed(() => {
    const error = this.snapshot.error();
    return error ? mapApiError(error).message : undefined;
  });

  /** Pages call this on entry: serves the cache, refetching only once it is stale. */
  ensureFresh(): void {
    if (this.snapshot.isLoading() || Date.now() - this.loadedAt < STALE_AFTER_MS) {
      return;
    }

    this.snapshot.reload();
  }

  /** Marks the cache stale without spending a request; the next entry refetches. */
  invalidate(): void {
    this.loadedAt = 0;
  }

  load(): void {
    this.snapshot.reload();
  }
}
