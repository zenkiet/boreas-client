import { Component, input, model } from '@angular/core';

import { NumericText } from '../motion/numeric-text';

interface Chip<K> {
  readonly key: K;
  readonly label: string;
  readonly count?: number;
}

@Component({
  selector: 'app-filter-chips',
  imports: [NumericText],
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
        <!-- One span: the chip's flex gap would split "·" from its words. -->
        <span
          >{{ option.label }}
          @if (option.count) {
            · <app-numeric-text [value]="option.count" />
          }
        </span>
      </button>
    }
    <ng-content />
  `,
})
export class FilterChips<K extends string> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly Chip<K>[]>();
  readonly value = model.required<K>();
}
