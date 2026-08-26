import { DOCUMENT } from '@angular/common';
import {
  Component,
  OutputEmitterRef,
  WritableSignal,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TuiButton, TuiHint, TuiIcon } from '@taiga-ui/core';
import { EMPTY, defer, from } from 'rxjs';

import { DEV_STATUS_LABEL, Task } from '@entities/task';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

interface DetailRow {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
}

const COPIED_RESET_MS = 1600;

@Component({
  selector: 'app-task-overview',
  imports: [InsetGroup, TuiButton, TuiHint, TuiIcon],
  template: `
    <app-inset-group label="Overview">
      <button type="button" class="lrow row-divider relative status" (click)="statusClicked.emit()">
        <span class="lrow__label">Status</span>
        <span class="status__value">
          <span class="status__dot" [attr.data-dev]="task().devStatus" aria-hidden="true"></span>
          {{ statusLabel() }}
        </span>
        <tui-icon class="status__chevron icon-sm" icon="@tui.chevron-right" aria-hidden="true" />
      </button>

      <div class="lrow row-divider relative">
        <span class="lrow__label">Proxy URL</span>
        <a
          class="lrow__link"
          rel="noopener"
          target="_blank"
          [href]="proxyUrl()"
          [attr.title]="proxyUrl()"
        >
          {{ proxyUrl() }}
        </a>
        <button
          tuiIconButton
          type="button"
          size="xs"
          appearance="flat-grayscale"
          [tuiHint]="copied() ? 'Copied' : 'Copy URL'"
          aria-label="Copy proxy URL"
          (click)="copyUrl()"
        >
          <tui-icon class="icon-sm" [icon]="copied() ? '@tui.check' : '@tui.copy'" />
        </button>
      </div>

      <div class="lrow row-divider relative">
        <span class="lrow__label">Image</span>
        <span class="image font-mono" [attr.title]="task().image">{{ shortImage() }}</span>
        <button
          tuiIconButton
          type="button"
          size="xs"
          appearance="flat-grayscale"
          [tuiHint]="copiedImage() ? 'Copied' : 'Copy image'"
          aria-label="Copy image reference"
          (click)="copyImage()"
        >
          <tui-icon class="icon-sm" [icon]="copiedImage() ? '@tui.check' : '@tui.copy'" />
        </button>
      </div>

      @if (lastDeploy(); as deploy) {
        <div class="lrow row-divider relative">
          <span class="lrow__label">Last deploy</span>
          <span class="lrow__value" [class.deploy--failed]="deploy.failed">
            {{ deployLabel(deploy) }}
          </span>
        </div>
      }

      @for (row of rows(); track row.label) {
        <div class="lrow row-divider relative">
          <span class="lrow__label">{{ row.label }}</span>
          <span class="lrow__value" [class.font-mono]="row.mono">{{ row.value }}</span>
        </div>
      }
    </app-inset-group>
  `,
  styles: `
    /* Tailwind has no preflight, so reset the button-shaped row explicitly. */
    button.status {
      inline-size: 100%;
      margin: 0;
      border: 0;
      background: none;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    .status__value {
      display: inline-flex;
      align-items: center;
      gap: 0.4375rem;
      margin-inline-start: auto;
      font-size: 0.9375rem;
      color: var(--tui-text-primary);
    }

    .status__dot {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      border-radius: 999px;
    }

    .status__dot[data-dev='in_progress'] {
      background: var(--tui-status-warning);
    }

    .status__dot[data-dev='blocked'] {
      background: var(--tui-status-negative);
    }

    .status__dot[data-dev='ready'] {
      background: var(--tui-status-positive);
    }

    .status__chevron {
      color: var(--tui-text-tertiary);
    }

    /* Without flex+min-size the nowrap link refuses to shrink and shoves the copy button
       outside the group, which put it out of reach entirely at 375px. */
    .lrow__link {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      color: var(--tui-text-action);
      text-align: end;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .lrow__link:hover {
      text-decoration: underline;
      text-underline-offset: 0.125rem;
    }

    .image {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      font-size: 0.9375rem;
      color: var(--tui-text-primary);
      text-align: end;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .deploy--failed {
      color: var(--tui-status-negative);
    }
  `,
})
export class TaskOverview {
  private readonly document = inject(DOCUMENT);

  readonly task = input.required<Task>();
  readonly proxyUrl = input.required<string>();
  /** Newest deploy notification for this task; hidden when it never deployed via CI. */
  readonly lastDeploy = input<{ readonly at: Date; readonly failed: boolean } | null>(null);
  readonly copyFailed = output<void>();
  readonly imageCopyFailed = output<void>();
  readonly statusClicked = output<void>();

  protected readonly statusLabel = computed(() => DEV_STATUS_LABEL[this.task().devStatus]);

  /* A 64-hex digest is unreadable; 12 chars identify the build, copy keeps the full ref. */
  protected readonly shortImage = computed(() =>
    this.task().image.replace(/sha256:([0-9a-f]{12})[0-9a-f]{52}/, '$1'),
  );

  protected deployLabel(deploy: { readonly at: Date; readonly failed: boolean }): string {
    return `${formatDate(deploy.at)}${deploy.failed ? ' · failed' : ''}`;
  }

  protected readonly copied = signal(false);
  protected readonly copiedImage = signal(false);

  protected readonly rows = computed<readonly DetailRow[]>(() => {
    const task = this.task();

    return [
      { label: 'Container', value: task.status },
      { label: 'Description', value: task.description || '—' },
      { label: 'Created', value: formatDate(task.createdAt) },
      { label: 'Updated', value: formatDate(task.updatedAt) },
    ];
  });

  protected copyUrl(): void {
    this.copy(this.proxyUrl(), this.copied, this.copyFailed);
  }

  protected copyImage(): void {
    this.copy(this.task().image, this.copiedImage, this.imageCopyFailed);
  }

  private copy(text: string, done: WritableSignal<boolean>, failed: OutputEmitterRef<void>): void {
    defer(() =>
      from(this.document.defaultView?.navigator.clipboard.writeText(text) ?? EMPTY),
    ).subscribe({
      next: () => {
        done.set(true);
        this.document.defaultView?.setTimeout(() => done.set(false), COPIED_RESET_MS);
      },
      error: () => failed.emit(),
    });
  }
}

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' });
}
