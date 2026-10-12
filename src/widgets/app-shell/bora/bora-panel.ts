import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  inject,
  input,
  viewChild,
} from '@angular/core';

import { BoraStore } from '@features/bora/model';
import { reduced } from '@shared/ui/motion/motion';

import { BoraAnswer } from './bora-answer';
import { BoraChip } from './bora-chip';
import { BoraComposer } from './bora-composer';
import { BoraRecent } from './bora-recent';

@Component({
  selector: 'app-bora-panel',
  imports: [BoraAnswer, BoraChip, BoraComposer, BoraRecent],
  host: { role: 'complementary', 'aria-label': 'Bora', '(keydown.escape)': 'bora.close()' },
  template: `
    <div class="head">
      <!-- No close button: Bora below toggles the panel, as does Esc. -->
      <app-bora-chip class="grow" (opened)="bora.close()" />
      <button
        type="button"
        class="disc"
        aria-label="Recent conversations"
        [attr.aria-pressed]="bora.recent()"
        (click)="bora.recent.set(!bora.recent())"
      >
        <span class="icon-[regular--clock-rotate-left]" aria-hidden="true"></span>
      </button>
    </div>
    <div #body class="body">
      <!-- Hidden, not destroyed: the conversation keeps its scroll while Recent shows. -->
      <app-bora-answer [style.display]="bora.recent() ? 'none' : null" (left)="bora.close()" />
      @if (bora.recent()) {
        <app-bora-recent />
      }
    </div>
    <div class="foot" [style.display]="bora.recent() ? 'none' : null">
      <app-bora-composer />
    </div>
  `,
  styles: `
    /* Above Bora (the layer's --right and --bottom), 12 px clear; at most 640 px, under the header. */
    :host {
      position: fixed;
      z-index: 5;
      inset-block-end: calc(var(--bottom) + 68px);
      inset-inline-end: var(--right);
      display: flex;
      flex-direction: column;
      inline-size: 360px;
      max-block-size: min(640px, 100dvh - var(--bottom) - 140px);
      border-radius: 28px;
      background: var(--app-sheet);
      -webkit-backdrop-filter: blur(30px) saturate(180%);
      backdrop-filter: blur(30px) saturate(180%);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.7),
        0 0 0 0.5px rgba(15, 23, 42, 0.1),
        0 24px 64px rgba(15, 23, 42, 0.18);
      /* Bora's centre: 28 px in from the edge, 40 px below (the 68 px less half of Bora). */
      transform-origin: calc(100% - 28px) calc(100% + 40px);
    }

    /* It grows out of Bora with a slight overshoot and shrinks back into it. */
    @media (prefers-reduced-motion: no-preference) {
      :host {
        --appear-scale: 0.2;
      }

      :host(.fx-appear) {
        animation-duration: 460ms;
        animation-timing-function: cubic-bezier(0.34, 1.3, 0.64, 1);
      }

      :host(.fx-out) {
        animation: shrink 200ms var(--e-in) both;
      }
    }

    @keyframes shrink {
      to {
        opacity: 0;
        scale: 0.6;
      }
    }

    :host-context(.ion-palette-dark) {
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 0 0 0.5px rgba(255, 255, 255, 0.1),
        0 24px 64px rgba(0, 0, 0, 0.6);
    }

    @media (min-width: 80rem) {
      :host {
        inline-size: 400px;
      }
    }

    .head {
      display: flex;
      align-items: center;
      gap: 10px;
      min-block-size: 64px;
      padding: 10px 12px 6px;
    }

    .grow {
      flex-grow: 1;
    }

    .disc {
      display: grid;
      flex: none;
      place-items: center;
      inline-size: 2.75rem;
      block-size: 2.75rem;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: var(--app-fill);
      font-size: 1.125rem;
      color: var(--app-text-secondary);
      cursor: pointer;
    }

    .body {
      flex-grow: 1;
      min-block-size: 0;
      padding: 4px 14px 12px;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    .foot {
      padding: 8px 12px 12px;
    }
  `,
})
export class BoraPanel {
  protected readonly bora = inject(BoraStore);

  readonly home = input<HTMLElement>();

  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');

  constructor() {
    const host: HTMLElement = inject(ElementRef).nativeElement;
    const before = host.ownerDocument.activeElement;
    // No autofocus on a touch screen: its keyboard would cover the questions.
    afterNextRender(() => {
      const asked = !!this.bora.conversation()?.messages.length;
      const type =
        !asked && !!host.ownerDocument.defaultView?.matchMedia('(pointer: fine)').matches;
      host.querySelector<HTMLElement>(type ? 'textarea' : 'h2')?.focus({ preventScroll: true });
    });
    inject(DestroyRef).onDestroy(() => {
      const back =
        before instanceof HTMLElement && before !== before.ownerDocument.body && before.isConnected
          ? before
          : this.home();
      // Bora shows again only further on in this render.
      queueMicrotask(() => back?.focus({ preventScroll: true }));
    });
    afterRenderEffect(() => {
      const talk = this.bora.conversation();
      if (!talk?.messages.length) return;
      void talk.asking;
      const body = this.body().nativeElement;
      body.scrollTo({ top: body.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' });
    });
  }
}
