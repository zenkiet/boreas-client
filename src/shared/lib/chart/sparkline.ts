/** `top` follows the data, never clamped. */
export interface Sparkline {
  readonly line: string;
  readonly area: string;
  readonly top: number;
}

/* No d3: this file must stay out of the d3 chunk, and a sparkline has no axis to round. */
export function sparkline(values: readonly number[], width: number, height: number): Sparkline {
  const top = Math.max(...values, 0) * 1.1 || 1;
  if (values.length < 2) return { line: '', area: '', top };

  const step = width / (values.length - 1);
  /* One unit of margin top and bottom, so a flat line at zero is not clipped in half. */
  const points = values.map(
    (value, i) =>
      `${(i * step).toFixed(2)},${(height - 1 - (value / top) * (height - 2)).toFixed(2)}`,
  );
  const line = `M${points.join('L')}`;
  return { line, area: `${line}L${width},${height}L0,${height}Z`, top };
}
