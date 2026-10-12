import { Component, input } from '@angular/core';

type BoraSkyHealth = 'calm' | 'attention' | 'offline';

@Component({
  selector: 'app-bora-sky',
  host: { 'aria-hidden': 'true', '[class]': 'health()' },
  template: `
    <i class="stars s1"></i>
    <i class="stars s2"></i>
    <div class="aurora"><i class="r1"></i><i class="r2"></i><i class="r3"></i></div>
    <div class="band"></div>
    <svg class="ridge" viewBox="0 0 390 150" preserveAspectRatio="none">
      <path
        d="M0 96C36 80 64 76 100 88C136 100 158 74 194 66C230 58 260 84 294 80C330 76 358 62 390 70V150H0Z"
      />
    </svg>
  `,
  styles: `
    :host {
      --a-1: #34d399;
      --a-2: #22d3ee;
      --a-3: #5ab6ff;
      --a-4: #a78bfa;
      --a-o: 0.78;
      position: absolute;
      inset: 0;
      z-index: -1;
      overflow: hidden;
      pointer-events: none;
      background: radial-gradient(130% 75% at 50% 0%, #0c2550, #061430 48%, #02060f);
    }

    .stars {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      inline-size: 1px;
      block-size: 1px;
      border-radius: 50%;
    }

    .s1 {
      box-shadow:
        22px 70px #fff,
        64px 128px #ffffffb3,
        101px 44px #ffffff8c,
        139px 96px #fff,
        178px 62px #ffffff99,
        214px 118px #ffffffcc,
        251px 38px #fff,
        288px 84px #ffffff8c,
        326px 132px #ffffffbf,
        361px 58px #fff,
        40px 214px #ffffff73,
        118px 262px #ffffff80,
        296px 236px #ffffff73,
        352px 290px #ffffff66,
        18px 330px #ffffff59,
        372px 380px #ffffff4d;
    }

    .s2 {
      box-shadow:
        44px 100px #fff,
        92px 176px #ffffff99,
        160px 30px #ffffffcc,
        232px 168px #ffffff8c,
        270px 150px #fff,
        340px 104px #ffffffb3,
        12px 150px #ffffff99,
        196px 250px #ffffff66;
      animation: twinkle 4.8s ease-in-out infinite alternate;
    }

    .aurora {
      position: absolute;
      inset-inline: -30%;
      inset-block-start: 36px;
      block-size: 400px;
      filter: blur(30px);
      opacity: calc(var(--a-o) + var(--lvl, 0) * 0.2);
      mix-blend-mode: screen;
      transition: opacity 0.4s ease-out;
    }

    .aurora i {
      position: absolute;
      inset-inline: 0;
      border-radius: 50%;
      animation: drift 18s ease-in-out infinite alternate;
    }

    .aurora .r1 {
      inset-block-start: 30px;
      block-size: 120px;
      background: linear-gradient(
        90deg,
        transparent 8%,
        var(--a-1) 30%,
        var(--a-2) 58%,
        transparent 88%
      );
    }

    .aurora .r2 {
      inset-block-start: 104px;
      block-size: 100px;
      background: linear-gradient(
        90deg,
        transparent 12%,
        var(--a-2) 34%,
        var(--a-3) 62%,
        transparent 90%
      );
      opacity: 0.8;
      animation-duration: 22s;
      animation-direction: alternate-reverse;
    }

    .aurora .r3 {
      inset-block-start: 170px;
      block-size: 90px;
      background: linear-gradient(
        90deg,
        transparent 18%,
        var(--a-4) 40%,
        var(--a-3) 66%,
        transparent 92%
      );
      opacity: 0.65;
      animation-duration: 26s;
    }

    .band {
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      block-size: 300px;
      background: linear-gradient(to top, #fb71854d, #f472b61f 45%, transparent);
      opacity: 0;
      transition: opacity 0.6s;
    }

    .ridge {
      position: absolute;
      inset-inline-start: 0;
      inset-block-end: 0;
      inline-size: 100%;
      block-size: 150px;
      fill: #030915;
    }

    :host(.attention) {
      --a-4: #f472b6;
    }

    :host(.attention) .band {
      opacity: 1;
    }

    :host(.offline) {
      --a-1: #5b6b85;
      --a-2: #6b7a94;
      --a-3: #7d8ba3;
      --a-4: #56637a;
      --a-o: 0.45;
    }

    :host(.offline) .stars {
      opacity: 0.5;
    }

    @keyframes drift {
      from {
        transform: translateX(-8%) skewX(-12deg) scaleY(0.8);
      }
      to {
        transform: translateX(8%) skewX(10deg) scaleY(1.1);
      }
    }

    @keyframes twinkle {
      from {
        opacity: 0.35;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .aurora i,
      .s2 {
        animation: none;
      }
    }

    @media (prefers-reduced-transparency: reduce) {
      .aurora {
        opacity: 0.5;
      }
    }
  `,
})
export class BoraSky {
  readonly health = input<BoraSkyHealth>('calm');
}
