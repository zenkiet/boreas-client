import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { FormField, form, max, min, required, submit } from '@angular/forms/signals';
import { TuiButton, TuiError, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiSwitch } from '@taiga-ui/kit';

import { Task, UpdateTaskInput } from '@entities/task';
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
  imports: [Callout, FormField, InsetGroup, TuiButton, TuiError, TuiIcon, TuiLoader, TuiSwitch],
  template: `
    <form class="grid grid-cols-1 gap-3.5" novalidate [id]="formId()" (submit)="onSubmit($event)">
      @if (error(); as message) {
        <app-callout tone="negative" role="alert">{{ message }}</app-callout>
      }

      <div>
        <app-inset-group label="Container">
          <div class="frow frow--inline row-divider relative">
            <span class="frow__inline-label">Name</span>
            <span class="frow__readonly font-mono">{{ task().name }}</span>
          </div>

          <div class="frow row-divider relative">
            <label class="frow__label" [for]="ids.image">Docker image</label>
            <input
              class="frow__input"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
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
        <p class="form__footnote">
          The name is the proxy URL and cannot change. Changing the image or port recreates the
          container; editing only the description leaves it untouched.
        </p>
      </div>

      <div>
        <app-inset-group label="Apply">
          <label class="frow frow--inline row-divider relative">
            <span class="frow__inline-label">Restart to apply</span>
            <input
              type="checkbox"
              tuiSwitch
              [checked]="restart()"
              (change)="toggleRestart($event)"
            />
          </label>
        </app-inset-group>
        <p class="form__footnote">
          Off: container changes wait as “pending recreate” until the next start or restart.
        </p>
      </div>

      <div class="hidden md:flex md:justify-end">
        <button
          tuiButton
          type="submit"
          size="m"
          appearance="primary"
          [disabled]="saving() || !dirty()"
        >
          @if (saving()) {
            <tui-loader size="s" [inheritColor]="true" />
            Saving
          } @else {
            <tui-icon class="icon-sm" icon="@tui.check" />
            Save changes
          }
        </button>
      </div>
    </form>
  `,
  styles: `
    .frow {
      display: grid;
      gap: 0.125rem;
      padding: 0.625rem 1rem;
      transition: background-color var(--tui-duration);
    }

    .frow:focus-within {
      background: var(--tui-background-neutral-1);
    }

    .frow--inline {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-block-size: 3rem;
    }

    .frow__label {
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    .frow__inline-label {
      flex: 1;
      font-size: 1.0625rem;
      color: var(--tui-text-primary);
    }

    .frow__readonly {
      font-size: 1rem;
      color: var(--tui-text-tertiary);
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

    .frow__input:focus {
      outline: none;
    }

    .frow__input::placeholder {
      color: var(--tui-text-tertiary);
      opacity: 0.6;
    }

    .frow__input--end {
      inline-size: 7ch;
      flex: none;
      text-align: end;
      font-variant-numeric: tabular-nums;
    }

    .frow__input[type='number']::-webkit-inner-spin-button,
    .frow__input[type='number']::-webkit-outer-spin-button {
      appearance: none;
      margin: 0;
    }

    .frow__input[type='number'] {
      -moz-appearance: textfield;
      appearance: textfield;
    }

    .frow__trailing-error {
      padding: 0 1rem 0.625rem;
    }

    .form__footnote {
      margin: 0;
      padding: 0.5rem 1rem 0;
      font-size: 0.8125rem;
      line-height: 1.5;
      color: var(--tui-text-tertiary);
    }
  `,
})
export class TaskEditForm {
  private readonly uid = `task-edit-form-${(instances += 1)}`;

  readonly task = input.required<Task>();
  readonly saving = input(false);
  readonly error = input<string | undefined>(undefined);
  readonly formId = input(this.uid);
  /** Emits only the fields that differ from the task, PATCH-style. */
  readonly submitted = output<UpdateTaskInput>();

  private seeded = false;
  private readonly model = signal<TaskEditDraft>({ image: '', description: '', port: 80 });
  protected readonly restart = signal(true);

  protected readonly draft = form(this.model, (path) => {
    required(path.image, { message: 'Docker image is required.' });
    min(path.port, 1, { message: 'Internal port must be between 1 and 65535.' });
    max(path.port, 65535, { message: 'Internal port must be between 1 and 65535.' });
  });

  protected readonly ids = {
    image: `${this.uid}-image`,
    description: `${this.uid}-description`,
    port: `${this.uid}-port`,
  };

  protected readonly imageError = computed(() => this.firstError(this.draft.image()));
  protected readonly portError = computed(() => this.firstError(this.draft.port()));

  protected readonly dirty = computed(() => {
    const draft = this.model();
    const task = this.task();

    return (
      draft.image.trim() !== task.image ||
      draft.description.trim() !== (task.description ?? '') ||
      draft.port !== task.port
    );
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

  protected toggleRestart(event: Event): void {
    this.restart.set((event.target as HTMLInputElement).checked);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    /* The app-bar submitter cannot expose the desktop button's disabled state. */
    if (this.saving() || !this.dirty()) {
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

  /* tui-error renders a generic fallback for any non-null empty value. */
  private firstError(state: {
    touched: () => boolean;
    errors: () => readonly { readonly message?: string }[];
  }): string | null {
    if (!state.touched()) return null;
    return state.errors()[0]?.message ?? null;
  }
}
