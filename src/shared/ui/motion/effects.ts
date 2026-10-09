import { Signal, effect, linkedSignal, untracked } from '@angular/core';

import {
  E,
  S,
  T,
  TURN,
  coastFrames,
  once,
  play,
  reduced,
  rendered,
  settled,
  springEasing,
  stop,
} from './motion';

const SHOWN = { scale: '1', opacity: 1, filter: 'blur(0px)' };
const GONE = { scale: '0.5', opacity: 0, filter: 'blur(2px)' };

/* Out, then apply and in; plain, hidden or under Reduce Motion it applies and only fades in. Read first, as ever. */
function change(
  el: Element,
  apply: () => void,
  out: Keyframe[],
  into: Keyframe[],
  options: KeyframeAnimationOptions,
  plain = false,
): void {
  const shows = rendered(el);
  stop(el);
  if (!shows || plain || reduced()) {
    apply();
    if (shows) play(el, { opacity: [0, 1] }, reduced() ? T.quick : options);
    return;
  }
  const gone = play(el, out, { duration: T.quick, easing: E.in.css, fill: 'forwards' });
  gone.onfinish = () => {
    apply();
    gone.cancel();
    play(el, into, options);
  };
}

export const replace = (el: Element, apply: () => void): void =>
  change(el, apply, [SHOWN, GONE], [GONE, SHOWN], {
    duration: S.feedback.duration,
    easing: springEasing(S.feedback),
  });

/** Words fade out, then the new ones fade in, in place. */
export const swap = (el: Element, apply: () => void): void =>
  change(
    el,
    apply,
    [{ opacity: 1 }, { opacity: 0 }],
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: T.base, easing: E.out.css },
    !el.textContent?.trim(),
  );

/** Three slow breaths toward `peak`; WAAPI, so a page Ionic hides and shows again never replays it. */
export const breathe = (el: Element, peak: Keyframe): void =>
  once(el, [{ ...peak, offset: 0.5 }], { duration: 1200, iterations: 3, easing: 'ease-in-out' });

export function bounce(el: Element): void {
  const total = 90 + S.pop.duration;
  once(
    el,
    [
      { scale: '1', easing: E.out.css },
      { scale: '1.18', offset: 90 / total, easing: springEasing(S.pop) },
      { scale: '1' },
    ],
    total,
  );
}

const angle = (el: Element) => (parseFloat(getComputedStyle(el).rotate) || 0) % 360;

export function rotate(el: Element): void {
  const from = angle(el);
  once(
    el,
    { rotate: [`${from}deg`, `${from + 360}deg`] },
    { duration: TURN, iterations: Infinity },
  );
}

export function coast(el: Element): void {
  const { frames, duration } = coastFrames(angle(el));
  stop(el);
  if (!duration || reduced()) return;
  const coasting = play(el, frames, duration);
  const now = document.timeline.currentTime;
  // From the frame the spin last drew: a pending start would hold that angle a frame or two.
  if (now !== null) coasting.startTime = now;
}

/** Leaves from wherever an entrance left off: fade first, then the height and margins close. */
export function collapse(el: HTMLElement, done: () => void): void {
  const { height, opacity, marginBlockStart, marginBlockEnd } = getComputedStyle(el);
  // Angular ends a leave on any animationend, its own entrance's too.
  for (const anim of el.getAnimations()) anim.cancel();
  el.style.overflow = 'hidden';
  const from = { height, opacity, marginBlockStart, marginBlockEnd };
  const shut = reduced()
    ? play(el, [from, { ...from, opacity: '0' }], { duration: T.quick, fill: 'forwards' })
    : play(
        el,
        [
          { ...from, easing: E.in.css },
          { ...from, opacity: '0', offset: T.quick / (T.quick + T.base), easing: E.out.css },
          { height: '0px', opacity: '0', marginBlockStart: '0px', marginBlockEnd: '0px' },
        ],
        { duration: T.quick + T.base, fill: 'forwards' },
      );
  shut.onfinish = done;
}

/** Follows `source`; on a settled page each change first leaves through `fx` (Replace by default). */
export function replaced<T>(
  source: () => T,
  host: () => HTMLElement | undefined,
  fx = replace,
): Signal<T> {
  const shown = linkedSignal<T, T>({
    source,
    computation: (next, prev) => (prev ? prev.value : next),
  });
  let moving = false;
  effect(() => {
    const next = source();
    const el = host();
    untracked(() => {
      // A flip back mid-change must not land the stale value; idle, stop() would only force a style pass.
      if (el && moving) stop(el);
      moving = false;
      if (shown() === next) return;
      if (el && settled(el)) {
        moving = true;
        fx(el, () => {
          moving = false;
          shown.set(next);
        });
      } else shown.set(next);
    });
  });
  return shown;
}
