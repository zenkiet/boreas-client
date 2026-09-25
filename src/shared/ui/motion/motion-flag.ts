import { DestroyRef, inject } from '@angular/core';
import { gsap } from 'gsap';

/** Reads GSAP's own matchMedia, so the flag and the tweens it gates never disagree. */
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
