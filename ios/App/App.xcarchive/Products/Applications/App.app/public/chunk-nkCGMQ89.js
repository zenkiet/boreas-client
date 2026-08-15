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
var x = [`*`];
function y(t, l) {
  if ((t & 1 && (tg(0, `p`, 3), sR(1), ng()), t & 2)) {
    let e = Ax();
    (vA(), aC(e.description()));
  }
}
var u = class t {
  title = tr.required();
  description = tr(``);
  static ɵfac = function (e) {
    return new (e || t)();
  };
  static ɵcmp = Vi({
    type: t,
    selectors: [[`app-page-header`]],
    inputs: { title: [1, `title`], description: [1, `description`] },
    ngContentSelectors: x,
    decls: 7,
    vars: 2,
    consts: [
      [
        1,
        `flex`,
        `flex-col`,
        `gap-3`,
        `md:flex-row`,
        `md:items-start`,
        `md:justify-between`,
        `md:gap-8`,
      ],
      [1, `flex`, `min-w-0`, `flex-col`, `gap-1.5`],
      [1, `page-header__title`],
      [1, `page-header__description`],
      [1, `flex`, `flex-wrap`, `items-center`, `gap-2`, `empty:hidden`, `md:shrink-0`],
    ],
    template: function (e, m) {
      (e & 1 &&
        (xx(),
        tg(0, `header`, 0)(1, `hgroup`, 1)(2, `h1`, 2),
        sR(3),
        ng(),
        hx(4, y, 2, 1, `p`, 3),
        ng(),
        tg(5, `div`, 4),
        Rx(6),
        ng()()),
        e & 2 && (vA(3), aC(m.title()), vA(), px(m.description() ? 4 : -1)));
    },
    styles: [
      `.page-header__title[_ngcontent-%COMP%]{margin:0;font-size:2.125rem;font-weight:700;line-height:1.2;letter-spacing:-.022em;color:var(--%NS%tui-text-primary)}.page-header__description[_ngcontent-%COMP%]{max-inline-size:46rem;margin:0;font-size:.9375rem;line-height:1.5;color:var(--%NS%tui-text-secondary)}`,
    ],
  });
};
export { u as t };
