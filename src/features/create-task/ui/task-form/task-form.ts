import { Component, effect, input, output, signal, untracked } from '@angular/core';
import { FormField, form, max, min, pattern, required, submit } from '@angular/forms/signals';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonNote } from '@ionic/angular/ion-note';

import { EnvironmentEditor } from '@entities/environment';
import { DEFAULT_TASK_PORT, TaskDefaults } from '@entities/project';
import { CreateTaskInput, TaskVolumes } from '@entities/task';
import { FieldStatus } from '@shared/lib/forms/field-status.directive';
import { Callout } from '@shared/ui/callout/callout';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

const TASK_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/;

let instances = 0;

interface TaskDraft {
  name: string;
  image: string;
  port: number;
  description: string;
}

@Component({
  selector: 'app-task-form',
  imports: [
    Callout,
    EnvironmentEditor,
    FieldStatus,
    FormField,
    InsetGroup,
    IonInput,
    IonItem,
    IonNote,
    TaskVolumes,
  ],
  template: `
    <form novalidate [id]="formId()" (submit)="onSubmit($event)">
      @if (error(); as message) {
        <app-callout class="m-5" tone="negative" role="alert">{{ message }}</app-callout>
      }

      <app-inset-group label="Task">
        <ion-item>
          <ion-input
            class="font-mono"
            style="font-size: 1rem"
            label="Name"
            labelPlacement="stacked"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="e.g. api-preview"
            [formField]="draft.name"
          />
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
        <ion-note>The name can’t change later.</ion-note>
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
            placeholder="nginx:alpine"
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

      <app-task-volumes
        [editable]="true"
        [volumes]="volumes()"
        [folders]="folders()"
        (volumesChange)="volumes.set($event)"
      />

      <app-inset-group label="Environment variables">
        <app-environment-editor
          [footer]="true"
          [environment]="environment()"
          (environmentChange)="environment.set($event)"
          (errorsChange)="environmentErrors.set($event)"
        />
      </app-inset-group>
    </form>
  `,
})
export class TaskForm {
  private readonly uid = `task-form-${(instances += 1)}`;

  readonly creating = input(false);
  readonly error = input<string | undefined>(undefined);
  readonly defaults = input<TaskDefaults | null>(null);
  readonly folders = input<readonly string[]>([]);
  readonly formId = input(this.uid);
  readonly submitted = output<CreateTaskInput>();

  private seeded = false;
  private readonly model = signal<TaskDraft>({
    name: '',
    image: '',
    port: DEFAULT_TASK_PORT,
    description: '',
  });

  protected readonly draft = form(this.model, (path) => {
    required(path.name, { message: 'Enter a task name.' });
    pattern(path.name, TASK_NAME_PATTERN, {
      message: 'Use 1–63 letters, numbers, dots, underscores or hyphens.',
    });
    required(path.image, { message: 'Enter a Docker image.' });
    min(path.port, 1, { message: 'Enter a port from 1 to 65535.' });
    max(path.port, 65535, { message: 'Enter a port from 1 to 65535.' });
  });

  protected readonly environment = signal<Record<string, string>>({});
  protected readonly volumes = signal<Readonly<Record<string, string>>>({});
  protected readonly environmentErrors = signal<readonly string[]>([]);

  constructor() {
    effect(() => {
      const defaults = this.defaults();
      /* Seed once: the presets land after the form is already on screen. */
      if (!defaults || this.seeded) return;
      this.seeded = true;

      untracked(() => this.seed(defaults));
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    /* The toolbar submitter cannot reflect env errors, so malformed .env text stops here. */
    if (this.environmentErrors().length > 0 || this.creating()) {
      return;
    }

    /* Signal Forms requires a promise-returning submit action. */
    void submit(this.draft, async () => {
      const draft = this.model();
      const environment = this.environment();
      this.submitted.emit({
        name: draft.name.trim(),
        image: draft.image.trim(),
        port: draft.port,
        description: draft.description.trim() || undefined,
        environment,
        volumes: this.volumes(),
      });
    });
  }

  private seed(defaults: TaskDefaults): void {
    const draft = this.model();
    const image = draft.image || defaults.image;
    const port = draft.port === DEFAULT_TASK_PORT ? defaults.port : draft.port;
    const seedEnv =
      Object.keys(this.environment()).length === 0 && Object.keys(defaults.env).length > 0;

    this.model.set({ ...draft, image, port });
    if (seedEnv) this.environment.set({ ...defaults.env });
  }
}
