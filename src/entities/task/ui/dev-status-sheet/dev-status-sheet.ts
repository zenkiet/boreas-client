import { Component } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { DEV_STATUS_LABEL, DevStatus } from '../../model/task';

const DESCRIPTIONS: Record<DevStatus, string> = {
  in_progress: 'Being built — the default for a new task',
  blocked: 'Not fit for QA yet',
  ready: 'QA can test this build',
};

/** Picker rows in workflow order, not severity order. */
const OPTIONS = (['in_progress', 'blocked', 'ready'] as const).map((status) => ({
  status,
  label: DEV_STATUS_LABEL[status],
  description: DESCRIPTIONS[status],
}));

@Component({
  selector: 'app-dev-status-sheet',
  template: `
    @for (option of options; track option.status) {
      <button
        type="button"
        class="option"
        [class.option--current]="option.status === context.data"
        (click)="context.completeWith(option.status)"
      >
        <span class="option__dot" [attr.data-dev]="option.status" aria-hidden="true"></span>
        <span class="min-w-0 flex-1">
          <span class="option__label">{{ option.label }}</span>
          <span class="option__hint">{{ option.description }}</span>
        </span>
        @if (option.status === context.data) {
          <span class="option__check" aria-hidden="true">✓</span>
        }
      </button>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 0.25rem;
    }

    .option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      inline-size: 100%;
      margin: 0;
      border: 0;
      border-radius: 0.875rem;
      padding: 0.75rem;
      background: none;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    .option--current {
      background: var(--tui-background-neutral-1);
    }

    .option__dot {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      flex: none;
      border-radius: 999px;
    }

    .option__dot[data-dev='in_progress'] {
      background: var(--tui-status-warning);
    }

    .option__dot[data-dev='blocked'] {
      background: var(--tui-status-negative);
    }

    .option__dot[data-dev='ready'] {
      background: var(--tui-status-positive);
    }

    .option__label {
      display: block;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--tui-text-primary);
    }

    .option__hint {
      display: block;
      font-size: 0.75rem;
      color: var(--tui-text-tertiary);
    }

    .option__check {
      flex: none;
      font-weight: 700;
      color: var(--tui-text-action);
    }
  `,
})
export class DevStatusSheet {
  protected readonly options = OPTIONS;
  /** Completes with the picked status; the caller decides whether it changed. */
  protected readonly context = injectContext<TuiDialogContext<DevStatus, DevStatus>>();
}
