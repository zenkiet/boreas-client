import { DOCUMENT } from '@angular/common';
import { Service, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';

import { Notification, NotificationApi } from '@entities/notification';
import { ProjectApi } from '@entities/project';
import { mapApiError } from '@shared/api/api-error';
import { AuthTokenStore } from '@shared/api/auth-token.store';

/** A notification tagged with its project; the API payload has no project field. */
export interface ProjectAlert extends Notification {
  readonly project: string;
}

interface AlertsSnapshot {
  readonly projects: readonly string[];
  readonly alerts: readonly ProjectAlert[];
}

const STALE_AFTER_MS = 30_000;
const SEEN_KEY = 'boreas-alerts-seen';

@Service()
export class ListAlertsStore {
  private readonly projectApi = inject(ProjectApi);
  private readonly notificationApi = inject(NotificationApi);
  private readonly tokens = inject(AuthTokenStore);
  private readonly document = inject(DOCUMENT);

  private loadedAt = 0;
  private readonly seenState = signal(this.readSeen());

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
  private readonly current = linkedSignal<
    { readonly token: string; readonly value: AlertsSnapshot | undefined },
    AlertsSnapshot | undefined
  >({
    source: () => ({
      token: this.tokens.token(),
      value: this.snapshot.hasValue() ? this.snapshot.value() : undefined,
    }),
    computation: (source, previous) =>
      source.value ??
      (previous && previous.source.token === source.token ? previous.value : undefined),
  });

  readonly alerts = computed(() => this.current()?.alerts ?? []);
  readonly projects = computed(() => this.current()?.projects ?? []);
  readonly loading = this.snapshot.isLoading;
  readonly hasLoaded = computed(() => this.current() !== undefined);

  readonly error = computed(() => {
    const error = this.snapshot.error();
    return error ? mapApiError(error).message : undefined;
  });

  /** Millisecond timestamp of the last Alerts visit; rows newer than it are unseen. */
  readonly lastSeen = this.seenState.asReadonly();

  readonly unseenCount = computed(
    () => this.alerts().filter((alert) => alert.createdAt.getTime() > this.seenState()).length,
  );

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

  /** Clears the dock badge; callers snapshot lastSeen first to keep row dots for the visit. */
  markSeen(): void {
    const now = Date.now();
    this.seenState.set(now);
    try {
      this.document.defaultView?.localStorage.setItem(SEEN_KEY, String(now));
    } catch {
      return;
    }
  }

  private readSeen(): number {
    try {
      return Number(this.document.defaultView?.localStorage.getItem(SEEN_KEY)) || 0;
    } catch {
      return 0;
    }
  }
}
