import { Component, input, output } from '@angular/core';

/** iOS-style switch. Taiga's tuiSwitch disables itself without a ControlValueAccessor, so a
 *  signal-driven control cannot use it — same reason GlassSelect exists. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[appGlassSwitch]',
  host: {
    type: 'button',
    role: 'switch',
    '[attr.aria-checked]': 'checked()',
    '[class.on]': 'checked()',
    '(click)': 'checkedChange.emit(!checked())',
  },
  template: `<span class="knob"></span>`,
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

    @media (prefers-reduced-motion: reduce) {
      .knob {
        transition: none;
      }
    }
  `,
})
export class GlassSwitch {
  readonly checked = input(false);
  readonly checkedChange = output<boolean>();
}
