import {
  $r as px,
  Ei as vA,
  Kt as Vi,
  Wi as xx,
  _i as tg,
  di as sR,
  gn as aC,
  jt as Rx,
  l as Ax,
  or as hx,
  yi as tr,
  zr as ng,
} from './chunk-CD8PwEax.js';
var f = [`*`];
function x(t, o) {
  if ((t & 1 && (tg(0, `span`, 3), sR(1), ng()), t & 2)) {
    let e = Ax(2);
    (vA(), aC(e.trailing()));
  }
}
function y(t, o) {
  if (
    (t & 1 && (tg(0, `div`, 0)(1, `h2`, 2), sR(2), ng(), hx(3, x, 2, 1, `span`, 3), ng()), t & 2)
  ) {
    let e = Ax();
    (vA(2), aC(e.label()), vA(), px(e.trailing() ? 3 : -1));
  }
}
var b = class t {
  label = tr(``);
  trailing = tr(``);
  static ɵfac = function (e) {
    return new (e || t)();
  };
  static ɵcmp = Vi({
    type: t,
    selectors: [[`app-inset-group`]],
    inputs: { label: [1, `label`], trailing: [1, `trailing`] },
    ngContentSelectors: f,
    decls: 3,
    vars: 1,
    consts: [
      [1, `head`],
      [1, `box`],
      [1, `head__label`],
      [`aria-live`, `polite`, 1, `head__trailing`, `tabular`],
    ],
    template: function (e, _) {
      (e & 1 && (xx(), hx(0, y, 4, 2, `div`, 0), tg(1, `div`, 1), Rx(2), ng()),
        e & 2 && px(_.label() ? 0 : -1));
    },
    styles: [
      `[_nghost-%COMP%]{display:block}.head[_ngcontent-%COMP%]{display:flex;align-items:baseline;justify-content:space-between;gap:.75rem;padding:0 .25rem .375rem}.head__label[_ngcontent-%COMP%]{margin:0;font-size:.8125rem;font-weight:500;line-height:1.4;color:var(--%NS%tui-text-tertiary)}.head__trailing[_ngcontent-%COMP%]{font-size:.8125rem;color:var(--%NS%tui-text-tertiary);white-space:nowrap}.box[_ngcontent-%COMP%]{overflow:hidden;border-radius:var(--%NS%tui-radius-l);background:var(--%NS%tui-background-base)}`,
    ],
  });
};
export { b as t };
