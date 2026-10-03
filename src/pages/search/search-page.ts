import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { IonRouterLink } from '@ionic/angular/ion-router-link';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';

import { failedToday, taskKey } from '@entities/task';
import { TaskApi } from '@entities/task/api';
import { ListProjectsStore } from '@features/list-projects/model';
import {
  FleetTask,
  RecentTask,
  SearchResults,
  SearchSuggestions,
  SearchTasksStore,
  TaskFilterBar,
  TopHit,
  matchProjects,
  parseQuery,
  rankTasks,
} from '@features/search-tasks';
import { PULL_REFRESH, PullRefreshSource } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { TWO_PANE_QUERY, mediaQuery, wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { FilterChips } from '@shared/ui/filter-chips/filter-chips';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

type Scope = 'all' | 'tasks' | 'projects';

@Component({
  selector: 'app-search-page',
  imports: [
    EmptyState,
    ErrorState,
    FilterChips,
    InsetGroup,
    IonItem,
    IonLabel,
    IonNote,
    IonRouterLink,
    IonSearchbar,
    PAGE_CHROME,
    PULL_REFRESH,
    RouterLink,
    SearchResults,
    SearchSuggestions,
    SkeletonRows,
    TaskFilterBar,
    TopHit,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar><ion-title>Search</ion-title></ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher [appRefresh]="pull"><ion-refresher-content /></ion-refresher>

      <div class="mx-auto max-w-(--app-column)">
        <ion-header collapse="condense">
          <ion-toolbar><ion-title size="large">Search</ion-title></ion-toolbar>
          <!-- Phones type in the shell's bottom search field. -->
          <ion-toolbar class="wide-only">
            <div class="field-wrap">
              <ion-searchbar
                appTaskFilterBar
                class="field"
                placeholder="Tasks, projects, is:blocked"
                showClearButton="never"
                [(query)]="search.query"
              />
              <kbd class="field-kbd" aria-hidden="true">esc</kbd>
            </div>
          </ion-toolbar>
        </ion-header>

        <!-- A blank phone query shows suggestions: nothing to scope. -->
        @if (wide() || !blank()) {
          <app-filter-chips label="Scope" [options]="scopes()" [(value)]="scope">
            @if (wide() && hintSlug()) {
              <span class="hint ms-auto">
                Try <code>is:stopped</code> or <code>project:{{ hintSlug() }}</code>
              </span>
            }
          </app-filter-chips>
        }

        @if (overview.loading() && !overview.hasLoaded()) {
          <app-inset-group label="Tasks">
            <app-skeleton-rows variant="task" label="Loading tasks" />
          </app-inset-group>
        } @else if (overview.error() && !overview.hasLoaded()) {
          <app-error-state
            class="m-5 block"
            [message]="overview.error()!"
            (retry)="overview.load()"
          />
        } @else {
          <div [class.grid-pane]="twoPane()">
            <div class="min-w-0">
              @if (blank() && !wide()) {
                <app-search-suggestions
                  [counts]="counts()"
                  [recent]="recent()"
                  (filterPicked)="pickFilter($event)"
                  (recentOpened)="openRecent($event)"
                  (recentCleared)="search.clearRecent()"
                />
              } @else {
                @if (topHit(); as hit) {
                  <app-inset-group
                    label="Top hit"
                    [trailing]="'Best match for “' + query().text + '”'"
                  >
                    <app-top-hit
                      [entry]="hit"
                      [needle]="query().text"
                      [visitUrl]="visitUrl(hit)"
                      (taskOpened)="openTask($event)"
                      (logsOpened)="openTask($event, 'logs')"
                      (visited)="search.remember($event.project.slug, $event.task.name)"
                    />
                  </app-inset-group>
                }
                @if (scope() !== 'projects' && listed().length > 0) {
                  <app-inset-group label="Tasks" [trailing]="tasksTrailing()">
                    <app-search-results [entries]="listed()" (taskOpened)="openTask($event)" />
                  </app-inset-group>
                }
                @if (scope() !== 'tasks' && projects().length > 0) {
                  <app-inset-group label="Projects" [trailing]="'' + projects().length">
                    @for (match of projects(); track match.project.id) {
                      <ion-item [routerLink]="['/projects', match.project.slug]">
                        <ion-label>{{ match.project.name }}</ion-label>
                        <ion-note>{{ match.note }}</ion-note>
                      </ion-item>
                    }
                  </app-inset-group>
                }
                @if (nothing()) {
                  <app-empty-state
                    class="m-5 block"
                    icon="icon-[light--magnifying-glass]"
                    [title]="blank() ? 'No tasks yet' : 'No matches'"
                    [description]="
                      blank()
                        ? 'Tasks from every project you can see show up here.'
                        : 'Try a project slug, a task name or part of its description.'
                    "
                  />
                }
              }
            </div>

            @if (wide()) {
              <aside class="min-w-0" aria-label="Suggestions">
                <app-search-suggestions
                  [compact]="true"
                  [counts]="counts()"
                  [recent]="recent()"
                  (filterPicked)="pickFilter($event)"
                  (recentOpened)="openRecent($event)"
                  (recentCleared)="search.clearRecent()"
                />
                <p class="aside-hint">Press <kbd>/</kbd> to search, <kbd>esc</kbd> to clear.</p>
              </aside>
            }
          </div>
        }
      </div>
    </ion-content>
  `,
  styles: `
    .field-wrap {
      position: relative;
    }

    /* The theme styles the scoped inner input; the extra classes outrank its !important. */
    :host
      ::ng-deep
      ion-searchbar.field.searchbar-left-aligned.ios
      .searchbar-input-container
      input.searchbar-input {
      block-size: 3.25rem !important;
      border: 0 !important;
      border-radius: 1.625rem !important;
      padding-inline: 2.75rem 3.5rem !important;
      background: var(--ion-item-background) !important;
      box-shadow: 0 0 0 0.5px var(--app-border-normal) !important;
      backdrop-filter: none !important;
      font-size: 1.0625rem !important;
    }

    .field-kbd {
      position: absolute;
      inset-inline-end: 1.625rem;
      inset-block-start: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }

    .grid-pane {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 17.5rem;
      align-items: start;
    }

    .hint {
      align-self: center;
      font-size: 0.8125rem;
      color: var(--app-text-tertiary);
      white-space: nowrap;
    }

    .hint code {
      font-family: var(--app-font-mono);
    }

    .aside-hint {
      margin: 0.5rem 2.25rem 0;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-tertiary);
    }

    kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-inline-size: 1.375rem;
      block-size: 1.375rem;
      border-radius: 0.375rem;
      padding: 0 0.375rem;
      background: var(--app-background-neutral-1);
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      color: var(--app-text-secondary);
    }
  `,
})
export class SearchPage {
  protected readonly overview = inject(ListProjectsStore);
  protected readonly search = inject(SearchTasksStore);
  private readonly tasks = inject(TaskApi);
  private readonly router = inject(Router);
  protected readonly wide = wideScreen();
  protected readonly twoPane = mediaQuery(TWO_PANE_QUERY);

  protected readonly scope = signal<Scope>('all');

  protected readonly pull: PullRefreshSource = {
    busy: this.overview.loading,
    trigger: () => this.overview.load(),
  };

  private readonly fleet = computed<readonly FleetTask[]>(() =>
    this.overview
      .summaries()
      .flatMap((summary) => summary.tasks.map((task) => ({ project: summary.project, task }))),
  );

  protected readonly query = computed(() => parseQuery(this.search.query()));
  protected readonly blank = computed(() => this.search.query().trim() === '');

  private readonly matches = computed(() => rankTasks(this.fleet(), this.query()));

  protected readonly projects = computed(() =>
    matchProjects(this.overview.summaries(), this.query()),
  );

  /* Phones only: on iPad the list's first row already is the best match. */
  protected readonly topHit = computed(() =>
    !this.wide() && this.query().text && this.scope() !== 'projects'
      ? (this.matches()[0] ?? null)
      : null,
  );

  protected readonly listed = computed(() =>
    this.topHit() ? this.matches().slice(1) : this.matches(),
  );

  protected readonly tasksTrailing = computed(() => {
    const count = this.listed().length;
    return `${count} ${count === 1 ? 'task' : 'tasks'}`;
  });

  protected readonly nothing = computed(
    () =>
      !this.topHit() &&
      (this.scope() === 'projects' || this.listed().length === 0) &&
      (this.scope() === 'tasks' || this.projects().length === 0),
  );

  protected readonly scopes = computed(() => {
    if (!this.wide() || this.blank()) {
      return [
        { key: 'all' as const, label: 'All' },
        { key: 'tasks' as const, label: 'Tasks' },
        { key: 'projects' as const, label: 'Projects' },
      ];
    }
    const tasks = this.matches().length;
    const projects = this.projects().length;
    return [
      { key: 'all' as const, label: `All · ${tasks + projects}` },
      { key: 'tasks' as const, label: `Tasks · ${tasks}` },
      { key: 'projects' as const, label: `Projects · ${projects}` },
    ];
  });

  protected readonly hintSlug = computed(() => this.overview.summaries()[0]?.project.slug ?? '');

  protected readonly counts = computed(() => {
    if (!this.overview.hasLoaded()) return null;
    const fleet = this.fleet();
    return {
      failed: fleet.filter(({ task }) => failedToday(task)).length,
      blocked: fleet.filter(({ task }) => task.devStatus === 'blocked').length,
      stopped: fleet.filter(({ task }) => task.status === 'stopped').length,
    };
  });

  /* A deleted task, or another account's, must never show. */
  protected readonly recent = computed(() => {
    const known = new Set(
      this.fleet().map(({ project, task }) => taskKey(project.slug, task.name)),
    );
    return this.search.recent().filter((entry) => known.has(taskKey(entry.project, entry.name)));
  });

  protected visitUrl({ project, task }: FleetTask): string {
    return this.tasks.accessUrl(project.slug, task.name);
  }

  protected pickFilter(token: string): void {
    this.scope.set('all');
    this.search.query.set(token);
  }

  protected openRecent(entry: RecentTask): void {
    this.search.remember(entry.project, entry.name);
    void this.router.navigate(['/projects', entry.project, 'tasks', entry.name]);
  }

  protected openTask({ project, task }: FleetTask, section?: 'logs'): void {
    this.search.remember(project.slug, task.name);
    void this.router.navigate(['/projects', project.slug, 'tasks', task.name], {
      queryParams: section ? { section } : {},
    });
  }
}
