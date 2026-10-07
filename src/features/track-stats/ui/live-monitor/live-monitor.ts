import { Component, computed, input, output, signal } from '@angular/core';

import type { MetricPoint } from '@entities/system-stats';
import { toByteSize } from '@shared/lib/format/bytes';
import { LiveChart } from '../live-chart/live-chart';
import { METRICS, METRIC_COLOR, METRIC_LABEL, Metric, splitMetric } from './metric';

const WARN = 60;
const DANGER = 90;
const ZERO: MetricPoint = { at: 0, cpu: 0, mem: 0, net: 0 };

@Component({
  selector: 'app-live-monitor',
  imports: [LiveChart],
  host: { class: 'block rounded-card bg-cell px-4 py-3.5' },
  template: `
    <div role="group" aria-label="Highlight a metric" class="grid grid-cols-3 gap-1">
      @for (metric of metrics(); track metric.key) {
        <button
          type="button"
          class="flex min-w-0 cursor-pointer flex-col items-start gap-0.5 rounded-2xl border-0 bg-transparent px-2.5 pt-2 pb-[9px] text-start text-label aria-pressed:bg-fill"
          [attr.aria-pressed]="collapsed() ? null : focus() === metric.key"
          (click)="pick(metric.key)"
        >
          <span
            class="flex items-center gap-1.5 text-xs leading-4 font-semibold tracking-[0.04em] text-label-3 uppercase"
          >
            <i class="size-2 rounded-full" aria-hidden="true" [style.background]="metric.color"></i>
            {{ metric.label }}
          </span>
          <span class="flex items-baseline gap-[3px] whitespace-nowrap tabular">
            <span
              class="text-[22px] leading-[1.15] font-semibold tracking-[-0.02em] data-[state=danger]:text-danger data-[state=warn]:text-warn md:text-[26px]"
              [attr.data-state]="metric.state"
            >
              {{ metric.value }}
            </span>
            <span class="text-[13px] font-medium text-label-2">{{ metric.unit }}</span>
          </span>
          <span class="max-w-full truncate text-xs leading-4 text-label-3 tabular">
            {{ metric.sub }}
          </span>
        </button>
      }
    </div>

    @if (!collapsed()) {
      <!-- On idle, not on viewport: that trigger's runtime would land in the initial bundle. -->
      @defer (on idle) {
        <app-live-chart
          class="relative mx-1 mt-3 block h-[150px] touch-pan-y md:h-[190px] xl:h-[200px]"
          [series]="series()"
          [focus]="focus()"
          [hostBytes]="hostBytes()"
          [stale]="stale()"
        />
      } @placeholder {
        <div class="skeleton skeleton-defer mx-1 mt-3 h-[150px] md:h-[190px] xl:h-[200px]"></div>
      }

      <div
        class="mx-1 mt-1.5 flex justify-between text-[11px] text-label-3 tabular"
        aria-hidden="true"
      >
        <span>60 s ago</span>
        <span class="hidden md:inline">45 s</span>
        <span>30 s</span>
        <span class="hidden md:inline">15 s</span>
        <span>now</span>
      </div>

      <ng-content />
    }
  `,
})
export class LiveMonitor {
  readonly series = input.required<readonly MetricPoint[]>();
  /** Host RAM from /stats; without it memory has no threshold. */
  readonly hostBytes = input(0);
  /** Dims the chart only; the numbers keep full contrast. */
  readonly stale = input(false);
  readonly collapsed = input(false);
  /** A tile picked while the chart is folded: the page unfolds it on that metric. */
  readonly expandRequested = output<void>();

  protected readonly focus = signal<Metric>('cpu');

  protected readonly metrics = computed(() => {
    const series = this.series();
    const now = series.at(-1) ?? ZERO;
    const peak = (key: Metric): number => Math.max(0, ...series.map((point) => point[key]));
    const host = this.hostBytes();
    const share = host > 0 ? (now.mem / host) * 100 : 0;

    return METRICS.map((key) => ({
      key,
      label: METRIC_LABEL[key],
      color: METRIC_COLOR[key],
      ...splitMetric(key, now[key]),
      state: key === 'cpu' ? level(now.cpu) : key === 'mem' ? level(share) : '',
      sub:
        key === 'cpu'
          ? `peak ${peakPercent(peak('cpu'))}%`
          : key === 'mem'
            ? /* The line keeps its height when host RAM is unknown. */
              host > 0
              ? `${Math.round(share)}% of host`
              : '\u00a0'
            : `peak ${peakBytes(peak('net'), now.net)}`,
    }));
  });

  protected pick(metric: Metric): void {
    this.focus.set(metric);
    if (this.collapsed()) this.expandRequested.emit();
  }
}

function level(percent: number): string {
  return percent >= DANGER ? 'danger' : percent >= WARN ? 'warn' : '';
}

function peakPercent(value: number): string {
  return value >= 10 ? Math.round(value).toString() : value.toFixed(1);
}

function peakBytes(peak: number, now: number): string {
  const top = toByteSize(peak);
  return top.unit === toByteSize(now).unit ? top.value : `${top.value} ${top.unit}/s`;
}
