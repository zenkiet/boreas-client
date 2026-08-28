import { Component, computed, effect, input, output, signal } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { from } from 'rxjs';

import { Callout } from '@shared/ui/callout/callout';
import { ParsedEnvironment, parseEnvText, toEnvText } from '../../model/env-file';

@Component({
  selector: 'app-environment-editor',
  imports: [Callout, TuiButton, TuiIcon],
  template: `
    <section class="grid grid-cols-1 gap-2.5" aria-label="Environment variables editor">
      <div class="flex flex-wrap items-center justify-end gap-2">
        <!-- Taiga has no button-sized file control, so this button drives a hidden native input. -->
        <button tuiButton type="button" size="s" appearance="secondary" (click)="file.click()">
          <tui-icon class="icon-sm" icon="@tui.file-up" />
          Import .env
        </button>
        <input
          #file
          type="file"
          class="sr-only"
          accept=".env,.txt,text/plain"
          tabindex="-1"
          aria-hidden="true"
          (change)="importFile($event)"
        />
      </div>

      <textarea
        class="glass-field env__input"
        rows="12"
        spellcheck="false"
        autocomplete="off"
        autocapitalize="off"
        aria-label="Environment variables in .env format"
        [attr.aria-invalid]="parsed().errors.length > 0"
        placeholder="DATABASE_URL=postgres://localhost:5432/app&#10;LOG_LEVEL=debug"
        [value]="text()"
        (input)="updateText($event)"
      ></textarea>

      @if (parsed().errors.length > 0) {
        <app-callout tone="negative" size="s" role="alert">
          <ul class="m-0 grid list-none gap-0.5 p-0">
            @for (error of parsed().errors; track error) {
              <li>{{ error }}</li>
            }
          </ul>
        </app-callout>
      } @else {
        <p class="text-[0.8125rem] tabular text-tertiary">{{ summary() }}</p>
      }
    </section>
  `,
  styles: `
    .env__input {
      display: block;
      inline-size: 100%;
      padding: 0.625rem 0.75rem;
      border: 0;
      border-radius: var(--tui-radius-m);
      font-family: var(--app-font-mono);
      font-size: 0.8125rem;
      line-height: 1.6;
      resize: vertical;
      white-space: pre;
      overflow-wrap: normal;
      overflow-x: auto;
    }
  `,
})
export class EnvironmentEditor {
  readonly environment = input.required<Readonly<Record<string, string>>>();
  readonly resetKey = input(0);
  readonly environmentChange = output<Record<string, string>>();
  readonly errorsChange = output<readonly string[]>();

  protected readonly text = signal('');
  protected readonly parsed = computed<ParsedEnvironment>(() => parseEnvText(this.text()));

  protected readonly summary = computed(() => {
    const count = Object.keys(this.parsed().env).length;
    return count === 1 ? '1 variable' : `${count} variables`;
  });

  private readonly touched = signal(false);
  private previousResetKey = -1;

  constructor() {
    effect(() => {
      const resetKey = this.resetKey();
      const environment = this.environment();
      if (resetKey !== this.previousResetKey) {
        this.previousResetKey = resetKey;
        this.touched.set(false);
        this.text.set(toEnvText(environment));
      } else if (!this.touched()) {
        this.text.set(toEnvText(environment));
      }
    });
  }

  protected updateText(event: Event): void {
    this.touched.set(true);
    this.text.set((event.target as HTMLTextAreaElement).value);
    this.emit();
  }

  /* Replace, not merge: the map has replace-on-apply semantics. */
  protected importFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    from(file.text()).subscribe((content) => {
      this.touched.set(true);
      this.text.set(content.trimEnd());
      this.emit();
    });
  }

  private emit(): void {
    const { env, errors } = this.parsed();
    this.errorsChange.emit(errors);
    /* A partial parse would silently drop invalid lines from the applied environment. */
    if (!errors.length) {
      this.environmentChange.emit(env);
    }
  }
}
