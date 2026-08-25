import { Component, input, output } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[appGlassSwitch]',
  host: {
    type: 'button',
    role: 'switch',
    '[attr.aria-checked]': 'checked()',
    '[attr.aria-busy]': 'busy()',
    '[class.on]': 'checked()',
    '[class.busy]': 'busy()',
    '(click)': 'onClick()',
  },
  template: `
    <span class="knob">
      @if (busy()) {
        <span class="spinner" aria-hidden="true">
          <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
        </span>
      }
    </span>
  `,
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      align-items: center;
      flex: none;
      inline-size: 3.1875rem;
      block-size: 1.9375rem;
      margin: 0;
      border: 0;
      border-radius: 999px;
      padding: 0;
      background: var(--tui-background-neutral-2);
      cursor: pointer;
      transition: background-color var(--tui-duration);
      -webkit-tap-highlight-color: transparent;
    }

    :host(.on) {
      background: var(--tui-background-accent-1);
    }

    :host(:focus-visible) {
      outline: 2px solid var(--tui-border-focus);
      outline-offset: 2px;
    }

    .knob {
      position: absolute;
      inset-block-start: 0.125rem;
      inset-inline-start: 0.125rem;
      display: grid;
      place-items: center;
      inline-size: 1.6875rem;
      block-size: 1.6875rem;
      border-radius: 999px;
      background: #fff;
      box-shadow:
        0 3px 8px rgba(0, 0, 0, 0.15),
        0 1px 1px rgba(0, 0, 0, 0.16);
      transition: transform var(--tui-duration) var(--tui-curve-expressive-standard);
    }

    :host(.on) .knob {
      transform: translateX(1.25rem);
    }

    :host(.busy) .knob {
      transform: translateX(0.625rem);
    }

    .spinner {
      position: relative;
      inline-size: 1rem;
      block-size: 1rem;
    }

    .spinner i {
      position: absolute;
      inset-inline-start: 46.5%;
      inset-block-start: 8%;
      inline-size: 7%;
      block-size: 26%;
      border-radius: 999px;
      /* The knob stays #fff in both themes, so the blades can stay a literal too. */
      background: rgba(60, 60, 67, 0.65);
      transform-origin: 50% 162%;
      animation: blade 0.8s linear infinite;
    }

    .spinner i:nth-child(1) { transform: rotate(0deg);   animation-delay: -0.8s; }
    .spinner i:nth-child(2) { transform: rotate(45deg);  animation-delay: -0.7s; }
    .spinner i:nth-child(3) { transform: rotate(90deg);  animation-delay: -0.6s; }
    .spinner i:nth-child(4) { transform: rotate(135deg); animation-delay: -0.5s; }
    .spinner i:nth-child(5) { transform: rotate(180deg); animation-delay: -0.4s; }
    .spinner i:nth-child(6) { transform: rotate(225deg); animation-delay: -0.3s; }
    .spinner i:nth-child(7) { transform: rotate(270deg); animation-delay: -0.2s; }
    .spinner i:nth-child(8) { transform: rotate(315deg); animation-delay: -0.1s; }

    @keyframes blade {
      from { opacity: 1; }
      to { opacity: 0.15; }
    }

    @media (prefers-reduced-motion: reduce) {
      .knob {
        transition: none;
      }
    }
  `,
})
export class GlassSwitch {
  readonly checked = input(false);
  readonly busy = input(false);
  readonly checkedChange = output<boolean>();

  protected onClick(): void {
    if (!this.busy()) {
      this.checkedChange.emit(!this.checked());
    }
  }
}
