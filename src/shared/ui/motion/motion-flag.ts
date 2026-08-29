import { DestroyRef, inject } from '@angular/core';
import { gsap } from 'gsap';

/**
 * A flag that follows prefers-reduced-motion, reverted when the caller is destroyed.
 *
 * GSAP's own matchMedia is the source, so the flag and the tweens it gates can never
 * disagree. Call it from a constructor: it takes `DestroyRef` from the injection context.
 *
 * Lives in `shared/ui` rather than `shared/lib` because a shared segment may only import
 * itself, and the components that gate tweens on it are all here.
 */
export function motionFlag(): { enabled: boolean } {
  const flag = { enabled: false };
  const media = gsap.matchMedia();

  media.add('(prefers-reduced-motion: no-preference)', () => {
    flag.enabled = true;
    return () => {
      flag.enabled = false;
    };
  });

  inject(DestroyRef).onDestroy(() => media.revert());

  return flag;
}
