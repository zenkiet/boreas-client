import { Component, computed, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

export type CalloutTone = 'info' | 'positive' | 'warning' | 'negative';

const TONE_ICON: Record<CalloutTone, string> = {
  info: '@tui.info',
  positive: '@tui.circle-check',
  warning: '@tui.triangle-alert',
  negative: '@tui.circle-alert',
};

@Component({
  selector: 'app-callout',
  imports: [TuiIcon],
  /* Block keeps a host role="alert" from collapsing to an inline box in grid or flex layouts. */
  host: { class: 'block' },
  template: `
    <div class="callout" [attr.data-tone]="tone()" [attr.data-size]="size()">
      <tui-icon class="callout__icon icon-sm" [icon]="icon() || defaultIcon()" aria-hidden="true" />
      <div class="callout__body">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .callout {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.6875rem 0.875rem;
      border: 1px solid transparent;
      border-radius: var(--tui-radius-m);
      font-size: 0.9375rem;
      line-height: 1.45;
    }

    .callout[data-size='s'] {
      padding: 0.5rem 0.625rem;
      font-size: 0.8125rem;
    }

    .callout__icon {
      margin-block-start: 0.0625rem;
      flex-shrink: 0;
    }

    .callout__body {
      min-inline-size: 0;
    }

    .callout[data-tone='info'] {
      border-color: var(--tui-status-info-pale-hover);
      background: var(--tui-status-info-pale);
      color: var(--tui-status-info);
    }

    .callout[data-tone='positive'] {
      border-color: var(--tui-status-positive-pale-hover);
      background: var(--tui-status-positive-pale);
      color: var(--tui-status-positive);
    }

    .callout[data-tone='warning'] {
      border-color: var(--tui-status-warning-pale-hover);
      background: var(--tui-status-warning-pale);
      color: var(--tui-status-warning);
    }

    .callout[data-tone='negative'] {
      border-color: var(--tui-status-negative-pale-hover);
      background: var(--tui-status-negative-pale);
      color: var(--tui-status-negative);
    }
  `,
})
export class Callout {
  readonly tone = input<CalloutTone>('info');
  readonly size = input<'s' | 'm'>('m');
  readonly icon = input('');

  protected readonly defaultIcon = computed(() => TONE_ICON[this.tone()]);
}
