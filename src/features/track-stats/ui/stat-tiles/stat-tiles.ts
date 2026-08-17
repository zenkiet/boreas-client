import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { SystemStats } from '@entities/system-stats';
import { MEGABYTE, formatBytes } from '@shared/lib/format/bytes';

@Component({
  selector: 'app-stat-tiles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tile">
      <span class="tile__label">Projects</span>
      <span class="tile__value tabular">{{ stats().totalProjects }}</span>
    </div>

    <div class="tile">
      <span class="tile__label">Stopped</span>
      <span class="tile__value tabular" [class.tile__value--negative]="stats().stoppedTasks > 0">
        {{ stats().stoppedTasks }}
      </span>
    </div>

    <div class="tile">
      <span class="tile__label">Host memory</span>
      <span class="tile__value tabular">{{ hostMemory() }}</span>
    </div>
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

    .tile__note {
      font-size: 0.8125rem;
      font-weight: 400;
      color: var(--tui-text-tertiary);
    }
  `,
})
export class StatTiles {
  readonly stats = input.required<SystemStats>();

  protected readonly hostMemory = computed(() =>
    this.stats().totalMemoryMb > 0
      ? formatBytes(this.stats().totalMemoryMb * MEGABYTE)
      : 'Unknown',
  );
}
