import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TUI_ALWAYS_DASHED, TuiAxes, TuiLineChart } from '@taiga-ui/addon-charts';
import { TuiIcon, TuiPoint } from '@taiga-ui/core';

import { MEGABYTE, toByteSize } from '@shared/lib/format/bytes';
import { LiveMetricsStore, MetricPoint } from '../../model/live-metrics.store';

/* Escalation thresholds in percent; below them the card stays uncolored. */
const WARN = 60;
const DANGER = 90;

const STATE_COLOR: Record<string, string> = {
  warn: 'var(--tui-status-warning)',
  danger: 'var(--tui-status-negative)',
  '': 'var(--tui-background-accent-1)',
};

@Component({
  selector: 'app-live-monitor',
  imports: [RouterLink, TuiAxes, TuiIcon, TuiLineChart],
  providers: [LiveMetricsStore],
  template: `
    <header class="mon__head">
      <span class="mon__label" aria-live="polite">
        {{ stale() ? 'Waiting' : 'Live' }} · {{ projects().length }}
        {{ projects().length === 1 ? 'project' : 'projects' }}
      </span>
      <span class="mon__trail tabular">60s</span>
    </header>

    @let now = current();
    <div class="mon__body" [class.mon__stale]="stale()">
      <div class="mon__vitals">
        <div class="mon__vital">
          <span class="mon__key">CPU</span>
          <span class="mon__num tabular" [attr.data-state]="cpuState()">
            {{ now.cpu.toFixed(1) }}%
          </span>
        </div>
        <div class="mon__vital">
          <span class="mon__key">Memory</span>
          <span class="mon__num tabular" [attr.data-state]="memState()">
            {{ bytes(now.mem) }}
          </span>
        </div>
        <div class="mon__vital">
          <span class="mon__key">Network</span>
          <span class="mon__num tabular">{{ bytes(now.net) }}/s</span>
        </div>
      </div>

      <tui-axes
        class="mon__axes"
        [horizontalLines]="2"
        [horizontalLinesHandler]="dashed"
        [axisXLabels]="xLabels()"
      >
        <tui-line-chart
          [style.color]="chartColor()"
          [x]="0"
          [y]="0"
          [width]="width()"
          [height]="yMax()"
          [value]="cpuPoints()"
          [filled]="true"
        />
      </tui-axes>

      <button
        type="button"
        class="mon__disclose"
        [attr.aria-expanded]="expanded()"
        (click)="expanded.set(!expanded())"
      >
        By project
        <tui-icon
          class="mon__chevron icon-sm"
          icon="@tui.chevron-down"
          [class.mon__chevron--open]="expanded()"
        />
      </button>

      @if (expanded()) {
        @for (row of rows(); track row.slug) {
          <a class="mon__row" [routerLink]="['/projects', row.slug]">
            <span class="mon__slug">{{ row.slug }}</span>
            <span class="mon__figures tabular">{{ row.figures }}</span>
          </a>
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: 0.625rem;
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
      padding: 0.875rem 1rem 0.75rem;
    }

    .mon__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .mon__label {
      font-size: 0.8125rem;
      color: var(--tui-text-secondary);
    }

    .mon__trail {
      font-size: 0.75rem;
      color: var(--tui-text-tertiary);
    }

    .mon__body {
      display: grid;
      gap: 0.625rem;
      transition: opacity var(--tui-duration);
    }

    .mon__stale {
      opacity: 0.55;
    }

    .mon__vitals {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.5rem;
    }

    .mon__vital {
      display: grid;
      gap: 0.125rem;
    }

    .mon__key {
      font-size: 0.625rem;
      font-weight: 500;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--tui-text-tertiary);
    }

    .mon__num {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--tui-text-primary);
      white-space: nowrap;
    }

    .mon__num[data-state='warn'] {
      color: var(--tui-status-warning);
    }

    .mon__num[data-state='danger'] {
      color: var(--tui-status-negative);
    }

    .mon__axes {
      block-size: 6.5rem;
      font-size: 0.6875rem;
      color: var(--tui-text-tertiary);
    }

    /* Tailwind has no preflight, so reset the button-shaped row explicitly. */
    .mon__disclose {
      display: flex;
      align-items: center;
      justify-content: space-between;
      inline-size: 100%;
      margin: 0;
      border: 0;
      border-top: 1px solid var(--tui-border-normal);
      padding: 0.625rem 0.125rem 0.125rem;
      background: none;
      font: inherit;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--tui-text-secondary);
      cursor: pointer;
    }

    .mon__chevron {
      transition: rotate var(--tui-duration);
    }

    .mon__chevron--open {
      rotate: 180deg;
    }

    .mon__row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.375rem 0.125rem;
      text-decoration: none;
    }

    .mon__slug {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--tui-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .mon__figures {
      font-size: 0.75rem;
      color: var(--tui-text-tertiary);
      white-space: nowrap;
    }
  `,
})
export class LiveMonitor {
  /** Slugs to stream; the card opens one SSE connection per project. */
  readonly projects = input.required<readonly string[]>();
  /** Host RAM from /stats; the memory threshold is meaningless without it. */
  readonly hostMemoryMb = input.required<number>();

  protected readonly metrics = inject(LiveMetricsStore);
  protected readonly dashed = TUI_ALWAYS_DASHED;
  protected readonly expanded = signal(false);

  constructor() {
    effect(() => this.metrics.setProjects(this.projects()));
  }

  protected readonly stale = computed(() => !this.metrics.live() && this.totals().length > 0);

  /* Buckets share one ticker, so summing right-aligned lines the series up by time. */
  protected readonly totals = computed<readonly MetricPoint[]>(() => {
    const series = [...this.metrics.buffers().values()].filter((points) => points.length > 0);
    if (series.length === 0) return [];

    const longest = Math.max(...series.map((points) => points.length));
    return Array.from({ length: longest }, (_, i) => {
      let at = 0;
      let cpu = 0;
      let mem = 0;
      let net = 0;
      for (const points of series) {
        const point = points[points.length - longest + i];
        if (!point) continue;
        at = Math.max(at, point.at);
        cpu += point.cpu;
        mem += point.mem;
        net += point.net;
      }
      return { at, cpu, mem, net };
    });
  });

  protected readonly current = computed(
    () => this.totals().at(-1) ?? { at: 0, cpu: 0, mem: 0, net: 0 },
  );

  protected readonly cpuState = computed(() => this.state(this.current()?.cpu ?? 0));

  protected readonly memState = computed(() => {
    const host = this.hostMemoryMb() * MEGABYTE;
    return host > 0 ? this.state(((this.current()?.mem ?? 0) / host) * 100) : '';
  });

  protected readonly chartColor = computed(() => STATE_COLOR[this.cpuState()]);

  protected readonly cpuPoints = computed<readonly TuiPoint[]>(() => {
    const totals = this.totals();
    if (totals.length === 0)
      return [
        [0, 0],
        [1, 0],
      ];
    return totals.map((point, i) => [i, point.cpu]);
  });

  protected readonly width = computed(() => Math.max(this.totals().length - 1, 1));

  protected readonly yMax = computed(() => {
    const top = Math.max(...this.totals().map((point) => point.cpu), 0);
    return top > 0 ? top * 1.1 : 1;
  });

  protected readonly xLabels = computed<readonly string[]>(() => {
    const totals = this.totals();
    if (totals.length < 2) return [];
    return [this.timeOf(totals[0].at), this.timeOf(totals[totals.length - 1].at)];
  });

  protected readonly rows = computed(() =>
    this.projects().map((slug) => {
      const last = this.metrics.buffers().get(slug)?.at(-1) ?? { cpu: 0, mem: 0, net: 0 };
      return {
        slug,
        figures: `${last.cpu.toFixed(1)}% · ${this.bytes(last.mem)} · ${this.bytes(last.net)}/s`,
      };
    }),
  );

  protected bytes(value: number): string {
    const { value: size, unit } = toByteSize(value);
    return `${size} ${unit}`;
  }

  private state(percent: number): string {
    return percent >= DANGER ? 'danger' : percent >= WARN ? 'warn' : '';
  }

  private timeOf(at: number): string {
    return new Date(at).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
