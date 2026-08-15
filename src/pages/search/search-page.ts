import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Task } from '@entities/task';
import { ListTasksStore } from '@features/list-tasks';
import { SearchResults, SearchTasksStore, TaskFilterBar } from '@features/search-tasks';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { registerPullRefresh } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

@Component({
  selector: 'app-search-page',
  imports: [ErrorState, InsetGroup, Reveal, SearchResults, TaskFilterBar],
  providers: [ListTasksStore, SearchTasksStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div appReveal class="mx-auto grid w-full max-w-[40rem] grid-cols-1 gap-4">
      <header>
        <h1 class="page-title">Search</h1>
      </header>

      <app-task-filter-bar [(query)]="search.query" />

      @if (tasks.loading() && !tasks.hasLoaded()) {
        <div class="skeleton" aria-hidden="true">
          @for (row of [0, 1, 2]; track row) {
            <div class="skeleton__row"></div>
          }
        </div>
      } @else if (tasks.error() && !tasks.hasLoaded()) {
        <app-error-state [message]="tasks.error()!" (retry)="tasks.load()" />
      } @else {
        <app-inset-group label="Results" [trailing]="summary()">
          <app-search-results
            [tasks]="filtered()"
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

    .skeleton {
      display: grid;
      gap: 0.5rem;
    }

    .skeleton__row {
      block-size: 3.25rem;
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-neutral-1);
      animation: skeleton-pulse 1.4s ease-in-out infinite;
    }

    @keyframes skeleton-pulse {
      50% {
        opacity: 0.55;
      }
    }
  `,
})
export class SearchPage {
  protected readonly tasks = inject(ListTasksStore);
  protected readonly search = inject(SearchTasksStore);
  private readonly router = inject(Router);

  protected readonly filtered = computed(() => this.search.filter(this.tasks.tasks()));
  protected readonly summary = computed(() => {
    const count = this.filtered().length;
    return `${count} ${count === 1 ? 'task' : 'tasks'}`;
  });

  constructor() {
    registerPullRefresh({ busy: this.tasks.loading, trigger: () => this.tasks.load() });
  }

  protected openTask(task: Task): void {
    void this.router.navigate(['/tasks', task.id]);
  }
}
