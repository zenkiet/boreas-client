import {
  $r as px,
  $t as Y,
  Bn as eg,
  Ci as ue,
  Dt as Rl,
  Ei as vA,
  Fr as mn,
  Ft as Se,
  Gn as fX,
  Gr as on$1,
  H as Ir,
  It as T1,
  Jn as ft,
  Kn as fc,
  Kr as ot,
  Kt as Vi,
  L as Hy,
  Mn as dT,
  Mt as SM,
  Nn as dX,
  Pt as SX,
  Q as LD,
  Qr as pl,
  Qt as Xn,
  Rt as Ta,
  Si as ub,
  Sr as kr,
  T as FK,
  Ti as v,
  U as Ix,
  Ur as oe,
  Vn as et,
  Wi as xx,
  Wt as VE,
  Yi as ya,
  Zr as pi$1,
  _r as ji,
  ai as qe$1,
  b as EJ,
  br as k,
  ca as zv,
  cr as iJ,
  d as BE,
  di as sR,
  dt as Na,
  ei as q,
  er as hQ,
  fi as sg,
  ft as Nw,
  ir as hb,
  j as H,
  jt as Rx,
  l as Ax,
  la as l$1,
  lt as NM,
  m as By,
  mn as _r,
  nr as hT,
  or as hx,
  p as Bi,
  qi as yT,
  qn as ff,
  ra as z,
  ri as qQ,
  rr as hX,
  rt as M9,
  sa as zo,
  sn as ZQ,
  t as $Q,
  ua as m,
  ui as sQ,
  un as Zv,
  ur as ie,
  ut as NX,
  vr as jn,
  w as FE,
  wt as Qv,
  y as E,
  yi as tr,
  yt as PK,
} from './chunk-CD8PwEax.js';
import { d as Z, i as It, m as dt$1, p as bt, r as H$1, t as C } from './chunk-bRWS10C8.js';
import {
  E as oe$1,
  T as ei$1,
  b as Yn,
  j as vr,
  m as En,
  p as Ei,
  v as Ss,
  x as Yt,
} from './main-YU6HVKXZ.js';
import {
  C as tt,
  S as ti$1,
  d as O,
  f as Pn,
  g as Zt,
  h as Ye,
  i as Hi,
  m as Xe$1,
  n as Bn,
  o as It$1,
  p as R,
  s as Je$1,
  t as $t,
  u as N,
  v as ei$2,
  y as ii$1,
} from './chunk-C4cee0NY.js';
function F(t) {
  return t.status === `creating` || t.status === `starting`;
}
function je({ currentTarget: t, relatedTarget: n }) {
  return !$Q(n) || !$Q(t) || !t.contains(n);
}
var V = (() => {
  class t extends k {
    constructor() {
      (super((e) => this.stream$.subscribe(e)),
        (this.el = qQ()),
        (this.zone = v(Se)),
        (this.stream$ = ff(
          T1(this.el, `mouseenter`).pipe(Y(hX)),
          T1(this.el, `mouseleave`).pipe(Y(fX)),
          T1(this.el, `mouseout`).pipe(et(je), Y(fX)),
        ).pipe(zv(), NX(this.zone))));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac });
    }
  }
  return t;
})();
function Xe(t, n) {
  t & 1 && BE(0);
}
var Ge = [`*`];
function We(t, n) {
  if ((t & 1 && Rl(0, `span`, 1), t & 2)) {
    let e = n.polymorpheusOutlet;
    VE(`innerHTML`, e, SM);
  }
}
var Ze = new E(``, { factory: () => ii }),
  Ke = (() => {
    class t extends ei$2 {
      constructor() {
        (super(...arguments), (this.type = `hint`));
      }
      static {
        this.ɵfac = (() => {
          let e;
          return function (o) {
            return (e || (e = ya(t)))(o || t);
          };
        })();
      }
      static {
        this.ɵdir = ot({ type: t, features: [ji] });
      }
    }
    return t;
  })(),
  Fe = [
    `bottom-start`,
    `bottom`,
    `bottom-end`,
    `top-start`,
    `top`,
    `top-end`,
    `start-top`,
    `start`,
    `start-bottom`,
    `end-top`,
    `end`,
    `end-bottom`,
  ],
  [Nt, nn] = hb({
    direction: `bottom-start`,
    centered: !0,
    showDelay: 500,
    hideDelay: 200,
    appearance: ``,
    icon: `@tui.circle-help`,
  }),
  Qe = 100,
  Pt = (() => {
    class t extends tt {
      constructor() {
        (super((e) => this.stream$.subscribe(e)),
          (this.isMobile = v(Ei)),
          (this.el = qQ()),
          (this.hovered$ = v(V)),
          (this.options = v(Nt)),
          (this.visible = !1),
          (this.toggle$ = new ue()),
          (this.stream$ = ff(
            this.toggle$.pipe(
              qe$1((e) =>
                this.isMobile ? z(e).pipe(hT(e ? 0 : Qe)) : z(e).pipe(hT(e ? 0 : this.hideDelay())),
              ),
              on$1(this.hovered$),
              Zv(),
            ),
            this.hovered$.pipe(
              qe$1((e) =>
                this.isMobile
                  ? z(e).pipe(hT(0))
                  : z(e).pipe(hT(e ? this.showDelay() : this.hideDelay())),
              ),
              on$1(this.toggle$),
              Zv(),
            ),
          ).pipe(
            et(() => this.enabled),
            Y((e) => e && (this.el.hasAttribute(`tuiHintPointer`) || !Ss(this.el))),
            ft((e) => {
              this.visible = e;
            }),
          )),
          (this.parent = v(t, { optional: !0, skipSelf: !0 })),
          (this.showDelay = tr(this.options.showDelay, { alias: `tuiHintShowDelay` })),
          (this.hideDelay = tr(this.options.hideDelay, { alias: `tuiHintHideDelay` })),
          (this.type = `hint`),
          (this.enabled = !0));
      }
      toggle(e = !this.visible) {
        (this.toggle$.next(e), this.parent?.toggle(e));
      }
      close() {
        this.toggle$.next(!1);
      }
      onClick() {
        this.isMobile && this.toggle();
      }
      static {
        this.ɵfac = function (i) {
          return new (i || t)();
        };
      }
      static {
        this.ɵdir = ot({
          type: t,
          hostBindings: function (i, o) {
            i & 1 &&
              zo(`click`, function () {
                return o.onClick();
              });
          },
          inputs: {
            showDelay: [1, `tuiHintShowDelay`, `showDelay`],
            hideDelay: [1, `tuiHintHideDelay`, `hideDelay`],
          },
          exportAs: [`tuiHintHover`],
          features: [Na([Zt(t), V]), ji],
        });
      }
    }
    return t;
  })(),
  pt = 8,
  B = 22,
  l = 1,
  p = 0,
  qe = (() => {
    class t extends R {
      constructor() {
        (super(...arguments),
          (this.el = qQ()),
          (this.viewport = v(iJ)),
          (this.options = v(Nt)),
          (this.directionChange = new ue()),
          (this.accessor = It$1(`hint`)(v(O, { optional: !0 }), {
            getClientRect: () => this.el.getBoundingClientRect(),
          })),
          (this.points = Fe.reduce((e, i) => m(l$1({}, e), { [i]: [0, 0] }), {})),
          (this.direction = tr(this.options.direction, { alias: `tuiHintDirection` })),
          (this.offset = tr(v(Ei) ? 16 : 8, { alias: `tuiHintOffset` })),
          (this.centered = tr(this.options.centered, { alias: `tuiHintCentered` })),
          (this.tuiHintDirectionChange = PK(this.directionChange.pipe(zv()))),
          (this.type = `hint`));
      }
      getPosition({ width: e, height: i }) {
        let o = this.direction(),
          s = this.accessor.getClientRect(),
          a = s.left + s.width / 2,
          M = s.top + s.height / 2,
          S = this.el.matches(`[dir="rtl"] :scope`),
          G = s.width < B * 2 || this.centered(),
          W = s.height < B * 2 || this.centered(),
          Z = G ? a - B : s.left,
          K = G ? a - e + B : s.right - e,
          Y = W ? M - B : s.top,
          Q = W ? M - i + B : s.bottom - i;
        ((this.points[`top-start`][l] = s.top - i - this.offset()),
          (this.points[`top-start`][p] = this.centered() ? K : Z),
          (this.points.top[l] = this.points[`top-start`][l]),
          (this.points.top[p] = a - e / 2),
          (this.points[`top-end`][l] = this.points[`top-start`][l]),
          (this.points[`top-end`][p] = this.centered() ? Z : K),
          (this.points[`bottom-start`][l] = s.bottom + this.offset()),
          (this.points[`bottom-start`][p] = this.points[`top-start`][p]),
          (this.points.bottom[l] = this.points[`bottom-start`][l]),
          (this.points.bottom[p] = this.points.top[p]),
          (this.points[`bottom-end`][l] = this.points[`bottom-start`][l]),
          (this.points[`bottom-end`][p] = this.points[`top-end`][p]),
          (this.points[`start-top`][l] = this.centered() ? Q : Y),
          (this.points[`start-top`][p] = s.left - e - this.offset()),
          (this.points.start[l] = M - i / 2),
          (this.points.start[p] = this.points[`start-top`][p]),
          (this.points[`start-bottom`][l] = this.centered() ? Q : Y),
          (this.points[`start-bottom`][p] = this.points[`start-top`][p]),
          (this.points[`end-top`][l] = this.points[`start-top`][l]),
          (this.points[`end-top`][p] = s.right + this.offset()),
          (this.points.end[l] = this.points.start[l]),
          (this.points.end[p] = this.points[`end-top`][p]),
          (this.points[`end-bottom`][l] = this.points[`start-bottom`][l]),
          (this.points[`end-bottom`][p] = this.points[`end-top`][p]));
        let Lt =
          (Array.isArray(o) ? o : [o])
            .map((ht) => Be(ht, S))
            .concat(Fe)
            .find((ht) => this.checkPosition(this.points[ht], e, i)) || this.fallback;
        return (this.directionChange.next(Be(Lt, S)), this.points[Lt]);
      }
      get fallback() {
        return this.points.top[l] > this.viewport.getClientRect().bottom - this.points.bottom[l]
          ? `top`
          : `bottom`;
      }
      checkPosition([e, i], o, s) {
        let a = this.viewport.getClientRect();
        return i > a.top + pt && e > a.left + pt && i + s < a.bottom - pt && e + o < a.right - pt;
      }
      static {
        this.ɵfac = (() => {
          let e;
          return function (o) {
            return (e || (e = ya(t)))(o || t);
          };
        })();
      }
      static {
        this.ɵdir = ot({
          type: t,
          inputs: {
            direction: [1, `tuiHintDirection`, `direction`],
            offset: [1, `tuiHintOffset`, `offset`],
            centered: [1, `tuiHintCentered`, `centered`],
          },
          outputs: { tuiHintDirectionChange: `tuiHintDirectionChange` },
          features: [ji],
        });
      }
    }
    return t;
  })();
function Be(t, n) {
  return n && t.includes(`left`)
    ? t.replace(`left`, `right`)
    : n && t.includes(`right`)
      ? t.replace(`right`, `left`)
      : t;
}
var j = (() => {
  class t {
    constructor() {
      ((this.service = v(En)),
        (this.ref = H(null)),
        (this.content = tr(null, { alias: `tuiHint` })),
        (this.context = tr(void 0, { alias: `tuiHintContext` })),
        (this.appearance = tr(v(Nt).appearance, { alias: `tuiHintAppearance` })),
        (this.visible = PK(FK(this.ref).pipe(Y(Boolean), yT(1)), { alias: `tuiHintVisible` })),
        (this.component = v(oe$1)),
        (this.el = qQ()),
        (this.type = `hint`));
    }
    ngOnChanges() {
      this.content() || this.toggle(!1);
    }
    ngOnDestroy() {
      this.toggle(!1);
    }
    getClientRect() {
      return this.el.getBoundingClientRect();
    }
    toggle(e) {
      e && this.content() && !this.ref()
        ? this.ref.set(this.service.add(this.component))
        : e || (this.ref()?.destroy(), this.ref.set(null));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        selectors: [[``, `tuiHint`, ``, 5, `ng-container`, 5, `ng-template`]],
        inputs: {
          content: [1, `tuiHint`, `content`],
          context: [1, `tuiHintContext`, `context`],
          appearance: [1, `tuiHintAppearance`, `appearance`],
        },
        outputs: { visible: `tuiHintVisible` },
        features: [
          Na([ti$1(t), { provide: oe$1, deps: [Ze, pi$1], useClass: oe$1 }]),
          Ta([
            Ke,
            {
              directive: Pt,
              inputs: [
                `tuiHintHideDelay`,
                `tuiHintHideDelay`,
                `tuiHintShowDelay`,
                `tuiHintShowDelay`,
              ],
            },
            {
              directive: qe,
              inputs: [
                `tuiHintDirection`,
                `tuiHintDirection`,
                `tuiHintCentered`,
                `tuiHintCentered`,
                `tuiHintOffset`,
                `tuiHintOffset`,
              ],
              outputs: [`tuiHintDirectionChange`, `tuiHintDirectionChange`],
            },
          ]),
          Xn,
        ],
      });
    }
  }
  return t;
})();
var Je = (() => {
  class t extends Pt {
    constructor() {
      (super(...arguments), (this.currentRect = dX));
    }
    getClientRect() {
      return this.currentRect;
    }
    onMove({ clientX: e, clientY: i }) {
      this.currentRect = ZQ(e, i);
    }
    static {
      this.ɵfac = (() => {
        let e;
        return function (o) {
          return (e || (e = ya(t)))(o || t);
        };
      })();
    }
    static {
      this.ɵdir = ot({
        type: t,
        selectors: [[``, `tuiHint`, ``, `tuiHintPointer`, ``]],
        hostBindings: function (i, o) {
          i & 1 &&
            zo(`mousemove.zoneless`, function (a) {
              return o.onMove(a);
            });
        },
        features: [Na([Je$1(t), Zt(t)]), ji],
      });
    }
  }
  return t;
})();
var ti = (() => {
  class t {
    constructor() {
      this.hint = v(j);
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [[`ng-component`]],
        decls: 1,
        vars: 1,
        consts: [[4, `polymorpheusOutlet`]],
        template: function (i, o) {
          (i & 1 && FE(0, Xe, 1, 0, `ng-container`, 0),
            i & 2 && VE(`polymorpheusOutlet`, o.hint.content()));
        },
        dependencies: [Yt],
        encapsulation: 2,
      });
    }
  }
  return t;
})();
function ei() {
  return [
    $t,
    V,
    Ye(`hint`, qe),
    Xe$1(
      `hint`,
      Ir(() => j),
    ),
  ];
}
var dt = 8;
var mt = 22;
var ii = (() => {
  class t {
    constructor() {
      ((this.el = qQ()),
        (this.hover = v(Pt)),
        (this.vvs = v(ii$1)),
        (this.viewport = v(iJ)),
        (this.pointer = v(Je, { optional: !0 })),
        (this.accessor = v(O)),
        (this.hint = v(j)),
        (this.content = this.hint.component.component === ti ? H(``) : this.hint.content),
        (this.theme = this.hint.el.closest(`[tuiTheme]`)?.getAttribute(`tuiTheme`)),
        (this.appearance = dt$1(this.hint.appearance)),
        v($t)
          .pipe(
            Qv(() => this.hint.el.isConnected && this.hint.el.getClientRects().length > 0),
            Y((e) => this.vvs.correct(e)),
            fc(),
          )
          .subscribe({ next: (e) => this.update(...e), complete: () => this.hint.toggle(!1) }),
        v(V)
          .pipe(fc())
          .subscribe((e) => this.hover.toggle(e)));
    }
    onPointerDown(e) {
      ((!e.closest(this.el.tagName) && !this.hint.el.contains(e)) || Ss(this.hint.el)) &&
        this.hover.toggle(!1);
    }
    apply(e, i, o, s) {
      (this.el.style.setProperty(`top`, e),
        this.el.style.setProperty(`left`, i),
        this.el.style.setProperty(`--t-top`, `${o}%`),
        this.el.style.setProperty(`--t-left`, `${s}%`),
        this.el.style.setProperty(`--t-rotate`, !s || Math.ceil(s) === 100 ? `90deg` : `0deg`));
    }
    update(e, i) {
      let { clientHeight: o, clientWidth: s } = this.el,
        a = this.accessor.getClientRect();
      if (a === dX || !o || !s) return;
      let M = this.viewport.getClientRect(),
        S = sQ(Math.max(dt, e), M.left + dt, Math.max(dt, M.width + M.left - s - dt)),
        G = Math.round(S) === Math.round(a.left),
        W = Math.round(i) === Math.round(a.top),
        Z = Math.round(S + s) === Math.round(a.right),
        K = Math.round(i + o) === Math.round(a.bottom),
        [Y, Q] = this.vvs.correct([a.left + a.width / 2 - S, a.top + a.height / 2 - i]),
        zt = G ? mt : Z ? s - mt : Y,
        $t = W ? mt : K ? o - mt : Q;
      this.apply(
        hQ(Math.round(i)),
        hQ(Math.round(S)),
        Math.round((sQ($t, 0, o) / o) * 100),
        Math.round((sQ(zt, 0, s) / s) * 100),
      );
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [[`tui-hint`]],
        hostAttrs: [`role`, `tooltip`],
        hostVars: 3,
        hostBindings: function (i, o) {
          (i & 1 &&
            zo(
              `pointerdown`,
              function (a) {
                return o.onPointerDown(a.target);
              },
              NM,
            ),
            i & 2 && (kr(`tuiTheme`, o.theme), sg(`_untouchable`, o.pointer)));
        },
        features: [Na([ei(), bt({ size: `s` })]), Ta([C, ei$1, vr])],
        ngContentSelectors: Ge,
        decls: 2,
        vars: 2,
        consts: [
          [3, `innerHTML`, 4, `polymorpheusOutlet`, `polymorpheusOutletContext`],
          [3, `innerHTML`],
        ],
        template: function (i, o) {
          (i & 1 && (xx(), Rx(0), FE(1, We, 1, 1, `span`, 0)),
            i & 2 &&
              (vA(),
              VE(`polymorpheusOutlet`, o.content())(
                `polymorpheusOutletContext`,
                o.hint.context(),
              )));
        },
        dependencies: [Yt],
        styles: [
          `[_nghost-%COMP%]{position:absolute;max-inline-size:min(20rem,calc(100% - 1rem));padding:.75rem 1rem;background:var(--%NS%tui-background-accent-1);border-radius:var(--%NS%tui-radius-l);color:var(--%NS%tui-text-primary-on-accent-1);box-sizing:border-box;font:var(--%NS%tui-typography-body-s);white-space:pre-line;overflow-wrap:break-word;transform-origin:var(--%NS%t-left) var(--%NS%t-top);--%NS%tui-background-elevation-2: var(--%NS%tui-background-elevation-3);--%NS%tui-scale: .5}.tui-enter[_nghost-%COMP%]{animation:tuiFade var(--%NS%tui-duration) var(--%NS%tui-curve-expressive-standard),tuiScale var(--%NS%tui-duration) var(--%NS%tui-curve-expressive-standard) 10ms}.tui-leave[_nghost-%COMP%]{animation:tuiFade calc(var(--%NS%tui-duration) / 2) var(--%NS%tui-curve-expressive-standard) reverse,tuiScale calc(var(--%NS%tui-duration) / 2) var(--%NS%tui-curve-expressive-standard) reverse}[_nghost-%COMP%]:before{content:"";position:absolute;inset-block-start:var(--%NS%t-top);inset-inline-start:var(--%NS%t-left);inline-size:.75rem;block-size:.5rem;background:inherit;-webkit-mask-image:url('data:image/svg+xml,<svg viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg"><path d="M3.61336 1.69607L2.44882 2.96493C1.84795 3.61964 0.949361 3.99951 0.00053941 4C0.000359608 4 0.000179805 4 0 4C0.000179863 4 0.000359764 4 0.000539623 4C0.949362 4.00049 1.84795 4.38036 2.44882 5.03506L3.61336 6.30394C4.55981 7.33517 5.03303 7.85079 5.63254 7.96535C5.87433 8.01155 6.12436 8.01155 6.36616 7.96535C6.96567 7.85079 7.43889 7.33517 8.38534 6.30393L9.54988 5.03507C10.1511 4.37994 11.0505 4 12 4C11.0505 4 10.1511 3.62006 9.54988 2.96493L8.38534 1.69606C7.43889 0.664826 6.96567 0.149207 6.36616 0.0346517C6.12436 -0.0115506 5.87433 -0.0115506 5.63254 0.0346517C5.03303 0.149207 4.55981 0.664827 3.61336 1.69607Z" /></svg>');mask-image:url('data:image/svg+xml,<svg viewBox="0 0 12 8" xmlns="http://www.w3.org/2000/svg"><path d="M3.61336 1.69607L2.44882 2.96493C1.84795 3.61964 0.949361 3.99951 0.00053941 4C0.000359608 4 0.000179805 4 0 4C0.000179863 4 0.000359764 4 0.000539623 4C0.949362 4.00049 1.84795 4.38036 2.44882 5.03506L3.61336 6.30394C4.55981 7.33517 5.03303 7.85079 5.63254 7.96535C5.87433 8.01155 6.12436 8.01155 6.36616 7.96535C6.96567 7.85079 7.43889 7.33517 8.38534 6.30393L9.54988 5.03507C10.1511 4.37994 11.0505 4 12 4C11.0505 4 10.1511 3.62006 9.54988 2.96493L8.38534 1.69606C7.43889 0.664826 6.96567 0.149207 6.36616 0.0346517C6.12436 -0.0115506 5.87433 -0.0115506 5.63254 0.0346517C5.03303 0.149207 4.55981 0.664827 3.61336 1.69607Z" /></svg>');transition:none;transform:translate(-50%,-50%) rotate(var(--%NS%t-rotate))}[_nghost-%COMP%]:not([style*=top]){visibility:hidden}._untouchable[_nghost-%COMP%]{pointer-events:none}[_nghost-%COMP%]     [tuiTitle]{margin-block-end:.75rem}[_nghost-%COMP%]     [tuiTitle]+footer{margin-block-start:.75rem}[_nghost-%COMP%]     [tuiIconButton][data-appearance=icon][data-size=xs]{float:right;margin-inline-end:-.25rem}@supports (float: inline-end){[_nghost-%COMP%]     [tuiIconButton][data-appearance=icon][data-size=xs]{float:inline-end}}[_nghost-%COMP%]     img{display:block;border-radius:var(--%NS%tui-radius-m)}[_nghost-%COMP%]     footer{display:flex;justify-content:flex-end;gap:.5rem;inline-size:18rem;max-inline-size:100%;margin:1rem 0 .25rem}`,
        ],
      });
    }
  }
  return t;
})();
var on = (() => {
  class t extends tt {
    constructor() {
      (super((e) => this.stream$.subscribe(e)),
        (this.doc = v(ie)),
        (this.el = qQ()),
        (this.element = oe((e = this.id()) =>
          e ? this.doc.querySelector(`#${e}`) || this.el : this.el,
        )),
        (this.id = tr(``, { alias: `tuiHintDescribe` })),
        (this.type = `hint`),
        (this.stream$ = FK(this.id).pipe(
          zv(),
          SX(() => mn(this.doc, `keydown`, { capture: !0 }), ub),
          qe$1(() =>
            this.focused
              ? z(!1)
              : ff(T1(this.doc, `keyup`), T1(this.element(), `blur`)).pipe(Y(() => this.focused)),
          ),
          dT((e) => (e ? jn(1e3) : z(null))),
          _r(!1),
          zv(),
          yT(1),
          NX(),
        )));
    }
    get focused() {
      return Z(this.element());
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        selectors: [[``, `tuiHintDescribe`, ``]],
        inputs: { id: [1, `tuiHintDescribe`, `id`] },
        features: [Na([Zt(t)]), ji],
      });
    }
  }
  return t;
})();
var sn = (() => {
  class t extends O {
    constructor() {
      (super(...arguments), (this.tuiHintHost = tr()), (this.type = `hint`));
    }
    getClientRect() {
      return this.tuiHintHost()?.getBoundingClientRect() || dX;
    }
    static {
      this.ɵfac = (() => {
        let e;
        return function (o) {
          return (e || (e = ya(t)))(o || t);
        };
      })();
    }
    static {
      this.ɵdir = ot({
        type: t,
        selectors: [[``, `tuiHint`, ``, `tuiHintHost`, ``]],
        inputs: { tuiHintHost: [1, `tuiHintHost`] },
        features: [Na([Je$1(t)]), ji],
      });
    }
  }
  return t;
})();
var Ut = class t {
  icon = tr.required();
  tone = tr(`accent`);
  static ɵfac = function (e) {
    return new (e || t)();
  };
  static ɵcmp = Vi({
    type: t,
    selectors: [
      [`a`, `appGlassIconButton`, ``],
      [`button`, `appGlassIconButton`, ``],
    ],
    hostVars: 1,
    hostBindings: function (e, i) {
      e & 2 && kr(`data-tone`, i.tone());
    },
    inputs: { icon: [1, `icon`], tone: [1, `tone`] },
    decls: 1,
    vars: 1,
    consts: [[3, `icon`]],
    template: function (e, i) {
      (e & 1 && Rl(0, `tui-icon`, 0), e & 2 && VE(`icon`, i.icon()));
    },
    dependencies: [EJ],
    styles: [
      `[_nghost-%COMP%]{position:relative;display:inline-flex;align-items:center;justify-content:center;inline-size:2.75rem;block-size:2.75rem;margin:0;border:0;border-radius:999px;padding:0;background:var(--%NS%app-chrome-bg);-webkit-backdrop-filter:var(--%NS%app-chrome-filter);backdrop-filter:var(--%NS%app-chrome-filter);box-shadow:0 .5rem 2rem #00000017,inset 0 0 .75rem var(--%NS%app-chrome-glow);color:var(--%NS%tui-text-action);text-decoration:none;cursor:pointer;transition:transform var(--%NS%tui-duration) var(--%NS%tui-curve-expressive-entrance),filter calc(var(--%NS%tui-duration) / 2) ease}[_nghost-%COMP%]:active{transform:scale(1.25);filter:brightness(3)}[_nghost-%COMP%]:disabled{opacity:.4;pointer-events:none}[_nghost-%COMP%]:after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:var(--%NS%app-chrome-bevel);pointer-events:none;-webkit-mask-image:linear-gradient(#000 0 0),linear-gradient(#000 0 0);mask-image:linear-gradient(#000 0 0),linear-gradient(#000 0 0);-webkit-mask-origin:content-box,border-box;mask-origin:content-box,border-box;-webkit-mask-clip:content-box,border-box;mask-clip:content-box,border-box;-webkit-mask-composite:xor;mask-composite:exclude}@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))){[_nghost-%COMP%]{background:var(--%NS%tui-background-elevation-3)}}[data-tone="negative"][_nghost-%COMP%]{background:var(--%NS%tui-status-negative-pale);color:var(--%NS%tui-text-negative)}[tuiAppBarButton][_nghost-%COMP%], [tuiAppBarButton]   [_nghost-%COMP%]{background:none;-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:none}[tuiAppBarButton][_nghost-%COMP%]:after, [tuiAppBarButton]   [_nghost-%COMP%]:after{content:none}[tuiAppBarButton][_nghost-%COMP%]:active, [tuiAppBarButton]   [_nghost-%COMP%]:active{transform:none;filter:none}`,
    ],
  });
};
function oi(t, n) {
  if (t & 1) {
    let e = Ix();
    (pl(0, `a`, 4),
      sR(1, ` Open task `),
      eg(),
      pl(2, `button`, 5),
      zo(`click`, function () {
        By(e);
        return Hy(Ax().emit(`stop`));
      }),
      sR(3, ` Stop `),
      eg());
  }
  if (t & 2) {
    let e = Ax();
    (VE(`href`, e.accessUrl(), LD), vA(2), VE(`disabled`, e.disabled()));
  }
}
function si(t, n) {
  if (t & 1) {
    let e = Ix();
    (pl(0, `button`, 6),
      zo(`click`, function () {
        By(e);
        return Hy(Ax().emit(`start`));
      }),
      sR(1, ` Start `),
      eg());
  }
  if (t & 2) VE(`disabled`, Ax().disabled());
}
var Ft = class t {
  dropdown = v(N, { optional: !0 });
  task = tr.required();
  accessUrl = tr.required();
  pending = tr.required();
  actionRequested = M9();
  disabled = oe(() => F(this.task()) || this.pending());
  emit(n) {
    (this.actionRequested.emit({ action: n, task: this.task() }), this.dropdown?.next(!1));
  }
  static ɵfac = function (e) {
    return new (e || t)();
  };
  static ɵcmp = Vi({
    type: t,
    selectors: [[`app-task-menu`]],
    inputs: { task: [1, `task`], accessUrl: [1, `accessUrl`], pending: [1, `pending`] },
    outputs: { actionRequested: `actionRequested` },
    decls: 9,
    vars: 5,
    consts: [
      [3, `label`],
      [`tuiOption`, ``, `type`, `button`, `iconEnd`, `@tui.play`, 3, `disabled`],
      [`tuiOption`, ``, `type`, `button`, `iconEnd`, `@tui.rotate-cw`, 3, `click`, `disabled`],
      [
        `tuiOption`,
        ``,
        `type`,
        `button`,
        `iconEnd`,
        `@tui.trash-2`,
        1,
        `menu__destructive`,
        3,
        `click`,
        `disabled`,
      ],
      [
        `tuiOption`,
        ``,
        `iconEnd`,
        `@tui.external-link`,
        `target`,
        `_blank`,
        `rel`,
        `noopener`,
        3,
        `href`,
      ],
      [`tuiOption`, ``, `type`, `button`, `iconEnd`, `@tui.square`, 3, `click`, `disabled`],
      [`tuiOption`, ``, `type`, `button`, `iconEnd`, `@tui.play`, 3, `click`, `disabled`],
    ],
    template: function (e, i) {
      (e & 1 &&
        (pl(0, `tui-data-list`)(1, `tui-opt-group`, 0),
        hx(2, oi, 4, 2)(3, si, 2, 1, `button`, 1),
        pl(4, `button`, 2),
        zo(`click`, function () {
          return i.emit(`restart`);
        }),
        sR(5, ` Restart `),
        eg()(),
        pl(6, `tui-opt-group`)(7, `button`, 3),
        zo(`click`, function () {
          return i.emit(`delete`);
        }),
        sR(8, ` Delete `),
        eg()()()),
        e & 2 &&
          (kr(`aria-label`, `Actions for ` + i.task().id),
          vA(),
          VE(`label`, i.task().id),
          vA(),
          px(i.task().status === `running` ? 2 : 3),
          vA(2),
          VE(`disabled`, i.disabled()),
          vA(3),
          VE(`disabled`, i.disabled())));
    },
    dependencies: [Hi, Bn, Pn],
    styles: [
      `tui-data-list[_ngcontent-%COMP%]{inline-size:14rem}[tuiOption][_ngcontent-%COMP%]{justify-content:space-between}.menu__destructive[_ngcontent-%COMP%]{color:var(--%NS%tui-status-negative)}`,
    ],
  });
};
function X(t) {
  return {
    id: t.id,
    image: t.image,
    status: t.status,
    port: t.port,
    containerId: t.container_id,
    containerIp: t.container_ip,
    createdAt: new Date(t.created_at),
    lastAccessed: ai(t.last_accessed),
    updatedAt: new Date(t.updated_at),
    labels: l$1({}, t.labels ?? {}),
    env: l$1({}, t.env ?? {}),
    cpuNano: t.cpu_nano,
    memoryBytes: t.memory_bytes,
    error: t.error,
    pendingRecreate: t.pending_recreate ?? !1,
  };
}
function $e(t) {
  let n = t.environment ?? {};
  return {
    id: t.id,
    image: t.image,
    port: t.port,
    env: Object.keys(n).length ? l$1({}, n) : void 0,
  };
}
var ri = !0;
function Le(t) {
  return { env: l$1({}, t.environment), auto_restart: ri };
}
function Ve(t) {
  return { message: t.message, status: t.status };
}
function ai(t) {
  if (!(!t || t.startsWith(`0001-01-01`))) return new Date(t);
}
var Bt = class t {
  http = v(Nw);
  config = v(H$1);
  get root() {
    return `${this.config.baseUrl()}/api/v1/tasks`;
  }
  taskUrl(n) {
    return `${this.root}/${encodeURIComponent(n)}`;
  }
  list() {
    return this.http.get(this.root).pipe(Y((n) => n.tasks.map(X)));
  }
  get(n) {
    return this.http.get(this.taskUrl(n)).pipe(Y((e) => X(e.task)));
  }
  create(n) {
    return this.http.post(this.root, $e(n)).pipe(Y((e) => X(e.task)));
  }
  changeState(n, e) {
    return this.http.put(`${this.taskUrl(n)}/state`, { action: e }).pipe(Y((i) => X(i.task)));
  }
  delete(n) {
    return this.http.delete(this.taskUrl(n)).pipe(Y((e) => e.message));
  }
  getEnvironment(n) {
    return this.http.get(`${this.taskUrl(n)}/env`).pipe(Y((e) => l$1({}, e.env)));
  }
  updateEnvironment(n, e) {
    return this.http.put(`${this.taskUrl(n)}/env`, Le(e)).pipe(Y(Ve));
  }
  accessUrl(n) {
    return `${this.config.baseUrl()}/${encodeURIComponent(n)}/`;
  }
  static ɵfac = function (e) {
    return new (e || t)();
  };
  static ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
};
function ci(t) {
  switch (t) {
    case `start`:
      return `started`;
    case `stop`:
      return `stopped`;
    case `restart`:
      return `restarted`;
  }
}
function ui(t, n) {
  (t & 1 && Rl(0, `tui-loader`, 9), t & 2 && VE(`inheritColor`, !0));
}
function li(t, n) {
  t & 1 && Rl(0, `tui-icon`, 10);
}
function pi(t, n) {
  if (t & 1) {
    let e = Ix();
    (pl(0, `a`, 6),
      Rl(1, `tui-icon`, 7),
      eg(),
      pl(2, `button`, 8),
      zo(`click`, function () {
        By(e);
        return Hy(Ax().emitAction(`stop`));
      }),
      hx(3, ui, 1, 1, `tui-loader`, 9)(4, li, 1, 0, `tui-icon`, 10),
      eg());
  }
  if (t & 2) {
    let e = Ax();
    (VE(`href`, e.accessUrl(), LD)(`tuiHint`, `Open task`),
      kr(`aria-label`, `Open ` + e.task().id),
      vA(2),
      VE(`disabled`, e.disabled())(`tuiHint`, e.disabledReason() || `Stop task`),
      kr(`aria-label`, `Stop ` + e.task().id),
      vA(),
      px(e.pending() ? 3 : 4));
  }
}
function di(t, n) {
  (t & 1 && Rl(0, `tui-loader`, 9), t & 2 && VE(`inheritColor`, !0));
}
function mi(t, n) {
  t & 1 && Rl(0, `tui-icon`, 11);
}
function hi(t, n) {
  if (t & 1) {
    let e = Ix();
    (pl(0, `button`, 8),
      zo(`click`, function () {
        By(e);
        return Hy(Ax().emitAction(`start`));
      }),
      hx(1, di, 1, 1, `tui-loader`, 9)(2, mi, 1, 0, `tui-icon`, 11),
      eg());
  }
  if (t & 2) {
    let e = Ax();
    (VE(`disabled`, e.disabled())(`tuiHint`, e.disabledReason() || `Start task`),
      kr(`aria-label`, `Start ` + e.task().id),
      vA(),
      px(e.pending() ? 1 : 2));
  }
}
var qt = class t {
  task = tr.required();
  accessUrl = tr.required();
  pending = tr.required();
  actionRequested = M9();
  disabled = oe(() => F(this.task()) || this.pending());
  disabledReason = oe(() =>
    F(this.task())
      ? `Task is ${this.task().status}. Actions are unavailable until the transition finishes.`
      : this.pending()
        ? `Another action is in progress for this task.`
        : ``,
  );
  emitAction(n) {
    this.actionRequested.emit({ action: n, task: this.task() });
  }
  static ɵfac = function (e) {
    return new (e || t)();
  };
  static ɵcmp = Vi({
    type: t,
    selectors: [[`app-task-actions`]],
    inputs: { task: [1, `task`], accessUrl: [1, `accessUrl`], pending: [1, `pending`] },
    outputs: { actionRequested: `actionRequested` },
    decls: 7,
    vars: 8,
    consts: [
      [1, `flex`, `items-center`, `justify-end`, `gap-0.5`],
      [
        `tuiIconButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `s`,
        `appearance`,
        `secondary`,
        3,
        `disabled`,
        `tuiHint`,
      ],
      [
        `tuiIconButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `s`,
        `appearance`,
        `flat-grayscale`,
        3,
        `click`,
        `disabled`,
        `tuiHint`,
      ],
      [`icon`, `@tui.rotate-cw`, 1, `icon-sm`],
      [
        `tuiIconButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `s`,
        `appearance`,
        `flat-destructive`,
        3,
        `click`,
        `disabled`,
        `tuiHint`,
      ],
      [`icon`, `@tui.trash-2`, 1, `icon-sm`],
      [
        `tuiIconButton`,
        ``,
        `size`,
        `s`,
        `appearance`,
        `flat-grayscale`,
        `target`,
        `_blank`,
        `rel`,
        `noopener`,
        3,
        `href`,
        `tuiHint`,
      ],
      [`icon`, `@tui.external-link`, 1, `icon-sm`],
      [
        `tuiIconButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `s`,
        `appearance`,
        `secondary`,
        3,
        `click`,
        `disabled`,
        `tuiHint`,
      ],
      [`size`, `s`, `aria-label`, `Task action in progress`, 3, `inheritColor`],
      [`icon`, `@tui.square`, 1, `icon-sm`],
      [`icon`, `@tui.play`, 1, `icon-sm`],
    ],
    template: function (e, i) {
      (e & 1 &&
        (pl(0, `div`, 0),
        hx(1, pi, 5, 7)(2, hi, 3, 4, `button`, 1),
        pl(3, `button`, 2),
        zo(`click`, function () {
          return i.emitAction(`restart`);
        }),
        Rl(4, `tui-icon`, 3),
        eg(),
        pl(5, `button`, 4),
        zo(`click`, function () {
          return i.emitAction(`delete`);
        }),
        Rl(6, `tui-icon`, 5),
        eg()()),
        e & 2 &&
          (kr(`aria-label`, `Actions for ` + i.task().id),
          vA(),
          px(i.task().status === `running` ? 1 : 2),
          vA(2),
          VE(`disabled`, i.disabled())(`tuiHint`, i.disabledReason() || `Restart task`),
          kr(`aria-label`, `Restart ` + i.task().id),
          vA(2),
          VE(`disabled`, i.disabled())(`tuiHint`, i.disabledReason() || `Delete task`),
          kr(`aria-label`, `Delete ` + i.task().id)));
    },
    dependencies: [It, j, EJ, Yn],
    encapsulation: 2,
  });
};
function no(t) {
  if (!(t instanceof Bi))
    return { kind: `unknown`, status: 0, message: `An unexpected error occurred.` };
  switch (t.status) {
    case 0:
      return {
        kind: `network`,
        status: 0,
        message: `Boreas is unreachable. Check the server and try again.`,
      };
    case 400:
      return { kind: `invalid-input`, status: 400, message: `The request contains invalid data.` };
    case 404:
      return { kind: `not-found`, status: 404, message: `The requested task was not found.` };
    case 409:
      return {
        kind: `conflict`,
        status: 409,
        message: `The task changed state or is already transitioning. Wait for it to settle and try again.`,
      };
    default:
      return {
        kind: t.status >= 500 ? `server` : `unknown`,
        status: t.status,
        message: t.status >= 500 ? `Boreas could not complete the request.` : `The request failed.`,
      };
  }
}
export {
  Ut as a,
  j as c,
  on as d,
  qt as f,
  Pt as i,
  nn as l,
  F as n,
  V as o,
  sn as p,
  Ft as r,
  ci as s,
  Bt as t,
  no as u,
};
