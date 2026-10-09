import { DOCUMENT } from '@angular/common';
import { inject, provideAppInitializer } from '@angular/core';
import type { Animation, AnimationBuilder } from '@ionic/angular';
import { createAnimation } from '@ionic/core/components';
import {
  iosTransitionAnimation,
  popoverEnterAnimation,
  popoverLeaveAnimation,
} from '@rdlabo/ionic-theme-ios27';

import { T, reduced } from '@shared/ui/motion/motion';

type NavOptions = Parameters<typeof iosTransitionAnimation>[1];

export const navAnimation = (el: HTMLElement, opts: NavOptions): Animation => {
  if (!reduced()) return iosTransitionAnimation(el, opts);
  // Only the top page fades, so nothing shows through between the two.
  const back = opts.direction === 'back';
  const top = (back && opts.leavingEl) || opts.enteringEl;
  return createAnimation()
    .addElement(opts.enteringEl)
    .beforeRemoveClass('ion-page-invisible')
    .duration(T.quick)
    .addAnimation(
      createAnimation()
        .addElement(top)
        .fromTo('opacity', back ? 1 : 0, back ? 0 : 1),
    );
};

/* The theme's popover children carry their own durations and delays, which duration(0) misses. */
const instant = (ani: Animation): Animation => {
  ani.childAnimations.forEach(instant);
  return ani.duration(0).delay(0);
};
const still =
  (build: AnimationBuilder): AnimationBuilder =>
  (el, opts) =>
    reduced() ? instant(build(el, opts)) : build(el, opts);

export const popoverEnter = still(popoverEnterAnimation);
export const popoverLeave = still(popoverLeaveAnimation);

/** Ionic exports no toast, alert or modal builder to wrap; a sheet still lands on its detent at 0 ms. */
export const provideStillOverlays = () =>
  provideAppInitializer(() => {
    const doc = inject(DOCUMENT);
    for (const type of ['Toast', 'Alert', 'Modal', 'Popover']) {
      doc.addEventListener(`ion${type}WillPresent`, (e) => {
        if (!reduced()) return;
        const overlay = e.target as HTMLIonModalElement;
        // Per present, not a CSS rule: turning Reduce Motion on must not replay a showing one.
        overlay.animate({ opacity: [0, 1] }, T.quick);
        if (type !== 'Popover') overlay.animated = false;
      });
    }
  });
