import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ListProjectsStore } from '@features/list-projects';
import { FleetTask, SearchResults, SearchTasksStore, TaskFilterBar } from '@features/search-tasks';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { registerPullRefresh } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

@Component({
  selector: 'app-search-page',
  imports: [ErrorState, InsetGroup, Reveal, SearchResults, SkeletonRows, TaskFilterBar],
  providers: [ListProjectsStore, SearchTasksStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div appReveal class="mx-auto grid w-full max-w-[40rem] grid-cols-1 gap-4">
      <header>
        <h1 class="page-title">Search</h1>
      </header>

      <app-task-filter-bar [(query)]="search.query" />

      @if (overview.loading() && !overview.hasLoaded()) {
        <!-- The field above stays typeable; only the result rows are redacted. -->
        <app-inset-group label="Results">
          <app-skeleton-rows variant="task" label="Loading tasks" />
        </app-inset-group>
      } @else if (overview.error() && !overview.hasLoaded()) {
        <app-error-state [message]="overview.error()!" (retry)="overview.load()" />
      } @else {
        <app-inset-group label="Results" [trailing]="summary()">
          <app-search-results
            [entries]="filtered()"
            [query]="search.query()"
            (taskOpened)="openTask($event)"
          />
        </app-inset-group>
      }
    </div>
  `,
  styles: `
    .page-title {
      margin: 0;
      font-size: 2.125rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.022em;
      color: var(--tui-text-primary);
    }
  `,
})
export class SearchPage {
  protected readonly overview = inject(ListProjectsStore);
  protected readonly search = inject(SearchTasksStore);
  private readonly router = inject(Router);

  /* Flatten the per-project fan-out into one searchable fleet. */
  private readonly fleet = computed<readonly FleetTask[]>(() =>
    this.overview
      .summaries()
      .flatMap((summary) => summary.tasks.map((task) => ({ project: summary.project, task }))),
  );

  protected readonly filtered = computed(() => this.search.filter(this.fleet()));
  protected readonly summary = computed(() => {
    const count = this.filtered().length;
    return `${count} ${count === 1 ? 'task' : 'tasks'}`;
  });

  constructor() {
    registerPullRefresh({ busy: this.overview.loading, trigger: () => this.overview.load() });
  }

  protected openTask(entry: FleetTask): void {
    void this.router.navigate(['/projects', entry.project.slug, 'tasks', entry.task.name]);
  }
}
