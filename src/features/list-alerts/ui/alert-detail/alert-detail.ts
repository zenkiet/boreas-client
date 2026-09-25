import { Component, computed, input, output } from '@angular/core';

import { describeAlert, whenLabel } from '../../model/activity';
import { ProjectAlert } from '../../model/list-alerts.store';
import { ActivityGlyph } from '../activity-glyph/activity-glyph';
import { AlertOpen } from '../alert-list/alert-list';

@Component({
  selector: 'app-alert-detail',
  imports: [ActivityGlyph],
  template: `
    @let event = alert();
    <div class="card">
      <div class="flex items-center gap-3.5">
        <app-activity-glyph size="hero" [kind]="event.kind" />
        <span class="flex flex-col gap-0.5">
          <span class="text-[22px] leading-7 font-bold">{{ about().title }}</span>
          <span class="text-sm text-label-3">{{ when() }}</span>
        </span>
      </div>

      <dl class="facts">
        <dt>Project</dt>
        <dd>{{ event.projectName || event.project }}</dd>
        <dt>Task</dt>
        <dd class="font-mono text-sm">{{ event.taskName }}</dd>
        @if (about().image; as image) {
          <dt>Image</dt>
          <dd class="font-mono text-[13px] break-all">{{ image }}</dd>
        }
      </dl>

      @if (body()) {
        <pre class="body" [class.body--failed]="event.kind === 'deploy_failed'">{{ body() }}</pre>
      }

      <div class="flex flex-wrap gap-2.5">
        @if (event.kind === 'deploy_failed') {
          <button type="button" class="act act--primary" (click)="opened.emit({ alert: event, section: 'logs' })">
            View logs
          </button>
        } @else if (event.kind === 'deployed' && visitUrl()) {
          <a class="act act--primary" target="_blank" rel="noopener" [href]="visitUrl()">
            Open in browser
          </a>
        }
        <button
          type="button"
          class="act"
          [class.act--primary]="event.kind !== 'deploy_failed' && event.kind !== 'deployed'"
          (click)="opened.emit({ alert: event })"
        >
          Open task
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem 1.75rem;
      border-radius: var(--radius-card);
      background: var(--ion-item-background);
    }

    .facts {
      display: grid;
      grid-template-columns: 6.875rem minmax(0, 1fr);
      gap: 0.625rem 0.75rem;
      margin: 0;
      font-size: 0.9375rem;
    }

    .facts dt {
      color: var(--app-text-tertiary);
    }

    .facts dd {
      margin: 0;
      min-inline-size: 0;
    }

    .body {
      margin: 0;
      padding: 0.875rem 1rem;
      border-radius: 1rem;
      background: var(--app-code-bg);
      font-family: var(--app-font-mono);
      font-size: 0.8125rem;
      line-height: 1.25rem;
      color: var(--app-text-secondary);
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }

    .body--failed {
      background: var(--color-danger-soft);
      color: var(--ion-color-danger);
    }

    .act {
      display: inline-flex;
      align-items: center;
      block-size: 2.5rem;
      padding: 0 1.125rem;
      border: 0;
      border-radius: 1.25rem;
      background: var(--app-fill);
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--app-text-primary);
      text-decoration: none;
      cursor: pointer;
    }

    .act--primary {
      background: var(--ion-color-primary);
      color: var(--ion-color-primary-contrast);
    }
  `,
})
export class AlertDetail {
  readonly alert = input.required<ProjectAlert>();
  readonly visitUrl = input('');
  readonly opened = output<AlertOpen>();

  protected readonly about = computed(() => describeAlert(this.alert()));
  protected readonly when = computed(() => whenLabel(this.alert().createdAt));

  /* Not the raw body: a deploy's repeats the time, a created task's is the image above. */
  protected readonly body = computed(() => this.about().detail);
}
