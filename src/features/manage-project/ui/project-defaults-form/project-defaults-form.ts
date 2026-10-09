import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { FormField, form, max, min, submit } from '@angular/forms/signals';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonSpinner } from '@ionic/angular/ion-spinner';

import { EnvironmentEditor } from '@entities/environment';
import { TaskDefaults, TaskDefaultsInput } from '@entities/project';
import { FieldStatus } from '@shared/lib/forms/field-status.directive';

interface DefaultsDraft {
  image: string;
  port: number;
}

@Component({
  selector: 'app-project-defaults-form',
  imports: [EnvironmentEditor, FieldStatus, FormField, IonInput, IonItem, IonLabel, IonSpinner],
  template: `
    <ion-item>
      <ion-input
        label="Docker image"
        labelPlacement="stacked"
        class="font-mono value-tail"
        placeholder="Not set"
        autocomplete="off"
        autocapitalize="off"
        [spellcheck]="false"
        [formField]="draft.image"
      />
    </ion-item>

    <ion-item>
      <ion-input
        label="Internal port"
        type="number"
        inputmode="numeric"
        class="value-input tabular text-end"
        [formField]="draft.port"
      />
    </ion-item>

    <app-environment-editor
      [label]="envCaption()"
      [inset]="true"
      [environment]="environment()"
      [resetKey]="envResetKey()"
      (environmentChange)="environment.set($event)"
      (errorsChange)="environmentErrors.set($event)"
    />

    @if (dirty()) {
      <ion-item
        button
        [detail]="false"
        [disabled]="busy() || environmentErrors().length > 0"
        (click)="save()"
      >
        <ion-label color="primary">{{ busy() ? 'Saving' : 'Save' }}</ion-label>
        @if (busy()) {
          <ion-spinner slot="end" name="lines-small" aria-hidden="true" />
        }
      </ion-item>
    }
  `,
})
export class ProjectDefaultsForm {
  readonly defaults = input.required<TaskDefaults>();
  readonly busy = input(false);
  readonly submitted = output<TaskDefaultsInput>();

  private seeded = false;
  private readonly model = signal<DefaultsDraft>({ image: '', port: 80 });
  protected readonly environment = signal<Record<string, string>>({});
  protected readonly environmentErrors = signal<readonly string[]>([]);
  protected readonly envResetKey = signal(0);

  protected readonly envCaption = computed(() => {
    const count = Object.keys(this.environment()).length;
    if (count === 0) return 'Environment';
    return `Environment · ${count} ${count === 1 ? 'variable' : 'variables'}`;
  });

  protected readonly draft = form(this.model, (path) => {
    min(path.port, 1, { message: 'Enter a port from 1 to 65535.' });
    max(path.port, 65535, { message: 'Enter a port from 1 to 65535.' });
  });

  protected readonly dirty = computed(() => {
    const draft = this.model();
    const defaults = this.defaults();

    return (
      draft.image.trim() !== defaults.image ||
      draft.port !== defaults.port ||
      !sameEnv(this.environment(), defaults.env)
    );
  });

  constructor() {
    effect(() => {
      const defaults = this.defaults();

      untracked(() => {
        if (this.seeded && this.dirty()) return;
        this.seed(defaults);
      });
    });
  }

  protected save(): void {
    if (this.busy() || !this.dirty() || this.environmentErrors().length > 0) return;

    void submit(this.draft, async () => {
      const draft = this.model();
      const defaults = this.defaults();
      const environment = this.environment();
      const input: {
        -readonly [K in keyof TaskDefaultsInput]: TaskDefaultsInput[K];
      } = {};

      if (draft.image.trim() !== defaults.image) input.image = draft.image.trim();
      if (draft.port !== defaults.port) input.port = draft.port;
      if (!sameEnv(environment, defaults.env)) input.env = environment;

      this.submitted.emit(input);
    });
  }

  private seed(defaults: TaskDefaults): void {
    this.seeded = true;
    this.draft().reset({ image: defaults.image, port: defaults.port });
    this.environment.set({ ...defaults.env });
    this.environmentErrors.set([]);
    this.envResetKey.update((key) => key + 1);
  }
}

function sameEnv(
  a: Readonly<Record<string, string>>,
  b: Readonly<Record<string, string>>,
): boolean {
  const keys = Object.keys(a);

  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}
