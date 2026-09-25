import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-filter-chips',
  host: {
    role: 'group',
    '[attr.aria-label]': 'label()',
    class: 'filter-chips',
  },
  template: `
    @for (option of options(); track option.key) {
      <button
        type="button"
        class="filter-chip"
        [attr.aria-pressed]="value() === option.key"
        (click)="value.set(option.key)"
      >
        {{ option.label }}
      </button>
    }
    <ng-content />
  `,
})
export class FilterChips<K extends string> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly { readonly key: K; readonly label: string }[]>();
  readonly value = model.required<K>();
}
