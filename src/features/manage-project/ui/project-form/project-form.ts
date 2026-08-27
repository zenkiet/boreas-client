import { Component, computed, input, output, signal } from '@angular/core';
import { FormField, form, max, min, pattern, required, submit } from '@angular/forms/signals';
import { TuiButton, TuiError, TuiIcon, TuiLoader } from '@taiga-ui/core';

import { EnvironmentEditor } from '@entities/environment';
import {
  CreateProjectInput,
  DEFAULT_TASK_PORT,
  RESERVED_PROJECT_SLUGS,
  TaskDefaultsInput,
} from '@entities/project';
import { RegistryCredential, toCredentialOptions } from '@entities/registry-credential';
import { fieldError } from '@shared/lib/forms/field-error';
import { Callout } from '@shared/ui/callout/callout';
import { GlassSelect } from '@shared/ui/glass-select/glass-select';
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
    FormField,
    GlassSelect,
    InsetGroup,
    TuiButton,
    TuiError,
    TuiIcon,
    TuiLoader,
  ],
  template: `
    <form class="grid grid-cols-1 gap-3.5" novalidate [id]="formId()" (submit)="onSubmit($event)">
      @if (error(); as message) {
        <app-callout tone="negative" role="alert">{{ message }}</app-callout>
      }

      <div>
        <app-inset-group label="Project">
          <div class="frow row-divider relative">
            <label class="frow__label" [for]="ids.slug">Slug</label>
            <input
              class="frow__input font-mono"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="my-project"
              [id]="ids.slug"
              [formField]="draft.slug"
            />
            @if (slugError(); as message) {
              <tui-error [error]="message" />
            }
          </div>

          <div class="frow row-divider relative">
            <label class="frow__label" [for]="ids.name">Display name</label>
            <input
              class="frow__input"
              autocomplete="off"
              placeholder="Optional"
              [id]="ids.name"
              [formField]="draft.name"
            />
          </div>

          @if (credentialOptions(); as options) {
            <div class="frow frow--inline row-divider relative">
              <span class="frow__inline-label">Registry credential</span>
              <app-glass-select
                ariaLabel="Registry credential"
                placeholder="None"
                [options]="options"
                [value]="credentialId()"
                (valueChange)="credentialId.set($event)"
              />
            </div>
          }
        </app-inset-group>
        <p class="footnote">
          The slug becomes the first URL segment for every task in this project. You become the
          project owner.
        </p>
      </div>

      <div>
        <app-inset-group label="Task defaults" trailing="Optional">
          <div class="frow row-divider relative">
            <label class="frow__label" [for]="ids.image">Docker image</label>
            <input
              class="frow__input font-mono"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="nginx:alpine"
              [id]="ids.image"
              [formField]="draft.image"
            />
          </div>

          <div class="frow frow--inline row-divider relative">
            <label class="frow__inline-label" [for]="ids.port">Internal port</label>
            <input
              class="frow__input frow__input--end"
              type="number"
              inputmode="numeric"
              [id]="ids.port"
              [formField]="draft.port"
            />
          </div>
          @if (portError(); as message) {
            <div class="frow__trailing-error">
              <tui-error [error]="message" />
            </div>
          }

          <div class="form__pad row-divider relative">
            <app-environment-editor
              [environment]="environment()"
              (environmentChange)="environment.set($event)"
              (errorsChange)="environmentErrors.set($event)"
            />
          </div>
        </app-inset-group>
        <p class="footnote">
          These only prefill the new-task form. Tasks are never changed on their own, and every
          field stays editable when you create one.
        </p>
      </div>

      <div class="hidden md:flex md:justify-end">
        <button
          tuiButton
          type="submit"
          size="m"
          appearance="primary"
          [disabled]="creating() || environmentErrors().length > 0"
        >
          @if (creating()) {
            <tui-loader size="s" [inheritColor]="true" />
            Creating
          } @else {
            <tui-icon class="icon-sm" icon="@tui.plus" />
            Create project
          }
        </button>
      </div>
    </form>
  `,
  styles: `
    .frow--inline {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-block-size: 3rem;
    }

    .frow__input {
      inline-size: 100%;
      margin: 0;
      border: 0;
      padding: 0;
      background: none;
      font-size: 1.0625rem;
      color: var(--tui-text-primary);
    }

    /* Local, not shared: it must outrank the .frow__input above it. */
    .frow__input--end {
      inline-size: 7ch;
      flex: none;
      text-align: end;
      font-variant-numeric: tabular-nums;
    }

    .frow__input:focus {
      outline: none;
    }

    .frow__input::placeholder {
      color: var(--tui-text-tertiary);
      opacity: 0.6;
    }

    .form__pad {
      padding: 0.875rem 1rem;
    }
  `,
})
export class ProjectForm {
  private readonly uid = `project-form-${(instances += 1)}`;

  readonly creating = input(false);
  readonly error = input<string | undefined>(undefined);
  readonly credentials = input.required<readonly RegistryCredential[] | null>();
  readonly formId = input(this.uid);
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
  private readonly reservedError = signal<string | null>(null);

  protected readonly draft = form(this.model, (path) => {
    required(path.slug, { message: 'Slug is required.' });
    pattern(path.slug, SLUG_PATTERN, {
      message: 'Use 1–63 lowercase letters, numbers or hyphens.',
    });
    min(path.port, 1, { message: 'Internal port must be between 1 and 65535.' });
    max(path.port, 65535, { message: 'Internal port must be between 1 and 65535.' });
  });

  protected readonly ids = {
    slug: `${this.uid}-slug`,
    name: `${this.uid}-name`,
    image: `${this.uid}-image`,
    port: `${this.uid}-port`,
  };

  protected readonly credentialOptions = computed(() => toCredentialOptions(this.credentials()));

  protected readonly slugError = computed(() => {
    const state = this.draft.slug();
    if (!state.touched()) return this.reservedError();
    return state.errors()[0]?.message ?? this.reservedError();
  });

  protected readonly portError = computed(() => fieldError(this.draft.port()));

  protected onSubmit(event: Event): void {
    event.preventDefault();

    if (this.environmentErrors().length > 0 || this.creating()) {
      return;
    }

    const slug = this.model().slug.trim();
    if ((RESERVED_PROJECT_SLUGS as readonly string[]).includes(slug)) {
      this.reservedError.set(`“${slug}” is reserved by the server. Pick another slug.`);
      return;
    }

    this.reservedError.set(null);

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
