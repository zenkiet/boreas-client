import {
  $ as LI,
  $r as px,
  $t as Y$1,
  A as GX,
  Ai as vT,
  Bi as xQ,
  Bn as eg,
  Br as nr,
  Ci as ue,
  Cr as kx,
  Di as vF,
  Dr as lT,
  Dt as Rl,
  E as FO,
  Ei as vA,
  En as cT,
  F as HX,
  Fi as vx,
  Fr as mn,
  Ft as Se$1,
  Gi as yF,
  Gr as on$1,
  Hi as xi$1,
  Hn as fQ,
  I as He,
  Ii as wQ,
  It as T1,
  Ji as yX,
  Jn as ft$1,
  Jt as WQ,
  K as Jc,
  Ki as yR,
  Kn as fc,
  Kr as ot$1,
  Kt as Vi$1,
  L as Hy,
  Li as wR,
  Ln as dw,
  Lt as TX,
  Mr as m1,
  Mt as SM,
  Nr as mT,
  Or as lX,
  Ot as Rn$1,
  P as HQ,
  Pi as vo,
  Pn as db,
  Qi as ye$1,
  Qn as gx,
  Qr as pl,
  Qt as Xn,
  Rt as Ta,
  S as ET,
  Si as ub,
  Sn as bV,
  Sr as kr,
  St as Qo,
  T as FK,
  Ti as v,
  U as Ix,
  Ur as oe$1,
  Ut as Ue,
  V as IX,
  Vi as xX,
  Vn as et$2,
  Vr as o0,
  Vt as UC,
  W as J$1,
  Wi as xx,
  Wn as fT,
  Wt as VE,
  X as Kv,
  Xr as pe,
  Xt as Wo,
  Y as Ko,
  Yi as ya,
  Yn as g1,
  Yr as pb,
  Yt as Wa,
  Z as Kx,
  Zi as yd,
  Zr as pi$1,
  _ as Cb,
  _i as tg,
  _r as ji$1,
  a as A9,
  ai as qe$2,
  an as ZE,
  ar as hs,
  at as Mk,
  b as EJ,
  br as k,
  c as An$1,
  ca as zv,
  ci as rg,
  cn as ZX,
  ct as N9,
  d as BE,
  da as n$1,
  di as sR,
  dr as ig,
  dt as Na,
  ei as q,
  er as hQ,
  fi as sg,
  fn as _T,
  fr as it$1,
  g as Ca,
  gi as te$2,
  gn as aC,
  h as CZ,
  hn as a1,
  hr as jE,
  i as A1,
  ia as zQ,
  ii as qX,
  in as Yx,
  ir as hb,
  j as H$1,
  jr as lr,
  jt as Rx,
  k as GQ,
  kn as dF,
  l as Ax,
  la as l$1,
  lt as NM,
  m as By,
  mi as sw,
  mn as _r,
  mt as OE,
  na as yx,
  nn as Yt$2,
  nt as M1,
  o as AM,
  oa as zX,
  oi as qv,
  or as hx,
  ot as Ml,
  pi as sn$1,
  q as Jy,
  qi as yT,
  qn as ff,
  ra as z$2,
  ri as qQ,
  rn as Yv,
  rr as hX,
  sa as zo,
  st as N1,
  t as $Q,
  ta as yt,
  tt as Li$1,
  ua as m,
  ui as sQ,
  un as Zv,
  ur as ie,
  ut as NX,
  v as DT,
  vi as tk,
  vn as ag,
  vr as jn,
  vt as PI,
  w as FE,
  wn as bi$1,
  wr as l1,
  wt as Qv,
  x as ER,
  xr as kd,
  y as E$1,
  yi as tr,
  yn as am,
  yr as jo,
  yt as PK,
  z as IQ,
  zr as ng,
  zt as Tk,
} from './chunk-CD8PwEax.js';
import { f as _t, i as It$1, n as G$2, p as bt, r as H$2, s as Q } from './chunk-bRWS10C8.js';
var P = (function (r) {
  return ((r.Unimplemented = `UNIMPLEMENTED`), (r.Unavailable = `UNAVAILABLE`), r);
})(P || {});
var L$1 = class extends Error {
  constructor(e, t, i) {
    (super(e), (this.message = e), (this.code = t), (this.data = i));
  }
};
var K = (r) => {
  var e, t;
  return r?.androidBridge
    ? `android`
    : !(
          (t = (e = r?.webkit) === null || e === void 0 ? void 0 : e.messageHandlers) === null ||
          t === void 0
        ) && t.bridge
      ? `ios`
      : `web`;
};
var M = (r) => {
  let e = r.CapacitorCustomPlatform || null,
    t = r.Capacitor || {},
    i = (t.Plugins = t.Plugins || {}),
    s = () => (e !== null ? e.name : K(r)),
    n = () => s() !== `web`,
    o = (a) => {
      return !!(g.get(a)?.platforms.has(s()) || l(a));
    },
    l = (a) => {
      var c;
      return (c = t.PluginHeaders) === null || c === void 0 ? void 0 : c.find((C) => C.name === a);
    },
    u = (a) => r.console.error(a),
    g = new Map(),
    k = (a, c = {}) => {
      let C = g.get(a);
      if (C)
        return (
          console.warn(
            `Capacitor plugin "${a}" already registered. Cannot register plugins twice.`,
          ),
          C.proxy
        );
      let m = s(),
        p = l(a),
        b,
        _ = async () => (
          !b && m in c
            ? (b = typeof c[m] == `function` ? (b = await c[m]()) : (b = c[m]))
            : e !== null &&
              !b &&
              `web` in c &&
              (b = typeof c.web == `function` ? (b = await c.web()) : (b = c.web)),
          b
        ),
        q = (d, f) => {
          var w, v;
          if (p) {
            let y = p?.methods.find((h) => f === h.name);
            if (y)
              return y.rtype === `promise`
                ? (h) => t.nativePromise(a, f.toString(), h)
                : (h, O) => t.nativeCallback(a, f.toString(), h, O);
            if (d) return (w = d[f]) === null || w === void 0 ? void 0 : w.bind(d);
          } else {
            if (d) return (v = d[f]) === null || v === void 0 ? void 0 : v.bind(d);
            throw new L$1(`"${a}" plugin is not implemented on ${m}`, P.Unimplemented);
          }
        },
        $ = (d) => {
          let f,
            w = (...v) => {
              let y = _().then((h) => {
                let O = q(h, d);
                if (O) {
                  let A = O(...v);
                  return ((f = A?.remove), A);
                } else throw new L$1(`"${a}.${d}()" is not implemented on ${m}`, P.Unimplemented);
              });
              return (d === `addListener` && (y.remove = async () => f()), y);
            };
          return (
            (w.toString = () => `${d.toString()}() { [capacitor code] }`),
            Object.defineProperty(w, 'name', { value: d, writable: !1, configurable: !1 }),
            w
          );
        },
        R = $(`addListener`),
        H = $(`removeListener`),
        I = (d, f) => {
          let w = R({ eventName: d }, f),
            v = async () => {
              let h = await w;
              H({ eventName: d, callbackId: h }, f);
            },
            y = new Promise((h) => w.then(() => h({ remove: v })));
          return (
            (y.remove = async () => {
              (console.warn(`Using addListener() without 'await' is deprecated.`), await v());
            }),
            y
          );
        },
        x = new Proxy(
          {},
          {
            get(d, f) {
              switch (f) {
                case `$$typeof`:
                  return;
                case `toJSON`:
                  return () => ({});
                case `addListener`:
                  return p ? I : R;
                case `removeListener`:
                  return H;
                default:
                  return $(f);
              }
            },
          },
        );
      return (
        (i[a] = x),
        g.set(a, { name: a, proxy: x, platforms: new Set([...Object.keys(c), ...(p ? [m] : [])]) }),
        x
      );
    };
  return (
    t.convertFileSrc || (t.convertFileSrc = (a) => a),
    (t.getPlatform = s),
    (t.handleError = u),
    (t.isNativePlatform = n),
    (t.isPluginAvailable = o),
    (t.registerPlugin = k),
    (t.Exception = L$1),
    (t.DEBUG = !!t.DEBUG),
    (t.isLoggingEnabled = !!t.isLoggingEnabled),
    t
  );
};
var G$1 = (r) => (r.Capacitor = M(r));
var U = G$1(
  typeof globalThis < `u`
    ? globalThis
    : typeof self < `u`
      ? self
      : typeof window < `u`
        ? window
        : typeof global < `u`
          ? global
          : {},
);
var T = U.registerPlugin;
var E = class {
  constructor() {
    ((this.listeners = {}), (this.retainedEventArguments = {}), (this.windowListeners = {}));
  }
  addListener(e, t) {
    let i = !1;
    (this.listeners[e] || ((this.listeners[e] = []), (i = !0)), this.listeners[e].push(t));
    let n = this.windowListeners[e];
    (n && !n.registered && this.addWindowListener(n), i && this.sendRetainedArgumentsForEvent(e));
    let o = async () => this.removeListener(e, t);
    return Promise.resolve({ remove: o });
  }
  async removeAllListeners() {
    this.listeners = {};
    for (let e in this.windowListeners) this.removeWindowListener(this.windowListeners[e]);
    this.windowListeners = {};
  }
  notifyListeners(e, t, i) {
    let s = this.listeners[e];
    if (!s) {
      if (i) {
        let n = this.retainedEventArguments[e];
        (n || (n = []), n.push(t), (this.retainedEventArguments[e] = n));
      }
      return;
    }
    s.forEach((n) => n(t));
  }
  hasListeners(e) {
    var t;
    return !!(!((t = this.listeners[e]) === null || t === void 0) && t.length);
  }
  registerWindowListener(e, t) {
    this.windowListeners[t] = {
      registered: !1,
      windowEventName: e,
      pluginEventName: t,
      handler: (i) => {
        this.notifyListeners(t, i);
      },
    };
  }
  unimplemented(e = `not implemented`) {
    return new U.Exception(e, P.Unimplemented);
  }
  unavailable(e = `not available`) {
    return new U.Exception(e, P.Unavailable);
  }
  async removeListener(e, t) {
    let i = this.listeners[e];
    if (!i) return;
    let s = i.indexOf(t);
    (this.listeners[e].splice(s, 1),
      this.listeners[e].length || this.removeWindowListener(this.windowListeners[e]));
  }
  addWindowListener(e) {
    (window.addEventListener(e.windowEventName, e.handler), (e.registered = !0));
  }
  removeWindowListener(e) {
    e && (window.removeEventListener(e.windowEventName, e.handler), (e.registered = !1));
  }
  sendRetainedArgumentsForEvent(e) {
    let t = this.retainedEventArguments[e];
    t &&
      (delete this.retainedEventArguments[e],
      t.forEach((i) => {
        this.notifyListeners(e, i);
      }));
  }
};
var F$1 = (r) =>
  encodeURIComponent(r)
    .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
    .replace(/[()]/g, escape);
var B$2 = (r) => r.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
var j$1 = class extends E {
  async getCookies() {
    let e = document.cookie,
      t = {};
    return (
      e.split(`;`).forEach((i) => {
        if (i.length <= 0) return;
        let [s, n] = i.replace(/=/, `CAP_COOKIE`).split(`CAP_COOKIE`);
        ((s = B$2(s).trim()), (n = B$2(n).trim()), (t[s] = n));
      }),
      t
    );
  }
  async setCookie(e) {
    try {
      let t = F$1(e.key),
        i = F$1(e.value),
        s = e.expires ? `; expires=${e.expires.replace(`expires=`, ``)}` : ``,
        n = (e.path || `/`).replace(`path=`, ``),
        o = e.url != null && e.url.length > 0 ? `domain=${e.url}` : ``;
      document.cookie = `${t}=${i || ``}${s}; path=${n}; ${o};`;
    } catch (t) {
      return Promise.reject(t);
    }
  }
  async deleteCookie(e) {
    try {
      document.cookie = `${e.key}=; Max-Age=0`;
    } catch (t) {
      return Promise.reject(t);
    }
  }
  async clearCookies() {
    try {
      let e = document.cookie.split(`;`) || [];
      for (let t of e)
        document.cookie = t
          .replace(/^ +/, ``)
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async clearAllCookies() {
    try {
      await this.clearCookies();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
T(`CapacitorCookies`, { web: () => new j$1() });
var V$1 = async (r) =>
  new Promise((e, t) => {
    let i = new FileReader();
    ((i.onload = () => {
      let s = i.result;
      e(s.indexOf(`,`) >= 0 ? s.split(`,`)[1] : s);
    }),
      (i.onerror = (s) => t(s)),
      i.readAsDataURL(r));
  });
var W$1 = (r = {}) => {
  let e = Object.keys(r);
  return Object.keys(r)
    .map((s) => s.toLocaleLowerCase())
    .reduce((s, n, o) => ((s[n] = r[e[o]]), s), {});
};
var z$1 = (r, e = !0) =>
  r
    ? Object.entries(r)
        .reduce((i, s) => {
          let [n, o] = s,
            l,
            u;
          return (
            Array.isArray(o)
              ? ((u = ``),
                o.forEach((g) => {
                  ((l = e ? encodeURIComponent(g) : g), (u += `${n}=${l}&`));
                }),
                u.slice(0, -1))
              : ((l = e ? encodeURIComponent(o) : o), (u = `${n}=${l}`)),
            `${i}&${u}`
          );
        }, ``)
        .substr(1)
    : null;
var J = (r, e = {}) => {
  let t = Object.assign({ method: r.method || `GET`, headers: r.headers }, e),
    s = W$1(r.headers)[`content-type`] || ``;
  if (typeof r.data == `string`) t.body = r.data;
  else if (s.includes(`application/x-www-form-urlencoded`)) {
    let n = new URLSearchParams();
    for (let [o, l] of Object.entries(r.data || {})) n.set(o, l);
    t.body = n.toString();
  } else if (s.includes(`multipart/form-data`) || r.data instanceof FormData) {
    let n = new FormData();
    if (r.data instanceof FormData)
      r.data.forEach((l, u) => {
        n.append(u, l);
      });
    else for (let l of Object.keys(r.data)) n.append(l, r.data[l]);
    t.body = n;
    let o = new Headers(t.headers);
    (o.delete(`content-type`), (t.headers = o));
  } else
    (s.includes(`application/json`) || typeof r.data == `object`) &&
      (t.body = JSON.stringify(r.data));
  return t;
};
var D = class extends E {
  async request(e) {
    let t = J(e, e.webFetchExtra),
      i = z$1(e.params, e.shouldEncodeUrlParams),
      s = i ? `${e.url}?${i}` : e.url,
      n = await fetch(s, t),
      o = n.headers.get(`content-type`) || ``,
      { responseType: l = `text` } = n.ok ? e : {};
    o.includes(`application/json`) && (l = `json`);
    let u, g;
    switch (l) {
      case `arraybuffer`:
      case `blob`:
        ((g = await n.blob()), (u = await V$1(g)));
        break;
      case `json`:
        u = await n.json();
        break;
      default:
        u = await n.text();
    }
    let k = {};
    return (
      n.headers.forEach((a, c) => {
        k[c] = a;
      }),
      { data: u, headers: k, status: n.status, url: n.url }
    );
  }
  async get(e) {
    return this.request(Object.assign(Object.assign({}, e), { method: `GET` }));
  }
  async post(e) {
    return this.request(Object.assign(Object.assign({}, e), { method: `POST` }));
  }
  async put(e) {
    return this.request(Object.assign(Object.assign({}, e), { method: `PUT` }));
  }
  async patch(e) {
    return this.request(Object.assign(Object.assign({}, e), { method: `PATCH` }));
  }
  async delete(e) {
    return this.request(Object.assign(Object.assign({}, e), { method: `DELETE` }));
  }
};
T(`CapacitorHttp`, { web: () => new D() });
var S$1 = class extends E {
  async setStyle() {
    this.unavailable(`not available for web`);
  }
  async setAnimation() {
    this.unavailable(`not available for web`);
  }
  async show() {
    this.unavailable(`not available for web`);
  }
  async hide() {
    this.unavailable(`not available for web`);
  }
};
T(`SystemBars`, { web: () => new S$1() });
var [B$1, h$1] = hb({ appearance: `neutral`, size: `s` }),
  z = (() => {
    class t {
      static {
        this.ɵfac = function (i) {
          return new (i || t)();
        };
      }
      static {
        this.ɵdir = ot$1({
          type: t,
          selectors: [[``, `tuiButtonX`, ``]],
          hostAttrs: [`tuiIconButton`, ``, `type`, `button`],
          hostVars: 2,
          hostBindings: function (i, T) {
            (i & 1 &&
              zo(`pointerdown.prevent.zoneless`, function () {
                return 0;
              }),
              i & 2 && Wo(`--%NS%t-radius`, 100, `%`));
          },
          features: [
            Na([bt(() => v(B$1)), { provide: Cb, useFactory: () => v(zX).close }]),
            Ta([{ directive: It$1, inputs: [`size`, `size`] }]),
          ],
        });
      }
    }
    return t;
  })();
var Si =
  /(?:android|bb\d|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series([46])0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|^(?:1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br([ev])w|bumb|bw-([nu])|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do([cp])o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly([-_])|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-([mpt])|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c([- _agpst])|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac([ \-/])|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja([tv])a|jbro|jemu|jigs|kddi|keji|kgt([ /])|klon|kpt |kwc-|kyo([ck])|le(no|xi)|lg( g|\/([klu])|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t([- ov])|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[23]|n30([02])|n50([025])|n7(0([01])|10)|ne(([cm])-|on|tf|wf|wg|wt)|nok([6i])|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan([adt])|pdxg|pg(13|-([1-8c]))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c([-01])|47|mc|nd|ri)|sgh-|shar|sie([-m])|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel([im])|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c([- ])|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-)/i;
var yi = /^((?!chrome|android).)*safari/i;
var wi = /ipad|iphone|ipod/i;
function bi({ userAgent: t, maxTouchPoints: r }) {
  return wi.test(t) || (yi.test(t) && r > 1);
}
var G = new E$1(``, { factory: () => bi(v(l1)) });
var Ei = new E$1(``, { factory: () => Si.test(v(IQ)) });
var Ht$1 = new E$1(``, { factory: () => v(Ei) && !v(G) });
var An = new E$1(``, {
  factory: () => {
    let t = v(lr).matchMedia(`(pointer: coarse)`);
    return LI(mn(t, `change`).pipe(Y$1(() => t.matches)), { initialValue: t.matches });
  },
});
var Ln = new E$1(``, { factory: () => !!v(lr)?.webkitConvertPointFromNodeToPage });
function Zt$1({ ownerDocument: t }) {
  let r = t?.defaultView,
    e =
      r.safari !== void 0 &&
      r.safari?.pushNotification?.toString() === `[object SafariRemoteNotification]`,
    i =
      !!r.navigator?.vendor?.includes(`Apple`) &&
      !r.navigator?.userAgent?.includes(`CriOS`) &&
      !r.navigator?.userAgent?.includes(`FxiOS`);
  return e || i;
}
var Me = new E$1(``);
function Di(t) {
  return { provide: Me, useValue: t };
}
function Nn(t = {}) {
  return v(Me, t);
}
var oe = class {
  constructor(r, e) {
    ((this.component = r), (this.i = e));
  }
  createInjector(r, e) {
    return He.create({ parent: this.i || r, providers: e == null ? [] : [Di(e)] });
  }
};
var ge = class {
  constructor(r) {
    this.$implicit = r;
  }
  get polymorpheusOutlet() {
    return this.$implicit;
  }
};
function Oi(t) {
  return Object(t) !== t;
}
var $t$1 = (() => {
  class t {
    constructor(e = v(jo, { self: !0 }), i = v(nr)) {
      ((this.template = e), (this.cdr = i), (this.polymorpheus = ``));
    }
    static ngTemplateContextGuard(e, i) {
      return !0;
    }
    check() {
      this.cdr.markForCheck();
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)(te$2(jo), te$2(nr));
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [[`ng-template`, `polymorpheus`, ``]],
        inputs: { polymorpheus: `polymorpheus` },
        exportAs: [`polymorpheus`],
      });
    }
  }
  return t;
})();
var Yt$1 = (() => {
  class t {
    constructor() {
      ((this.vcr = v(Li$1)), (this.i = v(pi$1)), (this.t = v(jo)), (this.content = ``));
    }
    static ngTemplateContextGuard(e, i) {
      return !0;
    }
    ngOnChanges({ content: e }) {
      let i = this.getContext(),
        n = Ie(this.content);
      if ((this.update(), this.c?.injector.get(nr).markForCheck(), !e)) return;
      this.vcr.clear();
      let s = new Proxy(Gt$1(i), {
        get: (a, h) => Gt$1(n ? this.context : this.getContext())?.[h],
      });
      Ie(this.content)
        ? (this.process(this.content, i == null ? void 0 : s), this.update())
        : (i instanceof ge && i.$implicit) != null &&
          this.vcr.createEmbeddedView(this.template, s, { injector: this.i });
    }
    ngDoCheck() {
      $e(this.content) && this.content.check();
    }
    get template() {
      return $e(this.content)
        ? this.content.template
        : this.content instanceof jo
          ? this.content
          : this.t;
    }
    getContext() {
      return Ti(this.content) || Ie(this.content)
        ? this.context
        : new ge(
            typeof this.content == `function` ? this.content(this.context ?? {}) : this.content,
          );
    }
    process(e, i) {
      this.c = this.vcr.createComponent(e.component, { injector: e.createInjector(this.i, i) });
    }
    update() {
      if (typeof this.context != `object` || !Ie(this.content)) return;
      let { inputs: e = [] } = UC(this.content.component) || {};
      for (let { templateName: i } of e)
        i in (this.context ?? {}) && this.c?.setInput(i, this.context?.[i]);
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [[``, `polymorpheusOutlet`, ``]],
        inputs: {
          content: [0, `polymorpheusOutlet`, `content`],
          context: [0, `polymorpheusOutletContext`, `context`],
        },
        features: [Xn],
      });
    }
  }
  return t;
})();
function $e(t) {
  return t instanceof $t$1;
}
function Ie(t) {
  return t instanceof oe;
}
function Ti(t) {
  return $e(t) || t instanceof jo;
}
function Gt$1(t) {
  return Oi(t) ? new ge(t) : t;
}
var Ri = [`*`];
function xi(t, r) {
  if ((t & 1 && (rg(0), sR(1), ig()), t & 2)) {
    let e = r.polymorpheusOutlet;
    (vA(), ag(` `, e, ` `));
  }
}
function Ii(t, r) {
  if ((t & 1 && (pl(0, `div`, 5), FE(1, xi, 2, 1, `ng-container`, 6), eg()), t & 2)) {
    let e = Ax(2);
    (vA(), VE(`polymorpheusOutlet`, e.textContent()));
  }
}
function Mi(t, r) {
  if (
    (t & 1 &&
      (pl(0, `div`, 2),
      Jy(),
      pl(1, `svg`, 3),
      Rl(2, `circle`, 4),
      eg(),
      hx(3, Ii, 2, 1, `div`, 5),
      eg()),
    t & 2)
  ) {
    let e = Ax();
    (sg(`t-loader_inherit-color`, e.inheritColor()), vA(3), px(e.textContent() ? 3 : -1));
  }
}
var [Ai$1, $n] = hb({ size: `m`, inheritColor: !1, overlay: !1 }),
  Yn = (() => {
    class t {
      constructor() {
        ((this.options = v(Ai$1)),
          (this.isApple = Zt$1(qQ()) || v(G)),
          (this.size = tr(this.options.size)),
          (this.inheritColor = tr(this.options.inheritColor)),
          (this.overlay = tr(this.options.overlay)),
          (this.textContent = tr()),
          (this.loading = tr(!0)));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || t)();
        };
      }
      static {
        this.ɵcmp = Vi$1({
          type: t,
          selectors: [[`tui-loader`]],
          hostVars: 3,
          hostBindings: function (i, n) {
            i & 2 && (kr(`data-size`, n.size()), sg(`_loading`, n.loading()));
          },
          inputs: {
            size: [1, `size`],
            inheritColor: [1, `inheritColor`],
            overlay: [1, `overlay`],
            textContent: [1, `textContent`],
            loading: [1, `loading`],
          },
          ngContentSelectors: Ri,
          decls: 3,
          vars: 7,
          consts: [
            [1, `t-content`, 3, `disabled`],
            [1, `t-loader`, 3, `t-loader_inherit-color`],
            [1, `t-loader`],
            [`height`, `100%`, `width`, `100%`, 1, `t-icon`],
            [1, `t-circle`],
            [1, `t-text`],
            [4, `polymorpheusOutlet`],
          ],
          template: function (i, n) {
            (i & 1 && (xx(), pl(0, `fieldset`, 0), Rx(1), eg(), hx(2, Mi, 4, 3, `div`, 1)),
              i & 2 &&
                (Wo(`opacity`, n.overlay() && n.loading() ? 0.3 : null)(
                  `pointer-events`,
                  n.loading() ? `none` : null,
                ),
                VE(`disabled`, n.loading() && !n.isApple),
                kr(`inert`, n.loading() || null),
                vA(2),
                px(n.loading() ? 2 : -1)));
          },
          dependencies: [Yt$1],
          styles: [
            `[_nghost-%COMP%]{position:relative;display:grid;flex-shrink:0;--%NS%tui-thickness: calc(var(--%NS%t-diameter) / 12)}._loading[_nghost-%COMP%]{overflow:hidden}[data-size=xs][_nghost-%COMP%]{--%NS%t-diameter: var(--%NS%tui-diameter, .75em)}[data-size=s][_nghost-%COMP%]{--%NS%t-diameter: var(--%NS%tui-diameter, 1em)}[data-size=m][_nghost-%COMP%]{--%NS%t-diameter: var(--%NS%tui-diameter, 1.5em)}[data-size=l][_nghost-%COMP%]{--%NS%t-diameter: var(--%NS%tui-diameter, 2.5em)}[data-size=xl][_nghost-%COMP%]{--%NS%t-diameter: var(--%NS%tui-diameter, 3.5em)}[data-size=xxl][_nghost-%COMP%]{--%NS%t-diameter: var(--%NS%tui-diameter, 5em)}.t-content[_ngcontent-%COMP%]{grid-area:1 / 1;padding:0;margin:0;border:none;isolation:inherit;min-inline-size:0;min-block-size:0}.t-loader[_ngcontent-%COMP%]{position:relative;display:flex;grid-area:1 / 1;flex-direction:column;gap:1rem;align-items:center;justify-content:center;color:var(--%NS%tui-text-primary);stroke:var(--%NS%tui-background-accent-1);font-size:1rem}[data-size=xs][_nghost-%COMP%]   .t-loader[_ngcontent-%COMP%], [data-size=s][_nghost-%COMP%]   .t-loader[_ngcontent-%COMP%]{flex-direction:row}.t-loader.t-loader_inherit-color[_ngcontent-%COMP%]{color:inherit;stroke:currentColor}.t-text[_ngcontent-%COMP%]{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font:var(--%NS%tui-typography-body-s);color:inherit;max-inline-size:100%;text-align:center}@keyframes _ngcontent-%COMP%_tuiLoaderRotate{0%{transform:rotate(-90deg)}50%{transform:rotate(-90deg) rotate(1turn)}to{transform:rotate(-90deg) rotate(3turn)}}.t-icon[_ngcontent-%COMP%]{inline-size:var(--%NS%t-diameter);block-size:var(--%NS%t-diameter);animation:_ngcontent-%COMP%_tuiLoaderRotate 4s linear infinite}@keyframes _ngcontent-%COMP%_tuiLoaderDashOffset{0%{stroke-dashoffset:calc(2 * 3.14159265 * calc(var(--%NS%t-diameter) / 2 - var(--%NS%tui-thickness)))}50%{stroke-dashoffset:calc(.05 * calc(2 * 3.14159265 * calc(var(--%NS%t-diameter) / 2 - var(--%NS%tui-thickness))))}to{stroke-dashoffset:calc(2 * 3.14159265 * calc(var(--%NS%t-diameter) / 2 - var(--%NS%tui-thickness)))}}.t-circle[_ngcontent-%COMP%]{r:calc(var(--%NS%t-diameter) / 2 - var(--%NS%tui-thickness));cx:50%;cy:50%;stroke-dasharray:calc(2 * 3.14159265 * calc(var(--%NS%t-diameter) / 2 - var(--%NS%tui-thickness)));fill:none;stroke:inherit;stroke-width:max(var(--%NS%tui-thickness),1.5px);stroke-linecap:round;animation:_ngcontent-%COMP%_tuiLoaderDashOffset 4s linear infinite}`,
          ],
        });
      }
    }
    return t;
  })();
var Li = new E$1(``, {
  factory: () => {
    let t = new ue(),
      r = v(xi$1).createRenderer(null, null),
      e = Object.getPrototypeOf(r.delegate ?? r),
      { removeChild: i } = e;
    return (
      (e.removeChild = function (...n) {
        (t.next(n[1]), i.apply(this, n));
      }),
      t.pipe(
        _r(null),
        qe$2((n) =>
          jn(0).pipe(
            Y$1(() => null),
            _r(n),
          ),
        ),
        vo(),
      )
    );
  },
});
function Kt$1(t, r = null) {
  return (
    m1(t).activeElement !== t &&
    !t.matches(`:disabled`) &&
    !r?.contains(t) &&
    (t.getAttribute(`tabIndex`) === `-1` || Q(t))
  );
}
function Pi(t) {
  return ff(
    T1(t, `focusin`).pipe(Y$1(({ target: r }) => r)),
    T1(t, `focusout`).pipe(
      et$2(({ target: r, relatedTarget: e }) => !!e && Kt$1(r)),
      Y$1(({ relatedTarget: r }) => r),
    ),
  );
}
var qt$1 = new E$1(``, {
  factory: () => {
    let t = v(Li),
      r = v(lr),
      e = v(ie),
      i = v(Se$1),
      n = T1(r, `focusout`, { capture: !0 }),
      s = T1(r, `focusin`, { capture: !0 }),
      a = T1(r, `blur`),
      h = T1(r, `mousedown`),
      C = T1(r, `mouseup`),
      V = T1(r, `pointerdown`),
      b = T1(r, `pointercancel`);
    return ff(
      n.pipe(
        on$1(V.pipe(et$2((l) => !l.defaultPrevented))),
        Zv({ delay: () => ff(C, b) }),
        ET(t),
        et$2(([l, g]) => Kt$1(GQ(l), g)),
        Y$1(([{ relatedTarget: l }]) => l),
      ),
      a.pipe(
        Y$1(() => e.activeElement),
        et$2((l) => !!l?.matches(`iframe`)),
      ),
      s.pipe(
        qe$2((l) => {
          let g = GQ(l),
            ce = m1(g) || e;
          return ce === e ? z$2(g) : Pi(ce).pipe(_r(g));
        }),
      ),
      h.pipe(
        Y$1(GQ),
        qe$2((l) =>
          !e.activeElement || e.activeElement === e.body
            ? z$2(l)
            : n.pipe(
                yt(1),
                Y$1(() => l),
                on$1(jn(0, xX(i))),
              ),
        ),
      ),
    ).pipe(zv(), vo());
  },
});
var or = new E$1(``, { factory: () => null });
var sr = new E$1(``, { factory: () => (v(G) ? `ios` : v(Ht$1) ? `android` : `web`) });
var vr = (() => {
  class t {
    constructor() {
      ((this.active$ = v(qt$1)),
        (this.tuiActiveZoneParent = null),
        (this.parent = v(t, { skipSelf: !0, optional: !0 })),
        (this.el = v(it$1, { optional: !0 })?.nativeElement ?? v(ie).documentElement),
        (this.tuiActiveZoneChange = this.active$.pipe(
          Y$1((e) => $Q(e) && this.contains(e)),
          _r(!1),
          zv(),
          yT(1),
          NX(),
          vo(),
        )),
        (this.children = []),
        this.parent?.addSubActiveZone(this));
    }
    set tuiActiveZoneParentSetter(e) {
      (this.tuiActiveZoneParent?.removeSubActiveZone(this),
        e?.addSubActiveZone(this),
        (this.tuiActiveZoneParent = e));
    }
    ngOnDestroy() {
      (this.parent?.removeSubActiveZone(this), this.tuiActiveZoneParent?.removeSubActiveZone(this));
    }
    contains(e) {
      return this.el.contains(e) || this.children.some((i) => i.contains(e));
    }
    addSubActiveZone(e) {
      this.children = [...this.children, e];
    }
    removeSubActiveZone(e) {
      this.children = a1(this.children, this.children.indexOf(e));
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
          [``, `tuiActiveZone`, ``, 5, `ng-container`],
          [``, `tuiActiveZoneChange`, ``, 5, `ng-container`],
          [``, `tuiActiveZoneParent`, ``, 5, `ng-container`],
        ],
        inputs: {
          tuiActiveZoneParentSetter: [0, `tuiActiveZoneParent`, `tuiActiveZoneParentSetter`],
        },
        outputs: { tuiActiveZoneChange: `tuiActiveZoneChange` },
        exportAs: [`tuiActiveZone`],
      });
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
    }
  }
  return t;
})();
var Qt$1 = `tui-enter`;
var Jt$1 = `tui-leave`;
var Fi = `tui-animated`;
var Xt$1 = `${Jt$1}_${yX.split(`.`)[0]}`;
var ei$1 = (() => {
  class t {
    constructor() {
      ((this.renderer = v(Li$1)._hostLView?.[11]),
        (this.el = qQ()),
        Ca(() => this.remove()),
        this.renderer && sw(v(bi$1)) && zi(this.renderer.delegate || this.renderer));
    }
    remove() {
      this.el.isConnected && !this.el.getAnimations?.().length && this.el.classList.remove(Qt$1);
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [[``, `tuiAnimated`, ``]],
        hostAttrs: [1, `tui-enter`, `tui-animated`],
        hostBindings: function (i, n) {
          i & 1 &&
            zo(`animationcancel.self`, function () {
              return n.remove();
            })(`animationend.self`, function () {
              return n.remove();
            });
        },
      });
    }
  }
  return t;
})();
function zi(t) {
  if (t.data[Xt$1]) return;
  let { removeChild: r } = t;
  ((t.data[Xt$1] = !0),
    (t.removeChild = (e, i, n) => {
      if (!$Q(i) || !i.classList.contains(Fi)) {
        r.call(t, e, i, n);
        return;
      }
      i.classList.remove(Qt$1);
      let { length: s } = i.getAnimations?.() || [];
      i.classList.add(Jt$1);
      let a = i.getAnimations?.() ?? [],
        h = a[a.length - 1],
        C = () => {
          (!e || e.contains(i)) && r.call(t, e, i, n);
        };
      a.length > s && h ? ((h.onfinish = C), (h.oncancel = C)) : C();
    }));
}
var ve = (() => {
  class t {
    constructor() {
      this.vcr = v(Li$1);
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({ type: t, selectors: [[``, `tuiVCR`, ``]] });
    }
  }
  return t;
})();
var zr = (() => {
  class t {
    constructor(e) {
      ((this.service = e), (this.injector = v(pi$1)));
    }
    open(e, i = {}) {
      return new k((n) =>
        this.add(
          new oe(
            this.component,
            He.create({
              parent: this.injector,
              providers: [
                {
                  provide: Me,
                  useValue: m(l$1(l$1({}, this.options), i), {
                    content: e,
                    $implicit: n,
                    createdAt: Date.now(),
                    id: fQ(),
                    completeWith: (s) => {
                      (n.next(s), n.complete());
                    },
                  }),
                },
              ],
            }),
          ),
        ),
      );
    }
    add(e) {
      let i = this.service.add(e);
      return () => i.destroy();
    }
    static {
      this.ɵfac = function (i) {
        Ml();
      };
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac });
    }
  }
  return t;
})();
var ke = (() => {
  class t {
    attach(e) {
      this.host = e;
    }
    add(e, i) {
      if (!this.host) throw new Ye$1();
      return e instanceof oe ? this.host.addComponent(e) : this.host.addTemplate(e, i);
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
var Ye$1 = class extends Error {
  constructor() {
    super(``);
  }
};
var ti$1 = (() => {
  class t {
    constructor() {
      ((this.injector = v(pi$1)), (this.anchor = N9.required(ve)), v(ke).attach(this));
    }
    addComponent(e) {
      let i = e.createInjector(this.injector),
        n = this.anchor().vcr.createComponent(e.component, { injector: i });
      return (n.changeDetectorRef.detectChanges(), n);
    }
    addTemplate(e, i) {
      return this.anchor().vcr.createEmbeddedView(e, i);
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        viewQuery: function (i, n) {
          (i & 1 && ZE(n.anchor, ve, 5), i & 2 && kx());
        },
      });
    }
  }
  return t;
})();
var Ke$1;
try {
  Ke$1 = typeof Intl < `u` && Intl.v8BreakIterator;
} catch {
  Ke$1 = !1;
}
var ii = (() => {
  class t {
    _platformId = v(bi$1);
    isBrowser = this._platformId ? sw(this._platformId) : typeof document == `object` && !!document;
    EDGE = this.isBrowser && /(edge)/i.test(navigator.userAgent);
    TRIDENT = this.isBrowser && /(msie|trident)/i.test(navigator.userAgent);
    BLINK =
      this.isBrowser &&
      !!(window.chrome || Ke$1) &&
      typeof CSS < `u` &&
      !this.EDGE &&
      !this.TRIDENT;
    WEBKIT =
      this.isBrowser &&
      /AppleWebKit/i.test(navigator.userAgent) &&
      !this.BLINK &&
      !this.EDGE &&
      !this.TRIDENT;
    IOS = this.isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(`MSStream` in window);
    FIREFOX = this.isBrowser && /(firefox|minefield)/i.test(navigator.userAgent);
    ANDROID = this.isBrowser && /android/i.test(navigator.userAgent) && !this.TRIDENT;
    SAFARI = this.isBrowser && /safari/i.test(navigator.userAgent) && this.WEBKIT;
    static ɵfac = function (i) {
      return new (i || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var Ni$1 = new E$1(`cdk-dir-doc`, { providedIn: `root`, factory: () => v(ie) });
var Vi =
  /^(ar|ckb|dv|he|iw|fa|nqo|ps|sd|ug|ur|yi|.*[-_](Adlm|Arab|Hebr|Nkoo|Rohg|Thaa))(?!.*[-_](Latn|Cyrl)($|-|_))($|-|_)/i;
function Bi(t) {
  let r = t?.toLowerCase() || ``;
  return r === `auto` && typeof navigator < `u` && navigator?.language
    ? Vi.test(navigator.language)
      ? `rtl`
      : `ltr`
    : r === `rtl`
      ? `rtl`
      : `ltr`;
}
var ni$1 = (() => {
  class t {
    get value() {
      return this.valueSignal();
    }
    valueSignal = H$1(`ltr`);
    change = new Ue();
    constructor() {
      let e = v(Ni$1, { optional: !0 });
      if (e) {
        let i = e.body ? e.body.dir : null,
          n = e.documentElement ? e.documentElement.dir : null;
        this.valueSignal.set(Bi(i || n || `ltr`));
      }
    }
    ngOnDestroy() {
      this.change.complete();
    }
    static ɵfac = function (i) {
      return new (i || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var S = (function (t) {
  return (
    (t[(t.NORMAL = 0)] = `NORMAL`),
    (t[(t.NEGATED = 1)] = `NEGATED`),
    (t[(t.INVERTED = 2)] = `INVERTED`),
    t
  );
})(S || {});
var Ae;
var $;
function ri$1() {
  if ($ == null) {
    if (typeof document != `object` || !document || typeof Element != `function` || !Element)
      return (($ = !1), $);
    if (document.documentElement?.style && `scrollBehavior` in document.documentElement.style)
      $ = !0;
    else {
      let t = Element.prototype.scrollTo;
      t ? ($ = !/\{\s*\[native code\]\s*\}/.test(t.toString())) : ($ = !1);
    }
  }
  return $;
}
function se() {
  if (typeof document != `object` || !document) return S.NORMAL;
  if (Ae == null) {
    let t = document.createElement(`div`),
      r = t.style;
    ((t.dir = `rtl`),
      (r.width = `1px`),
      (r.overflow = `auto`),
      (r.visibility = `hidden`),
      (r.pointerEvents = `none`),
      (r.position = `absolute`));
    let e = document.createElement(`div`),
      i = e.style;
    ((i.width = `2px`),
      (i.height = `1px`),
      t.appendChild(e),
      document.body.appendChild(t),
      (Ae = S.NORMAL),
      t.scrollLeft === 0 &&
        ((t.scrollLeft = 1), (Ae = t.scrollLeft === 0 ? S.NEGATED : S.INVERTED)),
      t.remove());
  }
  return Ae;
}
var ji = 20;
var Wi = (() => {
  class t {
    _ngZone = v(Se$1);
    _platform = v(ii);
    _renderer = v(xi$1).createRenderer(null, null);
    _cleanupGlobalListener;
    _scrolled = new ue();
    _scrolledCount = 0;
    scrollContainers = new Map();
    register(e) {
      this.scrollContainers.has(e) ||
        this.scrollContainers.set(
          e,
          e.elementScrolled().subscribe(() => this._scrolled.next(e)),
        );
    }
    deregister(e) {
      let i = this.scrollContainers.get(e);
      i && (i.unsubscribe(), this.scrollContainers.delete(e));
    }
    scrolled(e = ji) {
      return this._platform.isBrowser
        ? new k((i) => {
            this._cleanupGlobalListener ||
              (this._cleanupGlobalListener = this._ngZone.runOutsideAngular(() =>
                this._renderer.listen(`document`, `scroll`, () => this._scrolled.next()),
              ));
            let n = e > 0 ? this._scrolled.pipe(lT(e)).subscribe(i) : this._scrolled.subscribe(i);
            return (
              this._scrolledCount++,
              () => {
                (n.unsubscribe(),
                  this._scrolledCount--,
                  this._scrolledCount ||
                    (this._cleanupGlobalListener?.(), (this._cleanupGlobalListener = void 0)));
              }
            );
          })
        : z$2();
    }
    ngOnDestroy() {
      (this._cleanupGlobalListener?.(),
        (this._cleanupGlobalListener = void 0),
        this.scrollContainers.forEach((e, i) => this.deregister(i)),
        this._scrolled.complete());
    }
    ancestorScrolled(e, i) {
      let n = this.getAncestorScrollContainers(e);
      return this.scrolled(i).pipe(et$2((s) => !s || n.indexOf(s) > -1));
    }
    getAncestorScrollContainers(e) {
      let i = [];
      return (
        this.scrollContainers.forEach((n, s) => {
          this._targetContainsElement(s, e) && i.push(s);
        }),
        i
      );
    }
    _targetContainsElement(e, i) {
      let n = kd(i),
        s = e.getElementRef().nativeElement;
      do if (n == s) return !0;
      while ((n = n.parentElement));
      return !1;
    }
    static ɵfac = function (i) {
      return new (i || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var oi$1 = (() => {
  class t {
    elementRef = v(it$1);
    scrollDispatcher = v(Wi);
    ngZone = v(Se$1);
    dir = v(ni$1, { optional: !0 });
    _scrollElement = this.elementRef.nativeElement;
    _destroyed = new ue();
    _renderer = v(An$1);
    _cleanupScroll;
    _elementScrolled = new ue();
    ngOnInit() {
      ((this._cleanupScroll = this.ngZone.runOutsideAngular(() =>
        this._renderer.listen(this._scrollElement, `scroll`, (e) => this._elementScrolled.next(e)),
      )),
        this.scrollDispatcher.register(this));
    }
    ngOnDestroy() {
      (this._cleanupScroll?.(),
        this._elementScrolled.complete(),
        this.scrollDispatcher.deregister(this),
        this._destroyed.next(),
        this._destroyed.complete());
    }
    elementScrolled() {
      return this._elementScrolled;
    }
    getElementRef() {
      return this.elementRef;
    }
    scrollTo(e) {
      let i = this.elementRef.nativeElement,
        n = this.dir && this.dir.value == `rtl`;
      ((e.left ??= n ? e.end : e.start),
        (e.right ??= n ? e.start : e.end),
        e.bottom != null && (e.top = i.scrollHeight - i.clientHeight - e.bottom),
        n && se() != S.NORMAL
          ? (e.left != null && (e.right = i.scrollWidth - i.clientWidth - e.left),
            se() == S.INVERTED
              ? (e.left = e.right)
              : se() == S.NEGATED && (e.left = e.right ? -e.right : e.right))
          : e.right != null && (e.left = i.scrollWidth - i.clientWidth - e.right),
        this._applyScrollToOptions(e));
    }
    _applyScrollToOptions(e) {
      let i = this.elementRef.nativeElement;
      ri$1()
        ? i.scrollTo(e)
        : (e.top != null && (i.scrollTop = e.top), e.left != null && (i.scrollLeft = e.left));
    }
    measureScrollOffset(e) {
      let i = `left`,
        n = `right`,
        s = this.elementRef.nativeElement;
      if (e == `top`) return s.scrollTop;
      if (e == `bottom`) return s.scrollHeight - s.clientHeight - s.scrollTop;
      let a = this.dir && this.dir.value == `rtl`;
      return (
        e == `start` ? (e = a ? n : i) : e == `end` && (e = a ? i : n),
        a && se() == S.INVERTED
          ? e == i
            ? s.scrollWidth - s.clientWidth - s.scrollLeft
            : s.scrollLeft
          : a && se() == S.NEGATED
            ? e == i
              ? s.scrollLeft + s.scrollWidth - s.clientWidth
              : -s.scrollLeft
            : e == i
              ? s.scrollLeft
              : s.scrollWidth - s.clientWidth - s.scrollLeft
      );
    }
    static ɵfac = function (i) {
      return new (i || t)();
    };
    static ɵdir = ot$1({
      type: t,
      selectors: [
        [``, `cdk-scrollable`, ``],
        [``, `cdkScrollable`, ``],
      ],
    });
  }
  return t;
})();
function Ui(t, r) {}
function Hi(t, r) {
  if (
    (t & 1 &&
      (pl(0, `div`, 2),
      zo(`mousedown.capture.prevent`, function () {
        return 0;
      }),
      Rl(1, `div`, 3),
      eg()),
    t & 2)
  )
    sg(`t-bar_has-horizontal`, Ax()[1]);
}
function Zi(t, r) {
  if (
    (t & 1 &&
      (pl(0, `div`, 4),
      zo(`mousedown.capture.prevent`, function () {
        return 0;
      }),
      Rl(1, `div`, 5),
      eg()),
    t & 2)
  )
    sg(`t-bar_has-vertical`, Ax()[0]);
}
function Gi(t, r) {
  if ((t & 1 && (hx(0, Hi, 2, 2, `div`, 0), hx(1, Zi, 2, 2, `div`, 1)), t & 2)) {
    let e = r;
    (px(e[0] ? 0 : -1), vA(), px(e[1] ? 1 : -1));
  }
}
function $i(t, r) {
  if ((t & 1 && (hx(0, Gi, 2, 2), ER(1, `async`)), t & 2)) {
    let e;
    px((e = wR(1, 1, Ax().refresh$)) ? 0 : -1, e);
  }
}
var Yi = [`*`];
function Ki(t, r) {
  if ((t & 1 && Rl(0, `tui-scroll-controls`, 2), t & 2))
    sg(`t-hover-mode`, Ax().options.mode === `hover`);
}
var ae = new E$1(``, { factory: () => new it$1(v(ie).documentElement) });
var qi = (() => {
  class t {
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: t,
        selectors: [[``, `tuiScrollRef`, ``]],
        features: [Na([pb(ae, it$1)])],
      });
    }
  }
  return t;
})();
var si = (() => {
  class t extends k {
    constructor() {
      (super((e) => this.stream$.subscribe(e)),
        (this.scrollRef = v(ae)),
        (this.stream$ = v(wQ).pipe(
          DT(300, xX()),
          Y$1(() => this.scrollbars),
          _r([!1, !1]),
          zv((e, i) => e[0] === i[0] && e[1] === i[1]),
          NX(),
        )));
    }
    get scrollbars() {
      let {
        clientHeight: e,
        scrollHeight: i,
        clientWidth: n,
        scrollWidth: s,
      } = this.scrollRef.nativeElement;
      return [Math.ceil((e / i) * 100) < 100, Math.ceil((n / s) * 100) < 100];
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
var ai$1 = (() => {
  class t extends k {
    constructor() {
      (super((e) => this.scroll$.subscribe(e)),
        (this.el = qQ()),
        (this.element = v(ae).nativeElement),
        (this.scroll$ = ff(
          T1(this.el.parentElement, `mousedown`).pipe(
            et$2(({ target: e }) => e !== this.el),
            Y$1((e) => this.getScrolled(e, 0.5, 0.5)),
          ),
          T1(this.el, `mousedown`).pipe(
            A1(),
            qe$2((e) => {
              let { ownerDocument: i } = this.el,
                n = this.el.getBoundingClientRect(),
                s = Xi(e, n),
                a = Qi(e, n);
              return T1(i, `mousemove`).pipe(
                Y$1((h) => this.getScrolled(h, s, a)),
                on$1(T1(i, `mouseup`)),
              );
            }),
          ),
        )));
    }
    getScrolled({ clientY: e, clientX: i }, n, s) {
      let { offsetHeight: a, offsetWidth: h } = this.el,
        {
          top: C,
          left: V,
          right: b,
          width: l,
          height: g,
        } = this.el.parentElement.getBoundingClientRect(),
        ce = this.el.matches(`[dir="rtl"] :scope`),
        pi = ce ? b : V,
        mi = ce ? -1 : 1,
        gi = this.element.scrollHeight - g,
        vi = this.element.scrollWidth - l,
        _i = (e - C - a * n) / (g - a),
        Ci = (i - pi - h * s * mi) / (l - h);
      return [gi * _i, vi * Ci];
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
function Xi({ clientY: t }, { top: r, height: e }) {
  return (t - r) / e;
}
function Qi({ clientX: t }, { left: r, width: e }) {
  return (t - r) / e;
}
var Le = 24,
  ci = (() => {
    class t extends k {
      constructor() {
        (super((e) => this.stream$.subscribe(e)),
          (this.scrollRef = v(ae)),
          (this.stream$ = ff(v(wQ).pipe(DT(100, xX())), TX(this.el)).pipe(
            A1(),
            Y$1(() => {
              let e = {
                  scrollTop: this.el.scrollTop,
                  scrollHeight: this.el.scrollHeight,
                  clientHeight: this.el.clientHeight,
                  scrollLeft: this.el.scrollLeft,
                  scrollWidth: this.el.scrollWidth,
                  clientWidth: this.el.clientWidth,
                },
                i = `${this.getThumb(e) * 100}%`,
                n = `${this.getView(e) * 100}%`;
              return this.tuiScrollbar() === `vertical`
                ? { top: i, height: n }
                : { insetInlineStart: i, width: n };
            }),
          )),
          (this.tuiScrollbar = tr(`vertical`)));
      }
      get el() {
        return this.scrollRef.nativeElement;
      }
      getThumb(e) {
        let i = this.getCompensation(e) || this.getView(e);
        return Math.abs(this.getScrolled(e) * (1 - i));
      }
      getView(e) {
        return this.tuiScrollbar() === `vertical`
          ? Math.ceil((e.clientHeight / e.scrollHeight) * 100) / 100
          : Math.ceil((e.clientWidth / e.scrollWidth) * 100) / 100;
      }
      getScrolled(e) {
        return this.tuiScrollbar() === `vertical`
          ? e.scrollTop / (e.scrollHeight - e.clientHeight)
          : e.scrollLeft / (e.scrollWidth - e.clientWidth);
      }
      getCompensation(e) {
        return ((e.clientHeight * e.clientHeight) / e.scrollHeight > Le &&
          this.tuiScrollbar() === `vertical`) ||
          ((e.clientWidth * e.clientWidth) / e.scrollWidth > Le &&
            this.tuiScrollbar() === `horizontal`)
          ? 0
          : this.tuiScrollbar() === `vertical`
            ? Le / e.clientHeight
            : Le / e.clientWidth;
      }
      static {
        this.ɵfac = function (i) {
          return new (i || t)();
        };
      }
      static {
        this.ɵdir = ot$1({
          type: t,
          inputs: { tuiScrollbar: [1, `tuiScrollbar`] },
          features: [ji$1],
        });
      }
    }
    return t;
  })(),
  Ji = (() => {
    class t {
      constructor() {
        ((this.scrollRef = v(ae)),
          (this.style = qQ().style),
          (this.scrollSub = v(ai$1)
            .pipe(fc())
            .subscribe(([e, i]) => {
              ((this.scrollRef.nativeElement.style.scrollBehavior = `auto`),
                this.tuiScrollbar() === `horizontal`
                  ? (this.scrollRef.nativeElement.scrollLeft = i)
                  : (this.scrollRef.nativeElement.scrollTop = e),
                (this.scrollRef.nativeElement.style.scrollBehavior = ``));
            })),
          (this.styleSub = v(ci)
            .pipe(fc())
            .subscribe((e) => Object.assign(this.style, e))),
          (this.tuiScrollbar = tr(`vertical`)));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || t)();
        };
      }
      static {
        this.ɵdir = ot$1({
          type: t,
          selectors: [[``, `tuiScrollbar`, ``]],
          inputs: { tuiScrollbar: [1, `tuiScrollbar`] },
          features: [Na([ai$1]), Ta([{ directive: ci, inputs: [`tuiScrollbar`, `tuiScrollbar`] }])],
        });
      }
    }
    return t;
  })(),
  [li$1, Go] = hb({ mode: `always` }),
  tn = (() => {
    class t {
      constructor() {
        ((this.scrollable = v(oi$1, { optional: !0, host: !0 })),
          (this.el = qQ()),
          (this.nativeScrollbar = v(li$1).mode === `native`),
          (this.refresh$ = v(si)));
      }
      ngOnInit() {
        this.scrollable
          ?.getElementRef()
          .nativeElement.insertBefore(
            this.el,
            this.scrollable.getElementRef().nativeElement.firstChild,
          );
      }
      static {
        this.ɵfac = function (i) {
          return new (i || t)();
        };
      }
      static {
        this.ɵcmp = Vi$1({
          type: t,
          selectors: [[`tui-scroll-controls`]],
          features: [Na([si])],
          decls: 2,
          vars: 1,
          consts: [
            [`tuiAnimated`, ``, 1, `t-bar`, `t-bar_vertical`, 3, `t-bar_has-horizontal`],
            [`tuiAnimated`, ``, 1, `t-bar`, `t-bar_horizontal`, 3, `t-bar_has-vertical`],
            [`tuiAnimated`, ``, 1, `t-bar`, `t-bar_vertical`, 3, `mousedown.capture.prevent`],
            [`tuiScrollbar`, `vertical`, 1, `t-thumb`],
            [`tuiAnimated`, ``, 1, `t-bar`, `t-bar_horizontal`, 3, `mousedown.capture.prevent`],
            [`tuiScrollbar`, `horizontal`, 1, `t-thumb`],
          ],
          template: function (i, n) {
            (i & 1 && hx(0, Ui, 0, 0)(1, $i, 2, 3), i & 2 && px(n.nativeScrollbar ? 0 : 1));
          },
          dependencies: [FO, ei$1, Ji],
          styles: [
            `[_nghost-%COMP%]{position:sticky;z-index:1;display:block;inset-block-start:0;inset-inline-start:0;min-inline-size:calc(100% - 1px);min-block-size:calc(100% - 1px);max-inline-size:calc(100% - 1px);max-block-size:calc(100% - 1px);margin-inline-end:calc(-100% + 1px);pointer-events:none;overflow:hidden;color:var(--%NS%tui-text-primary)}  [tuiScrollable]{scrollbar-width:none;-ms-overflow-style:none}  [tuiScrollable]::-webkit-scrollbar,   [tuiScrollable]::-webkit-scrollbar-thumb{display:none}.t-bar[_ngcontent-%COMP%]{position:absolute;inset-inline-end:0;pointer-events:auto}.t-bar.tui-enter[_ngcontent-%COMP%], .t-bar.tui-leave[_ngcontent-%COMP%]{animation-name:tuiFade}.t-bar_vertical[_ngcontent-%COMP%]{inset-block:.25rem;inline-size:.875rem}.t-bar_horizontal[_ngcontent-%COMP%]{inset-block-end:0;inset-inline-start:0;block-size:.875rem}.t-bar_has-horizontal[_ngcontent-%COMP%]{inset-block-end:.5rem}.t-bar_has-vertical[_ngcontent-%COMP%]{inset-inline-end:.5rem}.t-thumb[_ngcontent-%COMP%]{transition-property:all;transition-duration:.15s;transition-timing-function:var(--%NS%tui-curve-productive-standard);position:absolute;border-radius:6.25rem;border:.25rem solid transparent;cursor:pointer;pointer-events:auto;-webkit-user-select:none;user-select:none;background:currentColor;background-clip:content-box;box-sizing:border-box;transition-property:width,height,opacity;opacity:.2}.t-thumb[_ngcontent-%COMP%]:hover{opacity:.24}.t-thumb[_ngcontent-%COMP%]:active{opacity:.48}.t-bar_vertical[_ngcontent-%COMP%]   .t-thumb[_ngcontent-%COMP%]{inset-inline-end:0;inline-size:.75rem;min-block-size:1.25rem}.t-bar_vertical[_ngcontent-%COMP%]:hover   .t-thumb[_ngcontent-%COMP%], .t-bar_vertical[_ngcontent-%COMP%]   .t-thumb[_ngcontent-%COMP%]:active{inline-size:.875rem}.t-bar_horizontal[_ngcontent-%COMP%]   .t-thumb[_ngcontent-%COMP%]{inset-block-end:0;block-size:.75rem;min-inline-size:1.25rem}.t-bar_horizontal[_ngcontent-%COMP%]:hover   .t-thumb[_ngcontent-%COMP%], .t-bar_horizontal[_ngcontent-%COMP%]   .t-thumb[_ngcontent-%COMP%]:active{block-size:.875rem}`,
          ],
        });
      }
    }
    return t;
  })();
var $o = (() => {
  class t {
    constructor() {
      ((this.el = qQ()),
        (this.options = v(li$1)),
        (this.isIOS = v(G)),
        (this.browserScrollRef = new it$1(this.el)));
    }
    get delegated() {
      return this.scrollRef !== this.el || this.options.mode === `native`;
    }
    get scrollRef() {
      return this.browserScrollRef.nativeElement;
    }
    set scrollRef(e) {
      this.browserScrollRef.nativeElement = e;
    }
    scrollIntoView(e) {
      if (this.delegated) return;
      let { offsetHeight: i, offsetWidth: n } = e,
        { offsetTop: s, offsetLeft: a } = WQ(this.scrollRef, e),
        h = s + i / 2 - this.scrollRef.clientHeight / 2,
        C = a + n / 2 - this.scrollRef.clientWidth / 2;
      this.scrollRef.scrollTo?.(C, h);
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵcmp = Vi$1({
        type: t,
        selectors: [[`tui-scrollbar`]],
        hostVars: 2,
        hostBindings: function (i, n) {
          (i & 1 &&
            zo(`tui-scrollable.stop`, function (a) {
              return (n.scrollRef = a.detail);
            })(`tui-scroll-into-view.stop`, function (a) {
              return n.scrollIntoView(a.detail);
            }),
            i & 2 &&
              sg(
                `_native-hidden`,
                n.options.mode !== `native` && (!n.isIOS || n.options.mode === `hidden`),
              ));
        },
        features: [Na([{ provide: ae, useFactory: () => v(t).browserScrollRef }]), Ta([qi])],
        ngContentSelectors: Yi,
        decls: 3,
        vars: 3,
        consts: [
          [1, `t-bars`, 3, `t-hover-mode`],
          [1, `t-content`],
          [1, `t-bars`],
        ],
        template: function (i, n) {
          (i & 1 && (xx(), hx(0, Ki, 1, 2, `tui-scroll-controls`, 0), pl(1, `div`, 1), Rx(2), eg()),
            i & 2 &&
              (px(!n.isIOS && n.options.mode !== `native` && n.options.mode !== `hidden` ? 0 : -1),
              vA(),
              sg(`t-content_delegated`, n.delegated)));
        },
        dependencies: [tn],
        styles: [
          `[_nghost-%COMP%]{position:relative;display:flex;max-block-size:100%;isolation:isolate;overflow:auto}._native-hidden[_nghost-%COMP%]{scrollbar-width:none;-ms-overflow-style:none}._native-hidden[_nghost-%COMP%]::-webkit-scrollbar, ._native-hidden[_nghost-%COMP%]::-webkit-scrollbar-thumb{display:none}[_nghost-%COMP%]   .t-hover-mode[_ngcontent-%COMP%]:not(:active){transition-property:opacity;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard);opacity:0}[_nghost-%COMP%]:hover > .t-hover-mode[_ngcontent-%COMP%]{transition-property:opacity;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard);opacity:1}.t-content[_ngcontent-%COMP%]{isolation:isolate;flex:1;flex-basis:auto;inline-size:100%;block-size:max-content}.t-content_delegated[_ngcontent-%COMP%]{block-size:100%}.t-bars[_ngcontent-%COMP%]{color:var(--%NS%tui-text-primary)}`,
        ],
      });
    }
  }
  return t;
})();
var nn = { position: `fixed`, visibility: `hidden`, pointerEvents: `none` };
var rn = {
  height: `fit-content`,
  lineHeight: `1em`,
  fontSize: `calc(env(preferred-text-scale) * 1em)`,
};
function di$1(t, r = globalThis.document.createElement(`iframe`)) {
  let e = () => {
    let {
      innerWidth: s = 0,
      outerWidth: a = 0,
      devicePixelRatio: h = 0,
    } = r.ownerDocument.defaultView || {};
    r.width = `${s === a ? s : s / h}`;
  };
  (r.ownerDocument.body.append(r), r.ownerDocument.defaultView?.addEventListener(`resize`, e));
  let i = r.contentDocument,
    n = new ResizeObserver(() => t(i?.body.offsetHeight || 0));
  return (
    Object.assign(r.style, nn),
    Object.assign(i?.body.style || {}, rn),
    i?.head.insertAdjacentHTML(`beforeend`, `<meta name="text-scale" content="scale">`),
    i?.documentElement.style.setProperty(`font`, `-apple-system-body`),
    i?.body.insertAdjacentText(`beforeend`, `.`.repeat(1e3)),
    n.observe(i?.body || r),
    e(),
    () => {
      (n.disconnect(), r.ownerDocument.defaultView?.removeEventListener(`resize`, e), r.remove());
    }
  );
}
var qe$1 = new E$1(``);
var ts = (() => {
  class t {
    constructor() {
      ((this.handler = v(qe$1, { optional: !0 })),
        (this.enabled =
          !v(t, { optional: !0, skipSelf: !0 }) && sw(v(bi$1)) && typeof ResizeObserver < `u`),
        (this.nothing = v(J$1).onDestroy(
          this.enabled && this.handler ? di$1(this.handler, v(ie).createElement(`iframe`)) : lX,
        )));
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
var Xe$1 = class extends CustomEvent {
  constructor(r, s) {
    var a = s,
      { clientX: e, clientY: i } = a,
      n = n$1(a, [`clientX`, `clientY`]);
    super(r, m(l$1({}, n), { detail: { clientX: e, clientY: i } }));
  }
};
var on = ({ userAgent: t, maxTouchPoints: r }) =>
  /ipad|iphone|ipod/i.test(t) || (/^((?!chrome|android).)*safari/i.test(t) && r > 1);
var sn = 700;
var ui$1 = typeof navigator > `u` ? null : navigator;
var an = 15;
var Qe$1 = class extends Qo {
  constructor() {
    (super(...arguments), (this.isIOS = !!ui$1 && on(ui$1)));
  }
  addEventListener(r, e, i) {
    let n = this.isIOS ? this.listenTouchEvents(r) : this.listenContextmenuEvent(r);
    return (
      r.addEventListener(`longtap`, i),
      () => {
        (n(), r.removeEventListener(`longtap`, i));
      }
    );
  }
  supports(r) {
    return r === `longtap`;
  }
  listenContextmenuEvent(r) {
    return this.manager.addEventListener(
      r,
      `contextmenu.prevent.stop`,
      ({ clientX: e, clientY: i }) => {
        this.dispatchLongtapEvent(r, e, i);
      },
    );
  }
  listenTouchEvents(r) {
    let e = null,
      i = null,
      n = () => {
        (clearTimeout(e), (i = null), (e = null));
      },
      s = this.manager.addEventListener(r, `touchstart.zoneless.passive`, ({ touches: V }) => {
        let b = V[0];
        if (!b) return;
        let { clientX: l, clientY: g } = b;
        ((i = { clientX: l, clientY: g }),
          (e = setTimeout(() => {
            (this.dispatchLongtapEvent(r, l, g), n());
          }, sn)));
      }),
      a = this.manager.addEventListener(r, `touchmove.zoneless.passive`, ({ touches: V }) => {
        let b = V[0];
        if (!b || !i) return;
        let { clientX: l, clientY: g } = b;
        Math.hypot(l - i.clientX, g - i.clientY) <= an || n();
      }),
      h = this.manager.addEventListener(r, `touchcancel.zoneless.passive`, n),
      C = this.manager.addEventListener(r, `touchend.zoneless.passive`, n);
    return () => {
      (s(), a(), h(), C());
    };
  }
  dispatchLongtapEvent(r, e, i) {
    r.dispatchEvent(
      new Xe$1(`longtap`, { clientX: e, clientY: i, bubbles: !1, cancelable: !1, composed: !1 }),
    );
  }
};
var Pe = class extends Qo {
  supports(r) {
    return this.regExp.test(r);
  }
  getDelay(r) {
    let e = this.regExp.exec(r);
    if (!e?.groups) throw new Error(`Invalid event: ${r}`);
    let { time: i, units: n } = e.groups;
    switch (n) {
      case `ms`:
        return Number(i);
      case `s`:
        return Number(i) * 1e3;
      default:
        throw new Error(`Invalid event: ${r}`);
    }
  }
  unwrap(r) {
    return r.replace(this.regExp, ``);
  }
};
var Je$1 = class extends Pe {
  constructor() {
    (super(...arguments), (this.regExp = /\.debounce~(?<time>\d+)(?<units>ms|s)/));
  }
  addEventListener(r, e, i) {
    let n,
      s = this.manager.addEventListener(r, this.unwrap(e), (a) => {
        (clearTimeout(n),
          (n = setTimeout(() => {
            i(a);
          }, this.getDelay(e))));
      });
    return () => {
      (clearTimeout(n), s());
    };
  }
};
var Y = (() => {
  class t extends Qo {
    constructor() {
      super(v(ie));
    }
    supports(e) {
      return e.includes(this.modifier);
    }
    unwrap(e) {
      return e
        .split(`.`)
        .filter((i) => !this.modifier.includes(i))
        .join(`.`);
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
var cn = new E$1(``, {
  factory: () => {
    let t = v(ie);
    return (r) => r.split(`.`).reduce((e, i) => e?.[i], t.defaultView);
  },
});
var ln = (() => {
  class t extends Y {
    constructor() {
      (super(...arguments), (this.handler = v(cn)), (this.modifier = `>`));
    }
    addEventListener(e, i, n) {
      return this.manager.addEventListener(
        this.handler(i.split(`>`)[0]),
        i.split(`>`)?.[1] ?? ``,
        n,
      );
    }
    static {
      this.ɵfac = (() => {
        let e;
        return function (n) {
          return (e || (e = ya(t)))(n || t);
        };
      })();
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac });
    }
  }
  return t;
})();
var dn = (() => {
  class t extends Y {
    constructor() {
      (super(...arguments), (this.modifier = `capture.once.passive`));
    }
    supports(e) {
      return e.includes(`.`) && !this.unwrap(e).includes(`.`);
    }
    addEventListener(e, i, n) {
      let s = this.unwrap(i),
        a = i.includes(`.capture`);
      return (
        e.addEventListener(s, n, {
          capture: a,
          once: i.includes(`.once`),
          passive: i.includes(`.passive`),
        }),
        () => e.removeEventListener(s, n, { capture: a })
      );
    }
    static {
      this.ɵfac = (() => {
        let e;
        return function (n) {
          return (e || (e = ya(t)))(n || t);
        };
      })();
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac });
    }
  }
  return t;
})();
var un = (() => {
  class t extends Y {
    constructor() {
      (super(...arguments), (this.modifier = `.prevent`));
    }
    addEventListener(e, i, n) {
      return this.manager.addEventListener(e, this.unwrap(i), (s) => {
        (s.preventDefault(), n(s));
      });
    }
    static {
      this.ɵfac = (() => {
        let e;
        return function (n) {
          return (e || (e = ya(t)))(n || t);
        };
      })();
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac });
    }
  }
  return t;
})();
var hn = (() => {
  class t extends Y {
    constructor() {
      (super(...arguments), (this.modifier = `resize`));
    }
    supports(e) {
      return e === `resize`;
    }
    addEventListener(e, i, n) {
      if (typeof ResizeObserver > `u` || !(e instanceof Element))
        return (e.addEventListener(i, n), () => e.removeEventListener(i, n));
      let s = new ResizeObserver(n);
      return (s.observe(e), () => s.disconnect());
    }
    static {
      this.ɵfac = (() => {
        let e;
        return function (n) {
          return (e || (e = ya(t)))(n || t);
        };
      })();
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac });
    }
  }
  return t;
})();
var fn = (() => {
  class t extends Y {
    constructor() {
      (super(...arguments), (this.modifier = `.self`));
    }
    addEventListener(e, i, n) {
      return this.manager.addEventListener(e, this.unwrap(i), (s) => {
        s.target === s.currentTarget && n(s);
      });
    }
    static {
      this.ɵfac = (() => {
        let e;
        return function (n) {
          return (e || (e = ya(t)))(n || t);
        };
      })();
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac });
    }
  }
  return t;
})();
var pn = (() => {
  class t extends Y {
    constructor() {
      (super(...arguments), (this.modifier = `.stop`));
    }
    addEventListener(e, i, n) {
      return this.manager.addEventListener(e, this.unwrap(i), (s) => {
        (s.stopPropagation(), n(s));
      });
    }
    static {
      this.ɵfac = (() => {
        let e;
        return function (n) {
          return (e || (e = ya(t)))(n || t);
        };
      })();
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac });
    }
  }
  return t;
})();
var et$1 = class extends Pe {
  constructor() {
    (super(...arguments), (this.regExp = /\.throttle~(?<time>\d+)(?<units>ms|s)/));
  }
  addEventListener(r, e, i) {
    let n,
      s = this.manager.addEventListener(r, this.unwrap(e), (a) => {
        n === void 0 &&
          (i(a),
          (n = setTimeout(() => {
            n = void 0;
          }, this.getDelay(e))));
      });
    return () => {
      (clearTimeout(n), s());
    };
  }
};
var vn = [
  (() => {
    class t extends Y {
      constructor() {
        (super(...arguments), (this.modifier = `.zoneless`));
      }
      addEventListener(e, i, n) {
        return (
          (t.ngZone = this.manager.getZone()),
          t.ngZone?.runOutsideAngular(() => this.manager.addEventListener(e, this.unwrap(i), n))
        );
      }
      static {
        this.ɵfac = (() => {
          let e;
          return function (n) {
            return (e || (e = ya(t)))(n || t);
          };
        })();
      }
      static {
        this.ɵprov = q({ token: t, factory: t.ɵfac });
      }
    }
    return t;
  })(),
  fn,
  ln,
  dn,
  un,
  hn,
  pn,
  Qe$1,
  Je$1,
  et$1,
].map((t) => ({ provide: Wa, multi: !0, useClass: t }));
function hi$1() {
  return vn;
}
var _n = new E$1(``, { factory: () => H$1(0) });
function Cn() {
  return {
    provide: qe$1,
    useFactory: () => {
      let t = v(_n),
        { documentElement: r } = v(ie);
      return (e) => {
        let i = sQ(e, 17, 28) - 17;
        return (t.set(i), r.style.setProperty(`--t-font-offset`, String(i)));
      };
    },
  };
}
var Sn = 300;
function _s(t) {
  return t && Sn / t;
}
var yn = [
  `Spacebar`,
  `Backspace`,
  `Delete`,
  `ArrowLeft`,
  `ArrowRight`,
  `Left`,
  `Right`,
  `End`,
  `Home`,
];
function Cs(t = ``) {
  return t.length === 1 || yn.includes(t);
}
function Ss(t, r = `tui-popups`) {
  return !!zQ(t)?.some((e) => !e.closest(r));
}
var wn = { apis: `stable`, fontScaling: !0, scrollbars: `custom` };
var fi = new E$1(``);
function ys(t = {}) {
  let r = l$1(l$1({}, wn), t),
    e = [
      { provide: dw, useValue: !1 },
      { provide: fi, useValue: r },
      hi$1(),
      OE(() => {
        let i = v(ie),
          n = v(CZ),
          s = v(qX);
        (r.scrollbars === `custom` && i.documentElement.classList.add(`tui-zero-scrollbar`),
          ub(r.mode) && s.set(r.mode === `dark`),
          r.fontScaling &&
            !n.getTag(`name="text-scale"`) &&
            n.addTag({ name: `text-scale`, content: `scale` }),
          Yt$2(() => {
            s() ? i.body.setAttribute(`tuiTheme`, `dark`) : i.body.removeAttribute(`tuiTheme`);
          }));
      }),
    ];
  return (r.fontScaling && e.push(Cn()), e);
}
var ws = new E$1(``, {
  factory: () => {
    let { apis: t } = v(fi);
    return t !== `stable` && (t.all || !!t.liquidGlass);
  },
});
function bs(t, r) {
  return (e, i) => {
    let n = e || l$1({}, i || r);
    return (
      Object.keys(t).forEach((s) => {
        n[s] = t[s];
      }),
      n
    );
  };
}
var bn = [`*`];
var En = (() => {
  class t extends ke {
    static {
      this.ɵfac = (() => {
        let e;
        return function (n) {
          return (e || (e = ya(t)))(n || t);
        };
      })();
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
    }
  }
  return t;
})();
var Dn = `_tuiCdr`;
var xs = (() => {
  class t extends ti$1 {
    ngAfterViewChecked() {
      for (let e = 0; e < this.anchor().vcr.length; e++) {
        let i = this.anchor().vcr.get(e);
        On(i) && i.context?.[Dn]?.markForCheck();
      }
    }
    static {
      this.ɵfac = (() => {
        let e;
        return function (n) {
          return (e || (e = ya(t)))(n || t);
        };
      })();
    }
    static {
      this.ɵcmp = Vi$1({
        type: t,
        selectors: [[`tui-popups`]],
        features: [Na([pb(ke, En)]), ji$1],
        ngContentSelectors: bn,
        decls: 2,
        vars: 0,
        consts: [[`tuiVCR`, ``]],
        template: function (i, n) {
          i & 1 && (xx(), Rx(0), BE(1, 0));
        },
        dependencies: [ve],
        styles: [
          `[_nghost-%COMP%]{position:fixed;inset-block-start:0;inset-inline-start:0;inline-size:100%;block-size:100%;display:grid;grid-template-rows:repeat(14,min-content) 1fr;pointer-events:none;overflow:hidden;overflow-wrap:break-word;box-sizing:border-box;padding:env(safe-area-inset-top) env(safe-area-inset-left) env(safe-area-inset-bottom) env(safe-area-inset-right)}[_nghost-%COMP%]    >*{pointer-events:auto}[_nghost-%COMP%]:after{content:"";grid-row:15}`,
        ],
        changeDetection: 1,
      });
    }
  }
  return t;
})();
function On(t) {
  return !!t && `context` in t;
}
function Tn(t) {
  return !!t && (Rn(t) || Tn(t.parentElement));
}
function Rn(t) {
  return t.ownerDocument.defaultView?.getComputedStyle(t).getPropertyValue(`position`) === `fixed`;
}
function Ms({ document: t, innerWidth: r }) {
  return Math.max(t.documentElement.clientWidth || 0, r || 0);
}
var V = class {
    constructor(a, t) {
      ((this.el = a), (this.options = t));
    }
    get element() {
      return this.el.nativeElement.querySelector(this.options.query) ?? this.el.nativeElement;
    }
    get isTextFieldElement() {
      return this.element.matches(this.options.query);
    }
  },
  it = 1e3,
  at = `.ng-animating`,
  ee$1 = class extends V {
    constructor(a, t, i, o) {
      (super(a, o), (this.animationFrame$ = t), (this.zone = i));
    }
    setFocus() {
      this.isTextFieldElement
        ? cT(
            jn(this.options.delay || it),
            this.animationFrame$.pipe(
              DT(100, xX(this.zone)),
              Y$1(() => this.element.closest(at)),
              _T(Boolean),
              yt(1),
            ),
          ).subscribe(() => this.element.focus({ preventScroll: this.options.preventScroll }))
        : this.element.focus({ preventScroll: !0 });
    }
  },
  ot = [
    `type`,
    `inputMode`,
    `autocomplete`,
    `accept`,
    `min`,
    `max`,
    `step`,
    `pattern`,
    `size`,
    `maxlength`,
  ],
  te$1 = class extends V {
    constructor(a, t, i, o, l) {
      (super(a, l), (this.renderer = t), (this.zone = i), (this.win = o));
    }
    setFocus() {
      this.isTextFieldElement
        ? this.zone.runOutsideAngular(() => this.iosWebkitAutofocus())
        : this.element.focus({ preventScroll: !0 });
    }
    iosWebkitAutofocus() {
      let a = this.makeFakeInput(),
        t = this.getDurationTimeBeforeFocus(),
        i = 0,
        o = 0,
        l = () => a.focus({ preventScroll: !0 }),
        r = () => {
          (clearTimeout(i),
            (i = this.win.setTimeout(() => {
              (clearTimeout(o),
                a.removeEventListener(`blur`, l),
                a.removeEventListener(`focus`, r),
                (o = this.win.setTimeout(() => {
                  (this.element.focus({ preventScroll: this.options.preventScroll }), a.remove());
                }, t)));
            })));
        };
      (a.addEventListener(`blur`, l, { once: !0 }),
        a.addEventListener(`focus`, r),
        this.insideDialog()
          ? this.win.document.body.appendChild(a)
          : this.element.parentElement?.appendChild(a),
        a.focus({ preventScroll: !0 }));
    }
    makeFakeInput() {
      let a = this.renderer.createElement(`input`),
        t = this.element.getBoundingClientRect();
      return (
        this.patchFakeInputFromFocusableElement(a),
        (a.style.height = hQ(t.height)),
        (a.style.width = hQ(t.width / 2)),
        (a.style.position = `fixed`),
        (a.style.zIndex = `-99999999`),
        (a.style.caretColor = `transparent`),
        (a.style.border = `none`),
        (a.style.outline = `none`),
        (a.style.color = `transparent`),
        (a.style.background = `transparent`),
        (a.style.cursor = `none`),
        (a.style.fontSize = hQ(16)),
        (a.style.top = hQ(t.top)),
        (a.style.left = hQ(t.left)),
        a
      );
    }
    getDurationTimeBeforeFocus() {
      return (
        Number.parseFloat(
          this.win.getComputedStyle(this.element).getPropertyValue(`--tui-duration`),
        ) || 0
      );
    }
    insideDialog() {
      return !!this.element.closest(`tui-dialog`);
    }
    patchFakeInputFromFocusableElement(a) {
      ot.forEach((t) => {
        let i = this.element.getAttribute(t);
        ub(i) && a.setAttribute(t, i);
      });
    }
  },
  [Xe, Dt$1] = hb({
    delay: NaN,
    query: `input, textarea, select, [contenteditable]`,
    preventScroll: !1,
  }),
  Ge = new E$1(``),
  nt = [
    {
      provide: Ge,
      deps: [it$1, wQ, An$1, Se$1, lr, G, Xe],
      useFactory: (e, a, t, i, o, l, r) => (l ? new te$1(e, t, i, o, r) : new ee$1(e, a, i, r)),
    },
  ],
  Ze = (() => {
    class e {
      constructor() {
        ((this.handler = v(Ge)),
          (this.options = v(Xe)),
          (this.destroyRef = v(J$1)),
          (this.autoFocus = tr(void 0, { alias: `tuiAutoFocus`, transform: xQ })));
      }
      ngAfterViewInit() {
        this.autoFocus() && this.focus();
      }
      focus() {
        Number.isNaN(this.options.delay)
          ? Promise.resolve().then(() => this.handler.setFocus())
          : jn(this.options.delay)
              .pipe(fc(this.destroyRef))
              .subscribe(() => this.handler.setFocus());
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)();
        };
      }
      static {
        this.ɵdir = ot$1({
          type: e,
          selectors: [[``, `tuiAutoFocus`, ``]],
          inputs: { autoFocus: [1, `tuiAutoFocus`, `autoFocus`] },
          features: [Na(nt)],
        });
      }
    }
    return e;
  })();
var rt = (() => {
  class e {
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵcmp = Vi$1({
        type: e,
        selectors: [[`ng-component`]],
        exportAs: [`tui-title-5.19.0`],
        decls: 0,
        vars: 0,
        template: function (i, o) {},
        styles: [
          `*:where([tuiTitle][data-tui-version="5.19.0"]){position:relative;display:flex;min-inline-size:0;flex-direction:column;text-align:start;gap:.25rem;margin:0;padding:0;border:0;font:var(--%NS%tui-typography-ui-m)}*:where([tuiTitle][data-tui-version="5.19.0"]) :where([tuiSubtitle]){font:var(--%NS%tui-typography-ui-s);margin:0;padding:0}*:where([tuiTitle][data-tui-version="5.19.0"]) :where([tuiSubtitle]):is(legend){margin-block-end:.25rem}*:where([tuiTitle][data-tui-version="5.19.0"]):where([data-size=s]){gap:.125rem;font:var(--%NS%tui-typography-body-s)}*:where([tuiTitle][data-tui-version="5.19.0"]):where([data-size=s]) [tuiSubtitle]{font:var(--%NS%tui-typography-body-xs)}*:where([tuiTitle][data-tui-version="5.19.0"]):where([data-size=s]) [tuiSubtitle]:is(legend){margin-block-end:.125rem}*:where([tuiTitle][data-tui-version="5.19.0"]):where([data-size=m]){gap:.125rem;font:var(--%NS%tui-typography-heading-h5)}*:where([tuiTitle][data-tui-version="5.19.0"]):where([data-size=m]) [tuiSubtitle]{font:var(--%NS%tui-typography-body-m)}*:where([tuiTitle][data-tui-version="5.19.0"]):where([data-size=m]) [tuiSubtitle]:is(legend){margin-block-end:.125rem}*:where([tuiTitle][data-tui-version="5.19.0"]):where([data-size=l]){gap:.5rem;font:var(--%NS%tui-typography-heading-h3)}*:where([tuiTitle][data-tui-version="5.19.0"]):where([data-size=l]) [tuiSubtitle]{font:var(--%NS%tui-typography-body-m)}*:where([tuiTitle][data-tui-version="5.19.0"]):where([data-size=l]) [tuiSubtitle]:is(legend){margin-block-end:.5rem}*:where([tuiTitle][data-tui-version="5.19.0"]) h1,*:where([tuiTitle][data-tui-version="5.19.0"]) h2,*:where([tuiTitle][data-tui-version="5.19.0"]) h3,*:where([tuiTitle][data-tui-version="5.19.0"]) h4,*:where([tuiTitle][data-tui-version="5.19.0"]) h5,*:where([tuiTitle][data-tui-version="5.19.0"]) h6{margin:0;font:inherit}[tuiButton]:where(*[data-tui-version="5.19.0"]) [tuiTitle]{margin-inline-end:auto}[tuiButton]:where(*[data-tui-version="5.19.0"]) [tuiTitle] [tuiSubtitle]{color:var(--%NS%tui-text-secondary)}
`,
        ],
        encapsulation: 2,
      });
    }
  }
  return e;
})();
var qe = (() => {
  class e {
    constructor() {
      ((this.nothing = db(rt)), (this.tuiTitle = tr(``)));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: e,
        selectors: [[``, `tuiTitle`, ``]],
        hostAttrs: [`data-tui-version`, `5.19.0`, `tuiTitle`, ``],
        hostVars: 1,
        hostBindings: function (i, o) {
          i & 2 && kr(`data-size`, o.tuiTitle() || null);
        },
        inputs: { tuiTitle: [1, `tuiTitle`] },
      });
    }
  }
  return e;
})();
var Ye = (() => {
  class e {
    constructor() {
      ((this.doc = v(ie)),
        (this.el = qQ()),
        (this.activeElement = null),
        (this.initialized = !1),
        Promise.resolve().then(() => {
          ((this.initialized = !0), (this.activeElement = G$2(this.doc)), this.el.focus());
        }));
    }
    ngOnDestroy() {
      ((this.initialized = !1), g1(this.activeElement) && this.activeElement.focus());
    }
    onFocusIn(t) {
      let { firstElementChild: i } = this.el;
      !HQ(this.el, t) && i && _t({ initial: i, root: this.el })?.focus();
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: e,
        selectors: [[``, `tuiFocusTrap`, ``]],
        hostAttrs: [`tabIndex`, `0`],
        hostBindings: function (i, o) {
          i & 1 &&
            zo(`pointerdown`, function (r) {
              return r.currentTarget == null ? null : r.currentTarget.removeAttribute(`tabindex`);
            })(
              `focusin.zoneless`,
              function (r) {
                return o.initialized && o.onFocusIn(r.target);
              },
              AM,
            );
        },
      });
    }
  }
  return e;
})();
function lt(e, a) {
  e & 1 && BE(0);
}
var ut = (() => {
  class e {
    constructor() {
      ((this.current = v(vr)),
        (this.parent = Ke(v(vr, { skipSelf: !0 }), G$2(v(ie)))),
        (this.context = Nn()),
        (this.component = H$1(null)));
    }
    ngOnInit() {
      this.current.tuiActiveZoneParentSetter = this.parent;
    }
    ngOnDestroy() {
      this.current.tuiActiveZoneParentSetter = null;
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵcmp = Vi$1({
        type: e,
        selectors: [[`tui-modal`]],
        hostAttrs: [
          `aria-modal`,
          `true`,
          `data-tui-version`,
          `5.19.0`,
          `role`,
          `dialog`,
          1,
          `tui-enter`,
        ],
        hostVars: 1,
        hostBindings: function (i, o) {
          (i & 1 &&
            zo(`animationend.self`, function (r) {
              return r.target.classList.remove(`tui-enter`);
            }),
            i & 2 && kr(`aria-labelledby`, o.context.id));
        },
        features: [Ta([vr, Ye])],
        decls: 3,
        vars: 2,
        consts: [
          [`tuiScrollRef`, ``],
          [4, `polymorpheusOutlet`, `polymorpheusOutletContext`],
          [1, `t-scrollbars`],
        ],
        template: function (i, o) {
          (i & 1 &&
            (pl(0, `div`, 0),
            FE(1, lt, 1, 0, `ng-container`, 1),
            Rl(2, `tui-scroll-controls`, 2),
            eg()),
            i & 2 &&
              (vA(),
              VE(`polymorpheusOutlet`, o.component())(`polymorpheusOutletContext`, o.context)));
        },
        dependencies: [Yt$1, tn, qi],
        styles: [
          `@keyframes tuiModalBackdrop{0%{-webkit-backdrop-filter:none;backdrop-filter:none}to{-webkit-backdrop-filter:brightness(.25);backdrop-filter:brightness(.25)}}@keyframes tuiDummy{to{color:currentColor}}tui-modal:where(*[data-tui-version="5.19.0"]){scrollbar-width:none;-ms-overflow-style:none;position:fixed;inset:0;outline:none;overflow:auto;overscroll-behavior:none;transform:translateY(var(--%NS%t-root-top))}tui-modal:where(*[data-tui-version="5.19.0"])::-webkit-scrollbar,tui-modal:where(*[data-tui-version="5.19.0"])::-webkit-scrollbar-thumb{display:none}tui-modal:where(*[data-tui-version="5.19.0"]):not(:last-of-type){interactivity:inert}tui-modal:where(*[data-tui-version="5.19.0"]).tui-enter,tui-modal:where(*[data-tui-version="5.19.0"]).tui-leave{animation-name:tuiDummy}@supports not (selector(:has(*))) or not (selector(:nth-child(1 of *))){tui-modal:where(*[data-tui-version="5.19.0"]):last-of-type:not(.tui-leave):before{-webkit-backdrop-filter:brightness(.25);backdrop-filter:brightness(.25)}tui-modal:where(*[data-tui-version="5.19.0"]):last-of-type.tui-enter,tui-modal:where(*[data-tui-version="5.19.0"]):last-of-type.tui-leave{animation-name:tuiDummy}tui-modal:where(*[data-tui-version="5.19.0"]):last-of-type.tui-enter:before,tui-modal:where(*[data-tui-version="5.19.0"]):last-of-type.tui-leave:before{animation-name:tuiModalBackdrop}}@supports (selector(:has(*))){tui-modal:where(*[data-tui-version="5.19.0"]):nth-last-child(1 of tui-modal:not(.tui-leave):not(:has(.tui-backdrop-hidden))):before{-webkit-backdrop-filter:brightness(.25);backdrop-filter:brightness(.25)}tui-modal:where(*[data-tui-version="5.19.0"]):nth-last-child(1 of tui-modal:not(:has(.tui-backdrop-hidden))):is(.tui-enter,.tui-leave){animation-name:tuiDummy}tui-modal:where(*[data-tui-version="5.19.0"]):nth-last-child(1 of tui-modal:not(:has(.tui-backdrop-hidden))):is(.tui-enter,.tui-leave):before{animation-name:tuiModalBackdrop}}tui-modal:where(*[data-tui-version="5.19.0"]):before{transition-property:backdrop-filter;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard);content:"";position:sticky;inset:0;display:block;block-size:200%;transition-timing-function:linear;animation-duration:var(--%NS%tui-duration);animation-timing-function:cubic-bezier(.14,.52,.35,.84);perspective:10rem}tui-modal:where(*[data-tui-version="5.19.0"]).tui-leave:before{animation-direction:reverse}tui-modal:where(*[data-tui-version="5.19.0"])>[tuiScrollRef]{scrollbar-width:none;-ms-overflow-style:none;position:sticky;inset:0;display:grid;place-items:center;block-size:100%;overflow:auto;overscroll-behavior:none}tui-modal:where(*[data-tui-version="5.19.0"])>[tuiScrollRef]::-webkit-scrollbar,tui-modal:where(*[data-tui-version="5.19.0"])>[tuiScrollRef]::-webkit-scrollbar-thumb{display:none}tui-modal:where(*[data-tui-version="5.19.0"])>[tuiScrollRef]>.t-scrollbars{position:fixed;inset:0;margin:0;color:#747474}tui-modal:where(*[data-tui-version="5.19.0"])>[tuiScrollRef]>.t-scrollbars .t-bar_horizontal,tui-modal:where(*[data-tui-version="5.19.0"])>[tuiScrollRef]>.t-scrollbars .t-bar_vertical .t-thumb[style*="height: 100%"]{display:none}tui-modal:where(*[data-tui-version="5.19.0"])>[tuiScrollRef]>.tui-enter+.t-scrollbars .t-bar_vertical,tui-modal:where(*[data-tui-version="5.19.0"])>[tuiScrollRef]>.tui-leave+.t-scrollbars .t-bar_vertical{display:none}
`,
        ],
        encapsulation: 2,
        changeDetection: 1,
      });
    }
  }
  return e;
})();
function Ke(e, a) {
  if (!a || !e.contains(a)) return null;
  let t = e.children.find((i) => !i.el.matches(`[tuiActiveZoneAdapter]`) && i.contains(a));
  return t ? Ke(t, a) : e;
}
var Qe = (() => {
  class e extends zr {
    constructor() {
      (super(v(En)), (this.component = ut));
    }
    add(t) {
      let i = this.service.add(t),
        o = i.location.nativeElement;
      return (
        o.closest(`tui-root`)?.firstElementChild?.setAttribute(`inert`, ``),
        i.instance.component.set(new oe(this.content)),
        () => {
          (i.instance.component.set(null),
            i.changeDetectorRef.detectChanges(),
            o.classList.add(Jt$1),
            Promise.allSettled(Je(o))
              .then(async () => Promise.allSettled(Je(o.firstElementChild?.firstElementChild)))
              .then(() => {
                (o.closest(`tui-root`)?.firstElementChild?.removeAttribute(`inert`),
                  i.destroy(),
                  o.remove());
              }));
        }
      );
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵprov = q({ token: e, factory: e.ɵfac });
    }
  }
  return e;
})();
function Je(e) {
  return e?.getAnimations?.().map(async ({ finished: a }) => a) || [];
}
function dt(e, a) {
  if (e & 1) {
    let t = Ix();
    (pl(0, `button`, 2),
      zo(`click`, function () {
        By(t);
        return Hy(Ax().close$.next());
      }),
      sR(1),
      eg());
  }
  if (e & 2) {
    let t = Ax();
    (VE(`appearance`, t.context.appearance.includes(`fullscreen`) ? `action` : `neutral`),
      vA(),
      ag(` `, t.close(), ` `));
  }
}
function ct(e, a) {
  if ((e & 1 && (pl(0, `header`)(1, `hgroup`, 3), Rl(2, `h2`, 4), eg()()), e & 2)) {
    let t = Ax();
    (vA(2), VE(`id`, t.context.id)(`innerHTML`, t.context.label, SM));
  }
}
function pt(e, a) {
  if (e & 1) {
    let t = Ix();
    (pl(0, `footer`)(1, `button`, 6),
      zo(`click`, function () {
        By(t);
        return Hy(Ax(2).context.$implicit.complete());
      }),
      sR(2),
      eg()());
  }
  if (e & 2) {
    let t = Ax(2);
    (vA(2), ag(` `, t.context.data || `OK`, ` `));
  }
}
function mt(e, a) {
  if (
    (e & 1 &&
      (rg(0),
      pl(1, `header`)(2, `hgroup`, 3),
      Rl(3, `h2`, 4)(4, `p`, 5),
      eg()(),
      hx(5, pt, 3, 1, `footer`),
      ig()),
    e & 2)
  ) {
    let t = a.polymorpheusOutlet,
      i = Ax();
    (vA(3),
      VE(`id`, i.context.id)(`innerHTML`, i.context.label, SM),
      vA(),
      VE(`innerHTML`, t, SM),
      vA(),
      px(i.context.closable || i.context.dismissible ? 5 : -1));
  }
}
var ht = new E$1(``, { factory: () => v(hs).events.pipe(et$2((e) => e instanceof yd)) });
var et = (() => {
  class e extends k {
    constructor() {
      (super((t) => ff(this.esc$, this.mousedown$, this.watcher$).subscribe(t)),
        (this.win = v(lr)),
        (this.doc = v(ie)),
        (this.el = qQ()),
        (this.esc$ = T1(this.doc, `keydown`).pipe(
          et$2((t) => {
            let i = GQ(t);
            return (
              typeof CloseWatcher > `u` &&
              t.key?.toLowerCase() === `escape` &&
              !t.defaultPrevented &&
              (this.el.contains(i) || this.isOutside(i))
            );
          }),
        )),
        (this.mousedown$ = T1(this.doc, `mousedown`).pipe(
          et$2((t) => Ms(this.win) - t.clientX > 17 && this.shouldClose(t)),
          qe$2(() =>
            T1(this.doc, `mouseup`).pipe(
              yt(1),
              et$2((t) => this.shouldClose(t)),
            ),
          ),
        )),
        (this.watcher$ = IX().pipe(M1())));
    }
    isOutside(t) {
      return $Q(t) && !HQ(this.el, t);
    }
    shouldClose(t) {
      let i = GQ(t);
      return this.isOutside(i) || (i === this.el && this.isOutsideRect(t));
    }
    isOutsideRect({ clientX: t, clientY: i }) {
      let o = this.el.getBoundingClientRect();
      return t < o.left || t > o.right || i < o.top || i > o.bottom;
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵprov = q({ token: e, factory: e.ɵfac });
    }
  }
  return e;
})();
var ft = new Error(`Required dialog was dismissed`);
function tt(e) {
  return Jc(e) ? e : z$2(e);
}
var gt = (() => {
    class e {
      constructor() {
        ((this.close$ = new ue()),
          (this.close = v(ZX)),
          (this.icons = v(zX)),
          (this.context = Nn()),
          (this.primitive =
            typeof this.context.content == `function` ||
            Object(this.context.content) !== this.context.content),
          (this.sub = ff(
            this.close$.pipe(qe$2(() => tt(this.context.closable))),
            v(et).pipe(Yv(() => tt(this.context.dismissible).pipe(yt(1)))),
            v(ht).pipe(Y$1(hX)),
          )
            .pipe(et$2(Boolean), fc())
            .subscribe(() => {
              this.context.required
                ? this.context.$implicit.error(ft)
                : this.context.$implicit.complete();
            })));
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)();
        };
      }
      static {
        this.ɵcmp = Vi$1({
          type: e,
          selectors: [[`tui-dialog`]],
          hostAttrs: [`data-tui-version`, `5.19.0`],
          hostVars: 6,
          hostBindings: function (i, o) {
            i & 2 &&
              (kr(`data-appearance`, o.context.appearance)(`data-size`, o.context.size),
              sg(`_closable`, o.context.closable)(
                `tui-backdrop-hidden`,
                o.context.appearance.includes(`fullscreen`),
              ));
          },
          features: [Na([et]), Ta([ei$1])],
          decls: 3,
          vars: 4,
          consts: [
            [`tabindex`, `0`, `tuiButtonX`, ``, 3, `appearance`],
            [4, `polymorpheusOutlet`, `polymorpheusOutletContext`],
            [`tabindex`, `0`, `tuiButtonX`, ``, 3, `click`, `appearance`],
            [`tuiTitle`, ``],
            [3, `id`, `innerHTML`],
            [3, `innerHTML`],
            [`size`, `m`, `tuiAutoFocus`, ``, `tuiButton`, ``, `type`, `button`, 3, `click`],
          ],
          template: function (i, o) {
            (i & 1 &&
              (hx(0, dt, 2, 2, `button`, 0),
              hx(1, ct, 3, 2, `header`),
              FE(2, mt, 6, 4, `ng-container`, 1)),
              i & 2 &&
                (px(o.context.closable ? 0 : -1),
                vA(),
                px(!o.primitive && o.context.label ? 1 : -1),
                vA(),
                VE(`polymorpheusOutlet`, o.context.content)(
                  `polymorpheusOutletContext`,
                  o.context,
                )));
          },
          dependencies: [Yt$1, Ze, It$1, z, qe],
          styles: [
            `tui-dialog:where(*[data-tui-version="5.19.0"]){position:relative;box-sizing:border-box;overflow-wrap:break-word;font:var(--%NS%tui-typography-body-m);background:var(--%NS%tui-background-elevation-1);box-shadow:var(--%NS%tui-shadow-popup)}tui-dialog:where(*[data-tui-version="5.19.0"]):not([data-appearance~=fullscreen])._closable>header,tui-dialog:where(*[data-tui-version="5.19.0"]):not([data-appearance~=fullscreen])._closable>ng-component>header{padding-inline-end:2.5rem}tui-dialog:where(*[data-tui-version="5.19.0"]):not([data-appearance~=fullscreen])._closable>header p,tui-dialog:where(*[data-tui-version="5.19.0"]):not([data-appearance~=fullscreen])._closable>ng-component>header p{margin-inline-end:-2.5rem}tui-dialog:where(*[data-tui-version="5.19.0"])>header,tui-dialog:where(*[data-tui-version="5.19.0"])>ng-component>header{font:var(--%NS%tui-typography-heading-h5)}tui-dialog:where(*[data-tui-version="5.19.0"])>header [tuiTitle],tui-dialog:where(*[data-tui-version="5.19.0"])>ng-component>header [tuiTitle]{font:inherit}tui-dialog:where(*[data-tui-version="5.19.0"])>header p,tui-dialog:where(*[data-tui-version="5.19.0"])>ng-component>header p{margin:.25rem 0 0;font:var(--%NS%tui-typography-body-m)}tui-dialog:where(*[data-tui-version="5.19.0"])>header p:empty,tui-dialog:where(*[data-tui-version="5.19.0"])>ng-component>header p:empty{display:none}tui-dialog:where(*[data-tui-version="5.19.0"])>[tuiButtonX]{position:absolute;z-index:1;inset-block-start:1rem;inset-inline-end:1rem}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga]{max-inline-size:calc(100vw - 5rem);margin:2.5rem;padding:1.75rem;border-radius:1.5rem;--%NS%tui-from: translateY(2rem)}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga].tui-enter,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga].tui-leave{animation-name:tuiFade,tuiSlide}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=s]{inline-size:25rem;padding:1.5rem}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=s]>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=s]>[tuiSlides]>*>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=s]>ng-component>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=s]>ng-component>[tuiSlides]>*>header{font:var(--%NS%tui-typography-heading-h5)}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=s]>header:not(:last-child),tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=s]>[tuiSlides]>*>header:not(:last-child),tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=s]>ng-component>header:not(:last-child),tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=s]>ng-component>[tuiSlides]>*>header:not(:last-child){margin-block-end:1.25rem}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=s]>footer,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=s]>ng-component>footer{margin-block-start:1.25rem}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=m],tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=l]{inline-size:37.5rem}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=m]>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=l]>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=m]>[tuiSlides]>*>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=l]>[tuiSlides]>*>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=m]>ng-component>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=l]>ng-component>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=m]>ng-component>[tuiSlides]>*>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=l]>ng-component>[tuiSlides]>*>header{font:var(--%NS%tui-typography-heading-h4)}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=m]>header:not(:last-child),tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=l]>header:not(:last-child),tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=m]>[tuiSlides]>*>header:not(:last-child),tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=l]>[tuiSlides]>*>header:not(:last-child),tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=m]>ng-component>header:not(:last-child),tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=l]>ng-component>header:not(:last-child),tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=m]>ng-component>[tuiSlides]>*>header:not(:last-child),tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=l]>ng-component>[tuiSlides]>*>header:not(:last-child){margin-block-end:1.5rem}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga][data-size=l]{inline-size:50rem}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga]>footer,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=taiga]>ng-component>footer{display:flex;justify-content:flex-end;flex-wrap:wrap-reverse;gap:.75rem;margin-block-start:2rem}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]{display:flex;flex-direction:column;block-size:100%;inline-size:100%;padding:env(safe-area-inset-top) max(calc(50vw - var(--%NS%tui-width) / 2),1rem) max(2rem,env(safe-area-inset-bottom));background:var(--%NS%tui-background-base);box-shadow:none;--%NS%tui-width: min(45rem, calc(100vw - 2rem) );--%NS%tui-from: translateY(2rem)}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size].tui-enter,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size].tui-leave{animation-name:tuiFade,tuiSlide}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>[tuiButtonX]{position:sticky;inset-block-start:env(safe-area-inset-top);block-size:4rem;inline-size:auto;align-self:flex-end;margin-block-end:2rem;border-radius:0!important;font:var(--%NS%tui-typography-body-l)!important;border-image:conic-gradient(var(--%NS%tui-background-base) 0 0) fill 0 / 0 / env(safe-area-inset-top) 100vw 0}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>[tuiButtonX]:before{display:none}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size].tui-app-bar>[tuiButtonX]{display:none}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]:not(._closable):not(.tui-app-bar):before{content:"";block-size:1.5rem}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>tui-app-bar,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>tui-app-bar{position:sticky;z-index:1;inset-block-start:0;order:-1;border-inline-end:calc(50vw - var(--%NS%tui-width) / 2) solid transparent;border-inline-start:calc(50vw - var(--%NS%tui-width) / 2) solid transparent;margin:0 calc(var(--%NS%tui-width) / 2 - 50vw) 2rem}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>[tuiSlides]>*>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>header,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>[tuiSlides]>*>header{font:var(--%NS%tui-typography-heading-h3);margin-block-end:2rem}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>footer,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>footer{display:flex;gap:.5rem .75rem;padding:2rem calc(50vw - var(--%NS%tui-width) / 2);margin:0 calc(var(--%NS%tui-width) / 2 - 50vw) calc(-2rem - env(safe-area-inset-top))}tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>footer:before,tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>footer:before{inset-inline-start:0;inset-inline-end:0}tui-root:not(._mobile) tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>footer,tui-root:not(._mobile) tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>footer{flex-direction:row;background:color-mix(in hsl,var(--%NS%tui-background-base) 80%,transparent);-webkit-backdrop-filter:blur(2rem);backdrop-filter:blur(2rem)}tui-root:not(._mobile) tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>footer:before,tui-root:not(._mobile) tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>footer:before{display:none}tui-root:not(._mobile) tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>footer>button,tui-root:not(._mobile) tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>footer>button,tui-root:not(._mobile) tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>footer>a,tui-root:not(._mobile) tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>footer>a{inline-size:auto}tui-root._mobile tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]{padding-block-end:max(1rem,env(safe-area-inset-bottom));--%NS%tui-from: translateY(4rem)}tui-root._mobile tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>[tuiButtonX]{align-self:flex-start;block-size:3.5rem;margin-block-end:1rem}tui-root._mobile tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>tui-app-bar,tui-root._mobile tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>tui-app-bar{margin:calc(-1*env(safe-area-inset-top)) -1rem 1rem;padding-block-start:env(safe-area-inset-top);box-sizing:content-box}tui-root._mobile tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>header,tui-root._mobile tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>[tuiSlides]>*>header,tui-root._mobile tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>header,tui-root._mobile tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>[tuiSlides]>*>header{margin:-.25rem 0 1.5rem}tui-root._mobile tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>footer,tui-root._mobile tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>ng-component>footer{padding:0 1rem max(1rem,env(safe-area-inset-bottom));margin:1.5rem -1rem calc(-1*max(1rem,env(safe-area-inset-bottom)))}[data-platform=ios] tui-dialog:where(*[data-tui-version="5.19.0"])[data-appearance~=fullscreen][data-size]>[tuiButtonX][tuiButtonX]{block-size:2.75rem}
`,
          ],
          encapsulation: 2,
          changeDetection: 1,
        });
      }
    }
    return e;
  })(),
  [vt, Ni] = hb({
    appearance: `taiga`,
    size: `m`,
    required: !1,
    closable: !0,
    dismissible: !0,
    label: ``,
    data: void 0,
  }),
  Ai = (() => {
    class e extends Qe {
      constructor() {
        (super(...arguments), (this.options = v(vt)), (this.content = gt));
      }
      static {
        this.ɵfac = (() => {
          let t;
          return function (o) {
            return (t || (t = ya(e)))(o || e);
          };
        })();
      }
      static {
        this.ɵprov = q({ token: e, factory: e.ɵfac, providedIn: `root` });
      }
    }
    return e;
  })();
var s = class o {
  sources = H$1([]);
  idlePull = new ue();
  busy = oe$1(() => this.sources().some((e) => e.busy()));
  loaded$ = ff(
    FK(this.busy).pipe(
      mT(),
      et$2(([e, r]) => e && !r),
      Y$1(() => {}),
    ),
    this.idlePull,
  );
  register(e) {
    return (
      this.sources.update((r) => [...r, e]),
      () => {
        this.sources.update((r) => r.filter((g) => g !== e));
      }
    );
  }
  refresh() {
    let e = this.sources();
    if (e.length === 0) {
      this.idlePull.next();
      return;
    }
    e.forEach((r) => r.trigger());
  }
  static ɵfac = function (r) {
    return new (r || o)();
  };
  static ɵprov = q({ token: o, factory: o.ɵfac, providedIn: `root` });
};
function j(o) {
  let e = v(s).register(o);
  v(J$1).onDestroy(e);
}
var h = new E$1(``, { factory: () => v(CZ).getTag(`name="theme-color"`)?.content ?? `` });
var l = (() => {
  class e {
    constructor() {
      ((this.current = v(h)), (this.doc = v(ie)), (this.meta = v(CZ)), (this.color = this.current));
    }
    get color() {
      return this.current;
    }
    set color(o) {
      ((this.current = o),
        this.meta.updateTag({ name: `theme-color`, content: o }),
        this.doc.documentElement.style.setProperty(`--tui-theme-color`, o));
    }
    static {
      this.ɵfac = function (c) {
        return new (c || e)();
      };
    }
    static {
      this.ɵprov = q({ token: e, factory: e.ɵfac, providedIn: `root` });
    }
  }
  return e;
})();
var n = `boreas-theme`;
var p = { dark: `#0a0d13`, light: `#f4f6fa` };
var c = class r {
  document = v(ie);
  themeColor = v(l);
  darkMode = v(qX);
  modeState = H$1(this.readMode());
  mode = this.modeState.asReadonly();
  theme = oe$1(() => (this.darkMode() ? `dark` : `light`));
  constructor() {
    (Yt$2(() => this.persistMode(this.modeState())),
      Yt$2(() => {
        let e = this.modeState();
        e === `system` ? this.darkMode.reset() : this.darkMode.set(e === `dark`);
      }),
      Yt$2(() => {
        this.themeColor.color = p[this.theme()];
      }));
  }
  setMode(e) {
    this.modeState.set(e);
  }
  readMode() {
    try {
      let e = this.document.defaultView?.localStorage.getItem(n);
      return e === `light` || e === `dark` || e === `system` ? e : `system`;
    } catch {
      return `system`;
    }
  }
  persistMode(e) {
    try {
      this.document.defaultView?.localStorage.setItem(n, e);
    } catch {
      return;
    }
  }
  static ɵfac = function (l) {
    return new (l || r)();
  };
  static ɵprov = q({ token: r, factory: r.ɵfac, providedIn: `root` });
};
var F = [`thumb`];
function W(r, t) {
  if ((r & 1 && Rl(0, `tui-icon`, 4), r & 2)) {
    let e = Ax().$implicit;
    VE(`icon`, e.icon);
  }
}
function H(r, t) {
  r & 1 && Rl(0, `span`, 6);
}
function B(r, t) {
  if (r & 1) {
    let e = Ix();
    (pl(0, `button`, 3),
      zo(`click`, function () {
        let i = By(e).$index;
        return Hy(Ax().onSegmentClick(i));
      })(`pointerdown`, function (i) {
        By(e);
        return Hy(Ax().onPointerDown(i));
      })(`pointermove`, function (i) {
        By(e);
        return Hy(Ax().onPointerMove(i));
      })(`pointerup`, function (i) {
        By(e);
        return Hy(Ax().onPointerUp(i));
      })(`pointercancel`, function (i) {
        By(e);
        return Hy(Ax().onPointerUp(i));
      }),
      hx(1, W, 1, 1, `tui-icon`, 4),
      pl(2, `span`, 5),
      sR(3),
      eg(),
      hx(4, H, 1, 0, `span`, 6),
      eg());
  }
  if (r & 2) {
    let e = t.$implicit,
      n = t.$index,
      i = Ax();
    (sg(`segment--active`, n === i.activeIndex()),
      kr(`aria-selected`, n === i.activeIndex()),
      vA(),
      px(e.icon ? 1 : -1),
      vA(2),
      aC(e.label),
      vA(),
      px(e.dot ? 4 : -1));
  }
}
var R = class r {
  host = v(it$1);
  thumb = N9.required(`thumb`);
  items = tr.required();
  activeIndex = A9.required();
  stacked = tr(!1);
  motion = !1;
  itemWidth = 0;
  quickX = null;
  dragging = !1;
  dragMoved = !1;
  pointerId = null;
  startX = 0;
  lastPointerX = 0;
  constructor() {
    let t = v(J$1);
    (Yt$2(() => {
      let e = this.activeIndex();
      !this.dragging && this.itemWidth > 0 && this.settle(e);
    }),
      Ca(() => {
        let e = bV.matchMedia();
        e.add(
          `(prefers-reduced-motion: no-preference)`,
          () => (
            (this.motion = !0),
            () => {
              this.motion = !1;
            }
          ),
        );
        let n = new ResizeObserver(() => this.layout());
        (n.observe(this.host.nativeElement),
          this.layout(),
          t.onDestroy(() => {
            (n.disconnect(), e.revert());
          }));
      }));
  }
  layout() {
    let t = this.host.nativeElement,
      e = 3,
      n = Math.max(this.items().length, 1);
    this.itemWidth = (t.clientWidth - e * 2) / n;
    let i = this.thumb().nativeElement;
    (bV.set(i, { width: this.itemWidth, x: this.targetX(this.activeIndex()) }),
      (this.quickX = bV.quickTo(i, `x`, { duration: 0.16, ease: `power3` })));
  }
  targetX(t) {
    return 3 + t * this.itemWidth;
  }
  step(t) {
    let e = Math.min(Math.max(this.activeIndex() + t, 0), this.items().length - 1);
    this.activeIndex.set(e);
  }
  onSegmentClick(t) {
    if (this.dragMoved) {
      this.dragMoved = !1;
      return;
    }
    this.activeIndex.set(t);
  }
  onPointerDown(t) {
    ((this.pointerId = t.pointerId),
      (this.startX = t.clientX),
      (this.lastPointerX = t.clientX),
      (this.dragging = !0),
      (this.dragMoved = !1),
      t.target.setPointerCapture(t.pointerId),
      (this.quickX = bV.quickTo(this.thumb().nativeElement, `x`, {
        duration: 0.16,
        ease: `power3`,
      })));
  }
  onPointerMove(t) {
    if (
      !this.dragging ||
      t.pointerId !== this.pointerId ||
      (!this.dragMoved && Math.abs(t.clientX - this.startX) < 6)
    )
      return;
    ((this.dragMoved = !0), (this.lastPointerX = t.clientX));
    let e = this.host.nativeElement.getBoundingClientRect(),
      n = 3,
      i = e.width - 3 - this.itemWidth,
      o = Math.min(Math.max(t.clientX - e.left - this.itemWidth / 2, n), i);
    if (this.motion && this.quickX) {
      this.quickX(o);
      let x = Math.min(Math.abs(t.movementX) / 40, 0.18);
      bV.to(this.thumb().nativeElement, {
        scaleX: 1 + x,
        scaleY: 1 - x * 0.5,
        duration: 0.12,
        overwrite: `auto`,
      });
    } else bV.set(this.thumb().nativeElement, { x: o });
  }
  onPointerUp(t) {
    if (
      t.pointerId !== this.pointerId ||
      ((this.dragging = !1), (this.pointerId = null), !this.dragMoved)
    )
      return;
    let e = this.host.nativeElement.getBoundingClientRect(),
      n = Math.min(
        Math.max(Math.floor((this.lastPointerX - e.left - 3) / this.itemWidth), 0),
        this.items().length - 1,
      );
    (this.activeIndex.set(n), this.settle(n));
  }
  settle(t) {
    let e = this.thumb().nativeElement,
      n = this.targetX(t);
    if (!this.motion) {
      bV.set(e, { x: n, scaleX: 1, scaleY: 1 });
      return;
    }
    (bV.to(e, { x: n, duration: 0.45, ease: `back.out(1.5)`, overwrite: `auto` }),
      bV.to(e, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.6,
        ease: `elastic.out(1, 0.55)`,
        overwrite: !1,
      }));
  }
  static ɵfac = function (e) {
    return new (e || r)();
  };
  static ɵcmp = Vi$1({
    type: r,
    selectors: [[`app-glass-segmented`]],
    viewQuery: function (e, n) {
      (e & 1 && ZE(n.thumb, F, 5), e & 2 && kx());
    },
    hostAttrs: [`role`, `tablist`],
    hostVars: 2,
    hostBindings: function (e, n) {
      (e & 1 &&
        zo(`keydown.arrowRight`, function () {
          return n.step(1);
        })(`keydown.arrowLeft`, function () {
          return n.step(-1);
        }),
        e & 2 && sg(`stacked`, n.stacked()));
    },
    inputs: { items: [1, `items`], activeIndex: [1, `activeIndex`], stacked: [1, `stacked`] },
    outputs: { activeIndex: `activeIndexChange` },
    decls: 4,
    vars: 0,
    consts: [
      [`thumb`, ``],
      [`aria-hidden`, `true`, 1, `thumb`],
      [`type`, `button`, `role`, `tab`, 1, `segment`, 3, `segment--active`],
      [
        `type`,
        `button`,
        `role`,
        `tab`,
        1,
        `segment`,
        3,
        `click`,
        `pointerdown`,
        `pointermove`,
        `pointerup`,
        `pointercancel`,
      ],
      [1, `segment__icon`, 3, `icon`],
      [1, `segment__label`],
      [`aria-label`, `Unsaved changes`, 1, `dot`],
    ],
    template: function (e, n) {
      (e & 1 && (Rl(0, `div`, 1, 0), vx(2, B, 5, 6, `button`, 2, gx)),
        e & 2 && (vA(2), yx(n.items())));
    },
    dependencies: [EJ],
    styles: [
      `[_nghost-%COMP%]{position:relative;display:flex;align-items:stretch;block-size:2.75rem;padding:.1875rem;border-radius:999px;background:var(--%NS%app-chrome-bg);-webkit-backdrop-filter:var(--%NS%app-chrome-filter);backdrop-filter:var(--%NS%app-chrome-filter);box-shadow:0 .5rem 2rem #00000017,inset 0 0 .75rem var(--%NS%app-chrome-glow);touch-action:pan-y}[_nghost-%COMP%]:after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:var(--%NS%app-chrome-bevel);pointer-events:none;-webkit-mask-image:linear-gradient(#000 0 0),linear-gradient(#000 0 0);mask-image:linear-gradient(#000 0 0),linear-gradient(#000 0 0);-webkit-mask-origin:content-box,border-box;mask-origin:content-box,border-box;-webkit-mask-clip:content-box,border-box;mask-clip:content-box,border-box;-webkit-mask-composite:xor;mask-composite:exclude}.thumb[_ngcontent-%COMP%]{position:absolute;inset-block:.1875rem;inset-inline-start:0;border-radius:999px;background:var(--%NS%app-segment-thumb);box-shadow:var(--%NS%app-segment-thumb-shadow);will-change:transform}.segment[_ngcontent-%COMP%]{position:relative;z-index:1;display:inline-flex;flex:1;align-items:center;justify-content:center;gap:.375rem;min-inline-size:0;margin:0;border:0;padding:0 .75rem;background:none;border-radius:999px;font:inherit;font-size:.9375rem;font-weight:500;white-space:nowrap;color:var(--%NS%tui-text-secondary);cursor:pointer;transition:color var(--%NS%tui-duration)}.segment--active[_ngcontent-%COMP%]{color:var(--%NS%tui-text-primary);font-weight:600}.segment[_ngcontent-%COMP%]:focus-visible{outline:2px solid var(--%NS%tui-border-focus);outline-offset:-2px}.segment__icon[_ngcontent-%COMP%]{inline-size:1rem;block-size:1rem;font-size:1rem;flex:none}.dot[_ngcontent-%COMP%]{inline-size:.375rem;block-size:.375rem;flex:none;border-radius:999px;background:var(--%NS%tui-background-accent-1)}.stacked[_nghost-%COMP%]{block-size:3.625rem}.stacked[_nghost-%COMP%]   .segment[_ngcontent-%COMP%]{flex-direction:column;gap:.1875rem;padding:0 .5rem}.stacked[_nghost-%COMP%]   .segment__icon[_ngcontent-%COMP%]{inline-size:1.375rem;block-size:1.375rem;font-size:1.375rem}.stacked[_nghost-%COMP%]   .segment__label[_ngcontent-%COMP%]{font-size:.625rem;font-weight:500;letter-spacing:.01em}`,
    ],
  });
};
var xt = (() => {
  class e {
    constructor() {
      this.tuiPlatform = tr(v(sr, { skipSelf: !0 }));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵdir = ot$1({
        type: e,
        selectors: [[``, `tuiPlatform`, ``]],
        hostVars: 1,
        hostBindings: function (i, r) {
          i & 2 && kr(`data-platform`, r.tuiPlatform());
        },
        inputs: { tuiPlatform: [1, `tuiPlatform`] },
        features: [Na([{ provide: sr, useFactory: () => v(e).tuiPlatform() }])],
      });
    }
  }
  return e;
})();
var kt = (() => {
  class e extends k {
    visualViewport = v(lr).visualViewport;
    stream$ = this.visualViewport
      ? ff(
          mn(this.visualViewport, `resize`),
          mn(this.visualViewport, `scroll`),
          mn(this.visualViewport, `scrollend`),
        ).pipe(
          _r(null),
          Y$1(() => this.visualViewport),
          et$2(Boolean),
          Kv({ bufferSize: 1, refCount: !0 }),
        )
      : ye$1;
    constructor() {
      super((t) => this.stream$.subscribe(t));
    }
    static ɵfac = function (i) {
      return new (i || e)();
    };
    static ɵprov = q({ token: e, factory: e.ɵfac, providedIn: `root` });
  }
  return e;
})();
var Et = (() => {
  class e {
    constructor() {
      ((this.w = v(lr)),
        (this.style = qQ().style),
        (this.minInnerHeight = Infinity),
        (this.$ = v(kt)
          .pipe(fc())
          .subscribe(({ offsetLeft: t, offsetTop: i, height: r, width: b, scale: oe }) => {
            ((this.minInnerHeight = Math.min(this.minInnerHeight, this.w.innerHeight)),
              this.style.setProperty(`--tui-viewport-x`, hQ(t)),
              this.style.setProperty(`--tui-viewport-y`, hQ(i)),
              this.style.setProperty(`--tui-viewport-height`, hQ(r)),
              this.style.setProperty(`--tui-viewport-width`, hQ(b)),
              this.style.setProperty(`--tui-viewport-scale`, String(oe)),
              this.style.setProperty(`--tui-viewport-vh`, hQ(this.w.innerHeight / 100)),
              this.style.setProperty(`--tui-viewport-vw`, hQ(this.w.innerWidth / 100)),
              this.style.setProperty(`--tui-viewport-svh`, hQ(this.minInnerHeight / 100)));
          })));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵdir = ot$1({ type: e, selectors: [[``, `tuiVisualViewport`, ``]] });
    }
  }
  return e;
})();
var $t = [`*`, [[`tuiOverContent`]]];
var zt = [`*`, `tuiOverContent`];
function jt(e, o) {
  e & 1 && Rl(0, `tui-scroll-controls`, 1);
}
function Wt(e, o) {
  if (
    (e & 1 && (hx(0, jt, 1, 0, `tui-scroll-controls`, 1), pl(1, `tui-popups`), Rx(2, 1), eg()),
    e & 2)
  )
    px(Ax().scrollbars ? 0 : -1);
}
var It = (() => {
  class e {
    constructor() {
      ((this.doc = v(ie)),
        (this.el = qQ()),
        (this.child = !!v(e, { optional: !0, skipSelf: !0 })),
        (this.reducedMotion = v(N1)),
        (this.duration = _s(v(HX))),
        (this.top = H$1(this.parent)),
        (this.breakpoint = v(GX)),
        (this.liquidGlass = v(ws)),
        (this.scrollbars =
          !v(Ei) && !this.child && v(li$1).mode !== `native` && v(fi).scrollbars !== `native`));
    }
    get parent() {
      return this.doc.fullscreenElement ? this.doc.fullscreenElement === this.el : !this.child;
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵcmp = Vi$1({
        type: e,
        selectors: [[`tui-root`]],
        hostAttrs: [`data-tui-version`, `5.19.0`],
        hostVars: 8,
        hostBindings: function (i, r) {
          (i & 1 &&
            zo(
              `fullscreenchange`,
              function () {
                return r.top.set(r.parent);
              },
              NM,
            )(`touchstart.passive.zoneless`, function () {
              return 0;
            }),
            i & 2 &&
              (Wo(
                `--%NS%tui-duration`,
                r.duration,
                `ms`,
              )(`--%NS%tui-scroll-behavior`, r.reducedMotion ? `auto` : `smooth`),
              sg(`_mobile`, r.breakpoint() === `mobile`)(`tui-liquid-glass`, r.liquidGlass)));
        },
        features: [Ta([xt, Et, ts])],
        ngContentSelectors: zt,
        decls: 3,
        vars: 1,
        consts: [
          [1, `t-root-content`],
          [1, `t-root-scrollbar`],
        ],
        template: function (i, r) {
          (i & 1 && (xx($t), pl(0, `div`, 0), Rx(1), eg(), hx(2, Wt, 3, 1)),
            i & 2 && (vA(2), px(r.top() ? 2 : -1)));
        },
        dependencies: [xs, tn],
        styles: [
          `@keyframes tuiPresent{to{content:""}}@keyframes tuiFade{0%{opacity:0}}@keyframes tuiSlide{0%{transform:var(--%NS%tui-from, translateY(100%))}}@keyframes tuiScale{0%{transform:scale(var(--%NS%tui-scale, 0))}}@keyframes tuiCollapse{0%{grid-template-rows:0fr}to{grid-template-rows:1fr}}@keyframes tuiBlur{0%{filter:blur(var(--%NS%tui-blur, .25rem))}}.tui-enter,.tui-leave{animation-duration:var(--%NS%tui-duration);animation-timing-function:var(--%NS%tui-curve-productive-entrance);pointer-events:none}.tui-leave{animation-direction:reverse;animation-timing-function:var(--%NS%tui-curve-productive-exit)}
`,
          `.tui-zero-scrollbar{scrollbar-width:none;-ms-overflow-style:none}.tui-zero-scrollbar::-webkit-scrollbar,.tui-zero-scrollbar::-webkit-scrollbar-thumb{display:none}body,input{margin:0}tui-root{position:relative;display:block;font:var(--%NS%tui-typography-body-s);color:var(--%NS%tui-text-primary);flex:1;border-image:conic-gradient(var(--%NS%tui-background-base) 0 0) fill 0/0/0 0 100vh 0;-webkit-tap-highlight-color:transparent}tui-root:has(>tui-popups tui-modal)>.t-root-content{interactivity:inert}tui-root>.t-root-scrollbar{position:fixed;inset:0;z-index:0}.t-root-content{position:relative;inset-block-start:var(--%NS%t-root-top);block-size:100%;isolation:isolate}.t-root-content>*{--%NS%t-root-top: 0}[tuiDropdownButton][tuiDropdownButton]{display:none}
`,
        ],
        encapsulation: 2,
        changeDetection: 1,
      });
    }
  }
  return e;
})();
function Mt() {
  return Tk(Mk());
}
var ye = T(`App`, { web: () => import(`./chunk-Cww5Z4lE.js`).then((e) => new e.AppWeb()) });
var Ot = new ue();
function Pt() {
  return sn$1([
    { provide: ht, useFactory: () => ff(v(hs).events.pipe(et$2((e) => e instanceof yd)), Ot) },
    OE(() => {
      if (U.getPlatform() !== `android`) return;
      let e = v(Ko),
        o = v(ie);
      ye.addListener(`backButton`, ({ canGoBack: t }) => {
        if (o.querySelector(`tui-dialog, tui-sheet-dialog`)) {
          Ot.next();
          return;
        }
        if (o.querySelector(`tui-dropdown, tui-bottom-sheet`)) {
          o.dispatchEvent(new KeyboardEvent(`keydown`, { key: `Escape`, bubbles: !0 }));
          return;
        }
        if (t) {
          e.back();
          return;
        }
        ye.exitApp();
      });
    }),
  ]);
}
var w = () => (v(H$2).configured() ? !0 : v(hs).createUrlTree([`/welcome`]));
var At = [
  { path: ``, pathMatch: `full`, redirectTo: `dashboard` },
  {
    path: `welcome`,
    loadChildren: () => import(`./chunk-C3lhv_Ci.js`).then((e) => e.onboardingRoutes),
  },
  {
    path: `dashboard`,
    title: `Tasks | Boreas`,
    canActivate: [w],
    loadComponent: () => import(`./chunk-CfDjz1Se.js`).then(({ DashboardPage: e }) => e),
  },
  {
    path: `search`,
    title: `Search | Boreas`,
    canActivate: [w],
    loadComponent: () => import(`./chunk-C1dJGSL9.js`).then(({ SearchPage: e }) => e),
  },
  {
    path: `notifications`,
    title: `Notifications | Boreas`,
    canActivate: [w],
    data: {
      icon: `@tui.bell`,
      description: `Realtime alerts for your tasks are on the way. Check back in a future update.`,
    },
    loadComponent: () => import(`./chunk-CzPLL6B1.js`).then(({ ComingSoonPage: e }) => e),
  },
  {
    path: `settings`,
    title: `Settings | Boreas`,
    canActivate: [w],
    loadComponent: () => import(`./chunk-C0XIjbo3.js`).then(({ SettingsPage: e }) => e),
  },
  {
    path: `tasks/new`,
    title: `Create task | Boreas`,
    canActivate: [w],
    loadComponent: () => import(`./chunk-BWAnt04b.js`).then(({ TaskCreatePage: e }) => e),
  },
  {
    path: `tasks/:id`,
    title: `Task | Boreas`,
    canActivate: [w],
    loadComponent: () => import(`./chunk-D5lA2Fqk.js`).then(({ TaskDetailPage: e }) => e),
  },
  { path: `**`, redirectTo: `dashboard` },
];
var Gt = `(max-width: 47.9375rem)`;
function Dt(e) {
  let o = 0,
    t = e;
  for (; t;) ((o += t.url.length), (t = t.firstChild));
  return o;
}
function Nt(e) {
  let o = ``,
    t = e;
  for (; t;) ((o += `/${t.url.map((i) => i.path).join(`/`)}`), (t = t.firstChild));
  return o;
}
var Rt = {
  providers: [
    o0(),
    Mt(),
    Pt(),
    dF(
      At,
      vF(),
      yF({
        skipInitialTransition: !0,
        onViewTransitionCreated: ({ transition: e, from: o, to: t }) => {
          if (Nt(o) === Nt(t)) {
            e.skipTransition();
            return;
          }
          let i = v(ie),
            r = i.documentElement,
            b = Dt(t) - Dt(o);
          if (
            ((r.dataset.nav = b > 0 ? `push` : b < 0 ? `pop` : `fade`),
            e.finished.finally(() => delete r.dataset.nav),
            i.hidden)
          ) {
            e.skipTransition();
            return;
          }
          let oe = i.defaultView?.setTimeout(() => e.skipTransition(), 1e3);
          e.finished.finally(() => i.defaultView?.clearTimeout(oe));
        },
      }),
    ),
    ys({ apis: { liquidGlass: !0 } }),
    {
      provide: sr,
      useFactory: () => {
        let o = v(ie).defaultView?.matchMedia(Gt).matches ?? !1;
        return v(Ei) || o ? `ios` : `web`;
      },
    },
  ],
};
function Yt(e, o) {
  if ((e & 1 && (Jy(), jE(0, `animate`, 2)), e & 2)) {
    let t = Ax(2).$index;
    kr(`begin`, Ax().calculateAnimationBegin(t));
  }
}
function qt(e, o) {
  if (
    (e & 1 && (Jy(), tg(0, `g`)(1, `rect`, 1), hx(2, Yt, 1, 1, `:svg:animate`, 2), ng()()), e & 2)
  ) {
    let t = Ax().$index,
      i = Ax();
    (kr(`transform`, i.calculateTransform(t)), vA(2), px(i.finished ? 2 : -1));
  }
}
function Xt(e, o) {
  if ((e & 1 && hx(0, qt, 3, 2, `:svg:g`), e & 2)) {
    let t = o.$index;
    px(Ax().isShown(t) ? 0 : -1);
  }
}
function Zt(e, o) {
  if (
    (e & 1 &&
      (Jy(),
      pl(0, `svg`, 3)(1, `defs`)(2, `mask`, 4),
      Rl(3, `path`, 5),
      eg()(),
      pl(4, `g`, 6),
      Rl(5, `path`, 7),
      eg()()),
    e & 2)
  ) {
    let t = Ax();
    (Wo(`opacity`, t.opacity), kr(`transform`, t.transform));
  }
}
function Kt(e, o) {
  (e & 1 && Rl(0, `tui-loader`, 2), e & 2 && VE(`inheritColor`, !0));
}
var Qt = [`*`];
var Jt = (e) => ({ $implicit: e });
function ei(e, o) {
  e & 1 && BE(0);
}
var Lt = 8;
var ti = 30;
var Te = new oe(
  (() => {
    class e {
      constructor() {
        ((this.context = Nn()), (this.threshold = v(ee)), (this.steps = 12));
      }
      get finished() {
        return this.percent >= 100;
      }
      get percent() {
        return (this.context.$implicit * 100) / this.threshold;
      }
      isShown(t) {
        return this.percent > (t + 1) * Lt;
      }
      calculateTransform(t) {
        return `rotate(${t * ti} 50 50)`;
      }
      calculateAnimationBegin(t) {
        return `${(t * Lt) / 100}s`;
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)();
        };
      }
      static {
        this.ɵcmp = Vi$1({
          type: e,
          selectors: [[`tui-mobile-ios-loader`]],
          decls: 3,
          vars: 0,
          consts: [
            [
              `height`,
              `36`,
              `preserveAspectRatio`,
              `xMidYMid`,
              `viewBox`,
              `0 0 100 100`,
              `width`,
              `36`,
              0,
              `xmlns`,
              `xlink`,
              `http://www.w3.org/1999/xlink`,
              `xmlns`,
              `http://www.w3.org/2000/svg`,
            ],
            [
              `fill`,
              `#c7c9cc`,
              `height`,
              `16`,
              `rx`,
              `7.05`,
              `ry`,
              `3.3`,
              `width`,
              `6`,
              `x`,
              `47`,
              `y`,
              `22`,
            ],
            [
              `attributeName`,
              `opacity`,
              `dur`,
              `1s`,
              `keyTimes`,
              `0;1`,
              `repeatCount`,
              `indefinite`,
              `values`,
              `1;0`,
            ],
          ],
          template: function (i, r) {
            (i & 1 && (Jy(), tg(0, `svg`, 0), vx(1, Xt, 1, 1, null, null, gx), ng()),
              i & 2 && (vA(), yx(`-`.repeat(r.steps))));
          },
          styles: [
            `[_nghost-%COMP%]{position:absolute;inset-block-start:-.5rem;inset-inline-start:50%;margin-inline-start:-1.125rem}`,
          ],
        });
      }
    }
    return e;
  })(),
);
var Se = new E$1(``, { factory: () => ye$1 });
var ee = new E$1(``, { factory: () => 50 });
var te = new E$1(``, { factory: () => (v(G) ? Te : li) });
var Ce = 10 ** -6;
var oi = `tui-dialog, tui-sheet-dialog, tui-dropdown, tui-dropdown-mobile`;
var Ft = (() => {
  class e extends k {
    constructor() {
      (super((t) => this.pulling$.subscribe(t)),
        (this.el = qQ()),
        (this.scrollRef = v(ae)),
        (this.loaded$ = v(Se)),
        (this.threshold = v(ee)),
        (this.touched = !1),
        (this.pulling$ = v(te)
          ? this.loaded$.pipe(
              _r(null),
              qe$2(() =>
                T1(this.el, `touchstart`, { passive: !0 }).pipe(
                  et$2(() => !this.scrollRef.nativeElement.scrollTop && !this.el.querySelector(oi)),
                  Y$1(({ touches: t }) => t[0]?.clientY ?? 0),
                  qe$2((t) =>
                    T1(this.el, `touchmove`).pipe(
                      ft$1(() => {
                        this.touched = !0;
                      }),
                      Y$1(({ touches: i }) => (i[0]?.clientY ?? 0) - t),
                      et$2((i) => i > 0),
                      on$1(
                        T1(this.el, `touchend`).pipe(
                          ft$1(() => {
                            this.touched = !1;
                          }),
                        ),
                      ),
                      on$1(TX(this.scrollRef.nativeElement)),
                      qv(0),
                    ),
                  ),
                  vT(
                    (t, i) =>
                      !i && !this.touched && t > this.threshold ? this.threshold : i + i * Ce,
                    0,
                  ),
                  Qv((t) => t !== this.threshold, !0),
                  _r(0),
                ),
              ),
              fT(0, xX()),
              zv(),
              NX(),
              vo(),
            )
          : ye$1));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵprov = q({ token: e, factory: e.ɵfac });
    }
  }
  return e;
})();
var ni = 180;
var ri = 500;
var ai = 2.3;
var li = new oe(
  (() => {
    class e {
      constructor() {
        ((this.context = Nn()), (this.threshold = v(ee)));
      }
      get percent() {
        return (this.context.$implicit * 100) / this.threshold;
      }
      get dropped() {
        return this.context.$implicit <= Ce || this.context.$implicit === this.threshold;
      }
      get hostTransform() {
        return `translateY(${Math.min(this.context.$implicit, this.threshold * 1.5)}px)`;
      }
      get opacity() {
        return this.context.$implicit / (this.threshold * 1.5);
      }
      get transform() {
        return `rotate(${Math.min(ni + this.percent * ai, ri)} 0 0)`;
      }
      static {
        this.ɵfac = function (i) {
          return new (i || e)();
        };
      }
      static {
        this.ɵcmp = Vi$1({
          type: e,
          selectors: [[`tui-mobile-android-loader`]],
          hostVars: 6,
          hostBindings: function (i, r) {
            i & 2 &&
              (Wo(`transform`, r.hostTransform), sg(`_dropped`, r.dropped)(`_visible`, r.percent));
          },
          decls: 3,
          vars: 1,
          consts: [
            [1, `t-wrapper`],
            [
              `fill`,
              `none`,
              `height`,
              `24`,
              `viewBox`,
              `0 0 24 24`,
              `width`,
              `24`,
              `xmlns`,
              `http://www.w3.org/2000/svg`,
              3,
              `opacity`,
            ],
            [`size`, `s`, 1, `t-loader`, 3, `inheritColor`],
            [
              `fill`,
              `none`,
              `height`,
              `24`,
              `viewBox`,
              `0 0 24 24`,
              `width`,
              `24`,
              `xmlns`,
              `http://www.w3.org/2000/svg`,
            ],
            [`id`, `mask-1`],
            [
              `clip-rule`,
              `evenodd`,
              `d`,
              `M21 12C21 7.03 16.97 3 12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C14.06 21 15.96 20.3 17.48 19.14L16.06 17.7C14.91 18.51 13.51 19 12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12H16L20 16L24 12H21Z`,
              `fill`,
              `white`,
              `fill-rule`,
              `evenodd`,
            ],
            [`mask`, `url(#mask-1)`],
            [
              `clip-rule`,
              `evenodd`,
              `d`,
              `M21 12C21 7.03 16.97 3 12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C14.06 21 15.96 20.3 17.48 19.14L16.06 17.7C14.91 18.51 13.51 19 12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12H16L20 16L24 12H21Z`,
              `fill`,
              `black`,
              `fill-rule`,
              `evenodd`,
            ],
          ],
          template: function (i, r) {
            (i & 1 &&
              (pl(0, `div`, 0), hx(1, Zt, 6, 3, `:svg:svg`, 1)(2, Kt, 1, 1, `tui-loader`, 2), eg()),
              i & 2 && (vA(), px(r.percent !== 100 ? 1 : 2)));
          },
          dependencies: [Yn],
          styles: [
            `[_nghost-%COMP%]{transition-property:opacity;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard);position:sticky;z-index:1;display:block;inset-block-start:0;block-size:0;opacity:0}._visible[_nghost-%COMP%]{opacity:1}._dropped[_nghost-%COMP%]{transition:transform var(--%NS%tui-duration) cubic-bezier(.4,0,.2,1),opacity var(--%NS%tui-duration) var(--%NS%tui-duration)}.t-wrapper[_ngcontent-%COMP%]{position:absolute;display:flex;inset-block-start:-2.5rem;inset-inline-start:50%;box-shadow:var(--%NS%tui-shadow-medium);block-size:2.25rem;inline-size:2.25rem;background-color:var(--%NS%tui-background-elevation-3);border-radius:6.25rem;align-items:center;justify-content:center;margin-inline-start:-1.125rem}.t-loader[_ngcontent-%COMP%]{color:var(--%NS%tui-text-primary)}`,
          ],
        });
      }
    }
    return e;
  })(),
);
var Ut = (() => {
  class e {
    constructor() {
      ((this.isIOS = v(G)),
        (this.threshold = v(ee)),
        (this.service = v(Ft)),
        (this.el = v(ae)),
        (this.pulling = LI(this.service, { initialValue: 0 })),
        (this.component = v(te)),
        (this.style = oe$1(() => this.styleHandler()(this.pulling()))),
        (this.dropped = LI(
          this.service.pipe(
            Y$1((t) => t <= Ce || t === this.threshold),
            zv(),
          ),
        )),
        (this.styleHandler = tr(this.isIOS ? (t) => ({ top: hQ(t / 2) }) : () => null)),
        (this.pulled = PK(this.service.pipe(et$2((t) => t === this.threshold)))),
        this.component &&
          TX(this.el.nativeElement)
            .pipe(_r(null), A1(), fc())
            .subscribe(() => {
              this.el.nativeElement.style.setProperty(
                `touch-action`,
                this.el.nativeElement.scrollTop ? `` : `pan-down`,
              );
            }));
    }
    static {
      this.ɵfac = function (i) {
        return new (i || e)();
      };
    }
    static {
      this.ɵcmp = Vi$1({
        type: e,
        selectors: [[`tui-pull-to-refresh`]],
        inputs: { styleHandler: [1, `styleHandler`] },
        outputs: { pulled: `pulled` },
        features: [Na([Ft])],
        ngContentSelectors: Qt,
        decls: 3,
        vars: 10,
        consts: [[4, `polymorpheusOutlet`, `polymorpheusOutletContext`]],
        template: function (i, r) {
          (i & 1 && (xx(), FE(0, ei, 1, 0, `ng-container`, 0), pl(1, `div`), Rx(2), eg()),
            i & 2 &&
              (VE(`polymorpheusOutlet`, r.component)(
                `polymorpheusOutletContext`,
                yR(8, Jt, r.pulling()),
              ),
              vA(),
              Yx(r.style()),
              Wo(`position`, `relative`),
              sg(`t-drop`, r.dropped())));
        },
        dependencies: [Yt$1],
        styles: [
          `.t-drop[_ngcontent-%COMP%]{transition:all var(--%NS%tui-duration) cubic-bezier(.4,0,.2,1)}`,
        ],
      });
    }
  }
  return e;
})();
var pi = (e, o) => o.link;
function di(e, o) {
  if ((e & 1 && (pl(0, `a`, 11), sR(1), eg()), e & 2)) {
    let t = o.$implicit,
      i = o.$index,
      r = Ax(2);
    (sg(`shell__nav-item--active`, r.activeTab() === i),
      VE(`routerLink`, t.link),
      kr(`aria-current`, r.activeTab() === i ? `page` : null),
      vA(),
      ag(` `, t.label, ` `));
  }
}
function mi(e, o) {
  if (e & 1) {
    let t = Ix();
    (pl(0, `header`, 0)(1, `div`, 4)(2, `a`, 5),
      Rl(3, `img`, 6),
      sR(4, ` Boreas `),
      eg(),
      pl(5, `nav`, 7),
      vx(6, di, 2, 5, `a`, 8, pi),
      eg(),
      pl(8, `button`, 9),
      zo(`click`, function () {
        By(t);
        return Hy(Ax().cycleTheme());
      }),
      Rl(9, `tui-icon`, 10),
      eg()()());
  }
  if (e & 2) {
    let t = Ax();
    (vA(6),
      yx(t.navItems),
      vA(2),
      kr(`aria-label`, t.themeLabel())(`title`, t.themeLabel()),
      vA(),
      VE(`icon`, t.themeIcon()));
  }
}
function ui(e, o) {
  if (e & 1) {
    let t = Ix();
    (pl(0, `nav`, 12)(1, `app-glass-segmented`, 13),
      zo(`activeIndexChange`, function (r) {
        By(t);
        return Hy(Ax().openTab(r));
      }),
      eg()());
  }
  if (e & 2) {
    let t = Ax();
    (sg(`app-shell__dock--min`, t.minimized()),
      vA(),
      VE(`items`, t.dockItems)(`stacked`, !0)(`activeIndex`, t.activeTab()));
  }
}
var Ht = { system: `light`, light: `dark`, dark: `system` };
var hi = { system: `@tui.monitor`, light: `@tui.sun`, dark: `@tui.moon` };
var L = class e {
  router = v(hs);
  breakpoint = v(GX);
  theme = v(c);
  document = v(ie);
  url = LI(
    this.router.events.pipe(
      et$2((o) => o instanceof Rn$1),
      Y$1(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  mobile = oe$1(() => this.breakpoint() === `mobile`);
  onboarding = oe$1(() => this.url().startsWith(`/welcome`));
  taskPage = oe$1(() => this.url().startsWith(`/tasks/`));
  mainClass = oe$1(() =>
    this.onboarding()
      ? `block`
      : `mx-auto max-w-[80rem] px-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-6 md:py-6 md:pb-10 ${this.taskPage() ? `pb-10` : `pb-28`}`,
  );
  navItems = [
    { label: `Home`, link: `/dashboard`, icon: `@tui.house` },
    { label: `Search`, link: `/search`, icon: `@tui.search` },
    { label: `Alerts`, link: `/notifications`, icon: `@tui.bell` },
    { label: `Settings`, link: `/settings`, icon: `@tui.settings-2` },
  ];
  dockItems = this.navItems.map((o) => ({ label: o.label, icon: o.icon }));
  activeTab = oe$1(() => {
    let o = this.navItems.findIndex((t, i) => i > 0 && this.url().startsWith(t.link));
    return o === -1 ? 0 : o;
  });
  minimized = H$1(!1);
  lastScrollY = 0;
  onScroll() {
    let o = this.document.defaultView?.scrollY ?? 0,
      t = o - this.lastScrollY;
    Math.abs(t) < 6 || ((this.lastScrollY = o), this.minimized.set(o > 72 && t > 0));
  }
  themeIcon = oe$1(() => hi[this.theme.mode()]);
  themeLabel = oe$1(() => `Appearance: ${this.theme.mode()}. Switch to ${Ht[this.theme.mode()]}.`);
  cycleTheme() {
    this.theme.setMode(Ht[this.theme.mode()]);
  }
  openTab(o) {
    let t = this.navItems[o];
    t && this.router.navigate([t.link]);
  }
  pull = v(s);
  pullStyle = (o) => ({ top: `${o / 2}px` });
  refreshPulled() {
    this.pull.refresh();
  }
  static ɵfac = function (t) {
    return new (t || e)();
  };
  static ɵcmp = Vi$1({
    type: e,
    selectors: [[`app-shell`]],
    hostAttrs: [1, `block`, `min-h-dvh`, `bg-canvas`],
    hostBindings: function (t, i) {
      t & 1 &&
        zo(
          `scroll`,
          function () {
            return i.onScroll();
          },
          AM,
        );
    },
    features: [
      Na([
        { provide: Se, useFactory: () => v(s).loaded$ },
        { provide: te, useValue: Te },
      ]),
    ],
    decls: 5,
    vars: 5,
    consts: [
      [1, `shell__bar`],
      [3, `pulled`, `styleHandler`],
      [1, `w-full`],
      [`aria-label`, `Sections`, 1, `app-shell__tab-bar`, 3, `app-shell__dock--min`],
      [1, `shell__bar-inner`],
      [`routerLink`, `/dashboard`, `aria-label`, `Boreas dashboard`, 1, `shell__brand`],
      [
        `src`,
        `/brand-mark.png`,
        `width`,
        `28`,
        `height`,
        `28`,
        `alt`,
        ``,
        `aria-hidden`,
        `true`,
        1,
        `shell__mark`,
      ],
      [`aria-label`, `Sections`, 1, `flex`, `items-center`, `gap-0.5`],
      [1, `shell__nav-item`, 3, `routerLink`, `shell__nav-item--active`],
      [
        `tuiIconButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `s`,
        `appearance`,
        `flat-grayscale`,
        1,
        `ms-auto`,
        3,
        `click`,
      ],
      [1, `icon-sm`, 3, `icon`],
      [1, `shell__nav-item`, 3, `routerLink`],
      [`aria-label`, `Sections`, 1, `app-shell__tab-bar`],
      [3, `activeIndexChange`, `items`, `stacked`, `activeIndex`],
    ],
    template: function (t, i) {
      (t & 1 &&
        (hx(0, mi, 10, 3, `header`, 0),
        pl(1, `tui-pull-to-refresh`, 1),
        zo(`pulled`, function () {
          return i.refreshPulled();
        }),
        pl(2, `main`, 2),
        Rl(3, `router-outlet`),
        eg()(),
        hx(4, ui, 2, 5, `nav`, 3)),
        t & 2 &&
          (px(!i.mobile() && !i.onboarding() ? 0 : -1),
          vA(),
          VE(`styleHandler`, i.pullStyle),
          vA(),
          Kx(i.mainClass()),
          vA(2),
          px(i.mobile() && !i.onboarding() && !i.taskPage() ? 4 : -1)));
    },
    dependencies: [R, PI, am, It$1, EJ, Ut],
    styles: [
      `.app-shell__tab-bar[_ngcontent-%COMP%]{position:fixed;z-index:10;inset-inline:0;inset-block-end:max(env(safe-area-inset-bottom),1.25rem);display:flex;justify-content:center;pointer-events:none;view-transition-name:app-dock;transition:transform var(--%NS%tui-duration) cubic-bezier(.4,.1,.2,1)}.app-shell__tab-bar[_ngcontent-%COMP%]   app-glass-segmented[_ngcontent-%COMP%]{pointer-events:auto;inline-size:min(21rem,calc(100vw - 2rem))}.app-shell__dock--min[_ngcontent-%COMP%]{transform:scale(.86);transform-origin:bottom center}.shell__bar[_ngcontent-%COMP%]{view-transition-name:app-header;position:sticky;z-index:9;inset-block-start:0;border-block-end:1px solid var(--%NS%tui-border-normal);background:color-mix(in srgb,var(--%NS%tui-background-base) 82%,transparent);-webkit-backdrop-filter:blur(12px) saturate(180%);backdrop-filter:blur(12px) saturate(180%)}.shell__bar-inner[_ngcontent-%COMP%]{display:flex;align-items:center;gap:1.25rem;max-inline-size:80rem;margin-inline:auto;block-size:3.25rem;padding-inline:1.5rem}.shell__brand[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:.5rem;font-size:1.0625rem;font-weight:650;letter-spacing:-.015em;color:var(--%NS%tui-text-primary);text-decoration:none}.shell__mark[_ngcontent-%COMP%]{display:block;inline-size:1.75rem;block-size:1.75rem}.shell__nav-item[_ngcontent-%COMP%]{display:inline-flex;align-items:center;block-size:1.875rem;padding-inline:.625rem;border-radius:var(--%NS%tui-radius-s);font-size:.9375rem;font-weight:500;color:var(--%NS%tui-text-secondary);text-decoration:none;transition:background-color var(--%NS%tui-duration),color var(--%NS%tui-duration)}.shell__nav-item[_ngcontent-%COMP%]:hover{background:var(--%NS%tui-background-neutral-1);color:var(--%NS%tui-text-primary)}.shell__nav-item--active[_ngcontent-%COMP%], .shell__nav-item--%NS%active[_ngcontent-%COMP%]:hover{background:var(--%NS%app-accent-soft);color:var(--%NS%app-accent-text)}`,
    ],
  });
};
tk(
  class e {
    theme = v(c);
    static ɵfac = function (t) {
      return new (t || e)();
    };
    static ɵcmp = Vi$1({
      type: e,
      selectors: [[`app-root`]],
      hostAttrs: [1, `block`, `min-h-dvh`],
      decls: 2,
      vars: 1,
      consts: [[1, `block!`, `min-h-dvh`]],
      template: function (t, i) {
        (t & 1 && (pl(0, `tui-root`, 0), Rl(1, `app-shell`), eg()),
          t & 2 && kr(`tuiTheme`, i.theme.theme()));
      },
      dependencies: [L, It],
      encapsulation: 2,
    });
  },
  Rt,
).catch((e) => console.error(e));
export {
  tn as A,
  ae as C,
  or as D,
  oe as E,
  z as F,
  E as I,
  ws as M,
  zr as N,
  qi as O,
  h$1 as P,
  _n as S,
  ei$1 as T,
  Nn as _,
  Ai as a,
  Yn as b,
  ht as c,
  An as d,
  Cs as f,
  Me as g,
  Ln as h,
  j as i,
  vr as j,
  sr as k,
  $o as l,
  En as m,
  c as n,
  Qe as o,
  Ei as p,
  l as r,
  Ze as s,
  R as t,
  $t$1 as u,
  Ss as v,
  bs as w,
  Yt$1 as x,
  Tn as y,
};
