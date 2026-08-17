import { Component, input, output } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

import { Project } from '@entities/project';
import { ProjectSummary } from '../../model/list-projects.store';

const MAX_DOTS = 6;

@Component({
  selector: 'app-project-list',
  imports: [TuiIcon],
  template: `
    @for (summary of summaries(); track summary.project.id) {
      <button
        type="button"
        class="row row-divider relative"
        (click)="projectOpened.emit(summary.project)"
      >
        <span class="min-w-0 flex-1">
          <span class="row__name">{{ summary.project.name }}</span>
          <span class="row__sub tabular"
            >/{{ summary.project.slug }} · {{ taskLabel(summary) }}</span
          >
        </span>

        <span class="row__dots" aria-hidden="true">
          @for (task of summary.tasks.slice(0, maxDots); track task.id) {
            <i class="row__dot" [attr.data-status]="task.status"></i>
          }
          @if (summary.tasks.length > maxDots) {
            <span class="row__more tabular">+{{ summary.tasks.length - maxDots }}</span>
          }
        </span>

        <tui-icon class="row__chevron" icon="@tui.chevron-right" aria-hidden="true" />
      </button>
    }
  `,
  styles: `
    /* Tailwind has no preflight, so reset the button's user-agent styles here. */
    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      inline-size: 100%;
      margin: 0;
      border: 0;
      padding: 0.6875rem 1rem;
      min-block-size: 3.75rem;
      background: none;
      font: inherit;
      color: inherit;
      text-align: start;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: background-color var(--tui-duration);
    }

    .row:hover,
    .row:focus-visible,
    .row:active {
      background: var(--tui-background-neutral-1);
    }

    .row__name {
      display: block;
      overflow: hidden;
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--tui-text-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .row__sub {
      display: block;
      overflow: hidden;
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--tui-text-tertiary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .row__dots {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      flex: none;
    }

    .row__dot {
      inline-size: 0.375rem;
      block-size: 0.375rem;
      border-radius: 999px;
      background: var(--tui-status-neutral);
    }

    .row__dot[data-status='running'] {
      background: var(--tui-status-positive);
    }

    .row__dot[data-status='error'] {
      background: var(--tui-status-negative);
    }

    .row__dot[data-status='creating'],
    .row__dot[data-status='starting'] {
      background: var(--tui-status-warning);
    }

    .row__more {
      font-size: 0.75rem;
      color: var(--tui-text-tertiary);
    }

    .row__chevron {
      flex: none;
      font-size: 0.9375rem;
      color: var(--tui-text-tertiary);
    }
  `,
})
export class ProjectList {
  readonly summaries = input.required<readonly ProjectSummary[]>();
  readonly projectOpened = output<Project>();

  protected readonly maxDots = MAX_DOTS;

  protected taskLabel(summary: ProjectSummary): string {
    const total = summary.tasks.length;
    if (total === 0) return 'empty';

    const running = summary.tasks.filter((task) => task.status === 'running').length;
    return `${running}/${total} running`;
  }
}
