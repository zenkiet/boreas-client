import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { SystemStats } from '@entities/system-stats';
import { MEGABYTE, formatBytes, toByteSize } from '@shared/lib/format/bytes';

@Component({
  selector: 'app-stat-tiles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tile">
      <span class="tile__label">Stopped or error</span>
      <span class="tile__value tabular" [class.tile__value--negative]="stats().stoppedTasks > 0">
        {{ stats().stoppedTasks }}
      </span>
    </div>

    <div class="tile">
      <span class="tile__label">Memory</span>
      <span class="tile__value tabular">
        {{ memoryValue() }}
        @if (hostMemory()) {
          <span class="tile__note">of {{ hostMemory() }}</span>
        }
      </span>
    </div>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: 1fr 1fr;
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

    .tile__note {
      font-size: 0.8125rem;
      font-weight: 400;
      color: var(--tui-text-tertiary);
    }
  `,
})
export class StatTiles {
  readonly stats = input.required<SystemStats>();

  protected readonly memoryValue = computed(() => {
    const { value, unit } = toByteSize(this.stats().containerMemoryMb * MEGABYTE);
    return `${value} ${unit}`;
  });

  protected readonly hostMemory = computed(() =>
    this.stats().totalMemoryMb > 0 ? formatBytes(this.stats().totalMemoryMb * MEGABYTE) : '',
  );
}
