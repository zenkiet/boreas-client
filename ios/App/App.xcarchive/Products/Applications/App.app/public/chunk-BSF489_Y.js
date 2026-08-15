import {
  $r as px,
  Ei as vA,
  Kt as Vi,
  N as HE,
  Sr as kr,
  Wi as xx,
  _i as tg,
  di as sR,
  fi as sg,
  gn as aC,
  jt as Rx,
  l as Ax,
  or as hx,
  yi as tr,
  zr as ng,
} from './chunk-CD8PwEax.js';
var x = [`*`, [[``, `panelActions`, ``]]];
var v = [`*`, `[panelActions]`];
function C(n, d) {
  if ((n & 1 && (tg(0, `p`, 5), sR(1), ng()), n & 2)) {
    let e = Ax(2);
    (vA(), aC(e.description()));
  }
}
function P(n, d) {
  if (
    (n & 1 &&
      (tg(0, `header`, 1)(1, `hgroup`, 3)(2, `h2`, 4),
      sR(3),
      ng(),
      hx(4, C, 2, 1, `p`, 5),
      ng(),
      tg(5, `div`, 6),
      Rx(6, 1),
      ng()()),
    n & 2)
  ) {
    let e = Ax();
    (vA(2), HE(`id`, e.titleId), vA(), aC(e.heading()), vA(), px(e.description() ? 4 : -1));
  }
}
var E = 0;
var b = class n {
  uid = `panel-${(E += 1)}`;
  heading = tr(``);
  description = tr(``);
  flush = tr(!1);
  titleId = `${this.uid}-title`;
  static ɵfac = function (e) {
    return new (e || n)();
  };
  static ɵcmp = Vi({
    type: n,
    selectors: [[`app-panel`]],
    inputs: { heading: [1, `heading`], description: [1, `description`], flush: [1, `flush`] },
    ngContentSelectors: v,
    decls: 4,
    vars: 4,
    consts: [
      [1, `panel`],
      [1, `panel__header`],
      [1, `panel__body`],
      [1, `panel__heading`],
      [1, `panel__title`, 3, `id`],
      [1, `panel__description`],
      [1, `panel__actions`, `empty:hidden`],
    ],
    template: function (e, o) {
      (e & 1 &&
        (xx(x), tg(0, `section`, 0), hx(1, P, 7, 3, `header`, 1), tg(2, `div`, 2), Rx(3), ng()()),
        e & 2 &&
          (kr(`aria-labelledby`, o.heading() ? o.titleId : null),
          vA(),
          px(o.heading() ? 1 : -1),
          vA(),
          sg(`panel__body--flush`, o.flush())));
    },
    styles: [
      `.panel[_ngcontent-%COMP%]{display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--%NS%tui-border-normal);border-radius:var(--%NS%tui-radius-l);background:var(--%NS%tui-background-base);box-shadow:var(--%NS%app-shadow-panel)}.panel__header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem;min-block-size:3rem;padding:.625rem 1rem;border-block-end:1px solid var(--%NS%tui-border-normal)}.panel__heading[_ngcontent-%COMP%]{display:flex;min-inline-size:0;flex-direction:column;gap:.0625rem;margin:0}.panel__title[_ngcontent-%COMP%]{margin:0;font-size:1.0625rem;font-weight:600;line-height:1.4;letter-spacing:-.005em;color:var(--%NS%tui-text-primary)}.panel__description[_ngcontent-%COMP%]{margin:0;font-size:.8125rem;line-height:1.45;color:var(--%NS%tui-text-tertiary)}.panel__actions[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.5rem;margin-inline-start:auto;flex-wrap:wrap;justify-content:flex-end}.panel__body[_ngcontent-%COMP%]{display:flex;min-inline-size:0;flex-direction:column;gap:.875rem;padding:1rem}.panel__body--flush[_ngcontent-%COMP%]{gap:0;padding:0}`,
    ],
  });
};
export { b as t };
