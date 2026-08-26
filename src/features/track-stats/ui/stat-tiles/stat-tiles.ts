import { Component, computed, input } from '@angular/core';

import { DEV_STATUSES, DEV_STATUS_LABEL, Task } from '@entities/task';

@Component({
  selector: 'app-stat-tiles',
  template: `
    @for (tile of tiles(); track tile.label) {
      <div class="tile">
        <span class="tile__label">{{ tile.label }}</span>
        <span class="tile__value tabular" [class.tile__value--negative]="tile.alarming">
          {{ tile.count }}
        </span>
      </div>
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.5rem;
    }

    .tile {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
      padding: 0.75rem 1rem;
    }

    .tile__label {
      font-size: 0.8125rem;
      color: var(--tui-text-secondary);
    }

    .tile__value {
      font-size: 1.375rem;
      font-weight: 600;
      color: var(--tui-text-primary);
    }

    .tile__value--negative {
      color: var(--tui-status-negative);
    }
  `,
})
export class StatTiles {
  readonly tasks = input.required<readonly Task[]>();

  protected readonly tiles = computed(() =>
    DEV_STATUSES.map((status) => {
      const count = this.tasks().filter((task) => task.devStatus === status).length;
      return {
        label: DEV_STATUS_LABEL[status],
        count,
        alarming: status === 'blocked' && count > 0,
      };
    }),
  );
}
