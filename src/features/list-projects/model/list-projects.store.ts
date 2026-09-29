import { Service, effect, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

import { TaskApi } from '@entities/task/api';
import type { FleetProject } from '@entities/task/model';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { listView } from '@shared/api/resource-cache';
import { PushStore } from '@shared/lib/push';

export type ProjectSummary = FleetProject;

/* An ops console must not show a fleet older than this. */
const STALE_AFTER_MS = 30_000;

@Service()
export class ListProjectsStore {
  private readonly taskApi = inject(TaskApi);
  private readonly tokens = inject(AuthTokenStore);
  private readonly push = inject(PushStore);

  private loadedAt = 0;

  private readonly snapshot = rxResource({
    /* Keyed by token: idle until sign-in, refetched for whoever signs in next. */
    params: () => this.tokens.token() || undefined,
    stream: () => this.taskApi.fleet().pipe(tap(() => (this.loadedAt = Date.now()))),
  });

  /* Keep the last good fleet across reloads and routes, but never across tokens. */
  private readonly fleet = listView<FleetProject>(this.snapshot, () => this.tokens.token());

  readonly summaries = this.fleet.items;
  readonly loading = this.fleet.loading;
  readonly hasLoaded = this.fleet.hasLoaded;
  readonly error = this.fleet.error;

  constructor() {
    /* A deploy push moves "Last deploy", which the fleet now carries. */
    effect(() => {
      if (this.push.message()) {
        this.load();
      }
    });
  }

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
