import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { FormField, form, max, min, pattern, required, submit } from '@angular/forms/signals';
import { TuiButton, TuiError, TuiIcon, TuiLoader } from '@taiga-ui/core';

import { EnvironmentEditor } from '@entities/environment';
import { TaskDefaults } from '@entities/project';
import { CreateTaskInput } from '@entities/task';
import { fieldError } from '@shared/lib/forms/field-error';
import { Callout } from '@shared/ui/callout/callout';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

const TASK_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/;

const DEFAULT_PORT = 80;

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
    FormField,
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
        <app-inset-group label="Container">
          <div class="frow row-divider relative">
            <label class="frow__label" [for]="ids.name">Task name</label>
            <input
              class="frow__input"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="api-preview"
              [id]="ids.name"
              [formField]="draft.name"
            />
            @if (nameError(); as message) {
              <tui-error [error]="message" />
            }
          </div>

          <div class="frow row-divider relative">
            <label class="frow__label" [for]="ids.image">Docker image</label>
            <input
              class="frow__input"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder="nginx:alpine"
              [id]="ids.image"
              [formField]="draft.image"
            />
            @if (imageError(); as message) {
              <tui-error [error]="message" />
            }
          </div>

          <div class="frow row-divider relative">
            <label class="frow__label" [for]="ids.description">Description</label>
            <input
              class="frow__input frow__input--text"
              autocomplete="off"
              placeholder="Optional"
              [id]="ids.description"
              [formField]="draft.description"
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
        </app-inset-group>
        <p class="footnote">
          The name becomes part of the proxy URL and stays unique within the project. The image is
          any reference Docker can pull; the port is what the process listens on inside the
          container.
          @if (prefilled()) {
            Values below start from this project's defaults.
          }
        </p>
      </div>

      <div>
        <app-inset-group label="Environment variables">
          <div class="form__pad">
            <app-environment-editor
              [environment]="environment()"
              (environmentChange)="environment.set($event)"
              (errorsChange)="environmentErrors.set($event)"
            />
          </div>
        </app-inset-group>
        <p class="footnote">Optional. Values replace the whole map when applied.</p>
      </div>

      <!-- Malformed .env text would otherwise be silently omitted from submission. -->
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
            Create task
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
      font-family: var(--app-font-mono);
      font-size: 1.0625rem;
      color: var(--tui-text-primary);
    }

    /* Prose, not an identifier. */
    .frow__input--text {
      font-family: var(--tui-typography-family-text);
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
export class TaskForm {
  private readonly uid = `task-form-${(instances += 1)}`;

  readonly creating = input(false);
  readonly error = input<string | undefined>(undefined);
  readonly defaults = input<TaskDefaults | null>(null);
  readonly formId = input(this.uid);
  readonly submitted = output<CreateTaskInput>();

  private seeded = false;
  private readonly model = signal<TaskDraft>({
    name: '',
    image: '',
    port: DEFAULT_PORT,
    description: '',
  });

  protected readonly draft = form(this.model, (path) => {
    required(path.name, { message: 'Task name is required.' });
    pattern(path.name, TASK_NAME_PATTERN, {
      message: 'Use 1–63 letters, numbers, dots, underscores or hyphens.',
    });
    required(path.image, { message: 'Docker image is required.' });
    min(path.port, 1, { message: 'Internal port must be between 1 and 65535.' });
    max(path.port, 65535, { message: 'Internal port must be between 1 and 65535.' });
  });

  protected readonly environment = signal<Record<string, string>>({});
  protected readonly environmentErrors = signal<readonly string[]>([]);
  protected readonly prefilled = signal(false);

  protected readonly ids = {
    name: `${this.uid}-name`,
    image: `${this.uid}-image`,
    description: `${this.uid}-description`,
    port: `${this.uid}-port`,
  };

  constructor() {
    effect(() => {
      const defaults = this.defaults();
      /* Seed once: the presets land after the form is already on screen. */
      if (!defaults || this.seeded) return;
      this.seeded = true;

      untracked(() => this.seed(defaults));
    });
  }

  protected readonly nameError = computed(() => fieldError(this.draft.name()));
  protected readonly imageError = computed(() => fieldError(this.draft.image()));
  protected readonly portError = computed(() => fieldError(this.draft.port()));

  protected onSubmit(event: Event): void {
    event.preventDefault();

    /* The app-bar submitter cannot expose the desktop button's disabled state. */
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
      });
    });
  }

  private seed(defaults: TaskDefaults): void {
    const draft = this.model();
    const image = draft.image || defaults.image;
    const port = draft.port === DEFAULT_PORT ? defaults.port : draft.port;
    const seedEnv =
      Object.keys(this.environment()).length === 0 && Object.keys(defaults.env).length > 0;

    this.model.set({ ...draft, image, port });
    if (seedEnv) this.environment.set({ ...defaults.env });
    this.prefilled.set(image !== draft.image || port !== draft.port || seedEnv);
  }
}
