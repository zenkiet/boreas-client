import { Service, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';

import { Notification, NotificationApi } from '@entities/notification';
import { ProjectApi } from '@entities/project';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { keepLastValue, resourceError } from '@shared/api/resource-cache';
import { PushStore } from '@shared/lib/push';

/** A notification tagged with its project; the API payload has no project field. */
export interface ProjectAlert extends Notification {
  readonly project: string;
}

interface AlertsSnapshot {
  readonly projects: readonly string[];
  readonly alerts: readonly ProjectAlert[];
}

const STALE_AFTER_MS = 30_000;

@Service()
export class ListAlertsStore {
  private readonly projectApi = inject(ProjectApi);
  private readonly notificationApi = inject(NotificationApi);
  private readonly tokens = inject(AuthTokenStore);
  private readonly push = inject(PushStore);

  private loadedAt = 0;
  private readonly sessionSeenIds = signal<ReadonlySet<string>>(new Set());

  /* No cross-project endpoint, so the feed fans out one list per reachable project. */
  private readonly snapshot = rxResource({
    /* Keyed by token: idle until sign-in, refetched for whoever signs in next. */
    params: () => this.tokens.token() || undefined,
    stream: () =>
      this.projectApi.list().pipe(
        switchMap((projects) =>
          projects.length === 0
            ? of<AlertsSnapshot>({ projects: [], alerts: [] })
            : forkJoin(
                projects.map((project) =>
                  this.notificationApi.list(project.slug).pipe(
                    /* One broken project must not blank the whole feed. */
                    catchError(() => of<readonly Notification[]>([])),
                    map((alerts) => alerts.map((alert) => ({ ...alert, project: project.slug }))),
                  ),
                ),
              ).pipe(
                map((lists) => ({
                  projects: projects.map((project) => project.slug),
                  alerts: lists
                    .flat()
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
                })),
              ),
        ),
        tap(() => (this.loadedAt = Date.now())),
      ),
  });

  /* Keep the last good snapshot across reloads and routes, but never across tokens. */
  private readonly current = keepLastValue<AlertsSnapshot>(this.snapshot, () =>
    this.tokens.token(),
  );

  readonly alerts = computed(() => this.current()?.alerts ?? []);
  readonly projects = computed(() => this.current()?.projects ?? []);
  readonly loading = this.snapshot.isLoading;
  readonly hasLoaded = computed(() => this.current() !== undefined);
  readonly error = resourceError(this.snapshot);

  readonly unseenCount = computed(
    () =>
      this.alerts().filter((alert) => !alert.seen && !this.sessionSeenIds().has(alert.id)).length,
  );

  constructor() {
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

  load(): void {
    this.snapshot.reload();
  }

  /** No bulk endpoint yet, so one idempotent fire-and-forget POST per unseen row. */
  markSeen(): void {
    const posted = this.sessionSeenIds();
    const unseen = this.alerts().filter((alert) => !alert.seen && !posted.has(alert.id));
    if (unseen.length === 0) return;

    this.sessionSeenIds.set(new Set([...posted, ...unseen.map((alert) => alert.id)]));
    for (const alert of unseen) {
      this.notificationApi
        .markSeen(alert.project, alert.id)
        .pipe(catchError(() => EMPTY))
        .subscribe();
    }
  }
}
