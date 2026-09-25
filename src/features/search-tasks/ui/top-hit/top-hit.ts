import { Component, computed, input, output } from '@angular/core';

import { DEV_STATUS_DOT, DEV_STATUS_LABEL } from '@entities/task';
import { splitMatch } from '../../model/search-query';
import { FleetTask } from '../../model/search-tasks.store';

@Component({
  selector: 'app-top-hit',
  /* It sits in an inset group, whose ion-list Ionic marks role="list". */
  host: { role: 'listitem' },
  template: `
    @let hit = entry();
    <div class="flex gap-3 px-5 py-4">
      <i class="mt-[7px] size-2.5 flex-none rounded-full" [class]="dot()" aria-hidden="true"></i>
      <div class="min-w-0 flex-1">
        <p class="id">
          <span class="text-label-3">{{ hit.project.slug }}/</span
          ><span class="text-label-3">{{ name()[0] }}</span
          ><span class="text-label">{{ name()[1] }}</span
          ><span class="text-label-3">{{ name()[2] }}</span>
        </p>
        <p class="sub">
          {{ hit.project.name }}
          @if (hit.task.description) {
            · {{ hit.task.description }}
          }
        </p>
        <p class="state" [class]="tone()">{{ state() }}</p>
        <div class="mt-3.5 flex flex-wrap gap-2">
          <button type="button" class="act" (click)="taskOpened.emit(hit)">Open</button>
          <button type="button" class="act" (click)="logsOpened.emit(hit)">Logs</button>
          @if (hit.task.status === 'running') {
            <a
              class="act"
              target="_blank"
              rel="noopener"
              [href]="visitUrl()"
              [attr.aria-label]="'Open ' + hit.task.name + ' in the browser'"
              (click)="visited.emit(hit)"
            >
              <span class="icon-[regular--arrow-up-right-from-square]" aria-hidden="true"></span>
              Visit
            </a>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    p {
      margin: 0;
    }

    /* The unmatched part is label-3, not the board's 55% opacity, which fails AA. */
    .id {
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 1.0625rem;
      line-height: 1.4375rem;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sub {
      overflow: hidden;
      margin-block-start: 0.125rem;
      font-size: 0.875rem;
      line-height: 1.1875rem;
      color: var(--app-text-tertiary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .state {
      margin-block-start: 0.25rem;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .act {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      block-size: 2.125rem;
      padding: 0 0.875rem;
      border: 0;
      border-radius: 1.0625rem;
      background: var(--app-accent-soft);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--app-accent-text);
      text-decoration: none;
      cursor: pointer;
    }

    .act [class*='icon-['] {
      font-size: 0.9375rem;
    }
  `,
})
export class TopHit {
  readonly entry = input.required<FleetTask>();
  readonly needle = input('');
  readonly visitUrl = input('');
  readonly taskOpened = output<FleetTask>();
  readonly logsOpened = output<FleetTask>();
  readonly visited = output<FleetTask>();

  protected readonly name = computed(() => splitMatch(this.entry().task.name, this.needle()));
  protected readonly dot = computed(() => DEV_STATUS_DOT[this.entry().task.devStatus]);

  protected readonly tone = computed(() =>
    this.entry().task.devStatus === 'blocked'
      ? 'text-blocked'
      : this.entry().task.devStatus === 'ready'
        ? 'text-ready'
        : 'text-progress',
  );

  protected readonly state = computed(() => {
    const { devStatus, status } = this.entry().task;
    return `${DEV_STATUS_LABEL[devStatus]} · ${status}`;
  });
}
