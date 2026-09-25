import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  /* Bare means inside an inset group, whose ion-list Ionic marks role="list". */
  host: { '[attr.role]': "bordered() ? null : 'listitem'" },
  template: `
    <div class="state" [class.state--bare]="!bordered()">
      <span class="state__icon" aria-hidden="true">
        <span [class]="icon()"></span>
      </span>
      <h2 class="state__title">{{ title() }}</h2>
      <p class="state__description">{{ description() }}</p>
      <div class="state__actions empty:hidden">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    .state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 3rem 1.5rem;
      border: 1px dashed var(--app-border-strong);
      border-radius: var(--app-radius-l);
      background: var(--app-background-base);
      text-align: center;
    }

    .state--bare {
      border: 0;
      border-radius: 0;
      background: transparent;
    }

    .state__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 2.75rem;
      block-size: 2.75rem;
      margin-block-end: 0.25rem;
      border-radius: var(--app-radius-m);
      background: var(--app-background-neutral-1);
      color: var(--app-text-tertiary);
      font-size: 1.375rem;
    }

    .state__title {
      margin: 0;
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--app-text-primary);
    }

    .state__description {
      max-inline-size: 26rem;
      margin: 0;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--app-text-secondary);
    }

    .state__actions {
      display: flex;
      gap: 0.5rem;
      margin-block-start: 0.5rem;
    }
  `,
})
export class EmptyState {
  /** An Iconify class, written out whole so Tailwind generates it. */
  readonly icon = input('icon-[light--cube]');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly bordered = input(true);
}
