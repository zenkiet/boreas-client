import { Component, computed, input, output } from '@angular/core';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';

import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { AlertDescription, dayLabel, describeAlert, timeLabel } from '../../model/activity';
import { ProjectAlert } from '../../model/list-alerts.store';
import { ActivityGlyph } from '../activity-glyph/activity-glyph';

interface AlertRow {
  readonly alert: ProjectAlert;
  readonly about: AlertDescription;
  readonly time: string;
}

export interface AlertOpen {
  readonly alert: ProjectAlert;
  readonly section?: 'logs';
}

@Component({
  selector: 'app-alert-list',
  imports: [ActivityGlyph, InsetGroup, IonItem, IonLabel],
  template: `
    @if (twoPane()) {
      <div class="pane">
        @for (group of groups(); track group.label) {
          <div class="pane__day">{{ group.label }}</div>
          @for (row of group.rows; track row.alert.id) {
            <button
              type="button"
              class="entry"
              aria-controls="activity-detail"
              [attr.aria-current]="row.alert.id === selectedId() ? 'true' : null"
              (click)="selected.emit(row.alert)"
            >
              <app-activity-glyph [kind]="row.alert.kind" />
              <span class="entry__body">
                <span class="entry__head">
                  <span class="entry__title" [class.unseen]="!row.alert.seen"
                    >{{ row.about.title }}
                    @if (!row.alert.seen) {
                      <span class="sr-only">, new</span>
                    }
                  </span>
                  <span class="entry__time tabular">{{ row.time }}</span>
                </span>
                <span class="entry__where">{{ row.alert.project }} / {{ row.alert.taskName }}</span>
              </span>
            </button>
          }
        }
      </div>
    } @else {
      @for (group of groups(); track group.label) {
        <app-inset-group [label]="group.label" [trailing]="group.failed">
          @for (row of group.rows; track row.alert.id) {
            <ion-item class="event" [class.failure]="row.alert.kind === 'deploy_failed'">
              <app-activity-glyph slot="start" class="event__glyph" [kind]="row.alert.kind" />
              <ion-label class="event__body">
                <span class="event__head">
                  <span class="event__title" [class.unseen]="!row.alert.seen"
                    >{{ row.about.title }}
                    @if (!row.alert.seen) {
                      <span class="sr-only">, new</span>
                    }
                  </span>
                  <span class="event__time tabular">{{ row.time }}</span>
                </span>
                <span class="event__where">{{ row.alert.project }} / {{ row.alert.taskName }}</span>
                @if (row.about.detail) {
                  <span class="event__detail">{{ row.about.detail }}</span>
                }
                @if (row.about.image) {
                  <span class="event__detail event__image font-mono"
                    ><bdi>{{ row.about.image }}</bdi></span
                  >
                }
                @if (row.alert.kind === 'deploy_failed') {
                  <span class="event__acts">
                    <button
                      type="button"
                      class="event__act event__act--accent"
                      (click)="opened.emit({ alert: row.alert, section: 'logs' })"
                    >
                      View logs
                    </button>
                    <button
                      type="button"
                      class="event__act"
                      (click)="opened.emit({ alert: row.alert })"
                    >
                      Open task
                    </button>
                  </span>
                }
              </ion-label>
            </ion-item>
          }
        </app-inset-group>
      }
    }
  `,
  styles: `
    /* Reinforcement only: the title says "failed" in words. */
    .failure {
      --background: var(--app-fail-row);
    }

    .event {
      --inner-padding-top: 0;
    }

    .event__glyph {
      align-self: flex-start;
      margin: 0.875rem 0.75rem 0 0;
    }

    /* Scoped under the row: Ionic's label rule has the same specificity. */
    .event .event__body {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      margin: 0;
      padding: 0.8125rem 0 0.875rem;
      white-space: normal;
    }

    .event__head,
    .entry__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .event__title {
      font-size: 1rem;
      line-height: 1.3125rem;
      font-weight: 400;
    }

    /* Unseen is weight, iOS Mail style, not another dot. */
    .event__title.unseen,
    .entry__title.unseen {
      font-weight: 700;
    }

    .event__time,
    .entry__time {
      flex: none;
      font-size: 0.8125rem;
      color: var(--app-text-tertiary);
    }

    .event__where,
    .entry__where {
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .event__detail {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
      font-size: 0.875rem;
      line-height: 1.1875rem;
      color: var(--app-text-tertiary);
      word-break: break-word;
    }

    .failure .event__detail {
      color: var(--ion-color-danger);
    }

    /* Clipped at the head: the repository and tag are the part worth reading. */
    .event__image {
      display: block;
      direction: rtl;
      text-align: end;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .event__acts {
      display: flex;
      gap: 0.5rem;
      margin-block-start: 0.5rem;
    }

    .event__act {
      display: inline-flex;
      align-items: center;
      block-size: 2rem;
      padding: 0 0.75rem;
      border: 0;
      border-radius: 1rem;
      background: var(--app-fill);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--app-text-primary);
      cursor: pointer;
    }

    .event__act--accent {
      background: var(--app-accent-soft);
      color: var(--app-accent-text);
    }

    .pane {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-block-start: 0.875rem;
      padding: 0.375rem;
      border-radius: 1.625rem;
      background: var(--ion-item-background);
    }

    .pane__day {
      padding: 0.5rem 0.875rem 0.25rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--app-text-tertiary);
    }

    /* Not ".item": Ionic puts that class on every ion-item host. */
    .entry {
      display: flex;
      gap: 0.75rem;
      inline-size: 100%;
      padding: 0.75rem 0.875rem;
      border: 0;
      border-radius: 1.125rem;
      background: none;
      color: var(--app-text-primary);
      text-align: start;
      cursor: pointer;
    }

    .entry[aria-current='true'] {
      background: rgba(120, 120, 128, 0.16);
    }

    .entry__body {
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 0.125rem;
      min-inline-size: 0;
    }

    .entry__title {
      font-size: 0.9375rem;
      font-weight: 400;
    }

    .entry__where {
      font-size: 0.75rem;
    }
  `,
})
export class AlertList {
  readonly alerts = input.required<readonly ProjectAlert[]>();
  readonly twoPane = input(false);
  readonly selectedId = input<string | null>(null);
  readonly selected = output<ProjectAlert>();
  readonly opened = output<AlertOpen>();

  protected readonly groups = computed(() => {
    const groups: { readonly label: string; readonly rows: AlertRow[] }[] = [];

    /* Relies on newest-first input: each day's rows are contiguous. */
    for (const alert of this.alerts()) {
      const label = dayLabel(alert.createdAt);
      if (groups.at(-1)?.label !== label) groups.push({ label, rows: [] });
      groups
        .at(-1)!
        .rows.push({ alert, about: describeAlert(alert), time: timeLabel(alert.createdAt) });
    }

    return groups.map(({ label, rows }) => {
      const failed = rows.filter(({ alert }) => alert.kind === 'deploy_failed').length;
      return { label, rows, failed: failed ? `${failed} failed` : '' };
    });
  });
}
