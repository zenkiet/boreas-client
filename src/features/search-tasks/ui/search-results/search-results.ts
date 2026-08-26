import { Component, input, output } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

import { FleetTask } from '../../model/search-tasks.store';

@Component({
  selector: 'app-search-results',
  imports: [TuiIcon],
  template: `
    @for (entry of entries(); track entry.task.id) {
      <button type="button" class="result" (click)="taskOpened.emit(entry)">
        <span class="result__dot" [attr.data-dev]="entry.task.devStatus" aria-hidden="true"></span>
        <span class="min-w-0 flex-1">
          <span class="result__id">
            <span class="result__project">{{ entry.project.slug }}/</span>{{ entry.task.name }}
            <span class="sr-only">, {{ entry.task.status }}</span>
          </span>
          <span class="result__sub">{{ entry.task.description || '—' }}</span>
        </span>
        <tui-icon class="result__chevron" icon="@tui.chevron-right" aria-hidden="true" />
      </button>
    } @empty {
      <p class="result__empty">
        {{ query() ? 'No results for "' + query() + '".' : 'No tasks yet.' }}
      </p>
    }
  `,
  styles: `
    /* Tailwind has no preflight, so reset the button's user-agent styles here. */
    .result {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      inline-size: 100%;
      margin: 0;
      border: 0;
      padding: 0.6875rem 1rem;
      min-block-size: 3.25rem;
      background: none;
      font: inherit;
      color: inherit;
      text-align: start;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: background-color var(--tui-duration);
    }

    .result:hover,
    .result:focus-visible {
      background: var(--tui-background-neutral-1);
    }

    .result + .result {
      border-block-start: 1px solid var(--tui-border-normal);
    }

    .result__dot {
      inline-size: 0.4375rem;
      block-size: 0.4375rem;
      flex: none;
      border-radius: 999px;
      background: var(--tui-status-neutral);
    }

    .result__dot[data-dev='in_progress'] {
      background: var(--tui-status-warning);
    }

    .result__dot[data-dev='blocked'] {
      background: var(--tui-status-negative);
    }

    .result__dot[data-dev='ready'] {
      background: var(--tui-status-positive);
    }

    .result__id {
      display: block;
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--tui-text-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .result__project {
      color: var(--tui-text-tertiary);
      font-weight: 500;
    }

    .result__sub {
      display: block;
      overflow: hidden;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .result__chevron {
      flex: none;
      font-size: 0.9375rem;
      color: var(--tui-text-tertiary);
    }

    .result__empty {
      margin: 0;
      padding: 2rem 1rem;
      font-size: 0.9375rem;
      color: var(--tui-text-tertiary);
      text-align: center;
    }
  `,
})
export class SearchResults {
  readonly entries = input.required<readonly FleetTask[]>();
  readonly query = input('');
  readonly taskOpened = output<FleetTask>();
}
