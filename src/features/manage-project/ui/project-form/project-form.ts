import { Component, computed, input, output, signal } from '@angular/core';
import {
  FormField,
  form,
  max,
  min,
  pattern,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonNote } from '@ionic/angular/ion-note';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';

import { EnvironmentEditor } from '@entities/environment';
import {
  CreateProjectInput,
  DEFAULT_TASK_PORT,
  RESERVED_PROJECT_SLUGS,
  TaskDefaultsInput,
} from '@entities/project';
import { RegistryCredential, toCredentialOptions } from '@entities/registry-credential';
import { FieldStatus } from '@shared/lib/forms/field-status.directive';
import { Callout } from '@shared/ui/callout/callout';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/;

let instances = 0;

interface ProjectDraft {
  slug: string;
  name: string;
  image: string;
  port: number;
}

@Component({
  selector: 'app-project-form',
  imports: [
    Callout,
    EnvironmentEditor,
    FieldStatus,
    FormField,
    InsetGroup,
    IonInput,
    IonItem,
    IonNote,
    IonSelect,
    IonSelectOption,
  ],
  template: `
    <form novalidate [id]="formId()" (submit)="onSubmit($event)">
      @if (error(); as message) {
        <app-callout class="m-5" tone="negative" role="alert">{{ message }}</app-callout>
      }

      <app-inset-group label="Project">
        <ion-item>
          <ion-input
            label="Slug"
            labelPlacement="stacked"
            class="font-mono"
            style="font-size: 1rem"
            placeholder="my-project"
            autocomplete="off"
            autocapitalize="off"
            [spellcheck]="false"
            [formField]="draft.slug"
          />
        </ion-item>
        <ion-item>
          <ion-input
            label="Display name"
            labelPlacement="stacked"
            placeholder="Optional"
            autocomplete="off"
            [formField]="draft.name"
          />
        </ion-item>
        @if (credentialOptions(); as options) {
          <ion-item>
            <ion-select
              label="Registry credential"
              interface="popover"
              placeholder="None"
              [value]="credentialId()"
              (ionChange)="credentialId.set($event.detail.value)"
            >
              @for (option of options; track option.value) {
                <ion-select-option [value]="option.value">{{ option.label }}</ion-select-option>
              }
            </ion-select>
          </ion-item>
        }
        <ion-note>
          Tasks will live at <span class="font-mono text-label-2">{{ proxyExample() }}</span
          >. You become the owner.
        </ion-note>
      </app-inset-group>

      <app-inset-group label="Task defaults" trailing="Optional">
        <ion-item>
          <ion-input
            label="Docker image"
            labelPlacement="stacked"
            class="font-mono value-tail"
            placeholder="nginx:alpine"
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
          label="Environment variables"
          [inset]="true"
          [environment]="environment()"
          (environmentChange)="environment.set($event)"
          (errorsChange)="environmentErrors.set($event)"
        />
        <ion-note>
          These only prefill the new-task form. Every field stays editable when you create a task.
        </ion-note>
      </app-inset-group>
    </form>
  `,
})
export class ProjectForm {
  readonly creating = input(false);
  readonly error = input<string | undefined>(undefined);
  readonly credentials = input.required<readonly RegistryCredential[] | null>();
  readonly proxyHost = input('');
  readonly formId = input(`project-form-${(instances += 1)}`);
  readonly submitted = output<CreateProjectInput>();

  private readonly model = signal<ProjectDraft>({
    slug: '',
    name: '',
    image: '',
    port: DEFAULT_TASK_PORT,
  });
  protected readonly credentialId = signal('');
  protected readonly environment = signal<Record<string, string>>({});
  protected readonly environmentErrors = signal<readonly string[]>([]);

  protected readonly draft = form(this.model, (path) => {
    required(path.slug, { message: 'Enter a slug.' });
    pattern(path.slug, SLUG_PATTERN, {
      message: 'Use 1–63 lowercase letters, numbers or hyphens.',
    });
    validate(path.slug, ({ value }) => {
      const slug = value().trim();
      return (RESERVED_PROJECT_SLUGS as readonly string[]).includes(slug)
        ? { kind: 'reserved', message: `“${slug}” is reserved by the server. Pick another slug.` }
        : null;
    });
    min(path.port, 1, { message: 'Enter a port from 1 to 65535.' });
    max(path.port, 65535, { message: 'Enter a port from 1 to 65535.' });
  });

  protected readonly credentialOptions = computed(() => toCredentialOptions(this.credentials()));

  protected readonly proxyExample = computed(
    () => `${this.proxyHost()}/${this.model().slug.trim() || 'my-project'}/…`,
  );

  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (this.environmentErrors().length > 0 || this.creating()) {
      return;
    }

    void submit(this.draft, async () => {
      const draft = this.model();
      this.submitted.emit({
        slug: draft.slug.trim(),
        name: draft.name.trim() || undefined,
        registryCredentialId: this.credentialId() || undefined,
        defaults: this.defaults(),
      });
    });
  }

  private defaults(): TaskDefaultsInput {
    const draft = this.model();
    const environment = this.environment();
    const defaults: {
      -readonly [K in keyof TaskDefaultsInput]: TaskDefaultsInput[K];
    } = {};

    if (draft.image.trim()) defaults.image = draft.image.trim();
    if (draft.port !== DEFAULT_TASK_PORT) defaults.port = draft.port;
    if (Object.keys(environment).length > 0) defaults.env = environment;

    return defaults;
  }
}
