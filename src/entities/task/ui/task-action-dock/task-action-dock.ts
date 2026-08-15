import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { SlideToConfirm } from '@shared/ui/slide-to-confirm/slide-to-confirm';
import { Task } from '../../model/task';
import { TaskActionRequest } from '../task-actions/task-actions';

@Component({
  selector: 'app-task-action-dock',
  imports: [GlassIconButton, SlideToConfirm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dock">
      @if (task().status === 'running') {
        <div class="dock__item">
          <a
            appGlassIconButton
            icon="@tui.external-link"
            rel="noopener"
            target="_blank"
            aria-label="Open task"
            [href]="accessUrl()"
          ></a>
          <span class="dock__label">Open</span>
        </div>
        <div class="dock__item">
          <button
            appGlassIconButton
            icon="@tui.square"
            type="button"
            aria-label="Stop"
            [disabled]="pending()"
            (click)="request('stop')"
          ></button>
          <span class="dock__label">Stop</span>
        </div>
      } @else {
        <div class="dock__item">
          <button
            appGlassIconButton
            icon="@tui.play"
            type="button"
            aria-label="Start"
            [disabled]="pending()"
            (click)="request('start')"
          ></button>
          <span class="dock__label">Start</span>
        </div>
      }
      <div class="dock__item">
        <button
          appGlassIconButton
          icon="@tui.rotate-cw"
          type="button"
          aria-label="Restart"
          [disabled]="pending()"
          (click)="request('restart')"
        ></button>
        <span class="dock__label">Restart</span>
      </div>
    </div>

    <app-slide-to-confirm
      class="dock__delete"
      label="Slide to delete"
      [disabled]="pending()"
      (confirmed)="request('delete')"
    />
  `,
  styles: `
    .dock {
      display: flex;
      justify-content: space-evenly;
      gap: 0.5rem;
      padding-block: 0.25rem 1rem;
    }

    .dock__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375rem;
    }

    .dock__label {
      font-size: 0.75rem;
      color: var(--tui-text-secondary);
    }

    .dock__delete {
      display: block;
    }
  `,
})
export class TaskActionDock {
  readonly task = input.required<Task>();
  readonly accessUrl = input.required<string>();
  readonly pending = input(false);
  readonly actionRequested = output<TaskActionRequest>();

  protected request(action: TaskActionRequest['action']): void {
    this.actionRequested.emit({ action, task: this.task() });
  }
}
