import { Component, computed, input, output } from '@angular/core';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';

import { Task, isTransitioningTask } from '../../model/task';

export type TaskAction = 'start' | 'stop' | 'restart' | 'edit' | 'delete';

export interface TaskActionRequest {
  readonly action: TaskAction;
  readonly task: Task;
}

/** The popover dismisses itself on select, so a pick only has to emit. */
@Component({
  selector: 'app-task-menu',
  imports: [IonItem, IonLabel, IonList],
  template: `
    <ion-list [attr.aria-label]="'Actions for ' + task().name">
      @if (task().status === 'running') {
        <ion-item
          lines="full"
          class="narrow-only"
          [detail]="false"
          target="_blank"
          rel="noopener"
          [href]="accessUrl()"
        >
          <ion-label>Open task</ion-label>
          <span
            slot="end"
            class="icon-[light--arrow-up-right-from-square]"
            aria-hidden="true"
          ></span>
        </ion-item>
        <ion-item
          button
          lines="full"
          class="narrow-only"
          [detail]="false"
          [disabled]="disabled()"
          (click)="emit('stop')"
        >
          <ion-label>Stop</ion-label>
          <span slot="end" class="icon-[light--stop]" aria-hidden="true"></span>
        </ion-item>
      } @else {
        <ion-item
          button
          lines="full"
          class="narrow-only"
          [detail]="false"
          [disabled]="disabled()"
          (click)="emit('start')"
        >
          <ion-label>Start</ion-label>
          <span slot="end" class="icon-[light--play]" aria-hidden="true"></span>
        </ion-item>
      }
      <ion-item
        button
        lines="full"
        class="narrow-only"
        [detail]="false"
        [disabled]="disabled()"
        (click)="emit('restart')"
      >
        <ion-label>Restart</ion-label>
        <span slot="end" class="icon-[light--arrow-rotate-right]" aria-hidden="true"></span>
      </ion-item>
      <!-- Editing is always allowed; only the recreate it may trigger waits for a settle. -->
      <ion-item button lines="none" class="narrow-only" [detail]="false" (click)="emit('edit')">
        <ion-label>Edit task</ion-label>
        <span slot="end" class="icon-[light--pencil]" aria-hidden="true"></span>
      </ion-item>
      <ion-item
        button
        lines="none"
        class="delete"
        [detail]="false"
        [disabled]="disabled()"
        (click)="emit('delete')"
      >
        <ion-label color="danger">Delete</ion-label>
        <span slot="end" class="text-danger icon-[light--trash]" aria-hidden="true"></span>
      </ion-item>
    </ion-list>
  `,
  styles: `
    ion-item {
      --min-height: 3.125rem;
      font-size: 1.0625rem;
    }

    [class*='icon-['] {
      font-size: 1.25rem;
    }

    /* The destructive action sits apart, behind a band rather than a hairline. */
    .delete {
      border-block-start: 0.375rem solid rgba(120, 120, 128, 0.12);
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) {
      .delete {
        border-block-start: 0;
      }
    }
  `,
})
export class TaskMenu {
  readonly task = input.required<Task>();
  readonly accessUrl = input.required<string>();
  readonly pending = input.required<boolean>();
  readonly actionRequested = output<TaskActionRequest>();

  protected readonly disabled = computed(() => isTransitioningTask(this.task()) || this.pending());

  protected emit(action: TaskAction): void {
    this.actionRequested.emit({ action, task: this.task() });
  }
}
