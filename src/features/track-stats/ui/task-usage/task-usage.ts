import { Component, computed, input } from '@angular/core';

import type { MetricPoint } from '@entities/system-stats';
import { sparkline } from '@shared/lib/chart/sparkline';
import { Metric, splitMetric } from '../live-monitor/metric';

/* Chart box heights in SVG units; the SVGs stretch, strokes stay 2px. */
const SPARK_H = 34;
const CHART_H = 80;

@Component({
  selector: 'app-task-usage',
  /* It sits in an inset group, whose ion-list Ionic marks role="list". */
  host: { role: 'listitem' },
  template: `
    <div class="narrow-only grid grid-cols-2">
      @for (tile of tiles(); track tile.label) {
        <div class="tile">
          <span class="text-[13px] text-label-3">{{ tile.label }}</span>
          <div class="text-[22px] leading-7 font-semibold tabular">{{ tile.value }}</div>
          <svg
            class="mt-1.5 block h-[34px] w-full"
            viewBox="0 0 100 34"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path class="spark" [attr.d]="tile.line" />
          </svg>
        </div>
      }
    </div>

    <div class="wide-only px-5 py-3.5">
      <div class="flex gap-6">
        @for (stat of stats(); track stat.label) {
          <div>
            <span class="text-[13px] text-label-3">{{ stat.label }}</span>
            <div class="text-[22px] leading-7 font-semibold tabular">{{ stat.value }}</div>
          </div>
        }
      </div>
      <div class="relative mt-2">
        <svg
          class="block h-20 w-full"
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path class="grid" d="M0 0.5H100M0 40H100M0 79.5H100" />
          <path class="area" [attr.d]="cpu().area" />
          <path class="spark" [attr.d]="cpu().line" />
        </svg>
        <span class="axis" aria-hidden="true">{{ axisLabel() }}</span>
      </div>
      <div class="mt-1 flex justify-between text-[11px] text-label-3 tabular" aria-hidden="true">
        <span>{{ spanLabel() }}</span>
        <span>now</span>
      </div>
    </div>
  `,
  styles: `
    .tile {
      padding: 0.875rem 1rem 0.875rem 1.25rem;
    }

    .tile + .tile {
      padding: 0.875rem 1.25rem 0.875rem 1rem;
      border-inline-start: 1px solid var(--app-border-normal);
    }

    .spark {
      fill: none;
      stroke: var(--ion-color-primary);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }

    .area {
      fill: color-mix(in srgb, var(--ion-color-primary) 12%, transparent);
    }

    .grid {
      fill: none;
      stroke: var(--app-border-normal);
      vector-effect: non-scaling-stroke;
    }

    .axis {
      position: absolute;
      top: 0.25rem;
      left: 0;
      padding-inline-end: 0.25rem;
      background: var(--ion-item-background);
      font-size: 0.6875rem;
      line-height: 0.875rem;
      color: var(--app-text-tertiary);
    }
  `,
})
export class TaskUsage {
  readonly points = input.required<readonly MetricPoint[]>();

  private readonly now = computed(() => this.points().at(-1));

  protected readonly cpu = computed(() =>
    sparkline(
      this.points().map((point) => point.cpu),
      100,
      CHART_H,
    ),
  );

  protected readonly tiles = computed(() => [
    {
      label: 'CPU',
      value: this.value('cpu'),
      line: sparkline(
        this.points().map((point) => point.cpu),
        100,
        SPARK_H,
      ).line,
    },
    {
      label: 'Memory',
      value: this.value('mem'),
      line: sparkline(
        this.points().map((point) => point.mem),
        100,
        SPARK_H,
      ).line,
    },
  ]);

  protected readonly stats = computed(() => [
    { label: 'CPU', value: this.value('cpu') },
    { label: 'Memory', value: this.value('mem') },
    { label: 'Network', value: this.value('net') },
  ]);

  protected readonly axisLabel = computed(() => `${Math.ceil(this.cpu().top)}% CPU`);

  /* The window fills over the first minute; "60 s ago" would lie until it has. */
  protected readonly spanLabel = computed(() => {
    const points = this.points();
    const seconds = points.length > 1 ? Math.round((points.at(-1)!.at - points[0].at) / 1000) : 0;
    return `${seconds} s ago`;
  });

  private value(key: Metric): string {
    const now = this.now();
    /* The first sample is only a baseline; "—" would read as "no data". */
    if (!now) return '…';
    const { value, unit } = splitMetric(key, now[key]);
    return key === 'cpu' ? `${value}${unit}` : `${value} ${unit}`;
  }
}
