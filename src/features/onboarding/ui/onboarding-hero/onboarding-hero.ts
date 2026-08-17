import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { DotLottie } from '@lottiefiles/dotlottie-web';

@Component({
  selector: 'app-onboarding-hero',
  template: `
    <div class="hero" aria-hidden="true">
      <span class="hero__fallback">
        <img src="/brand-mark.png" width="96" height="96" alt="" />
      </span>
      <canvas #canvas class="hero__canvas"></canvas>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .hero {
      position: relative;
      inline-size: 14rem;
      block-size: 14rem;
      margin-block: -1.25rem -0.5rem;
      pointer-events: none;
    }

    .hero__canvas,
    .hero__fallback {
      position: absolute;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
    }

    .hero__canvas {
      display: block;
    }

    .hero__fallback {
      display: grid;
      place-items: center;
      opacity: 0.9;
    }

    .hero__fallback img {
      inline-size: 6rem;
      block-size: 6rem;
    }

    @media (max-width: 30rem) {
      .hero {
        inline-size: 12rem;
        block-size: 12rem;
      }
    }
  `,
})
export class OnboardingHero {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  constructor() {
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) return;

      const reducedMotion = view.matchMedia('(prefers-reduced-motion: reduce)').matches;
      DotLottie.setWasmUrl('/animations/dotlottie-player.wasm');

      const player = new DotLottie({
        canvas: this.canvas().nativeElement,
        src: '/animations/boreas-welcome.json',
        autoplay: !reducedMotion,
        loop: !reducedMotion,
        layout: { fit: 'contain', align: [0.5, 0.5] },
        renderConfig: {
          autoResize: true,
          devicePixelRatio: Math.min(view.devicePixelRatio, 1.5),
          freezeOnOffscreen: true,
          quality: 90,
        },
      });

      this.destroyRef.onDestroy(() => player.destroy());
    });
  }
}
