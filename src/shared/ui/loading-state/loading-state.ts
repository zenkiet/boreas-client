import { Component, input } from '@angular/core';
import { TuiLoader } from '@taiga-ui/core';

@Component({
  selector: 'app-loading-state',
  imports: [TuiLoader],
  template: `
    <div class="state" role="status" aria-live="polite">
      <tui-loader size="m" />
      <span class="state__label">{{ label() }}</span>
    </div>
  `,
  styles: `
    .state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.875rem;
      padding: 3.5rem 1.5rem;
      border: 1px solid var(--tui-border-normal);
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
    }

    .state__label {
      font-size: 0.9375rem;
      color: var(--tui-text-secondary);
    }
  `,
})
export class LoadingState {
  readonly label = input('Loading tasks');
}
