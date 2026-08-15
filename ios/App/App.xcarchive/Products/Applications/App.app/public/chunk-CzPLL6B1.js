import {
  $ as LI,
  Bn as eg,
  Dt as Rl,
  Ei as vA,
  Kt as Vi,
  Qr as pl,
  Ti as v,
  Ur as oe,
  Wt as VE,
  b as EJ,
  di as sR,
  gn as aC,
  wi as ur,
} from './chunk-CD8PwEax.js';
import { t as v$1 } from './chunk-thr6BV2C.js';
var f = class a {
  data = LI(v(ur).data, { initialValue: {} });
  icon = oe(() => this.data().icon ?? `@tui.sparkles`);
  description = oe(
    () => this.data().description ?? `This feature is on the way. Check back in a future update.`,
  );
  static ɵfac = function (t) {
    return new (t || a)();
  };
  static ɵcmp = Vi({
    type: a,
    selectors: [[`app-coming-soon-page`]],
    decls: 11,
    vars: 2,
    consts: [
      [`appReveal`, ``, 1, `page`],
      [`aria-hidden`, `true`, 1, `orb`],
      [1, `orb__ring`, `orb__ring--1`],
      [1, `orb__ring`, `orb__ring--2`],
      [1, `orb__icon`, 3, `icon`],
      [1, `page__title`],
      [1, `page__copy`],
      [1, `page__badge`],
    ],
    template: function (t, s) {
      (t & 1 &&
        (pl(0, `div`, 0)(1, `div`, 1),
        Rl(2, `span`, 2)(3, `span`, 3)(4, `tui-icon`, 4),
        eg(),
        pl(5, `h1`, 5),
        sR(6, `Coming soon`),
        eg(),
        pl(7, `p`, 6),
        sR(8),
        eg(),
        pl(9, `span`, 7),
        sR(10, `In the works`),
        eg()()),
        t & 2 && (vA(4), VE(`icon`, s.icon()), vA(4), aC(s.description())));
    },
    dependencies: [v$1, EJ],
    styles: [
      `.page[_ngcontent-%COMP%]{display:flex;min-block-size:max(24rem,62dvh);flex-direction:column;align-items:center;justify-content:center;padding-inline:1.5rem;text-align:center}.orb[_ngcontent-%COMP%]{position:relative;display:flex;align-items:center;justify-content:center;inline-size:6rem;block-size:6rem;border-radius:50%;background:var(--%NS%tui-background-neutral-1);box-shadow:inset 0 0 0 1px var(--%NS%tui-border-normal),inset 0 1px 0 var(--%NS%app-chrome-glow)}.orb__icon[_ngcontent-%COMP%]{inline-size:2.25rem;block-size:2.25rem;font-size:2.25rem;color:var(--%NS%tui-text-secondary)}.orb__ring[_ngcontent-%COMP%]{position:absolute;inset:0;border-radius:50%;border:1px solid var(--%NS%tui-border-normal);opacity:0}@media(prefers-reduced-motion:no-preference){.orb__ring[_ngcontent-%COMP%]{animation:orb-ripple 3.2s ease-out infinite}.orb__ring--2[_ngcontent-%COMP%]{animation-delay:1.6s}}@keyframes _ngcontent-%COMP%_orb-ripple{0%{transform:scale(1);opacity:.8}to{transform:scale(1.9);opacity:0}}.page__title[_ngcontent-%COMP%]{margin:1.75rem 0 .5rem;font-size:1.75rem;font-weight:700;letter-spacing:-.02em;color:var(--%NS%tui-text-primary)}.page__copy[_ngcontent-%COMP%]{margin:0;max-inline-size:20rem;font-size:1.0625rem;line-height:1.5;color:var(--%NS%tui-text-secondary)}.page__badge[_ngcontent-%COMP%]{margin-block-start:1.5rem;border-radius:999px;padding:.375rem .875rem;background:var(--%NS%tui-background-neutral-1);font-size:.8125rem;font-weight:500;color:var(--%NS%tui-text-secondary)}`,
    ],
  });
};
export { f as ComingSoonPage };
