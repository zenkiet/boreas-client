import { Component, computed, inject, input, output } from '@angular/core';
import { TuiDataList, TuiDropdownDriver, TuiOptGroup, TuiOption } from '@taiga-ui/core';

import { Task, isTransitioningTask } from '../../model/task';
import { TaskAction, TaskActionRequest } from '../task-actions/task-actions';

@Component({
  selector: 'app-task-menu',
  imports: [TuiDataList, TuiOptGroup, TuiOption],
  template: `
    <tui-data-list [attr.aria-label]="'Actions for ' + task().name">
      <tui-opt-group [label]="task().name">
        @if (task().status === 'running') {
          <a
            tuiOption
            iconEnd="@tui.external-link"
            target="_blank"
            rel="noopener"
            [href]="accessUrl()"
          >
            Open task
          </a>
          <button
            tuiOption
            type="button"
            iconEnd="@tui.square"
            [disabled]="disabled()"
            (click)="emit('stop')"
          >
            Stop
          </button>
        } @else {
          <button
            tuiOption
            type="button"
            iconEnd="@tui.play"
            [disabled]="disabled()"
            (click)="emit('start')"
          >
            Start
          </button>
        }

        <button
          tuiOption
          type="button"
          iconEnd="@tui.rotate-cw"
          [disabled]="disabled()"
          (click)="emit('restart')"
        >
          Restart
        </button>

        <!-- Editing is always allowed; only the recreate it may trigger waits for a settle. -->
        <button tuiOption type="button" iconEnd="@tui.pencil" (click)="emit('edit')">
          Edit task
        </button>
      </tui-opt-group>

      <!-- Its own group, so the separator does the work a colour alone cannot. -->
      <tui-opt-group>
        <button
          tuiOption
          type="button"
          class="menu__destructive"
          iconEnd="@tui.trash-2"
          [disabled]="disabled()"
          (click)="emit('delete')"
        >
          Delete
        </button>
      </tui-opt-group>
    </tui-data-list>
  `,
  styles: `
    tui-data-list {
      inline-size: 14rem;
    }

    /* Match iOS trailing icons; Taiga packs labels and icons at the start. */
    [tuiOption] {
      justify-content: space-between;
    }

    .menu__destructive {
      color: var(--tui-status-negative);
    }
  `,
})
export class TaskMenu {
  private readonly dropdown = inject(TuiDropdownDriver, { optional: true });

  readonly task = input.required<Task>();
  readonly accessUrl = input.required<string>();
  readonly pending = input.required<boolean>();
  readonly actionRequested = output<TaskActionRequest>();

  protected readonly disabled = computed(() => isTransitioningTask(this.task()) || this.pending());

  protected emit(action: TaskAction): void {
    this.actionRequested.emit({ action, task: this.task() });
    this.dropdown?.next(false);
  }
}
