import {
  Bn as eg,
  Dt as Rl,
  Ei as vA,
  Kt as Vi,
  Qr as pl,
  b as EJ,
  di as sR,
  gn as aC,
  rt as M9,
  sa as zo,
  yi as tr,
} from './chunk-CD8PwEax.js';
import { i as It } from './chunk-bRWS10C8.js';
var y = class c {
  title = tr(`Something went wrong`);
  message = tr.required();
  retry = M9();
  static ɵfac = function (i) {
    return new (i || c)();
  };
  static ɵcmp = Vi({
    type: c,
    selectors: [[`app-error-state`]],
    inputs: { title: [1, `title`], message: [1, `message`] },
    outputs: { retry: `retry` },
    decls: 10,
    vars: 2,
    consts: [
      [`role`, `alert`, 1, `state`],
      [`aria-hidden`, `true`, 1, `state__icon`],
      [`icon`, `@tui.triangle-alert`, 1, `icon-lg`],
      [1, `state__title`],
      [1, `state__description`],
      [`tuiButton`, ``, `type`, `button`, `size`, `s`, `appearance`, `secondary`, 3, `click`],
      [`icon`, `@tui.refresh-cw`, 1, `icon-sm`],
    ],
    template: function (i, r) {
      (i & 1 &&
        (pl(0, `div`, 0)(1, `span`, 1),
        Rl(2, `tui-icon`, 2),
        eg(),
        pl(3, `h2`, 3),
        sR(4),
        eg(),
        pl(5, `p`, 4),
        sR(6),
        eg(),
        pl(7, `button`, 5),
        zo(`click`, function () {
          return r.retry.emit();
        }),
        Rl(8, `tui-icon`, 6),
        sR(9, ` Try again `),
        eg()()),
        i & 2 && (vA(4), aC(r.title()), vA(2), aC(r.message())));
    },
    dependencies: [It, EJ],
    styles: [
      `.state[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;gap:.5rem;padding:3rem 1.5rem;border:1px solid var(--%NS%tui-status-negative-pale-hover);border-radius:var(--%NS%tui-radius-l);background:var(--%NS%tui-background-base);text-align:center}.state__icon[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;inline-size:2.75rem;block-size:2.75rem;margin-block-end:.25rem;border-radius:var(--%NS%tui-radius-m);background:var(--%NS%tui-status-negative-pale);color:var(--%NS%tui-status-negative)}.state__title[_ngcontent-%COMP%]{margin:0;font-size:1.0625rem;font-weight:600;color:var(--%NS%tui-text-primary)}.state__description[_ngcontent-%COMP%]{max-inline-size:30rem;margin:0 0 .5rem;font-size:.9375rem;line-height:1.5;color:var(--%NS%tui-text-secondary)}`,
    ],
  });
};
export { y as t };
