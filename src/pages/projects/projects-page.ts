import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonRouterLink } from '@ionic/angular/ion-router-link';
import { from, switchMap } from 'rxjs';

import { describeDevStatus } from '@entities/task';
import { SessionStore } from '@features/auth';
import { ListProjectsStore, ProjectList, ProjectSummary } from '@features/list-projects';
import { LiveMetricsStore, LiveMonitor, ProjectSplit } from '@features/track-stats';
import { PULL_REFRESH, PullRefreshSource } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { desktopScreen, wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { Callout } from '@shared/ui/callout/callout';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { NEW_PROJECT_DIALOG, SheetService } from '@shared/ui/sheet/sheet.service';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';
import { CommandPaletteLauncher } from '@widgets/app-shell';

const LIVE_FOLDED_KEY = 'boreas-live-folded';
const SHORT_SCREEN = '(max-height: 47.5rem)';

@Component({
  selector: 'app-projects-page',
  imports: [
    Callout,
    EmptyState,
    ErrorState,
    InsetGroup,
    IonButton,
    IonButtons,
    IonRouterLink,
    LiveMonitor,
    PAGE_CHROME,
    ProjectList,
    ProjectSplit,
    PULL_REFRESH,
    RouterLink,
    SkeletonRows,
  ],
  providers: [LiveMetricsStore],
  host: { class: 'desk-wide' },
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Home</ion-title>
        <!-- POST /projects is admin-only; a visible button would just collect 403s. -->
        @if (session.isAdmin()) {
          <ion-buttons slot="end" class="narrow-only">
            <ion-button routerLink="/projects/new" aria-label="New project">
              <span slot="icon-only" class="icon-[regular--plus]" aria-hidden="true"></span>
            </ion-button>
          </ion-buttons>
        }
        <ion-buttons slot="end" class="wide-only">
          <button type="button" class="find desk-only" (click)="palette.open()">
            <span class="icon-[regular--magnifying-glass]" aria-hidden="true"></span>
            <span>Search or run a command</span>
            <kbd aria-hidden="true">{{ palette.shortcut }}</kbd>
          </button>
          @if (session.isAdmin()) {
            <ion-button
              color="primary"
              [fill]="desktop() ? 'solid' : 'clear'"
              [class.act]="desktop()"
              [class.act--primary]="desktop()"
              (click)="newProject()"
            >
              <span slot="start" class="icon-[regular--plus]" aria-hidden="true"></span>
              New project
            </ion-button>
          }
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher [appRefresh]="pull"><ion-refresher-content /></ion-refresher>
      <div class="mx-auto max-w-(--app-column)">
        <ion-header collapse="condense">
          <ion-toolbar><ion-title size="large">Home</ion-title></ion-toolbar>
        </ion-header>

        @if (overview.loading() && !overview.hasLoaded()) {
          <div class="mx-5 skeleton-defer" aria-hidden="true">
            <div class="head"><h2>Live</h2></div>
            <div class="rounded-card bg-cell px-4 py-3.5">
              <div class="grid grid-cols-3 gap-1">
                @for (label of metricLabels; track label) {
                  <div class="grid gap-1.5 px-2.5 pt-2 pb-[9px]">
                    <span class="text-xs font-semibold tracking-[0.04em] text-label-3 uppercase">
                      {{ label }}
                    </span>
                    <span class="skeleton skeleton--num"></span>
                  </div>
                }
              </div>
              <div class="skeleton mx-1 mt-3 h-[150px] md:h-[190px] xl:h-[200px]"></div>
            </div>
          </div>

          <app-inset-group label="Projects">
            <app-skeleton-rows variant="project" label="Loading projects" />
          </app-inset-group>
        } @else if (overview.error() && !overview.hasLoaded()) {
          <app-error-state class="m-5" [message]="overview.error()!" (retry)="overview.load()" />
        } @else {
          <section class="live mx-5" aria-labelledby="live-h">
            <div class="head">
              <h2 id="live-h" aria-live="polite">{{ metrics.stale() ? 'Waiting' : 'Live' }}</h2>
              @if (idle()) {
                <span class="idle">Nothing is running</span>
              } @else {
                <button
                  type="button"
                  class="toggle"
                  aria-controls="live-card"
                  [attr.aria-expanded]="!liveCollapsed()"
                  (click)="toggleLive()"
                >
                  {{ liveCollapsed() ? 'Show' : 'Hide' }}<span class="sr-only"> chart</span>
                </button>
              }
            </div>
            <!-- Nothing running: one line, not a card of zeros. -->
            @if (!idle()) {
              <app-live-monitor
                id="live-card"
                [series]="metrics.series()"
                [hostBytes]="metrics.hostBytes()"
                [stale]="metrics.stale()"
                [collapsed]="liveCollapsed()"
                (expandRequested)="toggleLive()"
              >
                <div class="split mx-1 mt-4 border-t border-sep pt-3">
                  <app-project-split [loads]="metrics.loads()" />
                </div>
              </app-live-monitor>
            }
          </section>

          @if (overview.error()) {
            <app-callout class="m-5" tone="negative" role="alert">
              {{ overview.error() }} Existing data is still shown.
            </app-callout>
          }

          <app-inset-group label="Projects" [trailing]="projectsTrailing()">
            @if (overview.summaries().length === 0) {
              <app-empty-state
                title="No projects yet"
                [description]="
                  session.isAdmin()
                    ? 'A project groups related task environments under one URL prefix and one team.'
                    : 'An administrator has to create a project or grant you access to one.'
                "
                [bordered]="false"
              />
            } @else {
              <app-project-list
                [summaries]="overview.summaries()"
                [loads]="loadsBySlug()"
                [summary]="!ipad()"
                (projectOpened)="openProject($event)"
              />
            }
          </app-inset-group>
        }
      </div>
    </ion-content>
  `,
  styles: `
    .find {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      inline-size: 16.25rem;
      block-size: 2.5rem;
      margin-inline-end: 0.625rem;
      padding: 0 0.5rem 0 0.875rem;
      border: 0;
      border-radius: 1.25rem;
      background: var(--ion-item-background);
      box-shadow: 0 0 0 0.5px var(--app-border-normal);
      font: inherit;
      font-size: 0.9375rem;
      color: var(--app-text-tertiary);
      cursor: pointer;
    }

    .find [class*='icon-['] {
      flex: none;
      font-size: 1rem;
    }

    .find span {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      text-align: start;
    }

    .find kbd {
      display: inline-flex;
      align-items: center;
      min-inline-size: 1.375rem;
      block-size: 1.375rem;
      padding: 0 0.375rem;
      border-radius: 0.375rem;
      background: var(--app-fill);
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      color: var(--app-text-secondary);
    }

    /* Outside a list, so it matches the inset groups' headers by hand. */
    .head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      margin: 1.75rem 0 0.5rem;
      padding: 0 1rem;
      font-size: 0.75rem;
      color: var(--color-label-3);
    }

    .head h2 {
      margin: 0;
      font-size: 1rem;
      line-height: 1.25rem;
      font-weight: 600;
    }

    /* From 56rem the Projects table grows CPU and Memory, so the split would repeat it. */
    .live {
      display: block;
      container-type: inline-size;
    }

    @container (min-width: 56rem) {
      .split {
        display: none;
      }
    }

    .idle {
      font-size: 0.875rem;
      color: var(--app-text-tertiary);
    }

    .toggle {
      min-block-size: 1.5rem;
      padding: 0 0.25rem;
      border: 0;
      background: none;
      font: inherit;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ion-color-primary);
      cursor: pointer;
    }

    @media (min-width: 80rem) {
      .head h2 {
        font-size: 0.9375rem;
      }
    }
  `,
})
export class ProjectsPage {
  protected readonly session = inject(SessionStore);
  protected readonly palette = inject(CommandPaletteLauncher);
  protected readonly overview = inject(ListProjectsStore);
  protected readonly metrics = inject(LiveMetricsStore);
  private readonly router = inject(Router);
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly sheets = inject(SheetService);
  private readonly newProjectDialog = inject(NEW_PROJECT_DIALOG);
  private readonly wide = wideScreen();
  protected readonly desktop = desktopScreen();
  protected readonly ipad = computed(() => this.wide() && !this.desktop());

  protected readonly metricLabels = ['CPU', 'Memory', 'Network'] as const;

  protected readonly liveCollapsed = signal(this.readLiveFolded());

  protected readonly idle = computed(
    () =>
      !this.wide() &&
      this.overview
        .summaries()
        .every(({ tasks }) => tasks.every((task) => task.status !== 'running')),
  );

  protected readonly pull: PullRefreshSource = {
    busy: this.overview.loading,
    trigger: () => this.overview.load(),
  };

  protected readonly loadsBySlug = computed(() => {
    const { rows, rest } = this.metrics.loads();
    return new Map([...rows, ...(rest?.loads ?? [])].map((load) => [load.slug, load]));
  });

  /* Counts describe what the caller can see, never a server total. */
  protected readonly projectsTrailing = computed(() => {
    const summaries = this.overview.summaries();
    const tasks = summaries.flatMap((summary) => summary.tasks);
    if (this.ipad()) return describeDevStatus(tasks);
    const projects = `${summaries.length} ${summaries.length === 1 ? 'project' : 'projects'}`;
    return `${projects} · ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;
  });

  constructor() {
    this.metrics.track(
      computed(() =>
        this.overview.summaries().map(({ project, tasks }) => ({
          ...project,
          running: tasks
            .filter(({ status }) => status === 'running')
            .map(({ name }) => name)
            .join(' '),
        })),
      ),
    );
  }

  protected toggleLive(): void {
    const folded = !this.liveCollapsed();
    this.liveCollapsed.set(folded);
    try {
      this.view?.localStorage.setItem(LIVE_FOLDED_KEY, folded ? '1' : '0');
    } catch {
      return;
    }
  }

  /* The dialog page navigates to the new project itself. */
  protected newProject(): void {
    from(this.newProjectDialog())
      .pipe(switchMap((page) => this.sheets.open(page, 'New project', { dialog: true })))
      .subscribe();
  }

  protected openProject(project: ProjectSummary['project']): void {
    /* Seeds the detail page's title before its fetch lands. */
    void this.router.navigate(['/projects', project.slug], {
      state: { projectName: project.name },
    });
  }

  /* Unpicked, a short screen opens folded, or the chart pushes every project below the fold. */
  private readLiveFolded(): boolean {
    let stored: string | null | undefined;
    try {
      stored = this.view?.localStorage.getItem(LIVE_FOLDED_KEY);
    } catch {
      stored = null;
    }
    /* Folded on a phone, where the chart took half the screen. */
    return stored ? stored === '1' : !this.wide() || !!this.view?.matchMedia(SHORT_SCREEN).matches;
  }
}
