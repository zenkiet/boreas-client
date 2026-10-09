import { gsap } from 'gsap';

export { gsap };

/** Each row's top within its parent, and each parent's height: what `relayout()` tweens from. */
export function measure(rows: readonly Element[]): Map<Element, number> {
  const at = new Map<Element, number>();
  const tops = new Map<Element, number>();
  for (const row of rows) {
    const box = row.parentElement;
    if (!box) continue;
    if (!tops.has(box)) {
      const { top, height } = box.getBoundingClientRect();
      tops.set(box, top);
      at.set(box, height);
    }
    at.set(row, row.getBoundingClientRect().top - (tops.get(box) ?? 0));
  }
  return at;
}

/**
 * The bottom margin of a group's list, or of a gap closing where something went, open and shut, its
 * top one unchanged: with a block next, 0 takes the room of the margin it collapses into and −margin
 * cancels it, so the room it takes changes linearly; last, it simply runs out.
 */
export function shut(el: HTMLElement): [number, number] {
  let next = (el.parentElement?.localName === 'app-inset-group' ? el.parentElement : el)
    .nextElementSibling;
  while (next?.hasAttribute('inert')) next = next.nextElementSibling;
  const bottom = parseFloat(getComputedStyle(el).marginBottom);
  return next ? [0, -bottom] : [bottom, 0];
}

/**
 * Tweens `tl` from `before` to now: parents resize and rows slide within them, so what follows
 * moves with the layout and nothing needs a matrix. A new parent opens its whole list from nothing;
 * a parent ends without the `gaps` closing inside it. Returns the outermost new elements.
 */
export function relayout(
  tl: gsap.core.Timeline,
  before: ReadonlyMap<Element, number>,
  rows: readonly Element[],
  gaps: readonly Element[] = [],
): Element[] {
  const now = measure(rows);
  const less = new Map<Element, number>();
  for (const gap of gaps) {
    const box = gap.parentElement;
    if (box) less.set(box, (less.get(box) ?? 0) + gap.getBoundingClientRect().height);
  }
  const isRow = new Set(rows);
  const lists = new Set<HTMLElement>();
  const fresh: Element[] = [];
  for (const row of rows) {
    const box = row.parentElement;
    if (before.has(row) || !box) continue;
    if (before.has(box)) fresh.push(row);
    else lists.add(box.closest('ion-list') ?? box);
  }
  const opened = [...lists];
  const bottoms = opened.map((el) => shut(el));
  const open = { p: 0 };
  // A new group's Ionic parts render over several microtasks, so it opens toward its live height as that grows.
  const draw = () => {
    // Nothing to read at 0: the first call follows the start values' writes and would force a layout.
    const heights = opened.map((el) => (open.p ? el.scrollHeight : 0));
    opened.forEach((el, i) => {
      const [wide, none] = bottoms[i];
      el.style.height = `${open.p * heights[i]}px`;
      el.style.marginBottom = `${none + (wide - none) * open.p}px`;
    });
  };
  // First in the timeline, so each frame reads the lists' heights before anything writes.
  if (opened.length) {
    tl.to(
      open,
      {
        p: 1,
        onUpdate: draw,
        onComplete: () => gsap.set(opened, { clearProps: 'height,marginBottom' }),
      },
      0,
    );
  }
  const moved = [...now].flatMap(([el, at]) => {
    const was = before.get(el);
    return was === undefined || Math.abs(was - at) < 0.5 ? [] : [{ el, was, at }];
  });
  // One that only swapped rows for gaps follows them as they close; a resized one ends without them.
  const boxes = moved
    .filter(({ el }) => !isRow.has(el))
    .map((box) => ({ ...box, at: box.at - (less.get(box.el) ?? 0) }));
  const slid = moved.filter(({ el }) => isRow.has(el));
  // GSAP warns on an empty target list.
  if (slid.length) {
    tl.fromTo(
      slid.map(({ el }) => el),
      { y: (i: number) => slid[i].was - slid[i].at },
      { y: 0, clearProps: 'transform' },
      0,
    );
  }
  if (boxes.length) {
    // Unrounded at both ends, as GSAP leaves the rows' offsets: whole pixels against them wobble a pixel or two.
    tl.fromTo(
      boxes.map(({ el }) => el),
      { height: (i: number) => `${boxes[i].was}px`, autoRound: false },
      { height: (i: number) => `${boxes[i].at}px`, clearProps: 'height', autoRound: false },
      0,
    );
  }
  draw();
  return [...opened, ...fresh];
}

/** Holds `anim` at its start until the next frame: the render before it would eat its first tens of ms. */
export function nextFrame<T extends gsap.core.Animation>(anim: T): T {
  anim.pause();
  requestAnimationFrame(() => {
    gsap.ticker.tick();
    anim.play();
  });
  return anim;
}
