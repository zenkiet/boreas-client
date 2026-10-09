import { AnimationCallbackEvent, Component, computed, input } from '@angular/core';

import { collapse } from '../motion/effects';
import { settled } from '../motion/motion';
import { entrance } from '../motion/page-motion';

export type CalloutTone = 'info' | 'positive' | 'warning' | 'negative';

const TONE_ICON: Record<CalloutTone, string> = {
  info: 'icon-[light--circle-info]',
  positive: 'icon-[light--circle-check]',
  warning: 'icon-[light--triangle-exclamation]',
  negative: 'icon-[light--circle-exclamation]',
};

@Component({
  selector: 'app-callout',
  /* Block: a host role="alert" would otherwise collapse to an inline box. */
  host: { class: 'block', '[animate.enter]': 'enter()', '(animate.leave)': 'leave($event)' },
  template: `
    <!-- An unpadded box: a 0fr row cannot shrink below its item's padding. -->
    <div>
      <div class="callout" [attr.data-tone]="tone()">
        <span class="callout__icon" [class]="icon()" aria-hidden="true"></span>
        <div class="callout__body">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  /* Only the icon takes the tone: toned text would fail AA on its own tint. */
  styles: `
    .callout {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 1.375rem;
      background: var(--pale);
      font-size: 0.875rem;
      line-height: 1.36;
    }

    .callout__icon {
      flex-shrink: 0;
      font-size: 1.25rem;
      color: var(--tone);
    }

    .callout__body {
      min-inline-size: 0;
    }

    .callout[data-tone='info'] {
      --tone: var(--app-status-info);
      --pale: var(--app-status-info-pale);
    }

    .callout[data-tone='positive'] {
      --tone: var(--app-status-positive);
      --pale: var(--app-status-positive-pale);
    }

    .callout[data-tone='warning'] {
      --tone: var(--app-status-warning);
      --pale: var(--app-status-warning-pale);
    }

    .callout[data-tone='negative'] {
      --tone: var(--ion-color-danger);
      --pale: color-mix(in srgb, var(--ion-color-danger) 7%, transparent);
    }
  `,
})
export class Callout {
  readonly tone = input<CalloutTone>('info');

  protected readonly icon = computed(() => TONE_ICON[this.tone()]);
  protected readonly enter = entrance('fx-reveal');

  protected leave({ target, animationComplete }: AnimationCallbackEvent): void {
    const el = target as HTMLElement;
    if (settled(el)) collapse(el, animationComplete);
    else animationComplete();
  }
}
