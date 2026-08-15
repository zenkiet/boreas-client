import {
  $r as px,
  An as dQ,
  Bn as eg,
  Dt as Rl,
  Ei as vA,
  G as JX,
  Kt as Vi,
  Mt as SM,
  Qr as pl,
  Ti as v,
  Ur as oe,
  Wt as VE,
  fi as sg,
  ki as vR,
  l as Ax,
  or as hx,
  w as FE,
  yi as tr,
} from './chunk-CD8PwEax.js';
import { T as ei, x as Yt } from './main-YU6HVKXZ.js';
import { t as F } from './chunk-Cxjo7Efo.js';
var S = () => ({});
function w(e, i) {
  if ((e & 1 && Rl(0, `span`, 2), e & 2)) {
    let t = i.polymorpheusOutlet;
    VE(`innerHTML`, t, SM);
  }
}
function P(e, i) {
  if ((e & 1 && (pl(0, `span`, 0), FE(1, w, 1, 1, `span`, 1), eg()), e & 2)) {
    let t = i,
      r = Ax();
    (vA(),
      VE(`polymorpheusOutlet`, t.message || r.default())(
        `polymorpheusOutletContext`,
        t.context || vR(2, S),
      ));
  }
}
var it = (() => {
  class e {
    constructor() {
      ((this.default = v(JX)),
        (this.content = oe((t = this.error()) => (dQ(t) ? new F(t) : t))),
        (this.error = tr(null)));
    }
    static {
      this.ɵfac = function (r) {
        return new (r || e)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: e,
        selectors: [[`tui-error`]],
        hostVars: 2,
        hostBindings: function (r, o) {
          r & 2 && sg(`_error`, o.content());
        },
        inputs: { error: [1, `error`] },
        decls: 1,
        vars: 1,
        consts: [
          [`tuiAnimated`, ``, 1, `t-message-text`],
          [3, `innerHTML`, 4, `polymorpheusOutlet`, `polymorpheusOutletContext`],
          [3, `innerHTML`],
        ],
        template: function (r, o) {
          if ((r & 1 && hx(0, P, 2, 3, `span`, 0), r & 2)) {
            let s;
            px((s = o.content()) ? 0 : -1, s);
          }
        },
        dependencies: [Yt, ei],
        styles: [
          `[_nghost-%COMP%]{transition-property:grid-template-rows;transition-duration:calc(var(--%NS%tui-duration) / 2);transition-timing-function:var(--%NS%tui-curve-productive-standard);display:grid;font:var(--%NS%tui-typography-body-s);color:var(--%NS%tui-text-negative);overflow-wrap:break-word;grid-template-rows:0fr}._error[_nghost-%COMP%]{grid-template-rows:1fr;transition-duration:var(--%NS%tui-duration)}.t-message-text[_ngcontent-%COMP%]{white-space:pre-line;grid-area:1 / 1 / span 2}.t-message-text.tui-enter[_ngcontent-%COMP%]{animation-name:tuiFade}.t-message-text.tui-leave[_ngcontent-%COMP%]{animation-name:tuiFade;animation-duration:calc(var(--%NS%tui-duration) / 2)}.t-message-text[_ngcontent-%COMP%]:before{content:"";line-height:calc(24 / 14);vertical-align:bottom}`,
        ],
      });
    }
  }
  return e;
})();
export { it as t };
