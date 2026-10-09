import { Component, ElementRef, afterRenderEffect, input, output, viewChild } from '@angular/core';

import { S, digitDiff, pageSettled, reduced, springEasing } from './motion';

/** iOS numericText: only changed digits roll, upward when the value rises. */
@Component({
  selector: 'app-numeric-text',
  host: { class: 'inline-block tabular-nums' },
  template: `<span class="sr-only">{{ value() }}</span
    ><span #digits aria-hidden="true"></span>`,
})
export class NumericText {
  readonly value = input.required<string | number>();
  /** A purely numeric value went up. */
  readonly rose = output();

  private readonly digits = viewChild.required<ElementRef<HTMLElement>>('digits');
  private last = '';
  private gen = 0;
  /* Its own, so ending them needs no getAnimations(), a style read right after the render. */
  private rolling: Animation[] = [];

  constructor() {
    afterRenderEffect(() => this.roll(this.digits().nativeElement, String(this.value())));
  }

  private roll(box: HTMLElement, next: string): void {
    const prev = this.last;
    if (next === prev) return;
    this.last = next;
    const plan = digitDiff(prev, next);
    // A count that changed while its page was covered lands plainly; no style read, which would restyle after a render.
    const away = !!plan && !!box.closest('ion-router-outlet > *') && !pageSettled(box);
    // Each change settles the last at once; stale callbacks never touch reused cells.
    const gen = ++this.gen;
    this.rolling.splice(0).forEach((a) => a.cancel());
    box.querySelectorAll('.nt-out, .nt-dying').forEach((el) => el.remove());
    if (plan?.dir === 1 && !away) this.rose.emit();
    if (!plan || away || reduced()) {
      box.replaceChildren(...(/^\d+$/.test(next) ? [...next].map((d) => cell(box, d)) : [next]));
      return;
    }
    const cells = [...box.children];
    while (cells.length < next.length) cells.unshift(box.insertBefore(cell(box), box.firstChild));
    const timing = { duration: S.feedback.duration, easing: springEasing(S.feedback) };
    for (const i of plan.changed) {
      const c = cells[cells.length - i];
      const digit = next[next.length - i];
      const old = c.firstElementChild;
      if (old) {
        old.classList.add('nt-out');
        const out = old.animate(slide(0, -plan.dir), { ...timing, fill: 'forwards' });
        this.rolling.push(out);
        out.onfinish = () => {
          if (gen === this.gen) (digit ? old : c).remove();
        };
      }
      if (!digit) {
        c.classList.add('nt-dying');
        continue;
      }
      const neu = glyph(box, digit);
      c.append(neu);
      this.rolling.push(neu.animate(slide(plan.dir, 0), timing));
    }
  }
}

const slide = (from: number, to: number): Keyframe[] =>
  [from, to].map((at) => ({
    translate: `0 ${at * 60}%`,
    opacity: at ? 0 : 1,
    filter: `blur(${at ? 1.5 : 0}px)`,
  }));

const glyph = (box: Element, d: string) =>
  Object.assign(box.ownerDocument.createElement('span'), { textContent: d });

const cell = (box: Element, d?: string) => {
  const c = box.ownerDocument.createElement('span');
  c.className = 'nt-c';
  if (d) c.append(glyph(box, d));
  return c;
};
