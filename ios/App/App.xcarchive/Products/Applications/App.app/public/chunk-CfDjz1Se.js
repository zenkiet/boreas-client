import {
  $ as LI,
  $n as hC,
  $r as px,
  $t as Y,
  A as GX,
  Bn as eg,
  Cr as kx,
  Dt as Rl,
  E as FO,
  Ei as vA,
  Fi as vx,
  Ft as Se$1,
  Hn as fQ,
  Kn as fc,
  Kr as ot,
  Kt as Vi,
  L as Hy,
  Li as wR,
  Lr as mx,
  Nt as SR,
  Qi as ye$1,
  Qn as gx,
  Qr as pl,
  Si as ub,
  Sr as kr,
  T as FK,
  Ti as v,
  U as Ix,
  Un as fR,
  Ur as oe,
  Vn as et,
  W as J,
  Wi as xx,
  Wt as VE,
  Xt as Wo,
  _i as tg,
  ai as qe$1,
  an as ZE,
  ar as hs,
  b as EJ,
  bt as Px,
  c as An,
  ca as zv,
  di as sR,
  dn as _R,
  dt as Na,
  ea as yr,
  ei as q$1,
  en as YE,
  fi as sg,
  fr as it,
  gn as aC,
  hr as jE,
  i as A1,
  ir as hb,
  j as H,
  jt as Rx,
  l as Ax,
  la as l,
  li as ru,
  m as By,
  mn as _r,
  na as yx,
  or as hx,
  pt as O9,
  q as Jy,
  sa as zo,
  ta as yt,
  tr as hR,
  vn as ag,
  vr as jn,
  vt as PI,
  w as FE,
  x as ER,
  yi as tr,
  zi as x9,
  zr as ng,
} from './chunk-CD8PwEax.js';
import { i as It } from './chunk-bRWS10C8.js';
import { i as j } from './main-YU6HVKXZ.js';
import './chunk-C4cee0NY.js';
import {
  a as Ut,
  c as j$1,
  d as on,
  i as Pt,
  l as nn$1,
  o as V,
  p as sn,
} from './chunk-PFRT3jyP.js';
import { i as j$2, n as D, r as H$1, t as $ } from './chunk-COdxrnu4.js';
import { t as y } from './chunk-BQF1IQ6o.js';
import { t as b } from './chunk-xBD-xwVE.js';
import { t as v$1 } from './chunk-thr6BV2C.js';
import './chunk-BhZX3ewP.js';
import { a as te, i as ke$1, n as Q, r as Wa, t as Di } from './chunk-DIS1-kDx.js';
import { a as h, r as W$1 } from './chunk-BBNeZJmf.js';
var ye = 3e4;
var ve = 121;
var q = class e {
  api = v(D);
  buffer = H([]);
  samples = this.buffer.asReadonly();
  constructor() {
    jn(0, ye)
      .pipe(
        qe$1(() => this.api.get().pipe(yr(() => ye$1))),
        fc(),
      )
      .subscribe((n) => {
        this.buffer.update((t) => [...t, { at: Date.now(), running: n.runningTasks }].slice(-ve));
      });
  }
  static ɵfac = function (t) {
    return new (t || e)();
  };
  static ɵprov = q$1({ token: e, factory: e.ɵfac, providedIn: `root` });
};
function Ce(e, n) {
  if ((e & 1 && (tg(0, `span`, 3), sR(1), ng()), e & 2)) {
    let t = Ax();
    (vA(), ag(`of `, t.hostMemory()));
  }
}
var W = class e {
  stats = tr.required();
  memoryValue = oe(() => {
    let { value: n, unit: t } = ke$1(this.stats().containerMemoryMb * 1048576);
    return `${n} ${t}`;
  });
  hostMemory = oe(() =>
    this.stats().totalMemoryMb > 0 ? Wa(this.stats().totalMemoryMb * 1048576) : ``,
  );
  static ɵfac = function (t) {
    return new (t || e)();
  };
  static ɵcmp = Vi({
    type: e,
    selectors: [[`app-stat-tiles`]],
    inputs: { stats: [1, `stats`] },
    decls: 11,
    vars: 5,
    consts: [
      [1, `tile`],
      [1, `tile__label`],
      [1, `tile__value`, `tabular`],
      [1, `tile__note`],
    ],
    template: function (t, i) {
      (t & 1 &&
        (tg(0, `div`, 0)(1, `span`, 1),
        sR(2, `Stopped or error`),
        ng(),
        tg(3, `span`, 2),
        sR(4),
        ng()(),
        tg(5, `div`, 0)(6, `span`, 1),
        sR(7, `Memory`),
        ng(),
        tg(8, `span`, 2),
        sR(9),
        hx(10, Ce, 2, 1, `span`, 3),
        ng()()),
        t & 2 &&
          (vA(3),
          sg(`tile__value--negative`, i.stats().stoppedTasks > 0),
          vA(),
          ag(` `, i.stats().stoppedTasks, ` `),
          vA(5),
          ag(` `, i.memoryValue(), ` `),
          vA(),
          px(i.hostMemory() ? 10 : -1)));
    },
    styles: [
      `[_nghost-%COMP%]{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}.tile[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.125rem;border-radius:var(--%NS%tui-radius-l);background:var(--%NS%tui-background-base);padding:.75rem 1rem}.tile__label[_ngcontent-%COMP%]{font-size:.8125rem;color:var(--%NS%tui-text-secondary)}.tile__value[_ngcontent-%COMP%]{font-size:1.375rem;font-weight:600;color:var(--%NS%tui-text-primary)}.tile__value--negative[_ngcontent-%COMP%]{color:var(--%NS%tui-status-negative)}.tile__note[_ngcontent-%COMP%]{font-size:.8125rem;font-weight:400;color:var(--%NS%tui-text-tertiary)}`,
    ],
  });
};
var Se = [`*`];
function Me(e, n) {
  if ((e & 1 && (tg(0, `div`, 11), sR(1), ng()), e & 2)) {
    Ax();
    let t = hR(0);
    (vA(), ag(` `, t, ` `));
  }
}
function Te(e, n) {
  if ((e & 1 && (tg(0, `div`, 13), sR(1), ng()), e & 2)) {
    let t = n.$implicit,
      i = Ax(3);
    (vA(), ag(` `, t || i.fallbackLabel, ` `));
  }
}
function Le(e, n) {
  if ((e & 1 && (tg(0, `div`, 12), vx(1, Te, 2, 1, `div`, 13, mx), ng()), e & 2)) {
    Ax(2);
    let t = hR(2);
    (vA(), yx(t));
  }
}
function Pe(e, n) {
  if ((e & 1 && (hC(0), hx(1, Me, 2, 1, `div`, 11), hx(2, Le, 3, 0, `div`, 12)), e & 2)) {
    let t = Ax(),
      i = hR(3),
      a = fR(t.axisYName());
    (vA(), px(a ? 1 : -1), vA(), px(i ? -1 : 2));
  }
}
function ke(e, n) {
  if ((e & 1 && jE(0, `div`, 14), e & 2)) {
    let t = n.$index;
    Ax();
    let i = hR(7),
      a = hR(8);
    Wo(`border-inline-end-style`, i(t + 1, a));
  }
}
function Ee(e, n) {
  if ((e & 1 && jE(0, `div`, 15), e & 2)) {
    let t = n.$index;
    Ax();
    let i = hR(9),
      a = hR(10);
    Wo(`border-block-start-style`, i(t + 1, a));
  }
}
function Ne(e, n) {
  if ((e & 1 && (tg(0, `div`, 13), sR(1), ng()), e & 2)) {
    let t = n.$implicit,
      i = Ax(2);
    (vA(), ag(` `, t || i.fallbackLabel, ` `));
  }
}
function Oe(e, n) {
  if ((e & 1 && (tg(0, `div`, 7), vx(1, Ne, 2, 1, `div`, 13, gx), ng()), e & 2)) {
    Ax();
    let t = hR(2);
    (vA(), yx(t));
  }
}
function De(e, n) {
  if ((e & 1 && (tg(0, `div`, 16), sR(1), ng()), e & 2)) {
    let t = n.$implicit,
      i = Ax(2);
    (vA(), ag(` `, t || i.fallbackLabel, ` `));
  }
}
function we(e, n) {
  if ((e & 1 && (tg(0, `div`, 8), vx(1, De, 2, 1, `div`, 16, gx), ng()), e & 2)) {
    Ax();
    let t = hR(0);
    (vA(), yx(t));
  }
}
function Ie(e, n) {
  if ((e & 1 && (tg(0, `div`, 18), sR(1), ng()), e & 2)) {
    let t = n.$implicit,
      i = Ax(2);
    (sg(`t-label-x_transparent`, t === null), vA(), ag(` `, t || i.fallbackLabel, ` `));
  }
}
function He(e, n) {
  if ((e & 1 && (tg(0, `div`, 10), vx(1, Ie, 2, 3, `div`, 17, gx), ng()), e & 2)) {
    let t = Ax();
    (vA(), yx(t.axisXLabels()));
  }
}
function ze(e, n) {
  if ((e & 1 && (tg(0, `div`, 16), sR(1), ng()), e & 2)) {
    let t = n.$implicit,
      i = Ax(3);
    (vA(), ag(` `, t || i.fallbackLabel, ` `));
  }
}
function Ae(e, n) {
  if ((e & 1 && (tg(0, `div`, 19), vx(1, ze, 2, 1, `div`, 16, mx), ng()), e & 2)) {
    Ax(2);
    let t = hR(0);
    (vA(), yx(t));
  }
}
function $e(e, n) {
  if ((e & 1 && (tg(0, `div`, 20), sR(1), ng()), e & 2)) {
    Ax();
    let t = hR(1);
    (vA(), ag(` `, t, ` `));
  }
}
function Ye(e, n) {
  if ((e & 1 && (hx(0, Ae, 3, 0, `div`, 19), hC(1), hx(2, $e, 2, 1, `div`, 20)), e & 2)) {
    let t = Ax();
    (px(hR(1) ? -1 : 0), vA());
    let a = fR(t.axisYSecondaryName());
    (vA(), px(a ? 2 : -1));
  }
}
var ft = (e) => (e && `dashed`) || `solid`;
var Fe = () => `solid`;
var he = (() => {
  class e {
    constructor() {
      ((this.axisXLabels = tr([])),
        (this.axisYInset = tr(!1)),
        (this.axisYLabels = tr([])),
        (this.axisYName = tr(``)),
        (this.axisYSecondaryInset = tr(!1)),
        (this.axisYSecondaryLabels = tr([])),
        (this.axisYSecondaryName = tr(``)),
        (this.centeredXLabels = tr(!1)),
        (this.horizontalLines = tr(1)),
        (this.horizontalLinesHandler = tr(Fe)),
        (this.verticalLines = tr(1)),
        (this.verticalLinesHandler = tr(ft)),
        (this.fallbackLabel = `\xA0`),
        (this.hasXLabels = oe(() => !!this.axisXLabels().length)),
        (this.hasYLabels = oe(
          () => (this.axisYLabels().length && !this.axisYInset()) || !!this.axisYName(),
        )),
        (this.hasYSecondaryLabels = oe(
          () =>
            (this.axisYSecondaryLabels().length && !this.axisYSecondaryInset()) ||
            !!this.axisYSecondaryName(),
        )));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: e,
        selectors: [[`tui-axes`]],
        hostAttrs: [`dir`, `ltr`],
        hostVars: 2,
        hostBindings: function (i, a) {
          i & 2 && sg(`_centered`, a.centeredXLabels());
        },
        inputs: {
          axisXLabels: [1, `axisXLabels`],
          axisYInset: [1, `axisYInset`],
          axisYLabels: [1, `axisYLabels`],
          axisYName: [1, `axisYName`],
          axisYSecondaryInset: [1, `axisYSecondaryInset`],
          axisYSecondaryLabels: [1, `axisYSecondaryLabels`],
          axisYSecondaryName: [1, `axisYSecondaryName`],
          centeredXLabels: [1, `centeredXLabels`],
          horizontalLines: [1, `horizontalLines`],
          horizontalLinesHandler: [1, `horizontalLinesHandler`],
          verticalLines: [1, `verticalLines`],
          verticalLinesHandler: [1, `verticalLinesHandler`],
        },
        ngContentSelectors: Se,
        decls: 25,
        vars: 21,
        consts: [
          [1, `t-side`],
          [1, `t-wrapper`],
          [1, `t-grid`],
          [1, `t-vertical`],
          [
            `automation-id`,
            `tui-axex__vertical-line`,
            1,
            `t-line`,
            `t-line_vertical`,
            3,
            `border-inline-end-style`,
          ],
          [1, `t-horizontal`],
          [
            `automation-id`,
            `tui-axex__horizontal-line`,
            1,
            `t-line`,
            3,
            `border-block-start-style`,
          ],
          [1, `t-labels-y`, `t-labels-y_inset`],
          [1, `t-labels-y`, `t-labels-y_inset`, `t-labels-y_inset_secondary`],
          [1, `t-content`],
          [1, `t-labels-x`],
          [`automation-id`, `tui-axex__axis-y-name`, 1, `t-name`, `t-name_primary`],
          [1, `t-labels-y`, `t-labels-y_primary`],
          [`automation-id`, `tui-axex__axis-y-label`, 1, `t-label-y`],
          [`automation-id`, `tui-axex__vertical-line`, 1, `t-line`, `t-line_vertical`],
          [`automation-id`, `tui-axex__horizontal-line`, 1, `t-line`],
          [`automation-id`, `tui-axex__axis-y-secondary-label`, 1, `t-label-y`],
          [`automation-id`, `tui-axex__axis-x-label`, 1, `t-label-x`, 3, `t-label-x_transparent`],
          [`automation-id`, `tui-axex__axis-x-label`, 1, `t-label-x`],
          [1, `t-labels-y`, `t-labels-y_secondary`],
          [`automation-id`, `tui-axex__axis-y-secondary-name`, 1, `t-name`],
        ],
        template: function (i, a) {
          if (
            (i & 1 &&
              (xx(),
              hC(0)(1)(2)(3),
              tg(4, `div`, 0),
              hx(5, Pe, 3, 3),
              ng(),
              tg(6, `div`, 1),
              hC(7)(8)(9)(10),
              tg(11, `div`, 2)(12, `div`, 3),
              vx(13, ke, 1, 2, `div`, 4, gx),
              ng(),
              tg(15, `div`, 5),
              vx(16, Ee, 1, 2, `div`, 6, gx),
              ng(),
              hx(18, Oe, 3, 0, `div`, 7),
              hx(19, we, 3, 0, `div`, 8),
              tg(20, `div`, 9),
              Rx(21),
              ng()(),
              hx(22, He, 3, 0, `div`, 10),
              ng(),
              tg(23, `div`, 0),
              hx(24, Ye, 3, 3),
              ng()),
            i & 2)
          ) {
            (fR(a.axisYSecondaryLabels()), vA());
            let l = fR(a.axisYSecondaryInset());
            (vA(), fR(a.axisYLabels()), vA());
            let c = fR(a.axisYInset()),
              M = a.hasXLabels();
            (vA(), sg(`t-side_padding`, M), vA(), px(a.hasYLabels() ? 5 : -1), vA(2));
            let Q = fR(a.verticalLinesHandler());
            vA();
            let B = fR(a.verticalLines());
            vA();
            let rt = fR(a.horizontalLinesHandler());
            vA();
            let K = fR(a.horizontalLines());
            (vA(),
              Wo(`border-block-end-style`, rt(0, K))(`border-inline-start-style`, Q(0, B)),
              vA(2),
              yx(`-`.repeat(B - 1)),
              vA(3),
              yx(`-`.repeat(K - 1)),
              vA(2),
              px(c ? 18 : -1),
              vA(),
              px(l ? 19 : -1),
              vA(3),
              px(M ? 22 : -1),
              vA(),
              sg(`t-side_padding`, M),
              vA(),
              px(a.hasYSecondaryLabels() ? 24 : -1));
          }
        },
        styles: [
          `[_nghost-%COMP%]{display:grid;grid-template-columns:auto 1fr auto;grid-template-rows:1fr auto;block-size:100%}.t-wrapper[_ngcontent-%COMP%]{display:grid;grid-template-rows:1fr auto;grid-row:span 2}.t-grid[_ngcontent-%COMP%]{position:relative;display:flex;flex:1;justify-content:space-around;align-items:flex-end;border-width:1px;border-color:var(--%NS%tui-border-normal);isolation:isolate;grid-row:1}.t-horizontal[_ngcontent-%COMP%]{position:absolute;inset-block-start:0;inset-inline-start:0;inline-size:100%;block-size:100%;display:flex;flex-direction:column}.t-vertical[_ngcontent-%COMP%]{position:absolute;inset-block-start:0;inset-inline-start:0;inline-size:100%;block-size:100%;display:flex}._centered[_nghost-%COMP%]   .t-vertical[_ngcontent-%COMP%]:after{content:"";display:block;flex:1 0 1px}.t-line[_ngcontent-%COMP%]{flex:2 0 1px;box-sizing:border-box;border-width:1px;border-color:var(--%NS%tui-border-normal)}._centered[_nghost-%COMP%]   .t-line_vertical[_ngcontent-%COMP%]:first-child{flex:1 0 1px;pointer-events:none}.t-side[_ngcontent-%COMP%]{display:flex;align-items:stretch}.t-side_padding[_ngcontent-%COMP%]{padding-block-end:2rem}.t-name[_ngcontent-%COMP%]{font:var(--%NS%tui-typography-body-xs);writing-mode:tb;text-align:center;padding-block-end:.75rem;color:var(--%NS%tui-text-secondary)}.t-name_primary[_ngcontent-%COMP%]{transform:rotate(180deg)}.t-labels-y[_ngcontent-%COMP%]{display:flex;font:var(--%NS%tui-typography-body-xs);flex-direction:column-reverse;justify-content:space-between;color:var(--%NS%tui-text-secondary)}.t-labels-y_primary[_ngcontent-%COMP%]{text-align:end;padding-inline-end:.75rem}.t-labels-y_secondary[_ngcontent-%COMP%]{padding-inline-start:.75rem}.t-labels-y_transparent[_ngcontent-%COMP%]{border-color:transparent}.t-labels-y_inset[_ngcontent-%COMP%]{position:absolute;inset-block:.5625rem -.75rem;inset-inline:.25rem auto;pointer-events:none}.t-labels-y_inset_secondary[_ngcontent-%COMP%]{inset-inline:auto .25rem;text-align:end}.t-labels-x[_ngcontent-%COMP%]{position:relative;display:flex;font:var(--%NS%tui-typography-body-xs);border-inline-end:1px solid transparent;color:var(--%NS%tui-text-secondary)}.t-label-x[_ngcontent-%COMP%]{flex:1}.t-label-x[_ngcontent-%COMP%]:before{content:"";display:block;block-size:.5625rem;border-inline-start:1px solid var(--%NS%tui-border-normal)}.t-label-x[_ngcontent-%COMP%]:last-of-type:before{border:none}.t-label-x_transparent[_ngcontent-%COMP%]{border-color:transparent}._centered[_nghost-%COMP%]   .t-label-x[_ngcontent-%COMP%]{block-size:2rem;text-align:center;margin:0}._centered[_nghost-%COMP%]   .t-label-x[_ngcontent-%COMP%]:before{border:none}[_nghost-%COMP%]:not(._centered)   .t-label-x[_ngcontent-%COMP%]:last-child:not(:first-child){position:absolute;inset-inline-end:0;text-align:end;border-inline-start:none}.t-label-y[_ngcontent-%COMP%]:first-child{margin-block-end:-.375rem}.t-label-y[_ngcontent-%COMP%]:last-child{margin-block-start:-.375rem}.t-content[_ngcontent-%COMP%]{position:absolute;display:flex;inset-block:0 -1px;inset-inline:-1px 0;align-items:flex-end}`,
        ],
      });
    }
  }
  return e;
})();
var ge = (() => {
  class e {
    constructor() {
      ((this.content = tr(``, { alias: `tuiHintContent` })),
        (this.appearance = tr(``, { alias: `tuiHintAppearance` })));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵdir = ot({
        type: e,
        selectors: [[``, `tuiHintContent`, ``]],
        inputs: {
          content: [1, `tuiHintContent`, `content`],
          appearance: [1, `tuiHintAppearance`, `appearance`],
        },
      });
    }
  }
  return e;
})();
function Be(e, n) {
  let t = n[0] - e[0],
    i = n[1] - e[1];
  return Math.atan2(i, t);
}
function Re(e, n) {
  let t = n[0] - e[0],
    i = n[1] - e[1];
  return Math.sqrt(t ** 2 + i ** 2);
}
function fe(e, n, t, i = !1, a = 0.2) {
  let l = e || [0, 0],
    c = n || e || [0, 0],
    M = t || e || [0, 0],
    Q = Be(c, M) + (i ? Math.PI : 0),
    B = Re(c, M) * a;
  return [l[0] + Math.cos(Q) * B, l[1] + Math.sin(Q) * B];
}
function Xe(e, n, t) {
  let [i, a] = fe(e[n - 1], e[n - 2], e[n], !1, t),
    [l, c] = fe(e[n], e[n - 1], e[n + 1], !0, t),
    M = e[n] ?? [0, 0];
  return `C ${i},${a} ${l},${c} ${M[0]},${M[1]}`;
}
function Ve(e) {
  return `L ${e}`;
}
var Ue = 500;
function xe(e, n, t) {
  let i = [...(e[n] ?? [0, 0])];
  return t ? Xe(e, n, t / Ue) : Ve([i[0], i[1]]);
}
var je = (e, n) => ({ $implicit: e, index: n });
function qe(e, n) {
  if ((e & 1 && Rl(0, `div`, 8), e & 2)) {
    let t = n.$implicit,
      i = Ax(2);
    Wo(`inset-block-end`, i.getBottom(t[1]), `%`)(`inset-inline-start`, i.getLeft(t[0]), `%`);
  }
}
function We(e, n) {
  if ((e & 1 && vx(0, qe, 1, 4, `div`, 7, mx), e & 2)) yx(Ax().value());
}
function Ge(e, n) {
  if (e & 1) {
    let t = Ix();
    (pl(0, `div`, 11),
      ER(1, `async`),
      zo(`mouseenter`, function () {
        By(t);
        let a = Ax().$index;
        return Hy(Ax(2).onMouseEnter(a));
      }),
      Rl(2, `div`, 12)(3, `div`, 13, 0),
      eg());
  }
  if (e & 2) {
    let t = Px(4),
      i = Ax(),
      a = i.$implicit,
      l = i.$index,
      c = Ax(2);
    (Wo(`inset-inline-start`, c.getLeft(c.getX(l)), `%`)(`width`, c.getWidth(l), `%`),
      sg(`t-column_hint_hovered`, wR(1, 20, c.drivers()[l]))(`t-column_hovered`, c.hovered() === l),
      VE(`tuiHint`, c.hint())(`tuiHintContext`, _R(22, je, c.getImplicit(a), l))(
        `tuiHintDescribe`,
        c.isFocusable ? c.getHintId(l) : null,
      )(`tuiHintHost`, t),
      vA(2),
      Wo(`inset-inline-start`, c.getOffset(l), `%`),
      vA(),
      Wo(`inset-block-end`, c.getBottom(a[1]), `%`)(`inset-inline-start`, c.getOffset(l), `%`),
      VE(`id`, c.getHintId(l))(`tabIndex`, c.isFocusable ? 0 : -1));
  }
}
function Qe(e, n) {
  if ((e & 1 && Rl(0, `div`, 14), e & 2)) {
    let t = Ax().$implicit;
    Wo(`inset-block-end`, Ax(2).getBottom(t[1]), `%`);
  }
}
function Ke(e, n) {
  if ((e & 1 && (hx(0, Ge, 5, 25, `div`, 9), hx(1, Qe, 1, 2, `div`, 10)), e & 2)) {
    let t = n.$count,
      i = Ax(2);
    (px(t > 1 || i.dots() ? 0 : -1), vA(), px(i.isFocusable ? 1 : -1));
  }
}
function Ze(e, n) {
  if ((e & 1 && vx(0, Ke, 2, 2, null, null, mx), e & 2)) yx(Ax().value());
}
function Je(e, n) {
  if ((e & 1 && (pl(0, `div`, 17), sR(1), eg()), e & 2)) {
    let t = Ax(),
      i = hR(0);
    (Wo(`inset-inline-start`, Ax().getLeft(t[0]), `%`), vA(), ag(` `, i(t[0]), ` `));
  }
}
function ti(e, n) {
  if ((e & 1 && (pl(0, `div`, 18), sR(1), eg()), e & 2)) {
    let t = Ax(),
      i = hR(1);
    (Wo(`inset-block-end`, Ax().getBottom(t[1]), `%`), vA(), ag(` `, i(t[1]), ` `));
  }
}
function ei(e, n) {
  if ((e & 1 && (hC(0)(1), hx(2, Je, 2, 3, `div`, 15), hx(3, ti, 2, 3, `div`, 16)), e & 2)) {
    let t = Ax(),
      i = fR(t.xStringify());
    vA();
    let a = fR(t.yStringify());
    (vA(), px(i ? 2 : -1), vA(), px(a ? 3 : -1));
  }
}
var [ni, nn] = hb({ dots: !1, filled: !1, smoothingFactor: 0 }),
  xt = (() => {
    class e {
      constructor() {
        ((this.charts = O9(F)),
          (this.chartsRef = O9(F, { read: it })),
          (this.renderer = v(An)),
          (this.destroyRef = v(J)),
          (this.zone = v(Se$1)),
          (this.hovered$ = v(V)),
          (this.computedContext = oe((t = this.charts().map(({ value: i }) => i())) =>
            (t[0] || []).map((i, a) => t.map((l) => l[a] ?? [0, 0])),
          )),
          (this.hint = tr(``, { alias: `tuiLineChartHint` })));
      }
      ngAfterViewInit() {
        ru([oi(this.charts()), this.hovered$])
          .pipe(
            et((t) => !t.some(Boolean)),
            A1(this.zone),
            fc(this.destroyRef),
          )
          .subscribe(() => {
            this.charts().forEach((t) => t.onHovered(NaN));
          });
      }
      getContext(t, i) {
        return this.computedContext()[t] || [];
      }
      raise(t, i) {
        let a = this.charts().map((c) => c.value()[t] ?? [0, 0]),
          l = [...a].sort((c, M) => c[1] - M[1]);
        (this.charts().forEach((c) => c.onHovered(t)),
          this.chartsRef().forEach(({ nativeElement: c }, M) =>
            this.renderer.setStyle(c, `z-index`, l.indexOf(a[M] ?? [0, 0])),
          ));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)();
        };
      }
      static {
        this.ɵdir = ot({
          type: e,
          selectors: [[``, `tuiLineChartHint`, ``]],
          contentQueries: function (i, a, l) {
            (i & 1 && YE(l, a.charts, F, 4)(l, a.chartsRef, F, 4, it), i & 2 && kx(2));
          },
          inputs: { hint: [1, `tuiLineChartHint`, `hint`] },
          features: [Na([V])],
        });
      }
    }
    return e;
  })();
function oi(e) {
  return ru(e.map(({ drivers$: n }) => n.pipe(Y((t) => t.map((i) => i.pipe(_r(!1))))))).pipe(
    Y((n) => n.reduce((t, i) => t.concat(i), [])),
    qe$1((n) => ru(n)),
    Y((n) => n.some(Boolean)),
    zv(),
  );
}
var F = (() => {
  class e {
    constructor() {
      ((this.options = v(ni)),
        (this.autoId = fQ()),
        (this.resize = LI(
          v(h, { self: !0 }).pipe(
            Y(([t]) => t?.contentRect.height || NaN),
            et((t) => !Number.isNaN(t)),
          ),
          { initialValue: NaN },
        )),
        (this.box = oe(() => `${this.x()} ${this.y()} ${this.width()} ${this.height()}`)),
        (this.hintDirective = v(xt, { optional: !0 })),
        (this.hintOptions = v(ge, { optional: !0 })),
        (this.viewBox = oe(() => {
          if (Number.isNaN(this.resize())) return `0 0 0 0`;
          let t = this.height() / Math.max(this.resize(), 1),
            [i = 0, a = 0, l = 0, c = 0] = this.box().split(` `).map(Number);
          return `${i} ${a - t} ${l} ${c + 2 * t}`;
        })),
        (this.d = oe(() =>
          this.value().reduce(
            (t, i, a) => (a ? `${t} ${xe(this.value(), a, this.smoothingFactor())}` : `M ${i}`),
            ``,
          ),
        )),
        (this.fillD = oe(() =>
          this.value().length
            ? `${this.d()}V ${this.y()} H ${this.value()[0]?.[0]} V ${this.value()[0]?.[1]}`
            : this.d(),
        )),
        (this.hint = oe(() => this.hintDirective?.hint() || this.hintOptions?.content() || ``)),
        (this.drivers = x9(Pt)),
        (this.drivers$ = FK(this.drivers)),
        (this.x = tr(0)),
        (this.y = tr(0)),
        (this.width = tr(0)),
        (this.height = tr(0)),
        (this.smoothingFactor = tr(this.options.smoothingFactor)),
        (this.xStringify = tr(null)),
        (this.yStringify = tr(null)),
        (this.filled = tr(this.options.filled)),
        (this.dots = tr(this.options.dots)),
        (this.value = tr([], { transform: (t) => t.filter((i) => !i.some(Number.isNaN)) })),
        (this.hovered = H(NaN)));
    }
    onHovered(t) {
      this.hovered.set(t);
    }
    get fillId() {
      return `tui-line-chart-${this.autoId}`;
    }
    get fill() {
      return this.filled() ? `url(#${this.fillId})` : `none`;
    }
    get isFocusable() {
      return !this.hintDirective && this.hasHints;
    }
    get hasHints() {
      return !!this.xStringify() || !!this.yStringify() || !!this.hint();
    }
    onMouseLeave() {
      this.hintDirective || this.onHovered(NaN);
    }
    getX(t) {
      return this.isSinglePoint
        ? (this.value()[0]?.[0] || 0) / 2
        : t
          ? ((this.value()[t - 1]?.[0] || 0) + (this.value()[t]?.[0] || 0)) / 2
          : 2 * (this.value()[0]?.[0] || 0) - this.getX(1);
    }
    getWidth(t) {
      return (100 * this.computeWidth(t)) / this.width();
    }
    getHintId(t) {
      return `${this.autoId}_${t}`;
    }
    getImplicit(t) {
      return this.hintDirective?.getContext(this.value().indexOf(t), this) ?? t;
    }
    getHovered(t) {
      return ub(t) && Number.isInteger(t) ? (this.value()[t] ?? null) : null;
    }
    getBottom(t) {
      return (100 * (t - this.y())) / this.height();
    }
    getLeft(t) {
      return (100 * (t - this.x())) / this.width();
    }
    getOffset(t) {
      return (100 * ((this.value()[t]?.[0] || 0) - this.getX(t))) / this.computeWidth(t);
    }
    onMouseEnter(t) {
      this.hintDirective ? this.hintDirective.raise(t, this) : this.onHovered(t);
    }
    get isSinglePoint() {
      return this.value().length === 1;
    }
    computeWidth(t) {
      return t === this.value().length - 1
        ? 2 * ((this.value()[t]?.[0] || 0) - this.getX(t))
        : this.getX(t + 1) - this.getX(t);
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: e,
        selectors: [[`tui-line-chart`]],
        viewQuery: function (i, a) {
          (i & 1 && ZE(a.drivers, Pt, 5), i & 2 && kx());
        },
        hostBindings: function (i, a) {
          i & 1 &&
            zo(`mouseleave`, function () {
              return a.onMouseLeave();
            });
        },
        inputs: {
          x: [1, `x`],
          y: [1, `y`],
          width: [1, `width`],
          height: [1, `height`],
          smoothingFactor: [1, `smoothingFactor`],
          xStringify: [1, `xStringify`],
          yStringify: [1, `yStringify`],
          filled: [1, `filled`],
          dots: [1, `dots`],
          value: [1, `value`],
        },
        features: [Na([h], [nn$1({ direction: `top`, hideDelay: 0 })])],
        decls: 10,
        vars: 8,
        consts: [
          [`hintHost`, ``],
          [
            `focusable`,
            `false`,
            `height`,
            `100%`,
            `preserveAspectRatio`,
            `none`,
            `width`,
            `100%`,
            `xmlns`,
            `http://www.w3.org/2000/svg`,
            1,
            `t-svg`,
          ],
          [`x1`, `0`, `x2`, `0`, `y1`, `1`, `y2`, `0`],
          [`offset`, `0%`, `stop-color`, `currentColor`, `stop-opacity`, `0.5`],
          [`offset`, `100%`, `stop-color`, `currentColor`, `stop-opacity`, `0`],
          [`stroke`, `none`],
          [
            `fill`,
            `none`,
            `stroke`,
            `currentColor`,
            `stroke-width`,
            `2`,
            `vector-effect`,
            `non-scaling-stroke`,
          ],
          [1, `t-dot`, 3, `inset-block-end`, `inset-inline-start`],
          [1, `t-dot`],
          [
            1,
            `t-column`,
            3,
            `t-column_hint_hovered`,
            `t-column_hovered`,
            `inset-inline-start`,
            `width`,
            `tuiHint`,
            `tuiHintContext`,
            `tuiHintDescribe`,
            `tuiHintHost`,
          ],
          [1, `t-line`, `t-line_horizontal`, 3, `inset-block-end`],
          [
            1,
            `t-column`,
            3,
            `mouseenter`,
            `tuiHint`,
            `tuiHintContext`,
            `tuiHintDescribe`,
            `tuiHintHost`,
          ],
          [1, `t-line`, `t-line_vertical`],
          [1, `t-host`, 3, `id`, `tabIndex`],
          [1, `t-line`, `t-line_horizontal`],
          [1, `t-hint`, `t-hint_x`, 3, `inset-inline-start`],
          [1, `t-hint`, `t-hint_y`, 3, `inset-block-end`],
          [1, `t-hint`, `t-hint_x`],
          [1, `t-hint`, `t-hint_y`],
        ],
        template: function (i, a) {
          if (
            (i & 1 &&
              (Jy(),
              pl(0, `svg`, 1)(1, `defs`)(2, `linearGradient`, 2),
              Rl(3, `stop`, 3)(4, `stop`, 4),
              eg()(),
              Rl(5, `path`, 5)(6, `path`, 6),
              eg(),
              hx(7, We, 2, 0),
              hx(8, Ze, 2, 0),
              hx(9, ei, 4, 4)),
            i & 2)
          ) {
            let l;
            (kr(`viewBox`, a.viewBox()),
              vA(2),
              kr(`id`, a.fillId),
              vA(3),
              kr(`d`, a.fillD())(`fill`, a.fill),
              vA(),
              kr(`d`, a.d()),
              vA(),
              px(a.dots() ? 7 : -1),
              vA(),
              px(a.hasHints ? 8 : -1),
              vA(),
              px((l = a.getHovered(a.hovered())) ? 9 : -1, l));
          }
        },
        dependencies: [FO, j$1, on, sn],
        styles: [
          `[_nghost-%COMP%]{display:flex;inline-size:100%;block-size:100%;pointer-events:none}.t-svg[_ngcontent-%COMP%]{block-size:calc(100% + 1px);transform:scaleY(-1);margin:-.03125rem 0}.t-column[_ngcontent-%COMP%]{position:absolute;inset-block-start:0;block-size:100%;pointer-events:auto}.t-dot[_ngcontent-%COMP%]{position:absolute;inline-size:.375rem;block-size:.375rem;border-radius:100%;background:currentColor;margin:-.1875rem;box-shadow:0 0 0 2px #fff}.t-host[_ngcontent-%COMP%]{position:absolute;inset-inline-start:50%;inline-size:.5rem;block-size:.5rem;border-radius:100%;opacity:0;background:#fff;margin:-.25rem;box-shadow:0 0 0 2px currentColor,0 .0625rem .1875rem .125rem #0000001a;outline:none;pointer-events:none}.t-host[_ngcontent-%COMP%]:focus, .t-column_hovered[_ngcontent-%COMP%]   .t-host[_ngcontent-%COMP%], .t-column[_ngcontent-%COMP%]:hover   .t-host[_ngcontent-%COMP%], .t-column_hint_hovered[_ngcontent-%COMP%]   .t-host[_ngcontent-%COMP%]{opacity:1}.t-line[_ngcontent-%COMP%]{position:absolute;opacity:0;background:var(--%NS%tui-border-normal)}.t-line_vertical[_ngcontent-%COMP%]{inset-block:0;inset-inline:50% auto;inline-size:1px}.t-line_horizontal[_ngcontent-%COMP%]{z-index:-1;inline-size:100%;block-size:1px}[style^="z-index: 0"][_nghost-%COMP%]   .t-column_hovered[_ngcontent-%COMP%]   .t-line[_ngcontent-%COMP%], [_nghost-%COMP%]:not([style])   .t-column[_ngcontent-%COMP%]:hover   .t-line[_ngcontent-%COMP%], [_nghost-%COMP%]:not([style])   .t-column_hint_hovered[_ngcontent-%COMP%]   .t-line[_ngcontent-%COMP%], [style^="z-index: 0"][_nghost-%COMP%]   .t-column_hovered[_ngcontent-%COMP%] + .t-line[_ngcontent-%COMP%], [_nghost-%COMP%]:not([style])   .t-column[_ngcontent-%COMP%]:hover + .t-line[_ngcontent-%COMP%], [_nghost-%COMP%]:not([style])   .t-column_hint_hovered[_ngcontent-%COMP%] + .t-line[_ngcontent-%COMP%]{opacity:1}.t-hint[_ngcontent-%COMP%]{position:absolute;box-shadow:var(--%NS%tui-shadow-small);font:var(--%NS%tui-typography-body-xs);block-size:1.25rem;margin-block-end:-.625rem;padding:.125rem .375rem;box-sizing:border-box;white-space:nowrap;color:var(--%NS%tui-text-primary);background:var(--%NS%tui-background-base);transform:translate3d(-50%,0,0)}.t-hint_x[_ngcontent-%COMP%]{inset-block-end:0}.t-hint_y[_ngcontent-%COMP%]{inset-inline-start:0}`,
        ],
      });
    }
  }
  return e;
})();
function ai(e, n) {
  if ((e & 1 && (pl(0, `span`, 4), sR(1), eg()), e & 2)) {
    let t = Ax();
    (vA(), ag(`of `, t.stats().maxContainers));
  }
}
function ri(e, n) {
  if ((e & 1 && (pl(0, `span`, 8), sR(1), eg()), e & 2)) {
    let t = n.$implicit,
      i = Ax(2);
    (vA(), aC(i.hintLabel(t)));
  }
}
function si(e, n) {
  if (
    (e & 1 &&
      (pl(0, `tui-axes`, 6),
      Rl(1, `tui-line-chart`, 7),
      eg(),
      FE(2, ri, 2, 1, `ng-template`, null, 0, SR)),
    e & 2)
  ) {
    let t = Px(3),
      i = Ax();
    (VE(`tuiLineChartHint`, t)(`axisXLabels`, i.xLabels())(`horizontalLines`, 2)(
      `horizontalLinesHandler`,
      i.dashed,
    ),
      vA(),
      VE(`x`, 0)(`y`, 0)(`width`, i.width())(`height`, i.yMax())(`value`, i.points())(`filled`, !0)(
        `xStringify`,
        i.xStringify(),
      )(`yStringify`, i.yStringify));
  }
}
function li(e, n) {
  e & 1 &&
    (pl(0, `p`, 5), sR(1, `Collecting activity — the first points land within a minute.`), eg());
}
var G = class e {
  stats = tr.required();
  samples = tr.required();
  dashed = ft;
  firstAt = oe(() => this.samples()[0]?.at ?? 0);
  points = oe(() => this.samples().map((n) => [(n.at - this.firstAt()) / 1e3, n.running]));
  width = oe(() => Math.max(this.points().at(-1)?.[0] ?? 0, 1));
  yMax = oe(() => Math.max(...this.samples().map((n) => n.running), 2) + 1);
  spanLabel = oe(() =>
    this.points().length < 2
      ? ``
      : `\xB7 last ${Math.max(Math.round((this.points().at(-1)?.[0] ?? 0) / 60), 1)} min`,
  );
  xLabels = oe(() => {
    let n = this.points();
    if (n.length < 2) return [];
    let t = n[Math.floor(n.length / 2)];
    return (n.length >= 3 ? [n[0], t, n.at(-1)] : [n[0], n.at(-1)]).map(([a]) => this.timeOf(a));
  });
  xStringify = oe(() => (n) => this.timeOf(n));
  yStringify = (n) => `${n} running`;
  hintLabel(n) {
    let [t, i] = n[0] ?? [0, 0];
    return `${this.timeOf(t)} \xB7 ${i} running`;
  }
  timeOf(n) {
    let t = (this.points().at(-1)?.[0] ?? 0) < 300;
    return new Date(this.firstAt() + n * 1e3).toLocaleTimeString(
      `en-GB`,
      l({ hour: `2-digit`, minute: `2-digit` }, t ? { second: `2-digit` } : {}),
    );
  }
  static ɵfac = function (t) {
    return new (t || e)();
  };
  static ɵcmp = Vi({
    type: e,
    selectors: [[`app-stats-trend`]],
    inputs: { stats: [1, `stats`], samples: [1, `samples`] },
    decls: 8,
    vars: 4,
    consts: [
      [`hint`, ``],
      [1, `trend__head`],
      [1, `trend__label`],
      [1, `trend__value`, `tabular`],
      [1, `trend__note`],
      [1, `trend__collecting`],
      [
        1,
        `trend__axes`,
        3,
        `tuiLineChartHint`,
        `axisXLabels`,
        `horizontalLines`,
        `horizontalLinesHandler`,
      ],
      [3, `x`, `y`, `width`, `height`, `value`, `filled`, `xStringify`, `yStringify`],
      [1, `tabular`],
    ],
    template: function (t, i) {
      (t & 1 &&
        (pl(0, `header`, 1)(1, `span`, 2),
        sR(2),
        eg(),
        pl(3, `span`, 3),
        sR(4),
        hx(5, ai, 2, 1, `span`, 4),
        eg()(),
        hx(6, si, 4, 12)(7, li, 2, 0, `p`, 5)),
        t & 2 &&
          (vA(2),
          ag(`Running tasks `, i.spanLabel()),
          vA(2),
          ag(` `, i.stats().runningTasks, ` `),
          vA(),
          px(i.stats().maxContainers > 0 ? 5 : -1),
          vA(),
          px(i.points().length >= 2 ? 6 : 7)));
    },
    dependencies: [he, F, xt],
    styles: [
      `[_nghost-%COMP%]{display:block;border-radius:var(--%NS%tui-radius-l);background:var(--%NS%tui-background-base);padding:.875rem 1rem .75rem}.trend__head[_ngcontent-%COMP%]{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;margin-block-end:.5rem}.trend__label[_ngcontent-%COMP%]{font-size:.8125rem;color:var(--%NS%tui-text-secondary)}.trend__value[_ngcontent-%COMP%]{font-size:1.375rem;font-weight:600;color:var(--%NS%tui-text-primary)}.trend__note[_ngcontent-%COMP%]{font-size:.8125rem;font-weight:400;color:var(--%NS%tui-text-tertiary)}.trend__axes[_ngcontent-%COMP%]{block-size:6.5rem;font-size:.6875rem;color:var(--%NS%tui-text-tertiary)}.trend__axes[_ngcontent-%COMP%]   tui-line-chart[_ngcontent-%COMP%]{color:var(--%NS%tui-background-accent-1)}.trend__collecting[_ngcontent-%COMP%]{margin:0;padding-block:1.5rem;font-size:.875rem;color:var(--%NS%tui-text-tertiary);text-align:center}`,
    ],
  });
};
var di = [`*`];
var at = class e {
  icon = tr(`@tui.boxes`);
  title = tr.required();
  description = tr.required();
  bordered = tr(!0);
  static ɵfac = function (t) {
    return new (t || e)();
  };
  static ɵcmp = Vi({
    type: e,
    selectors: [[`app-empty-state`]],
    inputs: {
      icon: [1, `icon`],
      title: [1, `title`],
      description: [1, `description`],
      bordered: [1, `bordered`],
    },
    ngContentSelectors: di,
    decls: 9,
    vars: 5,
    consts: [
      [1, `state`],
      [`aria-hidden`, `true`, 1, `state__icon`],
      [1, `icon-lg`, 3, `icon`],
      [1, `state__title`],
      [1, `state__description`],
      [1, `state__actions`, `empty:hidden`],
    ],
    template: function (t, i) {
      (t & 1 &&
        (xx(),
        pl(0, `div`, 0)(1, `span`, 1),
        Rl(2, `tui-icon`, 2),
        eg(),
        pl(3, `h2`, 3),
        sR(4),
        eg(),
        pl(5, `p`, 4),
        sR(6),
        eg(),
        pl(7, `div`, 5),
        Rx(8),
        eg()()),
        t & 2 &&
          (sg(`state--bare`, !i.bordered()),
          vA(2),
          VE(`icon`, i.icon()),
          vA(2),
          aC(i.title()),
          vA(2),
          aC(i.description())));
    },
    dependencies: [EJ],
    styles: [
      `.state[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;gap:.5rem;padding:3rem 1.5rem;border:1px dashed var(--%NS%app-border-strong);border-radius:var(--%NS%tui-radius-l);background:var(--%NS%tui-background-base);text-align:center}.state--bare[_ngcontent-%COMP%]{border:0;border-radius:0;background:transparent}.state__icon[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;inline-size:2.75rem;block-size:2.75rem;margin-block-end:.25rem;border-radius:var(--%NS%tui-radius-m);background:var(--%NS%tui-background-neutral-1);color:var(--%NS%tui-text-tertiary)}.state__title[_ngcontent-%COMP%]{margin:0;font-size:1.0625rem;font-weight:600;color:var(--%NS%tui-text-primary)}.state__description[_ngcontent-%COMP%]{max-inline-size:26rem;margin:0;font-size:.9375rem;line-height:1.5;color:var(--%NS%tui-text-secondary)}.state__actions[_ngcontent-%COMP%]{display:flex;gap:.5rem;margin-block-start:.5rem}`,
    ],
  });
};
function ci(e, n) {
  e & 1 && Rl(0, `a`, 3);
}
function mi(e, n) {
  e & 1 && (pl(0, `a`, 4), Rl(1, `tui-icon`, 8), sR(2, ` New task `), eg());
}
function pi(e, n) {
  e & 1 && Rl(0, `app-dashboard-skeleton`);
}
function ui(e, n) {
  if (e & 1) {
    let t = Ix();
    (pl(0, `app-error-state`, 9),
      zo(`retry`, function () {
        By(t);
        return Hy(Ax().dashboard.load());
      }),
      eg());
  }
  if (e & 2) VE(`message`, Ax().dashboard.error());
}
function _i(e, n) {
  if ((e & 1 && Rl(0, `app-stats-trend`, 15)(1, `app-stat-tiles`, 16), e & 2)) {
    let t = n,
      i = Ax(2);
    (VE(`stats`, t)(`samples`, i.history.samples()), vA(), VE(`stats`, t));
  }
}
function hi(e, n) {
  if ((e & 1 && (pl(0, `app-callout`, 10), sR(1), eg()), e & 2)) {
    let t = Ax(2);
    (vA(), ag(` `, t.dashboard.error(), ` Existing data is still shown. `));
  }
}
function gi(e, n) {
  (e & 1 && Rl(0, `app-empty-state`, 12), e & 2 && VE(`bordered`, !1));
}
function fi(e, n) {
  if (e & 1) {
    let t = Ix();
    (pl(0, `app-task-list`, 17),
      zo(`actionRequested`, function (a) {
        By(t);
        return Hy(Ax(2).handleAction(a));
      })(`taskOpened`, function (a) {
        By(t);
        return Hy(Ax(2).openTask(a));
      }),
      eg());
  }
  if (e & 2) {
    let t = Ax(2);
    VE(`tasks`, t.dashboard.tasks())(`pendingTaskIds`, t.commands.pendingTaskIds())(
      `mobile`,
      t.mobile(),
    )(`accessUrlFor`, t.commands.accessUrl);
  }
}
function xi(e, n) {
  if (
    (e & 1 &&
      (pl(0, `div`, 7),
      hx(1, _i, 2, 3),
      hx(2, hi, 2, 1, `app-callout`, 10),
      pl(3, `app-inset-group`, 11),
      hx(4, gi, 1, 1, `app-empty-state`, 12)(5, fi, 1, 4, `app-task-list`, 13),
      pl(6, `a`, 14),
      Rl(7, `tui-icon`, 8),
      sR(8, ` New task `),
      eg()()()),
    e & 2)
  ) {
    let t,
      i = Ax();
    (vA(),
      px((t = i.dashboard.stats()) ? 1 : -1, t),
      vA(),
      px(i.dashboard.error() ? 2 : -1),
      vA(),
      VE(`trailing`, i.summary()),
      vA(),
      px(i.dashboard.tasks().length === 0 ? 4 : 5));
  }
}
var be = class e {
  dashboard = v(j$2);
  commands = v(Q);
  history = v(q);
  confirmations = v(te);
  toasts = v(Di);
  router = v(hs);
  breakpoint = v(GX);
  mobile = oe(() => this.breakpoint() === `mobile`);
  announcement = H(``);
  summary = oe(() => {
    let n = this.dashboard.tasks().length;
    return `${n} ${n === 1 ? `task` : `tasks`}`;
  });
  constructor() {
    j({ busy: this.dashboard.loading, trigger: () => this.dashboard.load() });
  }
  openTask(n) {
    this.router.navigate([`/tasks`, n.id]);
  }
  handleAction({ action: n, task: t }) {
    if (n === `delete`) {
      this.confirmations
        .confirm({
          title: `Delete ${t.id}?`,
          message: `The container, environment metadata, and proxy route will be deleted. This action cannot be undone.`,
          confirmLabel: `Delete task`,
          destructive: !0,
        })
        .pipe(
          et(Boolean),
          qe$1(() => this.commands.delete(t)),
        )
        .subscribe((i) => this.completeCommand(i));
      return;
    }
    this.commands.changeState(t, n).subscribe((i) => this.completeCommand(i));
  }
  completeCommand(n) {
    (this.announcement.set(n.message),
      this.toasts
        .open(n.message, { appearance: n.success ? `positive` : `negative` })
        .pipe(yt(1))
        .subscribe(),
      n.success && this.dashboard.load());
  }
  static ɵfac = function (t) {
    return new (t || e)();
  };
  static ɵcmp = Vi({
    type: e,
    selectors: [[`app-dashboard-page`]],
    features: [Na([j$2, Q])],
    decls: 11,
    vars: 3,
    consts: [
      [`appReveal`, ``, 1, `mx-auto`, `grid`, `w-full`, `max-w-[40rem]`, `grid-cols-1`, `gap-4`],
      [1, `flex`, `items-center`, `justify-between`, `gap-3`],
      [1, `page-title`],
      [
        `appGlassIconButton`,
        ``,
        `icon`,
        `@tui.plus`,
        `routerLink`,
        `/tasks/new`,
        `aria-label`,
        `New task`,
      ],
      [`tuiButton`, ``, `routerLink`, `/tasks/new`, `size`, `s`, `appearance`, `primary`],
      [`aria-live`, `polite`, 1, `sr-only`],
      [3, `message`],
      [1, `grid`, `grid-cols-1`, `gap-4`],
      [`icon`, `@tui.plus`, 1, `icon-sm`],
      [3, `retry`, `message`],
      [`tone`, `negative`, `role`, `alert`],
      [`label`, `Environments`, 3, `trailing`],
      [
        `title`,
        `No tasks yet`,
        `description`,
        `Create a task to start an isolated Docker environment behind the Boreas proxy.`,
        3,
        `bordered`,
      ],
      [3, `tasks`, `pendingTaskIds`, `mobile`, `accessUrlFor`],
      [`routerLink`, `/tasks/new`, 1, `add-row`, `row-divider`, `relative`],
      [3, `stats`, `samples`],
      [3, `stats`],
      [3, `actionRequested`, `taskOpened`, `tasks`, `pendingTaskIds`, `mobile`, `accessUrlFor`],
    ],
    template: function (t, i) {
      (t & 1 &&
        (pl(0, `div`, 0)(1, `header`, 1)(2, `h1`, 2),
        sR(3, `Tasks`),
        eg(),
        hx(4, ci, 1, 0, `a`, 3)(5, mi, 3, 0, `a`, 4),
        eg(),
        pl(6, `p`, 5),
        sR(7),
        eg(),
        hx(8, pi, 1, 0, `app-dashboard-skeleton`)(9, ui, 1, 1, `app-error-state`, 6)(
          10,
          xi,
          9,
          4,
          `div`,
          7,
        ),
        eg()),
        t & 2 &&
          (vA(4),
          px(i.mobile() ? 4 : 5),
          vA(3),
          aC(i.announcement()),
          vA(),
          px(
            i.dashboard.loading() && !i.dashboard.hasLoaded()
              ? 8
              : i.dashboard.error() && !i.dashboard.hasLoaded()
                ? 9
                : 10,
          )));
    },
    dependencies: [W$1, H$1, at, y, Ut, b, v$1, PI, W, G, $, It, EJ],
    styles: [
      `.page-title[_ngcontent-%COMP%]{margin:0;font-size:2.125rem;font-weight:700;line-height:1.2;letter-spacing:-.022em;color:var(--%NS%tui-text-primary)}.add-row[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.5rem;padding:.6875rem 1rem;font-size:1.0625rem;font-weight:500;color:var(--%NS%tui-text-action);text-decoration:none;transition:background-color var(--%NS%tui-duration)}.add-row[_ngcontent-%COMP%]:hover{background:var(--%NS%tui-background-neutral-1)}`,
    ],
  });
};
export { be as DashboardPage };
