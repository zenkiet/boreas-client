import { Component, computed, input } from '@angular/core';
import { TUI_ALWAYS_DASHED, TuiAxes, TuiLineChart, TuiLineChartHint } from '@taiga-ui/addon-charts';
import { TuiPoint } from '@taiga-ui/core';

import { SystemStats } from '@entities/system-stats';
import { StatsSample } from '../../model/stats-history.store';

@Component({
  selector: 'app-stats-trend',
  imports: [TuiAxes, TuiLineChart, TuiLineChartHint],
  template: `
    <header class="trend__head">
      <span class="trend__label">Running tasks {{ spanLabel() }}</span>
      <span class="trend__value tabular">
        {{ stats().runningTasks }}
        <span class="trend__note">of {{ stats().totalTasks }} tasks</span>
      </span>
    </header>

    @if (points().length >= 2) {
      <tui-axes
        class="trend__axes"
        [tuiLineChartHint]="hint"
        [axisXLabels]="xLabels()"
        [horizontalLines]="2"
        [horizontalLinesHandler]="dashed"
      >
        <tui-line-chart
          [x]="0"
          [y]="0"
          [width]="width()"
          [height]="yMax()"
          [value]="points()"
          [filled]="true"
          [xStringify]="xStringify()"
          [yStringify]="yStringify"
        />
      </tui-axes>
      <ng-template #hint let-points>
        <span class="tabular">{{ hintLabel(points) }}</span>
      </ng-template>
    } @else {
      <p class="trend__collecting">Collecting activity — the first points land within a minute.</p>
    }
  `,
  styles: `
    :host {
      display: block;
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
      padding: 0.875rem 1rem 0.75rem;
    }

    .trend__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 1rem;
      margin-block-end: 0.5rem;
    }

    .trend__label {
      font-size: 0.8125rem;
      color: var(--tui-text-secondary);
    }

    .trend__value {
      font-size: 1.375rem;
      font-weight: 600;
      color: var(--tui-text-primary);
    }

    .trend__note {
      font-size: 0.8125rem;
      font-weight: 400;
      color: var(--tui-text-tertiary);
    }

    .trend__axes {
      block-size: 6.5rem;
      font-size: 0.6875rem;
      color: var(--tui-text-tertiary);
    }

    /* TuiLineChart inherits currentColor, so set the series color on the chart host. */
    .trend__axes tui-line-chart {
      color: var(--tui-background-accent-1);
    }

    .trend__collecting {
      margin: 0;
      padding-block: 1.5rem;
      font-size: 0.875rem;
      color: var(--tui-text-tertiary);
      text-align: center;
    }
  `,
})
export class StatsTrend {
  readonly stats = input.required<SystemStats>();
  readonly samples = input.required<readonly StatsSample[]>();

  protected readonly dashed = TUI_ALWAYS_DASHED;

  private readonly firstAt = computed(() => this.samples()[0]?.at ?? 0);

  protected readonly points = computed<readonly TuiPoint[]>(() =>
    this.samples().map((sample) => [(sample.at - this.firstAt()) / 1000, sample.running]),
  );

  protected readonly width = computed(() => Math.max(this.points().at(-1)?.[0] ?? 0, 1));

  protected readonly yMax = computed(
    () => Math.max(...this.samples().map((sample) => sample.running), 2) + 1,
  );

  protected readonly spanLabel = computed(() => {
    if (this.points().length < 2) {
      return '';
    }
    const minutes = Math.max(Math.round((this.points().at(-1)?.[0] ?? 0) / 60), 1);
    return `· last ${minutes} min`;
  });

  protected readonly xLabels = computed(() => {
    const points = this.points();
    if (points.length < 2) {
      return [];
    }
    const mid = points[Math.floor(points.length / 2)];
    const anchors =
      points.length >= 3 ? [points[0], mid, points.at(-1)!] : [points[0], points.at(-1)!];
    return anchors.map(([x]) => this.timeOf(x));
  });

  protected readonly xStringify = computed(() => (x: number) => this.timeOf(x));

  protected readonly yStringify = (y: number): string => `${y} running`;

  protected hintLabel(points: readonly TuiPoint[]): string {
    const [x, y] = points[0] ?? [0, 0];
    return `${this.timeOf(x)} · ${y} running`;
  }

  private timeOf(offsetSeconds: number): string {
    /* Include seconds while minute-only labels would all be identical. */
    const seconds = (this.points().at(-1)?.[0] ?? 0) < 300;
    return new Date(this.firstAt() + offsetSeconds * 1000).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      ...(seconds ? { second: '2-digit' } : {}),
    });
  }
}
