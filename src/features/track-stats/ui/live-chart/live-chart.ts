import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import type { MetricPoint } from '@entities/system-stats';
import { niceTop, plot } from '@shared/lib/chart/chart';
import { MEGABYTE } from '@shared/lib/format/bytes';
import { breathe } from '@shared/ui/motion/effects';
import { settled } from '@shared/ui/motion/motion';
import { METRICS, METRIC_COLOR, METRIC_LABEL, Metric, formatMetric } from '../live-monitor/metric';

/* Seconds across the chart: 60 one-second points. */
const SPAN = 59;
/* Fixed order, default focus on top: a moved node loses its focus cross-fade. */
const DRAW_ORDER: readonly Metric[] = ['net', 'mem', 'cpu'];
const TIP_WIDTH = 160;
const SPOKEN: Record<Metric, string> = { cpu: 'CPU', mem: 'memory', net: 'network' };

let nextId = 0;

interface Point {
  readonly age: number;
  readonly point: MetricPoint;
}

let arrived = false;

@Component({
  selector: 'app-live-chart',
  host: {
    tabindex: '0',
    role: 'slider',
    'aria-label': 'Usage over the last minute',
    'aria-valuemin': '0',
    '[attr.aria-valuemax]': 'lastIndex()',
    '[attr.aria-valuenow]': 'index()',
    '[attr.aria-valuetext]': 'spoken() || null',
    '(pointerdown)': 'scrubTo($event)',
    '(pointermove)': 'scrubTo($event)',
    '(pointercancel)': 'clear()',
    /* Touch fires pointerleave right after pointerup, so this ends both kinds of scrub. */
    '(pointerleave)': 'clear()',
    '(focus)': 'announce()',
    '(blur)': 'clear()',
    '(keydown)': 'step($event)',
  },
  template: `
    @let box = size();
    @if (box.w > 0) {
      <svg
        class="block overflow-visible"
        [class.stale]="stale()"
        [attr.width]="box.w"
        [attr.height]="box.h"
        [attr.viewBox]="'0 0 ' + box.w + ' ' + box.h"
        aria-hidden="true"
      >
        <defs>
          @for (key of order; track key) {
            <linearGradient [attr.id]="uid + key" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" [style.stop-color]="color[key]" stop-opacity="0.32" />
              <stop offset="0.85" [style.stop-color]="color[key]" stop-opacity="0" />
            </linearGradient>
          }
          <clipPath [attr.id]="uid + 'clip'">
            <rect x="0" y="-24" [attr.width]="box.w" [attr.height]="box.h + 48" />
          </clipPath>
        </defs>
        <path
          class="grid"
          [attr.d]="
            'M0 12.5H' +
            box.w +
            'M0 ' +
            (box.h + 4) / 2 +
            'H' +
            box.w +
            'M0 ' +
            (box.h - 7.5) +
            'H' +
            box.w
          "
        />
        <g [attr.clip-path]="'url(#' + uid + 'clip)'">
          <g #slide>
            @for (series of paths(); track series.key) {
              <path
                class="area"
                [class.on]="focus() === series.key"
                [attr.d]="series.area"
                [attr.fill]="'url(#' + uid + series.key + ')'"
              />
            }
            @for (series of paths(); track series.key) {
              <path
                class="line"
                [class.on]="focus() === series.key"
                [attr.d]="series.line"
                [style.color]="color[series.key]"
              />
            }
          </g>
        </g>
        @if (scrub(); as mark) {
          <path class="hair" [attr.d]="'M' + mark.x + ' 6V' + (box.h - 8)" />
          @for (dot of mark.dots; track dot.key) {
            <circle
              class="probe"
              [attr.cx]="mark.x"
              [attr.cy]="dot.y"
              r="4"
              [style.stroke]="color[dot.key]"
            />
          }
        }
        @for (series of paths(); track series.key) {
          <circle
            class="halo"
            [class.on]="focus() === series.key"
            [attr.cx]="box.w"
            [attr.cy]="series.now"
            r="11"
            [style.fill]="color[series.key]"
          />
          <circle
            class="dot"
            [class.on]="focus() === series.key"
            [attr.cx]="box.w"
            [attr.cy]="series.now"
            r="4.5"
            [style.fill]="color[series.key]"
          />
        }
      </svg>
      <span class="axis tabular" aria-hidden="true" style="top: -3px">{{ axis().top }}</span>
      <span class="axis tabular" aria-hidden="true" [style.top.px]="(box.h + 4) / 2 - 15">
        {{ axis().mid }}
      </span>
      @if (scrub(); as mark) {
        <div class="tip" [style.left.px]="mark.left" aria-hidden="true">
          <span class="tip__head">{{ mark.head }}</span>
          <span class="tip__rows tabular">
            @for (row of mark.rows; track row.key) {
              <i [style.background]="color[row.key]"></i>
              <span class="text-label-2">{{ row.label }}</span>
              <span class="font-semibold">{{ row.value }}</span>
            }
          </span>
        </div>
      }
    }
  `,
  styles: `
    :host {
      outline-offset: 4px;
      border-radius: 0.75rem;
      cursor: crosshair;
    }

    svg {
      transition: opacity 0.2s;
    }

    svg.stale {
      opacity: 0.55;
    }

    .grid {
      stroke: var(--color-grid);
      stroke-dasharray: 2 5;
    }

    .area {
      opacity: 0;
    }

    .line {
      fill: none;
      stroke: currentColor;
      stroke-width: 1.6;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.45;
    }

    .area.on,
    .line.on {
      opacity: 1;
    }

    .line.on {
      stroke-width: 2.6;
      filter: drop-shadow(0 6px 10px color-mix(in srgb, currentColor 40%, transparent));
    }

    .halo {
      opacity: 0;
      transform-box: fill-box;
      transform-origin: center;
    }

    .halo.on {
      opacity: 0.16;
    }

    .dot {
      stroke: var(--color-cell);
      stroke-width: 2;
      opacity: 0.6;
    }

    .dot.on {
      opacity: 1;
    }

    .line,
    .area,
    .dot,
    .halo {
      transition:
        opacity 0.25s,
        stroke-width 0.25s;
    }

    /* The design keeps the focus cross-fade under reduced motion; outranks the global rule. */
    @media (prefers-reduced-motion: reduce) {
      .line,
      .area,
      .dot,
      .halo {
        transition-duration: var(--t-quick) !important;
      }
    }

    .hair {
      stroke: var(--color-label-3);
      stroke-dasharray: 3 3;
    }

    .probe {
      fill: var(--color-cell);
      stroke-width: 2;
    }

    /* On the left: the newest sample sits on the right edge. */
    .axis {
      position: absolute;
      left: 0;
      font-size: 0.625rem;
      line-height: 0.75rem;
      color: var(--color-label-3);
      pointer-events: none;
    }

    .tip {
      position: absolute;
      top: 0;
      inline-size: 10rem;
      padding: 0.625rem 0.75rem;
      border-radius: 1rem;
      background: var(--color-glass);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      backdrop-filter: blur(20px) saturate(180%);
      box-shadow: var(--shadow-glass);
      pointer-events: none;
    }

    .tip__head {
      display: block;
      margin-block-end: 0.375rem;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-label-3);
    }

    .tip__rows {
      display: grid;
      grid-template-columns: 0.625rem minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.25rem 0.5rem;
      font-size: 0.8125rem;
    }

    .tip__rows i {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      border-radius: 999px;
    }
  `,
})
export class LiveChart {
  readonly series = input.required<readonly MetricPoint[]>();
  readonly focus = input.required<Metric>();
  /** Host RAM tops the memory axis; 0 when unknown. */
  readonly hostBytes = input(0);
  readonly stale = input(false);

  protected readonly uid = `lv${nextId++}-`;
  protected readonly order = DRAW_ORDER;
  protected readonly color = METRIC_COLOR;
  protected readonly size = signal({ w: 0, h: 0 });
  private readonly age = signal<number | null>(null);
  protected readonly spoken = signal('');

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly slide = viewChild<ElementRef<SVGGElement>>('slide');

  protected readonly points = computed<readonly Point[]>(() => {
    const series = this.series();
    const newest = series.at(-1)?.at ?? 0;
    return series
      .map((point) => ({ age: Math.round((newest - point.at) / 1000), point }))
      .filter(({ age }) => age <= SPAN);
  });

  protected readonly lastIndex = computed(() => Math.max(this.points().length - 1, 0));

  /* The floors keep an idle chart off d3's [0, 0] domain. */
  private readonly tops = computed<Record<Metric, number>>(() => {
    const peak = (key: Metric): number =>
      Math.max(0, ...this.points().map(({ point }) => point[key]));
    const host = this.hostBytes();
    return {
      cpu: niceTop(Math.max(peak('cpu'), 1)),
      mem: host > 0 ? Math.max(host, peak('mem')) : niceBytes(Math.max(peak('mem'), MEGABYTE)),
      net: niceBytes(Math.max(peak('net'), 1024)),
    };
  });

  protected readonly paths = computed(() => {
    const { w, h } = this.size();
    const points = this.points();
    const newest = points.at(-1)?.point;
    return DRAW_ORDER.map((key) => {
      const shape = plot(
        points.map(({ age, point }) => ({ age, value: point[key] })),
        w,
        h,
        this.tops()[key],
        SPAN,
      );
      return {
        key,
        line: shape.line,
        area: shape.area,
        y: shape.y,
        now: shape.y(newest?.[key] ?? 0),
      };
    });
  });
  private readonly drawn = computed(() => this.size().w > 0);

  protected readonly axis = computed(() => {
    const key = this.focus();
    const top = this.tops()[key];
    return { top: formatMetric(key, top), mid: formatMetric(key, top / 2) };
  });

  protected readonly index = computed(() => {
    const points = this.points();
    const age = this.age() ?? 0;
    let best = points.length - 1;
    points.forEach((point, i) => {
      if (Math.abs(point.age - age) < Math.abs(points[best].age - age)) best = i;
    });
    return Math.max(best, 0);
  });

  protected readonly scrub = computed(() => {
    const at = this.points()[this.index()];
    if (this.age() === null || !at) return null;
    const { w } = this.size();
    const x = w - (at.age / SPAN) * w;
    return {
      x,
      left: x - TIP_WIDTH - 12 >= 0 ? x - TIP_WIDTH - 12 : x + 12,
      head: at.age === 0 ? 'Now' : `${at.age} s ago`,
      dots: this.paths().map(({ key, y }) => ({ key, y: y(at.point[key]) })),
      rows: METRICS.map((key) => ({
        key,
        label: METRIC_LABEL[key],
        value: formatMetric(key, at.point[key]),
      })),
    };
  });

  constructor() {
    const observer = this.view
      ? new this.view.ResizeObserver(([entry]) => {
          const { width, height } = entry.contentRect;
          /* A covered page is display: none; keep the old size so return does not redraw. */
          if (width > 0 && height > 0) this.size.set({ w: width, h: height });
        })
      : undefined;
    observer?.observe(this.host);
    inject(DestroyRef).onDestroy(() => observer?.disconnect());

    let newest = 0;
    afterRenderEffect(() => {
      const points = this.points();
      const at = this.series().at(-1)?.at ?? 0;
      const slide = this.slide()?.nativeElement;
      const regular = newest > 0 && at - newest < 2000 && points.length > 1;
      newest = at;
      /* WAAPI ignores the global reduced-motion rule, so ask for it here. */
      if (!slide || !regular || this.view?.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      slide.animate(
        [{ transform: `translateX(${this.size().w / SPAN}px)` }, { transform: 'none' }],
        { duration: 400, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' },
      );
    });
    /* A breath when the session's first chart arrives or the focus moves, never on coming back to Home. */
    let shown: string | undefined;
    afterRenderEffect(() => {
      const key = this.focus();
      if (!this.drawn()) return;
      const news = shown === undefined ? !arrived : shown !== key;
      shown = key;
      arrived = true;
      const halo = this.host.querySelector('.halo.on');
      if (news && halo && settled(this.host)) breathe(halo, { scale: '1.3' });
    });
  }

  protected scrubTo(event: PointerEvent): void {
    const points = this.points();
    const { w } = this.size();
    if (points.length === 0 || w === 0) return;
    const left = this.host.getBoundingClientRect().left;
    const age = Math.round((w - (event.clientX - left)) / (w / SPAN));
    this.age.set(Math.min(Math.max(age, 0), points[0].age));
  }

  protected clear(): void {
    this.age.set(null);
    this.spoken.set('');
  }

  protected announce(): void {
    this.spoken.set(this.describe(this.points().length - 1));
  }

  protected step(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.age.set(null);
      this.announce();
      return;
    }

    const points = this.points();
    const last = points.length - 1;
    const current = this.age() === null ? last : this.index();
    const moves: Partial<Record<string, number>> = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: last,
    };
    const next = moves[event.key];
    if (next === undefined || last < 0) return;

    event.preventDefault();
    const index = Math.min(Math.max(next, 0), last);
    this.age.set(points[index].age);
    /* Held, not derived: a focused slider re-announces its valuetext on every change. */
    this.spoken.set(this.describe(index));
  }

  private describe(index: number): string {
    const at = this.points()[index];
    if (!at) return 'No usage yet';
    const when = at.age === 0 ? 'Now' : `${at.age} seconds ago`;
    const values = METRICS.map((key) => `${SPOKEN[key]} ${formatMetric(key, at.point[key])}`);
    return `${when}: ${values.join(', ')}`;
  }
}

/* Round in the printed unit: "4 MB/s", never "3.8 MB/s". */
function niceBytes(value: number): number {
  let step = 1;
  while (value / step >= 1024 && step < 1024 ** 4) step *= 1024;
  return step * niceTop(value / step);
}
