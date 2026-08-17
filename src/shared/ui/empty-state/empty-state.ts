import { Component, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-empty-state',
  imports: [TuiIcon],
  template: `
    <div class="state" [class.state--bare]="!bordered()">
      <span class="state__icon" aria-hidden="true">
        <tui-icon class="icon-lg" [icon]="icon()" />
      </span>
      <h2 class="state__title">{{ title() }}</h2>
      <p class="state__description">{{ description() }}</p>
      <div class="state__actions empty:hidden">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 3rem 1.5rem;
      border: 1px dashed var(--app-border-strong);
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
      text-align: center;
    }

    .state--bare {
      border: 0;
      border-radius: 0;
      background: transparent;
    }

    .state__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 2.75rem;
      block-size: 2.75rem;
      margin-block-end: 0.25rem;
      border-radius: var(--tui-radius-m);
      background: var(--tui-background-neutral-1);
      color: var(--tui-text-tertiary);
    }

    .state__title {
      margin: 0;
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--tui-text-primary);
    }

    .state__description {
      max-inline-size: 26rem;
      margin: 0;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--tui-text-secondary);
    }

    .state__actions {
      display: flex;
      gap: 0.5rem;
      margin-block-start: 0.5rem;
    }
  `,
})
export class EmptyState {
  readonly icon = input('@tui.boxes');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly bordered = input(true);
}
