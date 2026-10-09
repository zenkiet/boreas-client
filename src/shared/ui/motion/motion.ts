export interface Ease {
  (p: number): number;
  readonly css: string;
}

export interface Spring extends Ease {
  readonly duration: number;
}

export const T = { quick: 120, base: 200 } as const;

export const E = {
  out: bezier(0.32, 0.72, 0, 1),
  in: bezier(0.4, 0, 1, 1),
  decel: bezier(1 / 3, 2 / 3, 2 / 3, 1),
};

/** SwiftUI spring(response, damping): GSAP takes the function, WAAPI and CSS the `css` string. */
export const S = { feedback: spring(0.3, 0.86), layout: spring(0.3, 1), pop: spring(0.4, 0.7) };

/** Read per call, so a Reduce Motion change applies to the next effect. */
export const reduced = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** False before a routed page's first transition, during one, while covered, and in a hidden tab; reads no style. */
export function pageSettled(el: HTMLElement): boolean {
  // The shell's #main is an .ion-page too, so anchor on the outlet's own children.
  const page = el.closest<HTMLElement>('ion-router-outlet > *');
  return (
    !!page?.classList.contains('ion-page') &&
    !page.matches('.ion-page-hidden, .ion-page-invisible') &&
    page.style.pointerEvents !== 'none' &&
    !el.ownerDocument.hidden
  );
}

/** `pageSettled()`, and the element rendered: that check restyles the page if a write came first. */
export const settled = (el: HTMLElement): boolean => pageSettled(el) && rendered(el);

/* WAAPI throws on linear() before Safari 17.2. */
const LINEAR =
  typeof CSS !== 'undefined' && CSS.supports('transition-timing-function', 'linear(0, 1)');

export const springEasing = (s: Spring): string => (LINEAR ? s.css : E.out.css);

export const play = (
  el: Element,
  frames: Keyframe[] | PropertyIndexedKeyframes,
  options: number | KeyframeAnimationOptions,
): Animation => {
  const anim = el.animate(frames, options);
  anim.id = 'fx';
  return anim;
};

/** Cancels only what `play()` started: the theme animates some of the same hosts. */
export function stop(el: Element): void {
  for (const anim of el.getAnimations()) if (anim.id === 'fx') anim.cancel();
}

/* A hidden twin (the iPad header on a phone) changes without spending frames; checkVisibility() needs no layout. */
export const rendered = (el: Element) => el.checkVisibility?.() ?? el.getClientRects().length > 0;

/** Replaces the last `play()` on a rendered element, unless Reduce Motion; reads before it writes, or it restyles twice. */
export function once(
  el: Element,
  frames: Keyframe[] | PropertyIndexedKeyframes,
  options: number | KeyframeAnimationOptions,
): void {
  const shows = !reduced() && rendered(el);
  stop(el);
  if (shows) play(el, frames, options);
}

export const wiggle = (el: Element): void =>
  once(
    el,
    [0, -14, 12, -8, 5, -2, 0].map((d) => ({
      rotate: `${d}deg`,
      transformOrigin: '50% 12%',
      easing: 'ease-in-out',
    })),
    550,
  );

export const TURN = 800;
const BRAKE = 90;

/** Cruise to 90° short of upright, then brake: a quadratic ease-out starts at twice its mean speed. */
export function coastFrames(from: number): { frames: Keyframe[]; duration: number } {
  const left = (360 - from) % 360;
  if (left < 0.5) return { frames: [], duration: 0 };
  const speed = 360 / TURN;
  const brake = Math.min(left, BRAKE);
  const cruise = (left - brake) / speed;
  const duration = cruise + (2 * brake) / speed;
  const frames: Keyframe[] = [{ rotate: `${from}deg`, easing: cruise ? 'linear' : E.decel.css }];
  if (cruise)
    frames.push({ rotate: `${360 - brake}deg`, offset: cruise / duration, easing: E.decel.css });
  frames.push({ rotate: '360deg' });
  return { frames, duration };
}

/** Changed cells counted from the right (1 = ones); dir 1 rolls up; null swaps plainly. */
export function digitDiff(prev: string, next: string): { dir: 1 | -1; changed: number[] } | null {
  if (prev === next || !/^\d+$/.test(prev) || !/^\d+$/.test(next)) return null;
  const changed: number[] = [];
  for (let i = 1; i <= Math.max(prev.length, next.length); i++) {
    if (prev[prev.length - i] !== next[next.length - i]) changed.push(i);
  }
  return { dir: Number(next) > Number(prev) ? 1 : -1, changed };
}

function bezier(x1: number, y1: number, x2: number, y2: number): Ease {
  const at = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * (1 - t) * t ** 2 + t ** 3;
  const ease = (x: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 30; i++) {
      const t = (lo + hi) / 2;
      if (at(x1, x2, t) < x) lo = t;
      else hi = t;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
  const css = `cubic-bezier(${[x1, y1, x2, y2].map((n) => +n.toFixed(4)).join(', ')})`;
  return Object.assign(ease, { css });
}

function spring(response: number, damping: number): Spring {
  const w = (2 * Math.PI) / response;
  const wd = w * Math.sqrt(Math.max(0, 1 - damping ** 2));
  const x = (t: number) =>
    damping < 1
      ? 1 -
        Math.exp(-damping * w * t) * (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t))
      : 1 - Math.exp(-w * t) * (1 + w * t);
  let settle = 0.05;
  for (let t = 0; t < 3; t += 0.001) if (Math.abs(1 - x(t)) > 0.002) settle = t + 0.001;
  // Scaled to land on 1: the spring's last 0.2 % would otherwise come as one step on the final frame.
  const ease = (p: number) => x(p * settle) / x(settle);
  const css = `linear(${Array.from({ length: 41 }, (_, i) => +ease(i / 40).toFixed(4)).join(', ')})`;
  return Object.assign(ease, { css, duration: Math.round(settle * 1000) });
}
