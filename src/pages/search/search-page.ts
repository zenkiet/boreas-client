import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { IonRouterLink } from '@ionic/angular/ion-router-link';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';

import { isDown, isFailing, taskKey } from '@entities/task';
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
  statusToken,
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
  /* On Home's column, so the desktop edges match from page to page. */
  host: { class: 'desk-wide' },
  imports: [
    EmptyState,
    ErrorState,
    FilterChips,
    InsetGroup,
    IonButton,
    IonItem,
    IonLabel,
    IonNote,
    IonRouterLink,
    IonSearchbar,
    NgTemplateOutlet,
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

        <!-- Announces the counts as the query changes. -->
        <p class="sr-only" role="status">{{ announcement() }}</p>

        <!-- A blank phone query shows suggestions: nothing to scope. -->
        @if (wide() || !blank()) {
          <app-filter-chips label="Scope" [options]="scopes()" [(value)]="scope">
            @if (wide() && hintSlug()) {
              <span class="hint ms-auto">
                Try <code>is:down</code> or <code>project:{{ hintSlug() }}</code>
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
                <!-- A query naming a project lists it first. -->
                @if (projectFirst()) {
                  <ng-container *ngTemplateOutlet="projectGroup" />
                }
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
                @if (!projectFirst()) {
                  <ng-container *ngTemplateOutlet="projectGroup" />
                }
                @if (nothing()) {
                  <app-empty-state
                    class="m-5 block"
                    icon="icon-[light--magnifying-glass]"
                    [title]="blank() ? 'No tasks yet' : 'No matches'"
                    [description]="emptyHint()"
                  >
                    <!-- A bare status word only searches text: offer its filter. -->
                    @if (meant(); as token) {
                      <ion-button fill="outline" size="small" (click)="pickFilter(token)">
                        Show {{ token }}
                      </ion-button>
                    }
                  </app-empty-state>
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

    <ng-template #projectGroup>
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
    </ng-template>
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
  protected readonly projectFirst = computed(() => {
    const text = this.query().text;
    return this.projects().some(
      ({ project }) => project.name.toLowerCase() === text || project.slug.toLowerCase() === text,
    );
  });

  protected readonly topHit = computed(() =>
    !this.wide() && this.query().text && this.scope() !== 'projects' && !this.projectFirst()
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

  protected readonly meant = computed(() => {
    const query = this.query();
    return query.states.length === 0 && !query.project ? statusToken(query.text) : null;
  });

  protected readonly emptyHint = computed(() => {
    if (this.blank()) return 'Tasks from every project you can see show up here.';
    const query = this.query();
    if (query.states.length > 0 && !query.text) return 'No task is in that state right now.';
    const token = this.meant();
    return token
      ? `No task name or description says “${this.query().text}”. Filter by status with ${token}.`
      : 'Try part of a task or project name, or of a description.';
  });

  protected readonly announcement = computed(() => {
    if (this.blank() || !this.overview.hasLoaded()) return '';
    const tasks = this.scope() === 'projects' ? 0 : this.matches().length;
    const projects = this.scope() === 'tasks' ? 0 : this.projects().length;
    if (tasks + projects === 0) return 'No matches';
    const count = (n: number, noun: string) => (n ? `${n} ${noun}${n === 1 ? '' : 's'}` : '');
    return [count(tasks, 'task'), count(projects, 'project')].filter(Boolean).join(', ');
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
      failed: fleet.filter(({ task }) => isFailing(task)).length,
      blocked: fleet.filter(({ task }) => task.devStatus === 'blocked').length,
      down: fleet.filter(({ task }) => isDown(task)).length,
      ready: fleet.filter(({ task }) => task.devStatus === 'ready' && task.status === 'running')
        .length,
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
