import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { defer, from, throwError } from 'rxjs';

import {
  EnvFix,
  applyEnvFix,
  envLineTokens,
  mergeEnvText,
  parseEnvText,
  toEnvText,
} from '../../model/env-file';

/* Kill switch for a device-specific mirror bug: false falls back to a plain textarea. */
const MIRROR = true;

interface EnvMessage {
  readonly text: string;
  readonly tone: 'ok' | 'bad';
  readonly fix?: EnvFix;
}

let instances = 0;

@Component({
  selector: 'app-environment-editor',
  /* It always sits in an inset group, whose ion-list Ionic marks role="list". */
  host: { role: 'listitem' },
  template: `
    <input
      #file
      type="file"
      class="sr-only"
      accept=".env,.txt,text/plain"
      tabindex="-1"
      aria-hidden="true"
      (change)="importFile($event)"
    />

    <label class="env" [class.env--inset]="inset()">
      @if (label()) {
        <span class="env__label">{{ label() }}</span>
      }
      <span class="env__box" [class.env__box--plain]="!mirror">
        @if (mirror) {
          <!-- Whitespace-free on purpose: the mirror is pre-wrap and must match the textarea. -->
          <span class="env__mirror" aria-hidden="true">
            @for (line of lines(); track $index) {
              <span class="env__line">
                @for (run of line; track $index) {
                  <span [attr.data-tone]="run.tone">{{ run.text }}</span>
                }
              </span>
            }
          </span>
        }
        <textarea
          class="env__input"
          rows="1"
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          [attr.placeholder]="mirror ? null : 'KEY=value'"
          [attr.aria-label]="label() ? null : 'Environment variables, one KEY=value per line'"
          [attr.aria-invalid]="issues().length > 0"
          [attr.aria-describedby]="message() ? messageId : null"
          [value]="text()"
          [readOnly]="locked()"
          (input)="updateText($event)"
          (focus)="focused.set(true)"
          (blur)="focused.set(false)"
        ></textarea>
      </span>
    </label>

    @if (message(); as note) {
      <div class="env__msg" role="status" [id]="messageId" [attr.data-tone]="note.tone">
        <span
          class="flex-none text-[1.125rem]"
          [class]="
            note.tone === 'bad' ? 'icon-[light--circle-exclamation]' : 'icon-[light--circle-check]'
          "
          aria-hidden="true"
        ></span>
        <span class="grow">{{ note.text }}</span>
        @if (!locked() && note.fix; as fix) {
          <button
            type="button"
            class="env__fix"
            [attr.aria-label]="'Fix line ' + (fix.line + 1)"
            (click)="fixLine(fix)"
          >
            Fix
          </button>
        }
      </div>
    }

    @if (footer()) {
      <div class="env__foot">
        <button type="button" class="env__pill" (click)="paste()">
          <span class="text-[1.0625rem] icon-[light--clipboard]" aria-hidden="true"></span>
          Paste
        </button>
        <button type="button" class="env__pill" (click)="file.click()">
          <span class="text-[1.0625rem] icon-[light--arrow-down-to-line]" aria-hidden="true"></span>
          Import .env
        </button>
        <span class="env__count tabular">{{ countLabel() }}</span>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    /* A following row (About's Save) needs the separator Ionic would draw under an item. */
    :host(:not(:last-child))::after {
      content: '';
      display: block;
      margin-inline-start: 1.25rem;
      border-block-end: 0.55px solid var(--app-border-normal);
    }

    .env {
      display: block;
    }

    .env__label {
      display: block;
      padding: 0.625rem 1.25rem 0;
      font-size: 0.8125rem;
      line-height: 1rem;
      font-weight: 500;
      color: var(--app-text-tertiary);
    }

    /* The caret layer and the colour layer share every metric; any difference shifts the caret. */
    .env__box {
      --env-fs: 0.9375rem;
      --env-lh: 1.5rem;
      --env-pt: 0.875rem;
      --env-px: 1.25rem;
      --env-pb: 0.625rem;
      --env-lines: 3;
      position: relative;
      display: block;
      font: 400 var(--env-fs) / var(--env-lh) var(--app-font-mono);
      letter-spacing: 0;
      tab-size: 2;
      font-kerning: none;
      font-variant-ligatures: none;
      font-feature-settings: normal;
    }

    .env__mirror,
    .env__input {
      display: block;
      box-sizing: border-box;
      margin: 0;
      border: 0;
      padding: var(--env-pt) var(--env-px) var(--env-pb);
      white-space: pre-wrap;
      word-break: break-all;
      overflow-wrap: anywhere;
    }

    /* The mirror sizes the box; 1px of slack keeps rounding from scrolling the textarea. */
    .env__mirror {
      min-block-size: calc(var(--env-lines) * var(--env-lh) + var(--env-pt) + var(--env-pb));
      padding-block-end: calc(var(--env-pb) + 1px);
      padding-inline-start: calc(var(--env-px) + var(--env-caret-inset, 0px));
      color: var(--app-text-primary);
    }

    .env__line {
      display: block;
      min-block-size: var(--env-lh);
    }

    .env__input {
      position: absolute;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
      font: inherit;
      letter-spacing: inherit;
      font-kerning: inherit;
      font-variant-ligatures: inherit;
      font-feature-settings: inherit;
      tab-size: inherit;
      appearance: none;
      resize: none;
      overflow: hidden;
      background: transparent;
      color: transparent;
      -webkit-text-fill-color: transparent;
      caret-color: var(--ion-color-primary);
      outline: none;
    }

    .env__box--plain .env__input {
      position: static;
      color: inherit;
      -webkit-text-fill-color: currentColor;
      field-sizing: content;
      min-block-size: calc(var(--env-lines) * var(--env-lh) + var(--env-pt) + var(--env-pb));
    }

    .env__line [data-tone='key'] {
      color: var(--app-text-primary);
    }

    .env__line [data-tone='eq'],
    .env__line [data-tone='dim'] {
      color: var(--app-text-tertiary);
    }

    .env__line [data-tone='value'] {
      color: var(--app-text-secondary);
    }

    .env__line [data-tone='ghost'] {
      color: var(--app-text-tertiary);
      font-style: italic;
    }

    .env__line [data-tone='bad'] {
      color: var(--ion-color-danger);
      text-decoration: underline wavy;
      text-decoration-skip-ink: none;
      text-underline-offset: 5px;
    }

    /* System colours would paint the textarea's own text over the mirror. */
    @media (forced-colors: active) {
      .env__mirror {
        display: none;
      }

      .env__input {
        position: static;
        color: CanvasText;
        -webkit-text-fill-color: CanvasText;
      }
    }

    /* The task page's editor is the whole section on iPad. */
    @media (min-width: 64rem) and (min-height: 31.25rem) {
      :host(.tall) .env__box {
        --env-fs: 0.875rem;
        --env-lh: 1.4375rem;
        --env-pt: 1rem;
        --env-pb: 0.75rem;
        --env-lines: 10;
      }
    }

    .env--inset {
      padding: 0 1.25rem 0.75rem;
    }

    .env--inset .env__label {
      padding-inline: 0;
    }

    .env--inset .env__box {
      --env-fs: 0.8125rem;
      --env-lh: 1.1875rem;
      --env-pt: 0.625rem;
      --env-px: 0.75rem;
      --env-pb: 0.625rem;
      --env-lines: 1;
      margin-block-start: 0.375rem;
      border-radius: 0.75rem;
      background: var(--app-code-bg);
    }

    .env__msg {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      min-block-size: 3rem;
      padding: 0.5rem 0.75rem 0.5rem 1.25rem;
      font-size: 0.8125rem;
      line-height: 1.125rem;
    }

    .env__msg[data-tone='bad'] {
      background: var(--color-danger-soft);
      color: var(--ion-color-danger);
    }

    .env__msg[data-tone='ok'] {
      background: var(--app-status-positive-pale);
      color: var(--app-status-positive);
    }

    .env__fix {
      flex: none;
      block-size: 1.875rem;
      padding: 0 0.875rem;
      border: 0;
      border-radius: 0.9375rem;
      background: var(--ion-item-background);
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--ion-color-danger);
      cursor: pointer;
    }

    .env__foot {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-block-size: 3.5rem;
      margin-inline-start: 1.25rem;
      padding-inline-end: 1rem;
      border-block-start: 1px solid var(--app-border-normal);
    }

    .env__pill {
      display: inline-flex;
      flex: none;
      align-items: center;
      gap: 0.375rem;
      block-size: 2.125rem;
      padding: 0 0.875rem 0 0.6875rem;
      border: 0;
      border-radius: 1.0625rem;
      background: var(--app-fill);
      font-size: 0.9375rem;
      font-weight: 500;
      /* The accent ink: the accent itself fails AA on the grey fill. */
      color: var(--app-accent-text);
      white-space: nowrap;
      cursor: pointer;
    }

    .env__count {
      margin-inline-start: auto;
      font-size: 0.8125rem;
      color: var(--app-text-tertiary);
      white-space: nowrap;
    }
  `,
})
export class EnvironmentEditor {
  readonly environment = input.required<Readonly<Record<string, string>>>();
  /** Bump to reseed the buffer from `environment`. */
  readonly resetKey = input(0);
  readonly label = input('');
  readonly inset = input(false);
  readonly footer = input(false);
  readonly locked = input(false);
  /** Emitted only for a buffer without issues. */
  readonly environmentChange = output<Record<string, string>>();
  readonly errorsChange = output<readonly string[]>();

  protected readonly mirror = MIRROR;
  protected readonly messageId = `env-msg-${(instances += 1)}`;
  protected readonly text = signal('');
  protected readonly focused = signal(false);
  private readonly note = signal<EnvMessage | null>(null);
  private readonly touched = signal(false);
  private readonly view = inject(DOCUMENT).defaultView;
  private previousResetKey = -1;

  protected readonly parsed = computed(() => parseEnvText(this.text()));
  protected readonly issues = computed(() => this.parsed().issues);

  protected readonly lines = computed(() => {
    if (this.locked() && !this.text()) return [[{ text: 'No variables', tone: 'ghost' } as const]];
    const rows = this.text().split(/\r?\n/);
    const kinds = new Map(this.issues().map((issue) => [issue.line, issue.kind]));
    const masked = this.mirror && !this.focused();
    return rows.map((raw, i) => envLineTokens(raw, kinds.get(i), masked, i === rows.length - 1));
  });

  /* The first issue outranks any note: it is what blocks the apply. */
  protected readonly message = computed<EnvMessage | null>(() => {
    const [issue] = this.issues();
    return issue ? { text: issue.message, tone: 'bad', fix: issue.fix } : this.note();
  });

  protected readonly countLabel = computed(() => {
    const count = Object.keys(this.parsed().env).length;
    return count === 1 ? '1 variable' : `${count} variables`;
  });

  constructor() {
    effect(() => {
      const resetKey = this.resetKey();
      const environment = this.environment();
      if (resetKey !== this.previousResetKey) {
        this.previousResetKey = resetKey;
        this.touched.set(false);
        this.note.set(null);
        this.text.set(toEnvText(environment));
      } else if (!this.touched()) {
        this.text.set(toEnvText(environment));
      }
    });
  }

  protected updateText(event: Event): void {
    this.note.set(null);
    this.setText((event.target as HTMLTextAreaElement).value);
  }

  protected fixLine(fix: EnvFix): void {
    this.setText(applyEnvFix(this.text(), fix));
  }

  protected paste(): void {
    const clipboard = this.view?.navigator.clipboard;
    const read = clipboard
      ? defer(() => from(clipboard.readText()))
      : throwError(() => new Error('No clipboard'));
    read.subscribe({
      next: (clip) => {
        const merged = mergeEnvText(this.text(), clip);
        const parts = [
          merged.added ? `${merged.added} added` : '',
          merged.updated ? `${merged.updated} updated` : '',
        ].filter(Boolean);
        if (parts.length === 0) {
          const pairs = Object.keys(parseEnvText(clip).env).length > 0;
          this.note.set(
            pairs
              ? { text: 'Nothing new to paste', tone: 'ok' }
              : { text: 'The clipboard has no KEY=value lines', tone: 'bad' },
          );
          return;
        }
        this.setText(merged.text);
        this.note.set({ text: `Pasted: ${parts.join(', ')}`, tone: 'ok' });
      },
      error: () =>
        this.note.set({
          text: 'Paste isn’t allowed here. Long-press the field and choose Paste.',
          tone: 'bad',
        }),
    });
  }

  /* Replace, not merge: a file is the whole map, and the map is replaced on apply. */
  protected importFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    from(file.text()).subscribe((content) => {
      this.setText(content.trimEnd());
      this.note.set({ text: `Imported ${file.name}`, tone: 'ok' });
    });
  }

  private setText(value: string): void {
    this.touched.set(true);
    this.text.set(value);
    const { env, issues } = this.parsed();
    this.errorsChange.emit(issues.map((issue) => issue.message));
    /* A partial parse would silently drop invalid lines from the applied environment. */
    if (issues.length === 0) this.environmentChange.emit(env);
  }
}
