import { Component, computed, input, output, signal } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { ProjectAlert } from '../../model/list-alerts.store';

interface AlertGroup {
  readonly label: string;
  readonly items: readonly ProjectAlert[];
}

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

/* Failure bodies open with the image ref the caller already knows; the message follows it. */
const IMAGE_REF_PREFIX = /^\S+@sha256:[0-9a-f]{64}:\s*/i;

@Component({
  selector: 'app-alert-list',
  imports: [InsetGroup, TuiIcon],
  template: `
    @for (group of groups(); track group.label) {
      <app-inset-group [label]="group.label" [trailing]="failedLabel(group)">
        @for (alert of group.items; track alert.id) {
          <div class="alert row-divider relative">
            <button
              type="button"
              class="alert__row"
              [attr.aria-expanded]="expanded().has(alert.id)"
              (click)="toggle(alert.id)"
            >
              <span class="alert__dot" [attr.data-status]="alert.status" aria-hidden="true"></span>
              <span class="sr-only">
                {{ alert.status === 'failure' ? 'Deploy failed:' : 'Deployed:' }}
              </span>
              <span class="alert__main">
                <span
                  class="alert__path"
                  [class.alert__path--new]="alert.createdAt.getTime() > boundary()"
                >
                  {{ alert.project }}/{{ alert.taskName }}
                </span>
                @if (alert.status === 'failure' && alert.body && !expanded().has(alert.id)) {
                  <span class="alert__error">{{ errorLine(alert.body) }}</span>
                }
              </span>
              <span class="alert__time tabular">{{ timeLabel(alert.createdAt) }}</span>
            </button>

            @if (expanded().has(alert.id)) {
              @if (alert.body) {
                <pre class="alert__body">{{ alert.body }}</pre>
              }
              <button type="button" class="alert__open" (click)="opened.emit(alert)">
                Open {{ alert.project }}/{{ alert.taskName }}
                <tui-icon class="icon-sm" icon="@tui.arrow-up-right" />
              </button>
            }
          </div>
        }
      </app-inset-group>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 0.875rem;
    }

    /* Tailwind has no preflight, so reset the native button explicitly. */
    .alert__row {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      inline-size: 100%;
      margin: 0;
      border: 0;
      padding: 0.75rem 1rem;
      background: none;
      font: inherit;
      color: inherit;
      text-align: start;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: background-color var(--tui-duration);
    }

    .alert__row:hover {
      background: var(--tui-background-neutral-1);
    }

    /* Optically centered against the first text line. */
    .alert__dot {
      inline-size: 0.4375rem;
      block-size: 0.4375rem;
      margin-block-start: 0.4375rem;
      border-radius: 999px;
      flex: none;
    }

    .alert__dot[data-status='success'] {
      background: var(--tui-status-positive);
    }

    .alert__dot[data-status='failure'] {
      background: var(--tui-status-negative);
    }

    .alert__main {
      display: grid;
      flex: 1;
      gap: 0.1875rem;
      min-inline-size: 0;
    }

    .alert__path {
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 0.875rem;
      line-height: 1.3;
      color: var(--tui-text-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Unseen reads as weight, iOS Mail style, instead of one more dot. */
    .alert__path--new {
      font-weight: 650;
      color: var(--tui-text-primary);
    }

    .alert__error {
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      color: var(--tui-text-negative);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .alert__time {
      flex: none;
      padding-block-start: 0.0625rem;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    .alert__body {
      margin: 0 1rem 0.625rem;
      border-radius: var(--tui-radius-m);
      padding: 0.625rem 0.75rem;
      background: var(--tui-background-neutral-1);
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      line-height: 1.6;
      color: var(--tui-text-secondary);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .alert__open {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      margin: 0 1rem 0.75rem;
      border: 0;
      padding: 0;
      background: none;
      font: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--tui-text-action);
      cursor: pointer;
    }
  `,
})
export class AlertList {
  readonly alerts = input.required<readonly ProjectAlert[]>();
  /** Rows created after this timestamp render as unseen. */
  readonly boundary = input(0);
  readonly opened = output<ProjectAlert>();

  protected readonly expanded = signal<ReadonlySet<string>>(new Set());

  protected readonly groups = computed<readonly AlertGroup[]>(() => {
    const groups: AlertGroup[] = [];
    let label = '';
    let items: ProjectAlert[] = [];

    /* Input is already newest-first, so one pass builds contiguous day groups. */
    for (const alert of this.alerts()) {
      const day = dayLabel(alert.createdAt);
      if (day !== label) {
        if (items.length) groups.push({ label, items });
        label = day;
        items = [];
      }
      items.push(alert);
    }
    if (items.length) groups.push({ label, items });

    return groups;
  });

  protected failedLabel(group: AlertGroup): string {
    const failed = group.items.filter((alert) => alert.status === 'failure').length;
    return failed ? `${failed} failed` : '';
  }

  protected toggle(id: string): void {
    this.expanded.update((ids) => {
      const next = new Set(ids);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  protected errorLine(body: string): string {
    const line = body.split('\n', 1)[0];
    return line.replace(IMAGE_REF_PREFIX, '') || line;
  }

  protected timeLabel(date: Date): string {
    const elapsed = Date.now() - date.getTime();
    if (!sameDay(date, new Date())) {
      return new Intl.DateTimeFormat('en', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
    }
    if (elapsed < MINUTE_MS) return 'now';
    if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m`;
    return `${Math.floor(elapsed / HOUR_MS)}h`;
  }
}

function dayLabel(date: Date): string {
  const today = new Date();
  if (sameDay(date, today)) return 'Today';

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(date, yesterday)) return 'Yesterday';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  }).format(date);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
