import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';

import { ProjectApi } from '@entities/project';

/** One per-project bucket: summed cpu %, memory bytes, and network bytes/s (rx+tx). */
export interface MetricPoint {
  readonly at: number;
  readonly cpu: number;
  readonly mem: number;
  readonly net: number;
}

interface Sample {
  readonly cpu: number;
  readonly mem: number;
  readonly rx: number;
  readonly tx: number;
  readonly at: number;
}

interface Stream {
  sub?: Subscription;
  timer?: ReturnType<typeof setTimeout>;
  consumed: number;
  /* Two samples per task: network counters and cpu only mean anything as a delta. */
  readonly tasks: Map<string, { prev?: Sample; last: Sample }>;
}

const WINDOW = 60;
const TICK_MS = 1000;
/* A task that stops is omitted from the stream, never zeroed; silence is the only signal. */
const STALE_MS = 3500;
const RECONNECT_DELAY_MS = 3000;
/* The transport re-emits the whole body; past this size reconnect to drop the backlog. */
const MAX_BUFFER_CHARS = 1_500_000;
const SNAPSHOT_KEY = 'boreas-monitor';
const SNAPSHOT_FRESH_MS = 120_000;

/** Fans out one metrics stream per project and folds tasks into per-project 1s buckets. */
@Injectable()
export class LiveMetricsStore {
  private readonly api = inject(ProjectApi);
  private readonly document = inject(DOCUMENT);

  private readonly streams = new Map<string, Stream>();
  private readonly buffersState = signal<ReadonlyMap<string, readonly MetricPoint[]>>(this.load());
  private readonly liveState = signal(false);
  private ticker?: ReturnType<typeof setInterval>;

  readonly buffers = this.buffersState.asReadonly();
  /** False while painting a restored snapshot or a dropped connection. */
  readonly live = this.liveState.asReadonly();

  constructor() {
    const destroyRef = inject(DestroyRef);
    const onVisibility = () => (this.document.hidden ? this.pause() : this.resume());
    this.document.addEventListener('visibilitychange', onVisibility);

    destroyRef.onDestroy(() => {
      this.document.removeEventListener('visibilitychange', onVisibility);
      this.pause();
    });
  }

  /** Reconciles open connections with the given project slugs. */
  setProjects(slugs: readonly string[]): void {
    for (const slug of this.streams.keys()) {
      if (!slugs.includes(slug)) {
        this.close(slug);
        this.streams.delete(slug);
      }
    }
    for (const slug of slugs) {
      if (!this.streams.has(slug)) {
        this.streams.set(slug, { consumed: 0, tasks: new Map() });
        this.open(slug);
      }
    }

    if (!this.ticker) {
      this.ticker = setInterval(() => this.tick(), TICK_MS);
    }
  }

  private open(slug: string): void {
    const stream = this.streams.get(slug);
    if (!stream) return;
    stream.consumed = 0;
    stream.sub = this.api.metricsStream(slug).subscribe({
      next: (text) => {
        this.consume(stream, text);
        if (text.length > MAX_BUFFER_CHARS) this.scheduleReopen(slug, 0);
      },
      error: () => this.scheduleReopen(slug, RECONNECT_DELAY_MS),
      complete: () => this.scheduleReopen(slug, RECONNECT_DELAY_MS),
    });
  }

  private close(slug: string): void {
    const stream = this.streams.get(slug);
    if (!stream) return;
    stream.sub?.unsubscribe();
    stream.sub = undefined;
    if (stream.timer) clearTimeout(stream.timer);
    stream.timer = undefined;
  }

  private scheduleReopen(slug: string, delay: number): void {
    this.close(slug);
    const stream = this.streams.get(slug);
    if (!stream) return;
    stream.timer = setTimeout(() => {
      stream.timer = undefined;
      this.open(slug);
    }, delay);
  }

  /* Parse only the newly arrived complete frames of the cumulative SSE body. */
  private consume(stream: Stream, text: string): void {
    const end = text.lastIndexOf('\n\n');
    if (end < stream.consumed) return;

    const fresh = text.slice(stream.consumed, end + 2);
    stream.consumed = end + 2;

    for (const frame of fresh.split('\n\n')) {
      for (const line of frame.split('\n')) {
        if (line.startsWith('data:')) this.receive(stream, line.slice(5).trimStart());
      }
    }
  }

  private receive(stream: Stream, data: string): void {
    let raw;
    try {
      raw = JSON.parse(data);
    } catch {
      return;
    }

    if (typeof raw?.task !== 'string') return;

    const sample: Sample = {
      cpu: Number(raw.cpu_percent) || 0,
      mem: Number(raw.memory_bytes) || 0,
      rx: Number(raw.network_rx_bytes) || 0,
      tx: Number(raw.network_tx_bytes) || 0,
      at: Date.now(),
    };
    const held = stream.tasks.get(raw.task);
    stream.tasks.set(raw.task, { prev: held?.last, last: sample });
  }

  private tick(): void {
    const now = Date.now();
    const next = new Map(this.buffersState());
    let anyFresh = false;
    let changed = false;

    for (const [slug, stream] of this.streams) {
      let cpu = 0;
      let mem = 0;
      let net = 0;
      let counted = 0;

      for (const [task, { prev, last }] of stream.tasks) {
        if (now - last.at > STALE_MS) {
          /* Drop rather than keep: a restarted container resets its counters anyway. */
          stream.tasks.delete(task);
          continue;
        }
        /* The first sample of a task carries a fake cpu 0 and no delta base; wait for the second. */
        if (!prev) continue;

        const seconds = (last.at - prev.at) / 1000 || 1;
        cpu += last.cpu;
        mem += last.mem;
        net += Math.max(0, last.rx - prev.rx + (last.tx - prev.tx)) / seconds;
        counted += 1;
      }

      if (counted === 0) {
        /* A silent project ages out of the sliding window instead of freezing in the chart. */
        const held = next.get(slug);
        if (held?.length) {
          const trimmed = held.slice(1);
          if (trimmed.length > 0) next.set(slug, trimmed);
          else next.delete(slug);
          changed = true;
        }
        continue;
      }
      anyFresh = true;

      const held = next.get(slug) ?? [];
      /* A restored snapshot or a resumed tab left old points; restart the window instead of drawing the gap. */
      const base = now - (held.at(-1)?.at ?? 0) > STALE_MS ? [] : held;
      next.set(slug, [...base, { at: now, cpu, mem, net }].slice(-WINDOW));
    }

    this.liveState.set(anyFresh);
    if (anyFresh || changed) {
      this.buffersState.set(next);
      this.save(next);
    }
  }

  private pause(): void {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = undefined;
    this.liveState.set(false);
    for (const slug of this.streams.keys()) this.close(slug);
  }

  private resume(): void {
    for (const slug of this.streams.keys()) this.open(slug);
    if (this.streams.size > 0 && !this.ticker) {
      this.ticker = setInterval(() => this.tick(), TICK_MS);
    }
  }

  /* Snapshot so a reload paints the card instantly instead of starting blank. */
  private save(buffers: ReadonlyMap<string, readonly MetricPoint[]>): void {
    try {
      this.document.defaultView?.localStorage.setItem(
        SNAPSHOT_KEY,
        JSON.stringify({ at: Date.now(), series: [...buffers] }),
      );
    } catch {
      return;
    }
  }

  private load(): ReadonlyMap<string, readonly MetricPoint[]> {
    try {
      const raw = this.document.defaultView?.localStorage.getItem(SNAPSHOT_KEY);
      if (!raw) return new Map();
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.at > SNAPSHOT_FRESH_MS) return new Map();
      return new Map(parsed.series);
    } catch {
      return new Map();
    }
  }
}
