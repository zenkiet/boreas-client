import { Service, inject, signal } from '@angular/core';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, auditTime, catchError, filter, share, switchMap } from 'rxjs';

import { TaskApi } from '@entities/task/api';
import type { FleetProject } from '@entities/task/model';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { listView } from '@shared/api/resource-cache';
import { reconnect } from '@shared/api/sse';

export type ProjectSummary = FleetProject;

@Service()
export class ListProjectsStore {
  private readonly taskApi = inject(TaskApi);
  private readonly tokens = inject(AuthTokenStore);

  /* A new param cancels a fetch in flight and starts over, where reload() would be dropped. */
  private readonly rev = signal(0);

  private readonly snapshot = rxResource({
    /* Keyed by token: idle until sign-in, refetched for whoever signs in next. */
    params: () => {
      const token = this.tokens.token();
      return token ? { token, rev: this.rev() } : undefined;
    },
    stream: () => this.taskApi.fleet(),
  });

  /* Keep the last good fleet across reloads and routes, but never across tokens. */
  private readonly fleet = listView<FleetProject>(this.snapshot, () => this.tokens.token());

  readonly summaries = this.fleet.items;
  readonly loading = this.fleet.loading;
  readonly hasLoaded = this.fleet.hasLoaded;
  readonly error = this.fleet.error;
  /** Fires after any change in Boreas, at most every 300 ms; one stream serves every listener. */
  readonly changes = toObservable(this.tokens.token).pipe(
    switchMap((token) =>
      token
        ? this.taskApi.changes().pipe(
            reconnect(),
            catchError(() => EMPTY),
          )
        : EMPTY,
    ),
    filter(Boolean),
    auditTime(300),
    share(),
  );

  load(): void {
    this.rev.update((rev) => rev + 1);
  }
}
