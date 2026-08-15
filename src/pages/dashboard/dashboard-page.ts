import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TUI_BREAKPOINT, TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiToastService } from '@taiga-ui/kit';
import { filter, switchMap, take } from 'rxjs';

import { Task, TaskActionRequest } from '@entities/task';
import { ControlTaskStore, TaskCommandResult } from '@features/control-task';
import { DashboardSkeleton, ListTasksStore, TaskList } from '@features/list-tasks';
import { StatTiles, StatsHistoryStore, StatsTrend } from '@features/track-stats';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { registerPullRefresh } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { Callout } from '@shared/ui/callout/callout';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    Callout,
    DashboardSkeleton,
    EmptyState,
    ErrorState,
    GlassIconButton,
    InsetGroup,
    Reveal,
    RouterLink,
    StatTiles,
    StatsTrend,
    TaskList,
    TuiButton,
    TuiIcon,
  ],
  providers: [ListTasksStore, ControlTaskStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div appReveal class="mx-auto grid w-full max-w-[40rem] grid-cols-1 gap-4">
      <header class="flex items-center justify-between gap-3">
        <h1 class="page-title">Tasks</h1>
        @if (mobile()) {
          <a appGlassIconButton icon="@tui.plus" routerLink="/tasks/new" aria-label="New task"></a>
        } @else {
          <a tuiButton routerLink="/tasks/new" size="s" appearance="primary">
            <tui-icon class="icon-sm" icon="@tui.plus" />
            New task
          </a>
        }
      </header>

      <p class="sr-only" aria-live="polite">{{ announcement() }}</p>

      @if (dashboard.loading() && !dashboard.hasLoaded()) {
        <app-dashboard-skeleton />
      } @else if (dashboard.error() && !dashboard.hasLoaded()) {
        <app-error-state [message]="dashboard.error()!" (retry)="dashboard.load()" />
      } @else {
        <div class="grid grid-cols-1 gap-4">
        @if (dashboard.stats(); as stats) {
          <app-stats-trend [stats]="stats" [samples]="history.samples()" />
          <app-stat-tiles [stats]="stats" />
        }

        @if (dashboard.error()) {
          <app-callout tone="negative" role="alert">
            {{ dashboard.error() }} Existing data is still shown.
          </app-callout>
        }

        <app-inset-group label="Environments" [trailing]="summary()">
          @if (dashboard.tasks().length === 0) {
            <app-empty-state
              title="No tasks yet"
              description="Create a task to start an isolated Docker environment behind the Boreas proxy."
              [bordered]="false"
            />
          } @else {
            <app-task-list
              [tasks]="dashboard.tasks()"
              [pendingTaskIds]="commands.pendingTaskIds()"
              [mobile]="mobile()"
              [accessUrlFor]="commands.accessUrl"
              (actionRequested)="handleAction($event)"
              (taskOpened)="openTask($event)"
            />
          }

          <a class="add-row row-divider relative" routerLink="/tasks/new">
            <tui-icon class="icon-sm" icon="@tui.plus" />
            New task
          </a>
        </app-inset-group>
        </div>
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

    .add-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6875rem 1rem;
      font-size: 1.0625rem;
      font-weight: 500;
      color: var(--tui-text-action);
      text-decoration: none;
      transition: background-color var(--tui-duration);
    }

    .add-row:hover {
      background: var(--tui-background-neutral-1);
    }
  `,
})
export class DashboardPage {
  protected readonly dashboard = inject(ListTasksStore);
  protected readonly commands = inject(ControlTaskStore);
  protected readonly history = inject(StatsHistoryStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly toasts = inject(TuiToastService);
  private readonly router = inject(Router);
  private readonly breakpoint = inject(TUI_BREAKPOINT);

  protected readonly mobile = computed(() => this.breakpoint() === 'mobile');
  protected readonly announcement = signal('');

  protected readonly summary = computed(() => {
    const total = this.dashboard.tasks().length;
    return `${total} ${total === 1 ? 'task' : 'tasks'}`;
  });

  constructor() {
    registerPullRefresh({ busy: this.dashboard.loading, trigger: () => this.dashboard.load() });
  }

  protected openTask(task: Task): void {
    void this.router.navigate(['/tasks', task.id]);
  }

  /* Reversible lifecycle actions do not require confirmation. */
  protected handleAction({ action, task }: TaskActionRequest): void {
    if (action === 'delete') {
      this.confirmations
        .confirm({
          title: `Delete ${task.id}?`,
          message:
            'The container, environment metadata, and proxy route will be deleted. This action cannot be undone.',
          confirmLabel: 'Delete task',
          destructive: true,
        })
        .pipe(
          filter(Boolean),
          switchMap(() => this.commands.delete(task)),
        )
        .subscribe((result) => this.completeCommand(result));
      return;
    }

    this.commands.changeState(task, action).subscribe((result) => this.completeCommand(result));
  }

  private completeCommand(result: TaskCommandResult): void {
    this.announcement.set(result.message);
    this.toasts
      .open(result.message, { appearance: result.success ? 'positive' : 'negative' })
      .pipe(take(1))
      .subscribe();

    if (result.success) {
      this.dashboard.load();
    }
  }
}
