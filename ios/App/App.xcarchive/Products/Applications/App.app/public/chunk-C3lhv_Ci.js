import {
  $ as LI,
  $r as px,
  $t as Y,
  At as Rs,
  Bn as eg,
  Cr as kx,
  Dt as Rl,
  Ei as vA,
  Fi as vx,
  Hr as oN,
  Ir as mo,
  Jn as ft,
  Kt as Vi,
  Lr as mx,
  Qi as ye$1,
  Qr as pl,
  Sn as bV,
  Sr as kr,
  Ti as v,
  Tn as cC,
  Ur as oe,
  W as J$1,
  Wt as VE,
  _i as tg,
  _n as aN,
  aa as zS,
  ai as qe$1,
  an as ZE,
  ar as hs,
  b as EJ,
  ct as N9,
  da as n,
  di as sR,
  dt as Na,
  ea as yr,
  ei as q$1,
  fi as sg,
  ft as Nw,
  g as Ca,
  gn as aC,
  gt as Os,
  hr as jE,
  j as H$1,
  l as Ax,
  la as l$1,
  na as yx,
  nn as Yt,
  or as hx,
  ra as z$1,
  sa as zo,
  ua as m$1,
  ur as ie,
  vn as ag,
  wi as ur,
  zr as ng,
} from './chunk-CD8PwEax.js';
import { i as It, r as H$2 } from './chunk-bRWS10C8.js';
import { E as oe$1, b as Yn, g as Me$1 } from './main-YU6HVKXZ.js';
import './chunk-Cxjo7Efo.js';
import './chunk-C4cee0NY.js';
import { n as Qi, t as Nt } from './chunk-CXFBjKgF.js';
import { i as Qt, n as Jt, o as en$1, s as tn$1, t as Jr } from './chunk-BUsGNQJo.js';
import { t as b } from './chunk-xBD-xwVE.js';
import { t as v$1 } from './chunk-thr6BV2C.js';
import { t as Xt } from './chunk-BhZX3ewP.js';
import { t as it } from './chunk-WGNEVt_R.js';
var Ee = 4e3;
var rt = class t {
  http = v(Nw);
  isHealthy(e) {
    return this.http.get(`${e}/api/v1/health`).pipe(
      zS(Ee),
      Y((n) => n?.status === `healthy`),
      yr(() => z$1(!1)),
    );
  }
  static ɵfac = function (n) {
    return new (n || t)();
  };
  static ɵprov = q$1({ token: t, factory: t.ɵfac, providedIn: `root` });
};
var W = class t {
  config = v(H$2);
  health = v(rt);
  checkingState = H$1(!1);
  checking = this.checkingState.asReadonly();
  suggestedUrl() {
    return this.config.suggestedUrl();
  }
  connect(e) {
    return Rs(
      () => (
        this.checkingState.set(!0),
        this.health.isHealthy(e).pipe(
          ft((n) => {
            n && this.config.set(e);
          }),
          mo(() => this.checkingState.set(!1)),
        )
      ),
    );
  }
  static ɵfac = function (n) {
    return new (n || t)();
  };
  static ɵprov = q$1({ token: t, factory: t.ɵfac });
};
var q = class t {
  context = v(Me$1);
  tryAgain() {
    this.context.completeWith(void 0);
  }
  static ɵfac = function (n) {
    return new (n || t)();
  };
  static ɵcmp = Vi({
    type: t,
    selectors: [[`app-connect-failed-dialog`]],
    decls: 4,
    vars: 0,
    consts: [
      [1, `m-0`, `text-[0.9375rem]`, `leading-relaxed`, `text-secondary`],
      [
        `tuiButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `m`,
        `appearance`,
        `primary`,
        1,
        `mt-4`,
        `w-full`,
        3,
        `click`,
      ],
    ],
    template: function (n, r) {
      n & 1 &&
        (pl(0, `p`, 0),
        sR(1, ` No Boreas API answered at this address. Check it and try again. `),
        eg(),
        pl(2, `button`, 1),
        zo(`click`, function () {
          return r.tryAgain();
        }),
        sR(3, ` Try again `),
        eg());
    },
    dependencies: [It],
    encapsulation: 2,
  });
};
function X(t) {
  '@babel/helpers - typeof';
  return (
    (X =
      typeof Symbol == `function` && typeof Symbol.iterator == `symbol`
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            return e &&
              typeof Symbol == `function` &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
              ? `symbol`
              : typeof e;
          }),
    X(t)
  );
}
function xe(t, e) {
  if (X(t) != `object` || !t) return t;
  var n = t[Symbol.toPrimitive];
  if (n !== void 0) {
    var r = n.call(t, e || `default`);
    if (X(r) != `object`) return r;
    throw TypeError(`@@toPrimitive must return a primitive value.`);
  }
  return (e === `string` ? String : Number)(t);
}
function ke(t) {
  var e = xe(t, `string`);
  return X(e) == `symbol` ? e : e + ``;
}
function l(t, e, n) {
  return (
    (e = ke(e)) in t
      ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 })
      : (t[e] = n),
    t
  );
}
var Pe = class {
  requestAnimationFrame(t) {
    return requestAnimationFrame(t);
  }
  cancelAnimationFrame(t) {
    cancelAnimationFrame(t);
  }
};
var Oe = class {
  constructor() {
    (l(this, `_lastHandleId`, 0), l(this, `_lastImmediate`, null));
  }
  requestAnimationFrame(t) {
    return (
      this._lastHandleId >= 2 ** 53 - 1 && (this._lastHandleId = 0),
      (this._lastHandleId += 1),
      (this._lastImmediate = setImmediate(() => {
        t(performance.now());
      })),
      this._lastHandleId
    );
  }
  cancelAnimationFrame(t) {
    this._lastImmediate && clearImmediate(this._lastImmediate);
  }
};
var Fe = class {
  constructor() {
    (l(this, `_strategy`, void 0),
      (this._strategy = typeof requestAnimationFrame == `function` ? new Pe() : new Oe()));
  }
  requestAnimationFrame(t) {
    return this._strategy.requestAnimationFrame(t);
  }
  cancelAnimationFrame(t) {
    this._strategy.cancelAnimationFrame(t);
  }
};
var I = typeof window < `u` && window.document !== void 0;
var wt = new Uint8Array([80, 75, 3, 4]);
var Ae = [`v`, `ip`, `op`, `layers`, `fr`, `w`, `h`];
var i;
var F = Array(128).fill(void 0);
F.push(void 0, null, !0, !1);
function c(t) {
  return F[t];
}
var j = F.length;
function f(t) {
  j === F.length && F.push(F.length + 1);
  let e = j;
  return ((j = F[e]), (F[e] = t), e);
}
function T(t, e) {
  try {
    return t.apply(this, e);
  } catch (n) {
    i.__wbindgen_export_0(f(n));
  }
}
var o = 0;
var G = null;
function J() {
  return ((G === null || G.byteLength === 0) && (G = new Uint8Array(i.memory.buffer)), G);
}
var _t =
  typeof TextEncoder < `u`
    ? new TextEncoder(`utf-8`)
    : {
        encode: () => {
          throw Error(`TextEncoder not available`);
        },
      };
var Te =
  typeof _t.encodeInto == `function`
    ? function (t, e) {
        return _t.encodeInto(t, e);
      }
    : function (t, e) {
        let n = _t.encode(t);
        return (e.set(n), { read: t.length, written: n.length });
      };
function d(t, e, n) {
  if (n === void 0) {
    let u = _t.encode(t),
      y = e(u.length, 1) >>> 0;
    return (
      J()
        .subarray(y, y + u.length)
        .set(u),
      (o = u.length),
      y
    );
  }
  let r = t.length,
    s = e(r, 1) >>> 0,
    a = J(),
    _ = 0;
  for (; _ < r; _++) {
    let u = t.charCodeAt(_);
    if (u > 127) break;
    a[s + _] = u;
  }
  if (_ !== r) {
    (_ !== 0 && (t = t.slice(_)), (s = n(s, r, (r = _ + t.length * 3), 1) >>> 0));
    let u = J().subarray(s + _, s + r),
      y = Te(t, u);
    ((_ += y.written), (s = n(s, r, _, 1) >>> 0));
  }
  return ((o = _), s);
}
var R = null;
function h() {
  return (
    (R === null ||
      R.buffer.detached === !0 ||
      (R.buffer.detached === void 0 && R.buffer !== i.memory.buffer)) &&
      (R = new DataView(i.memory.buffer)),
    R
  );
}
var ye =
  typeof TextDecoder < `u`
    ? new TextDecoder(`utf-8`, { ignoreBOM: !0, fatal: !0 })
    : {
        decode: () => {
          throw Error(`TextDecoder not available`);
        },
      };
typeof TextDecoder < `u` && ye.decode();
function m(t, e) {
  return ((t >>>= 0), ye.decode(J().subarray(t, t + e)));
}
function Re(t) {
  t < 132 || ((F[t] = j), (j = t));
}
function S(t) {
  let e = c(t);
  return (Re(t), e);
}
function Le(t) {
  return t == null;
}
function yt(t, e) {
  let n = e(t.length * 1, 1) >>> 0;
  return (J().set(t, n / 1), (o = t.length), n);
}
function De(t, e) {
  let n = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
    r = o,
    s = yt(e, i.__wbindgen_export_1),
    a = o;
  return i.register_font(n, r, s, a) !== 0;
}
var V = null;
function ze() {
  return ((V === null || V.byteLength === 0) && (V = new Float32Array(i.memory.buffer)), V);
}
function $e(t, e) {
  let n = e(t.length * 4, 4) >>> 0;
  return (ze().set(t, n / 4), (o = t.length), n);
}
function Ue(t, e) {
  let n = e(t.length * 4, 4) >>> 0,
    r = h();
  for (let s = 0; s < t.length; s++) r.setUint32(n + 4 * s, f(t[s]), !0);
  return ((o = t.length), n);
}
var $ = Object.freeze({
  Forward: 0,
  0: `Forward`,
  Reverse: 1,
  1: `Reverse`,
  Bounce: 2,
  2: `Bounce`,
  ReverseBounce: 3,
  3: `ReverseBounce`,
});
var E = Object.freeze({
  Idle: 0,
  0: `Idle`,
  Playing: 1,
  1: `Playing`,
  Paused: 2,
  2: `Paused`,
  Stopped: 3,
  3: `Stopped`,
  Tweening: 4,
  4: `Tweening`,
});
var ge =
  typeof FinalizationRegistry > `u`
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry((t) => i.__wbg_dotlottieplayerwasm_free(t >>> 0, 1));
var Ne = class {
  __destroy_into_raw() {
    let t = this.__wbg_ptr;
    return ((this.__wbg_ptr = 0), ge.unregister(this), t);
  }
  free() {
    let t = this.__destroy_into_raw();
    i.__wbg_dotlottieplayerwasm_free(t, 0);
  }
  clear_slot(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    return i.dotlottieplayerwasm_clear_slot(this.__wbg_ptr, e, n) !== 0;
  }
  layout_fit() {
    let t, e;
    try {
      let s = i.__wbindgen_add_to_stack_pointer(-16);
      i.dotlottieplayerwasm_layout_fit(s, this.__wbg_ptr);
      var n = h().getInt32(s + 0, !0),
        r = h().getInt32(s + 4, !0);
      return ((t = n), (e = r), m(n, r));
    } finally {
      (i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export_3(t, e, 1));
    }
  }
  loop_count() {
    return i.dotlottieplayerwasm_loop_count(this.__wbg_ptr) >>> 0;
  }
  poll_event() {
    return S(i.dotlottieplayerwasm_poll_event(this.__wbg_ptr));
  }
  reset_slot(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    return i.dotlottieplayerwasm_reset_slot(this.__wbg_ptr, e, n) !== 0;
  }
  set_layout(t, e, n) {
    let r = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      s = o;
    return i.dotlottieplayerwasm_set_layout(this.__wbg_ptr, r, s, e, n) !== 0;
  }
  set_marker(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    i.dotlottieplayerwasm_set_marker(this.__wbg_ptr, e, n);
  }
  clear_slots() {
    return i.dotlottieplayerwasm_clear_slots(this.__wbg_ptr) !== 0;
  }
  is_complete() {
    return i.dotlottieplayerwasm_is_complete(this.__wbg_ptr) !== 0;
  }
  reset_slots() {
    return i.dotlottieplayerwasm_reset_slots(this.__wbg_ptr) !== 0;
  }
  reset_theme() {
    return i.dotlottieplayerwasm_reset_theme(this.__wbg_ptr) !== 0;
  }
  segment_end() {
    return i.dotlottieplayerwasm_segment_end(this.__wbg_ptr);
  }
  set_quality(t) {
    return i.dotlottieplayerwasm_set_quality(this.__wbg_ptr, t) !== 0;
  }
  set_segment(t, e) {
    return i.dotlottieplayerwasm_set_segment(this.__wbg_ptr, t, e) !== 0;
  }
  sm_set_seed(t) {
    return i.dotlottieplayerwasm_sm_set_seed(this.__wbg_ptr, t) !== 0;
  }
  static unload_font(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    return i.dotlottieplayerwasm_unload_font(e, n) !== 0;
  }
  animation_id() {
    try {
      let n = i.__wbindgen_add_to_stack_pointer(-16);
      i.dotlottieplayerwasm_animation_id(n, this.__wbg_ptr);
      var t = h().getInt32(n + 0, !0),
        e = h().getInt32(n + 4, !0);
      let r;
      return (t !== 0 && ((r = m(t, e).slice()), i.__wbindgen_export_3(t, e * 1, 1)), r);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16);
    }
  }
  audio_volume() {
    return i.dotlottieplayerwasm_audio_volume(this.__wbg_ptr);
  }
  background_a() {
    return i.dotlottieplayerwasm_background_a(this.__wbg_ptr);
  }
  background_b() {
    return i.dotlottieplayerwasm_background_b(this.__wbg_ptr);
  }
  background_g() {
    return i.dotlottieplayerwasm_background_g(this.__wbg_ptr);
  }
  background_r() {
    return i.dotlottieplayerwasm_background_r(this.__wbg_ptr);
  }
  clear_marker() {
    i.dotlottieplayerwasm_clear_marker(this.__wbg_ptr);
  }
  emit_on_loop() {
    i.dotlottieplayerwasm_emit_on_loop(this.__wbg_ptr);
  }
  get_slot_ids() {
    return S(i.dotlottieplayerwasm_get_slot_ids(this.__wbg_ptr));
  }
  get_slot_str(t) {
    try {
      let r = i.__wbindgen_add_to_stack_pointer(-16),
        s = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
        a = o;
      i.dotlottieplayerwasm_get_slot_str(r, this.__wbg_ptr, s, a);
      var e = h().getInt32(r + 0, !0),
        n = h().getInt32(r + 4, !0);
      let _;
      return (e !== 0 && ((_ = m(e, n).slice()), i.__wbindgen_export_3(e, n * 1, 1)), _);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16);
    }
  }
  marker_names() {
    return S(i.dotlottieplayerwasm_marker_names(this.__wbg_ptr));
  }
  set_autoplay(t) {
    i.dotlottieplayerwasm_set_autoplay(this.__wbg_ptr, t);
  }
  set_slot_str(t, e) {
    let n = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      r = o,
      s = d(e, i.__wbindgen_export_1, i.__wbindgen_export_2),
      a = o;
    return i.dotlottieplayerwasm_set_slot_str(this.__wbg_ptr, n, r, s, a) !== 0;
  }
  set_viewport(t, e, n, r) {
    return i.dotlottieplayerwasm_set_viewport(this.__wbg_ptr, t, e, n, r) !== 0;
  }
  total_frames() {
    return i.dotlottieplayerwasm_total_frames(this.__wbg_ptr);
  }
  clear_segment() {
    return i.dotlottieplayerwasm_clear_segment(this.__wbg_ptr) !== 0;
  }
  current_frame() {
    return i.dotlottieplayerwasm_current_frame(this.__wbg_ptr);
  }
  get_slot_type(t) {
    try {
      let r = i.__wbindgen_add_to_stack_pointer(-16),
        s = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
        a = o;
      i.dotlottieplayerwasm_get_slot_type(r, this.__wbg_ptr, s, a);
      var e = h().getInt32(r + 0, !0),
        n = h().getInt32(r + 4, !0);
      let _;
      return (e !== 0 && ((_ = m(e, n).slice()), i.__wbindgen_export_3(e, n * 1, 1)), _);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16);
    }
  }
  get_slots_str() {
    let t, e;
    try {
      let s = i.__wbindgen_add_to_stack_pointer(-16);
      i.dotlottieplayerwasm_get_slots_str(s, this.__wbg_ptr);
      var n = h().getInt32(s + 0, !0),
        r = h().getInt32(s + 4, !0);
      return ((t = n), (e = r), m(n, r));
    } finally {
      (i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export_3(t, e, 1));
    }
  }
  get_transform() {
    return S(i.dotlottieplayerwasm_get_transform(this.__wbg_ptr));
  }
  segment_start() {
    return i.dotlottieplayerwasm_segment_start(this.__wbg_ptr);
  }
  set_slots_str(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    return i.dotlottieplayerwasm_set_slots_str(this.__wbg_ptr, e, n) !== 0;
  }
  set_text_slot(t, e) {
    let n = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      r = o,
      s = d(e, i.__wbindgen_export_1, i.__wbindgen_export_2),
      a = o;
    return i.dotlottieplayerwasm_set_text_slot(this.__wbg_ptr, n, r, s, a) !== 0;
  }
  set_transform(t) {
    let e = $e(t, i.__wbindgen_export_1),
      n = o;
    return i.dotlottieplayerwasm_set_transform(this.__wbg_ptr, e, n) !== 0;
  }
  sm_get_inputs() {
    return S(i.dotlottieplayerwasm_sm_get_inputs(this.__wbg_ptr));
  }
  sm_poll_event() {
    return S(i.dotlottieplayerwasm_sm_poll_event(this.__wbg_ptr));
  }
  sm_post_click(t, e) {
    i.dotlottieplayerwasm_sm_post_click(this.__wbg_ptr, t, e);
  }
  animation_size() {
    return S(i.dotlottieplayerwasm_animation_size(this.__wbg_ptr));
  }
  current_marker() {
    try {
      let n = i.__wbindgen_add_to_stack_pointer(-16);
      i.dotlottieplayerwasm_current_marker(n, this.__wbg_ptr);
      var t = h().getInt32(n + 0, !0),
        e = h().getInt32(n + 4, !0);
      let r;
      return (t !== 0 && ((r = m(t, e).slice()), i.__wbindgen_export_3(t, e * 1, 1)), r);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16);
    }
  }
  layout_align_x() {
    return i.dotlottieplayerwasm_layout_align_x(this.__wbg_ptr);
  }
  layout_align_y() {
    return i.dotlottieplayerwasm_layout_align_y(this.__wbg_ptr);
  }
  load_animation(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    return i.dotlottieplayerwasm_load_animation(this.__wbg_ptr, e, n) !== 0;
  }
  loop_animation() {
    return i.dotlottieplayerwasm_loop_animation(this.__wbg_ptr) !== 0;
  }
  set_background(t, e, n, r) {
    return i.dotlottieplayerwasm_set_background(this.__wbg_ptr, t, e, n, r) !== 0;
  }
  set_color_slot(t, e, n, r) {
    let s = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      a = o;
    return i.dotlottieplayerwasm_set_color_slot(this.__wbg_ptr, s, a, e, n, r) !== 0;
  }
  set_image_slot(t, e) {
    let n = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      r = o,
      s = d(e, i.__wbindgen_export_1, i.__wbindgen_export_2),
      a = o;
    return i.dotlottieplayerwasm_set_image_slot(this.__wbg_ptr, n, r, s, a) !== 0;
  }
  set_loop_count(t) {
    i.dotlottieplayerwasm_set_loop_count(this.__wbg_ptr, t);
  }
  set_theme_data(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    return i.dotlottieplayerwasm_set_theme_data(this.__wbg_ptr, e, n) !== 0;
  }
  sm_reset_input(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    i.dotlottieplayerwasm_sm_reset_input(this.__wbg_ptr, e, n);
  }
  manifest_string() {
    let t, e;
    try {
      let s = i.__wbindgen_add_to_stack_pointer(-16);
      i.dotlottieplayerwasm_manifest_string(s, this.__wbg_ptr);
      var n = h().getInt32(s + 0, !0),
        r = h().getInt32(s + 4, !0);
      return ((t = n), (e = r), m(n, r));
    } finally {
      (i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export_3(t, e, 1));
    }
  }
  set_scalar_slot(t, e) {
    let n = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      r = o;
    return i.dotlottieplayerwasm_set_scalar_slot(this.__wbg_ptr, n, r, e) !== 0;
  }
  set_vector_slot(t, e, n) {
    let r = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      s = o;
    return i.dotlottieplayerwasm_set_vector_slot(this.__wbg_ptr, r, s, e, n) !== 0;
  }
  setup_sw_target(t, e) {
    return i.dotlottieplayerwasm_setup_sw_target(this.__wbg_ptr, t, e) !== 0;
  }
  get_pixel_buffer() {
    return S(i.dotlottieplayerwasm_get_pixel_buffer(this.__wbg_ptr));
  }
  set_audio_volume(t) {
    i.dotlottieplayerwasm_set_audio_volume(this.__wbg_ptr, t);
  }
  sm_current_state() {
    let t, e;
    try {
      let s = i.__wbindgen_add_to_stack_pointer(-16);
      i.dotlottieplayerwasm_sm_current_state(s, this.__wbg_ptr);
      var n = h().getInt32(s + 0, !0),
        r = h().getInt32(s + 4, !0);
      return ((t = n), (e = r), m(n, r));
    } finally {
      (i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export_3(t, e, 1));
    }
  }
  state_machine_id() {
    try {
      let n = i.__wbindgen_add_to_stack_pointer(-16);
      i.dotlottieplayerwasm_state_machine_id(n, this.__wbg_ptr);
      var t = h().getInt32(n + 0, !0),
        e = h().getInt32(n + 4, !0);
      let r;
      return (t !== 0 && ((r = m(t, e).slice()), i.__wbindgen_export_3(t, e * 1, 1)), r);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16);
    }
  }
  get_state_machine(t) {
    try {
      let r = i.__wbindgen_add_to_stack_pointer(-16),
        s = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
        a = o;
      i.dotlottieplayerwasm_get_state_machine(r, this.__wbg_ptr, s, a);
      var e = h().getInt32(r + 0, !0),
        n = h().getInt32(r + 4, !0);
      let _;
      return (e !== 0 && ((_ = m(e, n).slice()), i.__wbindgen_export_3(e, n * 1, 1)), _);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16);
    }
  }
  set_position_slot(t, e, n) {
    let r = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      s = o;
    return i.dotlottieplayerwasm_set_position_slot(this.__wbg_ptr, r, s, e, n) !== 0;
  }
  current_loop_count() {
    return i.dotlottieplayerwasm_current_loop_count(this.__wbg_ptr) >>> 0;
  }
  set_asset_resolver(t) {
    i.dotlottieplayerwasm_set_asset_resolver(this.__wbg_ptr, Le(t) ? 0 : f(t));
  }
  sm_framework_setup() {
    return S(i.dotlottieplayerwasm_sm_framework_setup(this.__wbg_ptr));
  }
  sm_post_pointer_up(t, e) {
    i.dotlottieplayerwasm_sm_post_pointer_up(this.__wbg_ptr, t, e);
  }
  state_machine_load(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    return i.dotlottieplayerwasm_state_machine_load(this.__wbg_ptr, e, n) !== 0;
  }
  load_dotlottie_data(t) {
    let e = yt(t, i.__wbindgen_export_1),
      n = o;
    return i.dotlottieplayerwasm_load_dotlottie_data(this.__wbg_ptr, e, n) !== 0;
  }
  sm_get_string_input(t) {
    try {
      let r = i.__wbindgen_add_to_stack_pointer(-16),
        s = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
        a = o;
      i.dotlottieplayerwasm_sm_get_string_input(r, this.__wbg_ptr, s, a);
      var e = h().getInt32(r + 0, !0),
        n = h().getInt32(r + 4, !0);
      let _;
      return (e !== 0 && ((_ = m(e, n).slice()), i.__wbindgen_export_3(e, n * 1, 1)), _);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16);
    }
  }
  sm_set_string_input(t, e) {
    let n = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      r = o,
      s = d(e, i.__wbindgen_export_1, i.__wbindgen_export_2),
      a = o;
    return i.dotlottieplayerwasm_sm_set_string_input(this.__wbg_ptr, n, r, s, a) !== 0;
  }
  sm_get_boolean_input(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o,
      r = i.dotlottieplayerwasm_sm_get_boolean_input(this.__wbg_ptr, e, n);
    return r === 16777215 ? void 0 : r !== 0;
  }
  sm_get_numeric_input(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o,
      r = i.dotlottieplayerwasm_sm_get_numeric_input(this.__wbg_ptr, e, n);
    return r === 4294967297 ? void 0 : r;
  }
  sm_post_pointer_down(t, e) {
    i.dotlottieplayerwasm_sm_post_pointer_down(this.__wbg_ptr, t, e);
  }
  sm_post_pointer_exit(t, e) {
    i.dotlottieplayerwasm_sm_post_pointer_exit(this.__wbg_ptr, t, e);
  }
  sm_post_pointer_move(t, e) {
    i.dotlottieplayerwasm_sm_post_pointer_move(this.__wbg_ptr, t, e);
  }
  sm_set_boolean_input(t, e) {
    let n = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      r = o;
    return i.dotlottieplayerwasm_sm_set_boolean_input(this.__wbg_ptr, n, r, e) !== 0;
  }
  sm_set_numeric_input(t, e) {
    let n = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      r = o;
    return i.dotlottieplayerwasm_sm_set_numeric_input(this.__wbg_ptr, n, r, e) !== 0;
  }
  state_machine_unload() {
    i.dotlottieplayerwasm_state_machine_unload(this.__wbg_ptr);
  }
  sm_post_pointer_enter(t, e) {
    i.dotlottieplayerwasm_sm_post_pointer_enter(this.__wbg_ptr, t, e);
  }
  load_animation_from_id(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    return i.dotlottieplayerwasm_load_animation_from_id(this.__wbg_ptr, e, n) !== 0;
  }
  sm_poll_internal_event() {
    return S(i.dotlottieplayerwasm_sm_poll_internal_event(this.__wbg_ptr));
  }
  use_frame_interpolation() {
    return i.dotlottieplayerwasm_use_frame_interpolation(this.__wbg_ptr) !== 0;
  }
  reset_current_loop_count() {
    i.dotlottieplayerwasm_reset_current_loop_count(this.__wbg_ptr);
  }
  sm_override_current_state(t, e) {
    let n = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      r = o;
    return i.dotlottieplayerwasm_sm_override_current_state(this.__wbg_ptr, n, r, e) !== 0;
  }
  state_machine_load_from_id(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    return i.dotlottieplayerwasm_state_machine_load_from_id(this.__wbg_ptr, e, n) !== 0;
  }
  set_use_frame_interpolation(t) {
    i.dotlottieplayerwasm_set_use_frame_interpolation(this.__wbg_ptr, t);
  }
  constructor() {
    let t = i.dotlottieplayerwasm_new();
    return ((this.__wbg_ptr = t >>> 0), ge.register(this, this.__wbg_ptr, this), this);
  }
  mode() {
    return i.dotlottieplayerwasm_mode(this.__wbg_ptr);
  }
  play() {
    return i.dotlottieplayerwasm_play(this.__wbg_ptr) !== 0;
  }
  stop() {
    return i.dotlottieplayerwasm_stop(this.__wbg_ptr) !== 0;
  }
  tick(t) {
    return i.dotlottieplayerwasm_tick(this.__wbg_ptr, t) !== 0;
  }
  pause() {
    return i.dotlottieplayerwasm_pause(this.__wbg_ptr) !== 0;
  }
  speed() {
    return i.dotlottieplayerwasm_speed(this.__wbg_ptr);
  }
  width() {
    return i.dotlottieplayerwasm_width(this.__wbg_ptr) >>> 0;
  }
  height() {
    return i.dotlottieplayerwasm_height(this.__wbg_ptr) >>> 0;
  }
  render() {
    return i.dotlottieplayerwasm_render(this.__wbg_ptr) !== 0;
  }
  status() {
    return i.dotlottieplayerwasm_status(this.__wbg_ptr);
  }
  markers() {
    return S(i.dotlottieplayerwasm_markers(this.__wbg_ptr));
  }
  sm_fire(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    return i.dotlottieplayerwasm_sm_fire(this.__wbg_ptr, e, n) !== 0;
  }
  sm_stop() {
    return i.dotlottieplayerwasm_sm_stop(this.__wbg_ptr) !== 0;
  }
  sm_tick(t) {
    return i.dotlottieplayerwasm_sm_tick(this.__wbg_ptr, t) !== 0;
  }
  autoplay() {
    return i.dotlottieplayerwasm_autoplay(this.__wbg_ptr) !== 0;
  }
  duration() {
    return i.dotlottieplayerwasm_duration(this.__wbg_ptr);
  }
  set_loop(t) {
    i.dotlottieplayerwasm_set_loop(this.__wbg_ptr, t);
  }
  set_mode(t) {
    i.dotlottieplayerwasm_set_mode(this.__wbg_ptr, t);
  }
  sm_start(t, e) {
    let n = Ue(e, i.__wbindgen_export_1),
      r = o;
    return i.dotlottieplayerwasm_sm_start(this.__wbg_ptr, t, n, r) !== 0;
  }
  theme_id() {
    try {
      let n = i.__wbindgen_add_to_stack_pointer(-16);
      i.dotlottieplayerwasm_theme_id(n, this.__wbg_ptr);
      var t = h().getInt32(n + 0, !0),
        e = h().getInt32(n + 4, !0);
      let r;
      return (t !== 0 && ((r = m(t, e).slice()), i.__wbindgen_export_3(t, e * 1, 1)), r);
    } finally {
      i.__wbindgen_add_to_stack_pointer(16);
    }
  }
  load_font(t, e) {
    let n = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      r = o,
      s = yt(e, i.__wbindgen_export_1),
      a = o;
    return i.dotlottieplayerwasm_load_font(this.__wbg_ptr, n, r, s, a) !== 0;
  }
  set_frame(t) {
    return i.dotlottieplayerwasm_set_frame(this.__wbg_ptr, t) !== 0;
  }
  set_speed(t) {
    i.dotlottieplayerwasm_set_speed(this.__wbg_ptr, t);
  }
  set_theme(t) {
    let e = d(t, i.__wbindgen_export_1, i.__wbindgen_export_2),
      n = o;
    return i.dotlottieplayerwasm_set_theme(this.__wbg_ptr, e, n) !== 0;
  }
  sm_status() {
    let t, e;
    try {
      let s = i.__wbindgen_add_to_stack_pointer(-16);
      i.dotlottieplayerwasm_sm_status(s, this.__wbg_ptr);
      var n = h().getInt32(s + 0, !0),
        r = h().getInt32(s + 4, !0);
      return ((t = n), (e = r), m(n, r));
    } finally {
      (i.__wbindgen_add_to_stack_pointer(16), i.__wbindgen_export_3(t, e, 1));
    }
  }
};
async function Be(t, e) {
  if (typeof Response == `function` && t instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming == `function`)
      try {
        return await WebAssembly.instantiateStreaming(t, e);
      } catch (r) {
        if (t.headers.get(`Content-Type`) != `application/wasm`)
          console.warn(
            '`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n',
            r,
          );
        else throw r;
      }
    let n = await t.arrayBuffer();
    return await WebAssembly.instantiate(n, e);
  } else {
    let n = await WebAssembly.instantiate(t, e);
    return n instanceof WebAssembly.Instance ? { instance: n, module: t } : n;
  }
}
function We() {
  let t = {};
  return (
    (t.wbg = {}),
    (t.wbg.__wbg_buffer_609cc3eee51ed158 = function (e) {
      let n = c(e).buffer;
      return f(n);
    }),
    (t.wbg.__wbg_call_7cccdd69e0791ae2 = function () {
      return T(function (e, n, r) {
        return f(c(e).call(c(n), c(r)));
      }, arguments);
    }),
    (t.wbg.__wbg_createObjectURL_6e98d2f9c7bd9764 = function () {
      return T(function (e, n) {
        let r = d(URL.createObjectURL(c(n)), i.__wbindgen_export_1, i.__wbindgen_export_2),
          s = o;
        (h().setInt32(e + 4, s, !0), h().setInt32(e + 0, r, !0));
      }, arguments);
    }),
    (t.wbg.__wbg_ended_b873fb75d0c13ca7 = function (e) {
      return c(e).ended;
    }),
    (t.wbg.__wbg_error_7534b8e9a36f1ab4 = function (e, n) {
      let r, s;
      try {
        ((r = e), (s = n), console.error(m(e, n)));
      } finally {
        i.__wbindgen_export_3(r, s, 1);
      }
    }),
    (t.wbg.__wbg_length_a446193dc22c12f8 = function (e) {
      return c(e).length;
    }),
    (t.wbg.__wbg_new_405e22f390576ce2 = function () {
      return f({});
    }),
    (t.wbg.__wbg_new_78feb108b6472713 = function () {
      return f([]);
    }),
    (t.wbg.__wbg_new_8a6f238a6ece86ea = function () {
      return f(Error());
    }),
    (t.wbg.__wbg_new_a12002a7f91c75be = function (e) {
      return f(new Uint8Array(c(e)));
    }),
    (t.wbg.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a = function (e, n, r) {
      return f(new Uint8Array(c(e), n >>> 0, r >>> 0));
    }),
    (t.wbg.__wbg_newwithlength_5a5efe313cfd59f1 = function (e) {
      return f(new Float32Array(e >>> 0));
    }),
    (t.wbg.__wbg_newwithsrc_20307ca7e8762a81 = function () {
      return T(function (e, n) {
        return f(new Audio(m(e, n)));
      }, arguments);
    }),
    (t.wbg.__wbg_newwithu8arraysequenceandoptions_068570c487f69127 = function () {
      return T(function (e, n) {
        return f(new Blob(c(e), c(n)));
      }, arguments);
    }),
    (t.wbg.__wbg_pause_b74c96d69f769518 = function () {
      return T(function (e) {
        c(e).pause();
      }, arguments);
    }),
    (t.wbg.__wbg_play_f6ec5fc4e84b0d26 = function () {
      return T(function (e) {
        return f(c(e).play());
      }, arguments);
    }),
    (t.wbg.__wbg_push_737cfc8c1432c2c6 = function (e, n) {
      return c(e).push(c(n));
    }),
    (t.wbg.__wbg_revokeObjectURL_27267efebeb457c7 = function () {
      return T(function (e, n) {
        URL.revokeObjectURL(m(e, n));
      }, arguments);
    }),
    (t.wbg.__wbg_set_65595bdd868b3009 = function (e, n, r) {
      c(e).set(c(n), r >>> 0);
    }),
    (t.wbg.__wbg_set_bb8cecf6a62b9f46 = function () {
      return T(function (e, n, r) {
        return Reflect.set(c(e), c(n), c(r));
      }, arguments);
    }),
    (t.wbg.__wbg_setcurrentTime_64727eddd3966512 = function (e, n) {
      c(e).currentTime = n;
    }),
    (t.wbg.__wbg_setindex_4e73afdcd9bb95cd = function (e, n, r) {
      c(e)[n >>> 0] = r;
    }),
    (t.wbg.__wbg_settype_39ed370d3edd403c = function (e, n, r) {
      c(e).type = m(n, r);
    }),
    (t.wbg.__wbg_setvolume_3895e06a030ca4f7 = function (e, n) {
      c(e).volume = n;
    }),
    (t.wbg.__wbg_stack_0ed75d68575b0f3c = function (e, n) {
      let r = c(n).stack,
        s = d(r, i.__wbindgen_export_1, i.__wbindgen_export_2),
        a = o;
      (h().setInt32(e + 4, a, !0), h().setInt32(e + 0, s, !0));
    }),
    (t.wbg.__wbindgen_is_null = function (e) {
      return c(e) === null;
    }),
    (t.wbg.__wbindgen_is_undefined = function (e) {
      return c(e) === void 0;
    }),
    (t.wbg.__wbindgen_memory = function () {
      let e = i.memory;
      return f(e);
    }),
    (t.wbg.__wbindgen_number_new = function (e) {
      return f(e);
    }),
    (t.wbg.__wbindgen_object_drop_ref = function (e) {
      S(e);
    }),
    (t.wbg.__wbindgen_string_get = function (e, n) {
      let r = c(n),
        s = typeof r == `string` ? r : void 0;
      var a = Le(s) ? 0 : d(s, i.__wbindgen_export_1, i.__wbindgen_export_2),
        _ = o;
      (h().setInt32(e + 4, _, !0), h().setInt32(e + 0, a, !0));
    }),
    (t.wbg.__wbindgen_string_new = function (e, n) {
      return f(m(e, n));
    }),
    (t.wbg.__wbindgen_throw = function (e, n) {
      throw Error(m(e, n));
    }),
    t
  );
}
function He(t, e) {
  return ((i = t.exports), (Ce.__wbindgen_wasm_module = e), (R = null), (V = null), (G = null), i);
}
async function Ce(t) {
  if (i !== void 0) return i;
  if (
    (t !== void 0 &&
      (Object.getPrototypeOf(t) === Object.prototype
        ? ({ module_or_path: t } = t)
        : console.warn(
            `using deprecated parameters for the initialization function; pass a single object instead`,
          )),
    t === void 0)
  )
    throw Error(`WASM module URL must be provided via DotLottieWasmLoader or setWasmUrl().`);
  let e = We();
  (typeof t == `string` ||
    (typeof Request == `function` && t instanceof Request) ||
    (typeof URL == `function` && t instanceof URL)) &&
    (t = fetch(t));
  let { instance: n, module: r } = await Be(await t, e);
  return He(n, r);
}
var qe = class {
  constructor() {
    l(this, `_eventListeners`, new Map());
  }
  addEventListener(t, e) {
    let n = this._eventListeners.get(t);
    (n || ((n = new Set()), this._eventListeners.set(t, n)), n.add(e));
  }
  removeEventListener(t, e) {
    let n = this._eventListeners.get(t);
    n &&
      (e
        ? (n.delete(e), n.size === 0 && this._eventListeners.delete(t))
        : this._eventListeners.delete(t));
  }
  dispatch(t) {
    this._eventListeners.get(t.type)?.forEach((e) => e(t));
  }
  removeAllEventListeners() {
    this._eventListeners.clear();
  }
};
var D = class M {
  static _initializeObserver() {
    M._observer ||
      (M._observer = new IntersectionObserver(
        (e) => {
          e.forEach((n) => {
            let r = M._observedCanvases.get(n.target);
            r && (n.isIntersecting ? r.unfreeze() : r.freeze());
          });
        },
        { threshold: 0 },
      ));
  }
  static observe(e, n) {
    (M._initializeObserver(),
      !M._observedCanvases.has(e) && (M._observedCanvases.set(e, n), M._observer?.observe(e)));
  }
  static unobserve(e) {
    (M._observer?.unobserve(e),
      M._observedCanvases.delete(e),
      M._observedCanvases.size === 0 && (M._observer?.disconnect(), (M._observer = null)));
  }
};
(l(D, `_observer`, null), l(D, `_observedCanvases`, new Map()));
var z = class b {
  static _initializeObserver() {
    b._observer ||
      (b._observer = new ResizeObserver((e) => {
        e.forEach((n) => {
          let r = b._observedCanvases.get(n.target);
          if (!r) return;
          let [s, a] = r;
          clearTimeout(a);
          let _ = setTimeout(() => {
            s.resize();
          }, 100);
          b._observedCanvases.set(n.target, [s, _]);
        });
      }));
  }
  static observe(e, n) {
    (b._initializeObserver(),
      !b._observedCanvases.has(e) && (b._observedCanvases.set(e, [n, 0]), b._observer?.observe(e)));
  }
  static unobserve(e) {
    let n = b._observedCanvases.get(e);
    if (n) {
      let r = n[1];
      r && clearTimeout(r);
    }
    (b._observer?.unobserve(e),
      b._observedCanvases.delete(e),
      !b._observedCanvases.size && b._observer && (b._observer.disconnect(), (b._observer = null)));
  }
};
(l(z, `_observer`, null), l(z, `_observedCanvases`, new Map()));
function Ge(t) {
  return /^#([\da-f]{6}|[\da-f]{8})$/iu.test(t);
}
function Ve(t) {
  if (!Ge(t)) return [0, 0, 0, 0];
  let e = t.replace(`#`, ``);
  return (
    (e = e.length === 6 ? `${e}ff` : e),
    [
      parseInt(e.slice(0, 2), 16) / 255,
      parseInt(e.slice(2, 4), 16) / 255,
      parseInt(e.slice(4, 6), 16) / 255,
      parseInt(e.slice(6, 8), 16) / 255,
    ]
  );
}
function fe(t) {
  if (t.byteLength < 4) return !1;
  let e = new Uint8Array(t.slice(0, wt.byteLength));
  for (let n = 0; n < wt.length; n += 1) if (wt[n] !== e[n]) return !1;
  return !0;
}
function je(t) {
  return Ae.every((e) => Object.hasOwn(t, e));
}
function we(t) {
  return typeof t == `string` ? /^\s*\{/u.test(t) && /\}\s*$/u.test(t) : je(t);
}
function ve() {
  return 1 + ((I ? window.devicePixelRatio : 1) - 1) * 0.75;
}
function at(t) {
  let e = t.getBoundingClientRect(),
    n = window.innerHeight || document.documentElement.clientHeight,
    r = window.innerWidth || document.documentElement.clientWidth;
  return !(e.bottom < 0 || e.top > n || e.right < 0 || e.left > r);
}
function H(t) {
  let e = t.target;
  if (e instanceof HTMLCanvasElement) {
    let n = e.getBoundingClientRect();
    if (n.width === 0 || n.height === 0 || e.width === 0 || e.height === 0) return null;
    let r = e.width / n.width,
      s = e.height / n.height,
      a = (t.clientX - n.left) * r,
      _ = (t.clientY - n.top) * s;
    return !Number.isFinite(a) || !Number.isFinite(_) || Number.isNaN(a) || Number.isNaN(_)
      ? null
      : { x: a, y: _ };
  }
  return null;
}
function Je(t) {
  return new Promise((e, n) => {
    let r = new FileReader();
    ((r.onerror = () => n(r.error ?? Error(`Failed to read image slot source`))),
      (r.onload = () => e(r.result)),
      r.readAsDataURL(t));
  });
}
async function Xe(t) {
  if (!/^https?:\/\//i.test(t)) return t;
  let e = await fetch(t);
  if (!e.ok)
    throw Error(`Failed to fetch image slot source from URL: ${t}. ${e.status}: ${e.statusText}`);
  return Je(await e.blob());
}
function Ke(t) {
  let e = t.replace(`OpenUrl: `, ``),
    n = e.indexOf(` | Target: `),
    r,
    s;
  (n === -1 ? ((r = e), (s = `_blank`)) : ((r = e.substring(0, n)), (s = e.substring(n + 11))),
    window.open(r, s));
}
function Qe(t, e, n) {
  let r = null,
    s = e;
  async function a(u) {
    await t({ module_or_path: u });
  }
  async function _(u) {
    let y = await fetch(u);
    if (!y.ok) throw Error(`fetch ${u} responded with ${y.status} ${y.statusText}`);
    await t({ module_or_path: await y.arrayBuffer() });
  }
  return {
    load() {
      if (!r) {
        let u = s,
          y = n;
        r = (async () => {
          let Ct, Mt;
          try {
            await a(u);
            return;
          } catch (P) {
            ((Ct = P),
              console.warn(`Primary WASM load failed from ${u}: ${P.message}`),
              console.warn(`Attempting to load WASM from backup URL: ${y}`));
          }
          try {
            await a(y);
            return;
          } catch (P) {
            ((Mt = P), console.warn(`Backup WASM load failed from ${y}: ${P.message}`));
          }
          console.warn(`Retrying WASM load with buffered instantiation`);
          try {
            await _(u);
            return;
          } catch (P) {
            console.warn(`Buffered WASM load from ${u} failed: ${P.message}`);
          }
          try {
            await _(y);
            return;
          } catch (P) {
            throw (
              console.error(`Primary WASM URL failed: ${Ct.message}`),
              console.error(`Backup WASM URL failed: ${Mt.message}`),
              console.error(`Buffered fallback failed: ${P.message}`),
              (r = null),
              Error(`WASM loading failed from all sources.`)
            );
          }
        })();
      }
      return r;
    },
    setWasmUrl(u) {
      u !== s && ((s = u), (r = null));
    },
  };
}
var vt = null;
function ot() {
  return (
    vt ??
      (vt = Qe(
        Ce,
        `https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0.79.1/dist/dotlottie-player.wasm`,
        `https://unpkg.com/@lottiefiles/dotlottie-web@0.79.1/dist/dotlottie-player.wasm`,
      )),
    vt
  );
}
var bt = (t) => {
  switch (t) {
    case `reverse`:
      return $.Reverse;
    case `bounce`:
      return $.Bounce;
    case `reverse-bounce`:
      return $.ReverseBounce;
    default:
      return $.Forward;
  }
};
var be = (t) => {
  switch (t) {
    case $.Reverse:
      return `reverse`;
    case $.Bounce:
      return `bounce`;
    case $.ReverseBounce:
      return `reverse-bounce`;
    default:
      return `forward`;
  }
};
var Ye = (t) => {
  switch (t) {
    case `contain`:
      return `contain`;
    case `cover`:
      return `cover`;
    case `fill`:
      return `fill`;
    case `fit-height`:
      return `fit-height`;
    case `fit-width`:
      return `fit-width`;
    case `none`:
      return `none`;
    default:
      return `contain`;
  }
};
var Lt = class {
  constructor(t) {
    (l(this, `_canvas`, null),
      l(this, `_pendingLoad`, null),
      l(this, `_srcFetchAbort`, null),
      l(this, `_context`, null),
      l(this, `_eventManager`, void 0),
      l(this, `_animationFrameId`, null),
      l(this, `_frameManager`, void 0),
      l(this, `_boundAnimationLoop`, void 0),
      l(this, `_dotLottieCore`, null),
      l(this, `_stateMachineId`, ``),
      l(this, `_stateMachineConfig`, null),
      l(this, `_isStateMachineRunning`, !1),
      l(this, `_renderConfig`, {}),
      l(this, `_isFrozen`, !1),
      l(this, `_backgroundColor`, null),
      l(this, `_lastFrameTime`, null),
      l(this, `_boundOnClick`, null),
      l(this, `_boundOnPointerUp`, null),
      l(this, `_boundOnPointerDown`, null),
      l(this, `_boundOnPointerMove`, null),
      l(this, `_boundOnPointerEnter`, null),
      l(this, `_boundOnPointerLeave`, null),
      l(this, `_bufferMismatchCount`, 0),
      l(this, `_lastExpectedBufferSize`, 0),
      l(this, `_cachedImageData`, null),
      l(this, `_cachedImageDataBuffer`, null),
      l(this, `_cachedImageDataByteOffset`, 0),
      l(this, `_marker`, ``),
      l(this, `_segment`, null),
      (this._canvas = t.canvas ?? null),
      (this._eventManager = new qe()),
      (this._frameManager = new Fe()),
      (this._boundAnimationLoop = this._animationLoop.bind(this)),
      (this._renderConfig = m$1(l$1({}, t.renderConfig), {
        devicePixelRatio: t.renderConfig?.devicePixelRatio || ve(),
        freezeOnOffscreen: t.renderConfig?.freezeOnOffscreen ?? !0,
      })));
    let e = null;
    (t.src &&
      !t.data &&
      ((this._srcFetchAbort = new AbortController()),
      (e = this._fetchData(t.src, this._srcFetchAbort.signal)),
      e.catch(() => {})),
      this._initWasm()
        .then(() => {
          ((this._dotLottieCore = this._createCore()),
            this._dotLottieCore.set_autoplay(t.autoplay ?? !1),
            this._dotLottieCore.set_loop(t.loop ?? !1),
            this._dotLottieCore.set_loop_count(t.loopCount ?? 0),
            this._dotLottieCore.set_mode(bt(t.mode ?? `forward`)),
            this._dotLottieCore.set_speed(t.speed ?? 1),
            this._dotLottieCore.set_use_frame_interpolation(t.useFrameInterpolation ?? !0),
            t.segment &&
              t.segment.length === 2 &&
              ((this._segment = [t.segment[0], t.segment[1]]),
              this._dotLottieCore.set_segment(this._segment[0], this._segment[1])),
            (this._marker = t.marker ?? ``),
            this._marker && this._dotLottieCore.set_marker(this._marker),
            this._dotLottieCore.set_layout(
              t.layout?.fit ?? `contain`,
              t.layout?.align?.[0] ?? 0.5,
              t.layout?.align?.[1] ?? 0.5,
            ),
            this._applyAssetResolver(t.assetResolver ?? null),
            (this._stateMachineId = t.stateMachineId ?? ``),
            (this._stateMachineConfig = t.stateMachineConfig ?? null),
            this._onCoreCreated(),
            this._eventManager.dispatch({ type: `ready` }),
            t.data
              ? this._canvas
                ? this._loadFromData(t.data)
                : (this._pendingLoad = { data: t.data })
              : t.src &&
                (this._canvas
                  ? this._loadFromSrc(t.src, e)
                  : (this._pendingLoad = { src: t.src, dataPromise: e })),
            t.backgroundColor && this.setBackgroundColor(t.backgroundColor));
        })
        .catch((n) => {
          (this._srcFetchAbort?.abort(),
            console.error(`[dotlottie-web] Initialization failed:`, n),
            this._eventManager.dispatch({
              type: `loadError`,
              error: Error(`Failed to load wasm module: ${n}`),
            }));
        }));
  }
  async _initWasm() {
    return ot().load();
  }
  _createCore() {
    return new Ne();
  }
  _onCoreCreated() {}
  _setupTarget(t, e) {
    return this._dotLottieCore ? this._dotLottieCore.setup_sw_target(t, e) : !1;
  }
  _drainPlayerEvents({ skipFrame: t = !1 } = {}) {
    if (this._dotLottieCore)
      for (;;) {
        let e = this._dotLottieCore.poll_event();
        if (e == null) break;
        switch (e.type) {
          case `Load`:
            setTimeout(() => this._eventManager.dispatch({ type: `load` }), 0);
            break;
          case `LoadError`:
            setTimeout(
              () =>
                this._eventManager.dispatch({ type: `loadError`, error: Error(`failed to load`) }),
              0,
            );
            break;
          case `Play`:
            queueMicrotask(() => this._eventManager.dispatch({ type: `play` }));
            break;
          case `Pause`:
            queueMicrotask(() => this._eventManager.dispatch({ type: `pause` }));
            break;
          case `Stop`:
            queueMicrotask(() => this._eventManager.dispatch({ type: `stop` }));
            break;
          case `Frame`: {
            let n = e.frameNo ?? 0;
            t ||
              queueMicrotask(() => this._eventManager.dispatch({ type: `frame`, currentFrame: n }));
            break;
          }
          case `Render`: {
            let n = e.frameNo ?? 0;
            t ||
              queueMicrotask(() =>
                this._eventManager.dispatch({ type: `render`, currentFrame: n }),
              );
            break;
          }
          case `Loop`: {
            let n = e.loopCount ?? 0;
            queueMicrotask(() => this._eventManager.dispatch({ type: `loop`, loopCount: n }));
            break;
          }
          case `Complete`:
            queueMicrotask(() => this._eventManager.dispatch({ type: `complete` }));
            break;
          default:
            break;
        }
      }
  }
  _discardPlayerEvents() {
    for (; this._dotLottieCore?.poll_event() != null;);
  }
  _drainSmEvents() {
    if (this._dotLottieCore) {
      for (;;) {
        let t = this._dotLottieCore.sm_poll_event();
        if (t == null) break;
        switch (t.type) {
          case `Start`:
            queueMicrotask(() => {
              ((this._isStateMachineRunning = !0),
                this._eventManager.dispatch({ type: `stateMachineStart` }),
                this._startAnimationLoop());
            });
            break;
          case `Stop`:
            queueMicrotask(() => {
              ((this._isStateMachineRunning = !1),
                this._eventManager.dispatch({ type: `stateMachineStop` }),
                this._dotLottieCore?.status() !== E.Playing && this._stopAnimationLoop());
            });
            break;
          case `CustomEvent`:
            this._eventManager.dispatch({
              type: `stateMachineCustomEvent`,
              eventName: t.message ?? ``,
            });
            break;
          case `BooleanInputChange`:
            this._eventManager.dispatch({
              type: `stateMachineBooleanInputValueChange`,
              inputName: t.name ?? ``,
              newValue: t.newValue,
              oldValue: t.oldValue,
            });
            break;
          case `NumericInputChange`:
            this._eventManager.dispatch({
              type: `stateMachineNumericInputValueChange`,
              inputName: t.name ?? ``,
              newValue: t.newValue,
              oldValue: t.oldValue,
            });
            break;
          case `StringInputChange`:
            this._eventManager.dispatch({
              type: `stateMachineStringInputValueChange`,
              inputName: t.name ?? ``,
              newValue: t.newValue,
              oldValue: t.oldValue,
            });
            break;
          case `InputFired`:
            this._eventManager.dispatch({
              type: `stateMachineInputFired`,
              inputName: t.name ?? ``,
            });
            break;
          case `Transition`:
            this._eventManager.dispatch({
              type: `stateMachineTransition`,
              fromState: t.previousState ?? ``,
              toState: t.newState ?? ``,
            });
            break;
          case `StateEntered`:
            this._eventManager.dispatch({ type: `stateMachineStateEntered`, state: t.state ?? `` });
            break;
          case `StateExit`:
            this._eventManager.dispatch({ type: `stateMachineStateExit`, state: t.state ?? `` });
            break;
          case `Error`:
            this._eventManager.dispatch({ type: `stateMachineError`, error: t.message ?? `` });
            break;
          default:
            break;
        }
      }
      for (;;) {
        let t = this._dotLottieCore.sm_poll_internal_event();
        if (t == null) break;
        if (t.type === `Message`) {
          let e = t.message ?? ``;
          I && e.startsWith(`OpenUrl: `)
            ? Ke(e)
            : this._eventManager.dispatch({ type: `stateMachineInternalMessage`, message: e });
        }
      }
    }
  }
  _dispatchError(t) {
    (console.error(t), this._eventManager.dispatch({ type: `loadError`, error: Error(t) }));
  }
  async _fetchData(t, e = null) {
    let n = await fetch(t, { signal: e });
    if (!n.ok)
      throw Error(`Failed to fetch animation data from URL: ${t}. ${n.status}: ${n.statusText}`);
    let r = await n.arrayBuffer();
    return fe(r) ? r : new TextDecoder().decode(r);
  }
  _loadFromData(t) {
    if (this._dotLottieCore === null) return;
    if (!this._canvas) {
      console.warn(`[dotlottie-web] Cannot load animation without canvas. Call setCanvas() first.`);
      return;
    }
    (this._syncCanvasSize(), this._setupTarget(this._canvas.width, this._canvas.height));
    let e = !1;
    if (typeof t == `string`) {
      if (((e = this._dotLottieCore.load_animation(t)), !e && !we(t))) {
        (this._discardPlayerEvents(),
          this._dispatchError(
            `Invalid Lottie JSON string: The provided string does not conform to the Lottie JSON format.`,
          ));
        return;
      }
    } else if (t instanceof ArrayBuffer) {
      if (!fe(t)) {
        this._dispatchError(
          `Invalid dotLottie ArrayBuffer: The provided ArrayBuffer does not conform to the dotLottie format.`,
        );
        return;
      }
      e = this._dotLottieCore.load_dotlottie_data(new Uint8Array(t));
    } else if (typeof t == `object`) {
      if (!we(t)) {
        this._dispatchError(
          `Invalid Lottie JSON object: The provided object does not conform to the Lottie JSON format.`,
        );
        return;
      }
      e = this._dotLottieCore.load_animation(JSON.stringify(t));
    } else {
      this._dispatchError(`Unsupported data type for animation data. Expected:
          - string (Lottie JSON),
          - ArrayBuffer (dotLottie),
          - object (Lottie JSON).
          Received: ${typeof t}`);
      return;
    }
    if (e) {
      if (
        (this._renderConfig.quality !== void 0 &&
          this._dotLottieCore.set_quality(this._renderConfig.quality),
        this._drainPlayerEvents({ skipFrame: !!this._marker || !!this._segment }),
        this._marker && this._dotLottieCore.set_marker(this._marker),
        this._segment)
      ) {
        this._dotLottieCore.set_segment(this._segment[0], this._segment[1]);
        let n = be(this._dotLottieCore.mode()),
          r = n === `reverse` || n === `reverse-bounce` ? this._segment[1] : this._segment[0];
        this._dotLottieCore.set_frame(r);
      }
      (setTimeout(() => {
        this._eventManager.dispatch({ type: `frame`, currentFrame: this.currentFrame });
      }, 0),
        this._dotLottieCore.render(),
        this._drainPlayerEvents(),
        this._draw(),
        this._stateMachineId
          ? this.stateMachineLoad(this._stateMachineId) &&
            this.stateMachineStart() &&
            this._startAnimationLoop()
          : this._dotLottieCore.status() === E.Playing && this._startAnimationLoop(),
        I &&
          this._canvas instanceof HTMLCanvasElement &&
          (this._renderConfig.freezeOnOffscreen &&
            (D.observe(this._canvas, this), at(this._canvas) || this.freeze()),
          this._renderConfig.autoResize && z.observe(this._canvas, this)));
    } else this._drainPlayerEvents();
  }
  _loadFromSrc(t, e) {
    (e ?? this._fetchData(t))
      .then((n) => this._loadFromData(n))
      .catch((n) => this._dispatchError(`Failed to load animation data from URL: ${t}. ${n}`));
  }
  get buffer() {
    return this._dotLottieCore ? this._dotLottieCore.get_pixel_buffer() : null;
  }
  get activeAnimationId() {
    return this._dotLottieCore?.animation_id() ?? void 0;
  }
  get activeThemeId() {
    return this._dotLottieCore?.theme_id() ?? void 0;
  }
  get layout() {
    if (this._dotLottieCore)
      return {
        align: [this._dotLottieCore.layout_align_x(), this._dotLottieCore.layout_align_y()],
        fit: Ye(this._dotLottieCore.layout_fit()),
      };
  }
  get marker() {
    return this._dotLottieCore?.current_marker() ?? ``;
  }
  get manifest() {
    try {
      let t = this._dotLottieCore?.manifest_string();
      if (this._dotLottieCore === null || !t) return null;
      let e = JSON.parse(t);
      return Object.keys(e).length === 0 ? null : e;
    } catch {
      return null;
    }
  }
  get renderConfig() {
    return this._renderConfig;
  }
  get segment() {
    if (this._dotLottieCore)
      return [this._dotLottieCore.segment_start(), this._dotLottieCore.segment_end()];
  }
  get loop() {
    return this._dotLottieCore?.loop_animation() ?? !1;
  }
  get mode() {
    return this._dotLottieCore ? be(this._dotLottieCore.mode()) : `forward`;
  }
  get isFrozen() {
    return this._isFrozen;
  }
  get isStateMachineRunning() {
    return this._isStateMachineRunning;
  }
  get backgroundColor() {
    return this._backgroundColor ?? ``;
  }
  get autoplay() {
    return this._dotLottieCore?.autoplay() ?? !1;
  }
  get useFrameInterpolation() {
    return this._dotLottieCore?.use_frame_interpolation() ?? !1;
  }
  get speed() {
    return this._dotLottieCore?.speed() ?? 0;
  }
  get isReady() {
    return this._dotLottieCore !== null;
  }
  get isLoaded() {
    return (this._dotLottieCore?.status() ?? E.Idle) !== E.Idle;
  }
  get isPlaying() {
    return this._dotLottieCore?.status() === E.Playing;
  }
  get isPaused() {
    return this._dotLottieCore?.status() === E.Paused;
  }
  get isStopped() {
    return this._dotLottieCore?.status() === E.Stopped;
  }
  get currentFrame() {
    return this._dotLottieCore ? Math.round(this._dotLottieCore.current_frame() * 100) / 100 : 0;
  }
  get loopCount() {
    return this._dotLottieCore?.current_loop_count() ?? 0;
  }
  get totalFrames() {
    return this._dotLottieCore?.total_frames() ?? 0;
  }
  get duration() {
    return (this._dotLottieCore?.duration() ?? 0) / 1e3;
  }
  get canvas() {
    return this._canvas;
  }
  load(t) {
    this._dotLottieCore !== null &&
      (this._stopAnimationLoop(),
      this._cleanupCanvas(),
      (this._isFrozen = !1),
      this._dotLottieCore.set_autoplay(t.autoplay ?? !1),
      this._dotLottieCore.set_loop(t.loop ?? !1),
      this._dotLottieCore.set_loop_count(t.loopCount ?? 0),
      this._dotLottieCore.set_mode(bt(t.mode ?? `forward`)),
      this._dotLottieCore.set_speed(t.speed ?? 1),
      this._dotLottieCore.set_use_frame_interpolation(t.useFrameInterpolation ?? !0),
      t.segment && t.segment.length === 2
        ? ((this._segment = [t.segment[0], t.segment[1]]),
          this._dotLottieCore.set_segment(this._segment[0], this._segment[1]))
        : ((this._segment = null), this._dotLottieCore.clear_segment()),
      (this._marker = t.marker ?? ``),
      this._marker
        ? this._dotLottieCore.set_marker(this._marker)
        : this._dotLottieCore.clear_marker(),
      this._dotLottieCore.set_layout(
        t.layout?.fit ?? `contain`,
        t.layout?.align?.[0] ?? 0.5,
        t.layout?.align?.[1] ?? 0.5,
      ),
      this._applyAssetResolver(t.assetResolver ?? null),
      t.data
        ? this._canvas
          ? this._loadFromData(t.data)
          : (this._pendingLoad = { data: t.data })
        : t.src && (this._canvas ? this._loadFromSrc(t.src) : (this._pendingLoad = { src: t.src })),
      t.backgroundColor && this.setBackgroundColor(t.backgroundColor));
  }
  _draw() {
    if (
      this._dotLottieCore === null ||
      this._canvas === null ||
      (!this._context &&
        `getContext` in this._canvas &&
        typeof this._canvas.getContext == `function` &&
        (!I ||
          (typeof HTMLCanvasElement < `u` && this._canvas instanceof HTMLCanvasElement) ||
          (typeof OffscreenCanvas < `u` && this._canvas instanceof OffscreenCanvas)) &&
        (this._context = this._canvas.getContext(`2d`)),
      !this._context)
    )
      return;
    let t = this._dotLottieCore.get_pixel_buffer(),
      e = this._canvas.width,
      n = this._canvas.height,
      r = e * n * 4;
    if (t.byteLength !== r) {
      (this._lastExpectedBufferSize === r
        ? (this._bufferMismatchCount += 1)
        : ((this._bufferMismatchCount = 1), (this._lastExpectedBufferSize = r)),
        this._bufferMismatchCount === 10 &&
          console.warn(
            `[dotlottie-web] Persistent buffer size mismatch detected. Expected ${r} bytes for canvas ${e}x${n}, but got ${t.byteLength} bytes. This may indicate a WASM memory allocation issue or invalid canvas dimensions.`,
          ));
      return;
    }
    ((this._bufferMismatchCount = 0), (this._lastExpectedBufferSize = r));
    let s = this._cachedImageData;
    if (!(
      s !== null &&
      s.width === e &&
      s.height === n &&
      s.data.byteLength === r &&
      this._cachedImageDataBuffer === t.buffer &&
      this._cachedImageDataByteOffset === t.byteOffset
    )) {
      if (typeof ImageData > `u`) this._cachedImageData = this._context.createImageData(e, n);
      else {
        let a = new Uint8ClampedArray(t.buffer, t.byteOffset, t.byteLength);
        this._cachedImageData = new ImageData(a, e, n);
      }
      ((this._cachedImageDataBuffer = t.buffer), (this._cachedImageDataByteOffset = t.byteOffset));
    }
    if (typeof ImageData > `u`) {
      let a = new Uint8ClampedArray(t.buffer, t.byteOffset, t.byteLength);
      this._cachedImageData.data.set(a);
    }
    this._context.putImageData(this._cachedImageData, 0, 0);
  }
  _cleanupCanvas() {
    this._canvas &&
      I &&
      this._canvas instanceof HTMLCanvasElement &&
      (D.unobserve(this._canvas), z.unobserve(this._canvas), this._cleanupStateMachineListeners());
  }
  _initializeCanvas() {
    (this._setupRendererOnCanvas(),
      this._canvas &&
        I &&
        this._canvas instanceof HTMLCanvasElement &&
        this.isLoaded &&
        (this._renderConfig.freezeOnOffscreen &&
          (D.observe(this._canvas, this), at(this._canvas) || this.freeze()),
        this._renderConfig.autoResize && z.observe(this._canvas, this),
        this._isStateMachineRunning && this._setupStateMachineListeners()),
      this._canvas &&
        this._dotLottieCore &&
        this.isLoaded &&
        this._setupTarget(this._canvas.width, this._canvas.height) &&
        (this._dotLottieCore.render(), this._draw()));
  }
  _setupRendererOnCanvas() {
    this._context = null;
  }
  _stopAnimationLoop() {
    (this._animationFrameId !== null &&
      (this._frameManager.cancelAnimationFrame(this._animationFrameId),
      (this._animationFrameId = null)),
      (this._lastFrameTime = null));
  }
  _startAnimationLoop() {
    this._animationFrameId === null &&
      this._dotLottieCore &&
      !this._isFrozen &&
      (this._dotLottieCore.status() === E.Playing || this._isStateMachineRunning) &&
      (this._animationFrameId = this._frameManager.requestAnimationFrame(this._boundAnimationLoop));
  }
  _animationLoop(t) {
    if (this._dotLottieCore === null) {
      this._stopAnimationLoop();
      return;
    }
    if (this._dotLottieCore.status() !== E.Playing && !this._isStateMachineRunning) {
      this._stopAnimationLoop();
      return;
    }
    try {
      let e = this._lastFrameTime === null ? 0 : t - this._lastFrameTime;
      this._lastFrameTime = t;
      let n = this._isStateMachineRunning
        ? this._dotLottieCore.sm_tick(e)
        : this._dotLottieCore.tick(e);
      (this._isStateMachineRunning ? this._drainSmEvents() : this._drainPlayerEvents(),
        n && this._draw(),
        (this._animationFrameId = this._frameManager.requestAnimationFrame(
          this._boundAnimationLoop,
        )));
    } catch (e) {
      (console.error(`Error in animation frame:`, e),
        this._eventManager.dispatch({ type: `renderError`, error: e }),
        e instanceof WebAssembly.RuntimeError && this.destroy());
    }
  }
  play() {
    if (this._dotLottieCore === null || !this.isLoaded) return;
    this._stopAnimationLoop();
    let t = this._dotLottieCore.play();
    (this._drainPlayerEvents(),
      (t || this._dotLottieCore.status() === E.Playing) &&
        ((this._isFrozen = !1), this._startAnimationLoop()),
      this._canvas &&
        I &&
        this._canvas instanceof HTMLCanvasElement &&
        this._renderConfig.freezeOnOffscreen &&
        !at(this._canvas) &&
        this.freeze());
  }
  pause() {
    this._dotLottieCore !== null &&
      (this._dotLottieCore.pause(), this._drainPlayerEvents(), this._stopAnimationLoop());
  }
  stop() {
    if (this._dotLottieCore === null) return;
    let t = this._dotLottieCore.stop();
    (this._drainPlayerEvents(),
      this._stopAnimationLoop(),
      t &&
        (this._eventManager.dispatch({ type: `frame`, currentFrame: this.currentFrame }),
        this._dotLottieCore.render(),
        this._draw()));
  }
  setFrame(t) {
    if (this._dotLottieCore !== null && this._dotLottieCore.set_frame(t)) {
      let e = this._dotLottieCore.render();
      (this._drainPlayerEvents(), e && this._draw());
    }
  }
  setSpeed(t) {
    this._dotLottieCore !== null && this._dotLottieCore.set_speed(t);
  }
  setBackgroundColor(t) {
    if (this._dotLottieCore !== null) {
      if (I && this._canvas instanceof HTMLCanvasElement) this._canvas.style.backgroundColor = t;
      else {
        let [e, n, r, s] = Ve(t);
        this._dotLottieCore.set_background(e, n, r, s);
      }
      this._backgroundColor = t;
    }
  }
  setLoop(t) {
    this._dotLottieCore !== null && this._dotLottieCore.set_loop(t);
  }
  setLoopCount(t) {
    this._dotLottieCore !== null && this._dotLottieCore.set_loop_count(t);
  }
  setUseFrameInterpolation(t) {
    this._dotLottieCore !== null && this._dotLottieCore.set_use_frame_interpolation(t);
  }
  _applyAssetResolver(t) {
    if (this._dotLottieCore !== null) {
      if (t === null) {
        this._dotLottieCore.set_asset_resolver(null);
        return;
      }
      this._dotLottieCore.set_asset_resolver((e) => {
        try {
          return t(e) ?? null;
        } catch (n) {
          return (console.error(`[dotlottie-web] assetResolver threw for "${e}":`, n), null);
        }
      });
    }
  }
  addEventListener(t, e) {
    this._eventManager.addEventListener(t, e);
  }
  removeEventListener(t, e) {
    this._eventManager.removeEventListener(t, e);
  }
  destroy() {
    (this._stopAnimationLoop(),
      (this._isStateMachineRunning = !1),
      this._cleanupCanvas(),
      this._srcFetchAbort?.abort(),
      (this._srcFetchAbort = null),
      (this._pendingLoad = null));
    let t = this._dotLottieCore;
    if (((this._dotLottieCore = null), (this._context = null), t))
      try {
        t.free();
      } catch (e) {
        console.warn(`[dotlottie-web] Error freeing wasm core during destroy:`, e);
      }
    (this._eventManager.dispatch({ type: `destroy` }),
      this._eventManager.removeAllEventListeners(),
      this._cleanupStateMachineListeners());
  }
  freeze() {
    this._animationFrameId !== null &&
      (this._stopAnimationLoop(),
      (this._isFrozen = !0),
      this._eventManager.dispatch({ type: `freeze` }));
  }
  unfreeze() {
    this._animationFrameId === null &&
      ((this._isFrozen = !1),
      this._eventManager.dispatch({ type: `unfreeze` }),
      this._startAnimationLoop());
  }
  _syncCanvasSize() {
    if (!(I && this._canvas instanceof HTMLCanvasElement)) return;
    let t = this._renderConfig.devicePixelRatio || window.devicePixelRatio || 1,
      { height: e, width: n } = this._canvas.getBoundingClientRect();
    e !== 0 && n !== 0 && ((this._canvas.width = n * t), (this._canvas.height = e * t));
  }
  resize() {
    !this._dotLottieCore ||
      !this.isLoaded ||
      !this._canvas ||
      (this._syncCanvasSize(),
      this._setupTarget(this._canvas.width, this._canvas.height) &&
        (this._dotLottieCore.render(), this._draw()));
  }
  setCanvas(t) {
    if (
      !(!t || this._canvas === t) &&
      (this._canvas && this._cleanupCanvas(),
      (this._canvas = t),
      this._initializeCanvas(),
      this._pendingLoad)
    ) {
      let e = this._pendingLoad;
      ((this._pendingLoad = null),
        e.data ? this._loadFromData(e.data) : e.src && this._loadFromSrc(e.src, e.dataPromise));
    }
  }
  setTransform(t) {
    if (!this._dotLottieCore) return !1;
    let e = this._dotLottieCore.set_transform(new Float32Array(t));
    return (e && this._dotLottieCore.render() && this._draw(), e);
  }
  getTransform() {
    if (!this._dotLottieCore) return;
    let t = this._dotLottieCore.get_transform();
    return Array.from(t);
  }
  setSegment(t, e) {
    this._dotLottieCore !== null &&
      ((this._segment = [t, e]), this._dotLottieCore.set_segment(t, e));
  }
  resetSegment() {
    this._dotLottieCore !== null && ((this._segment = null), this._dotLottieCore.clear_segment());
  }
  setMode(t) {
    this._dotLottieCore !== null && this._dotLottieCore.set_mode(bt(t));
  }
  setRenderConfig(t) {
    let a = t,
      { devicePixelRatio: e, freezeOnOffscreen: n$1, quality: r } = a,
      s = n(a, [`devicePixelRatio`, `freezeOnOffscreen`, `quality`]);
    ((this._renderConfig = l$1(
      m$1(l$1(l$1({}, this._renderConfig), s), {
        devicePixelRatio: e || ve(),
        freezeOnOffscreen: n$1 ?? !0,
      }),
      r !== void 0 && { quality: r },
    )),
      r !== void 0 && this._dotLottieCore && this._dotLottieCore.set_quality(r),
      I &&
        this._canvas instanceof HTMLCanvasElement &&
        (this._renderConfig.autoResize ? z.observe(this._canvas, this) : z.unobserve(this._canvas),
        this._renderConfig.freezeOnOffscreen
          ? (D.observe(this._canvas, this), at(this._canvas) || this.freeze())
          : (D.unobserve(this._canvas), this._isFrozen && this.unfreeze())));
  }
  loadAnimation(t) {
    this._dotLottieCore === null ||
      this._dotLottieCore.animation_id() === t ||
      !this._canvas ||
      (this._syncCanvasSize(),
      this._setupTarget(this._canvas.width, this._canvas.height),
      this._dotLottieCore.load_animation_from_id(t)
        ? (this._renderConfig.quality !== void 0 &&
            this._dotLottieCore.set_quality(this._renderConfig.quality),
          this._drainPlayerEvents(),
          this._dotLottieCore.render(),
          this._draw())
        : this._dispatchError(`Failed to load animation with id: ${t}`));
  }
  setMarker(t) {
    this._dotLottieCore !== null &&
      (this.markers().some((e) => e.name === t)
        ? ((this._marker = t), this._dotLottieCore.set_marker(t))
        : ((this._marker = ``),
          (this._segment = null),
          this._dotLottieCore.clear_marker(),
          this._dotLottieCore.clear_segment()));
  }
  markers() {
    let t = this._dotLottieCore?.markers();
    return t && Array.isArray(t) ? t : [];
  }
  setTheme(t) {
    if (this._dotLottieCore === null) return !1;
    let e = this._dotLottieCore.set_theme(t);
    return (e && (this._dotLottieCore.render(), this._draw()), e);
  }
  resetTheme() {
    if (this._dotLottieCore === null) return !1;
    let t = this._dotLottieCore.reset_theme();
    return (t && (this._dotLottieCore.render(), this._draw()), t);
  }
  setThemeData(t) {
    if (this._dotLottieCore === null) return !1;
    let e = typeof t == `string` ? t : JSON.stringify(t),
      n = this._dotLottieCore.set_theme_data(e);
    return (n && (this._dotLottieCore.render(), this._draw()), n);
  }
  setSlots(t) {
    this._dotLottieCore !== null &&
      this._dotLottieCore.set_slots_str(JSON.stringify(t)) &&
      (this._dotLottieCore.render(), this._draw());
  }
  _isKeyframeArray(t) {
    return (
      Array.isArray(t) &&
      t.length > 0 &&
      typeof t[0] == `object` &&
      t[0] !== null &&
      `t` in t[0] &&
      `s` in t[0]
    );
  }
  getSlotIds() {
    if (!this._dotLottieCore) return [];
    let t = this._dotLottieCore.get_slot_ids();
    return Array.isArray(t) ? t : [];
  }
  getSlotType(t) {
    if (!this._dotLottieCore) return;
    let e = this._dotLottieCore.get_slot_type(t);
    if (e) return e;
  }
  getSlot(t) {
    if (!this._dotLottieCore) return;
    let e = this._dotLottieCore.get_slot_str(t);
    if (e)
      try {
        return JSON.parse(e);
      } catch {
        return;
      }
  }
  getSlots() {
    if (!this._dotLottieCore) return {};
    try {
      return JSON.parse(this._dotLottieCore.get_slots_str());
    } catch {
      return {};
    }
  }
  setColorSlot(t, e) {
    if (this._dotLottieCore === null) return !1;
    let n = this._isKeyframeArray(e),
      r = JSON.stringify({ a: +!!n, k: e }),
      s = this._dotLottieCore.set_slot_str(t, r);
    return (this._dotLottieCore.render(), this._draw(), s);
  }
  setScalarSlot(t, e) {
    if (this._dotLottieCore === null) return !1;
    let n = JSON.stringify({ a: typeof e == `number` ? 0 : 1, k: e }),
      r = this._dotLottieCore.set_slot_str(t, n);
    return (this._dotLottieCore.render(), this._draw(), r);
  }
  setVectorSlot(t, e) {
    if (this._dotLottieCore === null) return !1;
    let n = this._isKeyframeArray(e),
      r = JSON.stringify({ a: +!!n, k: e }),
      s = this._dotLottieCore.set_slot_str(t, r);
    return (this._dotLottieCore.render(), this._draw(), s);
  }
  setGradientSlot(t, e, n) {
    if (this._dotLottieCore === null) return !1;
    let r = this._isKeyframeArray(e),
      s = JSON.stringify({ k: { a: +!!r, k: e }, p: n }),
      a = this._dotLottieCore.set_slot_str(t, s);
    return (this._dotLottieCore.render(), this._draw(), a);
  }
  setTextSlot(t, e) {
    if (this._dotLottieCore === null) return !1;
    let n = this._dotLottieCore.get_slot_str(t),
      r = e;
    if (n) {
      let _ = JSON.parse(n);
      if (_ && `k` in _ && Array.isArray(_.k)) {
        let u = _.k[0];
        `s` in u && typeof u.s == `object` && (r = l$1(l$1({}, u.s), e));
      }
    }
    let s = JSON.stringify({ a: 0, k: [{ t: 0, s: r }] }),
      a = this._dotLottieCore.set_slot_str(t, s);
    return (this._dotLottieCore.render(), this._draw(), a);
  }
  async setImageSlot(t, e) {
    if (this._dotLottieCore === null) return !1;
    let n = await Xe(e);
    if (this._dotLottieCore === null) return !1;
    let r = this._dotLottieCore.set_image_slot(t, n);
    return (this._dotLottieCore.render(), this._draw(), r);
  }
  resetSlot(t) {
    if (this._dotLottieCore === null) return !1;
    let e = this._dotLottieCore.reset_slot(t);
    return (this._dotLottieCore.render(), this._draw(), e);
  }
  clearSlot(t) {
    if (this._dotLottieCore === null) return !1;
    let e = this._dotLottieCore.clear_slot(t);
    return (this._dotLottieCore.render(), this._draw(), e);
  }
  resetSlots() {
    if (this._dotLottieCore === null) return !1;
    let t = this._dotLottieCore.reset_slots();
    return (this._dotLottieCore.render(), this._draw(), t);
  }
  clearSlots() {
    if (this._dotLottieCore === null) return !1;
    let t = this._dotLottieCore.clear_slots();
    return (this._dotLottieCore.render(), this._draw(), t);
  }
  setLayout(t) {
    this._dotLottieCore !== null &&
      this._dotLottieCore.set_layout(t.fit ?? `contain`, t.align?.[0] ?? 0.5, t.align?.[1] ?? 0.5);
  }
  setViewport(t, e, n, r) {
    return this._dotLottieCore === null ? !1 : this._dotLottieCore.set_viewport(t, e, n, r);
  }
  static setWasmUrl(t) {
    ot().setWasmUrl(t);
  }
  static preload() {
    return ot().load();
  }
  static async registerFont(t, e) {
    try {
      await ot().load();
      let n;
      if (typeof e == `string`) {
        let s = await fetch(e);
        if (!s.ok)
          return (console.error(`Failed to fetch font from URL: ${e}. Status: ${s.status}`), !1);
        n = new Uint8Array(await s.arrayBuffer());
      } else n = e instanceof Uint8Array ? e : new Uint8Array(e);
      let r = De(t, n);
      return (r || console.error(`Failed to register font "${t}". Font data may be invalid.`), r);
    } catch (n) {
      return (console.error(`Error registering font "${t}":`, n), !1);
    }
  }
  animationSize() {
    let t = this._dotLottieCore?.animation_size();
    return { width: t?.[0] ?? 0, height: t?.[1] ?? 0 };
  }
  stateMachineLoad(t) {
    return this._dotLottieCore ? this._dotLottieCore.state_machine_load_from_id(t) : !1;
  }
  stateMachineLoadData(t) {
    return this._dotLottieCore ? this._dotLottieCore.state_machine_load(t) : !1;
  }
  stateMachineSetConfig(t) {
    this._stateMachineConfig = t;
  }
  stateMachineStart() {
    if (this._dotLottieCore === null) return !1;
    let t = this._dotLottieCore.sm_start(
      this._stateMachineConfig?.openUrlPolicy?.requireUserInteraction ?? !0,
      this._stateMachineConfig?.openUrlPolicy?.whitelist ?? [],
    );
    return (
      this._drainSmEvents(),
      t &&
        ((this._isStateMachineRunning = !0),
        this._setupStateMachineListeners(),
        this._startAnimationLoop()),
      t
    );
  }
  stateMachineStop() {
    if (!this._dotLottieCore) return !1;
    let t = this._dotLottieCore.sm_stop();
    return (
      this._drainSmEvents(),
      t &&
        ((this._isStateMachineRunning = !1),
        this._cleanupStateMachineListeners(),
        this._dotLottieCore.status() !== E.Playing && this._stopAnimationLoop()),
      t
    );
  }
  stateMachineGetStatus() {
    return this._dotLottieCore?.sm_status() ?? ``;
  }
  stateMachineGetCurrentState() {
    return this._dotLottieCore?.sm_current_state() ?? ``;
  }
  stateMachineGetActiveId() {
    return this._dotLottieCore?.state_machine_id() ?? ``;
  }
  stateMachineOverrideState(t, e = !1) {
    return this._dotLottieCore?.sm_override_current_state(t, e) ?? !1;
  }
  stateMachineSetSeed(t) {
    return this._dotLottieCore?.sm_set_seed(BigInt(Math.trunc(t))) ?? !1;
  }
  stateMachineGet(t) {
    return this._dotLottieCore?.get_state_machine(t) ?? ``;
  }
  stateMachineGetListeners() {
    if (!this._dotLottieCore) return [];
    let t = this._dotLottieCore.sm_framework_setup();
    return Array.isArray(t) ? t : [];
  }
  stateMachineSetBooleanInput(t, e) {
    return this._dotLottieCore?.sm_set_boolean_input(t, e) ?? !1;
  }
  stateMachineSetNumericInput(t, e) {
    return this._dotLottieCore?.sm_set_numeric_input(t, e) ?? !1;
  }
  stateMachineSetStringInput(t, e) {
    return this._dotLottieCore?.sm_set_string_input(t, e) ?? !1;
  }
  stateMachineGetBooleanInput(t) {
    return this._dotLottieCore?.sm_get_boolean_input(t) ?? void 0;
  }
  stateMachineGetNumericInput(t) {
    return this._dotLottieCore?.sm_get_numeric_input(t) ?? void 0;
  }
  stateMachineGetStringInput(t) {
    return this._dotLottieCore?.sm_get_string_input(t) ?? void 0;
  }
  stateMachineGetInputs() {
    if (!this._dotLottieCore) return [];
    let t = this._dotLottieCore.sm_get_inputs();
    return Array.isArray(t) ? t : [];
  }
  stateMachineFireEvent(t) {
    this._dotLottieCore?.sm_fire(t);
  }
  stateMachinePostClickEvent(t, e) {
    this._dotLottieCore?.sm_post_click(t, e);
  }
  stateMachinePostPointerUpEvent(t, e) {
    this._dotLottieCore?.sm_post_pointer_up(t, e);
  }
  stateMachinePostPointerDownEvent(t, e) {
    this._dotLottieCore?.sm_post_pointer_down(t, e);
  }
  stateMachinePostPointerMoveEvent(t, e) {
    this._dotLottieCore?.sm_post_pointer_move(t, e);
  }
  stateMachinePostPointerEnterEvent(t, e) {
    this._dotLottieCore?.sm_post_pointer_enter(t, e);
  }
  stateMachinePostPointerExitEvent(t, e) {
    this._dotLottieCore?.sm_post_pointer_exit(t, e);
  }
  _onClick(t) {
    let e = H(t);
    e && this.stateMachinePostClickEvent(e.x, e.y);
  }
  _onPointerUp(t) {
    let e = H(t);
    e && this.stateMachinePostPointerUpEvent(e.x, e.y);
  }
  _onPointerDown(t) {
    let e = H(t);
    e && this.stateMachinePostPointerDownEvent(e.x, e.y);
  }
  _onPointerMove(t) {
    let e = H(t);
    e && this.stateMachinePostPointerMoveEvent(e.x, e.y);
  }
  _onPointerEnter(t) {
    let e = H(t);
    e && this.stateMachinePostPointerEnterEvent(e.x, e.y);
  }
  _onPointerLeave(t) {
    let e = H(t);
    e && this.stateMachinePostPointerExitEvent(e.x, e.y);
  }
  _setupStateMachineListeners() {
    if (
      I &&
      this._canvas instanceof HTMLCanvasElement &&
      this._dotLottieCore !== null &&
      this.isLoaded
    ) {
      let t = this.stateMachineGetListeners();
      (this._cleanupStateMachineListeners(),
        t.includes(`Click`) &&
          ((this._boundOnClick = this._onClick.bind(this)),
          this._canvas.addEventListener(`click`, this._boundOnClick)),
        t.includes(`PointerUp`) &&
          ((this._boundOnPointerUp = this._onPointerUp.bind(this)),
          this._canvas.addEventListener(`pointerup`, this._boundOnPointerUp)),
        t.includes(`PointerDown`) &&
          ((this._boundOnPointerDown = this._onPointerDown.bind(this)),
          this._canvas.addEventListener(`pointerdown`, this._boundOnPointerDown)),
        t.includes(`PointerMove`) &&
          ((this._boundOnPointerMove = this._onPointerMove.bind(this)),
          this._canvas.addEventListener(`pointermove`, this._boundOnPointerMove)),
        t.includes(`PointerEnter`) &&
          ((this._boundOnPointerEnter = this._onPointerEnter.bind(this)),
          this._canvas.addEventListener(`pointerenter`, this._boundOnPointerEnter)),
        t.includes(`PointerExit`) &&
          ((this._boundOnPointerLeave = this._onPointerLeave.bind(this)),
          this._canvas.addEventListener(`pointerleave`, this._boundOnPointerLeave)));
    }
  }
  _cleanupStateMachineListeners() {
    I &&
      this._canvas instanceof HTMLCanvasElement &&
      (this._boundOnClick &&
        (this._canvas.removeEventListener(`click`, this._boundOnClick),
        (this._boundOnClick = null)),
      this._boundOnPointerUp &&
        (this._canvas.removeEventListener(`pointerup`, this._boundOnPointerUp),
        (this._boundOnPointerUp = null)),
      this._boundOnPointerDown &&
        (this._canvas.removeEventListener(`pointerdown`, this._boundOnPointerDown),
        (this._boundOnPointerDown = null)),
      this._boundOnPointerMove &&
        (this._canvas.removeEventListener(`pointermove`, this._boundOnPointerMove),
        (this._boundOnPointerMove = null)),
      this._boundOnPointerEnter &&
        (this._canvas.removeEventListener(`pointerenter`, this._boundOnPointerEnter),
        (this._boundOnPointerEnter = null)),
      this._boundOnPointerLeave &&
        (this._canvas.removeEventListener(`pointerleave`, this._boundOnPointerLeave),
        (this._boundOnPointerLeave = null)));
  }
};
var Ze = [`canvas`];
var K = class t {
  canvas = N9.required(`canvas`);
  destroyRef = v(J$1);
  document = v(ie);
  constructor() {
    Ca(() => {
      let e = this.document.defaultView;
      if (!e) return;
      let n = e.matchMedia(`(prefers-reduced-motion: reduce)`).matches;
      Lt.setWasmUrl(`/animations/dotlottie-player.wasm`);
      let r = new Lt({
        canvas: this.canvas().nativeElement,
        src: `/animations/boreas-welcome.json`,
        autoplay: !n,
        loop: !n,
        layout: { fit: `contain`, align: [0.5, 0.5] },
        renderConfig: {
          autoResize: !0,
          devicePixelRatio: Math.min(e.devicePixelRatio, 1.5),
          freezeOnOffscreen: !0,
          quality: 90,
        },
      });
      this.destroyRef.onDestroy(() => r.destroy());
    });
  }
  static ɵfac = function (n) {
    return new (n || t)();
  };
  static ɵcmp = Vi({
    type: t,
    selectors: [[`app-onboarding-hero`]],
    viewQuery: function (n, r) {
      (n & 1 && ZE(r.canvas, Ze, 5), n & 2 && kx());
    },
    decls: 5,
    vars: 0,
    consts: [
      [`canvas`, ``],
      [`aria-hidden`, `true`, 1, `hero`],
      [1, `hero__fallback`],
      [`src`, `/brand-mark.png`, `width`, `96`, `height`, `96`, `alt`, ``],
      [1, `hero__canvas`],
    ],
    template: function (n, r) {
      n & 1 && (tg(0, `div`, 1)(1, `span`, 2), jE(2, `img`, 3), ng(), jE(3, `canvas`, 4, 0), ng());
    },
    styles: [
      `[_nghost-%COMP%]{display:block}.hero[_ngcontent-%COMP%]{position:relative;inline-size:14rem;block-size:14rem;margin-block:-1.25rem -.5rem;pointer-events:none}.hero__canvas[_ngcontent-%COMP%], .hero__fallback[_ngcontent-%COMP%]{position:absolute;inset:0;inline-size:100%;block-size:100%}.hero__canvas[_ngcontent-%COMP%]{display:block}.hero__fallback[_ngcontent-%COMP%]{display:grid;place-items:center;opacity:.9}.hero__fallback[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{inline-size:6rem;block-size:6rem}@media(max-width:30rem){.hero[_ngcontent-%COMP%]{inline-size:12rem;block-size:12rem}}`,
    ],
  });
};
var tn = [`hero`];
var en = [`tagline`];
var nn = [`viewport`];
var rn = [`track`];
var sn = [`connectForm`];
var an = [`address`];
var on = (t, e) => e.title;
function _n(t, e) {
  if (
    (t & 1 &&
      (pl(0, `div`, 15),
      Rl(1, `tui-icon`, 28),
      pl(2, `div`, 29)(3, `div`, 30),
      sR(4),
      eg(),
      pl(5, `div`, 31),
      sR(6),
      eg()()()),
    t & 2)
  ) {
    let n = e.$implicit;
    (vA(), VE(`icon`, n.icon), vA(3), aC(n.title), vA(2), aC(n.detail));
  }
}
function dn(t, e) {
  if ((t & 1 && Rl(0, `span`, 32), t & 2)) {
    let n = e.$implicit;
    sg(`flow__dot--active`, n === Ax().step());
  }
}
function ln(t, e) {
  (t & 1 && (Rl(0, `tui-loader`, 33), sR(1, ` Checking `)), t & 2 && VE(`inheritColor`, !0));
}
function hn(t, e) {
  if ((t & 1 && sR(0), t & 2)) ag(` `, Ax().step() === 2 ? `Connect` : `Continue`, ` `);
}
var cn = /^https?:\/\/\S+$/i;
var Se = [0, 1, 2];
var Q = Se.length - 1;
var Me = 0.6;
var Ie = 0.5;
var un = [
  {
    icon: `@tui.play`,
    title: `Lifecycle control`,
    detail: `Start, stop, restart and delete environments.`,
  },
  {
    icon: `@tui.terminal`,
    title: `Live logs`,
    detail: `Stream, filter and download container output.`,
  },
  {
    icon: `@tui.file-text`,
    title: `Environment as .env`,
    detail: `Paste or import a file, apply with a recreate.`,
  },
];
var Li = [
  {
    path: ``,
    component: class t {
      route = v(ur);
      router = v(hs);
      dialogs = v(Xt);
      connection = v(W);
      hero = N9.required(`hero`);
      tagline = N9.required(`tagline`);
      viewport = N9.required(`viewport`);
      track = N9.required(`track`);
      connectForm = N9(`connectForm`);
      address = N9(`address`);
      steps = Se;
      features = un;
      params = LI(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
      step = oe(() => {
        let e = Number(this.params().get(`step`) ?? 0);
        return Number.isInteger(e) ? Math.min(Math.max(e, 0), Q) : 0;
      });
      model = H$1({ url: this.connection.suggestedUrl() });
      draft = Qt(this.model, (e) => {
        (en$1(e.url, { message: `Server address is required.` }),
          Jr(e.url, cn, { message: `Use a full http:// or https:// address.` }));
      });
      urlError = oe(() => {
        let e = this.draft.url();
        return e.touched() ? (e.errors()[0]?.message ?? null) : null;
      });
      motion = !1;
      ready = !1;
      width = 0;
      shrunk = !1;
      dragging = !1;
      dragMoved = !1;
      pointerId = null;
      startX = 0;
      lastX = 0;
      lastAt = 0;
      velocity = 0;
      quickX = null;
      constructor() {
        let e = v(J$1);
        (Yt(() => {
          let n = this.step();
          this.ready && (this.settle(n), this.setHero(n > 0));
        }),
          Ca(() => {
            let n = bV.matchMedia();
            n.add(
              `(prefers-reduced-motion: no-preference)`,
              () => (
                (this.motion = !0),
                () => {
                  this.motion = !1;
                }
              ),
            );
            let r = new ResizeObserver(() => this.layout());
            (r.observe(this.viewport().nativeElement),
              this.layout(),
              (this.ready = !0),
              e.onDestroy(() => {
                (r.disconnect(), n.revert());
              }));
          }));
      }
      next() {
        if (this.step() === Q) {
          this.connectForm()?.nativeElement.requestSubmit();
          return;
        }
        this.go(this.step() + 1);
      }
      go(e) {
        let n = Math.min(Math.max(e, 0), Q);
        if (n === this.step()) {
          this.settle(n);
          return;
        }
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { step: n === 0 ? null : n },
          queryParamsHandling: `merge`,
        });
      }
      layout() {
        ((this.width = this.viewport().nativeElement.clientWidth),
          bV.set(this.track().nativeElement, { x: -this.step() * this.width }),
          (this.shrunk = this.step() > 0));
        let e = this.hero().nativeElement;
        (bV.set(e, { scale: this.shrunk ? Me : 1, y: this.shrunk ? 0 : this.heroY() }),
          bV.set(this.tagline().nativeElement, { autoAlpha: this.shrunk ? 0 : 1 }));
      }
      heroY() {
        return this.viewport().nativeElement.offsetHeight / 2;
      }
      settle(e) {
        let n = -e * this.width;
        this.motion
          ? bV.to(this.track().nativeElement, {
              x: n,
              duration: 0.55,
              ease: `power3.out`,
              overwrite: `auto`,
            })
          : bV.set(this.track().nativeElement, { x: n });
      }
      setHero(e) {
        if (e === this.shrunk) return;
        this.shrunk = e;
        let n = this.hero().nativeElement,
          r = this.tagline().nativeElement,
          s = { scale: e ? Me : 1, y: e ? 0 : this.heroY() },
          a = { autoAlpha: e ? 0 : 1 };
        this.motion
          ? (bV.to(n, m$1(l$1({}, s), { duration: 0.55, ease: `power3.inOut`, overwrite: `auto` })),
            bV.to(r, m$1(l$1({}, a), { duration: 0.25, ease: `power2.out`, overwrite: `auto` })))
          : (bV.set(n, s), bV.set(r, a));
      }
      onDown(e) {
        if (!e.target.closest(`input, textarea, button, a`)) {
          ((this.pointerId = e.pointerId),
            (this.startX = e.clientX),
            (this.lastX = e.clientX),
            (this.lastAt = e.timeStamp),
            (this.velocity = 0),
            (this.dragging = !0),
            (this.dragMoved = !1));
          try {
            this.viewport().nativeElement.setPointerCapture(e.pointerId);
          } catch {}
          this.quickX = bV.quickTo(this.track().nativeElement, `x`, {
            duration: 0.12,
            ease: `power2`,
          });
        }
      }
      onMove(e) {
        if (!this.dragging || e.pointerId !== this.pointerId) return;
        let n = e.clientX - this.startX;
        if (!this.dragMoved && Math.abs(n) < 8) return;
        this.dragMoved = !0;
        let r = e.timeStamp - this.lastAt;
        r > 0 &&
          ((this.velocity = (e.clientX - this.lastX) / r),
          (this.lastX = e.clientX),
          (this.lastAt = e.timeStamp));
        let s = -this.step() * this.width + n,
          a = -Q * this.width;
        (s > 0 ? (s = Math.min(s / 3, 48)) : s < a && (s = a + Math.max((s - a) / 3, -48)),
          this.motion && this.quickX
            ? this.quickX(s)
            : bV.set(this.track().nativeElement, { x: s }));
      }
      onUp(e) {
        if (
          !this.dragging ||
          e.pointerId !== this.pointerId ||
          ((this.dragging = !1), (this.pointerId = null), !this.dragMoved)
        )
          return;
        let n = e.clientX - this.startX,
          r = this.step();
        (n < -this.width / 4 || (this.velocity < -Ie && n < -24)) && r < Q
          ? this.go(r + 1)
          : (n > this.width / 4 || (this.velocity > Ie && n > 24)) && r > 0
            ? this.go(r - 1)
            : this.settle(r);
      }
      onSubmit(e) {
        (e.preventDefault(), Jt(this.draft, async () => this.connect()));
      }
      connect() {
        this.connection
          .connect(this.model().url.trim())
          .pipe(
            qe$1((e) =>
              e
                ? (this.router.navigate([`/dashboard`]), ye$1)
                : this.dialogs
                    .open(new oe$1(q), {
                      label: `Couldn't reach the server`,
                      size: `s`,
                      dismissible: !0,
                    })
                    .pipe(Os(void 0)),
            ),
          )
          .subscribe(() => this.address()?.nativeElement.focus());
      }
      static ɵfac = function (n) {
        return new (n || t)();
      };
      static ɵcmp = Vi({
        type: t,
        selectors: [[`app-welcome-page`]],
        viewQuery: function (n, r) {
          (n & 1 &&
            ZE(r.hero, tn, 5)(r.tagline, en, 5)(r.viewport, nn, 5)(r.track, rn, 5)(
              r.connectForm,
              sn,
              5,
            )(r.address, an, 5),
            n & 2 && kx(6));
        },
        features: [Na([W])],
        decls: 44,
        vars: 13,
        consts: [
          [`hero`, ``],
          [`tagline`, ``],
          [`viewport`, ``],
          [`track`, ``],
          [`connectForm`, ``],
          [`address`, ``],
          [1, `flow`],
          [1, `flow__hero`],
          [`appReveal`, ``, 1, `flow__hero-content`],
          [1, `flow__brand`],
          [1, `flow__tagline`],
          [1, `flow__viewport`, 3, `pointerdown`, `pointermove`, `pointerup`, `pointercancel`],
          [1, `flow__track`],
          [1, `flow__step`, 3, `inert`],
          [1, `flow__title`],
          [1, `flow__row`, `row-divider`, `relative`],
          [`id`, `connect-form`, `novalidate`, ``, 3, `submit`],
          [1, `flow__hint`],
          [1, `grid`, `gap-1.5`],
          [`for`, `server-url`, 1, `flow__label`],
          [`tuiTextfieldSize`, `m`, 3, `tuiTextfieldCleaner`],
          [
            `tuiInput`,
            ``,
            `id`,
            `server-url`,
            `type`,
            `url`,
            `autocomplete`,
            `url`,
            `spellcheck`,
            `false`,
            `placeholder`,
            `http://127.0.0.1:8080`,
            1,
            `font-mono!`,
            3,
            `formField`,
          ],
          [3, `error`],
          [1, `flow__footer`],
          [`aria-live`, `polite`, 1, `sr-only`],
          [`aria-hidden`, `true`, 1, `flow__dots`],
          [1, `flow__dot`, 3, `flow__dot--active`],
          [`type`, `button`, 1, `glass-button`, `glass-button--pill`, 3, `click`, `disabled`],
          [`aria-hidden`, `true`, 1, `flow__icon`, `icon-sm`, 3, `icon`],
          [1, `min-w-0`],
          [1, `flow__name`],
          [1, `flow__detail`],
          [1, `flow__dot`],
          [`size`, `s`, 3, `inheritColor`],
        ],
        template: function (n, r) {
          (n & 1 &&
            (pl(0, `div`, 6)(1, `div`, 7, 0)(3, `div`, 8),
            Rl(4, `app-onboarding-hero`),
            pl(5, `h1`, 9),
            sR(6, `Boreas`),
            eg()(),
            pl(7, `p`, 10, 1),
            sR(9, ` Spin up isolated Docker environments, each with its own proxy URL. `),
            eg()(),
            pl(10, `div`, 11, 2),
            zo(`pointerdown`, function (a) {
              return r.onDown(a);
            })(`pointermove`, function (a) {
              return r.onMove(a);
            })(`pointerup`, function (a) {
              return r.onUp(a);
            })(`pointercancel`, function (a) {
              return r.onUp(a);
            }),
            pl(12, `div`, 12, 3),
            Rl(14, `section`, 13),
            pl(15, `section`, 13)(16, `h2`, 14),
            sR(17, `Run it all from one place`),
            eg(),
            pl(18, `app-inset-group`),
            vx(19, _n, 7, 3, `div`, 15, on),
            eg()(),
            pl(21, `section`, 13)(22, `form`, 16, 4),
            zo(`submit`, function (a) {
              return r.onSubmit(a);
            }),
            pl(24, `h2`, 14),
            sR(25, `Connect to your server`),
            eg(),
            pl(26, `p`, 17),
            sR(27, `Where is the Boreas API running?`),
            eg(),
            pl(28, `div`, 18)(29, `label`, 19),
            sR(30, `Server address`),
            eg(),
            pl(31, `tui-textfield`, 20),
            Rl(32, `input`, 21, 5),
            oN(),
            eg(),
            Rl(34, `tui-error`, 22),
            eg()()()()(),
            pl(35, `div`, 23)(36, `p`, 24),
            sR(37),
            eg(),
            pl(38, `div`, 25),
            vx(39, dn, 1, 2, `span`, 26, mx),
            eg(),
            pl(41, `button`, 27),
            zo(`click`, function () {
              return r.next();
            }),
            hx(42, ln, 2, 1)(43, hn, 1, 1),
            eg()()()),
            n & 2 &&
              (vA(7),
              sg(`flow__tagline--hidden`, r.step() !== 0),
              kr(`aria-hidden`, r.step() === 0 ? null : !0),
              vA(7),
              VE(`inert`, r.step() !== 0),
              vA(),
              VE(`inert`, r.step() !== 1),
              vA(4),
              yx(r.features),
              vA(2),
              VE(`inert`, r.step() !== 2),
              vA(10),
              VE(`tuiTextfieldCleaner`, !1),
              vA(),
              VE(`formField`, r.draft.url),
              aN(),
              vA(2),
              VE(`error`, r.urlError()),
              vA(3),
              cC(`Step `, r.step() + 1, ` of `, r.steps.length),
              vA(2),
              yx(r.steps),
              vA(2),
              VE(`disabled`, r.connection.checking()),
              vA(),
              px(r.step() === 2 && r.connection.checking() ? 42 : 43)));
        },
        dependencies: [tn$1, b, K, v$1, it, EJ, Yn, Nt, Qi],
        styles: [
          `.flow[_ngcontent-%COMP%]{display:flex;min-block-size:100dvh;max-inline-size:24rem;flex-direction:column;margin-inline:auto;padding-block:max(2rem,env(safe-area-inset-top)) calc(1.5rem + env(safe-area-inset-bottom));overflow:hidden}.flow__hero[_ngcontent-%COMP%]{position:relative;z-index:1;transform-origin:50% 0;pointer-events:none;will-change:transform}.flow__hero-content[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center}.flow__brand[_ngcontent-%COMP%]{margin:0;font-size:2.125rem;font-weight:700;letter-spacing:-.025em;color:var(--%NS%tui-text-primary)}.flow__viewport[_ngcontent-%COMP%]{flex:1;min-block-size:0;overflow:hidden;touch-action:pan-y}.flow__track[_ngcontent-%COMP%]{display:flex;inline-size:100%;block-size:100%;will-change:transform}.flow__step[_ngcontent-%COMP%]{display:flex;flex:0 0 100%;flex-direction:column;justify-content:center;gap:.75rem;padding-inline:1.5rem}.flow__tagline[_ngcontent-%COMP%]{position:absolute;inset-block-start:calc(100% + .75rem);inset-inline:1.5rem;margin:0;max-inline-size:16rem;margin-inline:auto;font-size:1.0625rem;line-height:1.55;text-align:center;color:var(--%NS%tui-text-secondary)}.flow__tagline--hidden[_ngcontent-%COMP%]{visibility:hidden;opacity:0}.flow__title[_ngcontent-%COMP%]{margin:0;font-size:1.375rem;font-weight:700;line-height:1.25;letter-spacing:-.02em;color:var(--%NS%tui-text-primary)}.flow__hint[_ngcontent-%COMP%]{margin:-.375rem 0 0;font-size:.9375rem;color:var(--%NS%tui-text-secondary)}.flow__label[_ngcontent-%COMP%]{font-size:.8125rem;font-weight:500;color:var(--%NS%tui-text-tertiary);padding-inline-start:.25rem}#connect-form[_ngcontent-%COMP%]{display:grid;gap:1rem}.flow__row[_ngcontent-%COMP%]{display:flex;align-items:flex-start;gap:.75rem;padding:.75rem .875rem}.flow__icon[_ngcontent-%COMP%]{margin-block-start:.125rem;color:var(--%NS%tui-text-action)}.flow__name[_ngcontent-%COMP%]{font-size:1.0625rem;font-weight:600;color:var(--%NS%tui-text-primary)}.flow__detail[_ngcontent-%COMP%]{font-size:.9375rem;line-height:1.5;color:var(--%NS%tui-text-tertiary)}.flow__footer[_ngcontent-%COMP%]{display:grid;gap:.5rem;padding-inline:1.5rem}.flow__dots[_ngcontent-%COMP%]{display:flex;justify-content:center;gap:.375rem;padding-block:.5rem}.flow__dot[_ngcontent-%COMP%]{inline-size:.3125rem;block-size:.3125rem;border-radius:999px;background:var(--%NS%tui-background-neutral-2);transition:inline-size var(--%NS%tui-duration),background-color var(--%NS%tui-duration)}.flow__dot--active[_ngcontent-%COMP%]{inline-size:.875rem;background:var(--%NS%tui-text-action)}.glass-button[disabled][_ngcontent-%COMP%]{opacity:.6;pointer-events:none}`,
        ],
      });
    },
    title: `Welcome | Boreas`,
  },
  { path: `**`, redirectTo: `` },
];
export { Li as onboardingRoutes };
