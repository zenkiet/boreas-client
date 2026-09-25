import { Component, input, output } from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';

@Component({
  selector: 'app-error-state',
  imports: [IonButton],
  template: `
    <div class="state" role="alert">
      <span class="state__icon" aria-hidden="true">
        <span class="icon-[light--triangle-exclamation]"></span>
      </span>
      <h2 class="state__title">{{ title() }}</h2>
      <p class="state__description">{{ message() }}</p>
      @if (retryable()) {
        <ion-button fill="clear" size="small" (click)="retry.emit()">
          <span slot="start" class="icon-[light--arrow-rotate-right]" aria-hidden="true"></span>
          Try again
        </ion-button>
      }
    </div>
  `,
  styles: `
    .state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 3rem 1.5rem;
      border: 1px solid var(--app-status-negative-pale-hover);
      border-radius: var(--app-radius-l);
      background: var(--app-background-base);
      text-align: center;
    }

    .state__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 2.75rem;
      block-size: 2.75rem;
      margin-block-end: 0.25rem;
      border-radius: var(--app-radius-m);
      background: var(--app-status-negative-pale);
      color: var(--app-status-negative);
      font-size: 1.375rem;
    }

    .state__title {
      margin: 0;
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--app-text-primary);
    }

    .state__description {
      max-inline-size: 30rem;
      margin: 0 0 0.5rem;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--app-text-secondary);
    }
  `,
})
export class ErrorState {
  readonly title = input('Something went wrong');
  readonly message = input.required<string>();
  readonly retryable = input(true);
  readonly retry = output<void>();
}
