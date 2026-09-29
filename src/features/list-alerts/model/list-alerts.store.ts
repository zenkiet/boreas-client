import { Service, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, defer, finalize, map, tap } from 'rxjs';

import { Notification, NotificationApi } from '@entities/notification';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { listView } from '@shared/api/resource-cache';
import { PushStore } from '@shared/lib/push';

export type ProjectAlert = Notification;

/* A full page means more may follow; 100 keeps the badge's 99+ reachable from the first one. */
const PAGE = 100;
/* The seen endpoint's cap. */
const SEEN_BATCH = 200;
const STALE_AFTER_MS = 30_000;

interface Feed {
  readonly alerts: readonly Notification[];
  readonly more: boolean;
}

@Service()
export class ListAlertsStore {
  private readonly api = inject(NotificationApi);
  private readonly tokens = inject(AuthTokenStore);
  private readonly push = inject(PushStore);

  private loadedAt = 0;
  private readonly loadingMoreState = signal(false);

  private readonly newest = rxResource({
    /* Keyed by token: idle until sign-in, refetched for whoever signs in next. */
    params: () => this.tokens.token() || undefined,
    stream: () => this.api.list(PAGE).pipe(tap(() => (this.loadedAt = Date.now()))),
  });

  private readonly first = listView<Notification>(this.newest, () => this.tokens.token());

  /* A reload keeps the older pages it overlaps; past a gap it starts over. */
  private readonly feed = linkedSignal<readonly Notification[], Feed>({
    source: this.first.items,
    computation: (fresh, previous) => {
      const kept = previous?.value;
      const ids = new Set(fresh.map(({ id }) => id));
      return kept?.alerts.some(({ id }) => ids.has(id))
        ? { alerts: [...fresh, ...kept.alerts.filter(({ id }) => !ids.has(id))], more: kept.more }
        : { alerts: fresh, more: fresh.length === PAGE };
    },
  });

  /* Clears the badge at once while rows keep their loaded weight; another account starts clean. */
  private readonly posted = linkedSignal<string, ReadonlySet<string>>({
    source: this.tokens.token,
    computation: () => new Set(),
  });

  readonly alerts = computed(() => this.feed().alerts);
  readonly hasMore = computed(() => this.feed().more);
  readonly loadingMore = this.loadingMoreState.asReadonly();
  readonly loading = this.first.loading;
  readonly hasLoaded = this.first.hasLoaded;
  readonly error = this.first.error;

  readonly unseenCount = computed(
    () => this.alerts().filter((alert) => !alert.seen && !this.posted().has(alert.id)).length,
  );

  constructor() {
    effect(() => {
      if (this.push.message()) {
        this.load();
      }
    });
  }

  ensureFresh(): void {
    if (this.newest.isLoading() || Date.now() - this.loadedAt < STALE_AFTER_MS) {
      return;
    }

    this.newest.reload();
  }

  load(): void {
    this.newest.reload();
  }

  /** Completes, never errors; a failed page leaves `hasMore` on, so the next scroll retries. */
  loadMore(): Observable<void> {
    return defer(() => {
      const before = this.alerts().at(-1)?.id;
      if (!before || !this.hasMore() || this.loadingMoreState()) return EMPTY;

      this.loadingMoreState.set(true);
      return this.api.list(PAGE, before).pipe(
        /* A reload that reset the feed meanwhile wins over this page. */
        tap((page) =>
          this.feed.update((feed) =>
            feed.alerts.at(-1)?.id === before
              ? { alerts: [...feed.alerts, ...page], more: page.length === PAGE }
              : feed,
          ),
        ),
        map(() => undefined),
        catchError(() => EMPTY),
        finalize(() => this.loadingMoreState.set(false)),
      );
    });
  }

  markSeen(): void {
    const posted = this.posted();
    const ids = this.alerts()
      .filter((alert) => !alert.seen && !posted.has(alert.id))
      .map(({ id }) => id);
    if (ids.length === 0) return;

    this.posted.set(new Set([...posted, ...ids]));
    for (let start = 0; start < ids.length; start += SEEN_BATCH) {
      this.api
        .markSeen(ids.slice(start, start + SEEN_BATCH))
        .pipe(catchError(() => EMPTY))
        .subscribe();
    }
  }
}
