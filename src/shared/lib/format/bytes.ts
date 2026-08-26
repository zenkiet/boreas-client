const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** The API reports host and container memory in mebibytes. */
export const MEGABYTE = 1024 * 1024;

export interface ByteSize {
  readonly value: string;
  readonly unit: string;
}

/** Largest unit under four digits (8,005 MB → 7.8 GB); split so tiles can size the unit. */
export function toByteSize(bytes: number): ByteSize {
  let value = Math.max(0, bytes);
  let unit = 0;

  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return {
    value: new Intl.NumberFormat('en', { maximumFractionDigits: value < 10 ? 1 : 0 }).format(value),
    unit: UNITS[unit],
  };
}
