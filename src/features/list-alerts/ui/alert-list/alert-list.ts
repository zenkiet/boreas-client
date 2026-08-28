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
          <div class="alert row-divider relative" [attr.data-status]="alert.status">
            <div class="alert__head">
              <span class="alert__title" [class.alert__title--new]="!alert.seen">
                {{ alert.title }}
              </span>
              <span class="alert__time tabular">{{ timeLabel(alert.createdAt) }}</span>
            </div>

            @if (alert.body) {
              <p class="alert__body">{{ alert.body }}</p>
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

    .alert {
      display: grid;
      gap: 0.3125rem;
      padding: 0.6875rem 1rem 0.8125rem;
    }

    /* The title already says "failed" in words, so the tint is reinforcement, not the message. */
    .alert[data-status='failure'] {
      background: var(--tui-status-negative-pale);
    }

    .alert__head {
      display: flex;
      align-items: baseline;
      gap: 0.625rem;
    }

    .alert__title {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
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
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    /* Clamped so a long failure reason can never flood the feed. */
    .alert__body {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      margin: 0;
      overflow: hidden;
      font-size: 0.8125rem;
      line-height: 1.5;
      color: var(--tui-text-secondary);
      word-break: break-word;
    }
  `,
})
export class AlertList {
  readonly alerts = input.required<readonly ProjectAlert[]>();

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
