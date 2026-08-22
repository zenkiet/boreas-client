import { Component, computed, input } from '@angular/core';

import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { ProjectAlert } from '../../model/list-alerts.store';

interface AlertGroup {
  readonly label: string;
  readonly items: readonly ProjectAlert[];
}

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

@Component({
  selector: 'app-alert-list',
  imports: [InsetGroup],
  template: `
    @for (group of groups(); track group.label) {
      <app-inset-group [label]="group.label" [trailing]="failedLabel(group)">
        @for (alert of group.items; track alert.id) {
          <div class="alert row-divider relative">
            <div class="alert__row">
              <span class="alert__dot" [attr.data-status]="alert.status" aria-hidden="true"></span>
              <span
                class="alert__title"
                [class.alert__title--new]="alert.createdAt.getTime() > boundary()"
              >
                {{ alert.title }}
              </span>
              <span class="alert__time tabular">{{ timeLabel(alert.createdAt) }}</span>
            </div>

            <!-- A success carries only the digest it shipped; a failure carries the reason. -->
            @if (alert.status === 'failure' && alert.body) {
              <pre class="alert__body">{{ alert.body }}</pre>
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

    .alert__row {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
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

    .alert__title {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 0.875rem;
      line-height: 1.3;
      color: var(--tui-text-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Unseen reads as weight, iOS Mail style, instead of one more dot. */
    .alert__title--new {
      font-weight: 650;
      color: var(--tui-text-primary);
    }

    .alert__time {
      flex: none;
      padding-block-start: 0.0625rem;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    .alert__body {
      margin: 0 1rem 0.75rem 1.9375rem;
      border-radius: var(--tui-radius-m);
      padding: 0.5rem 0.625rem;
      background: var(--tui-background-neutral-1);
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      line-height: 1.55;
      color: var(--tui-text-negative);
      white-space: pre-wrap;
      word-break: break-word;
    }
  `,
})
export class AlertList {
  readonly alerts = input.required<readonly ProjectAlert[]>();
  /** Rows created after this timestamp render as unseen. */
  readonly boundary = input(0);

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
