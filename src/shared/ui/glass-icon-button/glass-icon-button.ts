import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'a[appGlassIconButton], button[appGlassIconButton]',
  imports: [TuiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-tone]': 'tone()' },
  template: `<tui-icon [icon]="icon()" />`,
  styles: `
    :host {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 2.75rem;
      block-size: 2.75rem;
      margin: 0;
      border: 0;
      border-radius: 999px;
      padding: 0;
      background: var(--app-chrome-bg);
      -webkit-backdrop-filter: var(--app-chrome-filter);
      backdrop-filter: var(--app-chrome-filter);
      box-shadow:
        0 0.5rem 2rem rgba(0, 0, 0, 0.09),
        inset 0 0 0.75rem var(--app-chrome-glow);
      color: var(--tui-text-action);
      text-decoration: none;
      cursor: pointer;
      transition:
        transform var(--tui-duration) var(--tui-curve-expressive-entrance),
        filter calc(var(--tui-duration) / 2) ease;
    }

    :host(:active) {
      transform: scale(1.25);
      filter: brightness(3);
    }

    :host(:disabled) {
      opacity: 0.4;
      pointer-events: none;
    }

    /* An xor mask lets the gradient follow the circular bevel. */
    :host::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: var(--app-chrome-bevel);
      pointer-events: none;
      -webkit-mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
      mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
      -webkit-mask-origin: content-box, border-box;
      mask-origin: content-box, border-box;
      -webkit-mask-clip: content-box, border-box;
      mask-clip: content-box, border-box;
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }

    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      :host {
        background: var(--tui-background-elevation-3);
      }
    }

    :host([data-tone='negative']) {
      background: var(--tui-status-negative-pale);
      color: var(--tui-text-negative);
    }

    :host-context([tuiAppBarButton]) {
      background: none;
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
      box-shadow: none;
    }

    :host-context([tuiAppBarButton])::after {
      content: none;
    }

    :host-context([tuiAppBarButton]):active {
      transform: none;
      filter: none;
    }
  `,
})
export class GlassIconButton {
  readonly icon = input.required<string>();
  readonly tone = input<'accent' | 'negative'>('accent');
}
