import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { EMPTY, defer, from } from 'rxjs';

interface EnvRow {
  readonly key: string;
  readonly value: string;
  readonly secret: boolean;
}

/* Match segments, not substrings: LICENSE_KEY is secret; AUTH_API_URL is not. */
const SECRET_SEGMENTS = new Set([
  'SECRET',
  'SECRETS',
  'TOKEN',
  'PASSWORD',
  'PASSWD',
  'PASS',
  'KEY',
  'APIKEY',
  'CREDENTIAL',
  'CREDENTIALS',
  'PRIVATE',
]);

const COPIED_RESET_MS = 1600;

/* Fixed width prevents the mask from leaking value length. */
const MASK = '••••••••';

@Component({
  selector: 'app-environment-list',
  imports: [TuiButton, TuiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (row of rows(); track row.key) {
      <div class="env-row">
        <button
          type="button"
          class="env-row__main"
          [attr.aria-expanded]="expanded().has(row.key)"
          [attr.aria-label]="'Expand ' + row.key"
          (click)="toggleExpanded(row.key)"
        >
          <span class="env-row__key">{{ row.key }}</span>
          <span class="env-row__value" [class.env-row__value--open]="expanded().has(row.key)">
            {{ row.secret && !revealed().has(row.key) ? MASK : row.value }}
          </span>
        </button>

        @if (row.secret) {
          <button
            tuiIconButton
            type="button"
            size="xs"
            appearance="flat-grayscale"
            [attr.aria-label]="(revealed().has(row.key) ? 'Hide ' : 'Reveal ') + row.key"
            (click)="toggleRevealed(row.key)"
          >
            <tui-icon
              class="icon-sm"
              [icon]="revealed().has(row.key) ? '@tui.eye-off' : '@tui.eye'"
            />
          </button>
        }
        <button
          tuiIconButton
          type="button"
          size="xs"
          appearance="flat-grayscale"
          [attr.aria-label]="'Copy ' + row.key"
          (click)="copy(row)"
        >
          <tui-icon class="icon-sm" [icon]="copiedKey() === row.key ? '@tui.check' : '@tui.copy'" />
        </button>
      </div>
    } @empty {
      <p class="env-empty">No variables set.</p>
    }
  `,
  styles: `
    .env-row {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding-block: 0.5625rem;
    }

    .env-row + .env-row {
      border-block-start: 1px solid var(--tui-border-normal);
    }

    /* Tailwind has no preflight, so reset the native button explicitly. */
    .env-row__main {
      display: grid;
      flex: 1;
      gap: 0.125rem;
      min-inline-size: 0;
      margin: 0;
      border: 0;
      padding: 0;
      background: none;
      font: inherit;
      color: inherit;
      text-align: start;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .env-row__key {
      font-family: var(--app-font-mono);
      font-size: 0.8125rem;
      letter-spacing: 0.02em;
      color: var(--tui-text-tertiary);
      overflow-wrap: anywhere;
    }

    .env-row__value {
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      color: var(--tui-text-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .env-row__value--open {
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .env-empty {
      margin: 0;
      padding-block: 1.5rem;
      font-size: 0.9375rem;
      color: var(--tui-text-tertiary);
      text-align: center;
    }
  `,
})
export class EnvironmentList {
  private readonly document = inject(DOCUMENT);

  readonly environment = input.required<Readonly<Record<string, string>>>();
  readonly copyFailed = output<void>();

  protected readonly MASK = MASK;
  protected readonly revealed = signal<ReadonlySet<string>>(new Set());
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  protected readonly copiedKey = signal<string | null>(null);

  protected readonly rows = computed<readonly EnvRow[]>(() =>
    Object.entries(this.environment())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ key, value, secret: isSecret(key) })),
  );

  protected toggleExpanded(key: string): void {
    this.expanded.update((keys) => toggle(keys, key));
  }

  protected toggleRevealed(key: string): void {
    this.revealed.update((keys) => toggle(keys, key));
  }

  protected copy(row: EnvRow): void {
    defer(() =>
      from(this.document.defaultView?.navigator.clipboard.writeText(row.value) ?? EMPTY),
    ).subscribe({
      next: () => {
        this.copiedKey.set(row.key);
        this.document.defaultView?.setTimeout(() => {
          if (this.copiedKey() === row.key) this.copiedKey.set(null);
        }, COPIED_RESET_MS);
      },
      error: () => this.copyFailed.emit(),
    });
  }
}

function isSecret(key: string): boolean {
  return key
    .toUpperCase()
    .split('_')
    .some((segment) => SECRET_SEGMENTS.has(segment));
}

function toggle(keys: ReadonlySet<string>, key: string): ReadonlySet<string> {
  const next = new Set(keys);

  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }

  return next;
}
