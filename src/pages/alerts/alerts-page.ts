import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import type { InfiniteScrollCustomEvent } from '@ionic/angular';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonInfiniteScroll } from '@ionic/angular/ion-infinite-scroll';
import { IonInfiniteScrollContent } from '@ionic/angular/ion-infinite-scroll-content';
import { Subject, buffer, debounceTime, from, switchMap } from 'rxjs';

import { TaskApi } from '@entities/task/api';
import { taskKey } from '@entities/task/model';
import {
  ACTIVITY_CHIPS,
  ActivityChip,
  AlertDetail,
  AlertFilter,
  AlertList,
  AlertOpen,
  EMPTY_ALERT_FILTER,
  ListAlertsStore,
  loadAlertFilterSheet,
  matchesChip,
  matchesFilter,
} from '@features/list-alerts';
import { ListProjectsStore } from '@features/list-projects';
import { PULL_REFRESH, PullRefreshSource } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { TWO_PANE_QUERY, mediaQuery } from '@shared/ui/breakpoint/wide-screen';
import { Callout } from '@shared/ui/callout/callout';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { FilterChips } from '@shared/ui/filter-chips/filter-chips';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { entrance } from '@shared/ui/motion/page-motion';
import { Announcer } from '@shared/ui/notify/announcer';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { SheetService } from '@shared/ui/sheet/sheet.service';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

interface FilterTag {
  readonly key: 'project' | 'range';
  readonly label: string;
}

@Component({
  selector: 'app-alerts-page',
  imports: [
    AlertDetail,
    AlertList,
    Callout,
    EmptyState,
    ErrorState,
    FilterChips,
    InsetGroup,
    IonButton,
    IonButtons,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    PAGE_CHROME,
    PULL_REFRESH,
    RouterLink,
    SkeletonRows,
  ],
  host: { class: 'desk-wide' },
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Activity</ion-title>
        <ion-buttons slot="end" class="narrow-only">
          <ion-button
            [attr.aria-label]="
              tags().length
                ? 'Filter by project and date, ' + tags().length + ' active'
                : 'Filter by project and date'
            "
            (click)="openFilter()"
          >
            <span
              slot="icon-only"
              class="icon-[regular--bars-filter]"
              [class.text-accent]="tags().length"
              aria-hidden="true"
            ></span>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end" class="wide-only">
          <ion-button aria-haspopup="dialog" (click)="openFilter()">
            {{ scopeLabel() }}
            <span slot="end" class="icon-[regular--angle-down]" aria-hidden="true"></span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher [appRefresh]="pull"><ion-refresher-content /></ion-refresher>

      <div class="mx-auto max-w-(--app-column)" [class.split]="twoPane() && selected()">
        <ion-header collapse="condense">
          <ion-toolbar><ion-title size="large">Activity</ion-title></ion-toolbar>
        </ion-header>

        <div class="split__list">
          @if (alerts.loading() && !alerts.hasLoaded()) {
            <app-inset-group>
              <app-skeleton-rows variant="task" label="Loading activity" />
            </app-inset-group>
          } @else if (alerts.error() && !alerts.hasLoaded()) {
            <app-error-state
              class="m-5 block"
              title="Unable to load activity"
              [message]="alerts.error()!"
              (retry)="alerts.load()"
            />
          } @else {
            @if (alerts.error()) {
              <app-callout class="m-5" tone="negative" role="alert">
                {{ alerts.error() }} Existing data is still shown.
              </app-callout>
            }

            <app-filter-chips label="Show" [options]="chipOptions()" [(value)]="chip" />

            @if (tags().length > 0) {
              <div class="tags narrow-only" role="group" aria-label="Active filters">
                @for (tag of tags(); track tag.key) {
                  <button
                    type="button"
                    class="tag"
                    [attr.aria-label]="'Remove filter ' + tag.label"
                    (click)="removeTag(tag.key)"
                  >
                    {{ tag.label }}
                    <span class="icon-[regular--xmark]" aria-hidden="true"></span>
                  </button>
                }
                <span class="tags__count tabular">
                  {{ shown().length }} of {{ alerts.alerts().length }}
                </span>
              </div>
            }

            @if (alerts.alerts().length === 0) {
              <app-empty-state
                class="m-5 block"
                title="No activity yet"
                description="Deploys, failed builds, status changes and new tasks from every project you can see land here."
              >
                <a routerLink="/settings/tokens" class="empty-link">Create an API token</a>
              </app-empty-state>
            } @else if (shown().length === 0) {
              <app-empty-state
                class="m-5 block"
                title="Nothing matches these filters"
                description="Widen the date range or clear a filter to see more."
              >
                <button type="button" class="empty-link" (click)="clearFilters()">
                  Clear filters
                </button>
              </app-empty-state>
            } @else {
              <app-alert-list
                [class.mx-5]="twoPane()"
                [class.block]="twoPane()"
                [alerts]="shown()"
                [twoPane]="twoPane()"
                [selectedId]="selectedId()"
                [ciUrls]="ciUrls()"
                [projectNames]="projectNames()"
                [tasks]="fleetTasks()"
                [scope]="[filter(), chip()]"
                (selected)="selectedId.set($event.id)"
                (opened)="openTask($event)"
                (arrived)="arrivals.next($event)"
              />
              <ion-infinite-scroll [disabled]="!alerts.hasMore()" (ionInfinite)="more($event)">
                <ion-infinite-scroll-content />
              </ion-infinite-scroll>
            }
          }
        </div>

        @if (twoPane() && selected(); as event) {
          <!-- Rebuilt per event so it fades in; 'event:' avoids NG0956. -->
          @for (id of [event.id]; track 'event:' + id) {
            <section
              id="activity-detail"
              class="split__detail"
              aria-label="Event detail"
              [animate.enter]="fade()"
            >
              <app-alert-detail
                [alert]="event"
                [projectName]="projectNames().get(event.project) ?? ''"
                [visitUrl]="visitUrl()"
                [ciUrl]="ciUrl()"
                (opened)="openTask($event)"
              />
            </section>
          }
        }
      </div>
    </ion-content>
  `,
  styles: `
    /* Wide enough for the five kind chips on one line. */
    .split {
      display: grid;
      grid-template-columns: 28rem minmax(0, 1fr);
      column-gap: 1.25rem;
      align-items: start;
    }

    .split > ion-header {
      grid-column: 1 / -1;
    }

    .split .filter-chips {
      padding-inline: 1.25rem 0;
    }

    /* Stays below the floating bar, whose scope button would cover it. */
    .split__detail {
      position: sticky;
      top: 5rem;
      margin-block-start: 1rem;
      margin-inline-end: 1.25rem;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin: 0.625rem 1.25rem 0;
    }

    /* Tailwind has no preflight, so reset the tag button explicitly. */
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      margin: 0;
      border: 0;
      block-size: 2.25rem;
      border-radius: 999px;
      padding: 0 0.75rem 0 0.875rem;
      background: var(--app-accent-soft);
      font: inherit;
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--ion-color-primary);
      cursor: pointer;
    }

    .tag [class*='icon-['] {
      font-size: 0.875rem;
    }

    .tags__count {
      font-size: 0.8125rem;
      color: var(--app-text-tertiary);
    }

    .empty-link {
      margin: 0;
      border: 0;
      padding: 0;
      background: none;
      font: inherit;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--ion-color-primary);
      text-decoration: none;
      cursor: pointer;
    }
  `,
})
export class AlertsPage {
  protected readonly alerts = inject(ListAlertsStore);
  private readonly fleet = inject(ListProjectsStore);
  private readonly sheets = inject(SheetService);
  private readonly router = inject(Router);
  private readonly tasks = inject(TaskApi);
  private readonly announcer = inject(Announcer);
  protected readonly arrivals = new Subject<number>();
  protected readonly twoPane = mediaQuery(TWO_PANE_QUERY);
  protected readonly fade = entrance('fx-in');

  /** `?project=`: opens Activity on one project. */
  readonly project = input<string>();

  /* The range survives a new ?project=: the URL only carries the project. */
  protected readonly filter = linkedSignal<string | undefined, AlertFilter>({
    source: this.project,
    computation: (project, previous) => ({
      ...(previous?.value ?? EMPTY_ALERT_FILTER),
      project: project ?? '',
    }),
  });
  protected readonly chip = signal<ActivityChip>('all');

  protected readonly pull: PullRefreshSource = {
    busy: this.alerts.loading,
    trigger: () => this.alerts.load(),
  };

  private readonly scoped = computed(() =>
    this.alerts.alerts().filter((alert) => matchesFilter(alert, this.filter())),
  );

  protected readonly shown = computed(() =>
    this.scoped().filter((alert) => matchesChip(alert, this.chip())),
  );

  protected readonly chipOptions = computed(() => {
    const failures = this.scoped().filter((alert) => matchesChip(alert, 'failures')).length;
    return ACTIVITY_CHIPS.map((option) =>
      option.key === 'failures' ? { ...option, count: failures } : option,
    );
  });

  protected readonly selectedId = linkedSignal<readonly { id: string }[], string | null>({
    source: this.shown,
    computation: (shown, previous) =>
      previous?.value && shown.some((alert) => alert.id === previous.value)
        ? previous.value
        : (shown[0]?.id ?? null),
  });

  protected readonly fleetTasks = computed(
    () =>
      new Set(
        this.fleet
          .summaries()
          .flatMap(({ project, tasks }) => tasks.map((task) => taskKey(project.slug, task.name))),
      ),
  );

  /* The feed carries slugs; names and the picker's list come from the fleet. */
  protected readonly projectNames = computed(
    () => new Map(this.fleet.summaries().map(({ project }) => [project.slug, project.name])),
  );

  /* A failure links its run only while the task's build is still failing. */
  protected readonly ciUrls = computed(
    () =>
      new Map(
        this.fleet
          .summaries()
          .flatMap(({ project, tasks }) =>
            tasks.flatMap(({ name, build }) =>
              build?.state === 'failure' && build.url
                ? [[taskKey(project.slug, name), build.url] as const]
                : [],
            ),
          ),
      ),
  );

  /* Infinite scroll fires only on scroll: a filter that leaves too few rows pages up to 3 times. */
  private readonly topUps = linkedSignal({
    source: () => [this.filter(), this.chip()],
    computation: () => 3,
  });

  protected readonly selected = computed(
    () => this.shown().find((alert) => alert.id === this.selectedId()) ?? null,
  );

  protected readonly visitUrl = computed(() => {
    const event = this.selected();
    return event ? this.tasks.accessUrl(event.project, event.taskName) : '';
  });

  protected readonly ciUrl = computed(() => {
    const event = this.selected();
    return event ? (this.ciUrls().get(taskKey(event.project, event.taskName)) ?? '') : '';
  });

  protected readonly tags = computed<readonly FilterTag[]>(() => {
    const { project, range } = this.filter();
    const tags: FilterTag[] = [];
    if (project) tags.push({ key: 'project', label: this.projectNames().get(project) ?? project });
    if (range)
      tags.push({ key: 'range', label: `${formatDay(range.from)} – ${formatDay(range.to)}` });
    return tags;
  });

  protected readonly scopeLabel = computed(() => {
    const { project, range } = this.filter();
    const where = project ? (this.projectNames().get(project) ?? project) : 'All projects';
    return range ? `${where} · ${formatDay(range.from)} – ${formatDay(range.to)}` : where;
  });

  constructor() {
    effect(() => {
      if (this.alerts.hasLoaded()) this.alerts.markSeen();
    });
    effect(() => {
      const short = this.shown().length < 20 && this.alerts.hasMore();
      if (!short || this.alerts.loadingMore() || this.topUps() === 0) return;
      this.topUps.update((left) => left - 1);
      untracked(() => this.alerts.loadMore().subscribe());
    });
    /* One status outside the list per burst, never a row each. */
    this.arrivals
      .pipe(buffer(this.arrivals.pipe(debounceTime(1000))), takeUntilDestroyed())
      .subscribe((batch) => {
        const count = batch.reduce((sum, rows) => sum + rows, 0);
        this.announcer.say(`${count} new ${count === 1 ? 'event' : 'events'}`);
      });
  }

  protected more(event: InfiniteScrollCustomEvent): void {
    this.alerts.loadMore().subscribe({ complete: () => void event.target.complete() });
  }

  protected openFilter(): void {
    from(loadAlertFilterSheet())
      .pipe(
        switchMap((sheet) =>
          this.sheets.open<AlertFilter>(
            sheet,
            'Filter activity',
            {
              alerts: this.alerts.alerts().filter((alert) => matchesChip(alert, this.chip())),
              projects: this.fleet.summaries().map(({ project }) => project),
              value: this.filter(),
            },
            /* Room for the date rows the Date range toggle reveals. */
            400,
          ),
        ),
      )
      .subscribe((filter) => this.applyFilter(filter));
  }

  protected openTask({ alert, section }: AlertOpen): void {
    void this.router.navigate(['/projects', alert.project, 'tasks', alert.taskName], {
      queryParams: section ? { section } : {},
    });
  }

  protected removeTag(key: FilterTag['key']): void {
    const filter = this.filter();
    this.applyFilter(key === 'project' ? { ...filter, project: '' } : { ...filter, range: null });
  }

  protected clearFilters(): void {
    this.applyFilter(EMPTY_ALERT_FILTER);
    this.chip.set('all');
  }

  /* The URL follows the filter, so a reload keeps it. */
  private applyFilter(filter: AlertFilter): void {
    this.filter.set(filter);
    if ((this.project() ?? '') === filter.project) return;
    void this.router.navigate([], {
      queryParams: { project: filter.project || null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDay(day: string): string {
  const [, month, date] = day.split('-').map(Number);
  return `${MONTHS[month! - 1]} ${date}`;
}
