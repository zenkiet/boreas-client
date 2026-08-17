import { Component, computed, input, output, signal } from '@angular/core';
import { FormField, form, pattern, required, submit } from '@angular/forms/signals';
import { TuiButton, TuiError, TuiIcon, TuiLoader } from '@taiga-ui/core';

import { CreateProjectInput, RESERVED_PROJECT_SLUGS } from '@entities/project';
import { RegistryCredential } from '@entities/registry-credential';
import { Callout } from '@shared/ui/callout/callout';
import { GlassSelect, GlassSelectOption } from '@shared/ui/glass-select/glass-select';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}$/;

let instances = 0;

interface ProjectDraft {
  slug: string;
  name: string;
}

@Component({
  selector: 'app-project-form',
  imports: [Callout, FormField, GlassSelect, InsetGroup, TuiButton, TuiError, TuiIcon, TuiLoader],
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
        <p class="form__footnote">
          The slug becomes the first URL segment for every task in this project. You become the
          project owner.
        </p>
      </div>

      <div class="hidden md:flex md:justify-end">
        <button tuiButton type="submit" size="m" appearance="primary" [disabled]="creating()">
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

    .frow__input {
      inline-size: 100%;
      margin: 0;
      border: 0;
      padding: 0;
      background: none;
      font-size: 1.0625rem;
      color: var(--tui-text-primary);
    }

    .frow__input:focus {
      outline: none;
    }

    .frow__input::placeholder {
      color: var(--tui-text-tertiary);
      opacity: 0.6;
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
export class ProjectForm {
  private readonly uid = `project-form-${(instances += 1)}`;

  readonly creating = input(false);
  readonly error = input<string | undefined>(undefined);
  /** null when the viewer may not list credentials; the row is hidden. */
  readonly credentials = input.required<readonly RegistryCredential[] | null>();
  readonly formId = input(this.uid);
  readonly submitted = output<CreateProjectInput>();

  private readonly model = signal<ProjectDraft>({ slug: '', name: '' });
  protected readonly credentialId = signal('');
  private readonly reservedError = signal<string | null>(null);

  protected readonly draft = form(this.model, (path) => {
    required(path.slug, { message: 'Slug is required.' });
    pattern(path.slug, SLUG_PATTERN, {
      message: 'Use 1–63 lowercase letters, numbers or hyphens.',
    });
  });

  protected readonly ids = {
    slug: `${this.uid}-slug`,
    name: `${this.uid}-name`,
  };

  /* null while the viewer may not list credentials, or nothing exists to attach. */
  protected readonly credentialOptions = computed<readonly GlassSelectOption[] | null>(() => {
    const credentials = this.credentials();
    if (!credentials || credentials.length === 0) return null;

    return [
      { value: '', label: 'None' },
      ...credentials.map((credential) => ({
        value: credential.id,
        label: `${credential.name} (${credential.registry})`,
      })),
    ];
  });

  protected readonly slugError = computed(() => {
    const state = this.draft.slug();
    if (!state.touched()) return this.reservedError();
    return state.errors()[0]?.message ?? this.reservedError();
  });

  protected onSubmit(event: Event): void {
    event.preventDefault();

    const slug = this.model().slug.trim();
    /* Reserved names are known upfront; no reason to burn a request on them. */
    if ((RESERVED_PROJECT_SLUGS as readonly string[]).includes(slug)) {
      this.reservedError.set(`“${slug}” is reserved by the server. Pick another slug.`);
      return;
    }

    this.reservedError.set(null);

    /* Signal Forms requires a promise-returning submit action. */
    void submit(this.draft, async () => {
      const draft = this.model();
      this.submitted.emit({
        slug: draft.slug.trim(),
        name: draft.name.trim() || undefined,
        registryCredentialId: this.credentialId() || undefined,
      });
    });
  }
}
