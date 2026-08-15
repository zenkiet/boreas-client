import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Data } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';

import { Reveal } from '@shared/lib/motion/reveal.directive';

@Component({
  selector: 'app-coming-soon-page',
  imports: [Reveal, TuiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div appReveal class="page">
      <div class="orb" aria-hidden="true">
        <span class="orb__ring orb__ring--1"></span>
        <span class="orb__ring orb__ring--2"></span>
        <tui-icon class="orb__icon" [icon]="icon()" />
      </div>

      <h1 class="page__title">Coming soon</h1>
      <p class="page__copy">{{ description() }}</p>

      <span class="page__badge">In the works</span>
    </div>
  `,
  styles: `
    .page {
      display: flex;
      min-block-size: max(24rem, 62dvh);
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-inline: 1.5rem;
      text-align: center;
    }

    .orb {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 6rem;
      block-size: 6rem;
      border-radius: 50%;
      background: var(--tui-background-neutral-1);
      box-shadow:
        inset 0 0 0 1px var(--tui-border-normal),
        inset 0 1px 0 var(--app-chrome-glow);
    }

    .orb__icon {
      inline-size: 2.25rem;
      block-size: 2.25rem;
      font-size: 2.25rem;
      color: var(--tui-text-secondary);
    }

    .orb__ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 1px solid var(--tui-border-normal);
      opacity: 0;
    }

    @media (prefers-reduced-motion: no-preference) {
      .orb__ring {
        animation: orb-ripple 3.2s ease-out infinite;
      }

      .orb__ring--2 {
        animation-delay: 1.6s;
      }
    }

    @keyframes orb-ripple {
      from {
        transform: scale(1);
        opacity: 0.8;
      }

      to {
        transform: scale(1.9);
        opacity: 0;
      }
    }

    .page__title {
      margin: 1.75rem 0 0.5rem;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--tui-text-primary);
    }

    .page__copy {
      margin: 0;
      max-inline-size: 20rem;
      font-size: 1.0625rem;
      line-height: 1.5;
      color: var(--tui-text-secondary);
    }

    .page__badge {
      margin-block-start: 1.5rem;
      border-radius: 999px;
      padding: 0.375rem 0.875rem;
      background: var(--tui-background-neutral-1);
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--tui-text-secondary);
    }
  `,
})
export class ComingSoonPage {
  private readonly data = toSignal(inject(ActivatedRoute).data, { initialValue: {} as Data });

  protected readonly icon = computed(() => (this.data()['icon'] as string) ?? '@tui.sparkles');
  protected readonly description = computed(
    () =>
      (this.data()['description'] as string) ??
      'This feature is on the way. Check back in a future update.',
  );
}
