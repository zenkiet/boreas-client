import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TuiButton, TuiHint, TuiIcon } from '@taiga-ui/core';
import { EMPTY, defer, from } from 'rxjs';

import { Task } from '@entities/task';
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

      @for (row of rows(); track row.label) {
        <div class="lrow row-divider relative">
          <span class="lrow__label">{{ row.label }}</span>
          <span class="lrow__value" [class.font-mono]="row.mono">{{ row.value }}</span>
        </div>
      }
    </app-inset-group>
  `,
  styles: `
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
  `,
})
export class TaskOverview {
  private readonly document = inject(DOCUMENT);

  readonly task = input.required<Task>();
  readonly proxyUrl = input.required<string>();
  readonly copyFailed = output<void>();

  protected readonly copied = signal(false);

  protected readonly rows = computed<readonly DetailRow[]>(() => {
    const task = this.task();

    return [
      { label: 'Image', value: task.image, mono: true },
      { label: 'Internal port', value: String(task.port) },
      { label: 'Container IP', value: task.containerIp || 'Unavailable', mono: true },
      {
        label: 'Container ID',
        value: task.containerId ? task.containerId.slice(0, 12) : 'Unavailable',
        mono: true,
      },
      { label: 'Variables', value: String(Object.keys(task.env).length) },
      { label: 'Description', value: task.description || '—' },
      { label: 'Created', value: formatDate(task.createdAt) },
      { label: 'Updated', value: formatDate(task.updatedAt) },
    ];
  });

  protected copyUrl(): void {
    defer(() =>
      from(this.document.defaultView?.navigator.clipboard.writeText(this.proxyUrl()) ?? EMPTY),
    ).subscribe({
      next: () => {
        this.copied.set(true);
        this.document.defaultView?.setTimeout(() => this.copied.set(false), COPIED_RESET_MS);
      },
      error: () => this.copyFailed.emit(),
    });
  }
}

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' });
}
