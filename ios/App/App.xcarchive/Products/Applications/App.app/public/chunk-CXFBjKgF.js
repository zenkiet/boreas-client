import {
  $r as px,
  Bn as eg,
  Cr as kx,
  Dt as Rl,
  E as FO,
  Ei as vA,
  Er as lQ,
  Et as R9,
  Fi as vx,
  Fr as mn,
  Gn as fX,
  H as Ir,
  J as KQ,
  Jr as pX,
  Ki as yR,
  Kn as fc,
  Kr as ot,
  Kt as Vi,
  L as Hy,
  Li as wR,
  Lr as mx,
  Pn as db,
  Pr as mX,
  Qr as pl,
  Rt as Ta,
  Sr as kr,
  Ti as v,
  Tt as R1,
  U as Ix,
  Ur as oe$1,
  Vn as et,
  Wi as xx,
  Wt as VE,
  Xi as yc,
  Xn as gX,
  Xt as Wo,
  Yi as ya,
  Yr as pb,
  _r as ji,
  an as ZE,
  bt as Px,
  ci as rg,
  ct as N9,
  d as BE,
  di as sR,
  dn as _R,
  dr as ig,
  dt as Na,
  en as YE,
  er as hQ,
  fi as sg,
  fr as it,
  gn as aC,
  i as A1,
  ir as hb,
  j as H,
  jr as lr,
  jt as Rx,
  l as Ax,
  m as By,
  na as yx,
  or as hx,
  pt as O9,
  qr as pJ,
  ri as qQ,
  sa as zo,
  si as rJ,
  t as $Q,
  tt as Li,
  vn as ag,
  w as FE,
  x as ER,
  xt as QX,
  y as E,
  yi as tr,
  yr as jo,
} from './chunk-CD8PwEax.js';
import { a as Mt, p as bt, t as C, u as W } from './chunk-bRWS10C8.js';
import { A as tn, E as oe$2, F as z, O as qi, P as h, _ as Nn, x as Yt } from './main-YU6HVKXZ.js';
import { n as R$1 } from './chunk-Cxjo7Efo.js';
import {
  T as zn,
  _ as dn,
  a as Ii,
  b as ri,
  c as Kt,
  l as M,
  r as Ft,
  w as un,
} from './chunk-C4cee0NY.js';
var _t = (() => {
  class t {
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵdir = ot({ type: t, selectors: [[``, `tuiItem`, ``]] });
    }
  }
  return t;
})();
var le = (() => {
  class t {
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [[`ng-component`]],
        exportAs: [`tui-label-5.19.0`],
        decls: 0,
        vars: 0,
        template: function (n, e) {},
        styles: [
          `[tuiLabel]:where(*[data-tui-version="5.19.0"]){display:flex;gap:.25rem;flex-direction:column;font:var(--%NS%tui-typography-body-s);color:var(--%NS%tui-text-primary)}[tuiLabel]:where(*[data-tui-version="5.19.0"]):not([data-orientation=vertical]){flex-direction:row;inline-size:fit-content;font:var(--%NS%tui-typography-body-m)}[tuiLabel]:where(*[data-tui-version="5.19.0"]) input[type=checkbox],[tuiLabel]:where(*[data-tui-version="5.19.0"]) input[type=radio]{font:inherit;inset-block-start:calc(var(--%NS%tui-lh) / 2);transform:translateY(-50%);margin-inline-end:.5rem}[tuiLabel]:where(*[data-tui-version="5.19.0"]) input[type=checkbox][data-size=s],[tuiLabel]:where(*[data-tui-version="5.19.0"]) input[type=radio][data-size=s]{line-height:1.3;margin-inline-end:.25rem}[tuiLabel]:where(*[data-tui-version="5.19.0"]) small{font:var(--%NS%tui-typography-body-s)}[tuiLabel]:where(*[data-tui-version="5.19.0"]) [tuiTitle]:where(:not([tuiCell] *)){margin-block-start:.125rem}[tuiLabel]:where(*[data-tui-version="5.19.0"]) [tuiSubtitle]{color:var(--%NS%tui-text-secondary)}
`,
        ],
        encapsulation: 2,
      });
    }
  }
  return t;
})();
var St = (() => {
  class t {
    constructor() {
      ((this.textfield = R9(Ir(() => Kt))),
        (this.el = qQ()),
        (this.nothing = db(le)),
        (this.parent = v(
          Ir(() => Kt),
          { optional: !0 },
        )));
    }
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        selectors: [[`label`, `tuiLabel`, ``]],
        contentQueries: function (n, e, a) {
          (n & 1 && YE(a, e.textfield, Kt, 5), n & 2 && kx());
        },
        hostAttrs: [`data-tui-version`, `5.19.0`],
        hostVars: 2,
        hostBindings: function (n, e) {
          n & 2 &&
            kr(`data-orientation`, e.textfield() ? `vertical` : `horizontal`)(
              `for`,
              e.el.htmlFor || (e.parent == null ? null : e.parent.id),
            );
        },
      });
    }
  }
  return t;
})();
var ce = { stringify: H(String), identityMatcher: H(mX), disabledItemHandler: H(fX) };
var R = new E(``, { factory: () => ce });
var pe = (() => {
  class t {
    constructor() {
      ((this.handlers = v(R, { skipSelf: !0 })),
        (this.stringify = tr(this.handlers.stringify())),
        (this.identityMatcher = tr(this.handlers.identityMatcher())),
        (this.disabledItemHandler = tr(this.handlers.disabledItemHandler())));
    }
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        inputs: {
          stringify: [1, `stringify`],
          identityMatcher: [1, `identityMatcher`],
          disabledItemHandler: [1, `disabledItemHandler`],
        },
        features: [Na([pb(R, t)])],
      });
    }
  }
  return t;
})();
var re = (() => {
  class t {
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        features: [
          Ta([
            {
              directive: pe,
              inputs: [
                `stringify`,
                `stringify`,
                `identityMatcher`,
                `identityMatcher`,
                `disabledItemHandler`,
                `disabledItemHandler`,
              ],
            },
          ]),
        ],
      });
    }
  }
  return t;
})();
var [ni, oe] = hb({
  filter: (t, o, i) => (t.find((n) => gX(n, o, i)) ? t : t.filter((n) => pX(n, o, i))),
});
var he = [`ghost`];
var ve = [`vcr`];
var xe = [
  [[`input`]],
  [[`select`]],
  [[`textarea`]],
  [[`label`, `tuiLabel`, ``]],
  `*`,
  [[`tui-icon`]],
];
var we = [`input`, `select`, `textarea`, `label[tuiLabel]`, `*`, `tui-icon`];
var Ct = (t) => ({ $implicit: t });
function be(t, o) {}
function ge(t, o) {
  if (t & 1) {
    let i = Ix();
    (pl(0, `button`, 7),
      zo(`click`, function () {
        let e;
        By(i);
        return Hy((e = Ax().accessor()) == null ? null : e.setValue(null));
      }),
      sR(1),
      eg());
  }
  if (t & 2) {
    let i = Ax();
    (vA(), ag(` `, i.clear(), ` `));
  }
}
function ye(t, o) {
  if ((t & 1 && (rg(0), sR(1), ig()), t & 2)) {
    let i = o.polymorpheusOutlet;
    (vA(), ag(` `, i, ` `));
  }
}
function _e(t, o) {
  if ((t & 1 && (pl(0, `span`, 5), FE(1, ye, 2, 1, `ng-container`, 8), eg()), t & 2)) {
    let i,
      n = Ax();
    (VE(`tuiCell`, n.options.size()),
      vA(),
      VE(`polymorpheusOutlet`, n.content())(
        `polymorpheusOutletContext`,
        yR(3, Ct, (i = n.control()) == null ? null : i.value),
      ));
  }
}
function Se(t, o) {
  if ((t & 1 && Rl(0, `input`, 6, 2), t & 2)) VE(`value`, Ax().computedFiller());
}
function Ne(t, o) {
  if ((t & 1 && (rg(0), sR(1), ig()), t & 2)) {
    let i = o.polymorpheusOutlet;
    (vA(), aC(i));
  }
}
var Te = [[[`label`, `tuiLabel`, ``]], [[`input`]], [[`select`]], `*`, [[`tui-icon`]]];
var Ce = [`label[tuiLabel]`, `input`, `select`, `*`, `tui-icon`];
var ze = (t, o) => ({ item: t, index: o });
function Ie(t, o) {}
function ke(t, o) {
  t & 1 && Rl(0, `tui-scroll-controls`, 3);
}
function Le(t, o) {}
function De(t, o) {
  if ((t & 1 && FE(0, Le, 0, 0, `ng-template`, 5), t & 2)) {
    let i = o.$implicit,
      n = o.$index;
    VE(`polymorpheusOutlet`, Ax().component)(
      `polymorpheusOutletContext`,
      yR(5, Ct, _R(2, ze, i, n)),
    );
  }
}
function Ee(t, o) {
  if ((t & 1 && (pl(0, `span`, 7), sR(1), eg()), t & 2)) {
    let i = Ax();
    (vA(), aC(i.placeholder));
  }
}
function Me(t, o) {
  if (t & 1) {
    let i = Ix();
    (pl(0, `button`, 12),
      zo(`click`, function () {
        let e;
        By(i);
        return Hy((e = Ax().accessor()) == null ? null : e.setValue([]));
      }),
      sR(1),
      eg());
  }
  if (t & 2) {
    let i = Ax();
    (vA(), ag(` `, i.clear(), ` `));
  }
}
function Fe(t, o) {
  if ((t & 1 && (rg(0), sR(1), ig()), t & 2)) {
    let i = o.polymorpheusOutlet;
    (vA(), ag(` `, i, ` `));
  }
}
function Ae(t, o) {
  if ((t & 1 && (pl(0, `span`, 11), FE(1, Fe, 2, 1, `ng-container`, 13), eg()), t & 2)) {
    let i,
      n = Ax();
    (VE(`tuiCell`, n.options.size()),
      vA(),
      VE(`polymorpheusOutlet`, n.content())(
        `polymorpheusOutletContext`,
        yR(3, Ct, (i = n.control()) == null ? null : i.value),
      ));
  }
}
var K = { appearance: `textfield`, size: `l`, cleaner: !0 };
var Tt = new E(``, {
  factory: () => ({ appearance: H(K.appearance), size: H(K.size), cleaner: H(K.cleaner) }),
});
var Qi = (() => {
  class t {
    constructor() {
      ((this.options = v(Tt, { skipSelf: !0 })),
        (this.appearance = tr(this.options.appearance(), { alias: `tuiTextfieldAppearance` })),
        (this.size = tr(this.options.size(), {
          alias: `tuiTextfieldSize`,
          transform: (i) => i || K.size,
        })),
        (this.cleaner = tr(this.options.cleaner(), { alias: `tuiTextfieldCleaner` })));
    }
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        selectors: [
          [``, `tuiTextfieldAppearance`, ``],
          [``, `tuiTextfieldSize`, ``],
          [``, `tuiTextfieldCleaner`, ``],
        ],
        inputs: {
          appearance: [1, `tuiTextfieldAppearance`, `appearance`],
          size: [1, `tuiTextfieldSize`, `size`],
          cleaner: [1, `tuiTextfieldCleaner`, `cleaner`],
        },
        features: [Na([pb(Tt, t)])],
      });
    }
  }
  return t;
})();
var J = new E(``);
var Nt = (() => {
  class t {
    constructor() {
      ((this.focusedIn = Mt(qQ())),
        (this.ghost = N9(`ghost`)),
        (this.dropdown = v(M)),
        (this.open = v(ri)),
        (this.clear = v(QX)),
        (this.label = R9(
          Ir(() => St),
          { read: it },
        )),
        (this.computedFiller = oe$1((i = this.value()) => {
          let n = this.filler();
          return n.length <= i.length
            ? ``
            : this.input()?.nativeElement.matches(`[dir="rtl"] :scope`)
              ? `${n.slice(0, n.length - i.length)}${i}`
              : `${i}${n.slice(i.length)}`;
        })),
        (this.showFiller = oe$1(
          () =>
            this.focused() &&
            !!this.computedFiller() &&
            (!!this.value() || !this.input()?.nativeElement.placeholder),
        )),
        (this.accessor = R9(J)),
        (this.vcr = N9(`vcr`, { read: Li })),
        (this.control = R9(yc)),
        (this.child = R9(R$1)),
        (this.auxiliaries = O9(R1, { descendants: !0 })),
        (this.focused = oe$1(() => this.open.open() || this.focusedIn())),
        (this.options = v(Tt)),
        (this.el = qQ()),
        (this.input = R9(J, { read: it })),
        (this.content = tr()),
        (this.filler = tr(``)),
        (this.invalid = tr(null)),
        (this.tuiAppearanceFocus = tr(null)),
        (this.tuiAppearanceState = tr(null)),
        (this.value = KQ(this.input)));
    }
    get disabled() {
      return this.control()?.disabled ?? this.input()?.nativeElement?.disabled ?? !1;
    }
    get size() {
      return this.options.size();
    }
    handleOption(i) {
      (this.accessor()?.setValue(i), this.open.open.set(!1));
    }
    get hasLabel() {
      return !!this.label()?.nativeElement?.childNodes.length;
    }
    onResize({ clientWidth: i }) {
      this.el.style.setProperty(`--t-side`, hQ(i));
    }
    onIconClick() {
      if (
        (this.input()?.nativeElement.focus(),
        !(
          !this.open.enabled() ||
          this.input()?.nativeElement.matches(`input:read-only,textarea:read-only`)
        ))
      ) {
        this.open.open.update((i) => !i);
        try {
          this.input()?.nativeElement.showPicker?.();
        } catch {}
      }
    }
    onScroll(i) {
      let n = this.input();
      n?.nativeElement === i &&
        this.ghost()?.nativeElement.scrollTo({ left: n?.nativeElement.scrollLeft });
    }
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [[`tui-textfield`, 3, `multi`, ``]],
        contentQueries: function (n, e, a) {
          (n & 1 &&
            YE(a, e.label, St, 5, it)(a, e.accessor, J, 5)(a, e.control, yc, 5)(a, e.child, R$1, 5)(
              a,
              e.auxiliaries,
              R1,
              5,
            )(a, e.input, J, 5, it),
            n & 2 && kx(6));
        },
        viewQuery: function (n, e) {
          (n & 1 && ZE(e.ghost, he, 5)(e.vcr, ve, 5, Li), n & 2 && kx(2));
        },
        hostAttrs: [1, `tui-interactive`],
        hostVars: 7,
        hostBindings: function (n, e) {
          if (
            (n & 1 &&
              zo(`animationcancel`, function () {
                return 0;
              })(`animationstart`, function () {
                return 0;
              })(`click.self.prevent`, function () {
                return 0;
              })(`pointerdown.self.prevent`, function () {
                return e.onIconClick();
              })(`scroll.capture.zoneless`, function (r) {
                return e.onScroll(r.target);
              })(`tuiActiveZoneChange`, function (r) {
                let l;
                return (
                  !r &&
                  ((l = e.control()) == null ||
                  l.valueAccessor == null ||
                  l.valueAccessor.onTouched == null
                    ? null
                    : l.valueAccessor.onTouched())
                );
              }),
            n & 2)
          ) {
            let a;
            (kr(`data-size`, e.options.size()),
              sg(`_disabled`, e.disabled)(`_with-label`, e.hasLabel)(
                `_with-template`,
                e.content() && ((a = e.control()) == null ? null : a.value) != null,
              ));
          }
        },
        inputs: {
          content: [1, `content`],
          filler: [1, `filler`],
          invalid: [1, `invalid`],
          tuiAppearanceFocus: [1, `tuiAppearanceFocus`],
          tuiAppearanceState: [1, `tuiAppearanceState`],
        },
        features: [
          Na([
            bt({ size: `xs`, appearance: `icon` }),
            h(() => v(W)),
            zn(t),
            { provide: rJ, useFactory: () => v(t).value },
          ]),
          Ta([C, M, un, dn, pJ, re, Ii]),
        ],
        ngContentSelectors: we,
        decls: 15,
        vars: 6,
        consts: [
          [`side`, ``],
          [`vcr`, ``],
          [`ghost`, ``],
          [1, `t-content`, 3, `pointerdown`, `resize`],
          [`tabindex`, `-1`, `tuiButtonX`, ``],
          [1, `t-template`, 3, `tuiCell`],
          [`aria-hidden`, `true`, `disabled`, ``, 1, `t-filler`, 3, `value`],
          [`tabindex`, `-1`, `tuiButtonX`, ``, 3, `click`],
          [4, `polymorpheusOutlet`, `polymorpheusOutletContext`],
        ],
        template: function (n, e) {
          if (n & 1) {
            let a = Ix();
            (xx(xe),
              hx(0, be, 0, 0),
              ER(1, `async`),
              Rx(2),
              Rx(3, 1),
              Rx(4, 2),
              Rx(5, 3),
              pl(6, `span`, 3, 0),
              zo(`pointerdown`, function () {
                let l;
                return (
                  By(a),
                  Hy(
                    (l = e.input()) == null || l.nativeElement == null
                      ? null
                      : l.nativeElement.focus(),
                  )
                );
              })(`resize`, function () {
                By(a);
                let l = Px(7);
                return Hy(e.onResize(l));
              }),
              Rx(8, 4),
              BE(9, null, 1),
              hx(11, ge, 2, 1, `button`, 4),
              Rx(12, 5),
              eg(),
              hx(13, _e, 2, 5, `span`, 5),
              hx(14, Se, 2, 1, `input`, 6));
          }
          if (n & 2) {
            let a, r;
            (px(
              (((a = e.child()) == null ? null : a.value()) ??
                wR(
                  1,
                  4,
                  (a = e.control()) == null || a.control == null ? null : a.control.valueChanges,
                ))
                ? 0
                : -1,
            ),
              vA(11),
              px(e.options.cleaner() ? 11 : -1),
              vA(2),
              px(((r = e.control()) == null ? null : r.value) != null ? 13 : -1),
              vA(),
              px(e.showFiller() ? 14 : -1));
          }
        },
        dependencies: [FO, Yt, z, Ft],
        styles: [
          `tui-textfield:where(*[data-tui-version="5.19.0"]){scrollbar-width:none;-ms-overflow-style:none;transition-property:color;transition-duration:calc(var(--%NS%tui-duration) / 2);transition-timing-function:var(--%NS%tui-curve-productive-standard);--%NS%t-height: calc(var(--%NS%tui-height-l) + 2.5 * var(--%NS%t-label) * var(--%NS%tui-font-offset));--%NS%t-padding: var(--%NS%tui-padding-l);--%NS%t-label: 0;--%NS%t-label-y: -.75rem;--%NS%t-label-font: var(--%NS%tui-typography-ui-s);--%NS%t-end: 0px;--%NS%t-start: 0px;--%NS%t-side: 0px;--%NS%t-max: .75rem;--%NS%t-space: clamp(0px, calc(var(--%NS%t-side) + var(--%NS%t-end)), var(--%NS%t-max));position:relative;display:flex;flex-wrap:wrap;align-items:flex-start;min-block-size:var(--%NS%t-height);padding:0 var(--%NS%t-padding);border-radius:var(--%NS%tui-radius-l);font:var(--%NS%tui-typography-ui-m);box-sizing:border-box;isolation:isolate}tui-textfield:where(*[data-tui-version="5.19.0"])::-webkit-scrollbar,tui-textfield:where(*[data-tui-version="5.19.0"])::-webkit-scrollbar-thumb{display:none}tui-textfield:where(*[data-tui-version="5.19.0"])[tuiAppearance]{outline:none}tui-textfield:where(*[data-tui-version="5.19.0"])[tuiAppearance][data-appearance=""]{color:var(--%NS%tui-text-tertiary)}@media(hover:hover)and (pointer:fine){tui-textfield:where(*[data-tui-version="5.19.0"])[tuiAppearance][data-appearance=""]:not([data-mode~=readonly]):is(a,button,select,textarea,input,label,.tui-interactive):not(:disabled):hover:not([data-state]){color:var(--%NS%tui-text-secondary)}}tui-textfield:where(*[data-tui-version="5.19.0"])[tuiAppearance][data-appearance=""]:not([data-mode~=readonly])[data-state=hover]{color:var(--%NS%tui-text-secondary)}tui-textfield:where(*[data-tui-version="5.19.0"])[data-icon-start]{--%NS%t-start: calc(2.5rem * (1 + .25 * var(--%NS%t-zoom)))}tui-textfield:where(*[data-tui-version="5.19.0"])[data-icon-end]{--%NS%t-end: 1.75rem}tui-textfield:where(*[data-tui-version="5.19.0"])[tuiIcons]:before{z-index:1;block-size:var(--%NS%t-height);inline-size:1.5rem;margin-inline-end:1rem;pointer-events:none;max-block-size:calc(var(--%NS%t-height) * (1 - .2 * var(--%NS%t-zoom)))}tui-textfield:where(*[data-tui-version="5.19.0"])[tuiIcons]:after{position:relative;inline-size:calc(1.5rem + 2 * var(--%NS%t-padding));cursor:pointer;margin-inline-start:calc(.25rem - var(--%NS%t-padding));margin-inline-end:calc(-1 * var(--%NS%t-padding));block-size:var(--%NS%t-height);max-block-size:calc(var(--%NS%t-height) * (1 - .2 * var(--%NS%t-zoom)))}tui-textfield:where(*[data-tui-version="5.19.0"])::-webkit-resizer{border:.25rem solid transparent;inline-size:.5rem;block-size:.5rem;box-sizing:content-box;color:var(--%NS%tui-text-tertiary);background:linear-gradient(-45deg,transparent,transparent .125rem,currentColor .125rem,currentColor .1875rem,transparent .1875rem,transparent .25rem,currentColor .25rem,currentColor .3125rem,transparent .35rem);background-clip:content-box}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"])>.t-content,tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template{pointer-events:none}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s]{--%NS%t-height: var(--%NS%tui-height-s);--%NS%t-padding: var(--%NS%tui-padding-s);--%NS%t-max: 0px;border-radius:var(--%NS%tui-radius-m);font:var(--%NS%tui-typography-ui-s)}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s][data-icon-start]{--%NS%t-start: 1.5rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s][data-icon-end]{--%NS%t-end: 1.5rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s]:before{font-size:1rem;margin-inline:-.25rem .25rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s]:after{inline-size:calc(.75rem + 2 * var(--%NS%t-padding));margin-inline:0 -.5rem;font-size:1rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s]>.t-content{gap:0}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s]>.t-content>*:last-child{margin-inline-end:-.25rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m]{--%NS%t-height: calc(var(--%NS%tui-height-m) + 2.5 * var(--%NS%t-label) * var(--%NS%tui-font-offset));--%NS%t-padding: var(--%NS%tui-padding-m);--%NS%t-label-font: var(--%NS%tui-typography-ui-xs);--%NS%t-label-y: -.5625rem;--%NS%t-max: .125rem;border-radius:var(--%NS%tui-radius-m);font:var(--%NS%tui-typography-ui-s)}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m][data-icon-start]{--%NS%t-start: calc(2.125rem * (1 + .25 * var(--%NS%t-zoom)))}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m][data-icon-end]{--%NS%t-end: 1.75rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m]:before{margin-inline:-.125rem .75rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m]:after{inline-size:calc(1.25rem + 2 * var(--%NS%t-padding));margin-inline-start:calc(.5rem - var(--%NS%t-padding))}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m]>.t-content>*:last-child{margin-inline-end:-.125rem}tui-textfield:where(*[data-tui-version="5.19.0"]):is(._disabled,[data-state=disabled]){pointer-events:none;opacity:var(--%NS%tui-disabled-opacity)}tui-textfield:where(*[data-tui-version="5.19.0"]):is(._disabled,[data-state=disabled]) [tuiAppearance]:is(._disabled,:disabled,[data-state=disabled]){opacity:1}tui-textfield:where(*[data-tui-version="5.19.0"]):is(._disabled,[data-state=disabled])>.t-content>tui-icon{display:none}tui-textfield:where(*[data-tui-version="5.19.0"])._with-label{--%NS%t-label: 1}tui-textfield:where(*[data-tui-version="5.19.0"])._with-label>.t-template,tui-textfield:where(*[data-tui-version="5.19.0"])._with-label .t-filler,tui-textfield:where(*[data-tui-version="5.19.0"])._with-label [tuiInput]{inset-block-end:0;padding-block-start:calc(var(--%NS%t-height) / 3);padding-block-end:0}tui-textfield:where(*[data-tui-version="5.19.0"])._with-label:is(:not([data-focus=true]),[data-mode~=readonly])>.t-template::placeholder,tui-textfield:where(*[data-tui-version="5.19.0"])._with-label:is(:not([data-focus=true]),[data-mode~=readonly]) [tuiInput]::placeholder,tui-textfield:where(*[data-tui-version="5.19.0"])._with-label:is(:not([data-focus=true]),[data-mode~=readonly])>.t-template._empty,tui-textfield:where(*[data-tui-version="5.19.0"])._with-label:is(:not([data-focus=true]),[data-mode~=readonly]) [tuiInput]._empty{color:transparent}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template,tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]{position:absolute;inset-inline:0;inline-size:auto;block-size:var(--%NS%t-height);-webkit-appearance:none;appearance:none;background:none;font:inherit;resize:none;outline:none;color:var(--%NS%tui-text-primary);box-sizing:border-box;border-radius:inherit;border-width:0;padding-inline-start:calc(var(--%NS%t-start) + var(--%NS%t-padding));padding-inline-end:calc(var(--%NS%t-end) + var(--%NS%t-side) + var(--%NS%t-padding) + var(--%NS%t-space));white-space:nowrap;overflow:hidden}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template:is(input,textarea):read-only~.t-filler,tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler:is(input,textarea):read-only~.t-filler,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:is(input,textarea):read-only~.t-filler{display:none}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template:disabled,tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler:disabled,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:disabled{animation:tuiPresent 1s infinite;opacity:1}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template[inputmode=none],tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler[inputmode=none],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput][inputmode=none]{caret-color:transparent}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template::-webkit-inner-spin-button,tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler::-webkit-inner-spin-button,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]::-webkit-inner-spin-button,tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template::-webkit-outer-spin-button,tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler::-webkit-outer-spin-button,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]::-webkit-outer-spin-button{-webkit-appearance:none;appearance:none}tui-textfield:where(*[data-tui-version="5.19.0"])._with-template [tuiInput]:first-of-type{color:transparent!important}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:-webkit-autofill [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput][chrome-autofilled] [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:not(._empty,:placeholder-shown) [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"])[multi][multi]:not(._empty) [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:-webkit-autofill:not(tui-textfield)~[tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput][chrome-autofilled]:not(tui-textfield)~[tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:not(._empty,:placeholder-shown):not(tui-textfield)~[tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"])[multi][multi]:not(._empty):not(tui-textfield)~[tuiLabel]{font:var(--%NS%t-label-font);transform:translateY(calc(var(--%NS%t-label-y) - var(--%NS%tui-font-offset) / 2))}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiLabel][tuiLabel][tuiLabel]{transition-property:all;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;position:relative;display:block;max-inline-size:calc(100% - var(--%NS%t-start));flex:1;align-self:flex-start;font:inherit;-webkit-user-select:none;user-select:none;padding:calc(var(--%NS%t-height) / 2 - .625em) 0;line-height:1.25!important;transition-duration:inherit}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiLabel][tuiLabel][tuiLabel]+.t-content{margin-inline-start:0}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]::placeholder,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]._empty{color:var(--%NS%tui-text-secondary)}tui-textfield:where(*[data-tui-version="5.19.0"]) select option[value=""]:disabled{color:transparent}tui-textfield:where(*[data-tui-version="5.19.0"]) select optgroup,tui-textfield:where(*[data-tui-version="5.19.0"]) select option{background-color:var(--%NS%tui-background-elevation-1)}tui-textfield:where(*[data-tui-version="5.19.0"]) select optgroup,tui-textfield:where(*[data-tui-version="5.19.0"]) select option:not(:disabled){color:var(--%NS%tui-text-primary)}tui-textfield:where(*[data-tui-version="5.19.0"]) button,tui-textfield:where(*[data-tui-version="5.19.0"]) a,tui-textfield:where(*[data-tui-version="5.19.0"]) tui-icon{pointer-events:auto}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-content{z-index:1;display:flex;block-size:var(--%NS%t-height);align-items:center;gap:.25rem;margin-inline-start:auto;isolation:isolate;border-radius:inherit}tui-textfield:where(*[data-tui-version="5.19.0"]) textarea~.t-content{min-inline-size:.5rem}tui-textfield:where(*[data-tui-version="5.19.0"]):is([data-mode~=readonly],[data-state=disabled],._empty) [tuiButtonX],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]._empty~.t-content [tuiButtonX],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:disabled~.t-content [tuiButtonX]{display:none}tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler{pointer-events:none!important;color:var(--%NS%tui-text-tertiary)}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiFluidTypography]{font-weight:700}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiSelectLike]:not(:read-only){cursor:pointer}tui-textfield:where(*[data-tui-version="5.19.0"]):has(input[type=tel]){direction:ltr}tui-textfield:where(*[data-tui-version="5.19.0"]):is([data-mode~=invalid],.tui-invalid,:invalid):not([data-mode~=readonly],[data-mode~=valid],[data-state=disabled],:disabled,._disabled) [tuiInput]:not(._empty)~[tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]):is([data-mode~=invalid],.tui-invalid,:invalid):not([data-mode~=readonly],[data-mode~=valid],[data-state=disabled],:disabled,._disabled)[multi]:not(._empty) [tuiLabel]{color:var(--%NS%tui-text-negative)}tui-textfield:where(*[data-tui-version="5.19.0"]):not([data-mode~=readonly]):focus-visible:not([data-focus=false]) [tuiLabel]{color:var(--%NS%tui-text-primary)!important;font:var(--%NS%t-label-font);transform:translateY(calc(var(--%NS%t-label-y) - var(--%NS%tui-font-offset) / 2))}tui-textfield:where(*[data-tui-version="5.19.0"]):not([data-mode~=readonly])[data-focus=true] [tuiLabel]{color:var(--%NS%tui-text-primary)!important;font:var(--%NS%t-label-font);transform:translateY(calc(var(--%NS%t-label-y) - var(--%NS%tui-font-offset) / 2))}
`,
        ],
        encapsulation: 2,
      });
    }
  }
  return t;
})();
var Oe = new oe$2(
  (() => {
    class t {
      constructor() {
        ((this.el = qQ()),
          (this.handlers = v(R)),
          (this.context = Nn()),
          (this.textfield = v(Be)),
          (this.content = oe$1(
            () => this.textfield.item() ?? this.handlers.stringify()(this.context.$implicit.item),
          )));
      }
      prevent(i) {
        this.textfield.focused() && i.preventDefault();
      }
      static {
        this.ɵfac = function (n) {
          return new (n || t)();
        };
      }
      static {
        this.ɵcmp = Vi({
          type: t,
          selectors: [[`tui-textfield-item`]],
          hostVars: 4,
          hostBindings: function (n, e) {
            (n & 1 &&
              zo(`keydown.arrowLeft.prevent`, function () {
                return e.el.previousElementSibling == null ||
                  e.el.previousElementSibling.firstChild == null
                  ? null
                  : e.el.previousElementSibling.firstChild.focus();
              })(`keydown.arrowRight.prevent`, function () {
                return e.el.nextElementSibling == null || e.el.nextElementSibling.firstChild == null
                  ? null
                  : e.el.nextElementSibling.firstChild.focus();
              })(`pointerdown.self`, function (r) {
                return e.prevent(r);
              }),
              n & 2 &&
                sg(`_disabled`, e.handlers.disabledItemHandler()(e.context.$implicit.item))(
                  `_string`,
                  !e.textfield.item(),
                ));
          },
          decls: 1,
          vars: 2,
          consts: [[4, `polymorpheusOutlet`, `polymorpheusOutletContext`]],
          template: function (n, e) {
            (n & 1 && FE(0, Ne, 2, 1, `ng-container`, 0),
              n & 2 &&
                VE(`polymorpheusOutlet`, e.content())(`polymorpheusOutletContext`, e.context));
          },
          dependencies: [Yt],
          styles: [
            `[_nghost-%COMP%]{display:flex;max-inline-size:100%;flex-shrink:0;white-space:nowrap;text-overflow:ellipsis;color:var(--%NS%tui-text-primary)}._string[_nghost-%COMP%]{display:block;overflow:hidden;overflow:clip visible}._string._disabled[_nghost-%COMP%]{opacity:var(--%NS%tui-disabled-opacity)}._string[_nghost-%COMP%]:after{content:",\\a0"}[_nghost-%COMP%]:last-of-type{max-inline-size:80%}tui-textfield:not([data-focus="true"])[_nghost-%COMP%]:last-of-type:after, tui-textfield:not([data-focus="true"])   [_nghost-%COMP%]:last-of-type:after{display:none}tui-textfield:has([tuiSelectLike])[_nghost-%COMP%]:last-of-type:after, tui-textfield:has([tuiSelectLike])   [_nghost-%COMP%]:last-of-type:after, tui-textfield[data-mode~="readonly"][_nghost-%COMP%]:last-of-type:after, tui-textfield[data-mode~="readonly"]   [_nghost-%COMP%]:last-of-type:after{content:"\\a0"}`,
          ],
        });
      }
    }
    return t;
  })(),
);
var Be = (() => {
  class t extends Nt {
    constructor() {
      (super(...arguments),
        (this.height = H(null)),
        (this.win = v(lr)),
        (this.handlers = v(R)),
        (this.component = Oe),
        (this.items = oe$1(() => this.cva()?.value() ?? [])),
        (this.sub = mn(this.el, `scroll`)
          .pipe(
            et(() => this.rows() === 1),
            A1(),
            fc(),
          )
          .subscribe(() => {
            this.el.style.setProperty(`--t-scroll`, hQ(-1 * this.el.scrollLeft));
          })),
        (this.cva = R9(R$1)),
        (this.item = R9(_t, { read: jo, descendants: !0 })),
        (this.rows = tr(100)));
    }
    handleOption(i) {
      this.accessor()?.setValue(lQ(this.items(), i, this.handlers.identityMatcher()));
    }
    get placeholder() {
      let i = this.input()?.nativeElement,
        n = i?.matches(`input`) ? i.placeholder : this.computedFiller(),
        e = this.computedFiller() || this.value(),
        a = e.length > n.length ? e : n;
      return this.focused() ? a : ``;
    }
    onItems(i) {
      this.height.update((n) => i.querySelector(`tui-textfield-item`)?.clientHeight || n);
    }
    onLeft(i) {
      this.value() ||
        !$Q(i.currentTarget) ||
        (i.preventDefault(), i.currentTarget.previousElementSibling?.firstElementChild?.focus());
    }
    focusInput() {
      let i = this.win.getSelection();
      (!i?.rangeCount || i.getRangeAt(0)?.collapsed) && this.input()?.nativeElement.focus();
    }
    onClick(i) {
      if (!(
        i === this.el ||
        !this.cva()?.interactive() ||
        (!this.el.matches(`[tuiChevron]`) &&
          !this.el.querySelector(`select, [tuiInputDateMulti]`)) ||
        i.matches(`input:read-only,input[inputmode="none"]`)
      )) {
        this.open.open.update((n) => !n);
        try {
          this.input()?.nativeElement.showPicker?.();
        } catch {}
      }
    }
    static {
      this.ɵfac = (() => {
        let i;
        return function (e) {
          return (i || (i = ya(t)))(e || t);
        };
      })();
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [[`tui-textfield`, `multi`, ``]],
        contentQueries: function (n, e, a) {
          (n & 1 && YE(a, e.cva, R$1, 5)(a, e.item, _t, 5, jo), n & 2 && kx(2));
        },
        hostVars: 7,
        hostBindings: function (n, e) {
          (n & 1 &&
            zo(`click.prevent`, function (r) {
              return e.onClick(r.target);
            })(`tuiActiveZoneChange`, function (r) {
              return !r && e.el.scrollTo({ left: 0 });
            }),
            n & 2 &&
              (kr(`data-state`, e.disabled ? `disabled` : null),
              Wo(`--%NS%t-item-height`, e.height(), `px`)(`--%NS%t-rows`, e.rows()),
              sg(`_empty`, !e.items().length)));
        },
        inputs: { rows: [1, `rows`] },
        features: [
          Na([
            bt({ size: `xs`, appearance: `icon` }),
            h(() => v(W)),
            zn(t),
            pb(Nt, t),
            { provide: rJ, useFactory: () => v(Nt).value },
            oe({ filter: (i, n, e) => i.filter((a) => pX(a, n, e)) }),
          ]),
          Ta([qi]),
          ji,
        ],
        ngContentSelectors: Ce,
        decls: 21,
        vars: 12,
        consts: [
          [`wrapper`, ``],
          [`side`, ``],
          [`vcr`, ``],
          [1, `t-scrollbar`],
          [1, `t-items`, 3, `click`, `pointerdown.self.zoneless.prevent`, `resize`],
          [3, `polymorpheusOutlet`, `polymorpheusOutletContext`],
          [1, `t-input`, 3, `keydown.arrowLeft`],
          [1, `t-ghost`],
          [`aria-hidden`, `true`, `disabled`, ``, 1, `t-filler`, 3, `value`],
          [1, `t-content`, 3, `click.stop`, `pointerdown.zoneless.prevent`, `resize`],
          [`tabindex`, `-1`, `tuiButtonX`, ``],
          [1, `t-template`, 3, `tuiCell`],
          [`tabindex`, `-1`, `tuiButtonX`, ``, 3, `click`],
          [4, `polymorpheusOutlet`, `polymorpheusOutletContext`],
        ],
        template: function (n, e) {
          if (n & 1) {
            let a = Ix();
            (xx(Te),
              hx(0, Ie, 0, 0),
              ER(1, `async`),
              hx(2, ke, 1, 0, `tui-scroll-controls`, 3),
              pl(3, `div`, 4, 0),
              zo(`click`, function () {
                return e.focusInput();
              })(`pointerdown.self.zoneless.prevent`, function () {
                return 0;
              })(`resize`, function () {
                By(a);
                let l = Px(4);
                return Hy(e.onItems(l));
              }),
              Rx(5),
              vx(6, De, 1, 7, null, 5, mx),
              pl(8, `span`, 6),
              zo(`keydown.arrowLeft`, function (l) {
                return e.onLeft(l);
              }),
              Rx(9, 1),
              Rx(10, 2),
              hx(11, Ee, 2, 1, `span`, 7),
              Rl(12, `input`, 8),
              eg()(),
              pl(13, `span`, 9, 1),
              zo(`click.stop`, function () {
                let l;
                return (
                  By(a),
                  Hy(
                    (l = e.input()) == null || l.nativeElement == null
                      ? null
                      : l.nativeElement.focus(),
                  )
                );
              })(`pointerdown.zoneless.prevent`, function () {
                return 0;
              })(`resize`, function () {
                By(a);
                let l = Px(14);
                return Hy(e.onResize(l));
              }),
              Rx(15, 3),
              hx(16, Me, 2, 1, `button`, 10),
              BE(17, null, 2),
              Rx(19, 4),
              eg(),
              hx(20, Ae, 2, 5, `span`, 11));
          }
          if (n & 2) {
            let a, r;
            (px(
              (((a = e.child()) == null ? null : a.value()) ??
                wR(
                  1,
                  10,
                  (a = e.control()) == null || a.control == null ? null : a.control.valueChanges,
                ))
                ? 0
                : -1,
            ),
              vA(2),
              px(e.rows() > 1 ? 2 : -1),
              vA(),
              sg(`t-items_horizontal`, e.rows() === 1),
              vA(3),
              yx(e.items()),
              vA(5),
              px(e.placeholder ? 11 : -1),
              vA(),
              sg(`t-filler_hidden`, !e.showFiller()),
              VE(`value`, e.computedFiller()),
              vA(4),
              px(e.options.cleaner() ? 16 : -1),
              vA(4),
              px(((r = e.control()) == null ? null : r.value) != null ? 20 : -1));
          }
        },
        dependencies: [FO, Yt, z, Ft, tn],
        styles: [
          `tui-textfield:where(*[data-tui-version="5.19.0"]){scrollbar-width:none;-ms-overflow-style:none;transition-property:color;transition-duration:calc(var(--%NS%tui-duration) / 2);transition-timing-function:var(--%NS%tui-curve-productive-standard);--%NS%t-height: calc(var(--%NS%tui-height-l) + 2.5 * var(--%NS%t-label) * var(--%NS%tui-font-offset));--%NS%t-padding: var(--%NS%tui-padding-l);--%NS%t-label: 0;--%NS%t-label-y: -.75rem;--%NS%t-label-font: var(--%NS%tui-typography-ui-s);--%NS%t-end: 0px;--%NS%t-start: 0px;--%NS%t-side: 0px;--%NS%t-max: .75rem;--%NS%t-space: clamp(0px, calc(var(--%NS%t-side) + var(--%NS%t-end)), var(--%NS%t-max));position:relative;display:flex;flex-wrap:wrap;align-items:flex-start;min-block-size:var(--%NS%t-height);padding:0 var(--%NS%t-padding);border-radius:var(--%NS%tui-radius-l);font:var(--%NS%tui-typography-ui-m);box-sizing:border-box;isolation:isolate}tui-textfield:where(*[data-tui-version="5.19.0"])::-webkit-scrollbar,tui-textfield:where(*[data-tui-version="5.19.0"])::-webkit-scrollbar-thumb{display:none}tui-textfield:where(*[data-tui-version="5.19.0"])[tuiAppearance]{outline:none}tui-textfield:where(*[data-tui-version="5.19.0"])[tuiAppearance][data-appearance=""]{color:var(--%NS%tui-text-tertiary)}@media(hover:hover)and (pointer:fine){tui-textfield:where(*[data-tui-version="5.19.0"])[tuiAppearance][data-appearance=""]:not([data-mode~=readonly]):is(a,button,select,textarea,input,label,.tui-interactive):not(:disabled):hover:not([data-state]){color:var(--%NS%tui-text-secondary)}}tui-textfield:where(*[data-tui-version="5.19.0"])[tuiAppearance][data-appearance=""]:not([data-mode~=readonly])[data-state=hover]{color:var(--%NS%tui-text-secondary)}tui-textfield:where(*[data-tui-version="5.19.0"])[data-icon-start]{--%NS%t-start: calc(2.5rem * (1 + .25 * var(--%NS%t-zoom)))}tui-textfield:where(*[data-tui-version="5.19.0"])[data-icon-end]{--%NS%t-end: 1.75rem}tui-textfield:where(*[data-tui-version="5.19.0"])[tuiIcons]:before{z-index:1;block-size:var(--%NS%t-height);inline-size:1.5rem;margin-inline-end:1rem;pointer-events:none;max-block-size:calc(var(--%NS%t-height) * (1 - .2 * var(--%NS%t-zoom)))}tui-textfield:where(*[data-tui-version="5.19.0"])[tuiIcons]:after{position:relative;inline-size:calc(1.5rem + 2 * var(--%NS%t-padding));cursor:pointer;margin-inline-start:calc(.25rem - var(--%NS%t-padding));margin-inline-end:calc(-1 * var(--%NS%t-padding));block-size:var(--%NS%t-height);max-block-size:calc(var(--%NS%t-height) * (1 - .2 * var(--%NS%t-zoom)))}tui-textfield:where(*[data-tui-version="5.19.0"])::-webkit-resizer{border:.25rem solid transparent;inline-size:.5rem;block-size:.5rem;box-sizing:content-box;color:var(--%NS%tui-text-tertiary);background:linear-gradient(-45deg,transparent,transparent .125rem,currentColor .125rem,currentColor .1875rem,transparent .1875rem,transparent .25rem,currentColor .25rem,currentColor .3125rem,transparent .35rem);background-clip:content-box}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"])>.t-content,tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template{pointer-events:none}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s]{--%NS%t-height: var(--%NS%tui-height-s);--%NS%t-padding: var(--%NS%tui-padding-s);--%NS%t-max: 0px;border-radius:var(--%NS%tui-radius-m);font:var(--%NS%tui-typography-ui-s)}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s][data-icon-start]{--%NS%t-start: 1.5rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s][data-icon-end]{--%NS%t-end: 1.5rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s]:before{font-size:1rem;margin-inline:-.25rem .25rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s]:after{inline-size:calc(.75rem + 2 * var(--%NS%t-padding));margin-inline:0 -.5rem;font-size:1rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s]>.t-content{gap:0}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=s]>.t-content>*:last-child{margin-inline-end:-.25rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m]{--%NS%t-height: calc(var(--%NS%tui-height-m) + 2.5 * var(--%NS%t-label) * var(--%NS%tui-font-offset));--%NS%t-padding: var(--%NS%tui-padding-m);--%NS%t-label-font: var(--%NS%tui-typography-ui-xs);--%NS%t-label-y: -.5625rem;--%NS%t-max: .125rem;border-radius:var(--%NS%tui-radius-m);font:var(--%NS%tui-typography-ui-s)}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m][data-icon-start]{--%NS%t-start: calc(2.125rem * (1 + .25 * var(--%NS%t-zoom)))}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m][data-icon-end]{--%NS%t-end: 1.75rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m]:before{margin-inline:-.125rem .75rem}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m]:after{inline-size:calc(1.25rem + 2 * var(--%NS%t-padding));margin-inline-start:calc(.5rem - var(--%NS%t-padding))}tui-textfield:where(*[data-tui-version="5.19.0"])[data-size=m]>.t-content>*:last-child{margin-inline-end:-.125rem}tui-textfield:where(*[data-tui-version="5.19.0"]):is(._disabled,[data-state=disabled]){pointer-events:none;opacity:var(--%NS%tui-disabled-opacity)}tui-textfield:where(*[data-tui-version="5.19.0"]):is(._disabled,[data-state=disabled]) [tuiAppearance]:is(._disabled,:disabled,[data-state=disabled]){opacity:1}tui-textfield:where(*[data-tui-version="5.19.0"]):is(._disabled,[data-state=disabled])>.t-content>tui-icon{display:none}tui-textfield:where(*[data-tui-version="5.19.0"])._with-label{--%NS%t-label: 1}tui-textfield:where(*[data-tui-version="5.19.0"])._with-label>.t-template,tui-textfield:where(*[data-tui-version="5.19.0"])._with-label .t-filler,tui-textfield:where(*[data-tui-version="5.19.0"])._with-label [tuiInput]{inset-block-end:0;padding-block-start:calc(var(--%NS%t-height) / 3);padding-block-end:0}tui-textfield:where(*[data-tui-version="5.19.0"])._with-label:is(:not([data-focus=true]),[data-mode~=readonly])>.t-template::placeholder,tui-textfield:where(*[data-tui-version="5.19.0"])._with-label:is(:not([data-focus=true]),[data-mode~=readonly]) [tuiInput]::placeholder,tui-textfield:where(*[data-tui-version="5.19.0"])._with-label:is(:not([data-focus=true]),[data-mode~=readonly])>.t-template._empty,tui-textfield:where(*[data-tui-version="5.19.0"])._with-label:is(:not([data-focus=true]),[data-mode~=readonly]) [tuiInput]._empty{color:transparent}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template,tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]{position:absolute;inset-inline:0;inline-size:auto;block-size:var(--%NS%t-height);-webkit-appearance:none;appearance:none;background:none;font:inherit;resize:none;outline:none;color:var(--%NS%tui-text-primary);box-sizing:border-box;border-radius:inherit;border-width:0;padding-inline-start:calc(var(--%NS%t-start) + var(--%NS%t-padding));padding-inline-end:calc(var(--%NS%t-end) + var(--%NS%t-side) + var(--%NS%t-padding) + var(--%NS%t-space));white-space:nowrap;overflow:hidden}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template:is(input,textarea):read-only~.t-filler,tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler:is(input,textarea):read-only~.t-filler,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:is(input,textarea):read-only~.t-filler{display:none}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template:disabled,tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler:disabled,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:disabled{animation:tuiPresent 1s infinite;opacity:1}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template[inputmode=none],tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler[inputmode=none],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput][inputmode=none]{caret-color:transparent}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template::-webkit-inner-spin-button,tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler::-webkit-inner-spin-button,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]::-webkit-inner-spin-button,tui-textfield:where(*[data-tui-version="5.19.0"])>.t-template::-webkit-outer-spin-button,tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler::-webkit-outer-spin-button,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]::-webkit-outer-spin-button{-webkit-appearance:none;appearance:none}tui-textfield:where(*[data-tui-version="5.19.0"])._with-template [tuiInput]:first-of-type{color:transparent!important}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:-webkit-autofill [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput][chrome-autofilled] [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:not(._empty,:placeholder-shown) [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"])[multi][multi]:not(._empty) [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:-webkit-autofill:not(tui-textfield)~[tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput][chrome-autofilled]:not(tui-textfield)~[tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:not(._empty,:placeholder-shown):not(tui-textfield)~[tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"])[multi][multi]:not(._empty):not(tui-textfield)~[tuiLabel]{font:var(--%NS%t-label-font);transform:translateY(calc(var(--%NS%t-label-y) - var(--%NS%tui-font-offset) / 2))}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiLabel][tuiLabel][tuiLabel]{transition-property:all;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;position:relative;display:block;max-inline-size:calc(100% - var(--%NS%t-start));flex:1;align-self:flex-start;font:inherit;-webkit-user-select:none;user-select:none;padding:calc(var(--%NS%t-height) / 2 - .625em) 0;line-height:1.25!important;transition-duration:inherit}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiLabel][tuiLabel][tuiLabel]+.t-content{margin-inline-start:0}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]::placeholder,tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]._empty{color:var(--%NS%tui-text-secondary)}tui-textfield:where(*[data-tui-version="5.19.0"]) select option[value=""]:disabled{color:transparent}tui-textfield:where(*[data-tui-version="5.19.0"]) select optgroup,tui-textfield:where(*[data-tui-version="5.19.0"]) select option{background-color:var(--%NS%tui-background-elevation-1)}tui-textfield:where(*[data-tui-version="5.19.0"]) select optgroup,tui-textfield:where(*[data-tui-version="5.19.0"]) select option:not(:disabled){color:var(--%NS%tui-text-primary)}tui-textfield:where(*[data-tui-version="5.19.0"]) button,tui-textfield:where(*[data-tui-version="5.19.0"]) a,tui-textfield:where(*[data-tui-version="5.19.0"]) tui-icon{pointer-events:auto}tui-textfield:where(*[data-tui-version="5.19.0"])>.t-content{z-index:1;display:flex;block-size:var(--%NS%t-height);align-items:center;gap:.25rem;margin-inline-start:auto;isolation:isolate;border-radius:inherit}tui-textfield:where(*[data-tui-version="5.19.0"]) textarea~.t-content{min-inline-size:.5rem}tui-textfield:where(*[data-tui-version="5.19.0"]):is([data-mode~=readonly],[data-state=disabled],._empty) [tuiButtonX],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]._empty~.t-content [tuiButtonX],tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiInput]:disabled~.t-content [tuiButtonX]{display:none}tui-textfield:where(*[data-tui-version="5.19.0"]) .t-filler{pointer-events:none!important;color:var(--%NS%tui-text-tertiary)}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiFluidTypography]{font-weight:700}tui-textfield:where(*[data-tui-version="5.19.0"]) [tuiSelectLike]:not(:read-only){cursor:pointer}tui-textfield:where(*[data-tui-version="5.19.0"]):has(input[type=tel]){direction:ltr}tui-textfield:where(*[data-tui-version="5.19.0"]):is([data-mode~=invalid],.tui-invalid,:invalid):not([data-mode~=readonly],[data-mode~=valid],[data-state=disabled],:disabled,._disabled) [tuiInput]:not(._empty)~[tuiLabel],tui-textfield:where(*[data-tui-version="5.19.0"]):is([data-mode~=invalid],.tui-invalid,:invalid):not([data-mode~=readonly],[data-mode~=valid],[data-state=disabled],:disabled,._disabled)[multi]:not(._empty) [tuiLabel]{color:var(--%NS%tui-text-negative)}tui-textfield:where(*[data-tui-version="5.19.0"]):not([data-mode~=readonly]):focus-visible:not([data-focus=false]) [tuiLabel]{color:var(--%NS%tui-text-primary)!important;font:var(--%NS%t-label-font);transform:translateY(calc(var(--%NS%t-label-y) - var(--%NS%tui-font-offset) / 2))}tui-textfield:where(*[data-tui-version="5.19.0"]):not([data-mode~=readonly])[data-focus=true] [tuiLabel]{color:var(--%NS%tui-text-primary)!important;font:var(--%NS%t-label-font);transform:translateY(calc(var(--%NS%t-label-y) - var(--%NS%tui-font-offset) / 2))}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"]){flex-wrap:nowrap;overflow:scroll;align-items:stretch;cursor:text;max-block-size:calc(var(--%NS%t-vertical) * 2 + var(--%NS%t-item-height) * var(--%NS%t-rows));overscroll-behavior-x:none;scroll-behavior:var(--%NS%tui-scroll-behavior)}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"]):before,tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"]):after{position:sticky;inset-block-start:0;inset-inline-start:0;block-size:10rem;min-block-size:calc(var(--%NS%t-height) * (1 - .2 * var(--%NS%t-zoom)));max-block-size:calc((var(--%NS%t-item-height, calc(var(--%NS%t-height) - 2 * var(--%NS%t-vertical))) + 2 * var(--%NS%t-vertical)) * (1 - .2 * var(--%NS%t-zoom)))}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-scrollbar{transform:translate(calc(var(--%NS%t-padding) * var(--%NS%tui-inline)));margin-inline-start:calc(-1 * var(--%NS%t-start));margin-inline-end:calc(1px - 100% + var(--%NS%t-start))}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-scrollbar .t-bar_horizontal{display:none}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-items{position:sticky;z-index:-1;display:flex;inset-inline-start:var(--%NS%t-start);min-inline-size:0;min-block-size:var(--%NS%t-height);block-size:fit-content;flex:1;align-items:center;flex-wrap:wrap;padding:var(--%NS%t-vertical) 0;transition-duration:inherit;box-sizing:border-box;view-timeline:--t-scrollbar-y y}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-items:after{content:"";min-inline-size:1px;min-block-size:1px}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-items_horizontal{clip-path:inset(0 0 0 calc(var(--%NS%t-start) / 2 - var(--%NS%t-padding) - .5rem));flex-wrap:nowrap}[dir=rtl] tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-items_horizontal{clip-path:inset(0 calc(var(--%NS%t-start) / 2 - var(--%NS%t-padding) - .5rem) 0 0)}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-items_horizontal>.t-input{padding-inline-end:calc(var(--%NS%t-side) + var(--%NS%t-end) + var(--%NS%t-padding) + .25rem)}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-items>.t-input{position:relative;display:flex;align-items:center;flex:1;block-size:var(--%NS%t-item-height, 1.25em);max-block-size:calc(var(--%NS%t-height) - 2 * var(--%NS%t-vertical));max-inline-size:100%;pointer-events:none;transform:translate(var(--%NS%t-scroll))}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-items>.t-input .t-filler,tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-items>.t-input [tuiInput]{inset-block-start:-5%;block-size:110%;padding:0;pointer-events:auto}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-items>.t-input .t-ghost{visibility:hidden;white-space:pre;text-overflow:clip;padding-inline-end:.125rem;block-size:100%}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-items>.t-input .t-filler_hidden{display:none}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])._with-label[data-size=l]{--%NS%t-vertical: .5625rem}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])._with-label[data-size=l] tui-textfield-item:first-of-type{margin-block-start:1.125rem}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])._with-label[data-size=m]{--%NS%t-vertical: .4375rem}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])._with-label[data-size=m] tui-textfield-item:first-of-type{margin-block-start:.875rem}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])._with-label>.t-items{align-items:flex-end}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])._with-label>.t-items>label[tuiLabel]{min-inline-size:100%;margin:calc(var(--%NS%t-height) / 2 - var(--%NS%t-vertical) - .625em) 0;margin-inline-end:-100%;padding:0}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-content{position:sticky;min-block-size:var(--%NS%t-height);block-size:calc(var(--%NS%t-item-height) + 2 * var(--%NS%t-vertical));inset-block-start:0;inset-inline-start:calc(100% - var(--%NS%t-side) - var(--%NS%t-end))}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])>.t-items input:not(:focus)::placeholder,tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-mode~=readonly]>.t-items input::placeholder,tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-mode~=readonly]>.t-items label~.t-input input::placeholder{opacity:0}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])._empty>.t-items input::placeholder,tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-focus=true]:not([data-mode~=readonly]):not(:focus-within)>.t-items input::placeholder{opacity:1}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-state=disabled],tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-mode~=readonly]{pointer-events:none}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-state=disabled] select,tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-mode~=readonly] select{display:none}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-size=l]{--%NS%t-vertical: .625rem}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-size=l]:after{inset-inline-start:calc(100% - var(--%NS%t-end) - var(--%NS%t-padding) + .25rem)}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-size=m]{--%NS%t-vertical: .5rem}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-size=m]:before{inset-inline-start:-.125rem}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-size=m]:after{inset-inline-start:calc(100% - var(--%NS%t-end) - .25rem)}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-size=s]{--%NS%t-vertical: .125rem}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-size=s]:before{inset-inline-start:-.25rem}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])[data-size=s]:after{inset-inline-start:calc(100% - var(--%NS%t-end))}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"]) tui-textfield-item{transform:translate(var(--%NS%t-scroll))}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"]) input::placeholder{transition-property:color;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard)}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"]) select{opacity:0;pointer-events:none!important}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])._empty>.t-items select~.t-filler{display:block}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"])._empty:not([data-focus=true])>.t-items select~.t-filler{color:var(--%NS%tui-text-secondary)}tui-textfield[multi][multi]:where(*[data-tui-version="5.19.0"]):has([tuiSelectLike]){cursor:pointer}
`,
        ],
        encapsulation: 2,
      });
    }
  }
  return t;
})();
export { Qi as n, Nt as t };
