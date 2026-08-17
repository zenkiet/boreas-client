import { Component, computed, input, output } from '@angular/core';
import { TuiButton, TuiHint, TuiIcon, TuiLoader } from '@taiga-ui/core';

import { Task, isTransitioningTask } from '../../model/task';

export type TaskAction = 'start' | 'stop' | 'restart' | 'edit' | 'delete';

export interface TaskActionRequest {
  readonly action: TaskAction;
  readonly task: Task;
}

@Component({
  selector: 'app-task-actions',
  imports: [TuiButton, TuiHint, TuiIcon, TuiLoader],
  template: `
    <div
      class="flex items-center justify-end gap-0.5"
      [attr.aria-label]="'Actions for ' + task().name"
    >
      @if (task().status === 'running') {
        <a
          tuiIconButton
          size="s"
          appearance="flat-grayscale"
          target="_blank"
          rel="noopener"
          [href]="accessUrl()"
          [tuiHint]="'Open task'"
          [attr.aria-label]="'Open ' + task().name"
        >
          <tui-icon class="icon-sm" icon="@tui.external-link" />
        </a>
        <button
          tuiIconButton
          type="button"
          size="s"
          appearance="secondary"
          [disabled]="disabled()"
          [tuiHint]="disabledReason() || 'Stop task'"
          [attr.aria-label]="'Stop ' + task().name"
          (click)="emitAction('stop')"
        >
          <!-- Reusing the lifecycle slot prevents pending rows from widening the action column. -->
          @if (pending()) {
            <tui-loader size="s" [inheritColor]="true" aria-label="Task action in progress" />
          } @else {
            <tui-icon class="icon-sm" icon="@tui.square" />
          }
        </button>
      } @else {
        <button
          tuiIconButton
          type="button"
          size="s"
          appearance="secondary"
          [disabled]="disabled()"
          [tuiHint]="disabledReason() || 'Start task'"
          [attr.aria-label]="'Start ' + task().name"
          (click)="emitAction('start')"
        >
          @if (pending()) {
            <tui-loader size="s" [inheritColor]="true" aria-label="Task action in progress" />
          } @else {
            <tui-icon class="icon-sm" icon="@tui.play" />
          }
        </button>
      }

      <button
        tuiIconButton
        type="button"
        size="s"
        appearance="flat-grayscale"
        [disabled]="disabled()"
        [tuiHint]="disabledReason() || 'Restart task'"
        [attr.aria-label]="'Restart ' + task().name"
        (click)="emitAction('restart')"
      >
        <tui-icon class="icon-sm" icon="@tui.rotate-cw" />
      </button>
      <button
        tuiIconButton
        type="button"
        size="s"
        appearance="flat-destructive"
        [disabled]="disabled()"
        [tuiHint]="disabledReason() || 'Delete task'"
        [attr.aria-label]="'Delete ' + task().name"
        (click)="emitAction('delete')"
      >
        <tui-icon class="icon-sm" icon="@tui.trash-2" />
      </button>
    </div>
  `,
})
export class TaskActions {
  readonly task = input.required<Task>();
  readonly accessUrl = input.required<string>();
  readonly pending = input.required<boolean>();
  readonly actionRequested = output<TaskActionRequest>();

  protected readonly disabled = computed(() => isTransitioningTask(this.task()) || this.pending());

  protected readonly disabledReason = computed(() => {
    if (isTransitioningTask(this.task())) {
      return `Task is ${this.task().status}. Actions are unavailable until the transition finishes.`;
    }

    return this.pending() ? 'Another action is in progress for this task.' : '';
  });

  protected emitAction(action: TaskAction): void {
    this.actionRequested.emit({ action, task: this.task() });
  }
}
