import {
  $ as LI,
  $t as Y,
  An as dQ,
  Fr as mn,
  Gn as fX,
  Kr as ot,
  Kt as Vi,
  Oi as vQ,
  Pn as db,
  Rt as Ta,
  Sr as kr,
  Ti as v,
  Ui as xs,
  Ur as oe,
  Yn as g1,
  Yr as pb,
  dt as Na,
  ei as q$1,
  g as Ca,
  ir as hb,
  j as H$1,
  ji as vX,
  qn as ff,
  qr as pJ,
  ri as qQ,
  rr as hX,
  s as AX,
  ur as ie,
  y as E,
  yi as tr,
} from './chunk-CD8PwEax.js';
var k = (() => {
  class t {
    constructor() {
      let e = qQ();
      Ca(() => requestAnimationFrame(() => e.style.setProperty(`transition`, ``)));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        selectors: [[``, `tuiTransitioned`, ``]],
        hostAttrs: [2, `transition`, `none`],
      });
    }
  }
  return t;
})();
var q = { appearance: `` };
var P = new E(``, { factory: () => q });
function R(t) {
  return pb(P, t);
}
var X = (() => {
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
        exportAs: [`tui-appearance-5.19.0`],
        decls: 0,
        vars: 0,
        template: function (i, n) {},
        styles: [
          `[tuiAppearance]:where(*[data-tui-version="5.19.0"]){transition-property:all;transition-duration:calc(var(--%NS%tui-duration) / 2);transition-timing-function:var(--%NS%tui-curve-productive-standard);position:relative;-webkit-appearance:none;appearance:none;outline:.125rem solid transparent;outline-offset:-.125rem;transition-property:color,background-color,opacity,box-shadow,border-color,border-radius}[tuiAppearance]:where(*[data-tui-version="5.19.0"]):before,[tuiAppearance]:where(*[data-tui-version="5.19.0"]):after{transition-property:none;transition-duration:inherit;transition-timing-function:ease-in-out}[tuiAppearance]:where(*[data-tui-version="5.19.0"]):focus-visible:not([data-focus=false]){outline-color:var(--%NS%tui-border-focus)}[tuiAppearance]:where(*[data-tui-version="5.19.0"])[data-focus=true]{outline-color:var(--%NS%tui-border-focus)}[tuiAppearance]:where(*[data-tui-version="5.19.0"]):disabled:not([data-state]),[tuiAppearance]:where(*[data-tui-version="5.19.0"])[data-state=disabled]{cursor:initial;opacity:var(--%NS%tui-disabled-opacity)}[tuiAppearance]:where(*[data-tui-version="5.19.0"]):disabled:not([data-state]):before,[tuiAppearance]:where(*[data-tui-version="5.19.0"])[data-state=disabled]:before,[tuiAppearance]:where(*[data-tui-version="5.19.0"]):disabled:not([data-state]):after,[tuiAppearance]:where(*[data-tui-version="5.19.0"])[data-state=disabled]:after{cursor:initial}
`,
        ],
        encapsulation: 2,
      });
    }
  }
  return t;
})();
var C = (() => {
  class t {
    constructor() {
      ((this.nothing = db(X)),
        (this.modes = oe((e = this.tuiAppearanceMode()) => (!e || dQ(e) ? e : e.join(` `)))),
        (this.tuiAppearance = tr(v(P).appearance)),
        (this.tuiAppearanceState = tr(null)),
        (this.tuiAppearanceFocus = tr(null)),
        (this.tuiAppearanceMode = tr(null)));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        selectors: [[``, `tuiAppearance`, ``]],
        hostAttrs: [`data-tui-version`, `5.19.0`, `tuiAppearance`, ``],
        hostVars: 4,
        hostBindings: function (i, n) {
          i & 2 &&
            kr(`data-appearance`, n.tuiAppearance())(`data-focus`, n.tuiAppearanceFocus())(
              `data-mode`,
              n.modes(),
            )(`data-state`, n.tuiAppearanceState());
        },
        inputs: {
          tuiAppearance: [1, `tuiAppearance`],
          tuiAppearanceState: [1, `tuiAppearanceState`],
          tuiAppearanceFocus: [1, `tuiAppearanceFocus`],
          tuiAppearanceMode: [1, `tuiAppearanceMode`],
        },
        features: [Ta([k])],
      });
    }
  }
  return t;
})();
function dt(t, a = {}) {
  return vQ(C, `tuiAppearance`, t, a);
}
var V = (() => {
  class t {
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        features: [
          Ta([
            {
              directive: C,
              inputs: [
                `tuiAppearance`,
                `appearance`,
                `tuiAppearanceState`,
                `tuiAppearanceState`,
                `tuiAppearanceFocus`,
                `tuiAppearanceFocus`,
                `tuiAppearanceMode`,
                `tuiAppearanceMode`,
              ],
            },
          ]),
        ],
      });
    }
  }
  return t;
})();
var [W, bt] = hb({ appearance: `primary`, size: `l` }),
  J = (() => {
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
          exportAs: [`tui-button-5.19.0`],
          decls: 0,
          vars: 0,
          template: function (i, n) {},
          styles: [
            `[tuiButton]:where(*[data-tui-version="5.19.0"]),[tuiIconButton]:where(*[data-tui-version="5.19.0"]){--%NS%t-size: var(--%NS%tui-height-l);--%NS%t-radius: var(--%NS%tui-radius-l);--%NS%t-gap: .25rem;--%NS%t-padding: .5rem 1.25rem;--%NS%t-margin: -.25rem;-webkit-appearance:none;appearance:none;padding:0;border:0;background:none;font:inherit;line-height:inherit;text-decoration:none;position:relative;display:inline-flex;align-items:center;flex-shrink:0;box-sizing:border-box;white-space:nowrap;overflow:hidden;vertical-align:middle;max-inline-size:100%;gap:calc(var(--%NS%t-gap, 0rem) - 2 * var(--%NS%t-margin, 0rem));min-block-size:fit-content;block-size:var(--%NS%t-size);justify-content:center;border-radius:var(--%NS%t-radius);padding:var(--%NS%t-padding);-webkit-user-select:none;user-select:none;cursor:pointer;font:var(--%NS%tui-typography-body-m);font-weight:700}[tuiButton]:where(*[data-tui-version="5.19.0"])>img,[tuiIconButton]:where(*[data-tui-version="5.19.0"])>img,[tuiButton]:where(*[data-tui-version="5.19.0"])>tui-icon,[tuiIconButton]:where(*[data-tui-version="5.19.0"])>tui-icon,[tuiButton]:where(*[data-tui-version="5.19.0"])>[tuiAvatar],[tuiIconButton]:where(*[data-tui-version="5.19.0"])>[tuiAvatar],[tuiButton]:where(*[data-tui-version="5.19.0"])>tui-badge,[tuiIconButton]:where(*[data-tui-version="5.19.0"])>tui-badge,[tuiButton]:where(*[data-tui-version="5.19.0"])>[tuiBadge],[tuiIconButton]:where(*[data-tui-version="5.19.0"])>[tuiBadge],[tuiButton]:where(*[data-tui-version="5.19.0"])>[tuiRadio],[tuiIconButton]:where(*[data-tui-version="5.19.0"])>[tuiRadio],[tuiButton]:where(*[data-tui-version="5.19.0"])>[tuiSwitch],[tuiIconButton]:where(*[data-tui-version="5.19.0"])>[tuiSwitch],[tuiButton]:where(*[data-tui-version="5.19.0"])>[tuiCheckbox],[tuiIconButton]:where(*[data-tui-version="5.19.0"])>[tuiCheckbox],[tuiButton]:where(*[data-tui-version="5.19.0"])[tuiIcons]:before,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[tuiIcons]:before,[tuiButton]:where(*[data-tui-version="5.19.0"])[tuiIcons]:after,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[tuiIcons]:after{margin:var(--%NS%t-margin)}[tuiButton]:where(*[data-tui-version="5.19.0"])>.t-loader,[tuiIconButton]:where(*[data-tui-version="5.19.0"])>.t-loader{position:absolute;inset:50% auto auto 50%;transform:translate(-50%,-50%)}[tuiButton]:where(*[data-tui-version="5.19.0"])>.t-loader .t-text,[tuiIconButton]:where(*[data-tui-version="5.19.0"])>.t-loader .t-text{position:absolute}[tuiButton]:where(*[data-tui-version="5.19.0"])[data-icon-start=font]:before,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-icon-start=font]:before,[tuiButton]:where(*[data-tui-version="5.19.0"])[data-icon-end=font]:after,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-icon-end=font]:after{font-size:1.5rem}[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=xs],[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=xs]{--%NS%t-size: var(--%NS%tui-height-xs);--%NS%t-radius: var(--%NS%tui-radius-xs);--%NS%t-gap: .125rem;--%NS%t-padding: 0 .375rem;--%NS%t-margin: -.125rem;font:var(--%NS%tui-typography-body-s)}[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=xs] tui-icon,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=xs] tui-icon,[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=xs]:before,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=xs]:before,[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=xs]:after,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=xs]:after{font-size:1rem}[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=s],[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=s]{--%NS%t-size: var(--%NS%tui-height-s);--%NS%t-radius: var(--%NS%tui-radius-m);--%NS%t-gap: .125rem;--%NS%t-padding: .125rem .625rem;--%NS%t-margin: -.125rem;font:var(--%NS%tui-typography-body-s)}[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=s] tui-icon,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=s] tui-icon,[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=s]:not([tuiIconButton][data-appearance=icon],[tuiIconButton][data-appearance^=action]):before,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=s]:not([tuiIconButton][data-appearance=icon],[tuiIconButton][data-appearance^=action]):before,[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=s]:not([tuiIconButton][data-appearance=icon],[tuiIconButton][data-appearance^=action]):after,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=s]:not([tuiIconButton][data-appearance=icon],[tuiIconButton][data-appearance^=action]):after{font-size:1rem}[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=s][data-icon-start=font]:before,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=s][data-icon-start=font]:before,[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=s][data-icon-end=font]:after,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=s][data-icon-end=font]:after{font-size:1rem}[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=m],[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=m]{--%NS%t-size: var(--%NS%tui-height-m);--%NS%t-radius: var(--%NS%tui-radius-m);--%NS%t-gap: .125rem;--%NS%t-padding: .375rem 1rem;--%NS%t-margin: -.375rem;font:var(--%NS%tui-typography-body-m);font-weight:700}[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=m][data-icon-start=font]:before,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=m][data-icon-start=font]:before,[tuiButton]:where(*[data-tui-version="5.19.0"])[data-size=m][data-icon-end=font]:after,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-size=m][data-icon-end=font]:after{font-size:1.5rem}[tuiButton]:where(*[data-tui-version="5.19.0"])._loading,[tuiIconButton]:where(*[data-tui-version="5.19.0"])._loading{--%NS%tui-disabled-opacity: 1;-webkit-text-fill-color:transparent}[tuiButton]:where(*[data-tui-version="5.19.0"])._loading>*,[tuiIconButton]:where(*[data-tui-version="5.19.0"])._loading>*,[tuiButton]:where(*[data-tui-version="5.19.0"])._loading:before,[tuiIconButton]:where(*[data-tui-version="5.19.0"])._loading:before,[tuiButton]:where(*[data-tui-version="5.19.0"])._loading:after,[tuiIconButton]:where(*[data-tui-version="5.19.0"])._loading:after{opacity:0}[tuiButton]:where(*[data-tui-version="5.19.0"])._loading>.t-loader,[tuiIconButton]:where(*[data-tui-version="5.19.0"])._loading>.t-loader{opacity:1}[tuiButton]:where(*[data-tui-version="5.19.0"])[tuiButtonVertical],[tuiIconButton]:where(*[data-tui-version="5.19.0"])[tuiButtonVertical]{--%NS%t-margin: 0rem !important;flex-direction:column;flex-shrink:1;block-size:auto;padding:.75rem;gap:.375rem;min-inline-size:5rem;white-space:pre-line;font:var(--%NS%tui-typography-ui-s)}[tuiButton]:where(*[data-tui-version="5.19.0"])[tuiButtonVertical]>*,[tuiIconButton]:where(*[data-tui-version="5.19.0"])[tuiButtonVertical]>*{max-block-size:calc(var(--%NS%t-line-height) * 2);line-height:inherit!important;--%NS%t-line-height: var(--%NS%tui-lh) !important}[tuiButton]:where(*[data-tui-version="5.19.0"]):is(a):not([href]),[tuiIconButton]:where(*[data-tui-version="5.19.0"]):is(a):not([href]){opacity:var(--%NS%tui-disabled-opacity);pointer-events:none}[tuiIconButton]:where(*[data-tui-version="5.19.0"]){gap:0;inline-size:var(--%NS%t-size);min-inline-size:var(--%NS%t-size);font-size:0!important;font-variant-ligatures:none!important;padding:0}[tuiIconButton]:where(*[data-tui-version="5.19.0"])[tuiIconButton]:where(*[data-tui-version="5.19.0"])[data-icon-start]:after{display:none}
`,
          ],
          encapsulation: 2,
        });
      }
    }
    return t;
  })(),
  It = (() => {
    class t {
      constructor() {
        ((this.nothing = db(J)), (this.size = tr(v(W).size)));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || t)();
        };
      }
      static {
        this.ɵdir = ot({
          type: t,
          selectors: [
            [`a`, `tuiButton`, ``],
            [`button`, `tuiButton`, ``],
            [`a`, `tuiIconButton`, ``],
            [`button`, `tuiIconButton`, ``],
          ],
          hostVars: 1,
          hostBindings: function (i, n) {
            i & 2 && kr(`data-size`, n.size());
          },
          inputs: { size: [1, `size`] },
          features: [Na([R(W)]), Ta([V, pJ])],
        });
      }
    }
    return t;
  })();
var j = `boreas-server`;
var H = class t {
  document = v(ie);
  baseUrlState = H$1(this.read());
  baseUrl = this.baseUrlState.asReadonly();
  configured = oe(() => this.baseUrlState() !== ``);
  suggestedUrl() {
    return (
      this.baseUrlState() || this.document.defaultView?.location.origin || `http://127.0.0.1:8080`
    );
  }
  set(a) {
    let e = L(a);
    this.baseUrlState.set(e);
    try {
      this.document.defaultView?.localStorage.setItem(j, e);
    } catch {
      return;
    }
  }
  read() {
    try {
      return L(this.document.defaultView?.localStorage.getItem(j) ?? ``);
    } catch {
      return ``;
    }
  }
  static ɵfac = function (e) {
    return new (e || t)();
  };
  static ɵprov = q$1({ token: t, factory: t.ɵfac, providedIn: `root` });
};
function L(t) {
  return t.trim().replace(/\/+$/, ``);
}
function Mt(t) {
  return LI(
    ff(
      mn(t, `focus`, { capture: !0 }).pipe(Y(hX)),
      mn(t, `blur`, { capture: !0 }).pipe(Y(fX)),
    ).pipe(xs(AX)),
    { initialValue: !1 },
  );
}
function Q(t) {
  if (t.matches(`:disabled`) || t.getAttribute(`tabIndex`) === `-1`) return !1;
  if ((g1(t) && t.isContentEditable) || t.getAttribute(`tabIndex`) === `0`) return !0;
  switch (t.tagName) {
    case `A`:
    case `LINK`:
      return t.hasAttribute(`href`);
    case `AUDIO`:
    case `VIDEO`:
      return t.hasAttribute(`controls`);
    case `BUTTON`:
    case `SELECT`:
    case `TEXTAREA`:
      return !0;
    case `INPUT`:
      return t.getAttribute(`type`) !== `hidden`;
    default:
      return !1;
  }
}
function _t({ initial: t, root: a, previous: e = !1 }) {
  if (!a.ownerDocument) return null;
  let i = a.ownerDocument.createTreeWalker(a, NodeFilter.SHOW_ELEMENT, vX);
  i.currentNode = t;
  do if ((g1(i.currentNode) && (t = i.currentNode), g1(t) && Q(t))) return t;
  while (e ? i.previousNode() : i.nextNode());
  return null;
}
function G({ activeElement: t }) {
  if (!t?.shadowRoot) return t;
  let a = t.shadowRoot.activeElement;
  for (; a?.shadowRoot;) a = a.shadowRoot.activeElement;
  return a;
}
function Z(t) {
  return !!t?.ownerDocument && G(t.ownerDocument) === t && t.ownerDocument.hasFocus();
}
function Ot(t) {
  let a = t?.ownerDocument && G(t.ownerDocument);
  return !!a && t.contains(a) && t.ownerDocument?.hasFocus();
}
function kt(t, a, e) {
  for (t += e; t >= 0 && t < a.length;) {
    if ((a[t]?.focus(), Z(a[t]))) return;
    t += e;
  }
}
export {
  Mt as a,
  R as c,
  Z as d,
  _t as f,
  kt as h,
  It as i,
  V as l,
  dt as m,
  G as n,
  Ot as o,
  bt as p,
  H as r,
  Q as s,
  C as t,
  W as u,
};
