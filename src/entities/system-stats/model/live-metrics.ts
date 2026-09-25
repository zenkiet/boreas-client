/** `at` is the arrival time: frames carry no timestamp. */
export interface TaskSample {
  readonly task: string;
  readonly at: number;
  readonly cpu: number;
  readonly mem: number;
  readonly rx: number;
  readonly tx: number;
}

interface HeldTask {
  readonly prev?: TaskSample;
  readonly last: TaskSample;
}

/** Two samples per task: network counters only mean something as a delta. */
export type HeldSamples = ReadonlyMap<string, ReadonlyMap<string, HeldTask>>;

/** A 1 s bucket: cpu %, memory bytes, network bytes/s (rx + tx). */
export interface MetricPoint {
  readonly at: number;
  readonly cpu: number;
  readonly mem: number;
  readonly net: number;
}

export interface FleetWindow {
  readonly at: number;
  readonly live: boolean;
  readonly projects: ReadonlyMap<string, readonly MetricPoint[]>;
}

export interface ProjectLoad {
  readonly slug: string;
  readonly name: string;
  readonly cpu: number;
  readonly mem: number;
  readonly net: number;
}

export interface ProjectLoads {
  readonly rows: readonly ProjectLoad[];
  readonly rest?: Omit<ProjectLoad, 'slug' | 'name'> & {
    readonly count: number;
    readonly loads: readonly ProjectLoad[];
  };
}

export const WINDOW = 60;
/* A task that stops is omitted from the stream, never zeroed; silence is the only signal. */
export const STALE_MS = 3500;
const SNAPSHOT_FRESH_MS = 120_000;

export const NO_SAMPLES: HeldSamples = new Map();
export const EMPTY_WINDOW: FleetWindow = { at: 0, live: false, projects: new Map() };

export function holdSample(
  held: HeldSamples,
  [slug, sample]: readonly [string, TaskSample],
): HeldSamples {
  const tasks = new Map(held.get(slug));
  const last = tasks.get(sample.task)?.last;
  /* Past the silence limit the old counters are no delta base: the container restarted. */
  tasks.set(sample.task, {
    prev: last && sample.at - last.at <= STALE_MS ? last : undefined,
    last: sample,
  });
  return new Map(held).set(slug, tasks);
}

export function advance(window: FleetWindow, held: HeldSamples, now: number): FleetWindow {
  const projects = new Map(window.projects);

  for (const slug of new Set([...projects.keys(), ...held.keys()])) {
    const point = bucket(held.get(slug), now);
    const points = projects.get(slug) ?? [];
    if (!point) {
      /* A silent project ages out of the window instead of freezing in the chart. */
      if (points.length > 1) projects.set(slug, points.slice(1));
      else projects.delete(slug);
      continue;
    }

    /* A pause or a restored snapshot left old points: restart rather than draw the gap. */
    const base = now - (points.at(-1)?.at ?? 0) > STALE_MS ? [] : points;
    projects.set(slug, [...base, point].slice(-WINDOW));
  }

  /* A reconnect costs a tick or two; only a longer silence reads as "Waiting". */
  const live = [...projects.values()].some((points) => now - (points.at(-1)?.at ?? 0) <= STALE_MS);
  return { at: now, live, projects };
}

/** Sums by `at`, which every project of one tick shares. */
export function fleetSeries(window: FleetWindow, slugs: readonly string[]): readonly MetricPoint[] {
  const sums = new Map<number, MetricPoint>();
  for (const slug of slugs) {
    for (const point of window.projects.get(slug) ?? []) {
      const sum = sums.get(point.at);
      sums.set(
        point.at,
        sum
          ? {
              at: point.at,
              cpu: sum.cpu + point.cpu,
              mem: sum.mem + point.mem,
              net: sum.net + point.net,
            }
          : point,
      );
    }
  }
  return [...sums.values()].sort((a, b) => a.at - b.at).slice(-WINDOW);
}

/** Ranked by the minute's mean cpu, so rows do not reshuffle every second. */
export function projectLoads(
  window: FleetWindow,
  projects: readonly { readonly slug: string; readonly name: string }[],
  shown = 5,
): ProjectLoads {
  const ranked = projects
    .map(({ slug, name }) => {
      const points = window.projects.get(slug) ?? [];
      const last = points.at(-1);
      const now = last && window.at - last.at <= STALE_MS ? last : undefined;
      const mean = points.reduce((sum, point) => sum + point.cpu, 0) / (points.length || 1);
      return {
        mean,
        load: { slug, name, cpu: now?.cpu ?? 0, mem: now?.mem ?? 0, net: now?.net ?? 0 },
      };
    })
    .sort((a, b) => b.mean - a.mean || a.load.name.localeCompare(b.load.name))
    .map(({ load }) => load);

  if (ranked.length <= shown) return { rows: ranked };

  const tail = ranked.slice(shown - 1);
  return {
    rows: ranked.slice(0, shown - 1),
    rest: {
      count: tail.length,
      loads: tail,
      cpu: tail.reduce((sum, load) => sum + load.cpu, 0),
      mem: tail.reduce((sum, load) => sum + load.mem, 0),
      net: tail.reduce((sum, load) => sum + load.net, 0),
    },
  };
}

export function fromSnapshot(raw: string | null, now: number): FleetWindow {
  if (!raw) return EMPTY_WINDOW;
  try {
    const parsed: { at?: unknown; series?: unknown } = JSON.parse(raw);
    if (typeof parsed.at !== 'number' || !Array.isArray(parsed.series)) return EMPTY_WINDOW;
    if (now - parsed.at > SNAPSHOT_FRESH_MS) return EMPTY_WINDOW;
    return {
      at: parsed.at,
      live: false,
      projects: new Map(parsed.series as [string, MetricPoint[]][]),
    };
  } catch {
    return EMPTY_WINDOW;
  }
}

export function toSnapshot(window: FleetWindow): string {
  return JSON.stringify({ at: window.at, series: [...window.projects] });
}

function bucket(
  tasks: ReadonlyMap<string, HeldTask> | undefined,
  now: number,
): MetricPoint | undefined {
  let cpu = 0;
  let mem = 0;
  let net = 0;
  let counted = 0;

  for (const { prev, last } of tasks?.values() ?? []) {
    /* The first sample of a task carries a fake cpu 0 and no delta base; wait for the second. */
    if (now - last.at > STALE_MS || !prev) continue;
    const seconds = (last.at - prev.at) / 1000 || 1;
    cpu += last.cpu;
    mem += last.mem;
    net += Math.max(0, last.rx - prev.rx + (last.tx - prev.tx)) / seconds;
    counted += 1;
  }

  return counted > 0 ? { at: now, cpu, mem, net } : undefined;
}
