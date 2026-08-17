import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TuiButton, TuiHint, TuiIcon } from '@taiga-ui/core';
import { EMPTY, defer, from } from 'rxjs';

import { Task } from '@entities/task';
import { Panel } from '@shared/ui/panel/panel';

interface DetailRow {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
}

const COPIED_RESET_MS = 1600;

@Component({
  selector: 'app-task-overview',
  imports: [Panel, TuiButton, TuiHint, TuiIcon],
  template: `
    <app-panel heading="Overview">
      <div class="overview__url">
        <span class="overview__label">Proxy URL</span>
        <div class="flex items-center gap-1">
          <a
            class="overview__link"
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
      </div>

      <dl class="overview__rows">
        @for (row of rows(); track row.label) {
          <div>
            <dt class="overview__label">{{ row.label }}</dt>
            <dd class="overview__value" [class.font-mono]="row.mono">{{ row.value }}</dd>
          </div>
        }
      </dl>
    </app-panel>
  `,
  styles: `
    .overview__url {
      display: grid;
      gap: 0.25rem;
      padding-block-end: 1rem;
      border-block-end: 1px solid var(--tui-border-normal);
    }

    .overview__link {
      min-inline-size: 0;
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      color: var(--tui-text-action);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .overview__link:hover {
      text-decoration: underline;
      text-underline-offset: 0.125rem;
    }

    .overview__rows {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.875rem 1rem;
      margin: 0;
    }

    .overview__label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.055em;
      text-transform: uppercase;
      color: var(--tui-text-tertiary);
    }

    .overview__value {
      margin: 0;
      margin-block-start: 0.125rem;
      font-size: 1.0625rem;
      color: var(--tui-text-primary);
      overflow-wrap: anywhere;
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
