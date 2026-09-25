import { scaleLinear } from 'd3-scale';
import { area, curveMonotoneX, line } from 'd3-shape';

/* Room for the top axis label above the plot and the baseline dots below it. */
export const PAD_TOP = 12;
export const PAD_BOTTOM = 8;

/** A value `age` seconds before the newest point. */
export interface Sample {
  readonly age: number;
  readonly value: number;
}

export interface Plot {
  readonly line: string;
  readonly area: string;
  readonly x: (age: number) => number;
  readonly y: (value: number) => number;
}

/** The round top of a 0-based axis in about four steps: 21 → 25, 3.4 → 4. */
export function niceTop(max: number): number {
  return scaleLinear().domain([0, max]).nice(4).domain()[1];
}

/** Newest sample at the right edge, `span` seconds across. */
export function plot(
  samples: readonly Sample[],
  width: number,
  height: number,
  top: number,
  span: number,
): Plot {
  const x = scaleLinear().domain([span, 0]).range([0, width]);
  const y = scaleLinear()
    .domain([0, top])
    .range([height - PAD_BOTTOM, PAD_TOP]);
  const at = (sample: Sample): number => x(sample.age);
  const value = (sample: Sample): number => y(sample.value);
  /* Monotone: the curve never overshoots a measured value. */
  return {
    line: line<Sample>(at, value).curve(curveMonotoneX)(samples) ?? '',
    area: area<Sample>(at, height - PAD_BOTTOM, value).curve(curveMonotoneX)(samples) ?? '',
    x,
    y,
  };
}
