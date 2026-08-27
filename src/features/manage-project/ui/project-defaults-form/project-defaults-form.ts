import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { FormField, form, max, min, submit } from '@angular/forms/signals';
import { TuiButton, TuiError, TuiLoader } from '@taiga-ui/core';

import { EnvironmentEditor } from '@entities/environment';
import { TaskDefaults, TaskDefaultsInput } from '@entities/project';
import { fieldError } from '@shared/lib/forms/field-error';

let instances = 0;

interface DefaultsDraft {
  image: string;
  port: number;
}

@Component({
  selector: 'app-project-defaults-form',
  imports: [EnvironmentEditor, FormField, TuiButton, TuiError, TuiLoader],
  template: `
    <div class="frow row-divider relative">
      <label class="frow__label" [for]="ids.image">Docker image</label>
      <input
        class="frow__input font-mono"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        placeholder="Not set"
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

    <div class="pad row-divider relative">
      <app-environment-editor
        [environment]="environment()"
        [resetKey]="envResetKey()"
        (environmentChange)="environment.set($event)"
        (errorsChange)="environmentErrors.set($event)"
      />
    </div>

    @if (dirty()) {
      <div class="actions row-divider relative">
        <button
          tuiButton
          type="button"
          size="s"
          appearance="primary"
          [disabled]="busy() || environmentErrors().length > 0"
          (click)="save()"
        >
          @if (busy()) {
            <tui-loader size="s" [inheritColor]="true" />
            Saving
          } @else {
            Save
          }
        </button>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

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

    .pad {
      padding: 0.875rem 1rem;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      padding: 0.75rem 1rem;
    }
  `,
})
export class ProjectDefaultsForm {
  private readonly uid = `project-defaults-${(instances += 1)}`;

  readonly defaults = input.required<TaskDefaults>();
  readonly busy = input(false);
  readonly submitted = output<TaskDefaultsInput>();

  private seeded = false;
  private readonly model = signal<DefaultsDraft>({ image: '', port: 80 });
  protected readonly environment = signal<Record<string, string>>({});
  protected readonly environmentErrors = signal<readonly string[]>([]);
  protected readonly envResetKey = signal(0);

  protected readonly draft = form(this.model, (path) => {
    min(path.port, 1, { message: 'Internal port must be between 1 and 65535.' });
    max(path.port, 65535, { message: 'Internal port must be between 1 and 65535.' });
  });

  protected readonly ids = {
    image: `${this.uid}-image`,
    port: `${this.uid}-port`,
  };

  protected readonly portError = computed(() => fieldError(this.draft.port()));

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
