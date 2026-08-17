import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-8">
      <hgroup class="flex min-w-0 flex-col gap-1.5">
        <h1 class="page-header__title">{{ title() }}</h1>
        @if (description()) {
          <p class="page-header__description">{{ description() }}</p>
        }
      </hgroup>
      <div class="flex flex-wrap items-center gap-2 empty:hidden md:shrink-0">
        <ng-content />
      </div>
    </header>
  `,
  styles: `
    .page-header__title {
      margin: 0;
      font-size: 2.125rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.022em;
      color: var(--tui-text-primary);
    }

    .page-header__description {
      max-inline-size: 46rem;
      margin: 0;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: var(--tui-text-secondary);
    }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly description = input('');
}
