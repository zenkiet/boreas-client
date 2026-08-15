import {
  $r as px,
  $t as Y,
  Bn as eg,
  Br as nr,
  Bt as U0,
  Ci as ue,
  Cn as bX,
  Cr as kx,
  Dn as d1,
  Ei as vA,
  Et as R9,
  Ft as Se,
  H as Ir,
  Hn as fQ,
  Ii as wQ,
  Ir as mo,
  It as T1,
  Ki as yR,
  Kn as fc,
  Kr as ot$1,
  Kt as Vi,
  M as H0,
  Mi as ve,
  Nn as dX,
  Pn as db,
  Pt as SX,
  Qi as ye,
  Qr as pl,
  Rt as Ta,
  Si as ub,
  Sr as kr,
  T as FK,
  Ti as v,
  Ur as oe,
  V as IX,
  Vi as xX,
  Vn as et,
  W as J,
  Wi as xx,
  Wr as og,
  Wt as VE,
  Xt as Wo,
  Yi as ya,
  Yn as g1,
  Yr as pb,
  Zr as pi$1,
  Zt as XX,
  _r as ji,
  a as A9,
  br as k,
  ca as zv,
  ci as rg,
  cr as iJ,
  di as sR,
  dr as ig,
  dt as Na,
  ei as q,
  en as YE,
  er as hQ,
  fi as sg,
  fr as it$1,
  i as A1,
  ia as zQ,
  ii as qX,
  ir as hb,
  it as MX,
  j as H,
  jr as lr,
  jt as Rx,
  k as GQ,
  kr as lb,
  l as Ax,
  ln as Ze,
  mn as _r,
  mr as jC,
  n as $X,
  nn as Yt,
  or as hx,
  pt as O9,
  qn as ff,
  qr as pJ,
  qt as WE,
  ri as qQ,
  sa as zo,
  sn as ZQ,
  t as $Q,
  ti as qE,
  tn as YQ,
  tt as Li,
  u as B0,
  ui as sQ,
  ur as ie,
  ut as NX,
  v as DT,
  vn as ag,
  vr as jn,
  w as FE,
  wt as Qv,
  y as E,
  yi as tr,
  yr as jo,
  yt as PK,
} from './chunk-CD8PwEax.js';
import { d as Z, f as _t$1, h as kt, o as Ot, p as bt, s as Q } from './chunk-bRWS10C8.js';
import {
  E as oe$1,
  T as ei$1,
  d as An,
  f as Cs,
  h as Ln,
  j as vr,
  l as $o,
  m as En,
  p as Ei,
  u as $t$1,
  w as bs,
  x as Yt$1,
  y as Tn,
} from './main-YU6HVKXZ.js';
var _t = class {};
var R = class extends _t {};
var O = class extends _t {};
function qe(t, u, e) {
  return { provide: t, deps: [[new H0(), new U0(), t], e], useFactory: It(u) };
}
function It(t) {
  return (u, e) =>
    u?.find?.((i) => i !== e && i.type === t) || Object.create(e, { type: { value: t } });
}
function Ye(t, u) {
  return qe(R, t, u);
}
function Xe(t, u) {
  return qe(O, t, u);
}
function Je(t) {
  return pb(O, t, !0);
}
var xt = class {};
function ti(t) {
  return pb(xt, t, !0);
}
var tt = class extends k {};
function Zt(t) {
  return pb(tt, t, !0);
}
var ei = (() => {
  class t {
    constructor() {
      ((this.destroyRef = v(J)),
        (this.drivers = d1(v(tt, { self: !0, optional: !0 }) || [])),
        (this.vehicles = d1(v(xt, { self: !0, optional: !0 }) || [])));
    }
    ngAfterViewInit() {
      let e = this.vehicles.find(({ type: i }) => i === this.type);
      ff(...this.drivers.filter(({ type: i }) => i === this.type))
        .pipe(zv(), fc(this.destroyRef))
        .subscribe((i) => {
          e?.toggle(i);
        });
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({ type: t });
    }
  }
  return t;
})();
var $t = (() => {
  class t extends k {
    constructor() {
      let e = v(wQ),
        i = v(Se);
      (super((o) =>
        e
          .pipe(
            _r(null),
            Y(() => {
              let r = this.el.getBoundingClientRect(),
                s = this.el.getAnimations?.() || [],
                m =
                  s.length &&
                  s.every(({ effect: d }) => d?.getComputedTiming().progress !== null) &&
                  s.some((d) => `animationName` in d && d.animationName === `tuiScale`);
              return ((this.rect = (m && this.rect) || r), this.accessor.getPosition(this.rect));
            }),
            A1(i),
            mo(() => this.accessor.getPosition(dX)),
          )
          .subscribe(o),
      ),
        (this.el = qQ()),
        (this.accessor = v(R)));
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
var ii = (() => {
  class t {
    constructor() {
      ((this.isWebkit = v(Ln)), (this.win = v(lr)));
    }
    correct(e) {
      return this.isWebkit
        ? [
            e[0] + (this.win.visualViewport?.offsetLeft ?? 0),
            e[1] + (this.win.visualViewport?.offsetTop ?? 0),
          ]
        : e;
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
    }
  }
  return t;
})();
var oi = (() => {
  class t extends k {
    constructor() {
      (super((e) => this.obscured$.subscribe(e)),
        (this.el = qQ()),
        (this.obscured$ = v(wQ).pipe(
          DT(100, xX()),
          Y(() => zQ(this.el)),
          _r(null),
          zv(),
          NX(),
        )));
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
var it = (() => {
  class t {
    constructor() {
      ((this.activeZone = v(vr, { optional: !0 })),
        (this.obscured$ = v(oi, { self: !0 }).pipe(
          Y((e) => !!e?.every((i) => !this.activeZone?.contains(i))),
        )),
        (this.tuiObscuredEnabled = tr()),
        (this.tuiObscured$ = FK(this.tuiObscuredEnabled).pipe(SX(() => this.obscured$))),
        (this.tuiObscured = PK(this.tuiObscured$)));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [[``, `tuiObscured`, ``]],
        inputs: { tuiObscuredEnabled: [1, `tuiObscuredEnabled`] },
        outputs: { tuiObscured: `tuiObscured` },
        features: [Na([oi])],
      });
    }
  }
  return t;
})();
var di = (t) => ({ $implicit: t });
function li(t, u) {
  if ((t & 1 && (pl(0, `div`, 2), sR(1), eg()), t & 2)) {
    let e = u.polymorpheusOutlet;
    (vA(), ag(` `, e, ` `));
  }
}
var ci = [`tuiDropdownHost`];
var N = (() => {
  class t extends Ze {
    constructor() {
      (super(!1), (this.type = `dropdown`));
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
var pi = (() => {
  class t extends ei {
    constructor() {
      (super(...arguments), (this.type = `dropdown`));
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
      this.ɵdir = ot$1({ type: t, features: [ji] });
    }
  }
  return t;
})();
var Qt = {
  align: `start`,
  direction: null,
  limitWidth: `auto`,
  maxHeight: 400,
  minHeight: 80,
  offset: 4,
  appearance: ``,
};
var A = new E(``, { factory: () => Qt });
var hi = (t) => ({
  provide: A,
  deps: [
    [new U0(), new B0(), fi],
    [new U0(), new H0(), A],
  ],
  useFactory: bs(t, Qt),
});
var fi = (() => {
  class t {
    constructor() {
      ((this.options = v(A, { skipSelf: !0 })),
        (this.align = this.options.align),
        (this.appearance = this.options.appearance),
        (this.direction = this.options.direction),
        (this.limitWidth = this.options.limitWidth),
        (this.minHeight = this.options.minHeight),
        (this.maxHeight = this.options.maxHeight),
        (this.offset = this.options.offset));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [
          [``, `tuiDropdownAlign`, ``],
          [``, `tuiDropdownAppearance`, ``],
          [``, `tuiDropdownDirection`, ``],
          [``, `tuiDropdownLimitWidth`, ``],
          [``, `tuiDropdownMinHeight`, ``],
          [``, `tuiDropdownMaxHeight`, ``],
          [``, `tuiDropdownOffset`, ``],
        ],
        inputs: {
          align: [0, `tuiDropdownAlign`, `align`],
          appearance: [0, `tuiDropdownAppearance`, `appearance`],
          direction: [0, `tuiDropdownDirection`, `direction`],
          limitWidth: [0, `tuiDropdownLimitWidth`, `limitWidth`],
          minHeight: [0, `tuiDropdownMinHeight`, `minHeight`],
          maxHeight: [0, `tuiDropdownMaxHeight`, `maxHeight`],
          offset: [0, `tuiDropdownOffset`, `offset`],
        },
        features: [Na([pb(A, t)])],
      });
    }
  }
  return t;
})();
var ni = (() => {
  class t extends R {
    constructor() {
      (super(...arguments),
        (this.el = qQ()),
        (this.options = v(A)),
        (this.viewport = v(iJ)),
        (this.direction = new ue()),
        (this.type = `dropdown`),
        (this.accessor = It(`dropdown`)(v(O, { self: !0, optional: !0 }), {
          getClientRect: () => this.el.getBoundingClientRect(),
        })),
        (this.tuiDropdownDirectionChange = PK(this.direction.pipe(zv()))));
    }
    getPosition({ width: e, height: i }) {
      !e && !i && (this.previous = void 0);
      let o = this.accessor.getClientRect(),
        r = this.viewport.getClientRect(),
        { minHeight: s, direction: m, offset: d, limitWidth: Ht } = this.options,
        U = this.getAlign(this.options.align),
        p = { top: r.top - d, bottom: r.bottom + d, right: r.right - d, left: r.left + d },
        g = this.previous || m || `bottom`,
        f = { top: o.top - 2 * d - p.top, bottom: p.bottom - o.bottom - 2 * d },
        Rt = Ht === `fixed` ? o.width : e,
        V = Math.max(o.right - Rt, d),
        Et = o.left + e < p.right ? o.left : V,
        E = {
          top: o.top - d - i,
          bottom: o.bottom + d,
          right: Math.max(p.left, V),
          center: o.left + o.width / 2 + e / 2 < p.right ? o.left + o.width / 2 - e / 2 : V,
          left: Math.max(p.left, Et),
        },
        kt = f.top > f.bottom ? `top` : `bottom`;
      return (f[g] > s && m) || f[g] > i
        ? (this.direction.next(g), [E[U], E[g]])
        : ((this.previous = kt), this.direction.next(kt), [E[U], E[kt]]);
    }
    getAlign(e) {
      let i = this.el.matches(`[dir="rtl"] :scope`);
      return i && e === `start`
        ? `right`
        : i && e === `end`
          ? `left`
          : e === `center`
            ? `center`
            : e === `end`
              ? `right`
              : `left`;
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
      this.ɵdir = ot$1({
        type: t,
        outputs: { tuiDropdownDirectionChange: `tuiDropdownDirectionChange` },
        features: [ji],
      });
    }
  }
  return t;
})();
var vi = 16;
var mi = (() => {
  class t {
    constructor() {
      ((this.el = qQ()),
        (this.directive = v(M)),
        (this.accessor = this.directive.accessor),
        (this.viewport = v(iJ)),
        (this.vvs = v(ii)),
        (this.options = v(A)),
        (this.position = this.directive.position),
        (this.styles$ = v($t).pipe(
          Qv(() => this.directive.el.isConnected && this.directive.el.getClientRects().length > 0),
          Y((e) => (this.position === `fixed` ? this.vvs.correct(e) : e)),
          Y((e) => this.getStyles(...e)),
          fc(),
        )));
    }
    ngAfterViewInit() {
      this.styles$.subscribe({
        next: (e) => Object.assign(this.el.style, e),
        complete: () => this.directive.toggle(!1),
      });
    }
    getStyles(e, i) {
      let { maxHeight: o, minHeight: r, offset: s, limitWidth: m } = this.options,
        d = this.el.offsetParent?.getBoundingClientRect() || dX,
        { left: Ht = 0, top: U = 0 } = this.position === `fixed` ? {} : d,
        p = this.accessor.getClientRect(),
        g = this.viewport.getClientRect(),
        f = this.directive.el.currentCSSZoom || 1,
        Rt = p.top - g.top - 2 * s,
        V = g.top + g.height - i - s,
        Et = i > p.bottom ? V : Rt,
        E = this.el.getBoundingClientRect().right <= p.left || e >= p.right ? o : sQ(Et, r, o);
      return (
        (i -= U),
        (e -= Ht),
        {
          position: this.position,
          top: hQ(Math.round(Math.max(i, s - U) / f)),
          left: hQ(Math.round(e / f)),
          maxHeight: hQ(Math.round(E / f)),
          width: m === `fixed` ? hQ(Math.round(p.width / f)) : ``,
          minWidth: m === `min` ? hQ(Math.round(p.width / f)) : ``,
          maxWidth: hQ(Math.round(g.width / f) - vi),
        }
      );
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        features: [
          Na([
            $t,
            Ye(`dropdown`, ni),
            Xe(
              `dropdown`,
              Ir(() => M),
            ),
          ]),
        ],
      });
    }
  }
  return t;
})();
var gi = (() => {
  class t {
    constructor() {
      ((this.options = v(A)),
        (this.directive = v(M)),
        (this.context = v(Di, { optional: !0 })),
        (this.darkMode = v(qX)),
        (this.theme = oe((e = this.darkMode()) =>
          this.directive.el.closest(`[tuiTheme]`)?.getAttribute(`tuiTheme`),
        )),
        (this.close = () => this.directive.toggle(!1)));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [[`tui-dropdown`]],
        hostVars: 2,
        hostBindings: function (i, o) {
          i & 2 && kr(`data-appearance`, o.options.appearance)(`tuiTheme`, o.theme());
        },
        features: [Ta([vr, ei$1, mi])],
        decls: 2,
        vars: 4,
        consts: [
          [1, `t-scroll`],
          [`class`, `t-primitive`, 4, `polymorpheusOutlet`, `polymorpheusOutletContext`],
          [1, `t-primitive`],
        ],
        template: function (i, o) {
          (i & 1 && (pl(0, `tui-scrollbar`, 0), FE(1, li, 2, 1, `div`, 1), eg()),
            i & 2 &&
              (vA(),
              VE(`polymorpheusOutlet`, o.directive.content())(
                `polymorpheusOutletContext`,
                yR(2, di, o.close),
              )));
        },
        dependencies: [Yt$1, $o],
        styles: [
          `[_nghost-%COMP%]{position:absolute;display:flex;box-shadow:var(--%NS%tui-shadow-medium);color:var(--%NS%tui-text-primary);background:var(--%NS%tui-background-elevation-1);border-radius:var(--%NS%tui-radius-m);overflow:hidden;border:1px solid var(--%NS%tui-border-normal);box-sizing:border-box;isolation:isolate;pointer-events:auto;--%NS%tui-from: translateY(-1rem)}[_nghost-%COMP%]:has(tui-data-list[data-size=l]){border-radius:var(--%NS%tui-radius-l)}.tui-enter[_nghost-%COMP%], .tui-leave[_nghost-%COMP%]{animation-name:tuiFade,tuiSlide;animation-duration:calc(var(--%NS%tui-duration) / 2);pointer-events:none}[_nghost-%COMP%]:not([style*=top]){visibility:hidden}.t-scroll[_ngcontent-%COMP%]{flex-grow:1;max-inline-size:calc(100% + 2px);inline-size:max-content;overscroll-behavior:none;margin:-1px}.t-primitive[_ngcontent-%COMP%]{padding:1rem}`,
        ],
        changeDetection: 1,
      });
    }
  }
  return t;
})();
var wi = new E(``, { factory: () => gi });
var Di = new E(``);
var Gt = new E(``);
var yi = (() => {
  class t {
    constructor() {
      ((this.id = fQ()),
        (this.host = v(Gt)),
        (this.dropdown = v(M)),
        (this.tuiDropdownRole = tr(`listbox`)),
        (this.sync = Yt(() => {
          let e = this.dropdown.content(),
            i = this.dropdown.ref(),
            o = this.host.nativeElement;
          (o.setAttribute(`aria-expanded`, String(!!i)),
            o.setAttribute(`aria-controls`, this.id),
            o.setAttribute(`aria-haspopup`, this.tuiDropdownRole()),
            i?.location.nativeElement.setAttribute(`id`, this.id),
            i?.location.nativeElement.setAttribute(`role`, this.tuiDropdownRole()),
            !e &&
              (o.removeAttribute(`aria-expanded`),
              o.removeAttribute(`aria-controls`),
              o.removeAttribute(`aria-haspopup`)));
        })));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [[``, `tuiDropdownA11y`, ``]],
        inputs: { tuiDropdownRole: [1, `tuiDropdownRole`] },
      });
    }
  }
  return t;
})();
var M = (() => {
  class t {
    constructor() {
      ((this.injector = v(pi$1)),
        (this.refresh$ = new ue()),
        (this.service = v(En)),
        (this.cdr = v(nr)),
        (this.drivers = d1(v(N, { self: !0, optional: !0 }))),
        (this.sub = this.refresh$.pipe(DT(0, xX()), fc()).subscribe(() => {
          (this.ref()?.changeDetectorRef.detectChanges(),
            this.ref()?.changeDetectorRef.markForCheck());
        })),
        (this.autoClose = Yt(() => {
          this.content() || this.toggle(!1);
        })),
        (this.ref = H(null)),
        (this.el = qQ()),
        (this.type = `dropdown`),
        (this.component = new oe$1(v(wi), v(pi$1))),
        (this.content = tr(null, {
          alias: `tuiDropdown`,
          transform: (e) => (e instanceof jo ? new $t$1(e, this.cdr) : e),
        })));
    }
    get accessor() {
      let e = this.injector.get(O, null, { self: !0 });
      return It(`dropdown`)(e, this);
    }
    get position() {
      return Tn(this.el) ? `fixed` : `absolute`;
    }
    ngAfterViewChecked() {
      this.ref() && this.refresh$.next();
    }
    ngOnDestroy() {
      this.toggle(!1);
    }
    getClientRect() {
      return this.el.getBoundingClientRect();
    }
    toggle(e) {
      let i = this.ref();
      (e && this.content() && !i
        ? this.ref.set(this.service.add(this.component))
        : !e && i && (this.ref.set(null), i.destroy()),
        this.drivers.forEach((o) => o?.next(e)));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [[``, `tuiDropdown`, ``, 5, `ng-container`, 5, `ng-template`]],
        hostVars: 2,
        hostBindings: function (i, o) {
          i & 2 && sg(`tui-dropdown-open`, o.ref());
        },
        inputs: { content: [1, `tuiDropdown`, `content`] },
        exportAs: [`tuiDropdown`],
        features: [
          Na([ti(t), pb(Gt, it$1)]),
          Ta([
            pi,
            { directive: yi, inputs: [`tuiDropdownRole`, `tuiDropdownRole`] },
            {
              directive: ni,
              outputs: [`tuiDropdownDirectionChange`, `tuiDropdownDirectionChange`],
            },
          ]),
        ],
      });
    }
  }
  return t;
})();
var bi = (() => {
  class t {
    constructor() {
      ((this.el = qQ()),
        (this.ref = v(M).ref),
        (this.open = v(ri)),
        (this.obscured = v(it)),
        (this.activeZone = v(vr)),
        (this.tuiDropdownClose = PK(
          ff(
            v(N).pipe(
              SX(() =>
                ff(
                  IX(),
                  this.obscured.tuiObscured$.pipe(et(Boolean)),
                  this.activeZone.tuiActiveZoneChange.pipe(et((e) => !e)),
                  T1(this.el, `focusin`).pipe(
                    et((e) => !this.open.nativeElement.contains(GQ(e)) || !this.ref()),
                  ),
                ),
              ),
            ),
            typeof CloseWatcher > `u`
              ? T1(v(ie), `keydown`, { capture: !0 }).pipe(
                  et(
                    ({ key: e }) =>
                      e === `Escape` &&
                      this.open.open() &&
                      !this.ref()?.location.nativeElement?.nextElementSibling,
                  ),
                  bX(),
                )
              : ye,
          ),
        )));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({ type: t, outputs: { tuiDropdownClose: `tuiDropdownClose` } });
    }
  }
  return t;
})();
var ri = (() => {
  class t {
    constructor() {
      ((this.dropdownHost = R9(`tuiDropdownHost`, { descendants: !0, read: it$1 })),
        (this.directive = v(M)),
        (this.el = qQ()),
        (this.obscured = v(it)),
        (this.driver = v(N)),
        (this.dropdown = oe(() => this.directive.ref()?.location.nativeElement)),
        (this.enabled = tr(!0, { alias: `tuiDropdownEnabled` })),
        (this.open = A9(!1, { alias: `tuiDropdownOpen` })),
        (this.driveEffect = Yt(() => this.drive(this.open()))),
        (this.syncSub = this.driver
          .pipe(
            et((e) => e !== this.open()),
            fc(),
          )
          .subscribe((e) => this.update(e))),
        (this.keydownSub = T1(v(ie), `keydown`)
          .pipe(fc())
          .subscribe((e) => this.onKeydown(e))));
    }
    get nativeElement() {
      let e = this.dropdownHost()?.nativeElement || this.el,
        i = Q(e) ? e : _t$1({ initial: e, root: this.el });
      return this.dropdownHost()?.nativeElement || i || this.el;
    }
    toggle(e) {
      (this.focused && !e && this.nativeElement.focus({ preventScroll: !0 }), this.update(e));
    }
    onClick(e) {
      !this.editable && this.nativeElement.contains(e) && this.update(!this.open());
    }
    onArrow(e, i) {
      !$Q(e.target) ||
        !this.nativeElement.contains(e.target) ||
        !this.enabled() ||
        !this.directive.content() ||
        (e.preventDefault(), this.focusDropdown(i));
    }
    get editable() {
      return YQ(this.nativeElement);
    }
    get focused() {
      return Ot(this.nativeElement) || Ot(this.dropdown());
    }
    onKeydown(e) {
      let i = GQ(e);
      !e.defaultPrevented &&
        Cs(e.key) &&
        this.editable &&
        this.focused &&
        g1(i) &&
        !YQ(i) &&
        this.nativeElement.focus({ preventScroll: !0 });
    }
    update(e) {
      if (e && !this.enabled()) return this.drive();
      (this.open.set(e), this.drive());
    }
    drive(e = this.open() && this.enabled()) {
      (lb(this.obscured.tuiObscuredEnabled, e), this.driver.next(e));
    }
    focusDropdown(e) {
      let i = this.dropdown();
      if (!i) {
        this.update(!0);
        return;
      }
      let o = this.el.ownerDocument,
        r = i.appendChild(o.createElement(`div`)),
        m = _t$1({ initial: e ? r : i, previous: e, root: i });
      (r.remove(), m?.focus());
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [
          [``, `tuiDropdown`, ``, `tuiDropdownAuto`, ``],
          [``, `tuiDropdown`, ``, `tuiDropdownOpen`, ``],
          [``, `tuiDropdown`, ``, `tuiDropdownOpenChange`, ``],
        ],
        contentQueries: function (i, o, r) {
          (i & 1 && YE(r, o.dropdownHost, ci, 5, it$1), i & 2 && kx());
        },
        hostBindings: function (i, o) {
          i & 1 &&
            zo(`click`, function (s) {
              return o.onClick(s.target);
            })(`keydown.arrowDown`, function (s) {
              return o.onArrow(s, !1);
            })(`keydown.arrowUp`, function (s) {
              return o.onArrow(s, !0);
            })(`tuiActiveZoneChange`, function () {
              return 0;
            })(`tuiDropdownClose`, function () {
              return o.toggle(!1);
            });
        },
        inputs: {
          enabled: [1, `tuiDropdownEnabled`, `enabled`],
          open: [1, `tuiDropdownOpen`, `open`],
        },
        outputs: { open: `tuiDropdownOpenChange` },
        features: [
          Na([N, Zt(N), pb(Gt, t)]),
          Ta([
            it,
            { directive: bi, outputs: [`tuiDropdownClose`, `tuiDropdownClose`] },
            {
              directive: vr,
              inputs: [`tuiActiveZoneParent`, `tuiActiveZoneParent`],
              outputs: [`tuiActiveZoneChange`, `tuiActiveZoneChange`],
            },
          ]),
        ],
      });
    }
  }
  return t;
})();
var rn = (() => {
    class t extends O {
      constructor() {
        (super(...arguments),
          (this.isTouch = v(An)),
          (this.currentRect = dX),
          (this.userSelect = oe(() => (this.isTouch() ? `none` : null))),
          (this.activeZone = v(vr)),
          (this.driver = v(N)),
          (this.doc = v(ie)),
          (this.sub = ff(
            T1(this.doc, `pointerdown`),
            T1(this.doc, `keydown`).pipe(et(({ key: e }) => e === `Escape`)),
            T1(this.doc, `contextmenu`, { capture: !0 }),
          )
            .pipe(
              et((e) => this.driver.value && !this.activeZone.contains(GQ(e))),
              NX(),
              fc(),
            )
            .subscribe(() => {
              (this.driver.next(!1), (this.currentRect = dX));
            })),
          (this.type = `dropdown`));
      }
      getClientRect() {
        return this.currentRect;
      }
      onContextMenu(e, i) {
        ((this.currentRect = ZQ(e, i)), this.driver.next(!0));
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
        this.ɵdir = ot$1({
          type: t,
          selectors: [[``, `tuiDropdownContext`, ``]],
          hostVars: 6,
          hostBindings: function (i, o) {
            (i & 1 &&
              zo(`longtap`, function (s) {
                return o.onContextMenu(s.detail.clientX, s.detail.clientY);
              }),
              i & 2 &&
                Wo(`-webkit-touch-callout`, o.userSelect())(`-webkit-user-select`, o.userSelect())(
                  `user-select`,
                  o.userSelect(),
                ));
          },
          features: [Na([vr, N, Zt(N), Je(t)]), ji],
        });
      }
    }
    return t;
  })(),
  [sn, an] = hb({ showDelay: 200, hideDelay: 500 });
var un = (() => {
  class t {
    constructor() {
      bs({ limitWidth: `fixed` }, Qt)(v(A, { self: !0, optional: !0 }), null);
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({ type: t, features: [Na([hi({})])] });
    }
  }
  return t;
})();
var dn = (() => {
  class t {
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        features: [
          Ta([
            {
              directive: ri,
              inputs: [`tuiDropdownOpen`, `open`, `tuiDropdownEnabled`, `tuiDropdownEnabled`],
              outputs: [`tuiDropdownOpenChange`, `openChange`],
            },
          ]),
        ],
      });
    }
  }
  return t;
})();
var [Ti, si] = hb({ height: `normal`, size: `l` }),
  Si = (() => {
    class t {
      static {
        this.ɵfac = function (i) {
          return new (i || t)();
        };
      }
      static {
        this.ɵcmp = Vi({
          type: t,
          selectors: [[`ng-component`]],
          exportAs: [`tui-cell-5.19.0`],
          decls: 0,
          vars: 0,
          template: function (i, o) {},
          styles: [
            `[tuiCell]:where(*[data-tui-version="5.19.0"]){--%NS%t-pad: .125rem 1rem;--%NS%t-radius: var(--%NS%tui-radius-s);transition-property:background;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard);-webkit-appearance:none;appearance:none;padding:0;border:0;background:none;font:inherit;line-height:inherit;text-decoration:none;position:relative;display:flex;align-items:center;text-align:start;box-sizing:content-box;isolation:isolate;color:var(--%NS%tui-text-primary);padding:var(--%NS%t-pad);min-block-size:var(--%NS%t-block-size);border-radius:var(--%NS%t-radius)}[tuiCell]:where(*[data-tui-version="5.19.0"]):is(button,label):not(:disabled):active{background:var(--%NS%tui-background-neutral-1)}[tuiCell]:where(*[data-tui-version="5.19.0"]):disabled,[tuiCell]:where(*[data-tui-version="5.19.0"])[data-state=disabled]{opacity:initial;pointer-events:none}[tuiCell]:where(*[data-tui-version="5.19.0"]):disabled>*:not([tuiTooltip]),[tuiCell]:where(*[data-tui-version="5.19.0"])[data-state=disabled]>*:not([tuiTooltip]){opacity:var(--%NS%tui-disabled-opacity)}[tuiCell]:where(*[data-tui-version="5.19.0"]):is(label):has(input:disabled){opacity:initial;pointer-events:none}[tuiCell]:where(*[data-tui-version="5.19.0"]):is(label):has(input:disabled)>*:not([tuiTooltip]){opacity:var(--%NS%tui-disabled-opacity)}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiAccessories]{position:relative;display:flex;max-block-size:var(--%NS%t-block-size);align-items:center;align-self:stretch;margin-inline-start:auto}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiCellActions][tuiCellActions]{position:absolute;z-index:1;inset-inline-end:0;padding-inline-end:inherit;--%NS%t-group-mask: none;--%NS%t-group-mask-end: none;--%NS%t-group-mask-start: none}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiCellActions][tuiCellActions]~*{transition-property:opacity;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard)}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiCellActions][tuiCellActions] button,[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiCellActions][tuiCellActions] a{transition-property:opacity;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard);opacity:0}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiCellActions][tuiCellActions] button:focus-visible,[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiCellActions][tuiCellActions] a:focus-visible{opacity:1}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiSubtitle]{display:flex;align-items:center;gap:.25rem;color:var(--%NS%tui-text-secondary)}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiTitle]{flex:3 7 30%;align-items:normal;text-align:start;gap:.25rem .5rem}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiTitle] [tuiTitle]{flex-direction:row;justify-content:space-between}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiTitle] [tuiTitle]~[tuiSubtitle]>[tuiFade]:first-child,[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiTitle] [tuiTitle]>[tuiFade]:first-child,[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiTitle] [tuiTitle]~[tuiSubtitle]>[tuiFade]:last-child,[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiTitle] [tuiTitle]>[tuiFade]:last-child{flex:3 7 30%;max-inline-size:max-content;white-space:nowrap}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiTitle] [tuiTitle]~[tuiSubtitle]>[tuiFade]:last-child,[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiTitle] [tuiTitle]>[tuiFade]:last-child{flex:7 3 70%}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiTitle] [tuiTitle]~[tuiSubtitle]{justify-content:space-between}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiTitle]~[tuiTitle]{flex:7 3 70%;max-inline-size:max-content;margin-inline-start:auto;text-align:end;align-items:flex-end}[tuiCell]:where(*[data-tui-version="5.19.0"]) [tuiTitle]~[tuiTitle][tuiFade]{align-items:flex-start}[tuiCell]:where(*[data-tui-version="5.19.0"]) tui-badge-notification[data-size=xs]{position:absolute;top:50%;transform:translateY(-50%);inset-inline-start:.375rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=s]{--%NS%t-block-size: calc(var(--%NS%tui-height-s) - .125rem);--%NS%t-pad: .1875rem 1rem;gap:.5rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=s][data-height=spacious]{--%NS%t-pad: .4375rem 1rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=s][data-height=compact]{--%NS%t-block-size: calc(var(--%NS%tui-height-s) - .25rem);--%NS%t-pad: 0 1rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=s] [tuiTitle]{max-block-size:100%;font:var(--%NS%tui-typography-ui-s);gap:0}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=s] [tuiSubtitle]{font:var(--%NS%tui-typography-ui-2xs)}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=s] [tuiAvatar]{--%NS%t-size: 1.5rem;--%NS%t-radius: var(--%NS%tui-radius-m);font:var(--%NS%tui-typography-body-m);font-size:.5625rem;margin:.1875rem 0}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=m]{--%NS%t-block-size: calc(var(--%NS%tui-height-m) - .75rem);--%NS%t-pad: .375rem 1rem;gap:.5rem .75rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=m][data-height=spacious]{--%NS%t-pad: 1rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=m][data-height=compact]{--%NS%t-block-size: calc(var(--%NS%tui-height-m) - .5rem);--%NS%t-pad: 0 1rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=m] [tuiTitle]{font:var(--%NS%tui-typography-ui-s);gap:.0625rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=m] [tuiSubtitle]{font:var(--%NS%tui-typography-ui-xs)}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=m] [tuiAvatar]{--%NS%t-size: 2rem;--%NS%t-radius: var(--%NS%tui-radius-m);align-self:flex-start}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=l]{--%NS%t-block-size: calc(var(--%NS%tui-height-l) - 1rem);--%NS%t-pad: .5rem 1rem;--%NS%t-radius: var(--%NS%tui-radius-l);gap:.5rem 1rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=l][data-height=spacious]{--%NS%t-pad: 1.25rem 1rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=l][data-height=compact]{--%NS%t-block-size: calc(var(--%NS%tui-height-l) - 1rem);--%NS%t-pad: 0 1rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[data-size=l] [tuiAvatar]{--%NS%t-size: 2.5rem;font:var(--%NS%tui-typography-body-m);font-weight:700;align-self:flex-start}[tuiCell]:where(*[data-tui-version="5.19.0"]):hover [tuiCellActions]~*{opacity:0}[tuiCell]:where(*[data-tui-version="5.19.0"]):hover [tuiCellActions] button,[tuiCell]:where(*[data-tui-version="5.19.0"]):hover [tuiCellActions] a,[tuiCell]:where(*[data-tui-version="5.19.0"]):hover [tuiCellActions] label{opacity:1}[tuiCell]:where(*[data-tui-version="5.19.0"]):focus-visible{outline:.125rem solid var(--%NS%tui-border-focus);outline-offset:-.125rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[tuiCellStretch]{inline-size:100%;margin-inline:-1rem}[tuiCell]:where(*[data-tui-version="5.19.0"])[tuiCellResponsive]{display:grid;grid-auto-flow:column;grid-auto-columns:fit-content(100%);grid-template-columns:auto 1fr}[tuiCell]:where(*[data-tui-version="5.19.0"])[tuiCellResponsive]:has(>[tuiTitle]:first-child){grid-template-columns:1fr}[tuiCell]:where(*[data-tui-version="5.19.0"])[tuiCellResponsive]>*{grid-row:1}[tuiCell]:where(*[data-tui-version="5.19.0"])[tuiCellResponsive]._rearranged [tuiAccessories]{grid-row:2}[tuiCell]:where(*[data-tui-version="5.19.0"])[tuiCellResponsive]._rearranged [tuiTitle] [tuiTitle],[tuiCell]:where(*[data-tui-version="5.19.0"])[tuiCellResponsive]._rearranged [tuiTitle] [tuiSubtitle]{display:grid}@media(hover:hover)and (pointer:fine){a[tuiCell]:where(*[data-tui-version="5.19.0"]):hover:not(:disabled,[data-state=disabled]),button[tuiCell]:where(*[data-tui-version="5.19.0"]):hover:not(:disabled,[data-state=disabled]),label[tuiCell]:where(*[data-tui-version="5.19.0"]):hover:not(:disabled,[data-state=disabled]){background:var(--%NS%tui-background-neutral-1);cursor:pointer}label[tuiCell]:where(*[data-tui-version="5.19.0"]):hover:not(:has(input:disabled)){background:var(--%NS%tui-background-neutral-1);cursor:pointer}}
`,
          ],
          encapsulation: 2,
        });
      }
    }
    return t;
  })(),
  Ft = (() => {
    class t {
      constructor() {
        ((this.nothing = db(Si)),
          (this.options = v(Ti)),
          (this.size = tr(this.options.size, { alias: `tuiCell` })),
          (this.height = tr(this.options.height, { alias: `tuiCellHeight` })));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || t)();
        };
      }
      static {
        this.ɵdir = ot$1({
          type: t,
          selectors: [[``, `tuiCell`, ``, 5, `ng-template`]],
          hostAttrs: [`data-tui-version`, `5.19.0`, `tuiCell`, ``],
          hostVars: 2,
          hostBindings: function (i, o) {
            i & 2 && kr(`data-height`, o.height())(`data-size`, o.size() || o.options.size || `l`);
          },
          inputs: { size: [1, `tuiCell`, `size`], height: [1, `tuiCellHeight`, `height`] },
          features: [Na([bt({ size: `s` })])],
        });
      }
    }
    return t;
  })();
var Ni = [`*`];
function Ai(t, u) {
  if ((t & 1 && (rg(0), sR(1), ig()), t & 2)) {
    let e = u.polymorpheusOutlet;
    (vA(), ag(` `, e, ` `));
  }
}
function Mi(t, u) {
  if ((t & 1 && (pl(0, `span`, 0), FE(1, Ai, 2, 1, `ng-container`, 1), eg()), t & 2)) {
    let e = Ax();
    (vA(), VE(`polymorpheusOutlet`, e.emptyContent() || e.fallback()));
  }
}
var Kt = new E(``);
function zn(t) {
  return pb(Kt, t);
}
var _i = new E(``);
function xi() {
  let t = [`s`, `m`, `l`],
    u = v(_i, { optional: !0 }) || v(Kt, { optional: !0 })?.size;
  return u && t.includes(u) ? u : `l`;
}
var ot = new E(``);
var Ii = (() => {
  class t {
    constructor() {
      ((this.local = null), (this.global = v(ot, { optional: !0 })));
    }
    get content() {
      return this.global ?? this.local;
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        contentQueries: function (i, o, r) {
          if ((i & 1 && og(r, ot, 5), i & 2)) {
            let s;
            WE((s = qE())) && (o.local = s.first);
          }
        },
      });
    }
  }
  return t;
})();
var Fi = (() => {
  class t {
    constructor() {
      ((this.vcr = v(Li)),
        (this.content = v(ot, { optional: !0 })),
        (this.ref =
          this.content &&
          jC(this.content, {
            environmentInjector: v(ve),
            elementInjector: v(pi$1),
            hostElement: qQ(),
          })),
        this.ref &&
          (this.vcr.insert(this.ref.hostView), this.ref.changeDetectorRef.detectChanges()));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({ type: t });
    }
  }
  return t;
})();
var ai = (() => {
  class t {
    constructor() {
      ((this.host = v(Kt, { optional: !0 })), (this.disabled = tr(!1)), (this.value = tr()));
    }
    onClick(e = this.value()) {
      e !== void 0 && this.host?.handleOption?.(e);
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [
          [`button`, `tuiOption`, ``, `value`, ``],
          [`a`, `tuiOption`, ``, `value`, ``],
          [`label`, `tuiOption`, ``, `value`, ``],
        ],
        hostBindings: function (i, o) {
          i & 1 &&
            zo(`click`, function () {
              return o.onClick();
            });
        },
        inputs: { disabled: [1, `disabled`], value: [1, `value`] },
        features: [Ta([Fi])],
      });
    }
  }
  return t;
})();
var Hi = (() => {
  class t {
    constructor() {
      ((this.ngZone = v(Se)),
        (this.destroyRef = v(J)),
        (this.el = qQ()),
        (this.cdr = v(nr)),
        (this.optionsQuery = O9(
          Ir(() => ai),
          { descendants: !0 },
        )),
        (this.fallback = v(XX)),
        (this.empty = H(!1)),
        (this.emptyContent = tr()),
        (this.size = tr(xi())),
        (this.options = oe(() =>
          this.optionsQuery()
            .map(({ value: e }) => e())
            .filter(ub),
        )));
    }
    onKeyDownArrow(e, i) {
      let { elements: o } = this;
      kt(o.indexOf(e), o, i);
    }
    handleFocusLossIfNecessary(e = this.el) {
      Ot(e) && this.origin?.focus({ preventScroll: !0 });
    }
    ngAfterContentChecked() {
      jn(0)
        .pipe(A1(this.ngZone), MX(this.destroyRef))
        .subscribe(() => {
          (this.empty.set(!this.elements.length), this.cdr.detectChanges());
        });
    }
    get role() {
      return this.el.parentElement?.closest(`[role="menu"],[role="listbox"]`) ? null : this.el.role;
    }
    onFocusIn(e, i) {
      !i.contains(e) && !this.origin && (this.origin = e);
    }
    get elements() {
      return Array.from(this.el.querySelectorAll(`[tuiOption]:not(.t-empty)`));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [[`tui-data-list`]],
        contentQueries: function (i, o, r) {
          (i & 1 && YE(r, o.optionsQuery, ai, 5), i & 2 && kx());
        },
        hostAttrs: [`data-tui-version`, `5.19.0`, `role`, `listbox`],
        hostVars: 2,
        hostBindings: function (i, o) {
          (i & 1 &&
            zo(`focusin`, function (s) {
              return o.onFocusIn(s.relatedTarget, s.currentTarget);
            })(`keydown.arrowDown.prevent`, function (s) {
              return o.onKeyDownArrow(s.target, 1);
            })(`keydown.arrowUp.prevent`, function (s) {
              return o.onKeyDownArrow(s.target, -1);
            })(`keydown.shift.tab`, function () {
              return o.handleFocusLossIfNecessary();
            })(`keydown.tab`, function () {
              return o.handleFocusLossIfNecessary();
            })(`mousedown.prevent`, function () {
              return 0;
            })(`mouseleave`, function (s) {
              return o.handleFocusLossIfNecessary(s.target);
            })(`wheel.zoneless.passive`, function () {
              return o.handleFocusLossIfNecessary();
            }),
            i & 2 && kr(`data-size`, o.size())(`role`, o.role));
        },
        inputs: { emptyContent: [1, `emptyContent`], size: [1, `size`] },
        features: [
          Na([
            si(() => ({ size: v(t).size() })),
            $X(t),
            {
              provide: ot,
              useFactory: () =>
                v(Ii, { optional: !0 })?.content ?? v(ot, { skipSelf: !0, optional: !0 }),
            },
          ]),
        ],
        ngContentSelectors: Ni,
        decls: 2,
        vars: 1,
        consts: [
          [`tuiCell`, ``, `tuiOption`, ``, 1, `t-empty`],
          [4, `polymorpheusOutlet`],
        ],
        template: function (i, o) {
          (i & 1 && (xx(), Rx(0), hx(1, Mi, 2, 1, `span`, 0)),
            i & 2 && (vA(), px(o.empty() ? 1 : -1)));
        },
        dependencies: [Yt$1, Ft],
        styles: [
          `tui-data-list:where(*[data-tui-version="5.19.0"]){display:flex;flex-direction:column;padding:.25rem}tui-data-list:where(*[data-tui-version="5.19.0"]):focus-within [tuiOption]._with-dropdown:not(:focus){background:transparent}tui-data-list:where(*[data-tui-version="5.19.0"])[data-size=s] [tuiOption]{min-block-size:0;font:var(--%NS%tui-typography-ui-s);padding:.375rem}tui-data-list:where(*[data-tui-version="5.19.0"])[data-size=s] [tuiOption]:before,tui-data-list:where(*[data-tui-version="5.19.0"])[data-size=s] [tuiOption]:after{font-size:1rem}tui-data-list:where(*[data-tui-version="5.19.0"])[data-size=m] [tuiOption]{min-block-size:2.25rem;font:var(--%NS%tui-typography-ui-s);padding:.5rem .375rem}tui-data-list:where(*[data-tui-version="5.19.0"])[data-size=l]{gap:.125rem;padding:.5rem}tui-data-list:where(*[data-tui-version="5.19.0"])[data-size=l] [tuiOption]{font:var(--%NS%tui-typography-ui-m);padding-inline:.5rem}tui-data-list:where(*[data-tui-version="5.19.0"])[data-size=l] hr{block-size:1rem;border-inline-width:.5rem}tui-data-list:where(*[data-tui-version="5.19.0"]) [tuiOption]{transition-property:background;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard);box-sizing:border-box;border-radius:var(--%NS%tui-radius-s);outline:none!important;cursor:pointer;word-break:break-word;text-transform:inherit}tui-data-list:where(*[data-tui-version="5.19.0"]) [tuiOption]:disabled{opacity:var(--%NS%tui-disabled-opacity);cursor:default}@media(hover:hover)and (pointer:fine){tui-data-list:where(*[data-tui-version="5.19.0"]) [tuiOption]:hover:not(:disabled){background:var(--%NS%tui-background-neutral-1)}}tui-data-list:where(*[data-tui-version="5.19.0"]) [tuiOption]:active:not(:disabled),tui-data-list:where(*[data-tui-version="5.19.0"]) [tuiOption]:focus-within,tui-data-list:where(*[data-tui-version="5.19.0"]) [tuiOption]._with-dropdown{background:var(--%NS%tui-background-neutral-1)}tui-data-list:where(*[data-tui-version="5.19.0"]) [tuiOption]:after{margin-inline-start:auto}tui-data-list:where(*[data-tui-version="5.19.0"])>.t-empty{pointer-events:none;color:var(--%NS%tui-text-tertiary)}tui-data-list:where(*[data-tui-version="5.19.0"]) hr{position:relative;margin:0;block-size:.75rem;border:.375rem solid transparent;border-block:0}tui-data-list:where(*[data-tui-version="5.19.0"]) hr+hr,tui-data-list:where(*[data-tui-version="5.19.0"]) hr:first-child,tui-data-list:where(*[data-tui-version="5.19.0"]) hr:last-child{display:none}tui-data-list:where(*[data-tui-version="5.19.0"]) hr:before{position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%);content:"";block-size:1px;inline-size:100%;background:var(--%NS%tui-border-normal)}tui-opt-group:where(*[data-tui-version="5.19.0"]){position:relative;display:flex;font-weight:700!important;gap:inherit;color:var(--%NS%tui-text-primary);flex-direction:column}tui-data-list[data-size=s] tui-opt-group:where(*[data-tui-version="5.19.0"]){font:var(--%NS%tui-typography-body-s)}tui-data-list[data-size=s] tui-opt-group:where(*[data-tui-version="5.19.0"]):before{padding:.1875rem .375rem}tui-data-list[data-size=m] tui-opt-group:where(*[data-tui-version="5.19.0"]){font:var(--%NS%tui-typography-ui-m)}tui-data-list[data-size=m] tui-opt-group:where(*[data-tui-version="5.19.0"]):before{padding:.375rem}tui-data-list[data-size=l] tui-opt-group:where(*[data-tui-version="5.19.0"]){font:var(--%NS%tui-typography-ui-l)}tui-data-list[data-size=l] tui-opt-group:where(*[data-tui-version="5.19.0"]):before{padding:.5rem}tui-opt-group:where(*[data-tui-version="5.19.0"]):empty:before,tui-opt-group:where(*[data-tui-version="5.19.0"])[data-label=""]:before{display:none}tui-opt-group:where(*[data-tui-version="5.19.0"]):before{content:attr(data-label);word-break:break-word}tui-sheet-dialog tui-opt-group:where(*[data-tui-version="5.19.0"]):before{font:var(--%NS%tui-typography-heading-h6);padding:.5rem 0!important}
`,
        ],
        encapsulation: 2,
      });
    }
  }
  return t;
})();
var Pn = (() => {
  class t {
    constructor() {
      this.label = tr();
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [[`tui-opt-group`]],
        hostAttrs: [`data-tui-version`, `5.19.0`, `role`, `group`],
        hostVars: 1,
        hostBindings: function (i, o) {
          i & 2 && kr(`data-label`, o.label() || ``);
        },
        inputs: { label: [1, `label`] },
      });
    }
  }
  return t;
})();
var Bn = (() => {
  class t {
    constructor() {
      ((this.isMobile = v(Ei)),
        (this.el = qQ()),
        (this.datalist = v(
          Ir(() => Hi),
          { optional: !0 },
        )),
        (this.dropdown = v(M, { self: !0, optional: !0 })?.ref),
        (this.disabled = tr(!1)));
    }
    ngOnDestroy() {
      this.datalist?.handleFocusLossIfNecessary(this.el);
    }
    onMouseMove() {
      !this.isMobile &&
        !Z(this.el) &&
        this.datalist &&
        this.el.closest(`[tuiDataListDropdownManager]`) &&
        this.el.focus({ preventScroll: !0 });
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [
          [`button`, `tuiOption`, ``],
          [`a`, `tuiOption`, ``],
          [`label`, `tuiOption`, ``],
        ],
        hostAttrs: [`role`, `option`, `type`, `button`],
        hostVars: 3,
        hostBindings: function (i, o) {
          (i & 1 &&
            zo(`mousemove.zoneless`, function () {
              return o.onMouseMove();
            }),
            i & 2 &&
              (kr(`disabled`, o.disabled() || null),
              sg(`_with-dropdown`, o.dropdown == null ? null : o.dropdown())));
        },
        inputs: { disabled: [1, `disabled`] },
        features: [Ta([pJ, Ft])],
      });
    }
  }
  return t;
})();
export {
  tt as C,
  ti as S,
  zn as T,
  dn as _,
  Ii as a,
  ri as b,
  Kt as c,
  O as d,
  Pn as f,
  Zt as g,
  Ye as h,
  Hi as i,
  M as l,
  Xe as m,
  Bn as n,
  It as o,
  R as p,
  Ft as r,
  Je as s,
  $t as t,
  N as u,
  ei as v,
  un as w,
  rn as x,
  ii as y,
};
