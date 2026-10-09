import { ElementRef, inject, signal } from '@angular/core';

import { settled } from './motion';

/** An `[animate.enter]` class that stays off while the page is still sliding in. */
export function entrance(cls: string): () => string {
  const host: HTMLElement = inject(ElementRef).nativeElement;
  return () => (settled(host) ? `fx ${cls}` : '');
}

let skeletonAt = -Infinity;
let risen = 0;
const rising = new Map<HTMLElement, boolean>();

export function skeletonLeft(): void {
  skeletonAt = performance.now();
}

/** `[animate.enter]` for rows that replace a skeleton the reader saw, on a settled page. */
export function rise(): () => string {
  const host: HTMLElement = inject(ElementRef).nativeElement;
  // ponytail: a 100 ms window, not a handshake: rows render in the tick that drops the skeleton.
  return () => {
    if (performance.now() - skeletonAt >= 100) return '';
    // Staggered by render order and checked once per list: :nth-child would restyle every later row on each insert.
    if (!risen++) {
      queueMicrotask(() => {
        risen = 0;
        rising.clear();
      });
    }
    if (!rising.has(host)) rising.set(host, settled(host));
    return rising.get(host) ? `fx fx-rise fx-rise-${Math.min(risen, 6)}` : '';
  };
}

/** `[data-dir]` of a section switch; cleared once a section lands, so a cached page never replays it. */
export function sectionDir() {
  const dir = signal<number | null>(null);
  return {
    dir: dir.asReadonly(),
    go: (from: number, to: number) => dir.set(Math.sign(to - from)),
    // The attribute too: a page pushed mid-switch is detached and would keep it until it returns.
    landed: (event: Event) => {
      const section = event.target as Element;
      // A quick second switch cancels the hidden one's fade, not the next section's.
      if (!section.classList.contains('fx-section') || section.classList.contains('hidden')) return;
      (event.currentTarget as Element).removeAttribute('data-dir');
      dir.set(null);
    },
  };
}
