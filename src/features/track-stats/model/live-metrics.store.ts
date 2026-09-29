import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, combineLatest, interval, merge, of, scan, switchMap, tap } from 'rxjs';

import { ProjectApi } from '@entities/project';
import {
  NO_SAMPLES,
  SystemStatsApi,
  advance,
  fleetSeries,
  fromSnapshot,
  holdSample,
  projectLoads,
  toSnapshot,
} from '@entities/system-stats';
import { MEGABYTE } from '@shared/lib/format/bytes';
import { createLogger } from '@shared/lib/logging/logger';
import { onScreen } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { TICK_MS, metricsFeed } from './metrics-feed';

const SNAPSHOT_KEY = 'boreas-monitor';

type Tracked = readonly { readonly slug: string; readonly name: string }[];

/** Provide on the page: the covered-page pause listens on the page's own host. */
@Injectable()
export class LiveMetricsStore {
  private readonly logger = createLogger('live-metrics');
  private readonly api = inject(ProjectApi);
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly screen = onScreen();
  private readonly onScreen = toSignal(this.screen, { initialValue: true });
  private readonly projects = signal<Tracked>([]);
  /* Membership, not identity: a fleet reload with the same projects keeps every connection. */
  private readonly slugs = computed(() => this.projects().map(({ slug }) => slug), {
    equal: sameSlugs,
  });

  /* Page events, not an effect or rxResource params: both keep streaming while covered. */
  private readonly held = toSignal(
    combineLatest([this.screen, toObservable(this.slugs)]).pipe(
      switchMap(([on, slugs]) =>
        on && slugs.length > 0
          ? merge(
              ...slugs.map((slug) => metricsFeed(this.api.metricsStream(slug), slug, this.logger)),
            ).pipe(scan(holdSample, NO_SAMPLES))
          : of(NO_SAMPLES),
      ),
    ),
    { initialValue: NO_SAMPLES },
  );

  private readonly restored = fromSnapshot(this.read(), Date.now());

  /* The clock ticks only on screen; windows survive a pause, held samples do not. */
  private readonly window = toSignal(
    this.screen.pipe(
      switchMap((on) => (on ? interval(TICK_MS) : EMPTY)),
      scan((window) => advance(window, this.held(), Date.now()), this.restored),
      tap((window) => this.write(toSnapshot(window))),
    ),
    { initialValue: this.restored },
  );

  private readonly statsApi = inject(SystemStatsApi);
  private readonly stats = rxResource({ stream: () => this.statsApi.get() });

  /** Host RAM tops the memory axis; 0 until /stats answers, or when it fails. */
  readonly hostBytes = computed(
    () => (this.stats.hasValue() ? this.stats.value().totalMemoryMb : 0) * MEGABYTE,
  );

  readonly series = computed(() => fleetSeries(this.window(), this.slugs()));
  readonly loads = computed(() => projectLoads(this.window(), this.projects()));
  /** Also false on a restored snapshot or a covered page, not only a dropped connection. */
  readonly live = computed(() => this.onScreen() && this.window().live);
  readonly stale = computed(() => !this.live() && this.series().length > 0);

  /** Call from the page constructor: the effect must die with the page. */
  track(projects: Signal<Tracked>): void {
    effect(() => this.projects.set(projects()));
  }

  private read(): string | null {
    try {
      return this.view?.localStorage.getItem(SNAPSHOT_KEY) ?? null;
    } catch {
      return null;
    }
  }

  /* Snapshot so a reload paints the card at once instead of starting blank. */
  private write(snapshot: string): void {
    try {
      this.view?.localStorage.setItem(SNAPSHOT_KEY, snapshot);
    } catch {
      return;
    }
  }
}

function sameSlugs(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((slug, i) => slug === b[i]);
}
