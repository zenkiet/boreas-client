import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { FormField, form, max, min, required, submit } from '@angular/forms/signals';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { IonToggle } from '@ionic/angular/ion-toggle';

import { Task, UpdateTaskInput } from '@entities/task';
import { FieldStatus } from '@shared/lib/forms/field-status.directive';
import { Callout } from '@shared/ui/callout/callout';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

let instances = 0;

interface TaskEditDraft {
  image: string;
  description: string;
  port: number;
}

@Component({
  selector: 'app-task-edit-form',
  imports: [
    Callout,
    FieldStatus,
    FormField,
    InsetGroup,
    IonInput,
    IonItem,
    IonLabel,
    IonNote,
    IonToggle,
  ],
  template: `
    <form novalidate [id]="formId()" (submit)="onSubmit($event)">
      @if (error(); as message) {
        <app-callout class="m-5" tone="negative" role="alert">{{ message }}</app-callout>
      }

      <app-inset-group label="Task" [trailing]="changeLabel()">
        <ion-item>
          <ion-label>Name</ion-label>
          <ion-note slot="end" class="name">{{ task().name }}</ion-note>
        </ion-item>
        <ion-item>
          <ion-input
            label="Description"
            labelPlacement="stacked"
            autocomplete="off"
            placeholder="One line people will recognise"
            [formField]="draft.description"
          />
        </ion-item>
      </app-inset-group>

      <app-inset-group label="Container">
        <ion-item>
          <ion-input
            class="font-mono value-tail"
            label="Docker image"
            labelPlacement="stacked"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            [formField]="draft.image"
          />
        </ion-item>
        <ion-item>
          <ion-input
            class="value-input tabular text-end"
            label="Internal port"
            type="number"
            inputmode="numeric"
            [formField]="draft.port"
          />
        </ion-item>
      </app-inset-group>

      <app-inset-group label="Apply">
        <ion-item>
          <ion-toggle [checked]="restart()" (ionChange)="restart.set($event.detail.checked)">
            Restart to apply
          </ion-toggle>
        </ion-item>
        <ion-note>
          Off: container changes wait as “pending recreate” until the next start or restart.
        </ion-note>
      </app-inset-group>

      @if (!restart() && containerChanged()) {
        <app-callout class="m-5" tone="warning" role="status">
          These changes wait until {{ task().name }} is next started or restarted. The task page
          shows it as pending.
        </app-callout>
      }
    </form>
  `,
  styles: `
    .name {
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
    }
  `,
})
export class TaskEditForm {
  private readonly uid = `task-edit-form-${(instances += 1)}`;

  readonly task = input.required<Task>();
  readonly saving = input(false);
  readonly error = input<string | undefined>(undefined);
  readonly formId = input(this.uid);
  /** Only the changed fields, PATCH-style; `{}` when nothing changed. */
  readonly submitted = output<UpdateTaskInput>();

  private seeded = false;
  private readonly model = signal<TaskEditDraft>({ image: '', description: '', port: 80 });
  protected readonly restart = signal(true);

  protected readonly draft = form(this.model, (path) => {
    required(path.image, { message: 'Enter a Docker image.' });
    min(path.port, 1, { message: 'Enter a port from 1 to 65535.' });
    max(path.port, 65535, { message: 'Enter a port from 1 to 65535.' });
  });

  private readonly changed = computed(() => {
    const draft = this.model();
    const task = this.task();

    return {
      image: draft.image.trim() !== task.image,
      description: draft.description.trim() !== (task.description ?? ''),
      port: draft.port !== task.port,
    };
  });

  private readonly changes = computed(() => Object.values(this.changed()).filter(Boolean).length);
  protected readonly dirty = computed(() => this.changes() > 0);
  protected readonly containerChanged = computed(() => this.changed().image || this.changed().port);
  protected readonly changeLabel = computed(() => {
    const count = this.changes();
    return count === 0 ? 'No changes' : count === 1 ? '1 change' : `${count} changes`;
  });

  constructor() {
    effect(() => {
      const task = this.task();
      /* Seed once; a background refresh must not wipe an in-progress draft. */
      if (this.seeded) return;
      this.seeded = true;

      untracked(() =>
        this.model.set({
          image: task.image,
          description: task.description ?? '',
          port: task.port,
        }),
      );
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (this.saving()) return;
    if (!this.dirty()) {
      this.submitted.emit({});
      return;
    }

    /* Signal Forms requires a promise-returning submit action. */
    void submit(this.draft, async () => {
      const draft = this.model();
      const task = this.task();
      const input: {
        -readonly [K in keyof UpdateTaskInput]: UpdateTaskInput[K];
      } = {};

      if (draft.image.trim() !== task.image) input.image = draft.image.trim();
      if (draft.description.trim() !== (task.description ?? '')) {
        input.description = draft.description.trim();
      }
      if (draft.port !== task.port) input.port = draft.port;

      /* auto_restart only matters when the change needs a new container. */
      if (input.image !== undefined || input.port !== undefined) {
        input.autoRestart = this.restart();
      }

      this.submitted.emit(input);
    });
  }
}
