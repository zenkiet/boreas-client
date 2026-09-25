import { toByteSize } from '@shared/lib/format/bytes';

/* Not in live-chart.ts: any value imported from there makes the deferred chunk eager. */

export type Metric = 'cpu' | 'mem' | 'net';

export const METRICS: readonly Metric[] = ['cpu', 'mem', 'net'];

export const METRIC_LABEL: Record<Metric, string> = { cpu: 'CPU', mem: 'Memory', net: 'Network' };

/* Series colours are fixed; thresholds colour the numbers, never the lines. */
export const METRIC_COLOR: Record<Metric, string> = {
  cpu: 'var(--color-cpu)',
  mem: 'var(--color-mem)',
  net: 'var(--color-net)',
};

const PERCENT = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });

export function splitMetric(metric: Metric, value: number): { value: string; unit: string } {
  if (metric === 'cpu') return { value: value.toFixed(1), unit: '%' };
  const size = toByteSize(value);
  return metric === 'net' ? { value: size.value, unit: `${size.unit}/s` } : size;
}

export function formatMetric(metric: Metric, value: number): string {
  if (metric === 'cpu') return `${PERCENT.format(value)}%`;
  const { value: size, unit } = splitMetric(metric, value);
  return `${size} ${unit}`;
}
