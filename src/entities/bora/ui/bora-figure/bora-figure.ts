import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { DotLottie } from '@lottiefiles/dotlottie-web';

import { LOTTIE_WASM, lottieConfig } from '@shared/ui/lottie/lottie';
import { once, reduced } from '@shared/ui/motion/motion';
import type { BoraShadow, BoraState } from '../../model/bora';

const LOOPED: ReadonlySet<BoraState> = new Set(['listen', 'think']);

/** The size is fixed per use: the player is made once. */
@Component({
  selector: 'app-bora-figure',
  template: `
    <span class="glow"></span>
    <span #shade class="shade" [attr.data-shadow]="shadow()"></span>
    <canvas #canvas class="canvas"></canvas>
    <!-- A flat glyph stands in until the player draws, and for good where it never can. -->
    @if (!ready()) {
      <svg class="glyph" viewBox="0 0 100 100">
        <path
          fill="#0080F0"
          d="M45.5 43.8C43.2 33.5 47.8 20.5 60 20.5C68.2 20.5 74.1 29.3 68.2 36C63.7 40.4 56.9 36.5 58.2 30.7C58.4 29.9 60.9 30.2 60.8 31.3C60.1 34.2 63.4 34.5 64.9 32.9C68 29.5 63.1 26.5 60 26.5C52.3 26.5 51.3 36.7 52.5 42.2Z"
        />
        <path
          fill="#0080F0"
          d="M50 38C70 38 84.5 52.5 84.5 71C84.5 86 72 94 50 94C28 94 15.5 86 15.5 71C15.5 52.5 30 38 50 38Z"
        />
        <ellipse cx="40" cy="67" rx="5" ry="6.6" fill="#0B1B3A" />
        <ellipse cx="60" cy="67" rx="5" ry="6.6" fill="#0B1B3A" />
        <circle cx="38.4" cy="64" r="1.9" fill="#FFF" />
        <circle cx="58.4" cy="64" r="1.9" fill="#FFF" />
        <path
          d="M45.6 75.6Q50 79.6 54.4 75.6"
          fill="none"
          stroke="#0B1B3A"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
    }
  `,
  host: {
    'aria-hidden': 'true',
    '[style.--bora]': 'size() + "px"',
    '[class.offline]': "state() === 'sleep'",
  },
  styles: `
    :host {
      position: relative;
      display: block;
      flex: none;
      inline-size: var(--bora);
      block-size: var(--bora);
    }

    .glyph {
      position: relative;
      display: block;
      inline-size: 100%;
      block-size: 100%;
    }

    /* The comp is 120 wide around the rig's 100, so halo, rings and hops have room. */
    .canvas {
      position: absolute;
      inset: -10%;
      inline-size: 120%;
      block-size: 120%;
    }

    :host(.offline) :is(.canvas, .glyph) {
      filter: saturate(0.45);
    }

    /* The contact line sits at 94% of the box; the shadow tells Bora's height. */
    .shade {
      position: absolute;
      inset-inline-start: 18%;
      inline-size: 64%;
      inset-block-start: 94%;
      block-size: 12.5%;
      translate: 0 calc(-50% + var(--bora) * 0.07);
      border-radius: 50%;
      background: radial-gradient(closest-side, rgb(15 23 42 / 0.26), transparent);
    }

    .shade[data-shadow='none'] {
      display: none;
    }

    :host-context(.ion-palette-dark) .shade {
      background: radial-gradient(closest-side, rgb(0 0 0 / 0.5), transparent);
    }

    .glow {
      display: none;
      position: absolute;
      inset: -14%;
      border-radius: 50%;
      background: radial-gradient(
        closest-side,
        rgb(0 136 255 / 0.4),
        rgb(0 136 255 / 0.12) 62%,
        transparent
      );
    }

    :host-context(.ion-palette-dark) .glow {
      display: block;
    }

    @media (prefers-reduced-transparency: reduce) {
      :host-context(.ion-palette-dark) .glow {
        display: none;
      }
    }
  `,
})
export class BoraFigure {
  readonly state = input<BoraState>('idle');
  readonly size = input(56);
  readonly shadow = input<BoraShadow>('rest');
  readonly still = input(false);
  /** One per syllable said: the mouth opens and closes once. */
  readonly beat = input(0);

  protected readonly ready = signal(false);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly shade = viewChild<ElementRef<HTMLElement>>('shade');
  private player?: DotLottie;
  private intro: BoraState | null = null;

  constructor() {
    const document = inject(DOCUMENT);
    let gone = false;
    inject(DestroyRef).onDestroy(() => {
      gone = true;
      this.player?.destroy();
    });

    afterNextRender(() => {
      const canvas = this.canvas()?.nativeElement;
      const view = document.defaultView;
      if (!canvas || !view) return;
      void import('@lottiefiles/dotlottie-web').then(({ DotLottie }) => {
        if (gone) return;
        DotLottie.setWasmUrl(LOTTIE_WASM);
        const player = new DotLottie({
          canvas,
          // Versioned: nginx caches the JSON for an hour, and an older one lacks newer markers.
          src: '/animations/bora.json?v=2',
          autoplay: false,
          loop: false,
          // Small and mostly still, so every device pixel is cheap: at 1.5× a 3× screen blurs it.
          ...lottieConfig(view, 3),
        });
        player.addEventListener('load', () => {
          this.ready.set(true);
          this.show(this.state(), this.still());
        });
        // A busy state's intro ends, then its loop runs until the state changes.
        player.addEventListener('complete', () => {
          const intro = this.intro;
          this.intro = null;
          if (!intro) return;
          player.setMarker(`${intro}-loop`);
          player.setLoop(true);
          player.play();
        });
        this.player = player;
      });
    });

    effect(() => {
      const state = this.state();
      const still = this.still();
      untracked(() => this.ready() && this.show(state, still));
    });

    effect(() => {
      const beat = this.beat();
      untracked(() => {
        if (!beat || this.state() !== 'talk' || this.still() || reduced()) return;
        this.player?.setMarker('talk');
        this.player?.play();
      });
    });
  }

  private show(state: BoraState, still: boolean): void {
    const player = this.player;
    if (!player) return;
    this.intro = null;
    player.setLoop(false);
    player.setMarker(state);
    const calm = still || reduced();
    const end = player.segment?.[1];
    if (calm) {
      if (end !== undefined) player.setFrame(end);
      return;
    }
    if (LOOPED.has(state)) this.intro = state;
    player.play();
    const shade = this.shade()?.nativeElement;
    if (shade && (state === 'heads' || state === 'done')) {
      once(
        shade,
        [
          { scale: '1', opacity: 1 },
          { scale: '1.05 1', offset: 0.1 },
          { scale: '1.2', opacity: 0.5, offset: 0.4 },
          { scale: '1.08 1', opacity: 1, offset: 0.63 },
          { scale: '1', opacity: 1 },
        ],
        900,
      );
    }
  }
}
