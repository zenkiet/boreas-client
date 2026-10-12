import { Component, computed, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, map } from 'rxjs';

@Component({
  selector: 'app-bora-waiting',
  template: `
    <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
    {{ label() }}
    <span class="tabular text-label-3" aria-hidden="true">{{ seconds() }}s</span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      align-self: flex-start;
      padding: 0.75rem 1rem;
      border-radius: 1.25rem;
      background: var(--ion-item-background);
      font-size: 0.9375rem;
      color: var(--app-text-secondary);
    }

    .dots {
      display: inline-flex;
      gap: 0.25rem;
    }

    .dots i {
      inline-size: 0.375rem;
      block-size: 0.375rem;
      border-radius: 50%;
      background: var(--ion-color-primary);
      opacity: 0.6;
      animation: pulse 1.2s ease-in-out infinite;
    }

    .dots i:nth-child(2) {
      animation-delay: 0.15s;
    }

    .dots i:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes pulse {
      0%,
      80%,
      100% {
        opacity: 0.25;
      }

      40% {
        opacity: 1;
      }
    }
  `,
})
/** The wait while Bora answers: what it does now, and for how long. */
export class BoraWaiting {
  readonly since = input.required<number>();
  readonly label = input('Looking into it…');

  private readonly now = toSignal(interval(1000).pipe(map(() => Date.now())), {
    initialValue: Date.now(),
  });

  protected readonly seconds = computed(() =>
    Math.max(0, Math.floor((this.now() - this.since()) / 1000)),
  );
}
