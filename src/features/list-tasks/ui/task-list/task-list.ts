import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiSwipeActions, TuiSwipeActionsAutoClose } from '@taiga-ui/addon-mobile';
import { TuiDropdown, TuiDropdownContext, TuiIcon } from '@taiga-ui/core';

import { Task, TaskActionRequest, TaskActions, TaskMenu, sortByDevStatus } from '@entities/task';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';

@Component({
  selector: 'app-task-list',
  imports: [
    DatePipe,
    GlassIconButton,
    RouterLink,
    TaskActions,
    TaskMenu,
    TuiDropdown,
    TuiDropdownContext,
    TuiIcon,
    TuiSwipeActions,
    TuiSwipeActionsAutoClose,
  ],
  template: `
    @if (mobile()) {
      <ul class="m-0 list-none p-0" aria-label="Boreas tasks">
        @for (task of sorted(); track task.id) {
          <li class="row-divider relative">
            <tui-swipe-actions autoClose class="swipe">
              <!-- A button owns the click that longtap's passive listener cannot cancel. -->
              <button
                type="button"
                class="row row--tap"
                [tuiDropdown]="menu"
                tuiDropdownContext
                (longtap)="armMenu()"
                (click)="openTask($event, task)"
              >
                <span class="dot" [attr.data-dev]="task.devStatus" aria-hidden="true"></span>
                <span class="min-w-0 flex-1">
                  <span class="row__id">
                    {{ task.name }}
                    <span class="sr-only">, {{ task.status }}</span>
                  </span>
                  <span class="row__sub">
                    {{ task.description || '—' }}
                    @if (task.status !== 'running') {
                      · {{ task.status }}
                    }
                  </span>
                  @if (task.error) {
                    <span class="note note--negative">{{ task.error }}</span>
                  }
                  @if (task.pendingRecreate) {
                    <span class="note note--warning">Environment changes need a recreate</span>
                  }
                </span>
                <tui-icon class="row__chevron" icon="@tui.chevron-right" aria-hidden="true" />

                <ng-template #menu>
                  <app-task-menu
                    [task]="task"
                    [accessUrl]="accessUrlFor()(task.name)"
                    [pending]="pendingTaskIds().has(task.name)"
                    (actionRequested)="actionRequested.emit($event)"
                  />
                </ng-template>
              </button>

              <button
                tuiSwipeAction
                appGlassIconButton
                type="button"
                [icon]="task.status === 'running' ? '@tui.square' : '@tui.play'"
                [attr.aria-label]="task.status === 'running' ? 'Stop' : 'Start'"
                [disabled]="pendingTaskIds().has(task.name)"
                (click)="requestLifecycle(task)"
              ></button>
              <button
                tuiSwipeAction
                appGlassIconButton
                icon="@tui.trash-2"
                tone="negative"
                type="button"
                aria-label="Delete"
                [disabled]="pendingTaskIds().has(task.name)"
                (click)="actionRequested.emit({ action: 'delete', task })"
              ></button>
            </tui-swipe-actions>
          </li>
        }
      </ul>
    } @else {
      <div role="list" aria-label="Boreas tasks">
        @for (task of sorted(); track task.id) {
          <div
            role="listitem"
            class="row row--pointer row-divider relative"
            [class.row--busy]="pendingTaskIds().has(task.name)"
            (click)="openTask($event, task)"
            (keydown.enter)="openTask($event, task)"
          >
            <span class="dot" [attr.data-dev]="task.devStatus" aria-hidden="true"></span>
            <span class="min-w-0 flex-1">
              <a class="row__id row__id--link" [routerLink]="routeFor()(task)">
                {{ task.name }}
                <span class="sr-only">, {{ task.status }}</span>
              </a>
              <span class="row__sub">
                {{ task.description || '—' }}
                @if (task.status !== 'running') {
                  · {{ task.status }}
                }
              </span>
              @if (task.error) {
                <span class="note note--negative">{{ task.error }}</span>
              }
              @if (task.pendingRecreate) {
                <span class="note note--warning">Environment changes need a recreate</span>
              }
            </span>

            <span class="row__meta tabular">{{ task.updatedAt | date: 'MMM d, y, h:mm a' }}</span>
            <span class="row__actions">
              <app-task-actions
                [task]="task"
                [accessUrl]="accessUrlFor()(task.name)"
                [pending]="pendingTaskIds().has(task.name)"
                (actionRequested)="actionRequested.emit($event)"
              />
            </span>

            <tui-icon class="row__chevron" icon="@tui.chevron-right" aria-hidden="true" />
          </div>
        }
      </div>
    }
  `,
  styles: `
    /* Tighter than Taiga's defaults so two discs leave the id on screen. */
    .swipe {
      --tui-action-gap: 10;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6875rem 1rem;
      min-block-size: 3.75rem;
      text-decoration: none;
      transition: background-color var(--tui-duration);
    }

    /* Tailwind has no preflight, so reset the button's user-agent styles here. */
    .row--tap {
      inline-size: 100%;
      margin: 0;
      border: 0;
      background: none;
      font: inherit;
      color: inherit;
      text-align: start;
      -webkit-tap-highlight-color: transparent;
    }

    .row--tap:active {
      background: var(--tui-background-neutral-1);
    }

    .row--pointer:hover {
      background: var(--tui-background-neutral-1);
    }

    .row--pointer {
      cursor: pointer;
    }

    .dot {
      inline-size: 0.4375rem;
      block-size: 0.4375rem;
      flex: none;
      border-radius: 999px;
      background: var(--tui-status-neutral);
    }

    .dot[data-dev='in_progress'] {
      background: var(--tui-status-warning);
    }

    .dot[data-dev='blocked'] {
      background: var(--tui-status-negative);
    }

    .dot[data-dev='ready'] {
      background: var(--tui-status-positive);
    }

    .row__id {
      display: block;
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--tui-text-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
      text-decoration: none;
    }

    .row__id--link:hover {
      color: var(--tui-text-action);
    }

    .row__sub {
      display: block;
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--tui-text-tertiary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .note {
      display: block;
      font-size: 0.8125rem;
      line-height: 1.4;
    }

    .note--negative {
      color: var(--tui-status-negative);
    }

    .note--warning {
      color: var(--tui-status-warning);
    }

    .row__meta {
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
      white-space: nowrap;
    }

    .row__actions {
      display: none;
    }

    .row--pointer:hover .row__meta,
    .row--pointer:focus-within .row__meta,
    .row--busy .row__meta {
      display: none;
    }

    .row--pointer:hover .row__actions,
    .row--pointer:focus-within .row__actions,
    .row--busy .row__actions {
      display: flex;
    }

    .row__chevron {
      flex: none;
      font-size: 0.9375rem;
      color: var(--tui-text-tertiary);
    }
  `,
})
export class TaskList {
  readonly tasks = input.required<readonly Task[]>();

  protected readonly sorted = computed(() => sortByDevStatus(this.tasks()));
  /** Pending commands are keyed by task name within the page's project. */
  readonly pendingTaskIds = input.required<ReadonlySet<string>>();
  readonly mobile = input.required<boolean>();
  readonly accessUrlFor = input.required<(name: string) => string>();
  readonly routeFor = input.required<(task: Task) => readonly string[]>();
  readonly actionRequested = output<TaskActionRequest>();
  readonly taskOpened = output<Task>();

  private menuArmed = false;

  protected armMenu(): void {
    this.menuArmed = true;
  }

  protected requestLifecycle(task: Task): void {
    this.actionRequested.emit({ action: task.status === 'running' ? 'stop' : 'start', task });
  }

  protected openTask(event: Event, task: Task): void {
    if (this.menuArmed) {
      this.menuArmed = false;
      return;
    }

    const control = (event.target as HTMLElement).closest('a, button, input');

    if (control && control !== event.currentTarget) {
      return;
    }

    this.taskOpened.emit(task);
  }
}
