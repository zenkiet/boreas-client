import { Component, input } from '@angular/core';

@Component({
  selector: 'app-inset-group',
  template: `
    @if (label()) {
      <div class="head">
        <h2 class="head__label">{{ label() }}</h2>
        @if (trailing()) {
          <span class="head__trailing tabular" aria-live="polite">{{ trailing() }}</span>
        }
      </div>
    }
    <div class="box">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0 0.25rem 0.375rem;
    }

    .head__label {
      margin: 0;
      font-size: 0.8125rem;
      font-weight: 500;
      line-height: 1.4;
      color: var(--tui-text-tertiary);
    }

    .head__trailing {
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
      white-space: nowrap;
    }

    .box {
      overflow: hidden;
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
    }
  `,
})
export class InsetGroup {
  readonly label = input('');
  readonly trailing = input('');
}
