import { Component, input, output } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-error-state',
  imports: [TuiButton, TuiIcon],
  template: `
    <div class="state" role="alert">
      <span class="state__icon" aria-hidden="true">
        <tui-icon class="icon-lg" icon="@tui.triangle-alert" />
      </span>
      <h2 class="state__title">{{ title() }}</h2>
      <p class="state__description">{{ message() }}</p>
      <button tuiButton type="button" size="s" appearance="secondary" (click)="retry.emit()">
        <tui-icon class="icon-sm" icon="@tui.refresh-cw" />
        Try again
      </button>
    </div>
  `,
  styles: `
    .state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 3rem 1.5rem;
      border: 1px solid var(--tui-status-negative-pale-hover);
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
      text-align: center;
    }

    .state__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 2.75rem;
      block-size: 2.75rem;
      margin-block-end: 0.25rem;
      border-radius: var(--tui-radius-m);
      background: var(--tui-status-negative-pale);
      color: var(--tui-status-negative);
    }

    .state__title {
      margin: 0;
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--tui-text-primary);
    }

    .state__description {
      max-inline-size: 30rem;
      margin: 0 0 0.5rem;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--tui-text-secondary);
    }
  `,
})
export class ErrorState {
  readonly title = input('Something went wrong');
  readonly message = input.required<string>();
  readonly retry = output<void>();
}
