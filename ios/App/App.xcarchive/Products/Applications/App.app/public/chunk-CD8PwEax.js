var i = Object.defineProperty;
var j$1 = Object.defineProperties;
var k$1 = Object.getOwnPropertyDescriptors;
var e = Object.getOwnPropertySymbols;
var g = Object.prototype.hasOwnProperty;
var h = Object.prototype.propertyIsEnumerable;
var f = (a, b, c) =>
  b in a ? i(a, b, { enumerable: !0, configurable: !0, writable: !0, value: c }) : (a[b] = c);
var l = (a, b) => {
  for (var c in (b ||= {})) g.call(b, c) && f(a, c, b[c]);
  if (e) for (var c of e(b)) h.call(b, c) && f(a, c, b[c]);
  return a;
};
var m = (a, b) => j$1(a, k$1(b));
var n = (a, b) => {
  var c = {};
  for (var d in a) g.call(a, d) && b.indexOf(d) < 0 && (c[d] = a[d]);
  if (a != null && e) for (var d of e(a)) b.indexOf(d) < 0 && h.call(a, d) && (c[d] = a[d]);
  return c;
};
function V(t) {
  return typeof t == `function`;
}
function xS(t) {
  return V(t?.lift);
}
function x(t) {
  return (e) => {
    if (xS(e))
      return e.lift(function (n) {
        try {
          return t(n, this);
        } catch (r) {
          this.error(r);
        }
      });
    throw new TypeError(`Unable to lift unknown Observable type`);
  };
}
function vr(t) {
  let n = t((r) => {
    (Error.call(r), (r.stack = new Error().stack));
  });
  return ((n.prototype = Object.create(Error.prototype)), (n.prototype.constructor = n), n);
}
var kc = vr(
  (t) =>
    function (n) {
      (t(this),
        (this.message = n
          ? `${n.length} errors occurred during unsubscription:
${n.map((r, i) => `${i + 1}) ${r.toString()}`).join(`
  `)}`
          : ``),
        (this.name = `UnsubscriptionError`),
        (this.errors = n));
    },
);
function Kr(t, e) {
  if (t) {
    let n = t.indexOf(e);
    0 <= n && t.splice(n, 1);
  }
}
var Ne = class t {
  constructor(e) {
    ((this.initialTeardown = e),
      (this.closed = !1),
      (this._parentage = null),
      (this._finalizers = null));
  }
  unsubscribe() {
    let e;
    if (!this.closed) {
      this.closed = !0;
      let { _parentage: n } = this;
      if (n)
        if (((this._parentage = null), Array.isArray(n))) for (let o of n) o.remove(this);
        else n.remove(this);
      let { initialTeardown: r } = this;
      if (V(r))
        try {
          r();
        } catch (o) {
          e = o instanceof kc ? o.errors : [o];
        }
      let { _finalizers: i } = this;
      if (i) {
        this._finalizers = null;
        for (let o of i)
          try {
            vv(o);
          } catch (s) {
            ((e = e ?? []), s instanceof kc ? (e = [...e, ...s.errors]) : e.push(s));
          }
      }
      if (e) throw new kc(e);
    }
  }
  add(e) {
    var n;
    if (e && e !== this)
      if (this.closed) vv(e);
      else {
        if (e instanceof t) {
          if (e.closed || e._hasParent(this)) return;
          e._addParent(this);
        }
        (this._finalizers = (n = this._finalizers) !== null && n !== void 0 ? n : []).push(e);
      }
  }
  _hasParent(e) {
    let { _parentage: n } = this;
    return n === e || (Array.isArray(n) && n.includes(e));
  }
  _addParent(e) {
    let { _parentage: n } = this;
    this._parentage = Array.isArray(n) ? (n.push(e), n) : n ? [n, e] : e;
  }
  _removeParent(e) {
    let { _parentage: n } = this;
    n === e ? (this._parentage = null) : Array.isArray(n) && Kr(n, e);
  }
  remove(e) {
    let { _finalizers: n } = this;
    (n && Kr(n, e), e instanceof t && e._removeParent(this));
  }
};
Ne.EMPTY = (() => {
  let t = new Ne();
  return ((t.closed = !0), t);
})();
var Jd = Ne.EMPTY;
function Pc(t) {
  return t instanceof Ne || (t && `closed` in t && V(t.remove) && V(t.add) && V(t.unsubscribe));
}
function vv(t) {
  V(t) ? t() : t.unsubscribe();
}
var nn = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: !1,
  useDeprecatedNextContext: !1,
};
var so = {
  setTimeout(t, e, ...n) {
    let { delegate: r } = so;
    return r?.setTimeout ? r.setTimeout(t, e, ...n) : setTimeout(t, e, ...n);
  },
  clearTimeout(t) {
    let { delegate: e } = so;
    return (e?.clearTimeout || clearTimeout)(t);
  },
  delegate: void 0,
};
function Fc(t) {
  so.setTimeout(() => {
    let { onUnhandledError: e } = nn;
    if (e) e(t);
    else throw t;
  });
}
function St() {}
var yv = ef(`C`, void 0, void 0);
function _v(t) {
  return ef(`E`, void 0, t);
}
function Dv(t) {
  return ef(`N`, t, void 0);
}
function ef(t, e, n) {
  return { kind: t, value: e, error: n };
}
var Qr = null;
function ao(t) {
  if (nn.useDeprecatedSynchronousErrorHandling) {
    let e = !Qr;
    if ((e && (Qr = { errorThrown: !1, error: null }), t(), e)) {
      let { errorThrown: n, error: r } = Qr;
      if (((Qr = null), n)) throw r;
    }
  } else t();
}
function Ev(t) {
  nn.useDeprecatedSynchronousErrorHandling && Qr && ((Qr.errorThrown = !0), (Qr.error = t));
}
var Xr = class extends Ne {
  constructor(e) {
    (super(),
      (this.isStopped = !1),
      e ? ((this.destination = e), Pc(e) && e.add(this)) : (this.destination = kS));
  }
  static create(e, n, r) {
    return new Vn(e, n, r);
  }
  next(e) {
    this.isStopped ? nf(Dv(e), this) : this._next(e);
  }
  error(e) {
    this.isStopped ? nf(_v(e), this) : ((this.isStopped = !0), this._error(e));
  }
  complete() {
    this.isStopped ? nf(yv, this) : ((this.isStopped = !0), this._complete());
  }
  unsubscribe() {
    this.closed || ((this.isStopped = !0), super.unsubscribe(), (this.destination = null));
  }
  _next(e) {
    this.destination.next(e);
  }
  _error(e) {
    try {
      this.destination.error(e);
    } finally {
      this.unsubscribe();
    }
  }
  _complete() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }
};
var RS = Function.prototype.bind;
function tf(t, e) {
  return RS.call(t, e);
}
var rf = class {
  constructor(e) {
    this.partialObserver = e;
  }
  next(e) {
    let { partialObserver: n } = this;
    if (n.next)
      try {
        n.next(e);
      } catch (r) {
        Lc(r);
      }
  }
  error(e) {
    let { partialObserver: n } = this;
    if (n.error)
      try {
        n.error(e);
      } catch (r) {
        Lc(r);
      }
    else Lc(e);
  }
  complete() {
    let { partialObserver: e } = this;
    if (e.complete)
      try {
        e.complete();
      } catch (n) {
        Lc(n);
      }
  }
};
var Vn = class extends Xr {
  constructor(e, n, r) {
    super();
    let i;
    if (V(e) || !e) i = { next: e ?? void 0, error: n ?? void 0, complete: r ?? void 0 };
    else {
      let o;
      this && nn.useDeprecatedNextContext
        ? ((o = Object.create(e)),
          (o.unsubscribe = () => this.unsubscribe()),
          (i = {
            next: e.next && tf(e.next, o),
            error: e.error && tf(e.error, o),
            complete: e.complete && tf(e.complete, o),
          }))
        : (i = e);
    }
    this.destination = new rf(i);
  }
};
function Lc(t) {
  nn.useDeprecatedSynchronousErrorHandling ? Ev(t) : Fc(t);
}
function OS(t) {
  throw t;
}
function nf(t, e) {
  let { onStoppedNotification: n } = nn;
  n && so.setTimeout(() => n(t, e));
}
var kS = { closed: !0, next: St, error: OS, complete: St };
function A(t, e, n, r, i) {
  return new of(t, e, n, r, i);
}
var of = class extends Xr {
  constructor(e, n, r, i, o, s) {
    (super(e),
      (this.onFinalize = o),
      (this.shouldUnsubscribe = s),
      (this._next = n
        ? function (a) {
            try {
              n(a);
            } catch (c) {
              e.error(c);
            }
          }
        : super._next),
      (this._error = i
        ? function (a) {
            try {
              i(a);
            } catch (c) {
              e.error(c);
            } finally {
              this.unsubscribe();
            }
          }
        : super._error),
      (this._complete = r
        ? function () {
            try {
              r();
            } catch (a) {
              e.error(a);
            } finally {
              this.unsubscribe();
            }
          }
        : super._complete));
  }
  unsubscribe() {
    var e;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      let { closed: n } = this;
      (super.unsubscribe(), !n && ((e = this.onFinalize) === null || e === void 0 || e.call(this)));
    }
  }
};
function Y(t, e) {
  return x((n, r) => {
    let i = 0;
    n.subscribe(
      A(r, (o) => {
        r.next(t.call(e, o, i++));
      }),
    );
  });
}
function et(t, e) {
  return x((n, r) => {
    let i = 0;
    n.subscribe(A(r, (o) => t.call(e, o, i++) && r.next(o)));
  });
}
var co = (typeof Symbol == `function` && Symbol.observable) || `@@observable`;
function tt(t) {
  return t;
}
function Jr(...t) {
  return sf(t);
}
function sf(t) {
  return t.length === 0
    ? tt
    : t.length === 1
      ? t[0]
      : function (n) {
          return t.reduce((r, i) => i(r), n);
        };
}
var k = class t {
  constructor(e) {
    e && (this._subscribe = e);
  }
  lift(e) {
    let n = new t();
    return ((n.source = this), (n.operator = e), n);
  }
  subscribe(e, n, r) {
    let i = FS(e) ? e : new Vn(e, n, r);
    return (
      ao(() => {
        let { operator: o, source: s } = this;
        i.add(o ? o.call(i, s) : s ? this._subscribe(i) : this._trySubscribe(i));
      }),
      i
    );
  }
  _trySubscribe(e) {
    try {
      return this._subscribe(e);
    } catch (n) {
      e.error(n);
    }
  }
  forEach(e, n) {
    return (
      (n = Cv(n)),
      new n((r, i) => {
        let o = new Vn({
          next: (s) => {
            try {
              e(s);
            } catch (a) {
              (i(a), o.unsubscribe());
            }
          },
          error: i,
          complete: r,
        });
        this.subscribe(o);
      })
    );
  }
  _subscribe(e) {
    var n;
    return (n = this.source) === null || n === void 0 ? void 0 : n.subscribe(e);
  }
  [co]() {
    return this;
  }
  pipe(...e) {
    return sf(e)(this);
  }
  toPromise(e) {
    return (
      (e = Cv(e)),
      new e((n, r) => {
        let i;
        this.subscribe(
          (o) => (i = o),
          (o) => r(o),
          () => n(i),
        );
      })
    );
  }
};
k.create = (t) => new k(t);
function Cv(t) {
  var e;
  return (e = t ?? nn.Promise) !== null && e !== void 0 ? e : Promise;
}
function PS(t) {
  return t && V(t.next) && V(t.error) && V(t.complete);
}
function FS(t) {
  return (t && t instanceof Xr) || (PS(t) && Pc(t));
}
var ye = new k((t) => t.complete());
function yt(t) {
  return t <= 0
    ? () => ye
    : x((e, n) => {
        let r = 0;
        e.subscribe(
          A(n, (i) => {
            ++r <= t && (n.next(i), t <= r && n.complete());
          }),
        );
      });
}
function Iv(t, e, n, r) {
  function i(o) {
    return o instanceof n
      ? o
      : new n(function (s) {
          s(o);
        });
  }
  return new (n || (n = Promise))(function (o, s) {
    function a(l) {
      try {
        u(r.next(l));
      } catch (d) {
        s(d);
      }
    }
    function c(l) {
      try {
        u(r.throw(l));
      } catch (d) {
        s(d);
      }
    }
    function u(l) {
      l.done ? o(l.value) : i(l.value).then(a, c);
    }
    u((r = r.apply(t, e || [])).next());
  });
}
function wv(t) {
  var e = typeof Symbol == `function` && Symbol.iterator,
    n = e && t[e],
    r = 0;
  if (n) return n.call(t);
  if (t && typeof t.length == `number`)
    return {
      next: function () {
        return (t && r >= t.length && (t = void 0), { value: t && t[r++], done: !t });
      },
    };
  throw new TypeError(e ? `Object is not iterable.` : `Symbol.iterator is not defined.`);
}
function ei(t) {
  return this instanceof ei ? ((this.v = t), this) : new ei(t);
}
function bv(t, e, n) {
  if (!Symbol.asyncIterator) throw new TypeError(`Symbol.asyncIterator is not defined.`);
  var r = n.apply(t, e || []),
    i,
    o = [];
  return (
    (i = Object.create((typeof AsyncIterator == `function` ? AsyncIterator : Object).prototype)),
    a(`next`),
    a(`throw`),
    a(`return`, s),
    (i[Symbol.asyncIterator] = function () {
      return this;
    }),
    i
  );
  function s(h) {
    return function (g) {
      return Promise.resolve(g).then(h, d);
    };
  }
  function a(h, g) {
    r[h] &&
      ((i[h] = function (p) {
        return new Promise(function (m, y) {
          o.push([h, p, m, y]) > 1 || c(h, p);
        });
      }),
      g && (i[h] = g(i[h])));
  }
  function c(h, g) {
    try {
      u(r[h](g));
    } catch (p) {
      f(o[0][3], p);
    }
  }
  function u(h) {
    h.value instanceof ei ? Promise.resolve(h.value.v).then(l, d) : f(o[0][2], h);
  }
  function l(h) {
    c(`next`, h);
  }
  function d(h) {
    c(`throw`, h);
  }
  function f(h, g) {
    (h(g), o.shift(), o.length && c(o[0][0], o[0][1]));
  }
}
function Sv(t) {
  if (!Symbol.asyncIterator) throw new TypeError(`Symbol.asyncIterator is not defined.`);
  var e = t[Symbol.asyncIterator],
    n;
  return e
    ? e.call(t)
    : ((t = typeof wv == `function` ? wv(t) : t[Symbol.iterator]()),
      (n = {}),
      r(`next`),
      r(`throw`),
      r(`return`),
      (n[Symbol.asyncIterator] = function () {
        return this;
      }),
      n);
  function r(o) {
    n[o] =
      t[o] &&
      function (s) {
        return new Promise(function (a, c) {
          ((s = t[o](s)), i(a, c, s.done, s.value));
        });
      };
  }
  function i(o, s, a, c) {
    Promise.resolve(c).then(function (u) {
      o({ value: u, done: a });
    }, s);
  }
}
var uo = (t) => t && typeof t.length == `number` && typeof t != `function`;
function Vc(t) {
  return V(t?.then);
}
function jc(t) {
  return V(t[co]);
}
function Uc(t) {
  return Symbol.asyncIterator && V(t?.[Symbol.asyncIterator]);
}
function Bc(t) {
  return new TypeError(
    `You provided ${t !== null && typeof t == `object` ? `an invalid object` : `'${t}'`} where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`,
  );
}
function LS() {
  return typeof Symbol != `function` || !Symbol.iterator ? `@@iterator` : Symbol.iterator;
}
var Hc = LS();
function $c(t) {
  return V(t?.[Hc]);
}
function Gc(t) {
  return bv(this, arguments, function* () {
    let n = t.getReader();
    try {
      for (;;) {
        let { value: r, done: i } = yield ei(n.read());
        if (i) return yield ei(void 0);
        yield yield ei(r);
      }
    } finally {
      n.releaseLock();
    }
  });
}
function zc(t) {
  return V(t?.getReader);
}
function B(t) {
  if (t instanceof k) return t;
  if (t != null) {
    if (jc(t)) return VS(t);
    if (uo(t)) return jS(t);
    if (Vc(t)) return US(t);
    if (Uc(t)) return Tv(t);
    if ($c(t)) return BS(t);
    if (zc(t)) return HS(t);
  }
  throw Bc(t);
}
function VS(t) {
  return new k((e) => {
    let n = t[co]();
    if (V(n.subscribe)) return n.subscribe(e);
    throw new TypeError(`Provided object does not correctly implement Symbol.observable`);
  });
}
function jS(t) {
  return new k((e) => {
    for (let n = 0; n < t.length && !e.closed; n++) e.next(t[n]);
    e.complete();
  });
}
function US(t) {
  return new k((e) => {
    t.then(
      (n) => {
        e.closed || (e.next(n), e.complete());
      },
      (n) => e.error(n),
    ).then(null, Fc);
  });
}
function BS(t) {
  return new k((e) => {
    for (let n of t) if ((e.next(n), e.closed)) return;
    e.complete();
  });
}
function Tv(t) {
  return new k((e) => {
    $S(t, e).catch((n) => e.error(n));
  });
}
function HS(t) {
  return Tv(Gc(t));
}
function $S(t, e) {
  var n, r, i, o;
  return Iv(this, void 0, void 0, function* () {
    try {
      for (n = Sv(t); (r = yield n.next()), !r.done;) {
        let s = r.value;
        if ((e.next(s), e.closed)) return;
      }
    } catch (s) {
      i = { error: s };
    } finally {
      try {
        r && !r.done && (o = n.return) && (yield o.call(n));
      } finally {
        if (i) throw i.error;
      }
    }
    e.complete();
  });
}
function qe(t, e) {
  return x((n, r) => {
    let i = null,
      o = 0,
      s = !1,
      a = () => s && !i && r.complete();
    n.subscribe(
      A(
        r,
        (c) => {
          i?.unsubscribe();
          let u = 0,
            l = o++;
          B(t(c, l)).subscribe(
            (i = A(
              r,
              (d) => r.next(e ? e(c, d, l, u++) : d),
              () => {
                ((i = null), a());
              },
            )),
          );
        },
        () => {
          ((s = !0), a());
        },
      ),
    );
  });
}
var Mv = vr(
  (t) =>
    function () {
      (t(this), (this.name = `ObjectUnsubscribedError`), (this.message = `object unsubscribed`));
    },
);
var ue = class extends k {
  constructor() {
    (super(),
      (this.closed = !1),
      (this.currentObservers = null),
      (this.observers = []),
      (this.isStopped = !1),
      (this.hasError = !1),
      (this.thrownError = null));
  }
  lift(e) {
    let n = new Wc(this, this);
    return ((n.operator = e), n);
  }
  _throwIfClosed() {
    if (this.closed) throw new Mv();
  }
  next(e) {
    ao(() => {
      if ((this._throwIfClosed(), !this.isStopped)) {
        this.currentObservers || (this.currentObservers = Array.from(this.observers));
        for (let n of this.currentObservers) n.next(e);
      }
    });
  }
  error(e) {
    ao(() => {
      if ((this._throwIfClosed(), !this.isStopped)) {
        ((this.hasError = this.isStopped = !0), (this.thrownError = e));
        let { observers: n } = this;
        for (; n.length;) n.shift().error(e);
      }
    });
  }
  complete() {
    ao(() => {
      if ((this._throwIfClosed(), !this.isStopped)) {
        this.isStopped = !0;
        let { observers: e } = this;
        for (; e.length;) e.shift().complete();
      }
    });
  }
  unsubscribe() {
    ((this.isStopped = this.closed = !0), (this.observers = this.currentObservers = null));
  }
  get observed() {
    var e;
    return ((e = this.observers) === null || e === void 0 ? void 0 : e.length) > 0;
  }
  _trySubscribe(e) {
    return (this._throwIfClosed(), super._trySubscribe(e));
  }
  _subscribe(e) {
    return (this._throwIfClosed(), this._checkFinalizedStatuses(e), this._innerSubscribe(e));
  }
  _innerSubscribe(e) {
    let { hasError: n, isStopped: r, observers: i } = this;
    return n || r
      ? Jd
      : ((this.currentObservers = null),
        i.push(e),
        new Ne(() => {
          ((this.currentObservers = null), Kr(i, e));
        }));
  }
  _checkFinalizedStatuses(e) {
    let { hasError: n, thrownError: r, isStopped: i } = this;
    n ? e.error(r) : i && e.complete();
  }
  asObservable() {
    let e = new k();
    return ((e.source = this), e);
  }
};
ue.create = (t, e) => new Wc(t, e);
var Wc = class extends ue {
  constructor(e, n) {
    (super(), (this.destination = e), (this.source = n));
  }
  next(e) {
    var n, r;
    (r = (n = this.destination) === null || n === void 0 ? void 0 : n.next) === null ||
      r === void 0 ||
      r.call(n, e);
  }
  error(e) {
    var n, r;
    (r = (n = this.destination) === null || n === void 0 ? void 0 : n.error) === null ||
      r === void 0 ||
      r.call(n, e);
  }
  complete() {
    var e, n;
    (n = (e = this.destination) === null || e === void 0 ? void 0 : e.complete) === null ||
      n === void 0 ||
      n.call(e);
  }
  _subscribe(e) {
    var n, r;
    return (r = (n = this.source) === null || n === void 0 ? void 0 : n.subscribe(e)) !== null &&
      r !== void 0
      ? r
      : Jd;
  }
};
var Ze = class extends ue {
  constructor(e) {
    (super(), (this._value = e));
  }
  get value() {
    return this.getValue();
  }
  _subscribe(e) {
    let n = super._subscribe(e);
    return (!n.closed && e.next(this._value), n);
  }
  getValue() {
    let { hasError: e, thrownError: n, _value: r } = this;
    if (e) throw n;
    return (this._throwIfClosed(), r);
  }
  next(e) {
    super.next((this._value = e));
  }
};
var Ms = {
  now() {
    return (Ms.delegate || Date).now();
  },
  delegate: void 0,
};
var ti = class extends ue {
  constructor(e = Infinity, n = Infinity, r = Ms) {
    (super(),
      (this._bufferSize = e),
      (this._windowTime = n),
      (this._timestampProvider = r),
      (this._buffer = []),
      (this._infiniteTimeWindow = !0),
      (this._infiniteTimeWindow = n === Infinity),
      (this._bufferSize = Math.max(1, e)),
      (this._windowTime = Math.max(1, n)));
  }
  next(e) {
    let {
      isStopped: n,
      _buffer: r,
      _infiniteTimeWindow: i,
      _timestampProvider: o,
      _windowTime: s,
    } = this;
    (n || (r.push(e), !i && r.push(o.now() + s)), this._trimBuffer(), super.next(e));
  }
  _subscribe(e) {
    (this._throwIfClosed(), this._trimBuffer());
    let n = this._innerSubscribe(e),
      { _infiniteTimeWindow: r, _buffer: i } = this,
      o = i.slice();
    for (let s = 0; s < o.length && !e.closed; s += r ? 1 : 2) e.next(o[s]);
    return (this._checkFinalizedStatuses(e), n);
  }
  _trimBuffer() {
    let { _bufferSize: e, _timestampProvider: n, _buffer: r, _infiniteTimeWindow: i } = this,
      o = (i ? 1 : 2) * e;
    if ((e < Infinity && o < r.length && r.splice(0, r.length - o), !i)) {
      let s = n.now(),
        a = 0;
      for (let c = 1; c < r.length && r[c] <= s; c += 2) a = c;
      a && r.splice(0, a + 1);
    }
  }
};
var qc = class extends Ne {
  constructor(e, n) {
    super();
  }
  schedule(e, n = 0) {
    return this;
  }
};
var As = {
  setInterval(t, e, ...n) {
    let { delegate: r } = As;
    return r?.setInterval ? r.setInterval(t, e, ...n) : setInterval(t, e, ...n);
  },
  clearInterval(t) {
    let { delegate: e } = As;
    return (e?.clearInterval || clearInterval)(t);
  },
  delegate: void 0,
};
var lo = class extends qc {
  constructor(e, n) {
    (super(e, n), (this.scheduler = e), (this.work = n), (this.pending = !1));
  }
  schedule(e, n = 0) {
    var r;
    if (this.closed) return this;
    this.state = e;
    let i = this.id,
      o = this.scheduler;
    return (
      i != null && (this.id = this.recycleAsyncId(o, i, n)),
      (this.pending = !0),
      (this.delay = n),
      (this.id = (r = this.id) !== null && r !== void 0 ? r : this.requestAsyncId(o, this.id, n)),
      this
    );
  }
  requestAsyncId(e, n, r = 0) {
    return As.setInterval(e.flush.bind(e, this), r);
  }
  recycleAsyncId(e, n, r = 0) {
    if (r != null && this.delay === r && this.pending === !1) return n;
    n != null && As.clearInterval(n);
  }
  execute(e, n) {
    if (this.closed) return new Error(`executing a cancelled action`);
    this.pending = !1;
    let r = this._execute(e, n);
    if (r) return r;
    this.pending === !1 &&
      this.id != null &&
      (this.id = this.recycleAsyncId(this.scheduler, this.id, null));
  }
  _execute(e, n) {
    let r = !1,
      i;
    try {
      this.work(e);
    } catch (o) {
      ((r = !0), (i = o || new Error(`Scheduled action threw falsy error`)));
    }
    if (r) return (this.unsubscribe(), i);
  }
  unsubscribe() {
    if (!this.closed) {
      let { id: e, scheduler: n } = this,
        { actions: r } = n;
      ((this.work = this.state = this.scheduler = null),
        (this.pending = !1),
        Kr(r, this),
        e != null && (this.id = this.recycleAsyncId(n, e, null)),
        (this.delay = null),
        super.unsubscribe());
    }
  }
};
var af = (() => {
  class t {
    constructor(n, r = t.now) {
      ((this.schedulerActionCtor = n), (this.now = r));
    }
    schedule(n, r = 0, i) {
      return new this.schedulerActionCtor(this, n).schedule(i, r);
    }
  }
  return ((t.now = Ms.now), t);
})();
var fo = class extends af {
  constructor(e, n = af.now) {
    (super(e, n), (this.actions = []), (this._active = !1));
  }
  flush(e) {
    let { actions: n } = this;
    if (this._active) {
      n.push(e);
      return;
    }
    let r;
    this._active = !0;
    do if ((r = e.execute(e.state, e.delay))) break;
    while ((e = n.shift()));
    if (((this._active = !1), r)) {
      for (; (e = n.shift());) e.unsubscribe();
      throw r;
    }
  }
};
var dt = new fo(lo);
var cf = dt;
var Yc = class extends lo {
  constructor(e, n) {
    (super(e, n), (this.scheduler = e), (this.work = n));
  }
  schedule(e, n = 0) {
    return n > 0
      ? super.schedule(e, n)
      : ((this.delay = n), (this.state = e), this.scheduler.flush(this), this);
  }
  execute(e, n) {
    return n > 0 || this.closed ? super.execute(e, n) : this._execute(e, n);
  }
  requestAsyncId(e, n, r = 0) {
    return (r != null && r > 0) || (r == null && this.delay > 0)
      ? super.requestAsyncId(e, n, r)
      : (e.flush(this), 0);
  }
};
var Zc = class extends fo {};
var Ns = new Zc(Yc);
function Kc(t) {
  return t && V(t.schedule);
}
function uf(t) {
  return t[t.length - 1];
}
function ho(t) {
  return V(uf(t)) ? t.pop() : void 0;
}
function gn(t) {
  return Kc(uf(t)) ? t.pop() : void 0;
}
function Av(t, e) {
  return typeof uf(t) == `number` ? t.pop() : e;
}
function nt(t, e, n, r = 0, i = !1) {
  let o = e.schedule(function () {
    (n(), i ? t.add(this.schedule(null, r)) : this.unsubscribe());
  }, r);
  if ((t.add(o), !i)) return o;
}
function xs(t, e = 0) {
  return x((n, r) => {
    n.subscribe(
      A(
        r,
        (i) => nt(r, t, () => r.next(i), e),
        () => nt(r, t, () => r.complete(), e),
        (i) => nt(r, t, () => r.error(i), e),
      ),
    );
  });
}
function Qc(t, e = 0) {
  return x((n, r) => {
    r.add(t.schedule(() => n.subscribe(r), e));
  });
}
function Nv(t, e) {
  return B(t).pipe(Qc(e), xs(e));
}
function xv(t, e) {
  return B(t).pipe(Qc(e), xs(e));
}
function Rv(t, e) {
  return new k((n) => {
    let r = 0;
    return e.schedule(function () {
      r === t.length ? n.complete() : (n.next(t[r++]), n.closed || this.schedule());
    });
  });
}
function Ov(t, e) {
  return new k((n) => {
    let r;
    return (
      nt(n, e, () => {
        ((r = t[Hc]()),
          nt(
            n,
            e,
            () => {
              let i, o;
              try {
                ({ value: i, done: o } = r.next());
              } catch (s) {
                n.error(s);
                return;
              }
              o ? n.complete() : n.next(i);
            },
            0,
            !0,
          ));
      }),
      () => V(r?.return) && r.return()
    );
  });
}
function Xc(t, e) {
  if (!t) throw new Error(`Iterable cannot be null`);
  return new k((n) => {
    nt(n, e, () => {
      let r = t[Symbol.asyncIterator]();
      nt(
        n,
        e,
        () => {
          r.next().then((i) => {
            i.done ? n.complete() : n.next(i.value);
          });
        },
        0,
        !0,
      );
    });
  });
}
function kv(t, e) {
  return Xc(Gc(t), e);
}
function Pv(t, e) {
  if (t != null) {
    if (jc(t)) return Nv(t, e);
    if (uo(t)) return Rv(t, e);
    if (Vc(t)) return xv(t, e);
    if (Uc(t)) return Xc(t, e);
    if ($c(t)) return Ov(t, e);
    if (zc(t)) return kv(t, e);
  }
  throw Bc(t);
}
function _e(t, e) {
  return e ? Pv(t, e) : B(t);
}
function z(...t) {
  return _e(t, gn(t));
}
function lf(t, e) {
  let n = V(t) ? t : () => t,
    r = (i) => i.error(n());
  return new k(e ? (i) => e.schedule(r, 0, i) : r);
}
function Jc(t) {
  return !!t && (t instanceof k || (V(t.lift) && V(t.subscribe)));
}
var ni = vr(
  (t) =>
    function () {
      (t(this), (this.name = `EmptyError`), (this.message = `no elements in sequence`));
    },
);
function eu(t) {
  return t instanceof Date && !isNaN(t);
}
var GS = vr(
  (t) =>
    function (n = null) {
      (t(this),
        (this.message = `Timeout has occurred`),
        (this.name = `TimeoutError`),
        (this.info = n));
    },
);
function zS(t, e) {
  let {
    first: n,
    each: r,
    with: i = WS,
    scheduler: o = e ?? dt,
    meta: s = null,
  } = eu(t) ? { first: t } : typeof t == `number` ? { each: t } : t;
  if (n == null && r == null) throw new TypeError(`No timeout provided.`);
  return x((a, c) => {
    let u,
      l,
      d = null,
      f = 0,
      h = (g) => {
        l = nt(
          c,
          o,
          () => {
            try {
              (u.unsubscribe(), B(i({ meta: s, lastValue: d, seen: f })).subscribe(c));
            } catch (p) {
              c.error(p);
            }
          },
          g,
        );
      };
    ((u = a.subscribe(
      A(
        c,
        (g) => {
          (l?.unsubscribe(), f++, c.next((d = g)), r > 0 && h(r));
        },
        void 0,
        void 0,
        () => {
          (l?.closed || l?.unsubscribe(), (d = null));
        },
      ),
    )),
      !f && h(n != null ? (typeof n == `number` ? n : +n - o.now()) : r));
  });
}
function WS(t) {
  throw new GS(t);
}
var { isArray: qS } = Array;
function YS(t, e) {
  return qS(e) ? t(...e) : t(e);
}
function po(t) {
  return Y((e) => YS(t, e));
}
var { isArray: ZS } = Array,
  { getPrototypeOf: KS, prototype: QS, keys: XS } = Object;
function tu(t) {
  if (t.length === 1) {
    let e = t[0];
    if (ZS(e)) return { args: e, keys: null };
    if (JS(e)) {
      let n = XS(e);
      return { args: n.map((r) => e[r]), keys: n };
    }
  }
  return { args: t, keys: null };
}
function JS(t) {
  return t && typeof t == `object` && KS(t) === QS;
}
function nu(t, e) {
  return t.reduce((n, r, i) => ((n[r] = e[i]), n), {});
}
function ru(...t) {
  let e = gn(t),
    n = ho(t),
    { args: r, keys: i } = tu(t);
  if (r.length === 0) return _e([], e);
  let o = new k(eT(r, e, i ? (s) => nu(i, s) : tt));
  return n ? o.pipe(po(n)) : o;
}
function eT(t, e, n = tt) {
  return (r) => {
    Fv(
      e,
      () => {
        let { length: i } = t,
          o = new Array(i),
          s = i,
          a = i;
        for (let c = 0; c < i; c++)
          Fv(
            e,
            () => {
              let u = _e(t[c], e),
                l = !1;
              u.subscribe(
                A(
                  r,
                  (d) => {
                    ((o[c] = d), l || ((l = !0), a--), a || r.next(n(o.slice())));
                  },
                  () => {
                    --s || r.complete();
                  },
                ),
              );
            },
            r,
          );
      },
      r,
    );
  };
}
function Fv(t, e, n) {
  t ? nt(n, t, e) : e();
}
function Lv(t, e, n, r, i, o, s, a) {
  let c = [],
    u = 0,
    l = 0,
    d = !1,
    f = () => {
      d && !c.length && !u && e.complete();
    },
    h = (p) => (u < r ? g(p) : c.push(p)),
    g = (p) => {
      (o && e.next(p), u++);
      let m = !1;
      B(n(p, l++)).subscribe(
        A(
          e,
          (y) => {
            (i?.(y), o ? h(y) : e.next(y));
          },
          () => {
            m = !0;
          },
          void 0,
          () => {
            if (m)
              try {
                for (u--; c.length && u < r;) {
                  let y = c.shift();
                  s ? nt(e, s, () => g(y)) : g(y);
                }
                f();
              } catch (y) {
                e.error(y);
              }
          },
        ),
      );
    };
  return (
    t.subscribe(
      A(e, h, () => {
        ((d = !0), f());
      }),
    ),
    () => {
      a?.();
    }
  );
}
function Ve(t, e, n = Infinity) {
  return V(e)
    ? Ve((r, i) => Y((o, s) => e(r, o, i, s))(B(t(r, i))), n)
    : (typeof e == `number` && (n = e), x((r, i) => Lv(r, i, t, n)));
}
function iu(t = Infinity) {
  return Ve(tt, t);
}
function Vv() {
  return iu(1);
}
function rn(...t) {
  return Vv()(_e(t, gn(t)));
}
function Rs(t) {
  return new k((e) => {
    B(t()).subscribe(e);
  });
}
function df(...t) {
  let e = ho(t),
    { args: n, keys: r } = tu(t),
    i = new k((o) => {
      let { length: s } = n;
      if (!s) {
        o.complete();
        return;
      }
      let a = new Array(s),
        c = s,
        u = s;
      for (let l = 0; l < s; l++) {
        let d = !1;
        B(n[l]).subscribe(
          A(
            o,
            (f) => {
              (d || ((d = !0), u--), (a[l] = f));
            },
            () => c--,
            void 0,
            () => {
              (!c || !d) && (u || o.next(r ? nu(r, a) : a), o.complete());
            },
          ),
        );
      }
    });
  return e ? i.pipe(po(e)) : i;
}
var tT = [`addListener`, `removeListener`];
var nT = [`addEventListener`, `removeEventListener`];
var rT = [`on`, `off`];
function mn(t, e, n, r) {
  if ((V(n) && ((r = n), (n = void 0)), r)) return mn(t, e, n).pipe(po(r));
  let [i, o] = sT(t)
    ? nT.map((s) => (a) => t[s](e, a, n))
    : iT(t)
      ? tT.map(jv(t, e))
      : oT(t)
        ? rT.map(jv(t, e))
        : [];
  if (!i && uo(t)) return Ve((s) => mn(s, e, n))(B(t));
  if (!i) throw new TypeError(`Invalid event target`);
  return new k((s) => {
    let a = (...c) => s.next(1 < c.length ? c : c[0]);
    return (i(a), () => o(a));
  });
}
function jv(t, e) {
  return (n) => (r) => t[n](e, r);
}
function iT(t) {
  return V(t.addListener) && V(t.removeListener);
}
function oT(t) {
  return V(t.on) && V(t.off);
}
function sT(t) {
  return V(t.addEventListener) && V(t.removeEventListener);
}
function jn(t = 0, e, n = cf) {
  let r = -1;
  return (
    e != null && (Kc(e) ? (n = e) : (r = e)),
    new k((i) => {
      let o = eu(t) ? +t - n.now() : t;
      o < 0 && (o = 0);
      let s = 0;
      return n.schedule(function () {
        i.closed || (i.next(s++), 0 <= r ? this.schedule(void 0, r) : i.complete());
      }, o);
    })
  );
}
function ff(...t) {
  let e = gn(t),
    n = Av(t, Infinity),
    r = t;
  return r.length ? (r.length === 1 ? B(r[0]) : iu(n)(_e(r, e))) : ye;
}
var hf = new k(St);
var { isArray: aT } = Array;
function Uv(t) {
  return t.length === 1 && aT(t[0]) ? t[0] : t;
}
function cT(...t) {
  return ((t = Uv(t)), t.length === 1 ? B(t[0]) : new k(uT(t)));
}
function uT(t) {
  return (e) => {
    let n = [];
    for (let r = 0; n && !e.closed && r < t.length; r++)
      n.push(
        B(t[r]).subscribe(
          A(e, (i) => {
            if (n) {
              for (let o = 0; o < n.length; o++) o !== r && n[o].unsubscribe();
              n = null;
            }
            e.next(i);
          }),
        ),
      );
  };
}
function Bv(t) {
  return x((e, n) => {
    let r = !1,
      i = null,
      o = null,
      s = !1,
      a = () => {
        if ((o?.unsubscribe(), (o = null), r)) {
          r = !1;
          let u = i;
          ((i = null), n.next(u));
        }
        s && n.complete();
      },
      c = () => {
        ((o = null), s && n.complete());
      };
    e.subscribe(
      A(
        n,
        (u) => {
          ((r = !0), (i = u), o || B(t(u)).subscribe((o = A(n, a, c))));
        },
        () => {
          ((s = !0), (!r || !o || o.closed) && n.complete());
        },
      ),
    );
  });
}
function lT(t, e = dt) {
  return Bv(() => jn(t, e));
}
function yr(t) {
  return x((e, n) => {
    let r = null,
      i = !1,
      o;
    ((r = e.subscribe(
      A(n, void 0, void 0, (s) => {
        ((o = B(t(s, yr(t)(e)))), r ? (r.unsubscribe(), (r = null), o.subscribe(n)) : (i = !0));
      }),
    )),
      i && (r.unsubscribe(), (r = null), o.subscribe(n)));
  });
}
function Hv(t, e, n, r, i) {
  return (o, s) => {
    let a = n,
      c = e,
      u = 0;
    o.subscribe(
      A(
        s,
        (l) => {
          let d = u++;
          ((c = a ? t(c, l, d) : ((a = !0), l)), r && s.next(c));
        },
        i &&
          (() => {
            (a && s.next(c), s.complete());
          }),
      ),
    );
  };
}
function go(t, e) {
  return V(e) ? Ve(t, e, 1) : Ve(t, 1);
}
function dT(t) {
  return x((e, n) => {
    let r = !1,
      i = null,
      o = null,
      s = () => {
        if ((o?.unsubscribe(), (o = null), r)) {
          r = !1;
          let a = i;
          ((i = null), n.next(a));
        }
      };
    e.subscribe(
      A(
        n,
        (a) => {
          (o?.unsubscribe(), (r = !0), (i = a), (o = A(n, s, St)), B(t(a)).subscribe(o));
        },
        () => {
          (s(), n.complete());
        },
        void 0,
        () => {
          i = o = null;
        },
      ),
    );
  });
}
function fT(t, e = dt) {
  return x((n, r) => {
    let i = null,
      o = null,
      s = null,
      a = () => {
        if (i) {
          (i.unsubscribe(), (i = null));
          let u = o;
          ((o = null), r.next(u));
        }
      };
    function c() {
      let u = s + t,
        l = e.now();
      if (l < u) {
        ((i = this.schedule(void 0, u - l)), r.add(i));
        return;
      }
      a();
    }
    n.subscribe(
      A(
        r,
        (u) => {
          ((o = u), (s = e.now()), i || ((i = e.schedule(c, t)), r.add(i)));
        },
        () => {
          (a(), r.complete());
        },
        void 0,
        () => {
          o = i = null;
        },
      ),
    );
  });
}
function Os(t) {
  return x((e, n) => {
    let r = !1;
    e.subscribe(
      A(
        n,
        (i) => {
          ((r = !0), n.next(i));
        },
        () => {
          (r || n.next(t), n.complete());
        },
      ),
    );
  });
}
function $v() {
  return x((t, e) => {
    t.subscribe(A(e, St));
  });
}
function Gv(t) {
  return Y(() => t);
}
function pf(t, e) {
  return e
    ? (n) => rn(e.pipe(yt(1), $v()), n.pipe(pf(t)))
    : Ve((n, r) => B(t(n, r)).pipe(yt(1), Gv(n)));
}
function hT(t, e = dt) {
  let n = jn(t, e);
  return pf(() => n);
}
function zv(t, e = tt) {
  return (
    (t = t ?? pT),
    x((n, r) => {
      let i,
        o = !0;
      n.subscribe(
        A(r, (s) => {
          let a = e(s);
          (o || !t(i, a)) && ((o = !1), (i = a), r.next(s));
        }),
      );
    })
  );
}
function pT(t, e) {
  return t === e;
}
function Wv(t = gT) {
  return x((e, n) => {
    let r = !1;
    e.subscribe(
      A(
        n,
        (i) => {
          ((r = !0), n.next(i));
        },
        () => (r ? n.complete() : n.error(t())),
      ),
    );
  });
}
function gT() {
  return new ni();
}
function qv(...t) {
  return (e) => rn(e, z(...t));
}
function Yv(t, e) {
  return e
    ? (n) => n.pipe(Yv((r, i) => B(t(r, i)).pipe(Y((o, s) => e(r, o, i, s)))))
    : x((n, r) => {
        let i = 0,
          o = null,
          s = !1;
        n.subscribe(
          A(
            r,
            (a) => {
              o ||
                ((o = A(r, void 0, () => {
                  ((o = null), s && r.complete());
                })),
                B(t(a, i++)).subscribe(o));
            },
            () => {
              ((s = !0), !o && r.complete());
            },
          ),
        );
      });
}
function mo(t) {
  return x((e, n) => {
    try {
      e.subscribe(n);
    } finally {
      n.add(t);
    }
  });
}
function Un(t, e) {
  let n = arguments.length >= 2;
  return (r) => r.pipe(t ? et((i, o) => t(i, o, r)) : tt, yt(1), n ? Os(e) : Wv(() => new ni()));
}
function ou(t) {
  return t <= 0
    ? () => ye
    : x((e, n) => {
        let r = [];
        e.subscribe(
          A(
            n,
            (i) => {
              (r.push(i), t < r.length && r.shift());
            },
            () => {
              for (let i of r) n.next(i);
              n.complete();
            },
            void 0,
            () => {
              r = null;
            },
          ),
        );
      });
}
function mT() {
  return x((t, e) => {
    let n,
      r = !1;
    t.subscribe(
      A(e, (i) => {
        let o = n;
        ((n = i), r && e.next([o, i]), (r = !0));
      }),
    );
  });
}
function Zv(t) {
  let e = Infinity,
    n;
  return (
    t != null && (typeof t == `object` ? ({ count: e = Infinity, delay: n } = t) : (e = t)),
    e <= 0
      ? () => ye
      : x((r, i) => {
          let o = 0,
            s,
            a = () => {
              if ((s?.unsubscribe(), (s = null), n != null)) {
                let u = typeof n == `number` ? jn(n) : B(n(o)),
                  l = A(i, () => {
                    (l.unsubscribe(), c());
                  });
                u.subscribe(l);
              } else c();
            },
            c = () => {
              let u = !1;
              ((s = r.subscribe(
                A(i, void 0, () => {
                  ++o < e ? (s ? a() : (u = !0)) : i.complete();
                }),
              )),
                u && a());
            };
          c();
        })
  );
}
function vT(t, e) {
  return x(Hv(t, e, arguments.length >= 2, !0));
}
function vo(t = {}) {
  let {
    connector: e = () => new ue(),
    resetOnError: n = !0,
    resetOnComplete: r = !0,
    resetOnRefCountZero: i = !0,
  } = t;
  return (o) => {
    let s,
      a,
      c,
      u = 0,
      l = !1,
      d = !1,
      f = () => {
        (a?.unsubscribe(), (a = void 0));
      },
      h = () => {
        (f(), (s = c = void 0), (l = d = !1));
      },
      g = () => {
        let p = s;
        (h(), p?.unsubscribe());
      };
    return x((p, m) => {
      (u++, !d && !l && f());
      let y = (c = c ?? e());
      (m.add(() => {
        (u--, u === 0 && !d && !l && (a = gf(g, i)));
      }),
        y.subscribe(m),
        !s &&
          u > 0 &&
          ((s = new Vn({
            next: (_) => y.next(_),
            error: (_) => {
              ((d = !0), f(), (a = gf(h, n, _)), y.error(_));
            },
            complete: () => {
              ((l = !0), f(), (a = gf(h, r)), y.complete());
            },
          })),
          B(p).subscribe(s)));
    })(o);
  };
}
function gf(t, e, ...n) {
  if (e === !0) {
    t();
    return;
  }
  if (e === !1) return;
  let r = new Vn({
    next: () => {
      (r.unsubscribe(), t());
    },
  });
  return B(e(...n)).subscribe(r);
}
function Kv(t, e, n) {
  let r,
    i = !1;
  return (
    t && typeof t == `object`
      ? ({ bufferSize: r = Infinity, windowTime: e = Infinity, refCount: i = !1, scheduler: n } = t)
      : (r = t ?? Infinity),
    vo({
      connector: () => new ti(r, e, n),
      resetOnError: !0,
      resetOnComplete: !1,
      resetOnRefCountZero: i,
    })
  );
}
function yT(t) {
  return et((e, n) => t <= n);
}
function _T(t) {
  return x((e, n) => {
    let r = !1,
      i = 0;
    e.subscribe(A(n, (o) => (r || (r = !t(o, i++))) && n.next(o)));
  });
}
function _r(...t) {
  let e = gn(t);
  return x((n, r) => {
    (e ? rn(t, n, e) : rn(t, n)).subscribe(r);
  });
}
function on(t) {
  return x((e, n) => {
    (B(t).subscribe(A(n, () => n.complete(), St)), !n.closed && e.subscribe(n));
  });
}
function Qv(t, e = !1) {
  return x((n, r) => {
    let i = 0;
    n.subscribe(
      A(r, (o) => {
        let s = t(o, i++);
        ((s || e) && r.next(o), !s && r.complete());
      }),
    );
  });
}
function ft(t, e, n) {
  let r = V(t) || e || n ? { next: t, error: e, complete: n } : t;
  return r
    ? x((i, o) => {
        var s;
        (s = r.subscribe) === null || s === void 0 || s.call(r);
        let a = !0;
        i.subscribe(
          A(
            o,
            (c) => {
              var u;
              ((u = r.next) === null || u === void 0 || u.call(r, c), o.next(c));
            },
            () => {
              var c;
              ((a = !1), (c = r.complete) === null || c === void 0 || c.call(r), o.complete());
            },
            (c) => {
              var u;
              ((a = !1), (u = r.error) === null || u === void 0 || u.call(r, c), o.error(c));
            },
            () => {
              var c, u;
              (a && ((c = r.unsubscribe) === null || c === void 0 || c.call(r)),
                (u = r.finalize) === null || u === void 0 || u.call(r));
            },
          ),
        );
      })
    : tt;
}
function Xv(t, e) {
  return x((n, r) => {
    let { leading: i = !0, trailing: o = !1 } = e ?? {},
      s = !1,
      a = null,
      c = null,
      u = !1,
      l = () => {
        (c?.unsubscribe(), (c = null), o && (h(), u && r.complete()));
      },
      d = () => {
        ((c = null), u && r.complete());
      },
      f = (g) => (c = B(t(g)).subscribe(A(r, l, d))),
      h = () => {
        if (s) {
          s = !1;
          let g = a;
          ((a = null), r.next(g), !u && f(g));
        }
      };
    n.subscribe(
      A(
        r,
        (g) => {
          ((s = !0), (a = g), !(c && !c.closed) && (i ? h() : f(g)));
        },
        () => {
          ((u = !0), !(o && s && c && !c.closed) && r.complete());
        },
      ),
    );
  });
}
function DT(t, e = dt, n) {
  let r = jn(t, e);
  return Xv(() => r, n);
}
function ET(...t) {
  let e = ho(t);
  return x((n, r) => {
    let i = t.length,
      o = new Array(i),
      s = t.map(() => !1),
      a = !1;
    for (let c = 0; c < i; c++)
      B(t[c]).subscribe(
        A(
          r,
          (u) => {
            ((o[c] = u), !a && !s[c] && ((s[c] = !0), (a = s.every(tt)) && (s = null)));
          },
          St,
        ),
      );
    n.subscribe(
      A(r, (c) => {
        if (a) {
          let u = [c, ...o];
          r.next(e ? e(...u) : u);
        }
      }),
    );
  });
}
var ht = null;
var su = !1;
var ri = 1;
var CT = null;
var le = Symbol(`SIGNAL`);
function P(t) {
  let e = ht;
  return ((ht = t), e);
}
function au() {
  return ht;
}
var Bn = {
  version: 0,
  lastCleanEpoch: 0,
  dirty: !1,
  producers: void 0,
  producersTail: void 0,
  consumers: void 0,
  consumersTail: void 0,
  recomputing: !1,
  consumerAllowSignalWrites: !1,
  consumerIsAlwaysLive: !1,
  kind: `unknown`,
  producerMustRecompute: () => !1,
  producerRecomputeValue: () => {},
  consumerMarkedDirty: () => {},
  consumerOnSignalRead: () => {},
};
function Hn(t) {
  if (su) throw new Error(``);
  if (ht === null) return;
  ht.consumerOnSignalRead(t);
  let e = ht.producersTail;
  if (e !== void 0 && e.producer === t) return;
  let n,
    r = ht.recomputing;
  if (r && ((n = e !== void 0 ? e.nextProducer : ht.producers), n !== void 0 && n.producer === t)) {
    ((ht.producersTail = n), (n.lastReadVersion = t.version), (n.knownValidAtEpoch = ri));
    return;
  }
  let i = t.consumersTail;
  if (i !== void 0 && i.consumer === ht && (!r || i.knownValidAtEpoch === ri)) return;
  let o = _o(ht),
    s = {
      producer: t,
      consumer: ht,
      nextProducer: n,
      prevConsumer: void 0,
      knownValidAtEpoch: ri,
      lastReadVersion: t.version,
      nextConsumer: void 0,
    };
  ((ht.producersTail = s), e !== void 0 ? (e.nextProducer = s) : (ht.producers = s), o && ry(t, s));
}
function Jv() {
  ri++;
}
function si(t) {
  if (!(_o(t) && !t.dirty) && !(!t.dirty && t.lastCleanEpoch === ri)) {
    if (!t.producerMustRecompute(t) && !ai(t)) {
      yo(t);
      return;
    }
    (t.producerRecomputeValue(t), yo(t));
  }
}
function mf(t) {
  if (t.consumers === void 0) return;
  let e = su;
  su = !0;
  try {
    for (let n = t.consumers; n !== void 0; n = n.nextConsumer) {
      let r = n.consumer;
      r.dirty || ey(r);
    }
  } finally {
    su = e;
  }
}
function vf() {
  return ht?.consumerAllowSignalWrites !== !1;
}
function ey(t) {
  ((t.dirty = !0), mf(t), t.consumerMarkedDirty?.(t));
}
function yo(t) {
  ((t.dirty = !1), (t.lastCleanEpoch = ri));
}
function yn(t) {
  return (t && ty(t), P(t));
}
function ty(t) {
  if (t.producersTail?.knownValidAtEpoch === ri) {
    let e = t.producers;
    for (; e !== void 0;) ((e.knownValidAtEpoch = null), (e = e.nextProducer));
  }
  ((t.producersTail = void 0), (t.recomputing = !0));
}
function $n(t, e) {
  (P(e), t && ny(t));
}
function ny(t) {
  t.recomputing = !1;
  let e = t.producersTail,
    n = e !== void 0 ? e.nextProducer : t.producers;
  if (n !== void 0) {
    if (_o(t))
      do n = yf(n);
      while (n !== void 0);
    e !== void 0 ? (e.nextProducer = void 0) : (t.producers = void 0);
  }
}
function ai(t) {
  for (let e = t.producers; e !== void 0; e = e.nextProducer) {
    let n = e.producer,
      r = e.lastReadVersion;
    if (r !== n.version || (si(n), r !== n.version)) return !0;
  }
  return !1;
}
function Gn(t) {
  if (_o(t)) {
    let e = t.producers;
    for (; e !== void 0;) e = yf(e);
  }
  ((t.producers = void 0),
    (t.producersTail = void 0),
    (t.consumers = void 0),
    (t.consumersTail = void 0));
}
function ry(t, e) {
  let n = t.consumersTail,
    r = _o(t);
  if (
    (n !== void 0
      ? ((e.nextConsumer = n.nextConsumer), (n.nextConsumer = e))
      : ((e.nextConsumer = void 0), (t.consumers = e)),
    (e.prevConsumer = n),
    (t.consumersTail = e),
    !r)
  )
    for (let i = t.producers; i !== void 0; i = i.nextProducer) ry(i.producer, i);
}
function yf(t) {
  let e = t.producer,
    n = t.nextProducer,
    r = t.nextConsumer,
    i = t.prevConsumer;
  if (
    ((t.nextConsumer = void 0),
    (t.prevConsumer = void 0),
    r !== void 0 ? (r.prevConsumer = i) : (e.consumersTail = i),
    i !== void 0)
  )
    i.nextConsumer = r;
  else if (((e.consumers = r), !_o(e))) {
    let o = e.producers;
    for (; o !== void 0;) o = yf(o);
  }
  return n;
}
function _o(t) {
  return t.consumerIsAlwaysLive || t.consumers !== void 0;
}
function ks(t) {
  CT?.(t);
}
function Ps(t, e) {
  return Object.is(t, e);
}
function Fs(t, e) {
  let n = Object.create(wT);
  ((n.computation = t), e !== void 0 && (n.equal = e));
  let r = () => {
    if ((si(n), Hn(n), n.value === vn)) throw n.error;
    return n.value;
  };
  return ((r[le] = n), ks(n), r);
}
var ii = Symbol(`UNSET`);
var oi = Symbol(`COMPUTING`);
var vn = Symbol(`ERRORED`);
var wT = m(l({}, Bn), {
  value: ii,
  dirty: !0,
  error: null,
  equal: Ps,
  kind: `computed`,
  producerMustRecompute(t) {
    return t.value === ii || t.value === oi;
  },
  producerRecomputeValue(t) {
    if (t.value === oi) throw new Error(``);
    let e = t.value;
    t.value = oi;
    let n = yn(t),
      r,
      i = !1;
    try {
      ((r = t.computation()), P(null), (i = e !== ii && e !== vn && r !== vn && t.equal(e, r)));
    } catch (o) {
      ((r = vn), (t.error = o));
    } finally {
      $n(t, n);
    }
    if (i) {
      t.value = e;
      return;
    }
    ((t.value = r), t.version++);
  },
});
function IT() {
  throw new Error();
}
var iy = IT;
function oy(t) {
  iy(t);
}
function _f(t) {
  iy = t;
}
var bT = null;
function Df(t, e) {
  let n = Object.create(Ls);
  ((n.value = t), e !== void 0 && (n.equal = e));
  let r = () => sy(n);
  return ((r[le] = n), ks(n), [r, (s) => Dr(n, s), (s) => cu(n, s)]);
}
function sy(t) {
  return (Hn(t), t.value);
}
function Dr(t, e) {
  (vf() || oy(t), t.equal(t.value, e) || ((t.value = e), ST(t)));
}
function cu(t, e) {
  (vf() || oy(t), Dr(t, e(t.value)));
}
var Ls = m(l({}, Bn), { equal: Ps, value: void 0, kind: `signal` });
function ST(t) {
  (t.version++, Jv(), mf(t), bT?.(t));
}
var Ef = m(l({}, Bn), {
  consumerIsAlwaysLive: !0,
  consumerAllowSignalWrites: !0,
  dirty: !0,
  kind: `effect`,
});
function Cf(t) {
  if (((t.dirty = !1), t.version > 0 && !ai(t))) return;
  t.version++;
  let e = yn(t);
  try {
    (t.cleanup(), t.fn());
  } finally {
    $n(t, e);
  }
}
var wf;
function uu() {
  return wf;
}
function _n(t) {
  let e = wf;
  return ((wf = t), e);
}
var ay = Symbol(`NotFound`);
function Do(t) {
  return t === ay || t?.name === `ɵNotFound`;
}
function If(t, e, n) {
  let r = Object.create(TT);
  ((r.source = t), (r.computation = e), n != null && (r.equal = n));
  let o = () => {
    if ((si(r), Hn(r), r.value === vn)) throw r.error;
    return r.value;
  };
  return ((o[le] = r), ks(r), o);
}
function bf(t, e) {
  (si(t), Dr(t, e), yo(t));
}
function cy(t, e) {
  if ((si(t), t.value === vn)) throw t.error;
  (cu(t, e), yo(t));
}
var TT = m(l({}, Bn), {
  value: ii,
  dirty: !0,
  error: null,
  equal: Ps,
  kind: `linkedSignal`,
  producerMustRecompute(t) {
    return t.value === ii || t.value === oi;
  },
  producerRecomputeValue(t) {
    if (t.value === oi) throw new Error(``);
    let e = t.value;
    t.value = oi;
    let n = yn(t),
      r,
      i = !1;
    try {
      let o = t.source(),
        s = e !== ii && e !== vn,
        a = s ? { source: t.sourceValue, value: e } : void 0;
      ((r = t.computation(o, a)),
        (t.sourceValue = o),
        P(null),
        (i = s && r !== vn && t.equal(e, r)));
    } catch (o) {
      ((r = vn), (t.error = o));
    } finally {
      $n(t, n);
    }
    if (i) {
      t.value = e;
      return;
    }
    ((t.value = r), t.version++);
  },
});
function uy(t) {
  let e = P(null);
  try {
    return t();
  } finally {
    P(e);
  }
}
var mu = `https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss`;
var I = class extends Error {
  code;
  constructor(e, n) {
    (super(En(e, n)), (this.code = e));
  }
};
function MT(t) {
  return `NG0${Math.abs(t)}`;
}
function En(t, e) {
  return `${MT(t)}${e ? `: ` + e : ``}`;
}
function X(t) {
  for (let e in t) if (t[e] === X) return e;
  throw Error(``);
}
function gy(t, e) {
  for (let n in e) e.hasOwnProperty(n) && !t.hasOwnProperty(n) && (t[n] = e[n]);
}
function Gs(t) {
  if (typeof t == `string`) return t;
  if (Array.isArray(t)) return `[${t.map(Gs).join(`, `)}]`;
  if (t == null) return `` + t;
  let e = t.overriddenName || t.name;
  if (e) return `${e}`;
  let n = t.toString();
  if (n == null) return `` + n;
  let r = n.indexOf(`
`);
  return r >= 0 ? n.slice(0, r) : n;
}
function vu(t, e) {
  return t ? (e ? `${t} ${e}` : t) : e || ``;
}
var AT = X({ __forward_ref__: X });
function Ir(t) {
  return ((t.__forward_ref__ = Ir), t);
}
function je(t) {
  return Uf(t) ? t() : t;
}
function Uf(t) {
  return typeof t == `function` && t.hasOwnProperty(AT) && t.__forward_ref__ === Ir;
}
function q(t) {
  return { token: t.token, providedIn: t.providedIn || null, factory: t.factory, value: void 0 };
}
function zs(t) {
  return NT(t, yu);
}
function Bf(t) {
  return zs(t) !== null;
}
function NT(t, e) {
  return (t.hasOwnProperty(e) && t[e]) || null;
}
function xT(t) {
  return (t?.[yu] ?? null) || null;
}
function Tf(t) {
  return t && t.hasOwnProperty(du) ? t[du] : null;
}
var yu = X({ ɵprov: X });
var du = X({ ɵinj: X });
var E = class {
  _desc;
  ngMetadataName = `InjectionToken`;
  ɵprov;
  constructor(e, n) {
    ((this._desc = e),
      (this.ɵprov = void 0),
      typeof n == `number`
        ? (this.__NG_ELEMENT_ID__ = n)
        : n !== void 0 &&
          (this.ɵprov = q({
            token: this,
            providedIn: n.providedIn || `root`,
            factory: n.factory,
          })));
  }
  get multi() {
    return this;
  }
  toString() {
    return `InjectionToken ${this._desc}`;
  }
};
function Hf(t) {
  return t && !!t.ɵproviders;
}
var Ws = X({ ɵcmp: X });
var qs = X({ ɵdir: X });
var $f = X({ ɵpipe: X });
var Gf = X({ ɵmod: X });
var Us = X({ ɵfac: X });
var fi = X({ __NG_ELEMENT_ID__: X });
var ly = X({ __NG_ENV_ID__: X });
function my(t) {
  return (Du(t, `@NgModule`), t[Gf] || null);
}
function qn(t) {
  return (Du(t, `@Component`), t[Ws] || null);
}
function _u(t) {
  return (Du(t, `@Directive`), t[qs] || null);
}
function vy(t) {
  return (Du(t, `@Pipe`), t[$f] || null);
}
function Du(t, e) {
  if (t == null) throw new I(-919, !1);
}
function Cn(t) {
  return typeof t == `string` ? t : t == null ? `` : String(t);
}
var yy = X({ ngErrorCode: X });
var RT = X({ ngErrorMessage: X });
var OT = X({ ngTokenPath: X });
function zf(t, e) {
  return _y(``, -200, e);
}
function Eu(t, e) {
  throw new I(-201, !1);
}
function _y(t, e, n) {
  let r = new I(e, t);
  return ((r[yy] = e), (r[RT] = t), n && (r[OT] = n), r);
}
function kT(t) {
  return t[yy];
}
var Mf;
function Dy() {
  return Mf;
}
function pt(t) {
  let e = Mf;
  return ((Mf = t), e);
}
function Wf(t, e, n) {
  let r = zs(t);
  if (r && r.providedIn == `root`) return r.value === void 0 ? (r.value = r.factory()) : r.value;
  if (n & 8) return null;
  if (e !== void 0) return e;
  Eu(t, ``);
}
var $t = globalThis;
var ci = {};
var Af = `__NG_DI_FLAG__`;
var Nf = class {
  injector;
  constructor(e) {
    this.injector = e;
  }
  retrieve(e, n) {
    let r = ui(n) || 0;
    try {
      return this.injector.get(e, r & 8 ? null : ci, r);
    } catch (i) {
      if (Do(i)) return i;
      throw i;
    }
  }
};
function FT(t, e = 0) {
  let n = uu();
  if (n === void 0) throw new I(-203, !1);
  if (n === null) return Wf(t, void 0, e);
  {
    let r = LT(e),
      i = n.retrieve(t, r);
    if (Do(i)) {
      if (r.optional) return null;
      throw i;
    }
    return i;
  }
}
function j(t, e = 0) {
  return (Dy() || FT)(je(t), e);
}
function v(t, e) {
  return j(t, ui(e));
}
function ui(t) {
  return typeof t > `u` || typeof t == `number`
    ? t
    : 0 | (t.optional && 8) | (t.host && 1) | (t.self && 2) | (t.skipSelf && 4);
}
function LT(t) {
  return { optional: !!(t & 8), host: !!(t & 1), self: !!(t & 2), skipSelf: !!(t & 4) };
}
function xf(t) {
  let e = [];
  for (let n = 0; n < t.length; n++) {
    let r = je(t[n]);
    if (Array.isArray(r)) {
      if (r.length === 0) throw new I(900, !1);
      let i,
        o = 0;
      for (let s = 0; s < r.length; s++) {
        let a = r[s],
          c = VT(a);
        typeof c == `number` ? (c === -1 ? (i = a.token) : (o |= c)) : (i = a);
      }
      e.push(j(i, o));
    } else e.push(j(r));
  }
  return e;
}
function Cu(t, e) {
  return ((t[Af] = e), (t.prototype[Af] = e), t);
}
function VT(t) {
  return t[Af];
}
function Cr(t, e) {
  return t.hasOwnProperty(Us) ? t[Us] : null;
}
function Ey(t, e, n) {
  if (t.length !== e.length) return !1;
  for (let r = 0; r < t.length; r++) {
    let i = t[r],
      o = e[r];
    if ((n && ((i = n(i)), (o = n(o))), o !== i)) return !1;
  }
  return !0;
}
function Cy(t) {
  return t.flat(Number.POSITIVE_INFINITY);
}
function wu(t, e) {
  t.forEach((n) => (Array.isArray(n) ? wu(n, e) : e(n)));
}
function qf(t, e, n) {
  e >= t.length ? t.push(n) : t.splice(e, 0, n);
}
function Ys(t, e) {
  return e >= t.length - 1 ? t.pop() : t.splice(e, 1)[0];
}
function wy(t, e) {
  let n = [];
  for (let r = 0; r < t; r++) n.push(e);
  return n;
}
function Iy(t, e, n, r) {
  let i = t.length;
  if (i == e) t.push(n, r);
  else if (i === 1) (t.push(r, t[0]), (t[0] = n));
  else {
    for (i--, t.push(t[i - 1], t[i]); i > e;) ((t[i] = t[i - 2]), i--);
    ((t[e] = n), (t[e + 1] = r));
  }
}
function Zs(t, e, n) {
  let r = Io(t, e);
  return (r >= 0 ? (t[r | 1] = n) : ((r = ~r), Iy(t, r, e, n)), r);
}
function Iu(t, e) {
  let n = Io(t, e);
  if (n >= 0) return t[n | 1];
}
function Io(t, e) {
  return jT(t, e, 1);
}
function jT(t, e, n) {
  let r = 0,
    i = t.length >> n;
  for (; i !== r;) {
    let o = r + ((i - r) >> 1),
      s = t[o << n];
    if (e === s) return o << n;
    s > e ? (i = o) : (r = o + 1);
  }
  return ~(i << n);
}
var br = {};
var Bt = [];
var hi = new E(``);
var pi = new E(``, -1);
var Yf = new E(``);
var Co = class {
  get(e, n = ci) {
    if (n === ci) {
      let i = _y(``, -201);
      throw ((i.name = `ɵNotFound`), i);
    }
    return n;
  }
};
function sn(t) {
  return { ɵproviders: t };
}
function by(t) {
  return sn([{ provide: hi, multi: !0, useValue: t }]);
}
function Sy(...t) {
  return { ɵproviders: Zf(!0, t), ɵfromNgModule: !0 };
}
function Zf(t, ...e) {
  let n = [],
    r = new Set(),
    i,
    o = (s) => {
      n.push(s);
    };
  return (
    wu(e, (s) => {
      let a = s;
      fu(a, o, [], r) && ((i ||= []), i.push(a));
    }),
    i !== void 0 && Ty(i, o),
    n
  );
}
function Ty(t, e) {
  for (let n = 0; n < t.length; n++) {
    let { ngModule: r, providers: i } = t[n];
    Kf(i, (o) => {
      e(o, r);
    });
  }
}
function fu(t, e, n, r) {
  if (((t = je(t)), !t)) return !1;
  let i = null,
    o = Tf(t),
    s = !o && qn(t);
  if (!o && !s) {
    let c = t.ngModule;
    if (((o = Tf(c)), o)) i = c;
    else return !1;
  } else {
    if (s && !s.standalone) return !1;
    i = t;
  }
  let a = r.has(i);
  if (s) {
    if (a) return !1;
    if ((r.add(i), s.dependencies)) {
      let c = typeof s.dependencies == `function` ? s.dependencies() : s.dependencies;
      for (let u of c) fu(u, e, n, r);
    }
  } else if (o) {
    if (o.imports != null && !a) {
      r.add(i);
      let u;
      (wu(o.imports, (l) => {
        fu(l, e, n, r) && ((u ||= []), u.push(l));
      }),
        u !== void 0 && Ty(u, e));
    }
    if (!a) {
      let u = Cr(i) || (() => new i());
      (e({ provide: i, useFactory: u, deps: Bt }, i),
        e({ provide: Yf, useValue: i, multi: !0 }, i),
        e({ provide: hi, useValue: () => j(i), multi: !0 }, i));
    }
    let c = o.providers;
    if (c != null && !a) {
      let u = t;
      Kf(c, (l) => {
        e(l, u);
      });
    }
  } else return !1;
  return i !== t && t.providers !== void 0;
}
function Kf(t, e) {
  for (let n of t) (Hf(n) && (n = n.ɵproviders), Array.isArray(n) ? Kf(n, e) : e(n));
}
var UT = X({ provide: String, useValue: X });
function My(t) {
  return t !== null && typeof t == `object` && UT in t;
}
function BT(t) {
  return !!(t && t.useExisting);
}
function HT(t) {
  return !!(t && t.useFactory);
}
function li(t) {
  return typeof t == `function`;
}
function Ay(t) {
  return !!t.useClass;
}
var Ks = new E(``);
var lu = {};
var dy = {};
var Sf;
function bo() {
  return (Sf === void 0 && (Sf = new Co()), Sf);
}
var ve = class {};
var di = class extends ve {
  parent;
  source;
  scopes;
  records = new Map();
  _ngOnDestroyHooks = new Set();
  _onDestroyHooks = [];
  get destroyed() {
    return this._destroyed;
  }
  _destroyed = !1;
  injectorDefTypes;
  constructor(e, n, r, i) {
    (super(),
      (this.parent = n),
      (this.source = r),
      (this.scopes = i),
      Of(e, (s) => this.processProvider(s)),
      this.records.set(pi, Eo(void 0, this)),
      i.has(`environment`) && this.records.set(ve, Eo(void 0, this)));
    let o = this.records.get(Ks);
    (o != null && typeof o.value == `string` && this.scopes.add(o.value),
      (this.injectorDefTypes = new Set(this.get(Yf, Bt, { self: !0 }))));
  }
  retrieve(e, n) {
    let r = ui(n) || 0;
    try {
      return this.get(e, ci, r);
    } catch (i) {
      if (Do(i)) return i;
      throw i;
    }
  }
  destroy() {
    (Vs(this), (this._destroyed = !0));
    let e = P(null);
    try {
      for (let r of this._ngOnDestroyHooks) r.ngOnDestroy();
      let n = this._onDestroyHooks;
      this._onDestroyHooks = [];
      for (let r of n) r();
    } finally {
      (this.records.clear(), this._ngOnDestroyHooks.clear(), this.injectorDefTypes.clear(), P(e));
    }
  }
  onDestroy(e) {
    return (Vs(this), this._onDestroyHooks.push(e), () => this.removeOnDestroy(e));
  }
  runInContext(e) {
    Vs(this);
    let n = _n(this),
      r = pt(void 0);
    try {
      return e();
    } finally {
      (_n(n), pt(r));
    }
  }
  get(e, n = ci, r) {
    if ((Vs(this), e.hasOwnProperty(ly))) return e[ly](this);
    let i = ui(r),
      s = _n(this),
      a = pt(void 0);
    try {
      if (!(i & 4)) {
        let u = this.records.get(e);
        if (u === void 0) {
          let l = qT(e) && zs(e);
          (l && this.injectableDefInScope(l) ? (u = Eo(Rf(e), lu)) : (u = null),
            this.records.set(e, u));
        }
        if (u != null) return this.hydrate(e, u, i);
      }
      let c = i & 2 ? bo() : this.parent;
      return ((n = i & 8 && n === ci ? null : n), c.get(e, n));
    } catch (c) {
      let u = kT(c);
      throw u === -200 || u === -201 ? new I(u, null) : c;
    } finally {
      (pt(a), _n(s));
    }
  }
  resolveInjectorInitializers() {
    let e = P(null),
      n = _n(this),
      r = pt(void 0);
    try {
      let o = this.get(hi, Bt, { self: !0 });
      for (let s of o) s();
    } finally {
      (_n(n), pt(r), P(e));
    }
  }
  toString() {
    return `R3Injector[...]`;
  }
  processProvider(e) {
    e = je(e);
    let n = li(e) ? e : je(e && e.provide),
      r = GT(e);
    if (!li(e) && e.multi === !0) {
      let i = this.records.get(n);
      (i || ((i = Eo(void 0, lu, !0)), (i.factory = () => xf(i.multi)), this.records.set(n, i)),
        (n = e),
        i.multi.push(e));
    }
    this.records.set(n, r);
  }
  hydrate(e, n, r) {
    let i = P(null);
    try {
      if (n.value === dy) throw zf(``);
      return (
        n.value === lu && ((n.value = dy), (n.value = n.factory(void 0, r))),
        typeof n.value == `object` && n.value && WT(n.value) && this._ngOnDestroyHooks.add(n.value),
        n.value
      );
    } finally {
      P(i);
    }
  }
  injectableDefInScope(e) {
    if (!e.providedIn) return !1;
    let n = je(e.providedIn);
    return typeof n == `string` ? n === `any` || this.scopes.has(n) : this.injectorDefTypes.has(n);
  }
  removeOnDestroy(e) {
    let n = this._onDestroyHooks.indexOf(e);
    n !== -1 && this._onDestroyHooks.splice(n, 1);
  }
};
function Rf(t) {
  let e = zs(t),
    n = e !== null ? e.factory : Cr(t);
  if (n !== null) return n;
  if (t instanceof E) throw new I(-204, !1);
  if (t instanceof Function) return $T(t);
  throw new I(-204, !1);
}
function $T(t) {
  if (t.length > 0) throw new I(-204, !1);
  let n = xT(t);
  return n !== null ? () => n.factory(t) : () => new t();
}
function GT(t) {
  if (My(t)) return Eo(void 0, t.useValue);
  return Eo(Qf(t), lu);
}
function Qf(t, e, n) {
  let r;
  if (li(t)) {
    let i = je(t);
    return Cr(i) || Rf(i);
  } else if (My(t)) r = () => je(t.useValue);
  else if (HT(t)) r = () => t.useFactory(...xf(t.deps || []));
  else if (BT(t)) r = (i, o) => j(je(t.useExisting), o !== void 0 && o & 8 ? 8 : void 0);
  else {
    let i = je(t && (t.useClass || t.provide));
    if (zT(t)) r = () => new i(...xf(t.deps));
    else return Cr(i) || Rf(i);
  }
  return r;
}
function Vs(t) {
  if (t.destroyed) throw new I(-205, !1);
}
function Eo(t, e, n = !1) {
  return { factory: t, value: e, multi: n ? [] : void 0 };
}
function zT(t) {
  return !!t.deps;
}
function WT(t) {
  return t !== null && typeof t == `object` && typeof t.ngOnDestroy == `function`;
}
function qT(t) {
  return typeof t == `function` || (typeof t == `object` && t.ngMetadataName === `InjectionToken`);
}
function Of(t, e) {
  for (let n of t) Array.isArray(n) ? Of(n, e) : n && Hf(n) ? Of(n.ɵproviders, e) : e(n);
}
function $e(t, e) {
  let n;
  t instanceof di ? (Vs(t), (n = t)) : (n = new Nf(t));
  let i = _n(n),
    o = pt(void 0);
  try {
    return e();
  } finally {
    (_n(i), pt(o));
  }
}
function Ny() {
  return Dy() !== void 0 || uu() != null;
}
var an = 0;
var O = 1;
var U = 2;
var Be = 3;
var Gt = 4;
var rt = 5;
var gi = 6;
var So = 7;
var xe = 8;
var wn = 9;
var cn = 10;
var ne = 11;
var To = 12;
var Xf = 13;
var Sr = 14;
var gt = 15;
var Tr = 16;
var mi = 17;
var In = 18;
var bn = 19;
var Jf = 20;
var zn = 21;
var bu = 22;
var wr = 23;
var Tt = 24;
var vi = 25;
var Sn = 26;
var se = 27;
var xy = 1;
var eh = 6;
var yi = 7;
var Qs = 8;
var _i = 9;
var Ee = 10;
function Yn(t) {
  return Array.isArray(t) && typeof t[xy] == `object`;
}
function zt(t) {
  return Array.isArray(t) && t[xy] === !0;
}
function th(t) {
  return (t.flags & 4) !== 0;
}
function Zn(t) {
  return t.componentOffset > -1;
}
function Mo(t) {
  return (t.flags & 1) === 1;
}
function un(t) {
  return !!t.template;
}
function Ao(t) {
  return (t[U] & 512) !== 0;
}
function Di(t) {
  return (t[U] & 256) === 256;
}
var Oe = (function (t) {
  return (
    (t[(t.NONE = 0)] = `NONE`),
    (t[(t.HTML = 1)] = `HTML`),
    (t[(t.STYLE = 2)] = `STYLE`),
    (t[(t.SCRIPT = 3)] = `SCRIPT`),
    (t[(t.URL = 4)] = `URL`),
    (t[(t.RESOURCE_URL = 5)] = `RESOURCE_URL`),
    (t[(t.ATTRIBUTE_NO_BINDING = 6)] = `ATTRIBUTE_NO_BINDING`),
    t
  );
})(Oe || {});
var js;
var wo = `svg`;
var Su = `math`;
var Ry = ``;
var fy = `*`;
var kf = () => Object.create(null);
function YT() {
  return (
    js ||
    ((js = kf()),
    Er(Oe.HTML, void 0, [
      [`iframe`, [`srcdoc`]],
      [`*`, [`innerHTML`, `outerHTML`]],
    ]),
    Er(Oe.STYLE, void 0, [[`*`, [`style`]]]),
    Er(Oe.URL, void 0, [
      [`*`, [`formAction`]],
      [`area`, [`href`]],
      [`a`, [`href`, `xlink:href`]],
      [`form`, [`action`]],
      [`img`, [`src`]],
      [`video`, [`src`]],
    ]),
    Er(Oe.URL, Su, [[`*`, [`href`, `xlink:href`]]]),
    Er(Oe.RESOURCE_URL, void 0, [
      [`base`, [`href`]],
      [`embed`, [`src`]],
      [`frame`, [`src`]],
      [`iframe`, [`src`]],
      [`link`, [`href`]],
      [`object`, [`codebase`, `data`]],
    ]),
    Er(Oe.URL, wo, [[`a`, [`href`, `xlink:href`]]]),
    Er(Oe.ATTRIBUTE_NO_BINDING, wo, [
      [`animate`, [`attributeName`, `values`, `to`, `from`]],
      [`set`, [`to`, `attributeName`]],
      [`animateMotion`, [`attributeName`]],
      [`animateTransform`, [`attributeName`]],
    ]),
    Er(Oe.ATTRIBUTE_NO_BINDING, void 0, [
      [
        `unknown`,
        [
          `attributeName`,
          `values`,
          `to`,
          `from`,
          `sandbox`,
          `allow`,
          `allowFullscreen`,
          `referrerPolicy`,
          `csp`,
          `fetchPriority`,
          `credentialless`,
        ],
      ],
      [
        `iframe`,
        [
          `sandbox`,
          `allow`,
          `allowFullscreen`,
          `referrerPolicy`,
          `csp`,
          `fetchPriority`,
          `credentialless`,
        ],
      ],
    ]),
    js)
  );
}
function Er(t, e, n) {
  let r = e ?? Ry;
  for (let [i, o] of n) {
    let s = i.toLowerCase();
    for (let a of o) {
      let c = a.toLowerCase(),
        u = (js[c] ??= kf()),
        l = (u[r] ??= kf());
      l[s] = t;
    }
  }
}
function Oy(t, e, n) {
  let i = YT()[e.toLowerCase()];
  if (!i) return Oe.NONE;
  let o = t.toLowerCase(),
    s;
  if (n) {
    let a = i[n];
    a && (s = a[o] ?? a[fy]);
  }
  if (s === void 0) {
    let a = i[Ry];
    a && (s = a[o] ?? a[fy]);
  }
  return s ?? Oe.NONE;
}
function Ke(t) {
  for (; Array.isArray(t);) t = t[an];
  return t;
}
function nh(t, e) {
  return Ke(e[t]);
}
function Mt(t, e) {
  return Ke(e[t.index]);
}
function Tu(t, e) {
  return t.data[e];
}
function No(t, e) {
  return t[e];
}
function Xs(t, e, n, r) {
  (n >= t.data.length && ((t.data[n] = null), (t.blueprint[n] = null)), (e[n] = r));
}
function Wt(t, e) {
  let n = e[t];
  return Yn(n) ? n : n[an];
}
function ky(t) {
  return (t[U] & 4) === 4;
}
function Mu(t) {
  return (t[U] & 128) === 128;
}
function Py(t) {
  return zt(t[Be]);
}
function qt(t, e) {
  return e == null ? null : t[e];
}
function rh(t) {
  t[mi] = 0;
}
function ih(t) {
  t[U] & 1024 || ((t[U] |= 1024), Mu(t) && Ei(t));
}
function Fy(t, e) {
  for (; t > 0;) ((e = e[Sr]), t--);
  return e;
}
function Js(t) {
  return !!(t[U] & 9216 || t[Tt]?.dirty);
}
function Au(t) {
  (t[cn].changeDetectionScheduler?.notify(8), t[U] & 64 && (t[U] |= 1024), Js(t) && Ei(t));
}
function Ei(t) {
  t[cn].changeDetectionScheduler?.notify(0);
  let e = Wn(t);
  for (; e !== null && !(e[U] & 8192 || ((e[U] |= 8192), !Mu(e)));) e = Wn(e);
}
function Nu(t, e) {
  if (Di(t)) throw new I(911, !1);
  (t[zn] === null && (t[zn] = []), t[zn].push(e));
}
function Ly(t, e) {
  if (t[zn] === null) return;
  let n = t[zn].indexOf(e);
  n !== -1 && t[zn].splice(n, 1);
}
function Wn(t) {
  let e = t[Be];
  return zt(e) ? e[Be] : e;
}
function oh(t) {
  return (t[So] ??= []);
}
function sh(t) {
  return (t.cleanup ??= []);
}
function Vy(t, e, n, r) {
  let i = oh(e);
  (i.push(n), t.firstCreatePass && sh(t).push(r, i.length - 1));
}
var W = { lFrame: Ky(null), bindingsEnabled: !0, skipHydrationRootTNode: null };
var Pf = !1;
function jy() {
  return W.lFrame.elementDepthCount;
}
function Uy() {
  W.lFrame.elementDepthCount++;
}
function ah() {
  W.lFrame.elementDepthCount--;
}
function xu() {
  return W.bindingsEnabled;
}
function ch() {
  return W.skipHydrationRootTNode !== null;
}
function uh(t) {
  return W.skipHydrationRootTNode === t;
}
function lh() {
  W.skipHydrationRootTNode = null;
}
function R() {
  return W.lFrame.lView;
}
function re() {
  return W.lFrame.tView;
}
function By(t) {
  return ((W.lFrame.contextLView = t), t[xe]);
}
function Hy(t) {
  return ((W.lFrame.contextLView = null), t);
}
function ke() {
  let t = dh();
  for (; t !== null && t.type === 64;) t = t.parent;
  return t;
}
function dh() {
  return W.lFrame.currentTNode;
}
function $y() {
  let t = W.lFrame,
    e = t.currentTNode;
  return t.isParent ? e : e.parent;
}
function Ci(t, e) {
  let n = W.lFrame;
  ((n.currentTNode = t), (n.isParent = e));
}
function fh() {
  return W.lFrame.isParent;
}
function hh() {
  W.lFrame.isParent = !1;
}
function ph() {
  return W.lFrame.contextLView;
}
function gh() {
  return Pf;
}
function Bs(t) {
  let e = Pf;
  return ((Pf = t), e);
}
function wi() {
  let t = W.lFrame,
    e = t.bindingRootIndex;
  return (e === -1 && (e = t.bindingRootIndex = t.tView.bindingStartIndex), e);
}
function mh() {
  return W.lFrame.bindingIndex;
}
function Gy(t) {
  return (W.lFrame.bindingIndex = t);
}
function Mr() {
  return W.lFrame.bindingIndex++;
}
function ea(t) {
  let e = W.lFrame,
    n = e.bindingIndex;
  return ((e.bindingIndex = e.bindingIndex + t), n);
}
function zy() {
  return W.lFrame.inI18n;
}
function Wy(t, e) {
  let n = W.lFrame;
  ((n.bindingIndex = n.bindingRootIndex = t), Ru(e));
}
function qy() {
  return W.lFrame.currentDirectiveIndex;
}
function Ru(t) {
  W.lFrame.currentDirectiveIndex = t;
}
function Yy(t) {
  let e = W.lFrame.currentDirectiveIndex;
  return e === -1 ? null : t[e];
}
function Ou() {
  return W.lFrame.currentQueryIndex;
}
function ta(t) {
  W.lFrame.currentQueryIndex = t;
}
function ZT(t) {
  let e = t[O];
  return e.type === 2 ? e.declTNode : e.type === 1 ? t[rt] : null;
}
function vh(t, e, n) {
  if (n & 4) {
    let i = e,
      o = t;
    for (; (i = i.parent), i === null && !(n & 1);)
      if (((i = ZT(o)), i === null || ((o = o[Sr]), i.type & 10))) break;
    if (i === null) return !1;
    ((e = i), (t = o));
  }
  let r = (W.lFrame = Zy());
  return ((r.currentTNode = e), (r.lView = t), !0);
}
function ku(t) {
  let e = Zy(),
    n = t[O];
  ((W.lFrame = e),
    (e.currentTNode = n.firstChild),
    (e.lView = t),
    (e.tView = n),
    (e.contextLView = t),
    (e.bindingIndex = n.bindingStartIndex),
    (e.inI18n = !1));
}
function Zy() {
  let t = W.lFrame,
    e = t === null ? null : t.child;
  return e === null ? Ky(t) : e;
}
function Ky(t) {
  let e = {
    currentTNode: null,
    isParent: !0,
    lView: null,
    tView: null,
    selectedIndex: -1,
    contextLView: null,
    elementDepthCount: 0,
    currentNamespace: null,
    currentDirectiveIndex: -1,
    bindingRootIndex: -1,
    bindingIndex: -1,
    currentQueryIndex: 0,
    parent: t,
    child: null,
    inI18n: !1,
  };
  return (t !== null && (t.child = e), e);
}
function Qy() {
  let t = W.lFrame;
  return ((W.lFrame = t.parent), (t.currentTNode = null), (t.lView = null), t);
}
var yh = Qy;
function Pu() {
  let t = Qy();
  ((t.isParent = !0),
    (t.tView = null),
    (t.selectedIndex = -1),
    (t.contextLView = null),
    (t.elementDepthCount = 0),
    (t.currentDirectiveIndex = -1),
    (t.currentNamespace = null),
    (t.bindingRootIndex = -1),
    (t.bindingIndex = -1),
    (t.currentQueryIndex = 0));
}
function Xy(t) {
  return (W.lFrame.contextLView = Fy(t, W.lFrame.contextLView))[xe];
}
function At() {
  return W.lFrame.selectedIndex;
}
function Ar(t) {
  W.lFrame.selectedIndex = t;
}
function Ii() {
  let t = W.lFrame;
  return Tu(t.tView, t.selectedIndex);
}
function Jy() {
  W.lFrame.currentNamespace = wo;
}
function e_() {
  KT();
}
function KT() {
  W.lFrame.currentNamespace = null;
}
function _h() {
  return W.lFrame.currentNamespace;
}
var t_ = !0;
function Fu() {
  return t_;
}
function na(t) {
  t_ = t;
}
function ra() {
  let t, e;
  return {
    promise: new Promise((r, i) => {
      ((t = r), (e = i));
    }),
    resolve: t,
    reject: e,
  };
}
function Ff(t, e = null, n = null, r) {
  let i = Dh(t, e, n, r);
  return (i.resolveInjectorInitializers(), i);
}
function Dh(t, e = null, n = null, r, i = new Set()) {
  return new di([n || Bt, Sy(t)], e || bo(), null, i);
}
var He = class t {
  static THROW_IF_NOT_FOUND = ci;
  static NULL = new Co();
  static create(e, n) {
    if (Array.isArray(e)) return Ff({ name: `` }, n, e, ``);
    {
      let r = e.name ?? ``;
      return Ff({ name: r }, e.parent, e.providers, r);
    }
  }
  static ɵprov = q({ token: t, providedIn: `any`, factory: () => j(pi) });
  static __NG_ELEMENT_ID__ = -1;
};
var ie = new E(``);
var J = class {
  static __NG_ELEMENT_ID__ = QT;
  static __NG_ENV_ID__ = (e) => e;
};
var hu = class extends J {
  _lView;
  constructor(e) {
    (super(), (this._lView = e));
  }
  get destroyed() {
    return Di(this._lView);
  }
  onDestroy(e) {
    let n = this._lView;
    return (Nu(n, e), () => Ly(n, e));
  }
};
function QT() {
  return new hu(R());
}
var n_ = !1;
var r_ = new E(``);
var Kn = (() => {
  class t {
    taskId = 0;
    pendingTasks = new Set();
    destroyed = !1;
    pendingTask = new Ze(!1);
    debugTaskTracker = v(r_, { optional: !0 });
    get hasPendingTasks() {
      return this.destroyed ? !1 : this.pendingTask.value;
    }
    get hasPendingTasksObservable() {
      return this.destroyed
        ? new k((n) => {
            (n.next(!1), n.complete());
          })
        : this.pendingTask;
    }
    add() {
      !this.hasPendingTasks && !this.destroyed && this.pendingTask.next(!0);
      let n = this.taskId++;
      return (this.pendingTasks.add(n), this.debugTaskTracker?.add(n), n);
    }
    has(n) {
      return this.pendingTasks.has(n);
    }
    remove(n) {
      (this.pendingTasks.delete(n),
        this.debugTaskTracker?.remove(n),
        this.pendingTasks.size === 0 && this.hasPendingTasks && this.pendingTask.next(!1));
    }
    ngOnDestroy() {
      (this.pendingTasks.clear(),
        this.hasPendingTasks && this.pendingTask.next(!1),
        (this.destroyed = !0),
        this.pendingTask.unsubscribe());
    }
    static ɵprov = q({ token: t, providedIn: `root`, factory: () => new t() });
  }
  return t;
})();
var Lf = class extends ue {
  __isAsync;
  destroyRef = void 0;
  pendingTasks = void 0;
  constructor(e = !1) {
    (super(),
      (this.__isAsync = e),
      Ny() &&
        ((this.destroyRef = v(J, { optional: !0 }) ?? void 0),
        (this.pendingTasks = v(Kn, { optional: !0 }) ?? void 0)));
  }
  emit(e) {
    let n = P(null);
    try {
      super.next(e);
    } finally {
      P(n);
    }
  }
  subscribe(e, n, r) {
    let i = e,
      o = n || (() => null),
      s = r;
    if (e && typeof e == `object`) {
      let c = e;
      ((i = c.next?.bind(c)), (o = c.error?.bind(c)), (s = c.complete?.bind(c)));
    }
    this.__isAsync &&
      ((o = this.wrapInTimeout(o)),
      i && (i = this.wrapInTimeout(i)),
      s && (s = this.wrapInTimeout(s)));
    let a = super.subscribe({ next: i, error: o, complete: s });
    return (e instanceof Ne && e.add(a), a);
  }
  wrapInTimeout(e) {
    return (n) => {
      let r = this.pendingTasks?.add();
      setTimeout(() => {
        try {
          e(n);
        } finally {
          r !== void 0 && this.pendingTasks?.remove(r);
        }
      });
    };
  }
};
var Ue = Lf;
function pu(...t) {}
function Eh(t) {
  let e, n;
  function r() {
    t = pu;
    try {
      (n !== void 0 && typeof cancelAnimationFrame == `function` && cancelAnimationFrame(n),
        e !== void 0 && clearTimeout(e));
    } catch {}
  }
  return (
    (e = setTimeout(() => {
      (t(), r());
    })),
    typeof requestAnimationFrame == `function` &&
      (n = requestAnimationFrame(() => {
        (t(), r());
      })),
    () => r()
  );
}
function i_(t) {
  return (
    queueMicrotask(() => t()),
    () => {
      t = pu;
    }
  );
}
var Ch = `isAngularZone`;
var Hs = Ch + `_ID`;
var XT = 0;
var Se = class t {
  hasPendingMacrotasks = !1;
  hasPendingMicrotasks = !1;
  isStable = !0;
  onUnstable = new Ue(!1);
  onMicrotaskEmpty = new Ue(!1);
  onStable = new Ue(!1);
  onError = new Ue(!1);
  constructor(e) {
    let {
      enableLongStackTrace: n = !1,
      shouldCoalesceEventChangeDetection: r = !1,
      shouldCoalesceRunChangeDetection: i = !1,
      scheduleInRootZone: o = n_,
    } = e;
    if (typeof Zone > `u`) throw new I(908, !1);
    Zone.assertZonePatched();
    let s = this;
    ((s._nesting = 0),
      (s._outer = s._inner = Zone.current),
      Zone.TaskTrackingZoneSpec && (s._inner = s._inner.fork(new Zone.TaskTrackingZoneSpec())),
      n && Zone.longStackTraceZoneSpec && (s._inner = s._inner.fork(Zone.longStackTraceZoneSpec)),
      (s.shouldCoalesceEventChangeDetection = !i && r),
      (s.shouldCoalesceRunChangeDetection = i),
      (s.callbackScheduled = !1),
      (s.scheduleInRootZone = o),
      t0(s));
  }
  static isInAngularZone() {
    return typeof Zone < `u` && Zone.current.get(Ch) === !0;
  }
  static assertInAngularZone() {
    if (!t.isInAngularZone()) throw new I(909, !1);
  }
  static assertNotInAngularZone() {
    if (t.isInAngularZone()) throw new I(909, !1);
  }
  run(e, n, r) {
    return this._inner.run(e, n, r);
  }
  runTask(e, n, r, i) {
    let o = this._inner,
      s = o.scheduleEventTask(`NgZoneEvent: ` + i, e, JT, pu, pu);
    try {
      return o.runTask(s, n, r);
    } finally {
      o.cancelTask(s);
    }
  }
  runGuarded(e, n, r) {
    return this._inner.runGuarded(e, n, r);
  }
  runOutsideAngular(e) {
    return this._outer.run(e);
  }
};
var JT = {};
function wh(t) {
  if (t._nesting == 0 && !t.hasPendingMicrotasks && !t.isStable)
    try {
      (t._nesting++, t.onMicrotaskEmpty.emit(null));
    } finally {
      if ((t._nesting--, !t.hasPendingMicrotasks))
        try {
          t.runOutsideAngular(() => t.onStable.emit(null));
        } finally {
          t.isStable = !0;
        }
    }
}
function e0(t) {
  if (t.isCheckStableRunning || t.callbackScheduled) return;
  t.callbackScheduled = !0;
  function e() {
    Eh(() => {
      ((t.callbackScheduled = !1),
        Vf(t),
        (t.isCheckStableRunning = !0),
        wh(t),
        (t.isCheckStableRunning = !1));
    });
  }
  (t.scheduleInRootZone
    ? Zone.root.run(() => {
        e();
      })
    : t._outer.run(() => {
        e();
      }),
    Vf(t));
}
function t0(t) {
  let e = () => {
      e0(t);
    },
    n = XT++;
  t._inner = t._inner.fork({
    name: `angular`,
    properties: { [Ch]: !0, [Hs]: n, [Hs + n]: !0 },
    onInvokeTask: (r, i, o, s, a, c) => {
      if (n0(c)) return r.invokeTask(o, s, a, c);
      try {
        return (hy(t), r.invokeTask(o, s, a, c));
      } finally {
        (((t.shouldCoalesceEventChangeDetection && s.type === `eventTask`) ||
          t.shouldCoalesceRunChangeDetection) &&
          e(),
          py(t));
      }
    },
    onInvoke: (r, i, o, s, a, c, u) => {
      try {
        return (hy(t), r.invoke(o, s, a, c, u));
      } finally {
        (t.shouldCoalesceRunChangeDetection && !t.callbackScheduled && !r0(c) && e(), py(t));
      }
    },
    onHasTask: (r, i, o, s) => {
      (r.hasTask(o, s),
        i === o &&
          (s.change == `microTask`
            ? ((t._hasPendingMicrotasks = s.microTask), Vf(t), wh(t))
            : s.change == `macroTask` && (t.hasPendingMacrotasks = s.macroTask)));
    },
    onHandleError: (r, i, o, s) => (
      r.handleError(o, s),
      t.runOutsideAngular(() => t.onError.emit(s)),
      !1
    ),
  });
}
function Vf(t) {
  t._hasPendingMicrotasks ||
  ((t.shouldCoalesceEventChangeDetection || t.shouldCoalesceRunChangeDetection) &&
    t.callbackScheduled === !0)
    ? (t.hasPendingMicrotasks = !0)
    : (t.hasPendingMicrotasks = !1);
}
function hy(t) {
  (t._nesting++, t.isStable && ((t.isStable = !1), t.onUnstable.emit(null)));
}
function py(t) {
  (t._nesting--, wh(t));
}
var $s = class {
  hasPendingMicrotasks = !1;
  hasPendingMacrotasks = !1;
  isStable = !0;
  onUnstable = new Ue();
  onMicrotaskEmpty = new Ue();
  onStable = new Ue();
  onError = new Ue();
  run(e, n, r) {
    return e.apply(n, r);
  }
  runGuarded(e, n, r) {
    return e.apply(n, r);
  }
  runOutsideAngular(e) {
    return e();
  }
  runTask(e, n, r, i) {
    return e.apply(n, r);
  }
};
function n0(t) {
  return o_(t, `__ignore_ng_zone__`);
}
function r0(t) {
  return o_(t, `__scheduler_tick__`);
}
function o_(t, e) {
  return !Array.isArray(t) || t.length !== 1 ? !1 : t[0]?.data?.[e] === !0;
}
var Ht = class {
  _console = console;
  handleError(e) {
    this._console.error(`ERROR`, e);
  }
};
var _t = new E(``, {
  factory: () => {
    let t = v(Se),
      e = v(ve),
      n;
    return (r) => {
      t.runOutsideAngular(() => {
        e.destroyed && !n
          ? setTimeout(() => {
              throw r;
            })
          : ((n ??= e.get(Ht)), n.handleError(r));
      });
    };
  },
});
var s_ = {
  provide: hi,
  useValue: () => {
    v(Ht, { optional: !0 });
  },
  multi: !0,
};
var i0 = new E(``, {
  factory: () => {
    let t = v(ie).defaultView;
    if (!t) return;
    let e = v(_t),
      n = (o) => {
        (e(o.reason), o.preventDefault());
      },
      r = (o) => {
        (o.error ? e(o.error) : e(new Error(o.message, { cause: o })), o.preventDefault());
      },
      i = () => {
        (t.addEventListener(`unhandledrejection`, n), t.addEventListener(`error`, r));
      };
    (typeof Zone < `u` ? Zone.root.run(i) : i(),
      v(J).onDestroy(() => {
        (t.removeEventListener(`error`, r), t.removeEventListener(`unhandledrejection`, n));
      }));
  },
});
function o0() {
  return sn([
    by(() => {
      v(i0);
    }),
  ]);
}
function H(t, e) {
  let [n, r, i] = Df(t, e?.equal),
    o = n;
  o[le];
  return ((o.set = r), (o.update = i), (o.asReadonly = xo.bind(o)), o);
}
function xo() {
  let t = this[le];
  if (t.readonlyFn === void 0) {
    let e = () => this();
    ((e[le] = t), (t.readonlyFn = e));
  }
  return t.readonlyFn;
}
var Ro = new E(``, { factory: () => s0 });
var s0 = `ng`;
var Lu = new E(``);
var bi = new E(``, { providedIn: `platform`, factory: () => `unknown` });
var ia = new E(``, {
  factory: () => v(ie).body?.querySelector(`[ngCspNonce]`)?.getAttribute(`ngCspNonce`) || null,
});
var Vu = (() => {
  class t {
    static ɵprov = q({
      token: t,
      providedIn: `root`,
      factory: () => {
        let n = new t();
        return ((n.store = a_(v(ie), v(Ro))), n);
      },
    });
    store = {};
    onSerializeCallbacks = {};
    get(n, r) {
      return this.store[n] !== void 0 ? this.store[n] : r;
    }
    set(n, r) {
      this.store[n] = r;
    }
    remove(n) {
      delete this.store[n];
    }
    hasKey(n) {
      return this.store.hasOwnProperty(n);
    }
    get isEmpty() {
      return Object.keys(this.store).length === 0;
    }
    onSerialize(n, r) {
      this.onSerializeCallbacks[n] = r;
    }
    toJson() {
      for (let n in this.onSerializeCallbacks)
        if (this.onSerializeCallbacks.hasOwnProperty(n))
          try {
            this.store[n] = this.onSerializeCallbacks[n]();
          } catch (r) {
            console.warn(`Exception in onSerialize callback: `, r);
          }
      return JSON.stringify(this.store).replace(/</g, `\\u003C`).replace(/\//g, `\\u002F`);
    }
  }
  return t;
})();
function a_(t, e) {
  let n = t.getElementById(e + `-state`);
  if (n?.tagName === `SCRIPT` && n.textContent)
    try {
      return JSON.parse(n.textContent);
    } catch (r) {
      console.warn(`Exception while restoring TransferState for app ` + e, r);
    }
  return {};
}
var Oo = (() => {
  class t {
    view;
    node;
    constructor(n, r) {
      ((this.view = n), (this.node = r));
    }
    static __NG_ELEMENT_ID__ = a0;
  }
  return t;
})();
function a0() {
  return new Oo(R(), ke());
}
var Dn = class {};
var oa = new E(``, { factory: () => !0 });
var Ih = new E(``);
var ju = (() => {
  class t {
    static ɵprov = q({ token: t, providedIn: `root`, factory: () => new jf() });
  }
  return t;
})();
var jf = class {
  dirtyEffectCount = 0;
  queues = new Map();
  add(e) {
    (this.enqueue(e), this.schedule(e));
  }
  schedule(e) {
    e.dirty && this.dirtyEffectCount++;
  }
  remove(e) {
    let n = e.zone,
      r = this.queues.get(n);
    r.has(e) && (r.delete(e), e.dirty && this.dirtyEffectCount--);
  }
  enqueue(e) {
    let n = e.zone;
    this.queues.has(n) || this.queues.set(n, new Set());
    let r = this.queues.get(n);
    r.has(e) || r.add(e);
  }
  flush() {
    for (; this.dirtyEffectCount > 0;) {
      let e = !1;
      for (let [n, r] of this.queues)
        n === null ? (e ||= this.flushQueue(r)) : (e ||= n.run(() => this.flushQueue(r)));
      e || (this.dirtyEffectCount = 0);
    }
  }
  flushQueue(e) {
    let n = !1;
    for (let r of e) r.dirty && (this.dirtyEffectCount--, (n = !0), r.run());
    return n;
  }
};
var gu = class {
  [le];
  constructor(e) {
    this[le] = e;
  }
  destroy() {
    this[le].destroy();
  }
};
function Yt(t, e) {
  let n = e?.injector ?? v(He),
    r = e?.manualCleanup !== !0 ? n.get(J) : null,
    i,
    o = n.get(Oo, null, { optional: !0 }),
    s = n.get(Dn);
  return (
    o !== null
      ? ((i = l0(o.view, s, t)), r instanceof hu && r._lView === o.view && (r = null))
      : (i = d0(t, n.get(ju), s)),
    (i.injector = n),
    r !== null && (i.onDestroyFns = [r.onDestroy(() => i.destroy())]),
    new gu(i)
  );
}
var c_ = m(l({}, Ef), {
  cleanupFns: void 0,
  zone: null,
  onDestroyFns: null,
  run() {
    let t = Bs(!1);
    try {
      Cf(this);
    } finally {
      Bs(t);
    }
  },
  cleanup() {
    if (!this.cleanupFns?.length) return;
    let t = P(null);
    try {
      for (; this.cleanupFns.length;) this.cleanupFns.pop()();
    } finally {
      ((this.cleanupFns = []), P(t));
    }
  },
});
var c0 = m(l({}, c_), {
  consumerMarkedDirty() {
    (this.scheduler.schedule(this), this.notifier.notify(12));
  },
  destroy() {
    if ((Gn(this), this.onDestroyFns !== null)) for (let t of this.onDestroyFns) t();
    (this.cleanup(), this.scheduler.remove(this));
  },
});
var u0 = m(l({}, c_), {
  consumerMarkedDirty() {
    ((this.view[U] |= 8192), Ei(this.view), this.notifier.notify(13));
  },
  destroy() {
    if ((Gn(this), this.onDestroyFns !== null)) for (let t of this.onDestroyFns) t();
    (this.cleanup(), this.view[wr]?.delete(this));
  },
});
function l0(t, e, n) {
  let r = Object.create(u0);
  return (
    (r.view = t),
    (r.zone = typeof Zone < `u` ? Zone.current : null),
    (r.notifier = e),
    (r.fn = u_(r, n)),
    (t[wr] ??= new Set()),
    t[wr].add(r),
    r.consumerMarkedDirty(r),
    r
  );
}
function d0(t, e, n) {
  let r = Object.create(c0);
  return (
    (r.fn = u_(r, t)),
    (r.scheduler = e),
    (r.notifier = n),
    (r.zone = typeof Zone < `u` ? Zone.current : null),
    r.scheduler.add(r),
    r.notifier.notify(12),
    r
  );
}
function u_(t, e) {
  return () => {
    e((n) => (t.cleanupFns ??= []).push(n));
  };
}
function Zt(t) {
  return typeof t == `function` && t[le] !== void 0;
}
function Uu(t) {
  return Zt(t) && typeof t.set == `function`;
}
var Si = (() => {
  class t {
    internalPendingTasks = v(Kn);
    scheduler = v(Dn);
    errorHandler = v(_t);
    add() {
      let n = this.internalPendingTasks.add();
      return () => {
        this.internalPendingTasks.has(n) &&
          (this.scheduler.notify(11), this.internalPendingTasks.remove(n));
      };
    }
    run(n) {
      let r = this.add();
      try {
        n().catch(this.errorHandler).finally(r);
      } catch (i) {
        (this.errorHandler(i), r());
      }
    }
    static ɵprov = q({ token: t, providedIn: `root`, factory: () => new t() });
  }
  return t;
})();
function va(t) {
  return { toString: t }.toString();
}
var K = (function (t) {
  return (
    (t[(t.TemplateCreateStart = 0)] = `TemplateCreateStart`),
    (t[(t.TemplateCreateEnd = 1)] = `TemplateCreateEnd`),
    (t[(t.TemplateUpdateStart = 2)] = `TemplateUpdateStart`),
    (t[(t.TemplateUpdateEnd = 3)] = `TemplateUpdateEnd`),
    (t[(t.LifecycleHookStart = 4)] = `LifecycleHookStart`),
    (t[(t.LifecycleHookEnd = 5)] = `LifecycleHookEnd`),
    (t[(t.OutputStart = 6)] = `OutputStart`),
    (t[(t.OutputEnd = 7)] = `OutputEnd`),
    (t[(t.BootstrapApplicationStart = 8)] = `BootstrapApplicationStart`),
    (t[(t.BootstrapApplicationEnd = 9)] = `BootstrapApplicationEnd`),
    (t[(t.BootstrapComponentStart = 10)] = `BootstrapComponentStart`),
    (t[(t.BootstrapComponentEnd = 11)] = `BootstrapComponentEnd`),
    (t[(t.ChangeDetectionStart = 12)] = `ChangeDetectionStart`),
    (t[(t.ChangeDetectionEnd = 13)] = `ChangeDetectionEnd`),
    (t[(t.ChangeDetectionSyncStart = 14)] = `ChangeDetectionSyncStart`),
    (t[(t.ChangeDetectionSyncEnd = 15)] = `ChangeDetectionSyncEnd`),
    (t[(t.AfterRenderHooksStart = 16)] = `AfterRenderHooksStart`),
    (t[(t.AfterRenderHooksEnd = 17)] = `AfterRenderHooksEnd`),
    (t[(t.ComponentStart = 18)] = `ComponentStart`),
    (t[(t.ComponentEnd = 19)] = `ComponentEnd`),
    (t[(t.DeferBlockStateStart = 20)] = `DeferBlockStateStart`),
    (t[(t.DeferBlockStateEnd = 21)] = `DeferBlockStateEnd`),
    (t[(t.DynamicComponentStart = 22)] = `DynamicComponentStart`),
    (t[(t.DynamicComponentEnd = 23)] = `DynamicComponentEnd`),
    (t[(t.HostBindingsUpdateStart = 24)] = `HostBindingsUpdateStart`),
    (t[(t.HostBindingsUpdateEnd = 25)] = `HostBindingsUpdateEnd`),
    t
  );
})(K || {});
var Ku = class {
  previousValue;
  currentValue;
  firstChange;
  constructor(e, n, r) {
    ((this.previousValue = e), (this.currentValue = n), (this.firstChange = r));
  }
  isFirstChange() {
    return this.firstChange;
  }
};
function J_(t, e, n, r) {
  e !== null ? e.applyValueToInputSignal(e, r) : (t[n] = r);
}
var eD = null;
var Xn = (() => {
  eD = l_;
  let t = () => l_;
  return ((t.ngInherit = !0), t);
})();
function D0() {
  return eD;
}
function l_(t) {
  return (t.type.prototype.ngOnChanges && (t.setInput = C0), E0);
}
function E0() {
  let t = tD(this),
    e = t?.current;
  if (e) {
    let n = t.previous;
    if (n === br) t.previous = e;
    else for (let r in e) n[r] = e[r];
    ((t.current = null), this.ngOnChanges(e));
  }
}
function C0(t, e, n, r, i) {
  let o = this.declaredInputs[r],
    s = tD(t) || w0(t, { previous: br, current: null }),
    a = s.current || (s.current = {}),
    c = s.previous,
    u = c[o];
  ((a[o] = new Ku(u && u.currentValue, n, c === br)), J_(t, e, i, n));
}
var Fh = `__ngSimpleChanges__`;
function tD(t) {
  return (Object.hasOwn(t, Fh) && t[Fh]) || null;
}
function w0(t, e) {
  return (t[Fh] = e);
}
var d_ = [];
var ee = function (t, e = null, n) {
  for (let r = 0; r < d_.length; r++) {
    let i = d_[r];
    i(t, e, n);
  }
};
function I0(t, e, n) {
  let { ngOnChanges: r, ngOnInit: i, ngDoCheck: o } = e.type.prototype;
  if (r) {
    let s = D0()(e);
    ((n.preOrderHooks ??= []).push(t, s), (n.preOrderCheckHooks ??= []).push(t, s));
  }
  (i && (n.preOrderHooks ??= []).push(0 - t, i),
    o && ((n.preOrderHooks ??= []).push(t, o), (n.preOrderCheckHooks ??= []).push(t, o)));
}
function nD(t, e) {
  for (let n = e.directiveStart, r = e.directiveEnd; n < r; n++) {
    let {
      ngAfterContentInit: s,
      ngAfterContentChecked: a,
      ngAfterViewInit: c,
      ngAfterViewChecked: u,
      ngOnDestroy: l,
    } = t.data[n].type.prototype;
    (s && (t.contentHooks ??= []).push(-n, s),
      a && ((t.contentHooks ??= []).push(n, a), (t.contentCheckHooks ??= []).push(n, a)),
      c && (t.viewHooks ??= []).push(-n, c),
      u && ((t.viewHooks ??= []).push(n, u), (t.viewCheckHooks ??= []).push(n, u)),
      l != null && (t.destroyHooks ??= []).push(n, l));
  }
}
function Wu(t, e, n) {
  rD(t, e, 3, n);
}
function qu(t, e, n, r) {
  (t[U] & 3) === n && rD(t, e, n, r);
}
function bh(t, e) {
  let n = t[U];
  (n & 3) === e && ((n &= 16383), (n += 1), (t[U] = n));
}
function rD(t, e, n, r) {
  let i = r !== void 0 ? t[mi] & 65535 : 0,
    o = r ?? -1,
    s = e.length - 1,
    a = 0;
  for (let c = i; c < s; c++)
    if (typeof e[c + 1] == `number`) {
      if (((a = e[c]), r != null && a >= r)) break;
    } else
      (e[c] < 0 && (t[mi] += 65536),
        (a < o || o == -1) && (b0(t, n, e, c), (t[mi] = (t[mi] & 4294901760) + c + 2)),
        c++);
}
function f_(t, e) {
  ee(K.LifecycleHookStart, t, e);
  let n = P(null);
  try {
    e.call(t);
  } finally {
    (P(n), ee(K.LifecycleHookEnd, t, e));
  }
}
function b0(t, e, n, r) {
  let i = n[r] < 0,
    o = n[r + 1],
    a = t[i ? -n[r] : n[r]];
  i ? t[U] >> 14 < t[mi] >> 16 && (t[U] & 3) === e && ((t[U] += 16384), f_(a, o)) : f_(a, o);
}
var Po = -1;
var Ai = class {
  factory;
  name;
  injectImpl;
  resolving = !1;
  canSeeViewProviders;
  multi;
  componentProviders;
  index;
  providerFactory;
  constructor(e, n, r, i) {
    ((this.factory = e), (this.name = i), (this.canSeeViewProviders = n), (this.injectImpl = r));
  }
};
function S0(t) {
  return (t.flags & 8) !== 0;
}
function T0(t) {
  return (t.flags & 16) !== 0;
}
function M0(t, e, n) {
  let r = 0;
  for (; r < n.length;) {
    let i = n[r];
    if (typeof i == `number`) {
      if (i !== 0) break;
      r++;
      let o = n[r++],
        s = n[r++],
        a = n[r++];
      t.setAttribute(e, s, a, o);
    } else {
      let o = i,
        s = n[++r];
      (A0(o) ? t.setProperty(e, o, s) : t.setAttribute(e, o, s), r++);
    }
  }
  return r;
}
function iD(t) {
  return t === 3 || t === 4 || t === 6;
}
function A0(t) {
  return t.charCodeAt(0) === 64;
}
function Fo(t, e) {
  if (!(e === null || e.length === 0))
    if (t === null || t.length === 0) t = e.slice();
    else {
      let n = -1;
      for (let r = 0; r < e.length; r++) {
        let i = e[r];
        typeof i == `number`
          ? (n = i)
          : n === 0 || (n === -1 || n === 2 ? h_(t, n, i, null, e[++r]) : h_(t, n, i, null, null));
      }
    }
  return t;
}
function h_(t, e, n, r, i) {
  let o = 0,
    s = t.length;
  if (e === -1) s = -1;
  else
    for (; o < t.length;) {
      let a = t[o++];
      if (typeof a == `number`) {
        if (a === e) {
          s = -1;
          break;
        } else if (a > e) {
          s = o - 1;
          break;
        }
      }
    }
  for (; o < t.length;) {
    let a = t[o];
    if (typeof a == `number`) break;
    if (a === n) {
      i !== null && (t[o + 1] = i);
      return;
    }
    (o++, i !== null && o++);
  }
  (s !== -1 && (t.splice(s, 0, e), (o = s + 1)),
    t.splice(o++, 0, n),
    i !== null && t.splice(o++, 0, i));
}
function oD(t) {
  return t !== Po;
}
function Qu(t) {
  return t & 32767;
}
function N0(t) {
  return t >> 16;
}
function Xu(t, e) {
  let n = N0(t),
    r = e;
  for (; n > 0;) ((r = r[Sr]), n--);
  return r;
}
var Lh = !0;
function Ju(t) {
  let e = Lh;
  return ((Lh = t), e);
}
var sD = 255;
var aD = 5;
var R0 = 0;
var Tn = {};
function O0(t, e, n) {
  let r;
  (typeof n == `string` ? (r = n.charCodeAt(0) || 0) : n.hasOwnProperty(fi) && (r = n[fi]),
    (r ??= n[fi] = R0++));
  let i = r & sD,
    o = 1 << i;
  e.data[t + (i >> aD)] |= o;
}
function el(t, e) {
  let n = cD(t, e);
  if (n !== -1) return n;
  let r = e[O];
  r.firstCreatePass &&
    ((t.injectorIndex = e.length), Sh(r.data, t), Sh(e, null), Sh(r.blueprint, null));
  let i = hp(t, e),
    o = t.injectorIndex;
  if (oD(i)) {
    let s = Qu(i),
      a = Xu(i, e),
      c = a[O].data;
    for (let u = 0; u < 8; u++) e[o + u] = a[s + u] | c[s + u];
  }
  return ((e[o + 8] = i), o);
}
function Sh(t, e) {
  t.push(0, 0, 0, 0, 0, 0, 0, 0, e);
}
function cD(t, e) {
  return t.injectorIndex === -1 ||
    (t.parent && t.parent.injectorIndex === t.injectorIndex) ||
    e[t.injectorIndex + 8] === null
    ? -1
    : t.injectorIndex;
}
function hp(t, e) {
  if (t.parent && t.parent.injectorIndex !== -1) return t.parent.injectorIndex;
  let n = 0,
    r = null,
    i = e;
  for (; i !== null;) {
    if (((r = hD(i)), r === null)) return Po;
    if ((n++, (i = i[Sr]), r.injectorIndex !== -1)) return r.injectorIndex | (n << 16);
  }
  return Po;
}
function Vh(t, e, n) {
  O0(t, e, n);
}
function k0(t, e) {
  if (e === `class`) return t.classes;
  if (e === `style`) return t.styles;
  let n = t.attrs;
  if (n) {
    let r = n.length,
      i = 0;
    for (; i < r;) {
      let o = n[i];
      if (iD(o)) break;
      if (o === 0) i = i + 2;
      else if (typeof o == `number`) for (i++; i < r && typeof n[i] == `string`;) i++;
      else {
        if (o === e) return n[i + 1];
        i = i + 2;
      }
    }
  }
  return null;
}
function uD(t, e, n) {
  if (n & 8 || t !== void 0) return t;
  Eu(e, `NodeInjector`);
}
function lD(t, e, n, r) {
  if ((n & 8 && r === void 0 && (r = null), (n & 3) === 0)) {
    let i = t[wn],
      o = pt(void 0);
    try {
      return i ? i.get(e, r, n & 8) : Wf(e, r, n & 8);
    } finally {
      pt(o);
    }
  }
  return uD(r, e, n);
}
function dD(t, e, n, r = 0, i) {
  if (t !== null) {
    if (e[U] & 2048 && !(r & 2)) {
      let s = V0(t, e, n, r, Tn);
      if (s !== Tn) return s;
    }
    let o = fD(t, e, n, r, Tn);
    if (o !== Tn) return o;
  }
  return lD(e, n, r, i);
}
function fD(t, e, n, r, i) {
  let o = F0(n);
  if (typeof o == `function`) {
    if (!vh(e, t, r)) return r & 1 ? uD(i, n, r) : lD(e, n, r, i);
    try {
      let s;
      if (((s = o(r)), s == null && !(r & 8))) Eu(n);
      else return s;
    } finally {
      yh();
    }
  } else if (typeof o == `number`) {
    let s = null,
      a = cD(t, e),
      c = Po,
      u = r & 1 ? e[gt][rt] : null;
    for (
      (a === -1 || r & 4) &&
      ((c = a === -1 ? hp(t, e) : e[a + 8]),
      c === Po || !g_(r, !1) ? (a = -1) : ((s = e[O]), (a = Qu(c)), (e = Xu(c, e))));
      a !== -1;
    ) {
      let l = e[O];
      if (p_(o, a, l.data)) {
        let d = P0(a, e, n, s, r, u);
        if (d !== Tn) return d;
      }
      ((c = e[a + 8]),
        c !== Po && g_(r, e[O].data[a + 8] === u) && p_(o, a, e)
          ? ((s = l), (a = Qu(c)), (e = Xu(c, e)))
          : (a = -1));
    }
  }
  return i;
}
function P0(t, e, n, r, i, o) {
  let s = e[O],
    a = s.data[t + 8],
    l = Yu(a, s, n, r == null ? Zn(a) && Lh : r != s && (a.type & 3) !== 0, i & 1 && o === a);
  return l !== null ? la(e, s, l, a, i) : Tn;
}
function Yu(t, e, n, r, i) {
  let o = t.providerIndexes,
    s = e.data,
    a = o & 1048575,
    c = t.directiveStart,
    u = t.directiveEnd,
    l = o >> 20,
    d = r ? a : a + l,
    f = i ? a + l : u;
  for (let h = d; h < f; h++) {
    let g = s[h];
    if ((h < c && n === g) || (h >= c && g.type === n)) return h;
  }
  if (i) {
    let h = s[c];
    if (h && un(h) && h.type === n) return c;
  }
  return null;
}
function la(t, e, n, r, i) {
  let o = t[n],
    s = e.data;
  if (o instanceof Ai) {
    let a = o;
    if (a.resolving) throw zf(``);
    let c = Ju(a.canSeeViewProviders);
    a.resolving = !0;
    s[n].type || s[n];
    let d = a.injectImpl ? pt(a.injectImpl) : null;
    vh(t, r, 0);
    try {
      ((o = t[n] = a.factory(void 0, i, s, t, r)),
        e.firstCreatePass && n >= r.directiveStart && I0(n, s[n], e));
    } finally {
      (d !== null && pt(d), Ju(c), (a.resolving = !1), yh());
    }
  }
  return o;
}
function F0(t) {
  if (typeof t == `string`) return t.charCodeAt(0) || 0;
  let e = t.hasOwnProperty(fi) ? t[fi] : void 0;
  return typeof e == `number` ? (e >= 0 ? e & sD : L0) : e;
}
function p_(t, e, n) {
  let r = 1 << t;
  return !!(n[e + (t >> aD)] & r);
}
function g_(t, e) {
  return !(t & 2) && !(t & 1 && e);
}
var Nr = class {
  _tNode;
  _lView;
  constructor(e, n) {
    ((this._tNode = e), (this._lView = n));
  }
  get(e, n, r) {
    return dD(this._tNode, this._lView, e, ui(r), n);
  }
};
function L0() {
  return new Nr(ke(), R());
}
function ya(t) {
  return va(() => {
    let e = t.prototype.constructor,
      n = e[Us] || jh(e),
      r = Object.prototype,
      i = Object.getPrototypeOf(t.prototype).constructor;
    for (; i && i !== r;) {
      let o = i[Us] || jh(i);
      if (o && o !== n) return o;
      i = Object.getPrototypeOf(i);
    }
    return (o) => new o();
  });
}
function jh(t) {
  return Uf(t)
    ? () => {
        let e = jh(je(t));
        return e && e();
      }
    : Cr(t);
}
function V0(t, e, n, r, i) {
  let o = t,
    s = e;
  for (; o !== null && s !== null && s[U] & 2048 && !Ao(s);) {
    let a = fD(o, s, n, r | 2, Tn);
    if (a !== Tn) return a;
    let c = o.parent;
    if (!c) {
      let u = s[Jf];
      if (u) {
        let l = u.get(n, Tn, r & -5);
        if (l !== Tn) return l;
      }
      ((c = hD(s)), (s = s[Sr]));
    }
    o = c;
  }
  return i;
}
function hD(t) {
  let e = t[O],
    n = e.type;
  return n === 2 ? e.declTNode : n === 1 ? t[rt] : null;
}
function _a(t) {
  return k0(ke(), t);
}
var Bu = `__parameters__`;
function j0(t) {
  return function (...n) {
    if (t) {
      let r = t(...n);
      for (let i in r) this[i] = r[i];
    }
  };
}
function pp(t, e, n) {
  return va(() => {
    let r = j0(e);
    function i(...o) {
      if (this instanceof i) return (r.apply(this, o), this);
      let s = new i(...o);
      return ((a.annotation = s), a);
      function a(c, u, l) {
        let d = c.hasOwnProperty(Bu) ? c[Bu] : Object.defineProperty(c, Bu, { value: [] })[Bu];
        for (; d.length <= l;) d.push(null);
        return ((d[l] = d[l] || []).push(s), c);
      }
    }
    return ((i.prototype.ngMetadataName = t), (i.annotationCls = i), i);
  });
}
function pe(t) {
  return {
    token: t.token,
    providedIn: t.autoProvided === !1 ? null : `root`,
    factory: t.factory,
    value: void 0,
  };
}
var U0 = Cu(pp(`Optional`), 8);
var B0 = Cu(pp(`Self`), 2);
var H0 = Cu(pp(`SkipSelf`), 4);
function $0() {
  return $o(ke(), R());
}
function $o(t, e) {
  return new it(Mt(t, e));
}
var it = (() => {
  class t {
    nativeElement;
    constructor(n) {
      this.nativeElement = n;
    }
    static __NG_ELEMENT_ID__ = $0;
  }
  return t;
})();
function pD(t) {
  return t instanceof it ? t.nativeElement : t;
}
function G0() {
  return this._results[Symbol.iterator]();
}
var tl = class {
  _emitDistinctChangesOnly;
  dirty = !0;
  _onDirty = void 0;
  _results = [];
  _changesDetected = !1;
  _changes = void 0;
  length = 0;
  first = void 0;
  last = void 0;
  get changes() {
    return (this._changes ??= new ue());
  }
  constructor(e = !1) {
    this._emitDistinctChangesOnly = e;
  }
  get(e) {
    return this._results[e];
  }
  map(e) {
    return this._results.map(e);
  }
  filter(e) {
    return this._results.filter(e);
  }
  find(e) {
    return this._results.find(e);
  }
  reduce(e, n) {
    return this._results.reduce(e, n);
  }
  forEach(e) {
    this._results.forEach(e);
  }
  some(e) {
    return this._results.some(e);
  }
  toArray() {
    return this._results.slice();
  }
  toString() {
    return this._results.toString();
  }
  reset(e, n) {
    this.dirty = !1;
    let r = Cy(e);
    (this._changesDetected = !Ey(this._results, r, n)) &&
      ((this._results = r),
      (this.length = r.length),
      (this.last = r[this.length - 1]),
      (this.first = r[0]));
  }
  notifyOnChanges() {
    this._changes !== void 0 &&
      (this._changesDetected || !this._emitDistinctChangesOnly) &&
      this._changes.next(this);
  }
  onDirty(e) {
    this._onDirty = e;
  }
  setDirty() {
    ((this.dirty = !0), this._onDirty?.());
  }
  destroy() {
    this._changes !== void 0 && (this._changes.complete(), this._changes.unsubscribe());
  }
  [Symbol.iterator] = G0;
};
function gD(t) {
  return (t.flags & 128) === 128;
}
var gp = (function (t) {
  return (
    (t[(t.OnPush = 0)] = `OnPush`),
    (t[(t.Eager = 1)] = `Eager`),
    (t[(t.Default = 1)] = `Default`),
    t
  );
})(gp || {});
var mD = new Map();
var z0 = 0;
function W0() {
  return z0++;
}
function q0(t) {
  mD.set(t[bn], t);
}
function Uh(t) {
  mD.delete(t[bn]);
}
var m_ = `__ngContext__`;
function Lo(t, e) {
  Yn(e) ? ((t[m_] = e[bn]), q0(e)) : (t[m_] = e);
}
function vD(t) {
  return _D(t[To]);
}
function yD(t) {
  return _D(t[Gt]);
}
function _D(t) {
  for (; t !== null && !zt(t);) t = t[Gt];
  return t;
}
var Bh;
function mp(t) {
  Bh = t;
}
function vp() {
  if (Bh !== void 0) return Bh;
  if (typeof document < `u`) return document;
  throw new I(210, !1);
}
var DD = `r`;
var ED = `di`;
var CD = !1;
var wD = new E(``, { factory: () => CD });
var v_ = new WeakMap();
function Y0(t, e) {
  if (t == null || typeof t != `object`) return;
  let n = v_.get(t);
  (n || ((n = new WeakSet()), v_.set(t, n)), n.add(e));
}
function ml(t) {
  return (t.flags & 32) === 32;
}
var Q0 = () => null;
function ID(t, e, n = !1) {
  return Q0(t, e, n);
}
function bD(t, e) {
  let n = t.contentQueries;
  if (n !== null) {
    let r = P(null);
    try {
      for (let i = 0; i < n.length; i += 2) {
        let o = n[i],
          s = n[i + 1];
        if (s !== -1) {
          let a = t.data[s];
          (ta(o), a.contentQueries(2, e[s], s));
        }
      }
    } finally {
      P(r);
    }
  }
}
function Hh(t, e, n) {
  ta(0);
  let r = P(null);
  try {
    e(t, n);
  } finally {
    P(r);
  }
}
function yp(t, e, n) {
  if (th(e)) {
    let r = P(null);
    try {
      let i = e.directiveStart,
        o = e.directiveEnd;
      for (let s = i; s < o; s++) {
        let a = t.data[s];
        if (a.contentQueries) {
          let c = n[s];
          a.contentQueries(1, c, s);
        }
      }
    } finally {
      P(r);
    }
  }
}
var dn = (function (t) {
  return (
    (t[(t.Emulated = 0)] = `Emulated`),
    (t[(t.None = 2)] = `None`),
    (t[(t.ShadowDom = 3)] = `ShadowDom`),
    (t[(t.ExperimentalIsolatedShadowDom = 4)] = `ExperimentalIsolatedShadowDom`),
    t
  );
})(dn || {});
var X0 = { 'http://www.w3.org/2000/svg': wo, 'http://www.w3.org/1998/Math/MathML': Su };
var Hu;
function J0() {
  if (Hu === void 0 && ((Hu = null), $t.trustedTypes))
    try {
      Hu = $t.trustedTypes.createPolicy(`angular`, {
        createHTML: (t) => t,
        createScript: (t) => t,
        createScriptURL: (t) => t,
      });
    } catch {}
  return Hu;
}
function vl(t) {
  return J0()?.createHTML(t) || t;
}
var $u;
function SD() {
  if ($u === void 0 && (($u = null), $t.trustedTypes))
    try {
      $u = $t.trustedTypes.createPolicy(`angular#unsafe-bypass`, {
        createHTML: (t) => t,
        createScript: (t) => t,
        createScriptURL: (t) => t,
      });
    } catch {}
  return $u;
}
function y_(t) {
  return SD()?.createHTML(t) || t;
}
function __(t) {
  return SD()?.createScriptURL(t) || t;
}
var nl = class {
  changingThisBreaksApplicationSecurity;
  constructor(e) {
    this.changingThisBreaksApplicationSecurity = e;
  }
  toString() {
    return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${mu})`;
  }
};
function Qn(t) {
  return t instanceof nl ? t.changingThisBreaksApplicationSecurity : t;
}
function Da(t, e) {
  let n = TD(t);
  if (n != null && n !== e) {
    if (n === `ResourceURL` && e === `URL`) return !0;
    throw new Error(`Required a safe ${e}, got a ${n} (see ${mu})`);
  }
  return n === e;
}
function TD(t) {
  return (t instanceof nl && t.getTypeName()) || null;
}
function eM(t) {
  let e = new Gh(t);
  return tM() ? new $h(e) : e;
}
var $h = class {
  inertDocumentHelper;
  constructor(e) {
    this.inertDocumentHelper = e;
  }
  getInertBodyElement(e) {
    e = `<body><remove></remove>` + e;
    try {
      let n = new window.DOMParser().parseFromString(vl(e), `text/html`).body;
      return n === null
        ? this.inertDocumentHelper.getInertBodyElement(e)
        : (n.firstChild?.remove(), n);
    } catch {
      return null;
    }
  }
};
var Gh = class {
  defaultDoc;
  inertDocument;
  constructor(e) {
    ((this.defaultDoc = e),
      (this.inertDocument =
        this.defaultDoc.implementation.createHTMLDocument(`sanitization-inert`)));
  }
  getInertBodyElement(e) {
    let n = this.inertDocument.createElement(`template`);
    return ((n.innerHTML = vl(e)), n);
  }
};
function tM() {
  try {
    return !!new window.DOMParser().parseFromString(vl(``), `text/html`);
  } catch {
    return !1;
  }
}
var nM = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;
function yl(t) {
  return ((t = String(t)), t.match(nM) ? t : `unsafe:` + t);
}
function Jn(t) {
  let e = {};
  for (let n of t.split(`,`)) e[n] = !0;
  return e;
}
function Ea(...t) {
  let e = {};
  for (let n of t) for (let r in n) n.hasOwnProperty(r) && (e[r] = !0);
  return e;
}
var MD = Jn(`area,br,col,hr,img,wbr`);
var AD = Jn(`colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr`);
var ND = Jn(`rp,rt`);
var rM = Ea(ND, AD);
var D_ = Ea(
  MD,
  Ea(
    AD,
    Jn(
      `address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul`,
    ),
  ),
  Ea(
    ND,
    Jn(
      `a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video`,
    ),
  ),
  rM,
);
var xD = Jn(`background,cite,href,itemtype,longdesc,poster,src,xlink:href`);
var cM = Ea(
  xD,
  Jn(
    `abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,srcset,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width`,
  ),
  Jn(
    `aria-activedescendant,aria-atomic,aria-autocomplete,aria-busy,aria-checked,aria-colcount,aria-colindex,aria-colspan,aria-controls,aria-current,aria-describedby,aria-details,aria-disabled,aria-dropeffect,aria-errormessage,aria-expanded,aria-flowto,aria-grabbed,aria-haspopup,aria-hidden,aria-invalid,aria-keyshortcuts,aria-label,aria-labelledby,aria-level,aria-live,aria-modal,aria-multiline,aria-multiselectable,aria-orientation,aria-owns,aria-placeholder,aria-posinset,aria-pressed,aria-readonly,aria-relevant,aria-required,aria-roledescription,aria-rowcount,aria-rowindex,aria-rowspan,aria-selected,aria-setsize,aria-sort,aria-valuemax,aria-valuemin,aria-valuenow,aria-valuetext`,
  ),
);
var uM = Jn(`script,style,template`);
var zh = class {
  sanitizedSomething = !1;
  buf = [];
  sanitizeChildren(e) {
    let n = e.firstChild,
      r = !0,
      i = [];
    for (; n;) {
      if (
        (n.nodeType === Node.ELEMENT_NODE
          ? (r = this.startElement(n))
          : n.nodeType === Node.TEXT_NODE
            ? this.chars(n.nodeValue)
            : (this.sanitizedSomething = !0),
        r && n.firstChild)
      ) {
        (i.push(n), (n = fM(n)));
        continue;
      }
      for (; n;) {
        n.nodeType === Node.ELEMENT_NODE && this.endElement(n);
        let o = dM(n);
        if (o) {
          n = o;
          break;
        }
        n = i.pop();
      }
    }
    return this.buf.join(``);
  }
  startElement(e) {
    let n = E_(e).toLowerCase();
    if (!D_.hasOwnProperty(n)) return ((this.sanitizedSomething = !0), !uM.hasOwnProperty(n));
    (this.buf.push(`<`), this.buf.push(n));
    let r = e.attributes;
    for (let i = 0; i < r.length; i++) {
      let o = r.item(i),
        s = o.name,
        a = s.toLowerCase();
      if (!cM.hasOwnProperty(a)) {
        this.sanitizedSomething = !0;
        continue;
      }
      let c = o.value;
      (xD[a] && (c = yl(c)), this.buf.push(` `, s, `="`, C_(c), `"`));
    }
    return (this.buf.push(`>`), !0);
  }
  endElement(e) {
    let n = E_(e).toLowerCase();
    D_.hasOwnProperty(n) &&
      !MD.hasOwnProperty(n) &&
      (this.buf.push(`</`), this.buf.push(n), this.buf.push(`>`));
  }
  chars(e) {
    this.buf.push(C_(e));
  }
};
function lM(t, e) {
  return (
    (t.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_CONTAINED_BY) !==
    Node.DOCUMENT_POSITION_CONTAINED_BY
  );
}
function dM(t) {
  let e = t.nextSibling;
  if (e && t !== e.previousSibling) throw RD(e);
  return e;
}
function fM(t) {
  let e = t.firstChild;
  if (e && lM(t, e)) throw RD(e);
  return e;
}
function E_(t) {
  let e = t.nodeName;
  return typeof e == `string` ? e : `FORM`;
}
function RD(t) {
  return new Error(`Failed to sanitize html because the element is clobbered: ${t.outerHTML}`);
}
var hM = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var pM = /([^\#-~ |!])/g;
function C_(t) {
  return t
    .replace(/&/g, `&amp;`)
    .replace(hM, function (e) {
      let n = e.charCodeAt(0),
        r = e.charCodeAt(1);
      return `&#` + ((n - 55296) * 1024 + (r - 56320) + 65536) + `;`;
    })
    .replace(pM, function (e) {
      return `&#` + e.charCodeAt(0) + `;`;
    })
    .replace(/</g, `&lt;`)
    .replace(/>/g, `&gt;`);
}
var Gu;
function _p(t, e) {
  let n = null;
  try {
    Gu = Gu || eM(t);
    let r = e ? String(e) : ``;
    n = Gu.getInertBodyElement(r);
    let i = 5,
      o = r;
    do {
      if (i === 0) throw new Error(`Failed to sanitize html because the input is unstable`);
      (i--, (r = o), (o = n.innerHTML), (n = Gu.getInertBodyElement(r)));
    } while (r !== o);
    return vl(new zh().sanitizeChildren(w_(n) || n));
  } finally {
    if (n) {
      let r = w_(n) || n;
      for (; r.firstChild;) r.firstChild.remove();
    }
  }
}
function w_(t) {
  return `content` in t && gM(t) ? t.content : null;
}
function gM(t) {
  return t.nodeType === Node.ELEMENT_NODE && t.nodeName === `TEMPLATE`;
}
var mM = /^>|^->|<!--|-->|--!>|<!-$/g;
var vM = /(<|>)/g;
var yM = `​$1​`;
function _M(t) {
  return t.replace(mM, (e) => e.replace(vM, yM));
}
function DM(t, e) {
  return t.createText(e);
}
function EM(t, e, n) {
  t.setValue(e, n);
}
function CM(t, e) {
  return t.createComment(_M(e));
}
function OD(t, e, n) {
  return t.createElement(e, n);
}
function Ti(t, e, n, r, i) {
  t.insertBefore(e, n, r, i);
}
function kD(t, e, n) {
  t.appendChild(e, n);
}
function I_(t, e, n, r, i) {
  r !== null ? Ti(t, e, n, r, i) : kD(t, e, n);
}
function PD(t, e, n, r) {
  t.removeChild(null, e, n, r);
}
function wM(t, e, n) {
  t.setAttribute(e, `style`, n);
}
function IM(t, e, n) {
  n === `` ? t.removeAttribute(e, `class`) : t.setAttribute(e, `class`, n);
}
function FD(t, e, n) {
  let { mergedAttrs: r, classes: i, styles: o } = n;
  (r !== null && M0(t, e, r), i !== null && IM(t, e, i), o !== null && wM(t, e, o));
}
function bM(t, e = !0) {
  if (t[0] != `:`) return [null, t];
  let n = t.indexOf(`:`, 1);
  if (n === -1) {
    if (e) throw new Error(`Unsupported format "${t}" expecting ":namespace:name"`);
    return [null, t];
  }
  return [t.slice(1, n), t.slice(n + 1)];
}
function SM(t, e, n) {
  if (e !== void 0 && n !== void 0 && jD(e, n) !== Oe.HTML) return t;
  let r = Ep();
  return r ? y_(r.sanitize(Oe.HTML, t) || ``) : Da(t, `HTML`) ? y_(Qn(t)) : _p(vp(), Cn(t));
}
function LD(t) {
  let e = Ep();
  return e ? e.sanitize(Oe.URL, t) || `` : Da(t, `URL`) ? Qn(t) : yl(Cn(t));
}
function VD(t) {
  let e = Ep();
  if (e) return __(e.sanitize(Oe.RESOURCE_URL, t) || ``);
  if (Da(t, `ResourceURL`)) return __(Qn(t));
  throw new I(904, !1);
}
function TM(t, e) {
  switch (jD(t, e)) {
    case Oe.RESOURCE_URL:
      return VD;
    case Oe.URL:
      return LD;
    default:
      return null;
  }
}
function Dp(t, e, n) {
  return TM(e, n)?.(t) ?? t;
}
function Ep() {
  let t = R();
  return t && t[cn].sanitizer;
}
function jD(t, e) {
  let [n, r] = MM(t);
  return Oy(r, e, n);
}
function MM(t) {
  t = t.toLowerCase();
  let e = bM(t, !1);
  if (e[0]) return e;
  let r = At() === -1 ? null : Ii(),
    i = r?.namespace;
  if (t === `#host` && r?.type === 2) {
    let o = Mt(r, R());
    if ((o.tagName && (t = o.tagName.toLowerCase()), i == null)) {
      let s = o.namespaceURI;
      i = s && X0[s];
    }
  }
  return [i, t];
}
function AM(t) {
  return t.ownerDocument.defaultView;
}
function NM(t) {
  return t.ownerDocument;
}
function xM(t) {
  return t instanceof Function ? t() : t;
}
function RM(t, e, n) {
  let r = t.length;
  for (;;) {
    let i = t.indexOf(e, n);
    if (i === -1) return i;
    if (i === 0 || t.charCodeAt(i - 1) <= 32) {
      let o = e.length;
      if (i + o === r || t.charCodeAt(i + o) <= 32) return i;
    }
    n = i + 1;
  }
}
var UD = `ng-template`;
function OM(t, e, n, r) {
  let i = 0;
  if (r) {
    for (; i < e.length && typeof e[i] == `string`; i += 2)
      if (e[i] === `class` && RM(e[i + 1].toLowerCase(), n, 0) !== -1) return !0;
  } else if (Cp(t)) return !1;
  if (((i = e.indexOf(1, i)), i > -1)) {
    let o;
    for (; ++i < e.length && typeof (o = e[i]) == `string`;) if (o.toLowerCase() === n) return !0;
  }
  return !1;
}
function Cp(t) {
  return t.type === 4 && t.value !== UD;
}
function kM(t, e, n) {
  return e === (t.type === 4 && !n ? UD : t.value);
}
function PM(t, e, n) {
  let r = 4,
    i = t.attrs,
    o = i !== null ? VM(i) : 0,
    s = !1;
  for (let a = 0; a < e.length; a++) {
    let c = e[a];
    if (typeof c == `number`) {
      if (!s && !ln(r) && !ln(c)) return !1;
      if (s && ln(c)) continue;
      ((s = !1), (r = c | (r & 1)));
      continue;
    }
    if (!s)
      if (r & 4) {
        if (((r = 2 | (r & 1)), (c !== `` && !kM(t, c, n)) || (c === `` && e.length === 1))) {
          if (ln(r)) return !1;
          s = !0;
        }
      } else if (r & 8) {
        if (i === null || !OM(t, i, c, n)) {
          if (ln(r)) return !1;
          s = !0;
        }
      } else {
        let u = e[++a],
          l = FM(c, i, Cp(t), n);
        if (l === -1) {
          if (ln(r)) return !1;
          s = !0;
          continue;
        }
        if (u !== ``) {
          let d;
          if ((l > o ? (d = ``) : (d = i[l + 1].toLowerCase()), r & 2 && u !== d)) {
            if (ln(r)) return !1;
            s = !0;
          }
        }
      }
  }
  return ln(r) || s;
}
function ln(t) {
  return (t & 1) === 0;
}
function FM(t, e, n, r) {
  if (e === null) return -1;
  let i = 0;
  if (r || !n) {
    let o = !1;
    for (; i < e.length;) {
      let s = e[i];
      if (s === t) return i;
      if (s === 3 || s === 6) o = !0;
      else if (s === 1 || s === 2) {
        let a = e[++i];
        for (; typeof a == `string`;) a = e[++i];
        continue;
      } else {
        if (s === 4) break;
        if (s === 0) {
          i += 4;
          continue;
        }
      }
      i += o ? 1 : 2;
    }
    return -1;
  } else return jM(e, t);
}
function BD(t, e, n = !1) {
  for (let r = 0; r < e.length; r++) if (PM(t, e[r], n)) return !0;
  return !1;
}
function LM(t) {
  let e = t.attrs;
  if (e != null) {
    let n = e.indexOf(5);
    if ((n & 1) === 0) return e[n + 1];
  }
  return null;
}
function VM(t) {
  for (let e = 0; e < t.length; e++) {
    let n = t[e];
    if (iD(n)) return e;
  }
  return t.length;
}
function jM(t, e) {
  let n = t.indexOf(4);
  if (n > -1)
    for (n++; n < t.length;) {
      let r = t[n];
      if (typeof r == `number`) return -1;
      if (r === e) return n;
      n++;
    }
  return -1;
}
function UM(t, e) {
  e: for (let n = 0; n < e.length; n++) {
    let r = e[n];
    if (t.length === r.length) {
      for (let i = 0; i < t.length; i++) if (t[i] !== r[i]) continue e;
      return !0;
    }
  }
  return !1;
}
function b_(t, e) {
  return t ? `:not(` + e.trim() + `)` : e;
}
function BM(t) {
  let e = t[0],
    n = 1,
    r = 2,
    i = ``,
    o = !1;
  for (; n < t.length;) {
    let s = t[n];
    if (typeof s == `string`)
      if (r & 2) {
        let a = t[++n];
        i += `[` + s + (a.length > 0 ? `="` + a + `"` : ``) + `]`;
      } else r & 8 ? (i += `.` + s) : r & 4 && (i += ` ` + s);
    else (i !== `` && !ln(s) && ((e += b_(o, i)), (i = ``)), (r = s), (o = o || !ln(r)));
    n++;
  }
  return (i !== `` && (e += b_(o, i)), e);
}
function HM(t) {
  return t.map(BM).join(`,`);
}
function $M(t) {
  let e = [],
    n = [],
    r = 1,
    i = 2;
  for (; r < t.length;) {
    let o = t[r];
    if (typeof o == `string`) i === 2 ? o !== `` && e.push(o, t[++r]) : i === 8 && n.push(o);
    else {
      if (!ln(i)) break;
      i = o;
    }
    r++;
  }
  return (n.length && e.push(1, ...n), e);
}
var Qe = {};
var Mn = (function (t) {
  return ((t[(t.Important = 1)] = `Important`), (t[(t.DashCase = 2)] = `DashCase`), t);
})(Mn || {});
var GM;
function wp(t, e) {
  return GM(t, e);
}
var xr = new Set();
typeof document < `u` && document?.documentElement?.getAnimations;
var Wh = new WeakMap();
function HD(t) {
  return t ? (t[Sr] ?? t) : null;
}
var aa = new WeakSet();
function zM(t, e, n) {
  let r = Wh.get(t);
  if (!r || r.length === 0) return;
  let i = e.parentNode,
    o = e.previousSibling,
    s = HD(n);
  for (let a = r.length - 1; a >= 0; a--) {
    let { el: c, declarationView: u } = r[a],
      l = c.parentNode;
    c === e
      ? (r.splice(a, 1),
        aa.add(c),
        c.dispatchEvent(new CustomEvent(`animationend`, { detail: { cancel: !0 } })))
      : o && c === o
        ? (r.splice(a, 1),
          c.dispatchEvent(new CustomEvent(`animationend`, { detail: { cancel: !0 } })),
          c.parentNode?.removeChild(c))
        : l &&
          i &&
          l !== i &&
          (s === null || u === null || s === u) &&
          (r.splice(a, 1),
          c.dispatchEvent(new CustomEvent(`animationend`, { detail: { cancel: !0 } })),
          c.parentNode?.removeChild(c));
  }
}
function WM(t, e, n) {
  let r = HD(n),
    i = Wh.get(t);
  i
    ? i.some((o) => o.el === e) || i.push({ el: e, declarationView: r })
    : Wh.set(t, [{ el: e, declarationView: r }]);
}
var _l = (function (t) {
  return (
    (t[(t.CHANGE_DETECTION = 0)] = `CHANGE_DETECTION`),
    (t[(t.AFTER_NEXT_RENDER = 1)] = `AFTER_NEXT_RENDER`),
    t
  );
})(_l || {});
var Nn = new E(``);
var S_ = new Set();
function fn(t) {
  S_.has(t) || (S_.add(t), performance?.mark?.(`mark_feature_usage`, { detail: { feature: t } }));
}
var Dl = (() => {
  class t {
    impl = null;
    execute() {
      this.impl?.execute();
    }
    static ɵprov = q({ token: t, providedIn: `root`, factory: () => new t() });
  }
  return t;
})();
var Ip = [0, 1, 2, 3];
var bp = (() => {
  class t {
    ngZone = v(Se);
    scheduler = v(Dn);
    errorHandler = v(Ht, { optional: !0 });
    sequences = new Set();
    deferredRegistrations = new Set();
    executing = !1;
    constructor() {
      v(Nn, { optional: !0 });
    }
    execute() {
      let n = this.sequences.size > 0;
      (n && ee(K.AfterRenderHooksStart), (this.executing = !0));
      for (let r of Ip)
        for (let i of this.sequences)
          if (!(i.erroredOrDestroyed || !i.hooks[r]))
            try {
              i.pipelinedValue = this.ngZone.runOutsideAngular(() =>
                this.maybeTrace(() => {
                  let o = i.hooks[r];
                  return o(i.pipelinedValue);
                }, i.snapshot),
              );
            } catch (o) {
              ((i.erroredOrDestroyed = !0), this.errorHandler?.handleError(o));
            }
      this.executing = !1;
      for (let r of this.sequences)
        (r.afterRun(), r.once && (this.sequences.delete(r), r.destroy()));
      for (let r of this.deferredRegistrations) this.sequences.add(r);
      (this.deferredRegistrations.size > 0 && this.scheduler.notify(7),
        this.deferredRegistrations.clear(),
        n && ee(K.AfterRenderHooksEnd));
    }
    register(n) {
      let { view: r } = n;
      r !== void 0
        ? ((r[vi] ??= []).push(n), Ei(r), (r[U] |= 8192))
        : this.executing
          ? this.deferredRegistrations.add(n)
          : this.addSequence(n);
    }
    addSequence(n) {
      (this.sequences.add(n), this.scheduler.notify(7));
    }
    unregister(n) {
      this.executing && this.sequences.has(n)
        ? ((n.erroredOrDestroyed = !0), (n.pipelinedValue = void 0), (n.once = !0))
        : (this.sequences.delete(n), this.deferredRegistrations.delete(n));
    }
    maybeTrace(n, r) {
      return r ? r.run(_l.AFTER_NEXT_RENDER, n) : n();
    }
    static ɵprov = q({ token: t, providedIn: `root`, factory: () => new t() });
  }
  return t;
})();
var da = class {
  impl;
  hooks;
  view;
  once;
  snapshot;
  erroredOrDestroyed = !1;
  pipelinedValue = void 0;
  unregisterOnDestroy;
  constructor(e, n, r, i, o, s = null) {
    ((this.impl = e),
      (this.hooks = n),
      (this.view = r),
      (this.once = i),
      (this.snapshot = s),
      (this.unregisterOnDestroy = o?.onDestroy(() => this.destroy())));
  }
  afterRun() {
    ((this.erroredOrDestroyed = !1),
      (this.pipelinedValue = void 0),
      this.snapshot?.dispose(),
      (this.snapshot = null));
  }
  destroy() {
    (this.impl.unregister(this), this.unregisterOnDestroy?.());
    let e = this.view?.[vi];
    e && (this.view[vi] = e.filter((n) => n !== this));
  }
};
function Ca(t, e) {
  let n = e?.injector ?? v(He);
  return (fn(`NgAfterNextRender`), YM(t, n, e, !0));
}
function qM(t) {
  return t instanceof Function
    ? [void 0, void 0, t, void 0]
    : [t.earlyRead, t.write, t.mixedReadWrite, t.read];
}
function YM(t, e, n, r) {
  let i = e.get(Dl);
  i.impl ??= e.get(bp);
  let o = e.get(Nn, null, { optional: !0 }),
    s = n?.manualCleanup !== !0 ? e.get(J) : null,
    a = e.get(Oo, null, { optional: !0 }),
    c = new da(i.impl, qM(t), a?.view, r, s, o?.snapshot(null));
  return (i.impl.register(c), c);
}
var Sp = new E(``, {
  factory: () => {
    let t = v(ve),
      e = new Set();
    return (
      t.onDestroy(() => e.clear()),
      { queue: e, isScheduled: !1, scheduler: null, injector: t }
    );
  },
});
function $D(t, e, n) {
  let r = t.get(Sp);
  if (Array.isArray(e)) for (let i of e) (r.queue.add(i), n?.detachedLeaveAnimationFns?.push(i));
  else (r.queue.add(e), n?.detachedLeaveAnimationFns?.push(e));
  r.scheduler && r.scheduler(t);
}
function ZM(t, e) {
  let n = t.get(Sp);
  if (Array.isArray(e)) for (let r of e) n.queue.delete(r);
  else n.queue.delete(e);
}
function KM(t, e) {
  let n = t.get(Sp);
  if (e.detachedLeaveAnimationFns) {
    for (let r of e.detachedLeaveAnimationFns) n.queue.delete(r);
    e.detachedLeaveAnimationFns = void 0;
  }
}
function QM(t, e) {
  for (let [n, r] of e) $D(t, r.animateFns);
}
function T_(t, e, n, r) {
  let i = t?.[Sn]?.enter;
  e !== null && i && i.has(n.index) && QM(r, i);
}
function M_(t, e, n, r) {
  try {
    n.get(pi);
  } catch {
    return r(!1);
  }
  let i = t?.[Sn];
  i?.enter?.has(e.index) && ZM(n, i.enter.get(e.index).animateFns);
  let o = XM(t, e, i);
  if (o.size === 0) {
    let s = !1;
    if (t) {
      let a = [];
      (El(t, e, a), (s = a.length > 0));
    }
    if (!s) return r(!1);
  }
  (t && xr.add(t[bn]), $D(n, () => JM(t, e, i || void 0, o, r), i || void 0));
}
function XM(t, e, n) {
  let r = new Map(),
    i = n?.leave;
  if ((i && i.has(e.index) && r.set(e.index, i.get(e.index)), t && i))
    for (let [o, s] of i) {
      if (r.has(o)) continue;
      let c = t[O].data[o].parent;
      for (; c;) {
        if (c === e) {
          r.set(o, s);
          break;
        }
        c = c.parent;
      }
    }
  return r;
}
function JM(t, e, n, r, i) {
  let o = [];
  if (n && n.leave)
    for (let [s] of r) {
      if (!n.leave.has(s)) continue;
      let a = n.leave.get(s);
      for (let c of a.animateFns) {
        let { promise: u } = c();
        o.push(u);
      }
      n.detachedLeaveAnimationFns = void 0;
    }
  if ((t && El(t, e, o), o.length > 0)) {
    let s = n || t?.[Sn];
    if (s) {
      let a = s.running;
      (a && o.push(a), (s.running = Promise.allSettled(o)), tA(t, s.running, i));
    } else
      Promise.allSettled(o).then(() => {
        (t && xr.delete(t[bn]), i(!0));
      });
  } else (t && xr.delete(t[bn]), i(!1));
}
function El(t, e, n) {
  if (e.type & 12) {
    let i = t[e.index];
    if (zt(i))
      for (let o = Ee; o < i.length; o++) {
        let s = i[o];
        s[O].type === 2 && eA(s, n);
      }
  }
  let r = e.child;
  for (; r;) (El(t, r, n), (r = r.next));
}
function eA(t, e) {
  let n = t[Sn];
  if (n && n.leave)
    for (let i of n.leave.values())
      for (let o of i.animateFns) {
        let { promise: s } = o();
        e.push(s);
      }
  let r = t[O].firstChild;
  for (; r;) (El(t, r, e), (r = r.next));
}
function tA(t, e, n) {
  e.then(() => {
    (t[Sn]?.running === e && ((t[Sn].running = void 0), xr.delete(t[bn])), n(!0));
  });
}
function ko(t, e, n, r, i, o, s, a) {
  if (i != null) {
    let c,
      u = !1;
    zt(i) ? (c = i) : Yn(i) && ((u = !0), (i = i[an]));
    let l = Ke(i);
    (t === 0 && r !== null
      ? (T_(a, r, o, n), s == null ? kD(e, r, l) : Ti(e, r, l, s || null, !0))
      : t === 1 && r !== null
        ? (T_(a, r, o, n), Ti(e, r, l, s || null, !0), zM(o, l, a))
        : t === 2
          ? (a?.[Sn]?.leave?.has(o.index) && WM(o, l, a),
            aa.delete(l),
            M_(a, o, n, (d) => {
              if (aa.has(l)) {
                aa.delete(l);
                return;
              }
              PD(e, l, u, d);
            }))
          : t === 3 &&
            (aa.delete(l),
            M_(a, o, n, () => {
              e.destroyNode(l);
            })),
      c != null && fA(e, t, n, c, o, r, s));
  }
}
function nA(t, e) {
  (GD(t, e), (e[an] = null), (e[rt] = null));
}
function rA(t, e, n, r, i, o) {
  ((r[an] = i), (r[rt] = e), wl(t, r, n, 1, i, o));
}
function GD(t, e) {
  (e[cn].changeDetectionScheduler?.notify(9), wl(t, e, e[ne], 2, null, null));
}
function iA(t) {
  let e = t[To];
  if (!e) return Th(t[O], t);
  for (; e;) {
    let n = null;
    if (Yn(e)) n = e[To];
    else {
      let r = e[Ee];
      r && (n = r);
    }
    if (!n) {
      for (; e && !e[Gt] && e !== t;) (Yn(e) && Th(e[O], e), (e = e[Be]));
      (e === null && (e = t), Yn(e) && Th(e[O], e), (n = e && e[Gt]));
    }
    e = n;
  }
}
function Tp(t, e) {
  let n = t[_i],
    r = n.indexOf(e);
  n.splice(r, 1);
}
function Cl(t, e) {
  if (Di(e)) return;
  let n = e[ne];
  (n.destroyNode && wl(t, e, n, 3, null, null), iA(e));
}
function Th(t, e) {
  if (Di(e)) return;
  let n = P(null);
  try {
    ((e[U] &= -129),
      (e[U] |= 256),
      e[Tt] && Gn(e[Tt]),
      sA(t, e),
      oA(t, e),
      e[O].type === 1 && e[ne].destroy());
    let r = e[Tr];
    if (r !== null && zt(e[Be])) {
      r !== e[Be] && Tp(r, e);
      let i = e[In];
      i !== null && i.detachView(t);
    }
    Uh(e);
  } finally {
    P(n);
  }
}
function oA(t, e) {
  let n = t.cleanup,
    r = e[So];
  if (n !== null)
    for (let s = 0; s < n.length - 1; s += 2)
      if (typeof n[s] == `string`) {
        let a = n[s + 3];
        (a >= 0 ? r[a]() : r[-a].unsubscribe(), (s += 2));
      } else {
        let a = r[n[s + 1]];
        n[s].call(a);
      }
  r !== null && (e[So] = null);
  let i = e[zn];
  if (i !== null) {
    e[zn] = null;
    for (let s = 0; s < i.length; s++) {
      let a = i[s];
      a();
    }
  }
  let o = e[wr];
  if (o !== null) {
    e[wr] = null;
    for (let s of o) s.destroy();
  }
}
function sA(t, e) {
  let n;
  if (t != null && (n = t.destroyHooks) != null)
    for (let r = 0; r < n.length; r += 2) {
      let i = e[n[r]];
      if (!(i instanceof Ai)) {
        let o = n[r + 1];
        if (Array.isArray(o))
          for (let s = 0; s < o.length; s += 2) {
            let a = i[o[s]],
              c = o[s + 1];
            ee(K.LifecycleHookStart, a, c);
            try {
              c.call(a);
            } finally {
              ee(K.LifecycleHookEnd, a, c);
            }
          }
        else {
          ee(K.LifecycleHookStart, i, o);
          try {
            o.call(i);
          } finally {
            ee(K.LifecycleHookEnd, i, o);
          }
        }
      }
    }
}
function zD(t, e, n) {
  return aA(t, e.parent, n);
}
function aA(t, e, n) {
  let r = e;
  for (; r !== null && r.type & 168;) ((e = r), (r = e.parent));
  if (r === null) return n[an];
  if (Zn(r)) {
    let { encapsulation: i } = t.data[r.directiveStart + r.componentOffset];
    if (i === dn.None || i === dn.Emulated) return null;
  }
  return Mt(r, n);
}
function WD(t, e, n) {
  return uA(t, e, n);
}
function cA(t, e, n) {
  return t.type & 40 ? Mt(t, n) : null;
}
var uA = cA;
var A_;
function Mp(t, e, n, r) {
  let i = zD(t, r, e),
    o = e[ne],
    a = WD(r.parent || e[rt], r, e);
  if (i != null)
    if (Array.isArray(n)) for (let c = 0; c < n.length; c++) I_(o, i, n[c], a, !1);
    else I_(o, i, n, a, !1);
  A_ !== void 0 && A_(o, r, e, n, i);
}
function ca(t, e) {
  if (e !== null) {
    let n = e.type;
    if (n & 3) return Mt(e, t);
    if (n & 4) return qh(-1, t[e.index]);
    if (n & 8) {
      let r = e.child;
      if (r !== null) return ca(t, r);
      {
        let i = t[e.index];
        return zt(i) ? qh(-1, i) : Ke(i);
      }
    } else {
      if (n & 128) return ca(t, e.next);
      if (n & 32) return wp(e, t)() || Ke(t[e.index]);
      {
        let r = qD(t, e);
        if (r !== null) {
          if (Array.isArray(r)) return r[0];
          return ca(Wn(t[gt]), r);
        } else return ca(t, e.next);
      }
    }
  }
  return null;
}
function qD(t, e) {
  if (e !== null) {
    let r = t[gt][rt],
      i = e.projection;
    return r.projection[i];
  }
  return null;
}
function qh(t, e) {
  let n = Ee + t + 1;
  if (n < e.length) {
    let r = e[n],
      i = r[O].firstChild;
    if (i !== null) return ca(r, i);
  }
  return e[yi];
}
function Ap(t, e, n, r, i, o, s) {
  for (; n != null;) {
    let a = r[wn];
    if (n.type === 128) {
      n = n.next;
      continue;
    }
    let c = r[n.index],
      u = n.type;
    if ((s && e === 0 && (c && Lo(Ke(c), r), (n.flags |= 2)), !ml(n)))
      if (u & 8) (Ap(t, e, n.child, r, i, o, !1), ko(e, t, a, i, c, n, o, r));
      else if (u & 32) {
        let l = wp(n, r),
          d;
        for (; (d = l());) ko(e, t, a, i, d, n, o, r);
        ko(e, t, a, i, c, n, o, r);
      } else u & 16 ? YD(t, e, r, n, i, o) : ko(e, t, a, i, c, n, o, r);
    n = s ? n.projectionNext : n.next;
  }
}
function wl(t, e, n, r, i, o) {
  t.type === 3 ? lA(n, r, e, i, o) : Ap(n, r, t.firstChild, e, i, o, !1);
}
function lA(t, e, n, r, i) {
  let s = n[O].firstChild,
    a = s.next,
    c = Ke(n[s.index]),
    u = Ke(n[a.index]),
    l = a.index + 1,
    d = n[l];
  if (e === 1 || e === 0)
    r !== null &&
      (d && d.hasChildNodes() ? Ti(t, r, d, i, !0) : (Ti(t, r, c, i, !0), Ti(t, r, u, i, !0)));
  else if (e === 2) {
    if ((d || ((d = document.createDocumentFragment()), (n[l] = d)), c && c.parentNode === d))
      return;
    let f = c;
    for (; f !== null;) {
      let h = f.nextSibling;
      if ((d.appendChild(f), f === u)) break;
      f = h;
    }
  }
}
function dA(t, e, n) {
  let r = e[ne];
  YD(r, 0, e, n, zD(t, n, e), WD(n.parent || e[rt], n, e));
}
function YD(t, e, n, r, i, o) {
  let s = n[gt],
    c = s[rt].projection[r.projection];
  if (Array.isArray(c))
    for (let u = 0; u < c.length; u++) {
      let l = c[u];
      ko(e, t, n[wn], i, l, r, o, n);
    }
  else {
    let u = c,
      l = s[Be];
    (gD(r) && (u.flags |= 128), Ap(t, e, u, l, i, o, !0));
  }
}
function fA(t, e, n, r, i, o, s) {
  let a = r[yi];
  if ((a !== Ke(r) && ko(e, t, n, o, a, i, s), (r[U] & 4) === 0))
    for (let u = Ee; u < r.length; u++) {
      let l = r[u];
      wl(l[O], l, t, e, o, a);
    }
}
function hA(t, e, n, r, i) {
  if (e) i ? t.addClass(n, r) : t.removeClass(n, r);
  else {
    let o = r.indexOf(`-`) === -1 ? void 0 : Mn.DashCase;
    i == null
      ? t.removeStyle(n, r, o)
      : (typeof i == `string` &&
          i.endsWith(`!important`) &&
          ((i = i.slice(0, -10)), (o |= Mn.Important)),
        t.setStyle(n, r, i, o));
  }
}
function Np(t, e, n, r, i, o, s, a, c, u, l) {
  let d = se + r,
    f = d + i,
    h = pA(d, f),
    g = typeof u == `function` ? u() : u;
  return (h[O] = {
    type: t,
    blueprint: h,
    template: n,
    queries: null,
    viewQuery: a,
    declTNode: e,
    data: h.slice().fill(null, d),
    bindingStartIndex: d,
    expandoStartIndex: f,
    hostBindingOpCodes: null,
    firstCreatePass: !0,
    firstUpdatePass: !0,
    staticViewQueries: !1,
    staticContentQueries: !1,
    preOrderHooks: null,
    preOrderCheckHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null,
    cleanup: null,
    contentQueries: null,
    components: null,
    directiveRegistry: typeof o == `function` ? o() : o,
    pipeRegistry: typeof s == `function` ? s() : s,
    firstChild: null,
    schemas: c,
    consts: g,
    incompleteFirstPass: !1,
    ssrId: l,
  });
}
function pA(t, e) {
  let n = [];
  for (let r = 0; r < e; r++) n.push(r < t ? null : Qe);
  return n;
}
function gA(t) {
  let e = t.tView;
  return e === null || e.incompleteFirstPass
    ? (t.tView = Np(
        1,
        null,
        t.template,
        t.decls,
        t.vars,
        t.directiveDefs,
        t.pipeDefs,
        t.viewQuery,
        t.schemas,
        t.consts,
        t.id,
      ))
    : e;
}
function xp(t, e, n, r, i, o, s, a, c, u, l) {
  let d = e.blueprint.slice();
  return (
    (d[an] = i),
    (d[U] = r | 1228),
    (u !== null || (t && t[U] & 2048)) && (d[U] |= 2048),
    rh(d),
    (d[Be] = d[Sr] = t),
    (d[xe] = n),
    (d[cn] = s || (t && t[cn])),
    (d[ne] = a || (t && t[ne])),
    (d[wn] = c || (t && t[wn]) || null),
    (d[rt] = o),
    (d[bn] = W0()),
    (d[gi] = l),
    (d[Jf] = u),
    (d[gt] = e.type == 2 ? t[gt] : d),
    d
  );
}
function mA(t, e, n) {
  let r = Mt(e, t),
    i = gA(n),
    o = t[cn].rendererFactory,
    s = Rp(t, xp(t, i, null, ZD(n), r, e, null, o.createRenderer(r, n), null, null, null));
  return (t[e.index] = s);
}
function ZD(t) {
  let e = 16;
  return (t.signals ? (e = 4096) : t.onPush && (e = 64), e);
}
function KD(t, e, n, r) {
  if (n === 0) return -1;
  let i = e.length;
  for (let o = 0; o < n; o++) (e.push(r), t.blueprint.push(r), t.data.push(null));
  return i;
}
function Rp(t, e) {
  return (t[To] ? (t[Xf][Gt] = e) : (t[To] = e), (t[Xf] = e), e);
}
function vA(t = 1) {
  QD(re(), R(), At() + t, !1);
}
function QD(t, e, n, r) {
  if (!r)
    if ((e[U] & 3) === 3) {
      let o = t.preOrderCheckHooks;
      o !== null && Wu(e, o, n);
    } else {
      let o = t.preOrderHooks;
      o !== null && qu(e, o, 0, n);
    }
  Ar(n);
}
var Il = (function (t) {
  return (
    (t[(t.None = 0)] = `None`),
    (t[(t.SignalBased = 1)] = `SignalBased`),
    (t[(t.HasDecoratorInputTransform = 2)] = `HasDecoratorInputTransform`),
    t
  );
})(Il || {});
function Ni(t, e, n, r) {
  let i = P(null);
  try {
    let [o, s, a] = t.inputs[n],
      c = null;
    ((s & Il.SignalBased) !== 0 && (c = e[o][le]),
      c !== null && c.transformFn !== void 0
        ? (r = c.transformFn(r))
        : a !== null && (r = a.call(e, r)),
      t.setInput !== null ? t.setInput(e, c, r, n, o) : J_(e, c, o, r));
  } finally {
    P(i);
  }
}
function XD(t, e, n, r, i) {
  let o = At(),
    s = r & 2;
  try {
    (Ar(-1), s && e.length > se && QD(t, e, se, !1));
    (ee(s ? K.TemplateUpdateStart : K.TemplateCreateStart, i, n), n(r, i));
  } finally {
    Ar(o);
    ee(s ? K.TemplateUpdateEnd : K.TemplateCreateEnd, i, n);
  }
}
function bl(t, e, n) {
  (wA(t, e, n), (n.flags & 64) === 64 && IA(t, e, n));
}
function wa(t, e, n = Mt) {
  let r = e.localNames;
  if (r !== null) {
    let i = e.index + 1;
    for (let o = 0; o < r.length; o += 2) {
      let s = r[o + 1],
        a = s === -1 ? n(e, t) : t[s];
      t[i++] = a;
    }
  }
}
function yA(t, e, n, r) {
  let o = r.get(wD, CD) || n === dn.ShadowDom || n === dn.ExperimentalIsolatedShadowDom;
  return t.selectRootElement(e, o);
}
function EA(t) {
  return t === `class`
    ? `className`
    : t === `for`
      ? `htmlFor`
      : t === `formaction`
        ? `formAction`
        : t === `innerHtml`
          ? `innerHTML`
          : t === `readonly`
            ? `readOnly`
            : t === `tabindex`
              ? `tabIndex`
              : t;
}
function JD(t, e, n, r, i, o) {
  let s = e[O];
  if (Fp(t, s, e, n, r)) {
    Zn(t) && CA(e, t.index);
    return;
  }
  (t.type & 3 && (n = EA(n)), eE(t, e, n, r, i, o));
}
function eE(t, e, n, r, i, o) {
  if (t.type & 3) {
    let s = Mt(t, e);
    ((r = o != null ? o(r, t.value || ``, n) : r), i.setProperty(s, n, r));
  } else t.type & 12;
}
function CA(t, e) {
  let n = Wt(e, t);
  n[U] & 16 || (n[U] |= 64);
}
function wA(t, e, n) {
  let r = n.directiveStart,
    i = n.directiveEnd;
  (Zn(n) && mA(e, n, t.data[r + n.componentOffset]), t.firstCreatePass || el(n, e));
  let o = n.initialInputs;
  for (let s = r; s < i; s++) {
    let a = t.data[s],
      c = la(e, t, s, n);
    if ((Lo(c, e), o !== null && MA(e, s - r, c, a, n, o), un(a))) {
      let u = Wt(n.index, e);
      u[xe] = la(e, t, s, n);
    }
  }
}
function IA(t, e, n) {
  let r = n.directiveStart,
    i = n.directiveEnd,
    o = n.index,
    s = qy();
  try {
    Ar(o);
    for (let a = r; a < i; a++) {
      let c = t.data[a],
        u = e[a];
      (Ru(a), (c.hostBindings !== null || c.hostVars !== 0 || c.hostAttrs !== null) && bA(c, u));
    }
  } finally {
    (Ar(-1), Ru(s));
  }
}
function bA(t, e) {
  t.hostBindings !== null && t.hostBindings(1, e);
}
function Op(t, e) {
  let n = t.directiveRegistry,
    r = null;
  if (n)
    for (let i = 0; i < n.length; i++) {
      let o = n[i];
      BD(e, o.selectors, !1) && ((r ??= []), un(o) ? r.unshift(o) : r.push(o));
    }
  return r;
}
function SA(t, e, n, r, i, o) {
  let s = Mt(t, e);
  TA(e[ne], s, o, t.value, n, r, i);
}
function TA(t, e, n, r, i, o, s) {
  if (o == null) (s?.(o, r || ``, i), t.removeAttribute(e, i, n));
  else {
    let a = s == null ? Cn(o) : s(o, r || ``, i);
    t.setAttribute(e, i, a, n);
  }
}
function MA(t, e, n, r, i, o) {
  let s = o[e];
  if (s !== null)
    for (let a = 0; a < s.length; a += 2) {
      let c = s[a],
        u = s[a + 1];
      Ni(r, n, c, u);
    }
}
function kp(t, e, n, r, i) {
  let o = se + n,
    s = e[O],
    a = i(s, e, t, r, n);
  ((e[o] = a), Ci(t, !0));
  let c = t.type === 2;
  return (
    c ? (FD(e[ne], a, t), (jy() === 0 || Mo(t)) && Lo(a, e), Uy()) : Lo(a, e),
    Fu() && (!c || !ml(t)) && Mp(s, e, a, t),
    t
  );
}
function Pp(t) {
  let e = t;
  return (fh() ? hh() : ((e = e.parent), Ci(e, !1)), e);
}
function AA(t, e) {
  let n = t[wn];
  if (!n) return;
  let r;
  try {
    r = n.get(_t, null);
  } catch {
    r = null;
  }
  r?.(e);
}
function Fp(t, e, n, r, i) {
  let o = t.inputs?.[r],
    s = t.hostDirectiveInputs?.[r],
    a = !1;
  if (s)
    for (let c = 0; c < s.length; c += 2) {
      let u = s[c],
        l = s[c + 1],
        d = e.data[u];
      (Ni(d, n[u], l, i), (a = !0));
    }
  if (o)
    for (let c of o) {
      let u = n[c],
        l = e.data[c];
      (Ni(l, u, r, i), (a = !0));
    }
  return a;
}
function NA(t, e, n, r, i, o) {
  let s = null,
    a = null,
    c = null,
    u = !1,
    l = t.directiveToIndex.get(r.type);
  if (
    (typeof l == `number` ? (s = l) : ([s, a, c] = l),
    a !== null && c !== null && t.hostDirectiveInputs?.hasOwnProperty(i))
  ) {
    let d = t.hostDirectiveInputs[i];
    for (let f = 0; f < d.length; f += 2) {
      let h = d[f];
      if (h >= a && h <= c) {
        let g = e.data[h],
          p = d[f + 1];
        (Ni(g, n[h], p, o), (u = !0));
      } else if (h > c) break;
    }
  }
  return (s !== null && r.inputs.hasOwnProperty(i) && (Ni(r, n[s], i, o), (u = !0)), u);
}
function xA(t, e) {
  let n = Wt(e, t),
    r = n[O];
  RA(r, n);
  let i = n[an];
  (i !== null && n[gi] === null && (n[gi] = ID(i, n[wn])), ee(K.ComponentStart));
  try {
    Lp(r, n, n[xe]);
  } finally {
    ee(K.ComponentEnd, n[xe]);
  }
}
function RA(t, e) {
  for (let n = e.length; n < t.blueprint.length; n++) e.push(t.blueprint[n]);
}
function Lp(t, e, n) {
  ku(e);
  try {
    let r = t.viewQuery;
    r !== null && Hh(1, r, n);
    let i = t.template;
    (i !== null && XD(t, e, i, 1, n),
      t.firstCreatePass && (t.firstCreatePass = !1),
      e[In]?.finishViewCreation(t),
      t.staticContentQueries && bD(t, e),
      t.staticViewQueries && Hh(2, t.viewQuery, n));
    let o = t.components;
    o !== null && OA(e, o);
  } catch (r) {
    throw (t.firstCreatePass && ((t.incompleteFirstPass = !0), (t.firstCreatePass = !1)), r);
  } finally {
    ((e[U] &= -5), Pu());
  }
}
function OA(t, e) {
  for (let n = 0; n < e.length; n++) xA(t, e[n]);
}
function Ia(t, e, n, r) {
  let i = P(null);
  try {
    let o = e.tView,
      c = xp(
        t,
        o,
        n,
        t[U] & 4096 ? 4096 : 16,
        null,
        e,
        null,
        null,
        r?.injector ?? null,
        r?.embeddedViewInjector ?? null,
        r?.dehydratedView ?? null,
      );
    c[Tr] = t[e.index];
    let l = t[In];
    return (l !== null && (c[In] = l.createEmbeddedView(o)), Lp(o, c, n), c);
  } finally {
    P(i);
  }
}
function Vo(t, e) {
  return !e || e.firstChild === null || gD(t);
}
function fa(t, e, n, r, i = !1) {
  if (t.type === 3) {
    let o = t.firstChild,
      s = o.next,
      a = Ke(e[o.index]),
      c = Ke(e[s.index]),
      u = a;
    for (; u !== null && (r.push(u), u !== c);) u = u.nextSibling;
    return r;
  }
  for (; n !== null;) {
    if (n.type === 128) {
      n = i ? n.projectionNext : n.next;
      continue;
    }
    let o = e[n.index];
    if (o !== null)
      if (zt(o)) {
        let a = o[yi];
        (a !== o[an] && r.push(Ke(o)), o[U] & 4 || tE(o, r), r.push(a));
      } else r.push(Ke(o));
    let s = n.type;
    if (s & 8) fa(t, e, n.child, r);
    else if (s & 32) {
      let a = wp(n, e),
        c;
      for (; (c = a());) r.push(c);
    } else if (s & 16) {
      let a = qD(e, n);
      if (Array.isArray(a)) r.push(...a);
      else {
        let c = Wn(e[gt]);
        fa(c[O], c, a, r, !0);
      }
    }
    n = i ? n.projectionNext : n.next;
  }
  return r;
}
function tE(t, e) {
  for (let n = Ee; n < t.length; n++) {
    let r = t[n],
      i = r[O].firstChild;
    i !== null && fa(r[O], r, i, e);
  }
}
function nE(t) {
  if (t[vi] !== null) {
    for (let e of t[vi]) e.impl.addSequence(e);
    t[vi].length = 0;
  }
}
var rE = [];
function kA(t) {
  return t[Tt] ?? PA(t);
}
function PA(t) {
  let e = rE.pop() ?? Object.create(LA);
  return ((e.lView = t), e);
}
function FA(t) {
  t.lView[Tt] !== t && ((t.lView = null), rE.push(t));
}
var LA = m(l({}, Bn), {
  consumerIsAlwaysLive: !0,
  kind: `template`,
  consumerMarkedDirty: (t) => {
    Ei(t.lView);
  },
  consumerOnSignalRead() {
    this.lView[Tt] = this;
  },
});
function VA(t) {
  let e = t[Tt] ?? Object.create(jA);
  return ((e.lView = t), e);
}
var jA = m(l({}, Bn), {
  consumerIsAlwaysLive: !0,
  kind: `template`,
  consumerMarkedDirty: (t) => {
    let e = Wn(t.lView);
    for (; e && !iE(e[O]);) e = Wn(e);
    e && ih(e);
  },
  consumerOnSignalRead() {
    this.lView[Tt] = this;
  },
});
function iE(t) {
  return t.type !== 2;
}
function oE(t) {
  if (t[wr] === null) return;
  let e = !0;
  for (; e;) {
    let n = !1;
    for (let r of t[wr])
      r.dirty &&
        ((n = !0),
        r.zone === null || Zone.current === r.zone ? r.run() : r.zone.run(() => r.run()));
    e = n && !!(t[U] & 8192);
  }
}
var UA = 100;
function sE(t, e = 0) {
  let r = t[cn].rendererFactory;
  r.begin?.();
  try {
    BA(t, e);
  } finally {
    r.end?.();
  }
}
function BA(t, e) {
  let n = gh();
  try {
    (Bs(!0), Yh(t, e));
    let r = 0;
    for (; Js(t);) {
      if (r === UA) throw new I(103, !1);
      (r++, Yh(t, 1));
    }
  } finally {
    Bs(n);
  }
}
function HA(t, e, n, r) {
  if (Di(e)) return;
  let i = e[U];
  ku(e);
  let a = !0,
    c = null,
    u = null;
  iE(t)
    ? ((u = kA(e)), (c = yn(u)))
    : au() === null
      ? ((a = !1), (u = VA(e)), (c = yn(u)))
      : e[Tt] && (Gn(e[Tt]), (e[Tt] = null));
  try {
    (rh(e), Gy(t.bindingStartIndex), n !== null && XD(t, e, n, 2, r));
    let l = (i & 3) === 3;
    if (l) {
      let h = t.preOrderCheckHooks;
      h !== null && Wu(e, h, null);
    } else {
      let h = t.preOrderHooks;
      (h !== null && qu(e, h, 0, null), bh(e, 0));
    }
    if (($A(e), oE(e), aE(e, 0), t.contentQueries !== null && bD(t, e), true))
      if (l) {
        let h = t.contentCheckHooks;
        h !== null && Wu(e, h);
      } else {
        let h = t.contentHooks;
        (h !== null && qu(e, h, 1), bh(e, 1));
      }
    zA(t, e);
    let d = t.components;
    d !== null && uE(e, d, 0);
    let f = t.viewQuery;
    if ((f !== null && Hh(2, f, r), true))
      if (l) {
        let h = t.viewCheckHooks;
        h !== null && Wu(e, h);
      } else {
        let h = t.viewHooks;
        (h !== null && qu(e, h, 2), bh(e, 2));
      }
    if ((t.firstUpdatePass === !0 && (t.firstUpdatePass = !1), e[bu])) {
      for (let h of e[bu]) h();
      e[bu] = null;
    }
    (nE(e), (e[U] &= -73));
  } catch (l) {
    throw (Ei(e), l);
  } finally {
    (u !== null && ($n(u, c), a && FA(u)), Pu());
  }
}
function aE(t, e) {
  for (let n = vD(t); n !== null; n = yD(n))
    for (let r = Ee; r < n.length; r++) {
      let i = n[r];
      cE(i, e);
    }
}
function $A(t) {
  for (let e = vD(t); e !== null; e = yD(e)) {
    if (!(e[U] & 2)) continue;
    let n = e[_i];
    for (let r = 0; r < n.length; r++) {
      let i = n[r];
      ih(i);
    }
  }
}
function GA(t, e, n) {
  ee(K.ComponentStart);
  let r = Wt(e, t);
  try {
    cE(r, n);
  } finally {
    ee(K.ComponentEnd, r[xe]);
  }
}
function cE(t, e) {
  Mu(t) && Yh(t, e);
}
function Yh(t, e) {
  let r = t[O],
    i = t[U],
    o = t[Tt],
    s = !!(e === 0 && i & 16);
  if (
    ((s ||= !!(i & 64 && e === 0)),
    (s ||= !!(i & 1024)),
    (s ||= !!(o?.dirty && ai(o))),
    (s ||= !1),
    o && (o.dirty = !1),
    (t[U] &= -9217),
    s)
  )
    HA(r, t, r.template, t[xe]);
  else if (i & 8192) {
    let a = P(null);
    try {
      (oE(t), aE(t, 1));
      let c = r.components;
      (c !== null && uE(t, c, 1), nE(t));
    } finally {
      P(a);
    }
  }
}
function uE(t, e, n) {
  for (let r = 0; r < e.length; r++) GA(t, e[r], n);
}
function zA(t, e) {
  let n = t.hostBindingOpCodes;
  if (n !== null)
    try {
      for (let r = 0; r < n.length; r++) {
        let i = n[r];
        if (i < 0) Ar(~i);
        else {
          let o = i,
            s = n[++r],
            a = n[++r];
          Wy(s, o);
          let c = e[o];
          ee(K.HostBindingsUpdateStart, c);
          try {
            a(2, c);
          } finally {
            ee(K.HostBindingsUpdateEnd, c);
          }
        }
      }
    } finally {
      Ar(-1);
    }
}
function Vp(t, e) {
  let n = gh() ? 64 : 1088;
  for (t[cn].changeDetectionScheduler?.notify(e); t;) {
    t[U] |= n;
    let r = Wn(t);
    if (Ao(t) && !r) return t;
    t = r;
  }
  return null;
}
function lE(t, e, n, r) {
  return [t, !0, 0, e, null, r, null, n, null, null];
}
function dE(t, e) {
  let n = Ee + e;
  if (n < t.length) return t[n];
}
function ba(t, e, n, r = !0) {
  let i = e[O];
  if ((WA(i, e, t, n), r)) {
    let s = qh(n, t),
      a = e[ne],
      c = a.parentNode(t[yi]);
    c !== null && rA(i, t[rt], a, e, c, s);
  }
  let o = e[gi];
  o !== null && o.firstChild !== null && (o.firstChild = null);
}
function fE(t, e) {
  let n = ha(t, e);
  return (n !== void 0 && Cl(n[O], n), n);
}
function ha(t, e) {
  if (t.length <= Ee) return;
  let n = Ee + e,
    r = t[n];
  if (r) {
    let i = r[Tr];
    (i !== null && i !== t && Tp(i, r), e > 0 && (t[n - 1][Gt] = r[Gt]));
    let o = Ys(t, Ee + e);
    nA(r[O], r);
    let s = o[In];
    (s !== null && s.detachView(o[O]), (r[Be] = null), (r[Gt] = null), (r[U] &= -129));
  }
  return r;
}
function WA(t, e, n, r) {
  let i = Ee + r,
    o = n.length;
  (r > 0 && (n[i - 1][Gt] = e),
    r < o - Ee ? ((e[Gt] = n[i]), qf(n, Ee + r, e)) : (n.push(e), (e[Gt] = null)),
    (e[Be] = n));
  let s = e[Tr];
  s !== null && n !== s && hE(s, e);
  let a = e[In];
  (a !== null && a.insertView(t), Au(e), (e[U] |= 128));
}
function hE(t, e) {
  let n = t[_i],
    r = e[Be];
  if (Yn(r)) t[U] |= 2;
  else {
    let i = r[Be][gt];
    e[gt] !== i && (t[U] |= 2);
  }
  n === null ? (t[_i] = [e]) : n.push(e);
}
var Rr = class {
  _lView;
  _cdRefInjectingView;
  _appRef = null;
  _attachedToViewContainer = !1;
  exhaustive;
  get rootNodes() {
    let e = this._lView,
      n = e[O];
    return fa(n, e, n.firstChild, []);
  }
  constructor(e, n) {
    ((this._lView = e), (this._cdRefInjectingView = n));
  }
  get context() {
    return this._lView[xe];
  }
  set context(e) {
    this._lView[xe] = e;
  }
  get destroyed() {
    return Di(this._lView);
  }
  destroy() {
    if (this._appRef) this._appRef.detachView(this);
    else if (this._attachedToViewContainer) {
      let e = this._lView[Be];
      if (zt(e)) {
        let n = e[Qs],
          r = n ? n.indexOf(this) : -1;
        r > -1 && (ha(e, r), Ys(n, r));
      }
      this._attachedToViewContainer = !1;
    }
    Cl(this._lView[O], this._lView);
  }
  onDestroy(e) {
    Nu(this._lView, e);
  }
  markForCheck() {
    Vp(this._cdRefInjectingView || this._lView, 4);
  }
  detach() {
    this._lView[U] &= -129;
  }
  reattach() {
    (Au(this._lView), (this._lView[U] |= 128));
  }
  detectChanges() {
    ((this._lView[U] |= 1024), sE(this._lView));
  }
  checkNoChanges() {}
  attachToViewContainerRef() {
    if (this._appRef) throw new I(902, !1);
    this._attachedToViewContainer = !0;
  }
  detachFromAppRef() {
    this._appRef = null;
    let e = Ao(this._lView),
      n = this._lView[Tr];
    (n !== null && !e && Tp(n, this._lView), GD(this._lView[O], this._lView));
  }
  attachToAppRef(e) {
    if (this._attachedToViewContainer) throw new I(902, !1);
    this._appRef = e;
    let n = Ao(this._lView),
      r = this._lView[Tr];
    (r !== null && !n && hE(r, this._lView), Au(this._lView));
  }
};
var jo = (() => {
  class t {
    _declarationLView;
    _declarationTContainer;
    elementRef;
    static __NG_ELEMENT_ID__ = qA;
    constructor(n, r, i) {
      ((this._declarationLView = n), (this._declarationTContainer = r), (this.elementRef = i));
    }
    get ssrId() {
      return this._declarationTContainer.tView?.ssrId || null;
    }
    createEmbeddedView(n, r) {
      return this.createEmbeddedViewImpl(n, r);
    }
    createEmbeddedViewImpl(n, r, i) {
      return new Rr(
        Ia(this._declarationLView, this._declarationTContainer, n, {
          embeddedViewInjector: r,
          dehydratedView: i,
        }),
      );
    }
  }
  return t;
})();
function qA() {
  return Sl(ke(), R());
}
function Sl(t, e) {
  return t.type & 4 ? new jo(e, t, $o(t, e)) : null;
}
function Pi(t, e, n, r, i) {
  let o = t.data[e];
  if (o === null) ((o = YA(t, e, n, r, i)), zy() && (o.flags |= 32));
  else if (o.type & 64) {
    ((o.type = n), (o.value = r), (o.attrs = i));
    let s = $y();
    o.injectorIndex = s === null ? -1 : s.injectorIndex;
  }
  return (Ci(o, !0), o);
}
function YA(t, e, n, r, i) {
  let o = dh(),
    s = fh(),
    a = s ? o : o && o.parent,
    c = (t.data[e] = KA(t, a, n, e, r, i));
  return (ZA(t, c, o, s), c);
}
function ZA(t, e, n, r) {
  (t.firstChild === null && (t.firstChild = e),
    n !== null &&
      (r
        ? n.child == null && e.parent !== null && (n.child = e)
        : n.next === null && ((n.next = e), (e.prev = n))));
}
function KA(t, e, n, r, i, o) {
  let s = e ? e.injectorIndex : -1,
    a = 0;
  return (
    ch() && (a |= 128),
    {
      type: n,
      index: r,
      insertBeforeIndex: null,
      injectorIndex: s,
      directiveStart: -1,
      directiveEnd: -1,
      directiveStylingLast: -1,
      componentOffset: -1,
      controlDirectiveIndex: -1,
      customControlIndex: -1,
      propertyBindings: null,
      flags: a,
      providerIndexes: 0,
      value: i,
      namespace: _h(),
      attrs: o,
      mergedAttrs: null,
      localNames: null,
      initialInputs: null,
      inputs: null,
      hostDirectiveInputs: null,
      outputs: null,
      hostDirectiveOutputs: null,
      directiveToIndex: null,
      tView: null,
      next: null,
      prev: null,
      projectionNext: null,
      child: null,
      parent: e,
      projection: null,
      styles: null,
      stylesWithoutHost: null,
      residualStyles: void 0,
      classes: null,
      classesWithoutHost: null,
      residualClasses: void 0,
      classBindings: 0,
      styleBindings: 0,
    }
  );
}
function QA(t) {
  let e = t[eh] ?? [],
    r = t[Be][ne],
    i = [];
  for (let o of e) o.data[ED] !== void 0 ? i.push(o) : XA(o, r);
  t[eh] = i;
}
function XA(t, e) {
  let n = 0,
    r = t.firstChild;
  if (r) {
    let i = t.data[DD];
    for (; n < i;) {
      let o = r.nextSibling;
      (PD(e, r, !1), (r = o), n++);
    }
  }
}
var JA = () => null;
var eN = () => null;
function rl(t, e) {
  return JA(t, e);
}
function pE(t, e, n) {
  return eN(t, e, n);
}
var gE = class {};
var xi = class {};
var An = class {
  destroyNode = null;
  static __NG_ELEMENT_ID__ = () => tN();
};
function tN() {
  let t = R(),
    n = Wt(ke().index, t);
  return (Yn(n) ? n : t)[ne];
}
var mE = (() => {
  class t {
    static ɵprov = q({ token: t, providedIn: `root`, factory: () => null });
  }
  return t;
})();
function vE(t) {
  return t.debugInfo?.className || t.type.name || null;
}
var Zu = {};
var il = class {
  injector;
  parentInjector;
  constructor(e, n) {
    ((this.injector = e), (this.parentInjector = n));
  }
  get(e, n, r) {
    let i = this.injector.get(e, Zu, r);
    return i !== Zu || n === Zu ? i : this.parentInjector.get(e, n, r);
  }
};
function Tl(t, e, n) {
  return (t[e] = n);
}
function nN(t, e) {
  return t[e];
}
function Nt(t, e, n) {
  if (n === Qe) return !1;
  let r = t[e];
  return Object.is(r, n) ? !1 : ((t[e] = n), !0);
}
function jp(t, e, n, r) {
  let i = Nt(t, e, n);
  return Nt(t, e + 1, r) || i;
}
function yE(t, e, n, r, i) {
  let o = jp(t, e, n, r);
  return Nt(t, e + 2, i) || o;
}
function Mi(t, e, n) {
  return function r(i) {
    let o = r.__ngNativeEl__;
    o !== void 0 && Y0(i, o);
    Vp(Zn(t) ? Wt(t.index, e) : e, 5);
    let a = e[xe],
      c = N_(e, a, n, i),
      u = r.__ngNextListenerFn__;
    for (; u;) ((c = N_(e, a, u, i) && c), (u = u.__ngNextListenerFn__));
    return c;
  };
}
function N_(t, e, n, r) {
  let i = P(null);
  try {
    return (ee(K.OutputStart, e, n), n(r) !== !1);
  } catch (o) {
    return (AA(t, o), !1);
  } finally {
    (ee(K.OutputEnd, e, n), P(i));
  }
}
function Up(t, e, n, r, i, o, s, a) {
  let c = Mo(t),
    u = !1,
    l = null;
  if ((!r && c && (l = iN(e, n, o, t.index)), l !== null)) {
    let d = l.__ngLastListenerFn__ || l;
    ((d.__ngNextListenerFn__ = s), (l.__ngLastListenerFn__ = s), (u = !0));
  } else {
    let d = Mt(t, n),
      f = r ? r(d) : d;
    r || (a.__ngNativeEl__ = d);
    let h = i.listen(f, o, a);
    if (!rN(o)) _E(r ? (p) => r(Ke(p[t.index])) : t.index, e, n, o, a, h, !1);
  }
  return u;
}
function rN(t) {
  return t.startsWith(`animation`) || t.startsWith(`transition`);
}
function iN(t, e, n, r) {
  let i = t.cleanup;
  if (i != null)
    for (let o = 0; o < i.length - 1; o += 2) {
      let s = i[o];
      if (s === n && i[o + 1] === r) {
        let a = e[So],
          c = i[o + 2];
        return a && a.length > c ? a[c] : null;
      }
      typeof s == `string` && (o += 2);
    }
  return null;
}
function _E(t, e, n, r, i, o, s) {
  let a = e.firstCreatePass ? sh(e) : null,
    c = oh(n),
    u = c.length;
  (c.push(i, o), a && a.push(r, t, u, (u + 1) * (s ? -1 : 1)));
}
function x_(t, e, n, r, i) {
  let o = null,
    s = null,
    a = null,
    c = !1,
    u = t.directiveToIndex.get(n.type);
  if (
    (typeof u == `number` ? (o = u) : ([o, s, a] = u),
    s !== null && a !== null && t.hostDirectiveOutputs?.hasOwnProperty(r))
  ) {
    let l = t.hostDirectiveOutputs[r];
    for (let d = 0; d < l.length; d += 2) {
      let f = l[d];
      if (f >= s && f <= a) ((c = !0), ol(t, e, f, l[d + 1], r, i));
      else if (f > a) break;
    }
  }
  return (n.outputs.hasOwnProperty(r) && ((c = !0), ol(t, e, o, r, r, i)), c);
}
function ol(t, e, n, r, i, o) {
  let s = e[n],
    a = e[O],
    d = s[a.data[n].outputs[r]].subscribe(o);
  _E(t.index, a, e, i, o, d, !0);
}
function oN() {
  sN();
}
function sN() {
  let t = R(),
    e = re(),
    n = ke();
  if ((e.firstCreatePass && uN(e, n), n.controlDirectiveIndex === -1)) return;
  fn(`NgSignalForms`);
  let r = t[n.controlDirectiveIndex];
  e.data[n.controlDirectiveIndex].controlDef.create(r, new sl(t, e, n));
}
function aN() {
  cN();
}
function cN() {
  let t = R(),
    e = re(),
    n = Ii();
  if (n.controlDirectiveIndex === -1) return;
  let r = e.data[n.controlDirectiveIndex].controlDef,
    i = t[n.controlDirectiveIndex];
  r.update(i, new sl(t, e, n));
}
var sl = class {
  lView;
  tView;
  tNode;
  hasPassThrough;
  constructor(e, n, r) {
    ((this.lView = e),
      (this.tView = n),
      (this.tNode = r),
      (this.hasPassThrough = !!(r.flags & 4096)));
  }
  get customControl() {
    return this.tNode.customControlIndex !== -1
      ? this.lView[this.tNode.customControlIndex]
      : void 0;
  }
  get nativeElement() {
    return Mt(this.tNode, this.lView);
  }
  get descriptor() {
    return `<${this.tNode.value}>`;
  }
  listenToCustomControlOutput(e, n) {
    let r = this.tView.data[this.tNode.customControlIndex];
    x_(this.tNode, this.lView, r, e, Mi(this.tNode, this.lView, n));
  }
  listenToCustomControlModel(e) {
    let n = this.tNode.flags & 1024 ? `valueChange` : `checkedChange`,
      r = this.tView.data[this.tNode.customControlIndex];
    x_(this.tNode, this.lView, r, n, Mi(this.tNode, this.lView, e));
  }
  listenToDom(e, n) {
    Up(
      this.tNode,
      this.tView,
      this.lView,
      void 0,
      this.lView[ne],
      e,
      n,
      Mi(this.tNode, this.lView, n),
    );
  }
  setInputOnDirectives(e, n) {
    let r = this.tNode.inputs?.[e],
      i = this.tNode.hostDirectiveInputs?.[e];
    if (!r && !i) return !1;
    let o = !1;
    if (r)
      for (let s of r) {
        if (s === this.tNode.controlDirectiveIndex) continue;
        let a = this.tView.data[s],
          c = this.lView[s];
        (Ni(a, c, e, n), (o = !0));
      }
    if (i)
      for (let s = 0; s < i.length; s += 2) {
        let a = i[s];
        if (a === this.tNode.controlDirectiveIndex) continue;
        let c = i[s + 1],
          u = this.tView.data[a],
          l = this.lView[a];
        (Ni(u, l, c, n), (o = !0));
      }
    return o;
  }
  setCustomControlModelInput(e) {
    let n = this.tView.data[this.tNode.customControlIndex],
      r = this.tNode.flags & 1024 ? `value` : `checked`;
    NA(this.tNode, this.tView, this.lView, n, r, e);
  }
  customControlHasInput(e) {
    if (this.tNode.customControlIndex === -1) return !1;
    let n = this.tView.data[this.tNode.customControlIndex];
    return (n.signalFormsInputPresence ??= this._buildCustomControlInputCache(n))[e] === !0;
  }
  _buildCustomControlInputCache(e) {
    let n = {};
    for (let r in e.inputs) n[r] = !0;
    if (e.hostDirectives !== null) {
      let r = [...e.hostDirectives];
      for (; r.length > 0;) {
        let i = r.shift();
        if (typeof i != `function`) {
          for (let s in i.inputs) n[i.inputs[s]] = !0;
          let o = R_(i.directive);
          o !== null && r.push(...o);
          continue;
        }
        for (let o of i()) {
          if (typeof o == `function`) continue;
          if (o.inputs)
            for (let a = 0; a < o.inputs.length; a += 2) {
              let c = o.inputs[a + 1] || o.inputs[a];
              n[c] = !0;
            }
          let s = R_(o.directive);
          s !== null && r.push(...s);
        }
      }
    }
    return n;
  }
};
function R_(t) {
  return typeof t == `function` && `ɵdir` in t ? (t.ɵdir.hostDirectives ?? null) : null;
}
function uN(t, e, n) {
  for (let i = e.directiveStart; i < e.directiveEnd; i++)
    if (t.data[i].controlDef) {
      e.controlDirectiveIndex = i;
      break;
    }
  if (e.controlDirectiveIndex === -1) return;
  let r = t.data[e.controlDirectiveIndex].controlDef;
  if (r.passThroughInput && (e.inputs?.[r.passThroughInput]?.length ?? 0) > 1) {
    e.flags |= 4096;
    return;
  }
  lN(t, e);
}
function lN(t, e) {
  for (let n = e.directiveStart; n < e.directiveEnd; n++) {
    let r = t.data[n];
    if (!(e.directiveToIndex && !e.directiveToIndex.has(r.type))) {
      if (O_(r, `value`)) {
        ((e.flags |= 1024), (e.customControlIndex = n));
        return;
      }
      if (O_(r, `checked`)) {
        ((e.flags |= 2048), (e.customControlIndex = n));
        return;
      }
    }
  }
  if (
    e.hostDirectiveInputs !== null &&
    e.hostDirectiveOutputs !== null &&
    e.directiveToIndex !== null
  ) {
    let n = (r, i) => {
      let o = e.hostDirectiveInputs[r],
        s = e.hostDirectiveOutputs[r + `Change`];
      if (!o || !s) return !1;
      for (let a = 0; a < o.length; a += 2) {
        let c = o[a];
        for (let u = 0; u < s.length; u += 2)
          if (c === s[u])
            for (let d of e.directiveToIndex.values()) {
              if (!Array.isArray(d)) continue;
              let [f, h, g] = d;
              if (c >= h && c <= g) return ((e.flags |= i), (e.customControlIndex = f), !0);
            }
      }
      return !1;
    };
    if (n(`value`, 1024) || n(`checked`, 2048)) return;
  }
}
function O_(t, e) {
  return dN(t, e) && fN(t, e + `Change`);
}
function dN(t, e) {
  return e in t.inputs;
}
function fN(t, e) {
  return e in t.outputs;
}
var Zh = Symbol(`BINDING`);
var Fi = new E(``);
function al(t, e, n) {
  let r = n ? t.styles : null,
    i = n ? t.classes : null,
    o = 0;
  if (e !== null)
    for (let s = 0; s < e.length; s++) {
      let a = e[s];
      if (typeof a == `number`) o = a;
      else if (o == 1) i = vu(i, a);
      else if (o == 2) {
        let c = a,
          u = e[++s];
        r = vu(r, c + `: ` + u + `;`);
      }
    }
  (n ? (t.styles = r) : (t.stylesWithoutHost = r),
    n ? (t.classes = i) : (t.classesWithoutHost = i));
}
function te(t, e = 0) {
  let n = R();
  if (n === null) return j(t, e);
  return dD(ke(), n, je(t), e);
}
function Ml() {
  throw new Error(`invalid`);
}
function DE(t, e, n, r, i) {
  let o = r === null ? null : { '': -1 },
    s = i(t, n);
  if (s !== null) {
    let a = s,
      c = null,
      u = null;
    for (let l of s)
      if (l.resolveHostDirectives !== null) {
        [a, c, u] = l.resolveHostDirectives(s);
        break;
      }
    gN(t, e, n, a, o, c, u);
  }
  o !== null && r !== null && hN(n, r, o);
}
function hN(t, e, n) {
  let r = (t.localNames = []);
  for (let i = 0; i < e.length; i += 2) {
    let o = n[e[i + 1]];
    if (o == null) throw new I(-301, !1);
    r.push(e[i], o);
  }
}
function pN(t, e, n) {
  ((e.componentOffset = n), (t.components ??= []).push(e.index));
}
function gN(t, e, n, r, i, o, s) {
  let a = r.length,
    c = null;
  for (let f = 0; f < a; f++) {
    let h = r[f];
    (c === null && un(h) && ((c = h), pN(t, n, f)), Vh(el(n, e), t, h.type));
  }
  (EN(n, t.data.length, a), c?.viewProvidersResolver && c.viewProvidersResolver(c));
  for (let f = 0; f < a; f++) {
    let h = r[f];
    h.providersResolver && h.providersResolver(h);
  }
  let u = !1,
    l = !1,
    d = KD(t, e, a, null);
  a > 0 && (n.directiveToIndex = new Map());
  for (let f = 0; f < a; f++) {
    let h = r[f];
    if (
      ((n.mergedAttrs = Fo(n.mergedAttrs, h.hostAttrs)),
      vN(t, n, e, d, h),
      DN(d, h, i),
      s !== null && s.has(h))
    ) {
      let [p, m] = s.get(h);
      n.directiveToIndex.set(h.type, [d, p + n.directiveStart, m + n.directiveStart]);
    } else (o === null || !o.has(h)) && n.directiveToIndex.set(h.type, d);
    (h.contentQueries !== null && (n.flags |= 4),
      (h.hostBindings !== null || h.hostAttrs !== null || h.hostVars !== 0) && (n.flags |= 64));
    let g = h.type.prototype;
    (!u &&
      (g.ngOnChanges || g.ngOnInit || g.ngDoCheck) &&
      ((t.preOrderHooks ??= []).push(n.index), (u = !0)),
      !l &&
        (g.ngOnChanges || g.ngDoCheck) &&
        ((t.preOrderCheckHooks ??= []).push(n.index), (l = !0)),
      d++);
  }
  mN(t, n, o);
}
function mN(t, e, n) {
  for (let r = e.directiveStart; r < e.directiveEnd; r++) {
    let i = t.data[r];
    if (n === null || !n.has(i)) (k_(0, e, i, r), k_(1, e, i, r), F_(e, r, !1));
    else {
      let o = n.get(i);
      (P_(0, e, o, r), P_(1, e, o, r), F_(e, r, !0));
    }
  }
}
function k_(t, e, n, r) {
  let i = t === 0 ? n.inputs : n.outputs;
  for (let o in i)
    if (i.hasOwnProperty(o)) {
      let s;
      (t === 0 ? (s = e.inputs ??= {}) : (s = e.outputs ??= {}),
        (s[o] ??= []),
        s[o].push(r),
        EE(e, o));
    }
}
function P_(t, e, n, r) {
  let i = t === 0 ? n.inputs : n.outputs;
  for (let o in i)
    if (i.hasOwnProperty(o)) {
      let s = i[o],
        a;
      (t === 0 ? (a = e.hostDirectiveInputs ??= {}) : (a = e.hostDirectiveOutputs ??= {}),
        (a[s] ??= []),
        a[s].push(r, o),
        EE(e, s));
    }
}
function EE(t, e) {
  e === `class` ? (t.flags |= 8) : e === `style` && (t.flags |= 16);
}
function F_(t, e, n) {
  let { attrs: r, inputs: i, hostDirectiveInputs: o } = t;
  if (r === null || (!n && i === null) || (n && o === null) || Cp(t)) {
    ((t.initialInputs ??= []), t.initialInputs.push(null));
    return;
  }
  let s = null,
    a = 0;
  for (; a < r.length;) {
    let c = r[a];
    if (c === 0) {
      a += 4;
      continue;
    } else if (c === 5) {
      a += 2;
      continue;
    } else if (typeof c == `number`) break;
    if (!n && i.hasOwnProperty(c)) {
      let u = i[c];
      for (let l of u)
        if (l === e) {
          ((s ??= []), s.push(c, r[a + 1]));
          break;
        }
    } else if (n && o.hasOwnProperty(c)) {
      let u = o[c];
      for (let l = 0; l < u.length; l += 2)
        if (u[l] === e) {
          ((s ??= []), s.push(u[l + 1], r[a + 1]));
          break;
        }
    }
    a += 2;
  }
  ((t.initialInputs ??= []), t.initialInputs.push(s));
}
function vN(t, e, n, r, i) {
  t.data[r] = i;
  let s = new Ai(i.factory || (i.factory = Cr(i.type, !0)), un(i), te, null);
  ((t.blueprint[r] = s), (n[r] = s), yN(t, e, r, KD(t, n, i.hostVars, Qe), i));
}
function yN(t, e, n, r, i) {
  let o = i.hostBindings;
  if (o) {
    let s = t.hostBindingOpCodes;
    s === null && (s = t.hostBindingOpCodes = []);
    let a = ~e.index;
    (_N(s) != a && s.push(a), s.push(n, r, o));
  }
}
function _N(t) {
  let e = t.length;
  for (; e > 0;) {
    let n = t[--e];
    if (typeof n == `number` && n < 0) return n;
  }
  return 0;
}
function DN(t, e, n) {
  if (n) {
    if (e.exportAs) for (let r = 0; r < e.exportAs.length; r++) n[e.exportAs[r]] = t;
    un(e) && (n[``] = t);
  }
}
function EN(t, e, n) {
  ((t.flags |= 1), (t.directiveStart = e), (t.directiveEnd = e + n), (t.providerIndexes = e));
}
function Bp(t, e, n, r, i, o, s, a) {
  let c = e[O],
    u = c.consts,
    d = Pi(c, t, n, r, qt(u, s));
  return (
    o && DE(c, e, d, qt(u, a), i),
    (d.mergedAttrs = Fo(d.mergedAttrs, d.attrs)),
    d.attrs !== null && al(d, d.attrs, !1),
    d.mergedAttrs !== null && al(d, d.mergedAttrs, !0),
    c.queries !== null && c.queries.elementStart(c, d),
    d
  );
}
function Hp(t, e) {
  (nD(t, e), th(e) && t.queries.elementEnd(e));
}
function CN(t, e, n, r, i, o) {
  let s = e.consts,
    c = Pi(e, t, n, r, qt(s, i));
  if (((c.mergedAttrs = Fo(c.mergedAttrs, c.attrs)), o != null)) {
    let u = qt(s, o);
    c.localNames = [];
    for (let l = 0; l < u.length; l += 2) c.localNames.push(u[l], -1);
  }
  return (
    c.attrs !== null && al(c, c.attrs, !1),
    c.mergedAttrs !== null && al(c, c.mergedAttrs, !0),
    e.queries !== null && e.queries.elementStart(e, c),
    c
  );
}
var CE = typeof ShadowRoot < `u`;
var wN = typeof Document < `u`;
function IN(t) {
  return Object.keys(t).map((e) => {
    let [n, r, i] = t[e],
      o = { propName: n, templateName: e, isSignal: (r & Il.SignalBased) !== 0 };
    return (i && (o.transform = i), o);
  });
}
function bN(t) {
  return Object.keys(t).map((e) => ({ propName: t[e], templateName: e }));
}
function SN(t, e, n) {
  let r = e instanceof ve ? e : e?.injector;
  return (
    r && t.getStandaloneInjector !== null && (r = t.getStandaloneInjector(r) || r),
    r ? new il(n, r) : n
  );
}
function TN(t) {
  let e = t.get(xi, null);
  if (e === null) throw new I(407, !1);
  return {
    rendererFactory: e,
    sanitizer: t.get(mE, null),
    changeDetectionScheduler: t.get(Dn, null),
    ngReflect: !1,
    tracingService: t.get(Nn, null, { optional: !0 }),
  };
}
function MN(t, e) {
  let n = wE(t);
  return OD(e, n, n === `svg` ? wo : n === `math` ? Su : null);
}
function AN(t) {
  if (
    (t && `localName` in t && typeof t.localName == `string`
      ? t.localName
      : t?.tagName
    )?.toLowerCase() === `script`
  )
    throw new I(905, !1);
}
function wE(t) {
  return (t.selectors[0][0] || `div`).toLowerCase();
}
var Ri = class {
  componentDef;
  ngModule;
  selector;
  componentType;
  ngContentSelectors;
  isBoundToModule;
  cachedInputs = null;
  cachedOutputs = null;
  get inputs() {
    return ((this.cachedInputs ??= IN(this.componentDef.inputs)), this.cachedInputs);
  }
  get outputs() {
    return ((this.cachedOutputs ??= bN(this.componentDef.outputs)), this.cachedOutputs);
  }
  constructor(e, n) {
    ((this.componentDef = e),
      (this.ngModule = n),
      (this.componentType = e.type),
      (this.selector = HM(e.selectors)),
      (this.ngContentSelectors = e.ngContentSelectors ?? []),
      (this.isBoundToModule = !!n));
  }
  create(e, n, r, i, o, s) {
    ee(K.DynamicComponentStart);
    let a = P(null);
    try {
      let c = this.componentDef,
        u = SN(c, i || this.ngModule, e),
        l = TN(u),
        d = l.tracingService;
      return d && d.componentCreate
        ? d.componentCreate(vE(c), () => this.createComponentRef(l, u, n, r, o, s))
        : this.createComponentRef(l, u, n, r, o, s);
    } finally {
      P(a);
    }
  }
  createComponentRef(e, n, r, i, o, s) {
    let a = this.componentDef,
      c = NN(i, a, s, o),
      u = e.rendererFactory.createRenderer(null, a),
      l = i ? yA(u, i, a.encapsulation, n) : MN(a, u);
    AN(l);
    let d = n.get(Fi, null),
      f = xN(l, () => n.get(ie, null) ?? vp());
    d && d.addHost(f);
    let h = s?.some(L_) || o?.some((m) => typeof m != `function` && m.bindings.some(L_)),
      g = xp(null, c, null, 512 | ZD(a), null, null, e, u, n, null, ID(l, n, !0));
    (d &&
      CE &&
      f instanceof ShadowRoot &&
      Nu(g, () => {
        d.removeHost(f);
      }),
      (g[se] = l),
      ku(g));
    let p = null;
    try {
      let m = Bp(se, g, 2, `#host`, () => c.directiveRegistry, !0, 0);
      (FD(u, l, m),
        Lo(l, g),
        bl(c, g, m),
        yp(c, m, g),
        Hp(c, m),
        r !== void 0 && ON(m, this.ngContentSelectors, r),
        (p = Wt(m.index, g)),
        (g[xe] = p[xe]),
        Lp(c, g, null));
    } catch (m) {
      throw (p !== null && Uh(p), Uh(g), m);
    } finally {
      (ee(K.DynamicComponentEnd), Pu());
    }
    return new cl(this.componentType, g, !!h);
  }
};
function NN(t, e, n, r) {
  let i = t ? [`ng-version`, `22.1.2`] : $M(e.selectors[0]),
    o = null,
    s = null,
    a = 0;
  if (n)
    for (let l of n)
      ((a += l[Zh].requiredVars),
        l.create && ((l.targetIdx = 0), (o ??= []).push(l)),
        l.update && ((l.targetIdx = 0), (s ??= []).push(l)));
  if (r)
    for (let l = 0; l < r.length; l++) {
      let d = r[l];
      if (typeof d != `function`)
        for (let f of d.bindings) {
          a += f[Zh].requiredVars;
          let h = l + 1;
          (f.create && ((f.targetIdx = h), (o ??= []).push(f)),
            f.update && ((f.targetIdx = h), (s ??= []).push(f)));
        }
    }
  let c = [e];
  if (r)
    for (let l of r) {
      let f = _u(typeof l == `function` ? l : l.type);
      c.push(f);
    }
  return Np(0, null, RN(o, s), 1, a, c, null, null, null, [i], null);
}
function xN(t, e) {
  let n = t.getRootNode?.();
  return wN && n instanceof Document ? n.head : n && CE && n instanceof ShadowRoot ? n : e().head;
}
function RN(t, e) {
  return !t && !e
    ? null
    : (n) => {
        if (n & 1 && t) for (let r of t) r.create();
        if (n & 2 && e) for (let r of e) r.update();
      };
}
function L_(t) {
  let e = t[Zh].kind;
  return e === `input` || e === `twoWay`;
}
var cl = class extends gE {
  _rootLView;
  _hasInputBindings;
  instance;
  hostView;
  changeDetectorRef;
  componentType;
  location;
  previousInputValues = null;
  _tNode;
  constructor(e, n, r) {
    (super(),
      (this._rootLView = n),
      (this._hasInputBindings = r),
      (this._tNode = Tu(n[O], se)),
      (this.location = $o(this._tNode, n)),
      (this.instance = Wt(this._tNode.index, n)[xe]),
      (this.hostView = this.changeDetectorRef = new Rr(n, void 0)),
      (this.componentType = e));
  }
  setInput(e, n) {
    this._hasInputBindings;
    let r = this._tNode;
    if (
      ((this.previousInputValues ??= new Map()),
      this.previousInputValues.has(e) && Object.is(this.previousInputValues.get(e), n))
    )
      return;
    let i = this._rootLView;
    Fp(r, i[O], i, e, n);
    this.previousInputValues.set(e, n);
    Vp(Wt(r.index, i), 1);
  }
  get injector() {
    return new Nr(this._tNode, this._rootLView);
  }
  destroy() {
    this.hostView.destroy();
  }
  onDestroy(e) {
    this.hostView.onDestroy(e);
  }
};
function ON(t, e, n) {
  let r = (t.projection = []);
  for (let i = 0; i < e.length; i++) {
    let o = n[i];
    r.push(o != null && o.length ? Array.from(o) : null);
  }
}
var Li = (() => {
  class t {
    static __NG_ELEMENT_ID__ = kN;
  }
  return t;
})();
function kN() {
  return IE(ke(), R());
}
var Kh = class t extends Li {
  _lContainer;
  _hostTNode;
  _hostLView;
  constructor(e, n, r) {
    (super(), (this._lContainer = e), (this._hostTNode = n), (this._hostLView = r));
  }
  get element() {
    return $o(this._hostTNode, this._hostLView);
  }
  get injector() {
    return new Nr(this._hostTNode, this._hostLView);
  }
  get parentInjector() {
    let e = hp(this._hostTNode, this._hostLView);
    if (oD(e)) {
      let n = Xu(e, this._hostLView),
        r = Qu(e),
        i = n[O].data[r + 8];
      return new Nr(i, n);
    } else return new Nr(null, this._hostLView);
  }
  clear() {
    for (; this.length > 0;) this.remove(this.length - 1);
  }
  get(e) {
    let n = V_(this._lContainer);
    return (n !== null && n[e]) || null;
  }
  get length() {
    return this._lContainer.length - Ee;
  }
  createEmbeddedView(e, n, r) {
    let i, o;
    typeof r == `number` ? (i = r) : r != null && ((i = r.index), (o = r.injector));
    let s = rl(this._lContainer, e.ssrId),
      a = e.createEmbeddedViewImpl(n || {}, o, s);
    return (this.insertImpl(a, i, Vo(this._hostTNode, s)), a);
  }
  createComponent(e, n, r, i, o, s, a) {
    let c,
      u = n || {};
    ((c = u.index),
      (r = u.injector),
      (i = u.projectableNodes),
      (o = u.environmentInjector || u.ngModuleRef),
      (s = u.directives),
      (a = u.bindings));
    let l = new Ri(qn(e)),
      d = r || this.parentInjector;
    if (!o && l.ngModule == null) {
      let y = this.parentInjector.get(ve, null);
      y && (o = y);
    }
    let f = qn(l.componentType ?? {}),
      h = rl(this._lContainer, f?.id ?? null),
      g = h?.firstChild ?? null,
      p = l.create(d, i, g, o, s, a);
    return (this.insertImpl(p.hostView, c, Vo(this._hostTNode, h)), p);
  }
  insert(e, n) {
    return this.insertImpl(e, n, !0);
  }
  insertImpl(e, n, r) {
    let i = e._lView;
    if (Py(i)) {
      let a = this.indexOf(e);
      if (a !== -1) this.detach(a);
      else {
        let c = i[Be],
          u = new t(c, c[rt], c[Be]);
        u.detach(u.indexOf(e));
      }
    }
    let o = this._adjustIndex(n),
      s = this._lContainer;
    return (ba(s, i, o, r), e.attachToViewContainerRef(), qf(Mh(s), o, e), e);
  }
  move(e, n) {
    return this.insert(e, n);
  }
  indexOf(e) {
    let n = V_(this._lContainer);
    return n !== null ? n.indexOf(e) : -1;
  }
  remove(e) {
    let n = this._adjustIndex(e, -1),
      r = ha(this._lContainer, n);
    r && (Ys(Mh(this._lContainer), n), Cl(r[O], r));
  }
  detach(e) {
    let n = this._adjustIndex(e, -1),
      r = ha(this._lContainer, n);
    return r && Ys(Mh(this._lContainer), n) != null ? new Rr(r) : null;
  }
  _adjustIndex(e, n = 0) {
    return e ?? this.length + n;
  }
};
function V_(t) {
  return t[Qs];
}
function Mh(t) {
  return t[Qs] || (t[Qs] = []);
}
function IE(t, e) {
  let n,
    r = e[t.index];
  return (
    zt(r) ? (n = r) : ((n = lE(r, e, null, t)), (e[t.index] = n), Rp(e, n)),
    FN(n, e, t, r),
    new Kh(n, t, e)
  );
}
function PN(t, e) {
  let n = t[ne],
    r = n.createComment(``),
    i = Mt(e, t);
  return (Ti(n, n.parentNode(i), r, n.nextSibling(i), !1), r);
}
var FN = jN;
var LN = () => !1;
function VN(t, e, n) {
  return LN(t, e, n);
}
function jN(t, e, n, r) {
  if (t[yi]) return;
  let i;
  (n.type & 8 ? (i = Ke(r)) : (i = PN(e, n)), (t[yi] = i));
}
var Qh = class t {
  queryList;
  matches = null;
  constructor(e) {
    this.queryList = e;
  }
  clone() {
    return new t(this.queryList);
  }
  setDirty() {
    this.queryList.setDirty();
  }
};
var Xh = class t {
  queries;
  constructor(e = []) {
    this.queries = e;
  }
  createEmbeddedView(e) {
    let n = e.queries;
    if (n !== null) {
      let r = e.contentQueries !== null ? e.contentQueries[0] : n.length,
        i = [];
      for (let o = 0; o < r; o++) {
        let s = n.getByIndex(o),
          a = this.queries[s.indexInDeclarationView];
        i.push(a.clone());
      }
      return new t(i);
    }
    return null;
  }
  insertView(e) {
    this.dirtyQueriesWithMatches(e);
  }
  detachView(e) {
    this.dirtyQueriesWithMatches(e);
  }
  finishViewCreation(e) {
    this.dirtyQueriesWithMatches(e);
  }
  dirtyQueriesWithMatches(e) {
    for (let n = 0; n < this.queries.length; n++)
      Gp(e, n).matches !== null && this.queries[n].setDirty();
  }
};
var ul = class {
  flags;
  read;
  predicate;
  constructor(e, n, r = null) {
    ((this.flags = n),
      (this.read = r),
      typeof e == `string` ? (this.predicate = zN(e)) : (this.predicate = e));
  }
};
var Jh = class t {
  queries;
  constructor(e = []) {
    this.queries = e;
  }
  elementStart(e, n) {
    for (let r = 0; r < this.queries.length; r++) this.queries[r].elementStart(e, n);
  }
  elementEnd(e) {
    for (let n = 0; n < this.queries.length; n++) this.queries[n].elementEnd(e);
  }
  embeddedTView(e) {
    let n = null;
    for (let r = 0; r < this.length; r++) {
      let i = n !== null ? n.length : 0,
        o = this.getByIndex(r).embeddedTView(e, i);
      o && ((o.indexInDeclarationView = r), n !== null ? n.push(o) : (n = [o]));
    }
    return n !== null ? new t(n) : null;
  }
  template(e, n) {
    for (let r = 0; r < this.queries.length; r++) this.queries[r].template(e, n);
  }
  getByIndex(e) {
    return this.queries[e];
  }
  get length() {
    return this.queries.length;
  }
  track(e) {
    this.queries.push(e);
  }
};
var ep = class t {
  metadata;
  matches = null;
  indexInDeclarationView = -1;
  crossesNgTemplate = !1;
  _declarationNodeIndex;
  _appliesToNextNode = !0;
  constructor(e, n = -1) {
    ((this.metadata = e), (this._declarationNodeIndex = n));
  }
  elementStart(e, n) {
    this.isApplyingToNode(n) && this.matchTNode(e, n);
  }
  elementEnd(e) {
    this._declarationNodeIndex === e.index && (this._appliesToNextNode = !1);
  }
  template(e, n) {
    this.elementStart(e, n);
  }
  embeddedTView(e, n) {
    return this.isApplyingToNode(e)
      ? ((this.crossesNgTemplate = !0), this.addMatch(-e.index, n), new t(this.metadata))
      : null;
  }
  isApplyingToNode(e) {
    if (this._appliesToNextNode && (this.metadata.flags & 1) !== 1) {
      let n = this._declarationNodeIndex,
        r = e.parent;
      for (; r !== null && r.type & 8 && r.index !== n;) r = r.parent;
      return n === (r !== null ? r.index : -1);
    }
    return this._appliesToNextNode;
  }
  matchTNode(e, n) {
    let r = this.metadata.predicate;
    if (Array.isArray(r))
      for (let i = 0; i < r.length; i++) {
        let o = r[i];
        (this.matchTNodeWithReadOption(e, n, UN(n, o)),
          this.matchTNodeWithReadOption(e, n, Yu(n, e, o, !1, !1)));
      }
    else
      r === jo
        ? n.type & 4 && this.matchTNodeWithReadOption(e, n, -1)
        : this.matchTNodeWithReadOption(e, n, Yu(n, e, r, !1, !1));
  }
  matchTNodeWithReadOption(e, n, r) {
    if (r !== null) {
      let i = this.metadata.read;
      if (i !== null)
        if (i === it || i === Li || (i === jo && n.type & 4)) this.addMatch(n.index, -2);
        else {
          let o = Yu(n, e, i, !1, !1);
          o !== null && this.addMatch(n.index, o);
        }
      else this.addMatch(n.index, r);
    }
  }
  addMatch(e, n) {
    this.matches === null ? (this.matches = [e, n]) : this.matches.push(e, n);
  }
};
function UN(t, e) {
  let n = t.localNames;
  if (n !== null) {
    for (let r = 0; r < n.length; r += 2) if (n[r] === e) return n[r + 1];
  }
  return null;
}
function BN(t, e) {
  return t.type & 11 ? $o(t, e) : t.type & 4 ? Sl(t, e) : null;
}
function HN(t, e, n, r) {
  return n === -1 ? BN(e, t) : n === -2 ? $N(t, e, r) : la(t, t[O], n, e);
}
function $N(t, e, n) {
  if (n === it) return $o(e, t);
  if (n === jo) return Sl(e, t);
  if (n === Li) return IE(e, t);
}
function bE(t, e, n, r) {
  let i = e[In].queries[r];
  if (i.matches === null) {
    let o = t.data,
      s = n.matches,
      a = [];
    for (let c = 0; s !== null && c < s.length; c += 2) {
      let u = s[c];
      if (u < 0) a.push(null);
      else {
        let l = o[u];
        a.push(HN(e, l, s[c + 1], n.metadata.read));
      }
    }
    i.matches = a;
  }
  return i.matches;
}
function tp(t, e, n, r) {
  let i = t.queries.getByIndex(n),
    o = i.matches;
  if (o !== null) {
    let s = bE(t, e, i, n);
    for (let a = 0; a < o.length; a += 2) {
      let c = o[a];
      if (c > 0) r.push(s[a / 2]);
      else {
        let u = o[a + 1],
          l = e[-c];
        for (let d = Ee; d < l.length; d++) {
          let f = l[d];
          f[Tr] === f[Be] && tp(f[O], f, u, r);
        }
        if (l[_i] !== null) {
          let d = l[_i];
          for (let f = 0; f < d.length; f++) {
            let h = d[f];
            tp(h[O], h, u, r);
          }
        }
      }
    }
  }
  return r;
}
function $p(t, e) {
  return t[In].queries[e].queryList;
}
function SE(t, e, n) {
  let r = new tl((n & 4) === 4);
  return (Vy(t, e, r, r.destroy), (e[In] ??= new Xh()).queries.push(new Qh(r)) - 1);
}
function GN(t, e, n) {
  let r = re();
  return (
    r.firstCreatePass && (ME(r, new ul(t, e, n), -1), (e & 2) === 2 && (r.staticViewQueries = !0)),
    SE(r, R(), e)
  );
}
function TE(t, e, n, r) {
  let i = re();
  if (i.firstCreatePass) {
    let o = ke();
    (ME(i, new ul(e, n, r), o.index), WN(i, t), (n & 2) === 2 && (i.staticContentQueries = !0));
  }
  return SE(i, R(), n);
}
function zN(t) {
  return t.split(`,`).map((e) => e.trim());
}
function ME(t, e, n) {
  (t.queries === null && (t.queries = new Jh()), t.queries.track(new ep(e, n)));
}
function WN(t, e) {
  let n = t.contentQueries || (t.contentQueries = []);
  e !== (n.length ? n[n.length - 1] : -1) && n.push(t.queries.length - 1, e);
}
function Gp(t, e) {
  return t.queries.getByIndex(e);
}
function AE(t, e) {
  let n = t[O],
    r = Gp(n, e);
  return r.crossesNgTemplate ? tp(n, t, e, []) : bE(n, t, r, e);
}
function zp(t, e, n) {
  let r,
    i = Fs(() => {
      r._dirtyCounter();
      let o = qN(r, t);
      if (e && o === void 0) throw new I(-951, !1);
      return o;
    });
  return ((r = i[le]), (r._dirtyCounter = H(0)), (r._flatValue = void 0), i);
}
function Wp(t) {
  return zp(!0, !1, t);
}
function qp(t) {
  return zp(!0, !0, t);
}
function Yp(t) {
  return zp(!1, !1, t);
}
function NE(t, e) {
  let n = t[le];
  ((n._lView = R()),
    (n._queryIndex = e),
    (n._queryList = $p(n._lView, e)),
    n._queryList.onDirty(() => n._dirtyCounter.update((r) => r + 1)));
}
function qN(t, e) {
  let n = t._lView,
    r = t._queryIndex;
  if (n === void 0 || r === void 0 || n[U] & 4) return e ? void 0 : Bt;
  let i = $p(n, r),
    o = AE(n, r);
  return (
    i.reset(o, pD),
    e
      ? i.first
      : i._changesDetected || t._flatValue === void 0
        ? (t._flatValue = i.toArray())
        : t._flatValue
  );
}
function er(t) {
  return !!t && typeof t.then == `function`;
}
function Al(t) {
  return !!t && typeof t.subscribe == `function`;
}
var Oi = class {};
var Nl = class {};
var ll = class extends Oi {
  ngModuleType;
  _parent;
  _bootstrapComponents = [];
  _r3Injector;
  instance;
  destroyCbs = [];
  constructor(e, n, r, i = !0) {
    (super(), (this.ngModuleType = e), (this._parent = n));
    let o = my(e);
    ((this._bootstrapComponents = xM(o.bootstrap)),
      (this._r3Injector = Dh(
        e,
        n,
        [{ provide: Oi, useValue: this }, ...r],
        Gs(e),
        new Set([`environment`]),
      )),
      i && this.resolveInjectorInitializers());
  }
  resolveInjectorInitializers() {
    (this._r3Injector.resolveInjectorInitializers(),
      (this.instance = this._r3Injector.get(this.ngModuleType)));
  }
  get injector() {
    return this._r3Injector;
  }
  destroy() {
    let e = this._r3Injector;
    (!e.destroyed && e.destroy(), this.destroyCbs.forEach((n) => n()), (this.destroyCbs = null));
  }
  onDestroy(e) {
    this.destroyCbs.push(e);
  }
};
var dl = class extends Nl {
  moduleType;
  constructor(e) {
    (super(), (this.moduleType = e));
  }
  create(e) {
    return new ll(this.moduleType, e, []);
  }
};
var pa = class extends Oi {
  injector;
  instance = null;
  constructor(e) {
    super();
    let n = new di(
      [...e.providers, { provide: Oi, useValue: this }],
      e.parent || bo(),
      e.debugName,
      new Set([`environment`]),
    );
    ((this.injector = n), e.runEnvironmentInitializers && n.resolveInjectorInitializers());
  }
  destroy() {
    this.injector.destroy();
  }
  onDestroy(e) {
    this.injector.onDestroy(e);
  }
};
function Sa(t, e, n = null) {
  return new pa({ providers: t, parent: e, debugName: n, runEnvironmentInitializers: !0 }).injector;
}
var YN = (() => {
  class t {
    _injector;
    cachedInjectors = new Map();
    constructor(n) {
      this._injector = n;
    }
    getOrCreateStandaloneInjector(n) {
      if (!n.standalone) return null;
      if (!this.cachedInjectors.has(n)) {
        let r = Zf(!1, n.type),
          i = r.length > 0 ? Sa([r], this._injector, ``) : null;
        this.cachedInjectors.set(n, i);
      }
      return this.cachedInjectors.get(n);
    }
    ngOnDestroy() {
      try {
        for (let n of this.cachedInjectors.values()) n !== null && n.destroy();
      } finally {
        this.cachedInjectors.clear();
      }
    }
    static ɵprov = q({ token: t, providedIn: `environment`, factory: () => new t(j(ve)) });
  }
  return t;
})();
function Vi(t) {
  return va(() => {
    let e = xE(t),
      n = m(l({}, e), {
        decls: t.decls,
        vars: t.vars,
        template: t.template,
        consts: t.consts || null,
        ngContentSelectors: t.ngContentSelectors,
        onPush: t.changeDetection !== gp.Eager,
        directiveDefs: null,
        pipeDefs: null,
        dependencies: (e.standalone && t.dependencies) || null,
        getStandaloneInjector: e.standalone
          ? (i) => i.get(YN).getOrCreateStandaloneInjector(n)
          : null,
        getExternalStyles: null,
        signals: t.signals ?? !1,
        data: t.data || {},
        encapsulation: t.encapsulation || dn.Emulated,
        styles: t.styles || Bt,
        _: null,
        schemas: t.schemas || null,
        tView: null,
        id: ``,
      });
    (e.standalone && fn(`NgStandalone`), RE(n));
    let r = t.dependencies;
    return ((n.directiveDefs = j_(r, ZN)), (n.pipeDefs = j_(r, vy)), (n.id = XN(n)), n);
  });
}
function ZN(t) {
  return qn(t) || _u(t);
}
function KN(t, e) {
  if (t == null) return br;
  let n = {};
  for (let r in t)
    if (t.hasOwnProperty(r)) {
      let i = t[r],
        o,
        s,
        a,
        c;
      (Array.isArray(i)
        ? ((a = i[0]), (o = i[1]), (s = i[2] ?? o), (c = i[3] || null))
        : ((o = i), (s = i), (a = Il.None), (c = null)),
        (n[o] = [r, a, c]),
        (e[o] = s));
    }
  return n;
}
function QN(t) {
  if (t == null) return br;
  let e = {};
  for (let n in t) t.hasOwnProperty(n) && (e[t[n]] = n);
  return e;
}
function ot(t) {
  return va(() => {
    let e = xE(t);
    return (RE(e), e);
  });
}
function Go(t) {
  return {
    type: t.type,
    name: t.name,
    factory: null,
    pure: t.pure !== !1,
    standalone: t.standalone ?? !0,
    onDestroy: t.type.prototype.ngOnDestroy || null,
  };
}
function xE(t) {
  let e = {};
  return {
    type: t.type,
    providersResolver: null,
    viewProvidersResolver: null,
    factory: null,
    hostBindings: t.hostBindings || null,
    hostVars: t.hostVars || 0,
    hostAttrs: t.hostAttrs || null,
    contentQueries: t.contentQueries || null,
    declaredInputs: e,
    inputConfig: t.inputs || br,
    exportAs: t.exportAs || null,
    standalone: t.standalone ?? !0,
    signals: t.signals === !0,
    selectors: t.selectors || Bt,
    viewQuery: t.viewQuery || null,
    features: t.features || null,
    setInput: null,
    resolveHostDirectives: null,
    hostDirectives: null,
    controlDef: null,
    signalFormsInputPresence: null,
    inputs: KN(t.inputs, e),
    outputs: QN(t.outputs),
    debugInfo: null,
  };
}
function RE(t) {
  t.features?.forEach((e) => e(t));
}
function j_(t, e) {
  return t
    ? () => {
        let n = typeof t == `function` ? t() : t,
          r = [];
        for (let i of n) {
          let o = e(i);
          o !== null && r.push(o);
        }
        return r;
      }
    : null;
}
function XN(t) {
  let e = 0,
    n = typeof t.consts == `function` ? `` : t.consts,
    r = [
      t.selectors,
      t.ngContentSelectors,
      t.hostVars,
      t.hostAttrs,
      n,
      t.vars,
      t.decls,
      t.encapsulation,
      t.standalone,
      t.signals,
      t.exportAs,
      JSON.stringify(t.inputs),
      JSON.stringify(t.outputs),
      Object.getOwnPropertyNames(t.type.prototype),
      !!t.contentQueries,
      !!t.viewQuery,
    ];
  for (let o of r.join(`|`)) e = (Math.imul(31, e) + o.charCodeAt(0)) << 0;
  return ((e += 2147483648), `c` + e);
}
var Zp = new E(``);
function OE(t) {
  return sn([{ provide: Zp, multi: !0, useValue: t }]);
}
var Kp = (() => {
  class t {
    resolve;
    reject;
    initialized = !1;
    done = !1;
    donePromise = new Promise((n, r) => {
      ((this.resolve = n), (this.reject = r));
    });
    appInits = v(Zp, { optional: !0 }) ?? [];
    injector = v(He);
    constructor() {}
    runInitializers() {
      if (this.initialized) return;
      let n = [];
      for (let i of this.appInits) {
        let o = $e(this.injector, i);
        if (er(o)) n.push(o);
        else if (Al(o)) {
          let s = new Promise((a, c) => {
            o.subscribe({ complete: a, error: c });
          });
          n.push(s);
        }
      }
      let r = () => {
        ((this.done = !0), this.resolve());
      };
      (Promise.all(n)
        .then(() => {
          r();
        })
        .catch((i) => {
          this.reject(i);
        }),
        n.length === 0 && r(),
        (this.initialized = !0));
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
function Qp(t) {
  return (e) => {
    e.controlDef = {
      create: (n, r) => {
        n?.ɵngControlCreate(r);
      },
      update: (n, r) => {
        n?.ɵngControlUpdate?.(r);
      },
      passThroughInput: t,
    };
  };
}
function Ta(t) {
  let e = (n) => {
    let r = Array.isArray(t);
    n.hostDirectives === null
      ? ((n.resolveHostDirectives = JN), (n.hostDirectives = r ? t.map(np) : [t]))
      : r
        ? n.hostDirectives.unshift(...t.map(np))
        : n.hostDirectives.unshift(t);
  };
  return ((e.ngInherit = !0), e);
}
function JN(t) {
  let e = [],
    n = !1,
    r = null,
    i = null;
  for (let o = 0; o < t.length; o++) {
    let s = t[o];
    if (s.hostDirectives !== null) {
      let a = e.length;
      ((r ??= new Map()), (i ??= new Map()), kE(s, e, r, t), i.set(s, [a, e.length - 1]));
    }
    o === 0 && un(s) && ((n = !0), e.push(s));
  }
  for (let o = n ? 1 : 0; o < t.length; o++) e.push(t[o]);
  return (
    r !== null &&
      r.forEach((o, s) => {
        ex(s.declaredInputs, o.inputs);
      }),
    [e, r, i]
  );
}
function kE(t, e, n, r) {
  if (t.hostDirectives !== null)
    for (let i of t.hostDirectives)
      if (typeof i == `function`) {
        let o = i();
        for (let s of o) U_(np(s), e, n, r);
      } else U_(i, e, n, r);
}
function U_(t, e, n, r) {
  let i = _u(t.directive);
  if ((kE(i, e, n, r), n.has(i))) {
    let o = n.get(i);
    (B_(o, t.inputs, `input`), B_(o, t.outputs, `output`));
  } else r.includes(i) || (n.set(i, t), e.push(i));
}
function B_(t, e, n) {
  let r = n === `input` ? t.inputs : t.outputs;
  Object.keys(e).forEach((i) => {
    let o = e[i];
    (!r.hasOwnProperty(i) || r[i] === o) && (r[i] = o);
  });
}
function np(t) {
  return typeof t == `function`
    ? { directive: je(t), inputs: {}, outputs: {} }
    : { directive: je(t.directive), inputs: H_(t.inputs), outputs: H_(t.outputs) };
}
function H_(t) {
  let e = {};
  if (t !== void 0 && t.length > 0) for (let n = 0; n < t.length; n += 2) e[t[n]] = t[n + 1];
  return e;
}
function ex(t, e) {
  for (let n in e)
    if (e.hasOwnProperty(n)) {
      let r = e[n];
      t[r] = t[n];
    }
}
function tx(t) {
  return Object.getPrototypeOf(t.prototype).constructor;
}
function ji(t) {
  let e = tx(t.type),
    n = !0,
    r = [t];
  for (; e && e !== Function.prototype && e !== Object.prototype;) {
    let i,
      o = Object.hasOwn(e, Ws) ? e[Ws] : void 0,
      s = Object.hasOwn(e, qs) ? e[qs] : void 0;
    if (un(t)) i = o ?? s;
    else {
      if (o) throw new I(903, !1);
      i = s;
    }
    if (i) {
      if (n) {
        r.push(i);
        let c = t;
        ((c.inputs = Ah(t.inputs)),
          (c.declaredInputs = Ah(t.declaredInputs)),
          (c.outputs = Ah(t.outputs)));
        let u = i.hostBindings;
        u && sx(t, u);
        let l = i.viewQuery,
          d = i.contentQueries;
        if (
          (l && ix(t, l),
          d && ox(t, d),
          nx(t, i),
          gy(t.outputs, i.outputs),
          un(i) && i.data.animation)
        ) {
          let f = t.data;
          f.animation = (f.animation || []).concat(i.data.animation);
        }
      }
      let a = i.features;
      if (a)
        for (let c = 0; c < a.length; c++) {
          let u = a[c];
          (u && u.ngInherit && u(t), u === ji && (n = !1));
        }
    }
    e = Object.getPrototypeOf(e);
  }
  rx(r);
}
function nx(t, e) {
  for (let n in e.inputs) {
    if (!e.inputs.hasOwnProperty(n) || t.inputs.hasOwnProperty(n)) continue;
    let r = e.inputs[n];
    r !== void 0 && ((t.inputs[n] = r), (t.declaredInputs[n] = e.declaredInputs[n]));
  }
}
function rx(t) {
  let e = 0,
    n = null;
  for (let r = t.length - 1; r >= 0; r--) {
    let i = t[r];
    ((i.hostVars = e += i.hostVars), (i.hostAttrs = Fo(i.hostAttrs, (n = Fo(n, i.hostAttrs)))));
  }
}
function Ah(t) {
  return t === br ? {} : t === Bt ? [] : t;
}
function ix(t, e) {
  let n = t.viewQuery;
  n
    ? (t.viewQuery = (r, i) => {
        (e(r, i), n(r, i));
      })
    : (t.viewQuery = e);
}
function ox(t, e) {
  let n = t.contentQueries;
  n
    ? (t.contentQueries = (r, i, o) => {
        (e(r, i, o), n(r, i, o));
      })
    : (t.contentQueries = e);
}
function sx(t, e) {
  let n = t.hostBindings;
  n
    ? (t.hostBindings = (r, i) => {
        (e(r, i), n(r, i));
      })
    : (t.hostBindings = e);
}
function PE(t, e, n, r, i, o, s, a) {
  if (n.firstCreatePass) {
    t.mergedAttrs = Fo(t.mergedAttrs, t.attrs);
    let l = (t.tView = Np(
      2,
      t,
      i,
      o,
      s,
      n.directiveRegistry,
      n.pipeRegistry,
      null,
      n.schemas,
      n.consts,
      null,
    ));
    n.queries !== null && (n.queries.template(n, t), (l.queries = n.queries.embeddedTView(t)));
  }
  (a && (t.flags |= a), Ci(t, !1));
  let c = cx(n, e, t, r);
  (Fu() && Mp(n, e, c, t), Lo(c, e));
  let u = lE(c, e, c, t);
  ((e[r + se] = u), Rp(e, u), VN(u, t, e));
}
function ax(t, e, n, r, i, o, s, a, c, u, l) {
  let d = n + se,
    f;
  return (
    e.firstCreatePass
      ? ((f = Pi(e, d, 4, s || null, a || null)),
        xu() && DE(e, t, f, qt(e.consts, u), Op),
        nD(e, f))
      : (f = e.data[d]),
    PE(f, t, e, n, r, i, o, c),
    Mo(f) && bl(e, t, f),
    u != null && wa(t, f, l),
    f
  );
}
function ga(t, e, n, r, i, o, s, a, c, u, l) {
  let d = n + se,
    f;
  if (e.firstCreatePass) {
    if (((f = Pi(e, d, 4, s || null, a || null)), u != null)) {
      let h = qt(e.consts, u);
      f.localNames = [];
      for (let g = 0; g < h.length; g += 2) f.localNames.push(h[g], -1);
    }
  } else f = e.data[d];
  return (PE(f, t, e, n, r, i, o, c), u != null && wa(t, f, l), f);
}
function FE(t, e, n, r, i, o, s, a) {
  let c = R(),
    u = re();
  return (ax(c, u, t, e, n, r, i, qt(u.consts, o), void 0, s, a), FE);
}
var cx = ux;
function ux(t, e, n, r) {
  return (na(!0), e[ne].createComment(``));
}
var xl = (() => {
  class t {
    log(n) {
      console.log(n);
    }
    warn(n) {
      console.warn(n);
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `platform` });
  }
  return t;
})();
var Xp = new E(``);
var Ma = new E(``);
function LE() {
  _f(() => {
    throw new I(600, ``);
  });
}
var lx = 10;
var Or = (() => {
  class t {
    _runningTick = !1;
    _destroyed = !1;
    _destroyListeners = [];
    _views = [];
    internalErrorHandler = v(_t);
    afterRenderManager = v(Dl);
    zonelessEnabled = v(oa);
    rootEffectScheduler = v(ju);
    dirtyFlags = 0;
    tracingSnapshot = null;
    allTestViews = new Set();
    autoDetectTestViews = new Set();
    includeAllTestViews = !1;
    afterTick = new ue();
    get allViews() {
      return [
        ...(this.includeAllTestViews ? this.allTestViews : this.autoDetectTestViews).keys(),
        ...this._views,
      ];
    }
    get destroyed() {
      return this._destroyed;
    }
    componentTypes = [];
    components = [];
    internalPendingTask = v(Kn);
    get isStable() {
      return this.internalPendingTask.hasPendingTasksObservable.pipe(Y((n) => !n));
    }
    constructor() {
      v(Nn, { optional: !0 });
    }
    whenStable() {
      let n;
      return new Promise((r) => {
        n = this.isStable.subscribe({
          next: (i) => {
            i && r();
          },
        });
      }).finally(() => {
        n.unsubscribe();
      });
    }
    _injector = v(ve);
    _rendererFactory = null;
    get injector() {
      return this._injector;
    }
    bootstrap(n, r) {
      return this.bootstrapImpl(n, r);
    }
    bootstrapImpl(n, r, i = He.NULL) {
      return this._injector.get(Se).run(() => {
        if ((ee(K.BootstrapComponentStart), !this._injector.get(Kp).done)) throw new I(405, ``);
        let a = qn(n),
          c = this._injector.get(Oi),
          u = new Ri(a, c);
        this.componentTypes.push(n);
        let { hostElement: l, directives: d, bindings: f } = dx(r),
          h = l || u.selector,
          g = u.create(i, [], h, c.injector, d, f),
          p = g.location.nativeElement,
          m = g.injector.get(Xp, null);
        return (
          m?.registerApplication(p),
          g.onDestroy(() => {
            (this.detachView(g.hostView), ua(this.components, g), m?.unregisterApplication(p));
          }),
          this._loadComponent(g),
          ee(K.BootstrapComponentEnd, g),
          g
        );
      });
    }
    tick() {
      (this.zonelessEnabled || (this.dirtyFlags |= 1), this._tick());
    }
    _tick() {
      (ee(K.ChangeDetectionStart),
        this.tracingSnapshot !== null
          ? this.tracingSnapshot.run(_l.CHANGE_DETECTION, this.tickImpl)
          : this.tickImpl());
    }
    tickImpl = () => {
      if (this._runningTick) throw (ee(K.ChangeDetectionEnd), new I(101, !1));
      let n = P(null);
      try {
        ((this._runningTick = !0), this.synchronize());
      } finally {
        ((this._runningTick = !1),
          this.tracingSnapshot?.dispose(),
          (this.tracingSnapshot = null),
          P(n),
          this.afterTick.next(),
          ee(K.ChangeDetectionEnd));
      }
    };
    synchronize() {
      this._rendererFactory === null &&
        !this._injector.destroyed &&
        (this._rendererFactory = this._injector.get(xi, null, { optional: !0 }));
      let n = 0;
      for (; this.dirtyFlags !== 0 && n++ < lx;) {
        ee(K.ChangeDetectionSyncStart);
        try {
          this.synchronizeOnce();
        } finally {
          ee(K.ChangeDetectionSyncEnd);
        }
      }
    }
    synchronizeOnce() {
      this.dirtyFlags & 16 && ((this.dirtyFlags &= -17), this.rootEffectScheduler.flush());
      let n = !1;
      if (this.dirtyFlags & 7) {
        let r = !!(this.dirtyFlags & 1);
        ((this.dirtyFlags &= -8), (this.dirtyFlags |= 8));
        for (let { _lView: i } of this.allViews) {
          if (!r && !Js(i)) continue;
          (sE(i, r && !this.zonelessEnabled ? 0 : 1), (n = !0));
        }
        if (((this.dirtyFlags &= -5), this.syncDirtyFlagsWithViews(), this.dirtyFlags & 23)) return;
      }
      (n || (this._rendererFactory?.begin?.(), this._rendererFactory?.end?.()),
        this.dirtyFlags & 8 && ((this.dirtyFlags &= -9), this.afterRenderManager.execute()),
        this.syncDirtyFlagsWithViews());
    }
    syncDirtyFlagsWithViews() {
      if (this.allViews.some(({ _lView: n }) => Js(n))) {
        this.dirtyFlags |= 2;
        return;
      } else this.dirtyFlags &= -8;
    }
    attachView(n) {
      let r = n;
      (this._views.push(r), r.attachToAppRef(this));
    }
    detachView(n) {
      let r = n;
      (ua(this._views, r), r.detachFromAppRef());
    }
    _loadComponent(n) {
      this.attachView(n.hostView);
      try {
        this.tick();
      } catch (i) {
        this.internalErrorHandler(i);
      }
      (this.components.push(n), this._injector.get(Ma, []).forEach((i) => i(n)));
    }
    ngOnDestroy() {
      if (!this._destroyed)
        try {
          (this._destroyListeners.forEach((n) => n()),
            this._views.slice().forEach((n) => n.destroy()));
        } finally {
          ((this._destroyed = !0), (this._views = []), (this._destroyListeners = []));
        }
    }
    onDestroy(n) {
      return (this._destroyListeners.push(n), () => ua(this._destroyListeners, n));
    }
    destroy() {
      if (this._destroyed) throw new I(406, !1);
      let n = this._injector;
      n.destroy && !n.destroyed && n.destroy();
    }
    get viewCount() {
      return this._views.length;
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
function dx(t) {
  return t === void 0 || typeof t == `string` || t instanceof Element ? { hostElement: t } : t;
}
function ua(t, e) {
  let n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}
function kr(t, e, n, r) {
  let i = R();
  if (Nt(i, Mr(), e)) {
    re();
    SA(Ii(), i, t, e, n, r);
  }
  return kr;
}
var rp = class {
  destroy(e) {}
  updateValue(e, n) {}
  swap(e, n) {
    let r = Math.min(e, n),
      i = Math.max(e, n),
      o = this.detach(i);
    if (i - r > 1) {
      let s = this.detach(r);
      (this.attach(r, o), this.attach(i, s));
    } else this.attach(r, o);
  }
  move(e, n) {
    this.attach(n, this.detach(e));
  }
};
function Nh(t, e, n, r, i) {
  return t === n && Object.is(e, r) ? 1 : Object.is(i(t, e), i(n, r)) ? -1 : 0;
}
function fx(t, e, n, r) {
  let i,
    o,
    s = 0,
    a = t.length - 1;
  if (Array.isArray(e)) {
    P(r);
    let u = e.length - 1;
    for (P(null); s <= a && s <= u;) {
      let l = t.at(s),
        d = e[s],
        f = Nh(s, l, s, d, n);
      if (f !== 0) {
        (f < 0 && t.updateValue(s, d), s++);
        continue;
      }
      let h = t.at(a),
        g = e[u],
        p = Nh(a, h, u, g, n);
      if (p !== 0) {
        (p < 0 && t.updateValue(a, g), a--, u--);
        continue;
      }
      let m = n(s, l),
        y = n(a, h),
        _ = n(s, d);
      if (Object.is(_, y)) {
        let w = n(u, g);
        (Object.is(w, m) ? (t.swap(s, a), t.updateValue(a, g), u--, a--) : t.move(a, s),
          t.updateValue(s, d),
          s++);
        continue;
      }
      if (((i ??= new fl()), (o ??= G_(t, s, a, n)), ip(t, i, s, _)))
        (t.updateValue(s, d), s++, a++);
      else if (o.has(_)) (i.set(m, t.detach(s)), a--);
      else {
        let w = t.create(s, e[s]);
        (t.attach(s, w), s++, a++);
      }
    }
    for (; s <= u;) ($_(t, i, n, s, e[s]), s++);
  } else if (e != null) {
    P(r);
    let u = e[Symbol.iterator]();
    P(null);
    let l = u.next();
    for (; !l.done && s <= a;) {
      let d = t.at(s),
        f = l.value,
        h = Nh(s, d, s, f, n);
      if (h !== 0) (h < 0 && t.updateValue(s, f), s++, (l = u.next()));
      else {
        ((i ??= new fl()), (o ??= G_(t, s, a, n)));
        let g = n(s, f);
        if (ip(t, i, s, g)) (t.updateValue(s, f), s++, a++, (l = u.next()));
        else if (!o.has(g)) (t.attach(s, t.create(s, f)), s++, a++, (l = u.next()));
        else {
          let p = n(s, d);
          (i.set(p, t.detach(s)), a--);
        }
      }
    }
    for (; !l.done;) ($_(t, i, n, t.length, l.value), (l = u.next()));
  }
  for (; s <= a;) t.destroy(t.detach(a--));
  i?.forEach((u) => {
    t.destroy(u);
  });
}
function ip(t, e, n, r) {
  return e !== void 0 && e.has(r) ? (t.attach(n, e.get(r)), e.delete(r), !0) : !1;
}
function $_(t, e, n, r, i) {
  if (ip(t, e, r, n(r, i))) t.updateValue(r, i);
  else {
    let o = t.create(r, i);
    t.attach(r, o);
  }
}
function G_(t, e, n, r) {
  let i = new Set();
  for (let o = e; o <= n; o++) i.add(r(o, t.at(o)));
  return i;
}
var fl = class {
  kvMap = new Map();
  _vMap = void 0;
  has(e) {
    return this.kvMap.has(e);
  }
  delete(e) {
    if (!this.has(e)) return !1;
    let n = this.kvMap.get(e);
    return (
      this._vMap !== void 0 && this._vMap.has(n)
        ? (this.kvMap.set(e, this._vMap.get(n)), this._vMap.delete(n))
        : this.kvMap.delete(e),
      !0
    );
  }
  get(e) {
    return this.kvMap.get(e);
  }
  set(e, n) {
    if (this.kvMap.has(e)) {
      let r = this.kvMap.get(e);
      this._vMap === void 0 && (this._vMap = new Map());
      let i = this._vMap;
      for (; i.has(r);) r = i.get(r);
      i.set(r, n);
    } else this.kvMap.set(e, n);
  }
  forEach(e) {
    for (let [n, r] of this.kvMap)
      if ((e(r, n), this._vMap !== void 0)) {
        let i = this._vMap;
        for (; i.has(r);) ((r = i.get(r)), e(r, n));
      }
  }
};
function hx(t, e, n, r, i, o, s, a) {
  fn(`NgControlFlow`);
  let c = R(),
    u = re();
  return (ga(c, u, t, e, n, r, i, qt(u.consts, o), 256, s, a), Jp);
}
function Jp(t, e, n, r, i, o, s, a) {
  fn(`NgControlFlow`);
  let c = R(),
    u = re();
  return (ga(c, u, t, e, n, r, i, qt(u.consts, o), 512, s, a), Jp);
}
function px(t, e) {
  fn(`NgControlFlow`);
  let n = R(),
    r = Mr(),
    i = n[r] !== Qe ? n[r] : -1,
    o = i !== -1 ? hl(n, se + i) : void 0,
    s = 0;
  if (Nt(n, r, t)) {
    let a = P(null);
    try {
      if ((o !== void 0 && fE(o, s), t !== -1)) {
        let c = se + t,
          u = hl(n, c),
          l = cp(n[O], c),
          d = pE(u, l, n);
        ba(u, Ia(n, l, e, { dehydratedView: d }), s, Vo(l, d));
      }
    } finally {
      P(a);
    }
  } else if (o !== void 0) {
    let a = dE(o, s);
    a !== void 0 && (a[xe] = e);
  }
}
var op = class {
  lContainer;
  $implicit;
  $index;
  constructor(e, n, r) {
    ((this.lContainer = e), (this.$implicit = n), (this.$index = r));
  }
  get $count() {
    return this.lContainer.length - Ee;
  }
};
function gx(t) {
  return t;
}
function mx(t, e) {
  return e;
}
var sp = class {
  hasEmptyBlock;
  trackByFn;
  liveCollection;
  constructor(e, n, r) {
    ((this.hasEmptyBlock = e), (this.trackByFn = n), (this.liveCollection = r));
  }
};
function vx(t, e, n, r, i, o, s, a, c, u, l, d, f) {
  fn(`NgControlFlow`);
  let h = R(),
    g = re(),
    p = c !== void 0,
    m = R(),
    _ = new sp(p, a ? s.bind(m[gt][xe]) : s);
  ((m[se + t] = _),
    ga(h, g, t + 1, e, n, r, i, qt(g.consts, o), 256),
    p && ga(h, g, t + 2, c, u, l, d, qt(g.consts, f), 512));
}
var ap = class extends rp {
  lContainer;
  hostLView;
  templateTNode;
  operationsCounter = void 0;
  needsIndexUpdate = !1;
  constructor(e, n, r) {
    (super(), (this.lContainer = e), (this.hostLView = n), (this.templateTNode = r));
  }
  get length() {
    return this.lContainer.length - Ee;
  }
  at(e) {
    return this.getLView(e)[xe].$implicit;
  }
  attach(e, n) {
    let r = n[gi];
    ((this.needsIndexUpdate ||= e !== this.length),
      ba(this.lContainer, n, e, Vo(this.templateTNode, r)),
      _x(this.lContainer, e));
  }
  detach(e) {
    return (
      (this.needsIndexUpdate ||= e !== this.length - 1),
      Dx(this.lContainer, e),
      Ex(this.lContainer, e)
    );
  }
  create(e, n) {
    let r = rl(this.lContainer, this.templateTNode.tView.ssrId);
    return Ia(this.hostLView, this.templateTNode, new op(this.lContainer, n, e), {
      dehydratedView: r,
    });
  }
  destroy(e) {
    Cl(e[O], e);
  }
  updateValue(e, n) {
    this.getLView(e)[xe].$implicit = n;
  }
  reset() {
    this.needsIndexUpdate = !1;
  }
  updateIndexes() {
    if (this.needsIndexUpdate)
      for (let e = 0; e < this.length; e++) this.getLView(e)[xe].$index = e;
  }
  getLView(e) {
    return Cx(this.lContainer, e);
  }
};
function yx(t) {
  let e = P(null),
    n = At();
  try {
    let r = R(),
      i = r[O],
      o = r[n],
      s = n + 1,
      a = hl(r, s);
    if (o.liveCollection === void 0) o.liveCollection = new ap(a, r, cp(i, s));
    else o.liveCollection.reset();
    let c = o.liveCollection;
    if ((fx(c, t, o.trackByFn, e), c.updateIndexes(), o.hasEmptyBlock)) {
      let u = Mr(),
        l = c.length === 0;
      if (Nt(r, u, l)) {
        let d = n + 2,
          f = hl(r, d);
        if (l) {
          let h = cp(i, d),
            g = pE(f, h, r);
          ba(f, Ia(r, h, void 0, { dehydratedView: g }), 0, Vo(h, g));
        } else (i.firstUpdatePass && QA(f), fE(f, 0));
      }
    }
  } finally {
    P(e);
  }
}
function hl(t, e) {
  return t[e];
}
function _x(t, e) {
  if (t.length <= Ee) return;
  let r = t[Ee + e],
    i = r ? r[Sn] : void 0;
  if (r && i && i.detachedLeaveAnimationFns && i.detachedLeaveAnimationFns.length > 0) {
    let o = r[wn];
    (KM(o, i), xr.delete(r[bn]), (i.detachedLeaveAnimationFns = void 0));
  }
}
function Dx(t, e) {
  if (t.length <= Ee) return;
  let r = t[Ee + e],
    i = r ? r[Sn] : void 0;
  i && i.leave && i.leave.size > 0 && (i.detachedLeaveAnimationFns = []);
}
function Ex(t, e) {
  return ha(t, e);
}
function Cx(t, e) {
  return dE(t, e);
}
function cp(t, e) {
  return Tu(t, e);
}
function VE(t, e, n) {
  let r = R();
  if (Nt(r, Mr(), e)) {
    re();
    JD(Ii(), r, t, e, r[ne], n);
  }
  return VE;
}
function up(t, e, n, r, i) {
  Fp(e, t, n, i ? `class` : `style`, r);
}
function pl(t, e, n, r) {
  let i = R(),
    o = i[O],
    s = t + se,
    a = o.firstCreatePass ? Bp(s, i, 2, e, Op, xu(), n, r) : o.data[s];
  if (Zn(a)) {
    let c = i[cn].tracingService;
    if (c && c.componentCreate) {
      let u = o.data[a.directiveStart + a.componentOffset];
      return c.componentCreate(vE(u), () => (z_(t, e, i, a, r), pl));
    }
  }
  return (z_(t, e, i, a, r), pl);
}
function z_(t, e, n, r, i) {
  if ((kp(r, n, t, e, UE), Mo(r))) {
    let o = n[O];
    (bl(o, n, r), yp(o, r, n));
  }
  i != null && wa(n, r);
}
function eg() {
  let t = re(),
    n = Pp(ke());
  return (
    t.firstCreatePass && Hp(t, n),
    uh(n) && lh(),
    ah(),
    n.classesWithoutHost != null && S0(n) && up(t, n, R(), n.classesWithoutHost, !0),
    n.stylesWithoutHost != null && T0(n) && up(t, n, R(), n.stylesWithoutHost, !1),
    eg
  );
}
function Rl(t, e, n, r) {
  return (pl(t, e, n, r), eg(), Rl);
}
function tg(t, e, n, r) {
  let i = R(),
    o = i[O],
    s = t + se,
    a = o.firstCreatePass ? CN(s, o, 2, e, n, r) : o.data[s];
  return (kp(a, i, t, e, UE), r != null && wa(i, a), tg);
}
function ng() {
  return (uh(Pp(ke())) && lh(), ah(), ng);
}
function jE(t, e, n, r) {
  return (tg(t, e, n, r), ng(), jE);
}
var UE = (t, e, n, r, i) => (na(!0), OD(e[ne], r, _h()));
function rg(t, e, n) {
  let r = R(),
    i = r[O],
    o = t + se,
    s = i.firstCreatePass ? Bp(o, r, 8, `ng-container`, Op, xu(), e, n) : i.data[o];
  if ((kp(s, r, t, `ng-container`, wx), Mo(s))) {
    let a = r[O];
    (bl(a, r, s), yp(a, s, r));
  }
  return (n != null && wa(r, s), rg);
}
function ig() {
  let t = re(),
    n = Pp(ke());
  return (t.firstCreatePass && Hp(t, n), ig);
}
function BE(t, e, n) {
  return (rg(t, e, n), ig(), BE);
}
var wx = (t, e, n, r, i) => (na(!0), CM(e[ne], ``));
function Ix() {
  return R();
}
function HE(t, e, n) {
  let r = R();
  if (Nt(r, Mr(), e)) {
    re();
    eE(Ii(), r, t, e, r[ne], n);
  }
  return HE;
}
var sa = void 0;
function bx(t) {
  let e = Math.floor(Math.abs(t)),
    n = t.toString().replace(/^[^.]*\.?/, ``).length;
  return e === 1 && n === 0 ? 1 : 5;
}
var Sx = [
  `en`,
  [
    [`a`, `p`],
    [`AM`, `PM`],
  ],
  [[`AM`, `PM`]],
  [
    [`S`, `M`, `T`, `W`, `T`, `F`, `S`],
    [`Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`],
    [`Sunday`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`],
    [`Su`, `Mo`, `Tu`, `We`, `Th`, `Fr`, `Sa`],
  ],
  sa,
  [
    [`J`, `F`, `M`, `A`, `M`, `J`, `J`, `A`, `S`, `O`, `N`, `D`],
    [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`],
    [
      `January`,
      `February`,
      `March`,
      `April`,
      `May`,
      `June`,
      `July`,
      `August`,
      `September`,
      `October`,
      `November`,
      `December`,
    ],
  ],
  sa,
  [
    [`B`, `A`],
    [`BC`, `AD`],
    [`Before Christ`, `Anno Domini`],
  ],
  0,
  [6, 0],
  [`M/d/yy`, `MMM d, y`, `MMMM d, y`, `EEEE, MMMM d, y`],
  [`h:mm a`, `h:mm:ss a`, `h:mm:ss a z`, `h:mm:ss a zzzz`],
  [`{1}, {0}`, sa, sa, sa],
  [`.`, `,`, `;`, `%`, `+`, `-`, `E`, `×`, `‰`, `∞`, `NaN`, `:`],
  [`#,##0.###`, `#,##0%`, `¤#,##0.00`, `#E0`],
  `USD`,
  `$`,
  `US Dollar`,
  {},
  `ltr`,
  bx,
];
var xh = Object.create(null);
function xt(t) {
  let e = Tx(t),
    n = W_(e);
  if (n) return n;
  let r = e.split(`-`)[0];
  if (((n = W_(r)), n)) return n;
  if (r === `en`) return Sx;
  throw new I(701, !1);
}
function W_(t) {
  if (!(t in xh)) {
    let e = $t.ng && $t.ng.common && $t.ng.common.locales && $t.ng.common.locales[t];
    return (e !== void 0 && (xh[t] = e), e);
  }
  return xh[t];
}
var Pe = {
  LocaleId: 0,
  DayPeriodsFormat: 1,
  DayPeriodsStandalone: 2,
  DaysFormat: 3,
  DaysStandalone: 4,
  MonthsFormat: 5,
  MonthsStandalone: 6,
  Eras: 7,
  FirstDayOfWeek: 8,
  WeekendRange: 9,
  DateFormat: 10,
  TimeFormat: 11,
  DateTimeFormat: 12,
  NumberSymbols: 13,
  NumberFormats: 14,
  CurrencyCode: 15,
  CurrencySymbol: 16,
  CurrencyName: 17,
  Currencies: 18,
  Directionality: 19,
  PluralCase: 20,
  ExtraData: 21,
};
function Tx(t) {
  return t.toLowerCase().replace(/_/g, `-`);
}
var Aa = `en-US`;
function $E(t) {
  typeof t == `string` && t.toLowerCase().replace(/_/g, `-`);
}
function zo(t, e, n) {
  let r = R(),
    i = re(),
    o = ke();
  return (zE(i, r, r[ne], o, t, e, n), zo);
}
function GE(t, e, n) {
  let r = R(),
    i = re(),
    o = ke();
  return ((o.type & 3 || n) && Up(o, i, r, n, r[ne], t, e, Mi(o, r, e)), GE);
}
function zE(t, e, n, r, i, o, s) {
  let a = !0,
    c = null;
  if (((r.type & 3 || s) && ((c ??= Mi(r, e, o)), Up(r, t, e, s, n, i, o, c) && (a = !1)), a)) {
    let u = r.outputs?.[i],
      l = r.hostDirectiveOutputs?.[i];
    if (l && l.length)
      for (let d = 0; d < l.length; d += 2) {
        let f = l[d],
          h = l[d + 1];
        ((c ??= Mi(r, e, o)), ol(r, e, f, h, i, c));
      }
    if (u && u.length) for (let d of u) ((c ??= Mi(r, e, o)), ol(r, e, d, i, i, c));
  }
}
function Ax(t = 1) {
  return Xy(t);
}
function Nx(t, e) {
  let n = null,
    r = LM(t);
  for (let i = 0; i < e.length; i++) {
    let o = e[i];
    if (o === `*`) {
      n = i;
      continue;
    }
    if (r === null ? BD(t, o, !0) : UM(r, o)) return i;
  }
  return n;
}
function xx(t) {
  let e = R()[gt][rt];
  if (!e.projection) {
    let r = (e.projection = wy(t ? t.length : 1, null)),
      i = r.slice(),
      o = e.child;
    for (; o !== null;) {
      if (o.type !== 128) {
        let s = t ? Nx(o, t) : 0;
        s !== null && (i[s] ? (i[s].projectionNext = o) : (r[s] = o), (i[s] = o));
      }
      o = o.next;
    }
  }
}
function Rx(t, e = 0, n, r, i, o) {
  let s = R(),
    a = re(),
    c = r ? t + 1 : null;
  c !== null && ga(s, a, c, r, i, o, null, n);
  let u = Pi(a, se + t, 16, null, n || null);
  (u.projection === null && (u.projection = e), hh());
  let d = !s[gi] || ch();
  s[gt][rt].projection[u.projection] === null && c !== null
    ? Ox(s, a, c)
    : d && !ml(u) && dA(a, s, u);
}
function Ox(t, e, n) {
  let r = se + n,
    i = e.data[r],
    o = t[r],
    s = rl(o, i.tView.ssrId);
  ba(o, Ia(t, i, void 0, { dehydratedView: s }), 0, Vo(i, s));
}
function og(t, e, n, r) {
  return (TE(t, e, n, r), og);
}
function WE(t) {
  let e = R(),
    n = re(),
    r = Ou();
  ta(r + 1);
  let i = Gp(n, r);
  if (t.dirty && ky(e) === ((i.metadata.flags & 2) === 2)) {
    if (i.matches === null) t.reset([]);
    else {
      let o = AE(e, r);
      (t.reset(o, pD), t.notifyOnChanges());
    }
    return !0;
  }
  return !1;
}
function qE() {
  return $p(R(), Ou());
}
function YE(t, e, n, r, i) {
  return (NE(e, TE(t, n, r, i)), YE);
}
function ZE(t, e, n, r) {
  return (NE(t, GN(e, n, r)), ZE);
}
function kx(t = 1) {
  ta(Ou() + t);
}
function Px(t) {
  return No(ph(), se + t);
}
function zu(t, e) {
  return (t << 17) | (e << 2);
}
function ki(t) {
  return (t >> 17) & 32767;
}
function Fx(t) {
  return (t & 2) == 2;
}
function Lx(t, e) {
  return (t & 131071) | (e << 17);
}
function lp(t) {
  return t | 2;
}
function Uo(t) {
  return (t & 131068) >> 2;
}
function Rh(t, e) {
  return (t & -131069) | (e << 2);
}
function Vx(t) {
  return (t & 1) === 1;
}
function dp(t) {
  return t | 1;
}
function jx(t, e, n, r, i, o) {
  let s = o ? e.classBindings : e.styleBindings,
    a = ki(s),
    c = Uo(s);
  t[r] = n;
  let u = !1,
    l;
  if (Array.isArray(n)) {
    let d = n;
    ((l = d[1]), (l === null || Io(d, l) > 0) && (u = !0));
  } else l = n;
  if (i)
    if (c !== 0) {
      let f = ki(t[a + 1]);
      ((t[r + 1] = zu(f, a)),
        f !== 0 && (t[f + 1] = Rh(t[f + 1], r)),
        (t[a + 1] = Lx(t[a + 1], r)));
    } else ((t[r + 1] = zu(a, 0)), a !== 0 && (t[a + 1] = Rh(t[a + 1], r)), (a = r));
  else ((t[r + 1] = zu(c, 0)), a === 0 ? (a = r) : (t[c + 1] = Rh(t[c + 1], r)), (c = r));
  (u && (t[r + 1] = lp(t[r + 1])),
    q_(t, l, r, !0),
    q_(t, l, r, !1),
    Ux(e, l, t, r, o),
    (s = zu(a, c)),
    o ? (e.classBindings = s) : (e.styleBindings = s));
}
function Ux(t, e, n, r, i) {
  let o = i ? t.residualClasses : t.residualStyles;
  o != null && typeof e == `string` && Io(o, e) >= 0 && (n[r + 1] = dp(n[r + 1]));
}
function q_(t, e, n, r) {
  let i = t[n + 1],
    o = e === null,
    s = r ? ki(i) : Uo(i),
    a = !1;
  for (; s !== 0 && (a === !1 || o);) {
    let c = t[s],
      u = t[s + 1];
    (Bx(c, e) && ((a = !0), (t[s + 1] = r ? dp(u) : lp(u))), (s = r ? ki(u) : Uo(u)));
  }
  a && (t[n + 1] = r ? lp(i) : dp(i));
}
function Bx(t, e) {
  return t === null || e == null || (Array.isArray(t) ? t[1] : t) === e
    ? !0
    : Array.isArray(t) && typeof e == `string`
      ? Io(t, e) >= 0
      : !1;
}
var Ge = { textEnd: 0, key: 0, keyEnd: 0, value: 0, valueEnd: 0 };
function KE(t) {
  return t.substring(Ge.key, Ge.keyEnd);
}
function Hx(t) {
  return t.substring(Ge.value, Ge.valueEnd);
}
function $x(t) {
  return (JE(t), QE(t, Bo(t, 0, Ge.textEnd)));
}
function QE(t, e) {
  let n = Ge.textEnd;
  return n === e ? -1 : ((e = Ge.keyEnd = zx(t, (Ge.key = e), n)), Bo(t, e, n));
}
function Gx(t) {
  return (JE(t), XE(t, Bo(t, 0, Ge.textEnd)));
}
function XE(t, e) {
  let n = Ge.textEnd,
    r = (Ge.key = Bo(t, e, n));
  return n === r
    ? -1
    : ((r = Ge.keyEnd = Wx(t, r, n)),
      (r = Y_(t, r, n, 58)),
      (r = Ge.value = Bo(t, r, n)),
      (r = Ge.valueEnd = qx(t, r, n)),
      Y_(t, r, n, 59));
}
function JE(t) {
  ((Ge.key = 0), (Ge.keyEnd = 0), (Ge.value = 0), (Ge.valueEnd = 0), (Ge.textEnd = t.length));
}
function Bo(t, e, n) {
  for (; e < n && t.charCodeAt(e) <= 32;) e++;
  return e;
}
function zx(t, e, n) {
  for (; e < n && t.charCodeAt(e) > 32;) e++;
  return e;
}
function Wx(t, e, n) {
  let r;
  for (
    ;
    e < n &&
    ((r = t.charCodeAt(e)) === 45 ||
      r === 95 ||
      ((r & -33) >= 65 && (r & -33) <= 90) ||
      (r >= 48 && r <= 57));
  )
    e++;
  return e;
}
function Y_(t, e, n, r) {
  return ((e = Bo(t, e, n)), e < n && e++, e);
}
function qx(t, e, n) {
  let r = -1,
    i = -1,
    o = -1,
    s = e,
    a = s;
  for (; s < n;) {
    let c = t.charCodeAt(s++);
    if (c === 59) return a;
    (c === 34 || c === 39
      ? (a = s = Z_(t, c, s, n))
      : e === s - 4 && o === 85 && i === 82 && r === 76 && c === 40
        ? (a = s = Z_(t, 41, s, n))
        : c > 32 && (a = s),
      (o = i),
      (i = r),
      (r = c & -33));
  }
  return a;
}
function Z_(t, e, n, r) {
  let i = -1,
    o = n;
  for (; o < r;) {
    let s = t.charCodeAt(o++);
    if (s == e && i !== 92) return o;
    s == 92 && i === 92 ? (i = 0) : (i = s);
  }
  throw new Error();
}
function Wo(t, e, n) {
  return (eC(t, e, n, !1), Wo);
}
function sg(t, e) {
  return (eC(t, e, null, !0), sg);
}
function Yx(t) {
  tC(iC, Zx, t, !1);
}
function Zx(t, e) {
  for (let n = Gx(e); n >= 0; n = XE(e, n)) iC(t, KE(e), Hx(e));
}
function Kx(t) {
  tC(rR, Qx, t, !0);
}
function Qx(t, e) {
  for (let n = $x(e); n >= 0; n = QE(e, n)) Zs(t, KE(e), !0);
}
function eC(t, e, n, r) {
  let i = R(),
    o = re(),
    s = ea(2);
  if ((o.firstUpdatePass && rC(o, t, s, r), e !== Qe && Nt(i, s, e))) {
    let a = o.data[At()];
    oC(o, a, i, i[ne], t, (i[s + 1] = oR(e, n)), r, s);
  }
}
function tC(t, e, n, r) {
  let i = re(),
    o = ea(2);
  i.firstUpdatePass && rC(i, null, o, r);
  let s = R();
  if (n !== Qe && Nt(s, o, n)) {
    let a = i.data[At()];
    if (sC(a, r) && !nC(i, o)) {
      let c = r ? a.classesWithoutHost : a.stylesWithoutHost;
      (c !== null && (n = vu(c, n || ``)), up(i, a, s, n, r));
    } else iR(i, a, s, s[ne], s[o + 1], (s[o + 1] = nR(t, e, n)), r, o);
  }
}
function nC(t, e) {
  return e >= t.expandoStartIndex;
}
function rC(t, e, n, r) {
  let i = t.data;
  if (i[n + 1] === null) {
    let o = i[At()],
      s = nC(t, n);
    (sC(o, r) && e === null && !s && (e = !1), (e = Xx(i, o, e, r)), jx(i, o, e, n, s, r));
  }
}
function Xx(t, e, n, r) {
  let i = Yy(t),
    o = r ? e.residualClasses : e.residualStyles;
  if (i === null)
    (r ? e.classBindings : e.styleBindings) === 0 &&
      ((n = Oh(null, t, e, n, r)), (n = ma(n, e.attrs, r)), (o = null));
  else {
    let s = e.directiveStylingLast;
    if (s === -1 || t[s] !== i)
      if (((n = Oh(i, t, e, n, r)), o === null)) {
        let c = Jx(t, e, r);
        c !== void 0 &&
          Array.isArray(c) &&
          ((c = Oh(null, t, e, c[1], r)), (c = ma(c, e.attrs, r)), eR(t, e, r, c));
      } else o = tR(t, e, r);
  }
  return (o !== void 0 && (r ? (e.residualClasses = o) : (e.residualStyles = o)), n);
}
function Jx(t, e, n) {
  let r = n ? e.classBindings : e.styleBindings;
  if (Uo(r) !== 0) return t[ki(r)];
}
function eR(t, e, n, r) {
  let i = n ? e.classBindings : e.styleBindings;
  t[ki(i)] = r;
}
function tR(t, e, n) {
  let r,
    i = e.directiveEnd;
  for (let o = 1 + e.directiveStylingLast; o < i; o++) {
    let s = t[o].hostAttrs;
    r = ma(r, s, n);
  }
  return ma(r, e.attrs, n);
}
function Oh(t, e, n, r, i) {
  let o = null,
    s = n.directiveEnd,
    a = n.directiveStylingLast;
  for (
    a === -1 ? (a = n.directiveStart) : a++;
    a < s && ((o = e[a]), (r = ma(r, o.hostAttrs, i)), o !== t);
  )
    a++;
  return (t !== null && (n.directiveStylingLast = a), r);
}
function ma(t, e, n) {
  let r = n ? 1 : 2,
    i = -1;
  if (e !== null)
    for (let o = 0; o < e.length; o++) {
      let s = e[o];
      typeof s == `number`
        ? (i = s)
        : i === r &&
          (Array.isArray(t) || (t = t === void 0 ? [] : [``, t]), Zs(t, s, n ? !0 : e[++o]));
    }
  return t === void 0 ? null : t;
}
function nR(t, e, n) {
  if (n == null || n === ``) return Bt;
  let r = [],
    i = Qn(n);
  if (Array.isArray(i)) for (let o = 0; o < i.length; o++) t(r, i[o], !0);
  else if (i instanceof Set) for (let o of i) t(r, o, !0);
  else if (typeof i == `object`) for (let o in i) Object.hasOwn(i, o) && t(r, o, i[o]);
  else typeof i == `string` && e(r, i);
  return r;
}
function iC(t, e, n) {
  Zs(t, e, Qn(n));
}
function rR(t, e, n) {
  let r = String(e);
  r !== `` && !r.includes(` `) && Zs(t, r, n);
}
function iR(t, e, n, r, i, o, s, a) {
  i === Qe && (i = Bt);
  let c = 0,
    u = 0,
    l = 0 < i.length ? i[0] : null,
    d = 0 < o.length ? o[0] : null;
  for (; l !== null || d !== null;) {
    let f = c < i.length ? i[c + 1] : void 0,
      h = u < o.length ? o[u + 1] : void 0,
      g = null,
      p;
    (l === d
      ? ((c += 2), (u += 2), f !== h && ((g = d), (p = h)))
      : d === null || (l !== null && l < d)
        ? ((c += 2), (g = l))
        : ((u += 2), (g = d), (p = h)),
      g !== null && oC(t, e, n, r, g, p, s, a),
      (l = c < i.length ? i[c] : null),
      (d = u < o.length ? o[u] : null));
  }
}
function oC(t, e, n, r, i, o, s, a) {
  if (!(e.type & 3)) return;
  let c = t.data,
    u = c[a + 1];
  if (!gl(Vx(u) ? K_(c, e, n, i, Uo(u), s) : void 0)) {
    gl(o) || (Fx(u) && (o = K_(c, null, n, i, a, s)));
    hA(r, s, nh(At(), n), i, o);
  }
}
function K_(t, e, n, r, i, o) {
  let s = e === null,
    a;
  for (; i > 0;) {
    let c = t[i],
      u = Array.isArray(c),
      l = u ? c[1] : c,
      d = l === null,
      f = n[i + 1];
    f === Qe && (f = d ? Bt : void 0);
    let h = d ? Iu(f, r) : l === r ? f : void 0;
    if ((u && !gl(h) && (h = Iu(c, r)), gl(h) && ((a = h), s))) return a;
    let g = t[i + 1];
    i = s ? ki(g) : Uo(g);
  }
  if (e !== null) {
    let c = o ? e.residualClasses : e.residualStyles;
    c != null && (a = Iu(c, r));
  }
  return a;
}
function gl(t) {
  return t !== void 0;
}
function oR(t, e) {
  return (
    t == null ||
      t === `` ||
      (typeof e == `string` ? (t = Qn(t) + e) : typeof t == `object` && (t = Gs(Qn(t)))),
    t
  );
}
function sC(t, e) {
  return (t.flags & (e ? 8 : 16)) !== 0;
}
function sR(t, e = ``) {
  let n = R(),
    r = re(),
    i = t + se,
    o = r.firstCreatePass ? Pi(r, i, 1, e, null) : r.data[i],
    s = aR(r, n, o, e);
  ((n[i] = s), Fu() && Mp(r, n, s, o), Ci(o, !1));
}
var aR = (t, e, n, r) => (na(!0), DM(e[ne], r));
function cR(t, e, n, r = ``) {
  return Nt(t, Mr(), n) ? e + Cn(n) + r : Qe;
}
function uR(t, e, n, r, i, o = ``) {
  let a = jp(t, mh(), n, i);
  return (ea(2), a ? e + Cn(n) + r + Cn(i) + o : Qe);
}
function lR(t, e, n, r, i, o, s, a = ``) {
  let u = yE(t, mh(), n, i, s);
  return (ea(3), u ? e + Cn(n) + r + Cn(i) + o + Cn(s) + a : Qe);
}
function aC(t) {
  return (ag(``, t), aC);
}
function ag(t, e, n) {
  let r = R(),
    i = cR(r, t, e, n);
  return (i !== Qe && cg(r, At(), i), ag);
}
function cC(t, e, n, r, i) {
  let o = R(),
    s = uR(o, t, e, n, r, i);
  return (s !== Qe && cg(o, At(), s), cC);
}
function uC(t, e, n, r, i, o, s) {
  let a = R(),
    c = lR(a, t, e, n, r, i, o, s);
  return (c !== Qe && cg(a, At(), c), uC);
}
function cg(t, e, n) {
  let r = nh(e, t);
  EM(t[ne], r, n);
}
function lC(t, e, n) {
  Uu(e) && (e = e());
  let r = R();
  if (Nt(r, Mr(), e)) {
    re();
    JD(Ii(), r, t, e, r[ne], n);
  }
  return lC;
}
function dR(t, e) {
  let n = Uu(t);
  return (n && t.set(e), n);
}
function dC(t, e) {
  let n = R(),
    r = re(),
    i = ke();
  return (zE(r, n, n[ne], i, t, e), dC);
}
var fC = {};
function hC(t) {
  fn(`NgLet`);
  let e = re(),
    n = R(),
    r = t + se;
  return (Ci(Pi(e, r, 128, null, null), !1), Xs(e, n, r, fC), hC);
}
function fR(t) {
  return (Xs(re(), R(), At(), t), t);
}
function hR(t) {
  let n = No(ph(), se + t);
  if (n === fC) throw new I(314, !1);
  return n;
}
function Q_(t, e, n) {
  let r = re();
  r.firstCreatePass && pC(e, r.data, r.blueprint, un(t), n);
}
function pC(t, e, n, r, i) {
  if (((t = je(t)), Array.isArray(t))) for (let o = 0; o < t.length; o++) pC(t[o], e, n, r, i);
  else {
    let o = re(),
      s = R(),
      a = ke(),
      c = li(t) ? t : je(t.provide),
      u = Qf(t),
      l = a.providerIndexes & 1048575,
      d = a.directiveStart,
      f = a.providerIndexes >> 20;
    if (li(t) || !t.multi) {
      let h = new Ai(u, i, te, null),
        g = Ph(c, e, i ? l : l + f, d);
      g === -1
        ? (Vh(el(a, s), o, c),
          kh(o, t, e.length),
          e.push(c),
          a.directiveStart++,
          a.directiveEnd++,
          i && (a.providerIndexes += 1048576),
          n.push(h),
          s.push(h))
        : ((n[g] = h), (s[g] = h));
    } else {
      let h = Ph(c, e, l + f, d),
        g = Ph(c, e, l, l + f),
        p = h >= 0 && n[h],
        m = g >= 0 && n[g];
      if ((i && !m) || (!i && !p)) {
        Vh(el(a, s), o, c);
        let y = mR(i ? gR : pR, n.length, i, r, u, t);
        (!i && m && (n[g].providerFactory = y),
          kh(o, t, e.length, 0),
          e.push(c),
          a.directiveStart++,
          a.directiveEnd++,
          i && (a.providerIndexes += 1048576),
          n.push(y),
          s.push(y));
      } else {
        let y = gC(n[i ? g : h], u, !i && r);
        kh(o, t, h > -1 ? h : g, y);
      }
      !i && r && m && n[g].componentProviders++;
    }
  }
}
function kh(t, e, n, r) {
  let i = li(e),
    o = Ay(e);
  if (i || o) {
    let c = (o ? je(e.useClass) : e).prototype.ngOnDestroy;
    if (c) {
      let u = t.destroyHooks || (t.destroyHooks = []);
      if (!i && e.multi) {
        let l = u.indexOf(n);
        l === -1 ? u.push(n, [r, c]) : u[l + 1].push(r, c);
      } else u.push(n, c);
    }
  }
}
function gC(t, e, n) {
  return (n && t.componentProviders++, t.multi.push(e) - 1);
}
function Ph(t, e, n, r) {
  for (let i = n; i < r; i++) if (e[i] === t) return i;
  return -1;
}
function pR(t, e, n, r, i) {
  return fp(this.multi, []);
}
function gR(t, e, n, r, i) {
  let o = this.multi,
    s;
  if (this.providerFactory) {
    let a = this.providerFactory.componentProviders,
      c = la(r, r[O], this.providerFactory.index, i);
    ((s = c.slice(0, a)), fp(o, s));
    for (let u = a; u < c.length; u++) s.push(c[u]);
  } else ((s = []), fp(o, s));
  return s;
}
function fp(t, e) {
  for (let n = 0; n < t.length; n++) {
    let r = t[n];
    e.push(r());
  }
  return e;
}
function mR(t, e, n, r, i, o) {
  let s = new Ai(t, n, te, null);
  return ((s.multi = []), (s.index = e), (s.componentProviders = 0), gC(s, i, r && !n), s);
}
function Na(t, e) {
  return (n) => {
    ((n.providersResolver = (r, i) => Q_(r, i ? i(t) : t, !1)),
      e && (n.viewProvidersResolver = (r, i) => Q_(r, i ? i(e) : e, !0)));
  };
}
function vR(t, e) {
  let n = wi() + t,
    r = R();
  return r[n] === Qe ? Tl(r, n, e()) : nN(r, n);
}
function yR(t, e, n) {
  return mC(R(), wi(), t, e, n);
}
function _R(t, e, n, r) {
  return vC(R(), wi(), t, e, n, r);
}
function ug(t, e) {
  let n = t[e];
  return n === Qe ? void 0 : n;
}
function mC(t, e, n, r, i, o) {
  let s = e + n;
  return Nt(t, s, i) ? Tl(t, s + 1, o ? r.call(o, i) : r(i)) : ug(t, s + 1);
}
function vC(t, e, n, r, i, o, s) {
  let a = e + n;
  return jp(t, a, i, o) ? Tl(t, a + 2, s ? r.call(s, i, o) : r(i, o)) : ug(t, a + 2);
}
function DR(t, e, n, r, i, o, s, a) {
  let c = e + n;
  return yE(t, c, i, o, s) ? Tl(t, c + 3, a ? r.call(a, i, o, s) : r(i, o, s)) : ug(t, c + 3);
}
function ER(t, e) {
  let n = re(),
    r,
    i = t + se;
  n.firstCreatePass
    ? ((r = CR(e, n.pipeRegistry)),
      (n.data[i] = r),
      r.onDestroy && (n.destroyHooks ??= []).push(i, r.onDestroy))
    : (r = n.data[i]);
  let o = r.factory || (r.factory = Cr(r.type, !0)),
    a = pt(te);
  try {
    let c = Ju(!1),
      u = o();
    return (Ju(c), Xs(n, R(), i, u), u);
  } finally {
    pt(a);
  }
}
function CR(t, e) {
  if (e)
    for (let n = e.length - 1; n >= 0; n--) {
      let r = e[n];
      if (t === r.name) return r;
    }
}
function wR(t, e, n) {
  let r = t + se,
    i = R(),
    o = No(i, r);
  return lg(i, r) ? mC(i, wi(), e, o.transform, n, o) : o.transform(n);
}
function IR(t, e, n, r) {
  let i = t + se,
    o = R(),
    s = No(o, i);
  return lg(o, i) ? vC(o, wi(), e, s.transform, n, r, s) : s.transform(n, r);
}
function bR(t, e, n, r, i) {
  let o = t + se,
    s = R(),
    a = No(s, o);
  return lg(s, o) ? DR(s, wi(), e, a.transform, n, r, i, a) : a.transform(n, r, i);
}
function lg(t, e) {
  return t[O].data[e].pure;
}
function SR(t, e) {
  return Sl(t, e);
}
var yC = (() => {
  class t {
    applicationErrorHandler = v(_t);
    appRef = v(Or);
    taskService = v(Kn);
    ngZone = v(Se);
    zonelessEnabled = v(oa);
    tracing = v(Nn, { optional: !0 });
    zoneIsDefined = typeof Zone < `u` && !!Zone.root.run;
    schedulerTickApplyArgs = [{ data: { __scheduler_tick__: !0 } }];
    subscriptions = new Ne();
    angularZoneId = this.zoneIsDefined ? this.ngZone._inner?.get(Hs) : null;
    scheduleInRootZone =
      !this.zonelessEnabled && this.zoneIsDefined && (v(Ih, { optional: !0 }) ?? !1);
    cancelScheduledCallback = null;
    useMicrotaskScheduler = !1;
    runningTick = !1;
    pendingRenderTaskId = null;
    constructor() {
      (this.subscriptions.add(
        this.appRef.afterTick.subscribe(() => {
          let n = this.taskService.add();
          if (
            !this.runningTick &&
            (this.cleanup(), !this.zonelessEnabled || this.appRef.includeAllTestViews)
          ) {
            this.taskService.remove(n);
            return;
          }
          (this.switchToMicrotaskScheduler(), this.taskService.remove(n));
        }),
      ),
        this.subscriptions.add(
          this.ngZone.onUnstable.subscribe(() => {
            this.runningTick || this.cleanup();
          }),
        ));
    }
    switchToMicrotaskScheduler() {
      this.ngZone.runOutsideAngular(() => {
        let n = this.taskService.add();
        ((this.useMicrotaskScheduler = !0),
          queueMicrotask(() => {
            ((this.useMicrotaskScheduler = !1), this.taskService.remove(n));
          }));
      });
    }
    notify(n) {
      if (!this.zonelessEnabled && n === 5) return;
      switch (n) {
        case 0:
        case 2:
          this.appRef.dirtyFlags |= 2;
          break;
        case 3:
        case 4:
        case 5:
        case 1:
          this.appRef.dirtyFlags |= 4;
          break;
        case 6:
          this.appRef.dirtyFlags |= 2;
          break;
        case 12:
          this.appRef.dirtyFlags |= 16;
          break;
        case 13:
          this.appRef.dirtyFlags |= 2;
          break;
        case 11:
          break;
        default:
          this.appRef.dirtyFlags |= 8;
      }
      if (
        ((this.appRef.tracingSnapshot =
          this.tracing?.snapshot(this.appRef.tracingSnapshot) ?? null),
        !this.shouldScheduleTick())
      )
        return;
      let r = this.useMicrotaskScheduler ? i_ : Eh;
      ((this.pendingRenderTaskId = this.taskService.add()),
        this.scheduleInRootZone
          ? (this.cancelScheduledCallback = Zone.root.run(() => r(() => this.tick())))
          : (this.cancelScheduledCallback = this.ngZone.runOutsideAngular(() =>
              r(() => this.tick()),
            )));
    }
    shouldScheduleTick() {
      return !(
        this.appRef.destroyed ||
        this.pendingRenderTaskId !== null ||
        this.runningTick ||
        this.appRef._runningTick ||
        (!this.zonelessEnabled && this.zoneIsDefined && Zone.current.get(Hs + this.angularZoneId))
      );
    }
    tick() {
      if (this.runningTick || this.appRef.destroyed) return;
      if (this.appRef.dirtyFlags === 0) {
        this.cleanup();
        return;
      }
      !this.zonelessEnabled && this.appRef.dirtyFlags & 7 && (this.appRef.dirtyFlags |= 1);
      let n = this.taskService.add();
      try {
        this.ngZone.run(
          () => {
            ((this.runningTick = !0), this.appRef._tick());
          },
          void 0,
          this.schedulerTickApplyArgs,
        );
      } catch (r) {
        this.applicationErrorHandler(r);
      } finally {
        (this.taskService.remove(n), this.cleanup());
      }
    }
    ngOnDestroy() {
      (this.subscriptions.unsubscribe(), this.cleanup());
    }
    cleanup() {
      if (
        ((this.runningTick = !1),
        this.cancelScheduledCallback?.(),
        (this.cancelScheduledCallback = null),
        this.pendingRenderTaskId !== null)
      ) {
        let n = this.pendingRenderTaskId;
        ((this.pendingRenderTaskId = null), this.taskService.remove(n));
      }
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
function _C() {
  return [
    { provide: Dn, useExisting: yC },
    { provide: Se, useClass: $s },
    { provide: oa, useValue: !0 },
  ];
}
var dg = (() => {
  class t {
    compileModuleSync(n) {
      return new dl(n);
    }
    compileModuleAsync(n) {
      return Promise.resolve(this.compileModuleSync(n));
    }
    clearCache() {}
    clearCacheFor(n) {}
    getModuleId(n) {}
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
function TR() {
  return (typeof $localize < `u` && $localize.locale) || Aa;
}
var xa = new E(``, { factory: () => v(xa, { optional: !0, skipSelf: !0 }) || TR() });
var Ra = class {
  destroyed = !1;
  listeners = null;
  errorHandler = v(Ht, { optional: !0 });
  isEmitting = !1;
  hasNullListeners = !1;
  destroyRef = v(J);
  constructor() {
    this.destroyRef.onDestroy(() => {
      ((this.destroyed = !0), (this.listeners = null));
    });
  }
  subscribe(e) {
    if (this.destroyed) throw new I(953, !1);
    return (
      (this.listeners ??= []).push(e),
      {
        unsubscribe: () => {
          let n = this.listeners ? this.listeners.indexOf(e) : -1;
          n > -1 &&
            (this.isEmitting
              ? ((this.hasNullListeners = !0), (this.listeners[n] = null))
              : this.listeners.splice(n, 1));
        },
      }
    );
  }
  emit(e) {
    if (this.destroyed) {
      console.warn(En(953, !1));
      return;
    }
    if (this.listeners === null) return;
    this.isEmitting = !0;
    let n = P(null);
    try {
      for (let r of this.listeners)
        try {
          r !== null && r(e);
        } catch (i) {
          this.errorHandler?.handleError(i);
        }
    } finally {
      (this.hasNullListeners &&
        ((this.hasNullListeners = !1), this.listeners && MR(this.listeners)),
        P(n),
        (this.isEmitting = !1));
    }
  }
};
function MR(t) {
  let e = t.length - 1;
  for (; e > -1;) (t[e] === null && t.splice(e, 1), e--);
}
var CC = new E(``);
function oe(t, e) {
  return Fs(t, e?.equal);
}
function F(t) {
  return uy(t);
}
var fg = class extends Error {
  dependency;
  constructor(e) {
    (super(`Dependency error`, { cause: e.error() }),
      (this.name = `ResourceDependencyError`),
      (this.dependency = e));
  }
};
var qo = class t extends Error {
  _brand;
  constructor(e) {
    super(e);
  }
  static IDLE = new t(`IDLE`);
  static LOADING = new t(`LOADING`);
};
var AR = (t) => t;
function Oa(t, e) {
  if (typeof t == `function`) return DC(If(t, AR, e?.equal), e?.debugName, e?.set);
  else return DC(If(t.source, t.computation, t.equal), t.debugName, t.set);
}
function DC(t, e, n) {
  let r = t[le],
    i = t;
  if (n !== void 0) {
    let o = (s) => bf(r, s);
    ((i.set = (s) => n(s, o)), (i.update = (s) => n(s(F(t)), o)));
  } else ((i.set = (o) => bf(r, o)), (i.update = (o) => cy(r, o)));
  return ((i.asReadonly = xo.bind(t)), i);
}
function wC(t) {
  let e = t.request;
  return new pg(
    t.params ?? e ?? (() => null),
    xR(t),
    t.defaultValue,
    t.equal ? NR(t.equal) : void 0,
    t.debugName,
    t.injector ?? v(He),
    t.id,
  );
}
var hg = class {
  value;
  isLoading;
  constructor(e, n) {
    ((this.value = e),
      (this.value.set = this.set.bind(this)),
      (this.value.update = this.update.bind(this)),
      (this.value.asReadonly = xo),
      (this.isLoading = oe(
        () => this.status() === `loading` || this.status() === `reloading`,
        void 0,
      )));
  }
  isError = oe(() => this.status() === `error`);
  update(e) {
    this.set(e(F(this.value)));
  }
  isValueDefined = oe(() => (this.isError() ? !1 : this.value() !== void 0));
  _snapshot;
  get snapshot() {
    return (this._snapshot ??= oe(() => {
      let e = this.status();
      return e === `error`
        ? { status: `error`, error: this.error() }
        : { status: e, value: this.value() };
    }));
  }
  hasValue() {
    return this.isValueDefined();
  }
  asReadonly() {
    return this;
  }
};
var pg = class extends hg {
  loaderFn;
  equal;
  debugName;
  transferCacheKey;
  pendingTasks;
  state;
  extRequest;
  effectRef;
  pendingController;
  resolvePendingTask = void 0;
  destroyed = !1;
  unregisterOnDestroy;
  status;
  error;
  transferState;
  constructor(e, n, r, i, o, s, a, c) {
    if (bC()) throw SC();
    (super(
      oe(
        () => {
          let l = this.state().stream?.();
          if (!l || (this.state().status === `loading` && this.error())) return r;
          if (!gg(l)) throw new Ol(this.error());
          return l.value;
        },
        { equal: i },
      ),
      o,
    ),
      (this.loaderFn = n),
      (this.equal = i),
      (this.debugName = o),
      (this.transferCacheKey = a));
    let u = s.get(CC, void 0, { optional: !0 }) ?? { isActive: !1 };
    ((this.transferState = s.get(Vu, void 0, { optional: !0 }) ?? void 0),
      (this.extRequest = Oa(
        () => {
          try {
            return (vg(!0), { request: e(PR), reload: 0 });
          } catch (l) {
            return (
              yg(l),
              l === qo.IDLE
                ? { status: `idle`, reload: 0 }
                : l === qo.LOADING
                  ? { status: `loading`, reload: 0 }
                  : { error: l, reload: 0 }
            );
          } finally {
            vg(!1);
          }
        },
        void 0,
      )),
      (this.state = Oa({
        source: this.extRequest,
        computation: (l, d) => {
          let { request: f, status: h, error: g } = l,
            p;
          if (g) ((h = `resolved`), (p = H({ error: ka(g) }, void 0)));
          else if (!h)
            if (d)
              ((h = f === void 0 ? `idle` : `loading`),
                d.value.extRequest.request === f && (p = d.value.stream));
            else {
              let m = this.transferState,
                y = this.transferCacheKey;
              (u.isActive &&
                y &&
                m &&
                f !== void 0 &&
                m.hasKey(y) &&
                (p = H({ value: m.get(y, r) }, void 0)),
                p || (p = c?.(l.request)),
                (c = void 0),
                (h = f === void 0 ? `idle` : p ? `resolved` : `loading`));
            }
          return { extRequest: l, status: h, previousStatus: d ? EC(d.value) : `idle`, stream: p };
        },
      })),
      (this.effectRef = Yt(this.loadEffect.bind(this), { injector: s, manualCleanup: !0 })),
      (this.pendingTasks = s.get(Si)),
      (this.unregisterOnDestroy = s.get(J).onDestroy(() => this.destroy())),
      (this.status = oe(() => EC(this.state()), void 0)),
      (this.error = oe(
        () => {
          let l = this.state().stream?.();
          return l && !gg(l) ? l.error : void 0;
        },
        void 0,
      )));
  }
  set(e) {
    if (this.destroyed) return;
    let n = F(this.error),
      r = F(this.state);
    if (!n) {
      let i = F(this.value);
      if (r.status === `local` && (this.equal ? this.equal(i, e) : i === e)) return;
    }
    (this.state.set({
      extRequest: r.extRequest,
      status: `local`,
      previousStatus: `local`,
      stream: H({ value: e }, void 0),
    }),
      this.abortInProgressLoad());
  }
  reload() {
    let { status: e } = F(this.state);
    return e === `idle` || e === `loading`
      ? !1
      : (this.extRequest.update(({ request: n, reload: r }) => ({ request: n, reload: r + 1 })),
        !0);
  }
  destroy() {
    ((this.destroyed = !0),
      this.unregisterOnDestroy(),
      this.effectRef.destroy(),
      this.abortInProgressLoad(),
      this.state.set({
        extRequest: { request: void 0, reload: 0 },
        status: `idle`,
        previousStatus: `idle`,
        stream: void 0,
      }));
  }
  async loadEffect() {
    let e = this.extRequest(),
      { status: n, previousStatus: r } = F(this.state);
    if (e.request === void 0) return;
    if (n !== `loading`) return;
    this.abortInProgressLoad();
    let i = (this.resolvePendingTask = this.pendingTasks.add()),
      { signal: o } = (this.pendingController = new AbortController());
    try {
      let s = F(() =>
          this.loaderFn({ params: e.request, abortSignal: o, previous: { status: r } }),
        ),
        a = () => o.aborted || F(this.extRequest) !== e;
      if (Zt(s)) {
        if (a()) return;
        this.state.set({
          extRequest: e,
          status: `resolved`,
          previousStatus: `resolved`,
          stream: s,
        });
        F(s);
      } else {
        let c = await s;
        if (a()) return;
        this.state.set({
          extRequest: e,
          status: `resolved`,
          previousStatus: `resolved`,
          stream: c,
        });
        c && F(c);
      }
    } catch (s) {
      if ((yg(s), o.aborted || F(this.extRequest) !== e)) return;
      this.state.set({
        extRequest: e,
        status: `resolved`,
        previousStatus: `error`,
        stream: H({ error: ka(s) }, void 0),
      });
    } finally {
      (i?.(), (i = void 0));
    }
  }
  abortInProgressLoad() {
    (F(() => this.pendingController?.abort()),
      (this.pendingController = void 0),
      this.resolvePendingTask?.(),
      (this.resolvePendingTask = void 0));
  }
};
function NR(t) {
  return (e, n) => (e === void 0 || n === void 0 ? e === n : t(e, n));
}
function xR(t) {
  return RR(t)
    ? t.stream
    : async (e) => {
        try {
          return H({ value: await t.loader(e) }, void 0);
        } catch (n) {
          return H({ error: ka(n) }, void 0);
        }
      };
}
function RR(t) {
  return !!t.stream;
}
function EC(t) {
  switch (t.status) {
    case `loading`:
      return t.extRequest.reload === 0 ? `loading` : `reloading`;
    case `resolved`:
      return gg(t.stream()) ? `resolved` : `error`;
    default:
      return t.status;
  }
}
function gg(t) {
  return t.error === void 0;
}
function ka(t) {
  return OR(t) ? t : new mg(t);
}
function OR(t) {
  return (
    t instanceof Error ||
    (typeof t == `object` && typeof t.name == `string` && typeof t.message == `string`)
  );
}
var Ol = class extends Error {
  constructor(e) {
    super(e.message, { cause: e });
  }
};
var mg = class extends Error {
  constructor(e) {
    super(String(e), { cause: e });
  }
};
function kR(t) {
  switch (t.status()) {
    case `idle`:
      throw qo.IDLE;
    case `error`:
      throw new fg(t);
    case `loading`:
    case `reloading`:
      throw qo.LOADING;
  }
  return t.value();
}
var PR = { chain: kR };
var IC = !1;
function bC() {
  return IC;
}
function vg(t) {
  IC = t;
}
function SC() {
  return new I(992, !1);
}
function yg(t) {
  if (t instanceof I && t.code === 992) throw t;
}
var Fl = Symbol(`InputSignalNode#UNSET`);
var kC = m(l({}, Ls), {
  transformFn: void 0,
  applyValueToInputSignal(t, e) {
    Dr(t, e);
  },
});
function PC(t, e) {
  let n = Object.create(kC);
  ((n.value = t), (n.transformFn = e?.transform));
  function r() {
    if ((Hn(n), n.value === Fl)) throw new I(-950, null);
    return n.value;
  }
  return ((r[le] = n), r);
}
var Pl = class {
  attributeName;
  constructor(e) {
    this.attributeName = e;
  }
  __NG_ELEMENT_ID__ = () => _a(this.attributeName);
  toString() {
    return `HostAttributeToken ${this.attributeName}`;
  }
};
function Cg(t) {
  return JR(t) ? t.default : t;
}
function JR(t) {
  return t && typeof t == `object` && `default` in t;
}
function M9(t) {
  return new Ra();
}
function TC(t, e) {
  return PC(t, e);
}
function eO(t) {
  return PC(Fl, t);
}
var tr = ((TC.required = eO), TC);
function FC(t, e) {
  let n = Object.create(kC),
    r = new Ra();
  n.value = t;
  function i() {
    return (Hn(n), MC(n.value), n.value);
  }
  return (
    (i[le] = n),
    (i.asReadonly = xo.bind(i)),
    (i.set = (o) => {
      n.equal(n.value, o) || (Dr(n, o), r.emit(o));
    }),
    (i.update = (o) => {
      (MC(n.value), i.set(o(n.value)));
    }),
    (i.subscribe = r.subscribe.bind(r)),
    (i.destroyRef = r.destroyRef),
    i
  );
}
function MC(t) {
  if (t === Fl) throw new I(952, !1);
}
function AC(t, e) {
  return FC(t, e);
}
function tO(t) {
  return FC(Fl, t);
}
var A9 = ((AC.required = tO), AC);
function NC(t, e) {
  return Wp(e);
}
function nO(t, e) {
  return qp(e);
}
var N9 = ((NC.required = nO), NC);
function x9(t, e) {
  return Yp(e);
}
function xC(t, e) {
  return Wp(e);
}
function rO(t, e) {
  return qp(e);
}
var R9 = ((xC.required = rO), xC);
function O9(t, e) {
  return Yp(e);
}
var nr = (() => {
  class t {
    static __NG_ELEMENT_ID__ = oO;
  }
  return t;
})();
function oO(t) {
  return sO(ke(), R(), (t & 16) === 16);
}
function sO(t, e, n) {
  if (Zn(t) && !n) {
    let r = Wt(t.index, e);
    return new Rr(r, r);
  } else if (t.type & 175) {
    let r = e[gt];
    return new Rr(r, e);
  }
  return null;
}
var Dg = new E(``);
var aO = new E(``);
function Pa(t) {
  return !t.moduleRef;
}
function cO(t) {
  let e = Pa(t) ? t.r3Injector : t.moduleRef.injector,
    n = e.get(Se);
  return n.run(() => {
    Pa(t) ? t.r3Injector.resolveInjectorInitializers() : t.moduleRef.resolveInjectorInitializers();
    let r = e.get(_t),
      i;
    if (
      (n.runOutsideAngular(() => {
        i = n.onError.subscribe({ next: r });
      }),
      Pa(t))
    ) {
      let o = () => e.destroy(),
        s = t.platformInjector.get(Dg);
      (s.add(o),
        e.onDestroy(() => {
          (i.unsubscribe(), s.delete(o));
        }));
    } else {
      let o = () => t.moduleRef.destroy(),
        s = t.platformInjector.get(Dg);
      (s.add(o),
        t.moduleRef.onDestroy(() => {
          (ua(t.allPlatformModules, t.moduleRef), i.unsubscribe(), s.delete(o));
        }));
    }
    return lO(r, n, () => {
      let o = e.get(Kn),
        s = o.add(),
        a = e.get(Kp);
      return (
        a.runInitializers(),
        a.donePromise
          .then(() => {
            if (($E(e.get(xa, Aa) || Aa), !e.get(aO, !0)))
              return Pa(t) ? e.get(Or) : (t.allPlatformModules.push(t.moduleRef), t.moduleRef);
            if (Pa(t)) {
              let l = e.get(Or);
              return (t.rootComponent !== void 0 && l.bootstrap(t.rootComponent), l);
            } else return (uO?.(t.moduleRef, t.allPlatformModules), t.moduleRef);
          })
          .finally(() => {
            o.remove(s);
          })
      );
    });
  });
}
var uO;
function lO(t, e, n) {
  try {
    let r = n();
    return er(r)
      ? r.catch((i) => {
          throw (e.runOutsideAngular(() => t(i)), i);
        })
      : r;
  } catch (r) {
    throw (e.runOutsideAngular(() => t(r)), r);
  }
}
var kl = null;
function dO(t = [], e) {
  return He.create({
    name: e,
    providers: [
      { provide: Ks, useValue: `platform` },
      { provide: Dg, useValue: new Set([() => (kl = null)]) },
      ...t,
    ],
  });
}
function fO(t = []) {
  if (kl) return kl;
  let e = dO(t);
  return ((kl = e), LE(), hO(e), e);
}
function hO(t) {
  let e = t.get(Lu, null);
  $e(t, () => {
    e?.forEach((n) => n());
  });
}
function LC(t) {
  let { rootComponent: e, appProviders: n, platformProviders: r, platformRef: i } = t;
  ee(K.BootstrapApplicationStart);
  try {
    let o = i?.injector ?? fO(r);
    return cO({
      r3Injector: new pa({
        providers: [_C(), s_, ...(n || [])],
        parent: o,
        debugName: ``,
        runEnvironmentInitializers: !1,
      }).injector,
      platformInjector: o,
      rootComponent: e,
    });
  } catch (o) {
    return Promise.reject(o);
  } finally {
    ee(K.BootstrapApplicationEnd);
  }
}
function Ui(t) {
  return typeof t == `boolean` ? t : t != null && t !== `false`;
}
var _g = Symbol(`NOT_SET`);
var VC = new Set();
var pO = m(l({}, Ls), {
  kind: `afterRenderEffectPhase`,
  consumerIsAlwaysLive: !0,
  consumerAllowSignalWrites: !0,
  value: _g,
  cleanup: null,
  consumerMarkedDirty() {
    if (this.sequence.impl.executing) {
      if (this.sequence.lastPhase === null || this.sequence.lastPhase < this.phase) return;
      this.sequence.erroredOrDestroyed = !0;
    }
    this.sequence.scheduler.notify(7);
  },
  phaseFn(t) {
    if (((this.sequence.lastPhase = this.phase), !this.dirty)) return this.signal;
    if (((this.dirty = !1), this.value !== _g && !ai(this))) return this.signal;
    try {
      for (let i of this.cleanup ?? VC) i();
    } finally {
      this.cleanup?.clear();
    }
    let e = [];
    (t !== void 0 && e.push(t), e.push(this.registerCleanupFn));
    let n = yn(this),
      r;
    try {
      r = this.userFn.apply(null, e);
    } finally {
      $n(this, n);
    }
    return (
      (this.value === _g || !this.equal(this.value, r)) && ((this.value = r), this.version++),
      this.signal
    );
  },
});
var Eg = class extends da {
  scheduler;
  lastPhase = null;
  nodes = [void 0, void 0, void 0, void 0];
  onDestroyFns = null;
  constructor(e, n, r, i, o, s = null) {
    (super(e, [void 0, void 0, void 0, void 0], r, !1, o.get(J), s), (this.scheduler = i));
    for (let a of Ip) {
      let c = n[a];
      if (c === void 0) continue;
      let u = Object.create(pO);
      ((u.sequence = this),
        (u.phase = a),
        (u.userFn = c),
        (u.dirty = !0),
        (u.signal = () => (Hn(u), u.value)),
        (u.signal[le] = u),
        (u.registerCleanupFn = (l) => (u.cleanup ??= new Set()).add(l)),
        (this.nodes[a] = u),
        (this.hooks[a] = (l) => u.phaseFn(l)));
    }
  }
  afterRun() {
    (super.afterRun(), (this.lastPhase = null));
  }
  destroy() {
    if (this.onDestroyFns !== null) for (let e of this.onDestroyFns) e();
    super.destroy();
    for (let e of this.nodes)
      if (e)
        try {
          for (let n of e.cleanup ?? VC) n();
        } finally {
          Gn(e);
        }
  }
};
function P9(t, e) {
  let n = e?.injector ?? v(He),
    r = n.get(Dn),
    i = n.get(Dl),
    o = n.get(Nn, null, { optional: !0 });
  i.impl ??= n.get(bp);
  let s = t;
  typeof s == `function` && (s = { mixedReadWrite: t });
  let a = n.get(Oo, null, { optional: !0 }),
    c = new Eg(
      i.impl,
      [s.earlyRead, s.write, s.mixedReadWrite, s.read],
      a?.view,
      r,
      n,
      o?.snapshot(null),
    );
  return (i.impl.register(c), c);
}
function jC(t, e) {
  let n = qn(t),
    r = e.elementInjector || bo();
  return new Ri(n).create(
    r,
    e.projectableNodes,
    e.hostElement,
    e.environmentInjector,
    e.directives,
    e.bindings,
  );
}
function UC(t) {
  let e = qn(t);
  if (!e) return null;
  let n = new Ri(e);
  return {
    get selector() {
      return n.selector;
    },
    get type() {
      return n.componentType;
    },
    get inputs() {
      return n.inputs;
    },
    get outputs() {
      return n.outputs;
    },
    get ngContentSelectors() {
      return n.ngContentSelectors;
    },
    get isStandalone() {
      return e.standalone;
    },
    get isSignal() {
      return e.signals;
    },
  };
}
var BC = null;
function Rt() {
  return BC;
}
function wg(t) {
  BC ??= t;
}
var La = class {};
var Yo = (() => {
  class t {
    historyGo(n) {
      throw new Error(``);
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = q({ token: t, factory: () => v(HC), providedIn: `platform` });
  }
  return t;
})();
var HC = (() => {
  class t extends Yo {
    _location;
    _history;
    _doc = v(ie);
    constructor() {
      (super(), (this._location = window.location), (this._history = window.history));
    }
    getBaseHrefFromDOM() {
      return Rt().getBaseHref(this._doc);
    }
    onPopState(n) {
      let r = Rt().getGlobalEventTarget(this._doc, `window`);
      return (r.addEventListener(`popstate`, n, !1), () => r.removeEventListener(`popstate`, n));
    }
    onHashChange(n) {
      let r = Rt().getGlobalEventTarget(this._doc, `window`);
      return (
        r.addEventListener(`hashchange`, n, !1),
        () => r.removeEventListener(`hashchange`, n)
      );
    }
    get href() {
      return this._location.href;
    }
    get protocol() {
      return this._location.protocol;
    }
    get hostname() {
      return this._location.hostname;
    }
    get port() {
      return this._location.port;
    }
    get pathname() {
      return this._location.pathname;
    }
    get search() {
      return this._location.search;
    }
    get hash() {
      return this._location.hash;
    }
    set pathname(n) {
      this._location.pathname = n;
    }
    pushState(n, r, i) {
      this._history.pushState(n, r, i);
    }
    replaceState(n, r, i) {
      this._history.replaceState(n, r, i);
    }
    forward() {
      this._history.forward();
    }
    back() {
      this._history.back();
    }
    historyGo(n = 0) {
      this._history.go(n);
    }
    getState() {
      return this._history.state;
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = q({ token: t, factory: () => new t(), providedIn: `platform` });
  }
  return t;
})();
function zC(t, e) {
  return t
    ? e
      ? t.endsWith(`/`)
        ? e.startsWith(`/`)
          ? t + e.slice(1)
          : t + e
        : e.startsWith(`/`)
          ? t + e
          : `${t}/${e}`
      : t
    : e;
}
function $C(t) {
  let e = t.search(/#|\?|$/);
  return t[e - 1] === `/` ? t.slice(0, e - 1) + t.slice(e) : t;
}
function Pr(t) {
  return t && t[0] !== `?` ? `?${t}` : t;
}
var Zo = (() => {
  class t {
    historyGo(n) {
      throw new Error(``);
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = q({ token: t, factory: () => v(mO), providedIn: `root` });
  }
  return t;
})();
var gO = new E(``);
var mO = (() => {
  class t extends Zo {
    _platformLocation;
    _baseHref;
    _removeListenerFns = [];
    constructor(n, r) {
      (super(),
        (this._platformLocation = n),
        (this._baseHref =
          r ?? this._platformLocation.getBaseHrefFromDOM() ?? v(ie).location?.origin ?? ``));
    }
    ngOnDestroy() {
      for (; this._removeListenerFns.length;) this._removeListenerFns.pop()();
    }
    onPopState(n) {
      this._removeListenerFns.push(
        this._platformLocation.onPopState(n),
        this._platformLocation.onHashChange(n),
      );
    }
    getBaseHref() {
      return this._baseHref;
    }
    prepareExternalUrl(n) {
      return zC(this._baseHref, n);
    }
    path(n = !1) {
      let r = this._platformLocation.pathname + Pr(this._platformLocation.search),
        i = this._platformLocation.hash;
      return i && n ? `${r}${i}` : r;
    }
    pushState(n, r, i, o) {
      let s = this.prepareExternalUrl(i + Pr(o));
      this._platformLocation.pushState(n, r, s);
    }
    replaceState(n, r, i, o) {
      let s = this.prepareExternalUrl(i + Pr(o));
      this._platformLocation.replaceState(n, r, s);
    }
    forward() {
      this._platformLocation.forward();
    }
    back() {
      this._platformLocation.back();
    }
    getState() {
      return this._platformLocation.getState();
    }
    historyGo(n = 0) {
      this._platformLocation.historyGo?.(n);
    }
    static ɵfac = function (r) {
      return new (r || t)(j(Yo), j(gO, 8));
    };
    static ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
  }
  return t;
})();
var Ko = (() => {
  class t {
    _subject = new ue();
    _basePath;
    _locationStrategy;
    _urlChangeListeners = [];
    _urlChangeSubscription = null;
    constructor(n) {
      this._locationStrategy = n;
      let r = this._locationStrategy.getBaseHref();
      ((this._basePath = _O($C(GC(r)))),
        this._locationStrategy.onPopState((i) => {
          this._subject.next({ url: this.path(!0), pop: !0, state: i.state, type: i.type });
        }));
    }
    ngOnDestroy() {
      (this._urlChangeSubscription?.unsubscribe(), (this._urlChangeListeners = []));
    }
    path(n = !1) {
      return this.normalize(this._locationStrategy.path(n));
    }
    getState() {
      return this._locationStrategy.getState();
    }
    isCurrentPathEqualTo(n, r = ``) {
      return this.path() == this.normalize(n + Pr(r));
    }
    normalize(n) {
      return t.stripTrailingSlash(yO(this._basePath, GC(n)));
    }
    prepareExternalUrl(n) {
      return (n && n[0] !== `/` && (n = `/` + n), this._locationStrategy.prepareExternalUrl(n));
    }
    go(n, r = ``, i = null) {
      (this._locationStrategy.pushState(i, ``, n, r),
        this._notifyUrlChangeListeners(this.prepareExternalUrl(n + Pr(r)), i));
    }
    replaceState(n, r = ``, i = null) {
      (this._locationStrategy.replaceState(i, ``, n, r),
        this._notifyUrlChangeListeners(this.prepareExternalUrl(n + Pr(r)), i));
    }
    forward() {
      this._locationStrategy.forward();
    }
    back() {
      this._locationStrategy.back();
    }
    historyGo(n = 0) {
      this._locationStrategy.historyGo?.(n);
    }
    onUrlChange(n) {
      return (
        this._urlChangeListeners.push(n),
        (this._urlChangeSubscription ??= this.subscribe((r) => {
          this._notifyUrlChangeListeners(r.url, r.state);
        })),
        () => {
          let r = this._urlChangeListeners.indexOf(n);
          (this._urlChangeListeners.splice(r, 1),
            this._urlChangeListeners.length === 0 &&
              (this._urlChangeSubscription?.unsubscribe(), (this._urlChangeSubscription = null)));
        }
      );
    }
    _notifyUrlChangeListeners(n = ``, r) {
      this._urlChangeListeners.forEach((i) => i(n, r));
    }
    subscribe(n, r, i) {
      return this._subject.subscribe({ next: n, error: r ?? void 0, complete: i ?? void 0 });
    }
    static normalizeQueryParams = Pr;
    static joinWithSlash = zC;
    static stripTrailingSlash = $C;
    static ɵfac = function (r) {
      return new (r || t)(j(Zo));
    };
    static ɵprov = q({ token: t, factory: () => vO(), providedIn: `root` });
  }
  return t;
})();
function vO() {
  return new Ko(j(Zo));
}
function yO(t, e) {
  if (!t || !e.startsWith(t)) return e;
  let n = e.substring(t.length);
  return n === `` || [`/`, `;`, `?`, `#`].includes(n[0]) ? n : e;
}
function GC(t) {
  return t.replace(/\/index\.html$/, ``);
}
function _O(t) {
  if (new RegExp(`^(https?:)?//`).test(t)) {
    let [, n] = t.split(/\/\/[^\/]+/);
    return n;
  }
  return t;
}
var st = (function (t) {
  return ((t[(t.Format = 0)] = `Format`), (t[(t.Standalone = 1)] = `Standalone`), t);
})(st || {});
var ae = (function (t) {
  return (
    (t[(t.Narrow = 0)] = `Narrow`),
    (t[(t.Abbreviated = 1)] = `Abbreviated`),
    (t[(t.Wide = 2)] = `Wide`),
    (t[(t.Short = 3)] = `Short`),
    t
  );
})(ae || {});
var Dt = (function (t) {
  return (
    (t[(t.Short = 0)] = `Short`),
    (t[(t.Medium = 1)] = `Medium`),
    (t[(t.Long = 2)] = `Long`),
    (t[(t.Full = 3)] = `Full`),
    t
  );
})(Dt || {});
var ir = {
  Decimal: 0,
  Group: 1,
  List: 2,
  PercentSign: 3,
  PlusSign: 4,
  MinusSign: 5,
  Exponential: 6,
  SuperscriptingExponent: 7,
  PerMille: 8,
  Infinity: 9,
  NaN: 10,
  TimeSeparator: 11,
  CurrencyDecimal: 12,
  CurrencyGroup: 13,
};
function qC(t) {
  return xt(t)[Pe.LocaleId];
}
function YC(t, e, n) {
  let r = xt(t);
  return Qt(Qt([r[Pe.DayPeriodsFormat], r[Pe.DayPeriodsStandalone]], e), n);
}
function ZC(t, e, n) {
  let r = xt(t);
  return Qt(Qt([r[Pe.DaysFormat], r[Pe.DaysStandalone]], e), n);
}
function KC(t, e, n) {
  let r = xt(t);
  return Qt(Qt([r[Pe.MonthsFormat], r[Pe.MonthsStandalone]], e), n);
}
function QC(t, e) {
  let r = xt(t)[Pe.Eras];
  return Qt(r, e);
}
function Va(t, e) {
  return Qt(xt(t)[Pe.DateFormat], e);
}
function ja(t, e) {
  return Qt(xt(t)[Pe.TimeFormat], e);
}
function Ua(t, e) {
  let r = xt(t)[Pe.DateTimeFormat];
  return Qt(r, e);
}
function Ba(t, e) {
  let n = xt(t),
    r = n[Pe.NumberSymbols][e];
  if (typeof r > `u`) {
    if (e === ir.CurrencyDecimal) return n[Pe.NumberSymbols][ir.Decimal];
    if (e === ir.CurrencyGroup) return n[Pe.NumberSymbols][ir.Group];
  }
  return r;
}
function XC(t) {
  if (!t[Pe.ExtraData]) throw new I(2303, !1);
}
function JC(t) {
  let e = xt(t);
  return (
    XC(e),
    (e[Pe.ExtraData][2] || []).map((r) => (typeof r == `string` ? Ig(r) : [Ig(r[0]), Ig(r[1])]))
  );
}
function ew(t, e, n) {
  let r = xt(t);
  XC(r);
  return Qt(Qt([r[Pe.ExtraData][0], r[Pe.ExtraData][1]], e) || [], n) || [];
}
function Qt(t, e) {
  for (let n = e; n > -1; n--) if (typeof t[n] < `u`) return t[n];
  throw new I(2304, !1);
}
function Ig(t) {
  let [e, n] = t.split(`:`);
  return { hours: +e, minutes: +n };
}
var DO =
  /^(\d{4,})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
var Ll = Object.create(null);
var EO =
  /((?:[^BEGHLMOSWYZabcdhmswyz']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|Y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|c{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
var CO = 256;
function tw(t, e, n, r) {
  let i = RO(t);
  (wO(e), (e = rr(n, e) || e));
  let s = [],
    a;
  for (; e;)
    if (((a = EO.exec(e)), a)) {
      s = s.concat(a.slice(1));
      let l = s.pop();
      if (!l) break;
      e = l;
    } else {
      s.push(e);
      break;
    }
  let c = i.getTimezoneOffset();
  r && ((c = rw(r, c)), (i = xO(i, r)));
  let u = ``;
  return (
    s.forEach((l) => {
      let d = AO(l);
      u += d ? d(i, n, c) : l === `''` ? `'` : l.replace(/(^'|'$)/g, ``).replace(/''/g, `'`);
    }),
    u
  );
}
function wO(t) {
  if (t.length > CO) throw new I(2300, !1);
}
function Hl(t, e, n) {
  let r = new Date(0);
  return (r.setFullYear(t, e, n), r.setHours(0, 0, 0), r);
}
function rr(t, e) {
  let n = qC(t);
  if (((Ll[n] ??= Object.create(null)), Ll[n][e])) return Ll[n][e];
  let r = ``;
  switch (e) {
    case `shortDate`:
      r = Va(t, Dt.Short);
      break;
    case `mediumDate`:
      r = Va(t, Dt.Medium);
      break;
    case `longDate`:
      r = Va(t, Dt.Long);
      break;
    case `fullDate`:
      r = Va(t, Dt.Full);
      break;
    case `shortTime`:
      r = ja(t, Dt.Short);
      break;
    case `mediumTime`:
      r = ja(t, Dt.Medium);
      break;
    case `longTime`:
      r = ja(t, Dt.Long);
      break;
    case `fullTime`:
      r = ja(t, Dt.Full);
      break;
    case `short`:
      let i = rr(t, `shortTime`),
        o = rr(t, `shortDate`);
      r = Vl(Ua(t, Dt.Short), [i, o]);
      break;
    case `medium`:
      let s = rr(t, `mediumTime`),
        a = rr(t, `mediumDate`);
      r = Vl(Ua(t, Dt.Medium), [s, a]);
      break;
    case `long`:
      let c = rr(t, `longTime`),
        u = rr(t, `longDate`);
      r = Vl(Ua(t, Dt.Long), [c, u]);
      break;
    case `full`:
      let l = rr(t, `fullTime`),
        d = rr(t, `fullDate`);
      r = Vl(Ua(t, Dt.Full), [l, d]);
      break;
  }
  return (r && (Ll[n][e] = r), r);
}
function Vl(t, e) {
  return (
    e &&
      (t = t.replace(/\{([^}]+)}/g, function (n, r) {
        return Object.hasOwn(e, r) ? e[r] : n;
      })),
    t
  );
}
function hn(t, e, n = `-`, r, i) {
  let o = ``;
  (t < 0 || (i && t <= 0)) && (i ? (t = -t + 1) : ((t = -t), (o = n)));
  let s = String(t);
  for (; s.length < e;) s = `0` + s;
  return (r && (s = s.slice(s.length - e)), o + s);
}
function IO(t, e) {
  return hn(t, 3).substring(0, e);
}
function Fe(t, e, n = 0, r = !1, i = !1) {
  return function (o, s) {
    let a = bO(t, o);
    if (((n > 0 || a > -n) && (a += n), t === 3)) a === 0 && n === -12 && (a = 12);
    else if (t === 6) return IO(a, e);
    let c = Ba(s, ir.MinusSign);
    return hn(a, e, c, r, i);
  };
}
function bO(t, e) {
  switch (t) {
    case 0:
      return e.getFullYear();
    case 1:
      return e.getMonth();
    case 2:
      return e.getDate();
    case 3:
      return e.getHours();
    case 4:
      return e.getMinutes();
    case 5:
      return e.getSeconds();
    case 6:
      return e.getMilliseconds();
    case 7:
      return e.getDay();
    default:
      throw new I(2301, !1);
  }
}
function ge(t, e, n = st.Format, r = !1) {
  return function (i, o) {
    return SO(i, o, t, e, n, r);
  };
}
function SO(t, e, n, r, i, o) {
  switch (n) {
    case 2:
      return KC(e, i, r)[t.getMonth()];
    case 1:
      return ZC(e, i, r)[t.getDay()];
    case 0:
      let s = t.getHours(),
        a = t.getMinutes();
      if (o) {
        let u = JC(e),
          l = ew(e, i, r),
          d = u.findIndex((f) => {
            if (Array.isArray(f)) {
              let [h, g] = f,
                p = s >= h.hours && a >= h.minutes,
                m = s < g.hours || (s === g.hours && a < g.minutes);
              if (h.hours < g.hours) {
                if (p && m) return !0;
              } else if (p || m) return !0;
            } else if (f.hours === s && f.minutes === a) return !0;
            return !1;
          });
        if (d !== -1) return l[d];
      }
      return YC(e, i, r)[s < 12 ? 0 : 1];
    case 3:
      return QC(e, r)[t.getFullYear() <= 0 ? 0 : 1];
    default:
      throw new I(2302, !1);
  }
}
function jl(t) {
  return function (e, n, r) {
    let i = -1 * r,
      o = Ba(n, ir.MinusSign),
      s = i > 0 ? Math.floor(i / 60) : Math.ceil(i / 60);
    switch (t) {
      case 0:
        return (i >= 0 ? `+` : ``) + hn(s, 2, o) + hn(Math.abs(i % 60), 2, o);
      case 1:
        return `GMT` + (i >= 0 ? `+` : ``) + hn(s, 1, o);
      case 2:
        return `GMT` + (i >= 0 ? `+` : ``) + hn(s, 2, o) + `:` + hn(Math.abs(i % 60), 2, o);
      case 3:
        return r === 0 ? `Z` : (i >= 0 ? `+` : ``) + hn(s, 2, o) + `:` + hn(Math.abs(i % 60), 2, o);
      default:
        throw new I(2310, !1);
    }
  };
}
var TO = 0;
var Bl = 4;
function MO(t) {
  let e = Hl(t, TO, 1).getDay();
  return Hl(t, 0, 1 + (e <= Bl ? Bl : Bl + 7) - e);
}
function nw(t) {
  let e = t.getDay(),
    n = e === 0 ? -3 : Bl - e;
  return Hl(t.getFullYear(), t.getMonth(), t.getDate() + n);
}
function bg(t, e = !1) {
  return function (n, r) {
    let i;
    if (e) {
      let o = new Date(n.getFullYear(), n.getMonth(), 1).getDay() - 1,
        s = n.getDate();
      i = 1 + Math.floor((s + o) / 7);
    } else {
      let o = nw(n),
        s = MO(o.getFullYear()),
        a = o.getTime() - s.getTime();
      i = 1 + Math.round(a / 6048e5);
    }
    return hn(i, t, Ba(r, ir.MinusSign));
  };
}
function Ul(t, e = !1) {
  return function (n, r) {
    return hn(nw(n).getFullYear(), t, Ba(r, ir.MinusSign), e);
  };
}
var Sg = Object.create(null);
function AO(t) {
  if (Sg[t]) return Sg[t];
  let e;
  switch (t) {
    case `G`:
    case `GG`:
    case `GGG`:
      e = ge(3, ae.Abbreviated);
      break;
    case `GGGG`:
      e = ge(3, ae.Wide);
      break;
    case `GGGGG`:
      e = ge(3, ae.Narrow);
      break;
    case `y`:
      e = Fe(0, 1, 0, !1, !0);
      break;
    case `yy`:
      e = Fe(0, 2, 0, !0, !0);
      break;
    case `yyy`:
      e = Fe(0, 3, 0, !1, !0);
      break;
    case `yyyy`:
      e = Fe(0, 4, 0, !1, !0);
      break;
    case `Y`:
      e = Ul(1);
      break;
    case `YY`:
      e = Ul(2, !0);
      break;
    case `YYY`:
      e = Ul(3);
      break;
    case `YYYY`:
      e = Ul(4);
      break;
    case `M`:
    case `L`:
      e = Fe(1, 1, 1);
      break;
    case `MM`:
    case `LL`:
      e = Fe(1, 2, 1);
      break;
    case `MMM`:
      e = ge(2, ae.Abbreviated);
      break;
    case `MMMM`:
      e = ge(2, ae.Wide);
      break;
    case `MMMMM`:
      e = ge(2, ae.Narrow);
      break;
    case `LLL`:
      e = ge(2, ae.Abbreviated, st.Standalone);
      break;
    case `LLLL`:
      e = ge(2, ae.Wide, st.Standalone);
      break;
    case `LLLLL`:
      e = ge(2, ae.Narrow, st.Standalone);
      break;
    case `w`:
      e = bg(1);
      break;
    case `ww`:
      e = bg(2);
      break;
    case `W`:
      e = bg(1, !0);
      break;
    case `d`:
      e = Fe(2, 1);
      break;
    case `dd`:
      e = Fe(2, 2);
      break;
    case `c`:
    case `cc`:
      e = Fe(7, 1);
      break;
    case `ccc`:
      e = ge(1, ae.Abbreviated, st.Standalone);
      break;
    case `cccc`:
      e = ge(1, ae.Wide, st.Standalone);
      break;
    case `ccccc`:
      e = ge(1, ae.Narrow, st.Standalone);
      break;
    case `cccccc`:
      e = ge(1, ae.Short, st.Standalone);
      break;
    case `E`:
    case `EE`:
    case `EEE`:
      e = ge(1, ae.Abbreviated);
      break;
    case `EEEE`:
      e = ge(1, ae.Wide);
      break;
    case `EEEEE`:
      e = ge(1, ae.Narrow);
      break;
    case `EEEEEE`:
      e = ge(1, ae.Short);
      break;
    case `a`:
    case `aa`:
    case `aaa`:
      e = ge(0, ae.Abbreviated);
      break;
    case `aaaa`:
      e = ge(0, ae.Wide);
      break;
    case `aaaaa`:
      e = ge(0, ae.Narrow);
      break;
    case `b`:
    case `bb`:
    case `bbb`:
      e = ge(0, ae.Abbreviated, st.Standalone, !0);
      break;
    case `bbbb`:
      e = ge(0, ae.Wide, st.Standalone, !0);
      break;
    case `bbbbb`:
      e = ge(0, ae.Narrow, st.Standalone, !0);
      break;
    case `B`:
    case `BB`:
    case `BBB`:
      e = ge(0, ae.Abbreviated, st.Format, !0);
      break;
    case `BBBB`:
      e = ge(0, ae.Wide, st.Format, !0);
      break;
    case `BBBBB`:
      e = ge(0, ae.Narrow, st.Format, !0);
      break;
    case `h`:
      e = Fe(3, 1, -12);
      break;
    case `hh`:
      e = Fe(3, 2, -12);
      break;
    case `H`:
      e = Fe(3, 1);
      break;
    case `HH`:
      e = Fe(3, 2);
      break;
    case `m`:
      e = Fe(4, 1);
      break;
    case `mm`:
      e = Fe(4, 2);
      break;
    case `s`:
      e = Fe(5, 1);
      break;
    case `ss`:
      e = Fe(5, 2);
      break;
    case `S`:
      e = Fe(6, 1);
      break;
    case `SS`:
      e = Fe(6, 2);
      break;
    case `SSS`:
      e = Fe(6, 3);
      break;
    case `Z`:
    case `ZZ`:
    case `ZZZ`:
      e = jl(0);
      break;
    case `ZZZZZ`:
      e = jl(3);
      break;
    case `O`:
    case `OO`:
    case `OOO`:
    case `z`:
    case `zz`:
    case `zzz`:
      e = jl(1);
      break;
    case `OOOO`:
    case `ZZZZ`:
    case `zzzz`:
      e = jl(2);
      break;
    default:
      return null;
  }
  return ((Sg[t] = e), e);
}
function rw(t, e) {
  t = t.replace(/:/g, ``);
  let n = Date.parse(`Jan 01, 1970 00:00:00 ` + t) / 6e4;
  return isNaN(n) ? e : n;
}
function NO(t, e) {
  return ((t = new Date(t.getTime())), t.setMinutes(t.getMinutes() + e), t);
}
function xO(t, e, n) {
  let i = t.getTimezoneOffset();
  return NO(t, -1 * (rw(e, i) - i));
}
function RO(t) {
  if (WC(t)) return t;
  if (typeof t == `number` && !isNaN(t)) return new Date(t);
  if (typeof t == `string`) {
    if (((t = t.trim()), /^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(t))) {
      let [i, o = 1, s = 1] = t.split(`-`).map((a) => +a);
      return Hl(i, o - 1, s);
    }
    let n = parseFloat(t);
    if (!isNaN(t - n)) return new Date(n);
    let r;
    if ((r = t.match(DO))) return OO(r);
  }
  let e = new Date(t);
  if (!WC(e)) throw new I(2311, !1);
  return e;
}
function OO(t) {
  let e = new Date(0),
    n = 0,
    r = 0,
    i = t[8] ? e.setUTCFullYear : e.setFullYear,
    o = t[8] ? e.setUTCHours : e.setHours;
  (t[9] && ((n = Number(t[9] + t[10])), (r = Number(t[9] + t[11]))),
    i.call(e, Number(t[1]), Number(t[2]) - 1, Number(t[3])));
  let s = Number(t[4] || 0) - n,
    a = Number(t[5] || 0) - r,
    c = Number(t[6] || 0),
    u = Math.floor(parseFloat(`0.` + (t[7] || 0)) * 1e3);
  return (o.call(e, s, a, c, u), e);
}
function WC(t) {
  return t instanceof Date && !isNaN(t.valueOf());
}
function Ag(t, e) {
  return new I(2100, !1);
}
var Tg = class {
  createSubscription(e, n, r) {
    return F(() => e.subscribe({ next: n, error: r }));
  }
  dispose(e) {
    F(() => e.unsubscribe());
  }
};
var Mg = class {
  createSubscription(e, n, r) {
    return (
      e.then(
        (i) => n?.(i),
        (i) => r?.(i),
      ),
      {
        unsubscribe: () => {
          ((n = null), (r = null));
        },
      }
    );
  }
  dispose(e) {
    e.unsubscribe();
  }
};
var kO = new Mg();
var PO = new Tg();
var FO = (() => {
  class t {
    _ref;
    _latestValue = null;
    markForCheckOnValueUpdate = !0;
    _subscription = null;
    _obj = null;
    _strategy = null;
    applicationErrorHandler = v(_t);
    constructor(n) {
      this._ref = n;
    }
    ngOnDestroy() {
      (this._subscription && this._dispose(), (this._ref = null));
    }
    transform(n) {
      if (!this._obj) {
        if (n)
          try {
            ((this.markForCheckOnValueUpdate = !1), this._subscribe(n));
          } finally {
            this.markForCheckOnValueUpdate = !0;
          }
        return this._latestValue;
      }
      return n !== this._obj ? (this._dispose(), this.transform(n)) : this._latestValue;
    }
    _subscribe(n) {
      ((this._obj = n),
        (this._strategy = this._selectStrategy(n)),
        (this._subscription = this._strategy.createSubscription(
          n,
          (r) => this._updateLatestValue(n, r),
          (r) => this.applicationErrorHandler(r),
        )));
    }
    _selectStrategy(n) {
      if (er(n)) return kO;
      if (Al(n)) return PO;
      throw Ag(t, n);
    }
    _dispose() {
      (this._strategy.dispose(this._subscription),
        (this._latestValue = null),
        (this._subscription = null),
        (this._obj = null));
    }
    _updateLatestValue(n, r) {
      n === this._obj &&
        ((this._latestValue = r), this.markForCheckOnValueUpdate && this._ref?.markForCheck());
    }
    static ɵfac = function (r) {
      return new (r || t)(te(nr, 16));
    };
    static ɵpipe = Go({ name: `async`, type: t, pure: !1 });
  }
  return t;
})();
var LO = `mediumDate`;
var iw = new E(``);
var ow = new E(``);
var VO = (() => {
  class t {
    locale;
    defaultTimezone;
    defaultOptions;
    constructor(n, r, i) {
      ((this.locale = n), (this.defaultTimezone = r), (this.defaultOptions = i));
    }
    transform(n, r, i, o) {
      if (n == null || n === `` || n !== n) return null;
      try {
        let s = r ?? this.defaultOptions?.dateFormat ?? LO,
          a = i ?? this.defaultOptions?.timezone ?? this.defaultTimezone ?? void 0;
        return tw(n, s, o || this.locale, a);
      } catch (s) {
        throw Ag(t, s.message);
      }
    }
    static ɵfac = function (r) {
      return new (r || t)(te(xa, 16), te(iw, 24), te(ow, 24));
    };
    static ɵpipe = Go({ name: `date`, type: t, pure: !0 });
  }
  return t;
})();
var jO = (() => {
  class t {
    transform(n, r, i) {
      if (n == null) return null;
      if (!(typeof n == `string` || Array.isArray(n))) throw Ag(t, n);
      return n.slice(r, i);
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵpipe = Go({ name: `slice`, type: t, pure: !1 });
  }
  return t;
})();
function Ha(t, e) {
  e = encodeURIComponent(e);
  for (let n of t.split(`;`)) {
    let r = n.indexOf(`=`),
      [i, o] = r == -1 ? [n, ``] : [n.slice(0, r), n.slice(r + 1)];
    if (i.trim() !== e) continue;
    let s = o;
    try {
      s = decodeURIComponent(o);
    } catch {}
    return (s.length > 1 && s[0] === `"` && s[s.length - 1] === `"` && (s = s.slice(1, -1)), s);
  }
  return null;
}
var Ng = `browser`;
function sw(t) {
  return t === Ng;
}
var Qo = class {
  _doc;
  constructor(e) {
    this._doc = e;
  }
  manager;
};
var $a = (() => {
  class t extends Qo {
    constructor(n) {
      super(n);
    }
    supports(n) {
      return !0;
    }
    addEventListener(n, r, i, o) {
      return (n.addEventListener(r, i, o), () => this.removeEventListener(n, r, i, o));
    }
    removeEventListener(n, r, i, o) {
      return n.removeEventListener(r, i, o);
    }
    static ɵfac = function (r) {
      return new (r || t)(j(ie));
    };
    static ɵprov = q({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var Wa = new E(``);
var zl = (() => {
  class t {
    _zone;
    _plugins;
    _eventNameToPlugin = new Map();
    constructor(n, r) {
      ((this._zone = r),
        n.forEach((s) => {
          s.manager = this;
        }));
      let i = n.filter((s) => !(s instanceof $a));
      this._plugins = i.slice().reverse();
      let o = n.find((s) => s instanceof $a);
      o && this._plugins.push(o);
    }
    addEventListener(n, r, i, o) {
      return this._findPluginFor(r).addEventListener(n, r, i, o);
    }
    getZone() {
      return this._zone;
    }
    _findPluginFor(n) {
      let r = this._eventNameToPlugin.get(n);
      if (r) return r;
      if (((r = this._plugins.find((o) => o.supports(n))), !r)) throw new I(-5101, !1);
      return (this._eventNameToPlugin.set(n, r), r);
    }
    static ɵfac = function (r) {
      return new (r || t)(j(Wa), j(Se));
    };
    static ɵprov = q({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var xg = `ng-app-id`;
function aw(t) {
  for (let e of t) e.remove();
}
function cw(t, e) {
  let n = e.createElement(`style`);
  return ((n.textContent = t), n);
}
function GO(t, e, n, r) {
  let i = t.head?.querySelectorAll(`style[${xg}="${e}"],link[${xg}="${e}"]`);
  if (!i || i.length === 0) return !1;
  for (let o of i)
    (o.removeAttribute(xg),
      o instanceof HTMLLinkElement
        ? r.set(o.href.slice(o.href.lastIndexOf(`/`) + 1), { usage: 0, elements: [o] })
        : o.textContent && n.set(o.textContent, { usage: 0, elements: [o] }));
  return !0;
}
function Og(t, e) {
  let n = e.createElement(`link`);
  return (n.setAttribute(`rel`, `stylesheet`), n.setAttribute(`href`, t), n);
}
var Wl = (() => {
  class t {
    doc;
    appId;
    nonce;
    inline = new Map();
    external = new Map();
    hosts = new Set();
    constructor(n, r, i, o = {}) {
      ((this.doc = n),
        (this.appId = r),
        (this.nonce = i),
        GO(n, r, this.inline, this.external) && this.hosts.add(n.head));
    }
    addStyles(n, r) {
      for (let i of n) this.addUsage(i, this.inline, cw);
      r?.forEach((i) => this.addUsage(i, this.external, Og));
    }
    removeStyles(n, r) {
      for (let i of n) this.removeUsage(i, this.inline);
      r?.forEach((i) => this.removeUsage(i, this.external));
    }
    addUsage(n, r, i) {
      let o = r.get(n);
      o
        ? o.usage++
        : r.set(n, {
            usage: 1,
            elements: [...this.hosts].map((s) => this.addElement(s, i(n, this.doc))),
          });
    }
    removeUsage(n, r) {
      let i = r.get(n);
      i && (i.usage--, i.usage <= 0 && (aw(i.elements), r.delete(n)));
    }
    ngOnDestroy() {
      for (let [, { elements: n }] of [...this.inline, ...this.external]) aw(n);
      this.hosts.clear();
    }
    addHost(n) {
      if (!this.hosts.has(n)) {
        this.hosts.add(n);
        for (let [r, { elements: i }] of this.inline) i.push(this.addElement(n, cw(r, this.doc)));
        for (let [r, { elements: i }] of this.external) i.push(this.addElement(n, Og(r, this.doc)));
      }
    }
    removeHost(n) {
      this.hosts.delete(n);
      for (let r of [...this.inline.values(), ...this.external.values()]) {
        let i = [];
        for (let o of r.elements) o.parentNode === n ? o.remove() : i.push(o);
        r.elements = i;
      }
    }
    addElement(n, r) {
      return (this.nonce && r.setAttribute(`nonce`, this.nonce), n.appendChild(r));
    }
    static ɵfac = function (r) {
      return new (r || t)(j(ie), j(Ro), j(ia, 8), j(bi));
    };
    static ɵprov = q({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var Rg = {
  svg: `http://www.w3.org/2000/svg`,
  xhtml: `http://www.w3.org/1999/xhtml`,
  xlink: `http://www.w3.org/1999/xlink`,
  xml: `http://www.w3.org/XML/1998/namespace`,
  xmlns: `http://www.w3.org/2000/xmlns/`,
  math: `http://www.w3.org/1998/Math/MathML`,
};
var kg = /%COMP%/g;
var lw = `%COMP%`;
var zO = `_nghost-${lw}`;
var WO = `_ngcontent-${lw}`;
var qO = !0;
var dw = new E(``, { factory: () => qO });
var YO = new E(``);
function ZO(t) {
  return WO.replace(kg, t);
}
function KO(t) {
  return zO.replace(kg, t);
}
function fw(t, e) {
  return e.map((n) => n.replace(kg, t));
}
var ql = (() => {
  class t {
    eventManager;
    sharedStylesHost;
    appId;
    removeStylesOnCompDestroy;
    doc;
    ngZone;
    nonce;
    tracingService;
    rendererByCompId = new Map();
    defaultRenderer;
    cssVarNamespace;
    constructor(n, r, i, o, s, a, c = null, u = null, l = null) {
      ((this.eventManager = n),
        (this.sharedStylesHost = r),
        (this.appId = i),
        (this.removeStylesOnCompDestroy = o),
        (this.doc = s),
        (this.ngZone = a),
        (this.nonce = c),
        (this.tracingService = u),
        (this.cssVarNamespace = l ?? ``),
        (this.defaultRenderer = new Ga(n, s, a, this.tracingService, this.cssVarNamespace)));
    }
    createRenderer(n, r) {
      if (!n || !r) return this.defaultRenderer;
      let i = this.getOrCreateRenderer(n, r);
      return (i instanceof Gl ? i.applyToHost(n) : i instanceof za && i.applyStyles(), i);
    }
    getOrCreateRenderer(n, r) {
      let i = this.rendererByCompId,
        o = i.get(r.id);
      if (!o) {
        let s = this.doc,
          a = this.ngZone,
          c = this.eventManager,
          u = this.sharedStylesHost,
          l = this.removeStylesOnCompDestroy,
          d = this.tracingService;
        switch (r.encapsulation) {
          case dn.Emulated:
            o = new Gl(c, u, r, this.appId, l, s, a, d, this.cssVarNamespace);
            break;
          case dn.ShadowDom:
            return new $l(c, n, r, s, a, this.nonce, d, this.cssVarNamespace, u);
          case dn.ExperimentalIsolatedShadowDom:
            return new $l(c, n, r, s, a, this.nonce, d, this.cssVarNamespace);
          default:
            o = new za(c, u, r, l, s, a, d, this.cssVarNamespace);
            break;
        }
        i.set(r.id, o);
      }
      return o;
    }
    ngOnDestroy() {
      this.rendererByCompId.clear();
    }
    componentReplaced(n) {
      this.rendererByCompId.delete(n);
    }
    static ɵfac = function (r) {
      return new (r || t)(j(zl), j(Fi), j(Ro), j(dw), j(ie), j(Se), j(ia), j(Nn, 8), j(YO, 8));
    };
    static ɵprov = q({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var Ga = class {
  eventManager;
  doc;
  ngZone;
  tracingService;
  cssVarNamespace;
  data = Object.create(null);
  throwOnSyntheticProps = !0;
  constructor(e, n, r, i, o = ``) {
    ((this.eventManager = e),
      (this.doc = n),
      (this.ngZone = r),
      (this.tracingService = i),
      (this.cssVarNamespace = o));
  }
  destroy() {}
  destroyNode = null;
  createElement(e, n) {
    return n ? this.doc.createElementNS(Rg[n] || n, e) : this.doc.createElement(e);
  }
  createComment(e) {
    return this.doc.createComment(e);
  }
  createText(e) {
    return this.doc.createTextNode(e);
  }
  appendChild(e, n) {
    (uw(e) ? e.content : e).appendChild(n);
  }
  insertBefore(e, n, r) {
    e && (uw(e) ? e.content : e).insertBefore(n, r);
  }
  removeChild(e, n) {
    n.remove();
  }
  selectRootElement(e, n) {
    let r = typeof e == `string` ? this.doc.querySelector(e) : e;
    if (!r) throw new I(-5104, !1);
    return (n || (r.textContent = ``), r);
  }
  parentNode(e) {
    return e.parentNode;
  }
  nextSibling(e) {
    return e.nextSibling;
  }
  setAttribute(e, n, r, i) {
    if (i) {
      n = i + `:` + n;
      let o = Rg[i];
      o ? e.setAttributeNS(o, n, r) : e.setAttribute(n, r);
    } else e.setAttribute(n, r);
  }
  removeAttribute(e, n, r) {
    if (r) {
      let i = Rg[r];
      i ? e.removeAttributeNS(i, n) : e.removeAttribute(`${r}:${n}`);
    } else e.removeAttribute(n);
  }
  addClass(e, n) {
    e.classList.add(n);
  }
  removeClass(e, n) {
    e.classList.remove(n);
  }
  setStyle(e, n, r, i) {
    let o = n.startsWith(`--`);
    (o && (n = n.replace(`%NS%`, this.cssVarNamespace)),
      o || i & (Mn.DashCase | Mn.Important)
        ? e.style.setProperty(n, r, i & Mn.Important ? `important` : ``)
        : (e.style[n] = r));
  }
  removeStyle(e, n, r) {
    let i = n.startsWith(`--`);
    (i && (n = n.replace(`%NS%`, this.cssVarNamespace)),
      i || r & Mn.DashCase ? e.style.removeProperty(n) : (e.style[n] = ``));
  }
  setProperty(e, n, r) {
    e != null && (e[n] = r);
  }
  setValue(e, n) {
    e.nodeValue = n;
  }
  listen(e, n, r, i) {
    if (typeof e == `string` && ((e = Rt().getGlobalEventTarget(this.doc, e)), !e))
      throw new I(-5102, !1);
    let o = this.decoratePreventDefault(r);
    return (
      this.tracingService?.wrapEventListener &&
        (o = this.tracingService.wrapEventListener(e, n, o)),
      this.eventManager.addEventListener(e, n, o, i)
    );
  }
  decoratePreventDefault(e) {
    return (n) => {
      if (n === `__ngUnwrap__`) return e;
      e(n) === !1 && n.preventDefault();
    };
  }
};
function uw(t) {
  return t.tagName === `TEMPLATE` && t.content !== void 0;
}
var $l = class extends Ga {
  hostEl;
  sharedStylesHost;
  shadowRoot;
  constructor(e, n, r, i, o, s, a, c, u) {
    (super(e, i, o, a, c),
      (this.hostEl = n),
      (this.sharedStylesHost = u),
      (this.shadowRoot = n.attachShadow({ mode: `open` })),
      this.sharedStylesHost && this.sharedStylesHost.addHost(this.shadowRoot));
    let l = r.styles;
    l = fw(r.id, l).map((f) => f.replace(/%NS%/g, c));
    for (let f of l) {
      let h = document.createElement(`style`);
      (s && h.setAttribute(`nonce`, s), (h.textContent = f), this.shadowRoot.appendChild(h));
    }
    let d = r.getExternalStyles?.();
    if (d)
      for (let f of d) {
        let h = Og(f, i);
        (s && h.setAttribute(`nonce`, s), this.shadowRoot.appendChild(h));
      }
  }
  nodeOrShadowRoot(e) {
    return e === this.hostEl ? this.shadowRoot : e;
  }
  appendChild(e, n) {
    return super.appendChild(this.nodeOrShadowRoot(e), n);
  }
  insertBefore(e, n, r) {
    return super.insertBefore(this.nodeOrShadowRoot(e), n, r);
  }
  removeChild(e, n) {
    return super.removeChild(null, n);
  }
  parentNode(e) {
    return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(e)));
  }
  destroy() {
    this.sharedStylesHost && this.sharedStylesHost.removeHost(this.shadowRoot);
  }
};
var za = class extends Ga {
  sharedStylesHost;
  removeStylesOnCompDestroy;
  styles;
  styleUrls;
  constructor(e, n, r, i, o, s, a, c, u) {
    (super(e, o, s, a, c), (this.sharedStylesHost = n), (this.removeStylesOnCompDestroy = i));
    let l = r.styles,
      d = u ? fw(u, l) : l;
    ((this.styles = d.map((f) => f.replace(/%NS%/g, c))),
      (this.styleUrls = r.getExternalStyles?.(u)));
  }
  applyStyles() {
    this.sharedStylesHost.addStyles(this.styles, this.styleUrls);
  }
  destroy() {
    this.removeStylesOnCompDestroy &&
      xr.size === 0 &&
      this.sharedStylesHost.removeStyles(this.styles, this.styleUrls);
  }
};
var Gl = class extends za {
  contentAttr;
  hostAttr;
  constructor(e, n, r, i, o, s, a, c, u) {
    let l = i + `-` + r.id;
    (super(e, n, r, o, s, a, c, u, l), (this.contentAttr = ZO(l)), (this.hostAttr = KO(l)));
  }
  applyToHost(e) {
    (this.applyStyles(), this.setAttribute(e, this.hostAttr, ``));
  }
  createElement(e, n) {
    let r = super.createElement(e, n);
    return (super.setAttribute(r, this.contentAttr, ``), r);
  }
};
var Yl = class t extends La {
  supportsDOMEvents = !0;
  static makeCurrent() {
    wg(new t());
  }
  onAndCancel(e, n, r, i) {
    return (
      e.addEventListener(n, r, i),
      () => {
        e.removeEventListener(n, r, i);
      }
    );
  }
  dispatchEvent(e, n) {
    e.dispatchEvent(n);
  }
  remove(e) {
    e.remove();
  }
  createElement(e, n) {
    return ((n = n || this.getDefaultDocument()), n.createElement(e));
  }
  createHtmlDocument() {
    return document.implementation.createHTMLDocument(`fakeTitle`);
  }
  getDefaultDocument() {
    return document;
  }
  isElementNode(e) {
    return e.nodeType === Node.ELEMENT_NODE;
  }
  isShadowRoot(e) {
    return e instanceof DocumentFragment;
  }
  getGlobalEventTarget(e, n) {
    return n === `window` ? window : n === `document` ? e : n === `body` ? e.body : null;
  }
  getBaseHref(e) {
    let n = QO();
    return n == null ? null : XO(n);
  }
  resetBaseElement() {
    qa = null;
  }
  getUserAgent() {
    return window.navigator.userAgent;
  }
  getCookie(e) {
    return Ha(document.cookie, e);
  }
};
var qa = null;
function QO() {
  return ((qa = qa || document.head.querySelector(`base`)), qa ? qa.getAttribute(`href`) : null);
}
function XO(t) {
  return new URL(t, document.baseURI).pathname;
}
var hw = [`alt`, `control`, `meta`, `shift`];
var JO = {
  '\b': `Backspace`,
  '	': `Tab`,
  '': `Delete`,
  '\x1B': `Escape`,
  Del: `Delete`,
  Esc: `Escape`,
  Left: `ArrowLeft`,
  Right: `ArrowRight`,
  Up: `ArrowUp`,
  Down: `ArrowDown`,
  Menu: `ContextMenu`,
  Scroll: `ScrollLock`,
  Win: `OS`,
};
var ek = {
  alt: (t) => t.altKey,
  control: (t) => t.ctrlKey,
  meta: (t) => t.metaKey,
  shift: (t) => t.shiftKey,
};
var pw = (() => {
  class t extends Qo {
    constructor(n) {
      super(n);
    }
    supports(n) {
      return t.parseEventName(n) != null;
    }
    addEventListener(n, r, i, o) {
      let s = t.parseEventName(r),
        a = t.eventCallback(s.fullKey, i, this.manager.getZone());
      return this.manager
        .getZone()
        .runOutsideAngular(() => Rt().onAndCancel(n, s.domEventName, a, o));
    }
    static parseEventName(n) {
      let r = n.toLowerCase().split(`.`),
        i = r.shift();
      if (r.length === 0 || !(i === `keydown` || i === `keyup`)) return null;
      let o = t._normalizeKey(r.pop()),
        s = ``,
        a = r.indexOf(`code`);
      if (
        (a > -1 && (r.splice(a, 1), (s = `code.`)),
        hw.forEach((u) => {
          let l = r.indexOf(u);
          l > -1 && (r.splice(l, 1), (s += u + `.`));
        }),
        (s += o),
        r.length != 0 || o.length === 0)
      )
        return null;
      let c = {};
      return ((c.domEventName = i), (c.fullKey = s), c);
    }
    static matchEventFullKeyCode(n, r) {
      let i = JO[n.key] || n.key,
        o = ``;
      return (
        r.indexOf(`code.`) > -1 && ((i = n.code), (o = `code.`)),
        i == null || !i
          ? !1
          : ((i = i.toLowerCase()),
            i === ` ` ? (i = `space`) : i === `.` && (i = `dot`),
            hw.forEach((s) => {
              if (s !== i) {
                let a = ek[s];
                a(n) && (o += s + `.`);
              }
            }),
            (o += i),
            o === r)
      );
    }
    static eventCallback(n, r, i) {
      return (o) => {
        t.matchEventFullKeyCode(o, n) && i.runGuarded(() => r(o));
      };
    }
    static _normalizeKey(n) {
      return n === `esc` ? `escape` : n;
    }
    static ɵfac = function (r) {
      return new (r || t)(j(ie));
    };
    static ɵprov = q({ token: t, factory: t.ɵfac });
  }
  return t;
})();
async function tk(t, e, n) {
  return LC(l({ rootComponent: t }, nk(e, n)));
}
function nk(t, e) {
  return {
    platformRef: e?.platformRef,
    appProviders: [...ak, ...(t?.providers ?? [])],
    platformProviders: sk,
  };
}
function rk() {
  Yl.makeCurrent();
}
function ik() {
  return new Ht();
}
function ok() {
  return (mp(document), document);
}
var sk = [
  { provide: bi, useValue: Ng },
  { provide: Lu, useValue: rk, multi: !0 },
  { provide: ie, useFactory: ok },
];
var ak = [
  { provide: Ks, useValue: `root` },
  { provide: Ht, useFactory: ik },
  { provide: Wa, useClass: $a, multi: !0 },
  { provide: Wa, useClass: pw, multi: !0 },
  ql,
  { provide: Fi, useClass: Wl },
  { provide: Wl, useExisting: Fi },
  zl,
  { provide: xi, useExisting: ql },
  [],
];
var sr = class t {
  headers;
  normalizedNames = new Map();
  lazyInit;
  lazyUpdate = null;
  constructor(e) {
    e
      ? typeof e == `string`
        ? (this.lazyInit = () => {
            ((this.headers = new Map()),
              e
                .split(
                  `
`,
                )
                .forEach((n) => {
                  let r = n.indexOf(`:`);
                  if (r > 0) {
                    let i = n.slice(0, r),
                      o = n.slice(r + 1).trim();
                    this.addHeaderEntry(i, o);
                  }
                }));
          })
        : typeof Headers < `u` && e instanceof Headers
          ? ((this.headers = new Map()),
            e.forEach((n, r) => {
              this.addHeaderEntry(r, n);
            }))
          : (this.lazyInit = () => {
              ((this.headers = new Map()),
                Object.entries(e).forEach(([n, r]) => {
                  this.setHeaderEntries(n, r);
                }));
            })
      : (this.headers = new Map());
  }
  has(e) {
    return (this.init(), this.headers.has(e.toLowerCase()));
  }
  get(e) {
    this.init();
    let n = this.headers.get(e.toLowerCase());
    return n && n.length > 0 ? n[0] : null;
  }
  keys() {
    return (this.init(), Array.from(this.normalizedNames.values()));
  }
  getAll(e) {
    return (this.init(), this.headers.get(e.toLowerCase()) || null);
  }
  append(e, n) {
    return this.clone({ name: e, value: n, op: `a` });
  }
  set(e, n) {
    return this.clone({ name: e, value: n, op: `s` });
  }
  delete(e, n) {
    return this.clone({ name: e, value: n, op: `d` });
  }
  maybeSetNormalizedName(e, n) {
    this.normalizedNames.has(n) || this.normalizedNames.set(n, e);
  }
  init() {
    this.lazyInit &&
      (this.lazyInit instanceof t ? this.copyFrom(this.lazyInit) : this.lazyInit(),
      (this.lazyInit = null),
      this.lazyUpdate &&
        (this.lazyUpdate.forEach((e) => this.applyUpdate(e)), (this.lazyUpdate = null)));
  }
  copyFrom(e) {
    e.init();
    for (let [n, r] of e.headers.entries())
      (this.headers.set(n, r), this.normalizedNames.set(n, e.normalizedNames.get(n)));
  }
  clone(e) {
    let n = new t();
    return (
      (n.lazyInit = this.lazyInit && this.lazyInit instanceof t ? this.lazyInit : this),
      (n.lazyUpdate = (this.lazyUpdate || []).concat([e])),
      n
    );
  }
  applyUpdate(e) {
    let n = e.name.toLowerCase();
    switch (e.op) {
      case `a`:
      case `s`:
        let r = e.value;
        if ((typeof r == `string` && (r = [r]), r.length === 0)) return;
        this.maybeSetNormalizedName(e.name, n);
        let i = e.op === `a` ? (this.headers.get(n) || []).slice() : [];
        (i.push(...r), this.headers.set(n, i));
        break;
      case `d`:
        let o = e.value;
        if (o === void 0) (this.headers.delete(n), this.normalizedNames.delete(n));
        else {
          let s = Array.isArray(o) ? o : [o],
            a = this.headers.get(n);
          if (!a) return;
          ((a = a.filter((c) => s.indexOf(c) === -1)),
            a.length === 0
              ? (this.headers.delete(n), this.normalizedNames.delete(n))
              : this.headers.set(n, a));
        }
        break;
    }
  }
  addHeaderEntry(e, n) {
    let r = e.toLowerCase();
    (this.maybeSetNormalizedName(e, r),
      this.headers.has(r) ? this.headers.get(r).push(n) : this.headers.set(r, [n]));
  }
  setHeaderEntries(e, n) {
    let r = (Array.isArray(n) ? n : [n]).map((o) => o.toString()),
      i = e.toLowerCase();
    (this.headers.set(i, r), this.maybeSetNormalizedName(e, i));
  }
  forEach(e) {
    (this.init(),
      Array.from(this.normalizedNames.keys()).forEach((n) =>
        e(this.normalizedNames.get(n), this.headers.get(n)),
      ));
  }
};
var Kl = class {
  map = new Map();
  set(e, n) {
    return (this.map.set(e, n), this);
  }
  get(e) {
    return (this.map.has(e) || this.map.set(e, e.defaultValue()), this.map.get(e));
  }
  delete(e) {
    return (this.map.delete(e), this);
  }
  has(e) {
    return this.map.has(e);
  }
  keys() {
    return this.map.keys();
  }
};
var Ql = class {
  encodeKey(e) {
    return gw(e);
  }
  encodeValue(e) {
    return gw(e);
  }
  decodeKey(e) {
    return decodeURIComponent(e);
  }
  decodeValue(e) {
    return decodeURIComponent(e);
  }
};
function ck(t, e) {
  let n = new Map();
  return (
    t.length > 0 &&
      t
        .replace(/^\?/, ``)
        .split(`&`)
        .forEach((i) => {
          let o = i.indexOf(`=`),
            [s, a] =
              o == -1
                ? [e.decodeKey(i), ``]
                : [e.decodeKey(i.slice(0, o)), e.decodeValue(i.slice(o + 1))],
            c = n.get(s) || [];
          (c.push(a), n.set(s, c));
        }),
    n
  );
}
var uk = /%(\d[a-f0-9])/gi;
var lk = { 40: `@`, '3A': `:`, 24: `$`, '2C': `,`, '3B': `;`, '3D': `=`, '3F': `?`, '2F': `/` };
function gw(t) {
  return encodeURIComponent(t).replace(uk, (e, n) => lk[n] ?? e);
}
function Zl(t) {
  return `${t}`;
}
var or = class t {
  map;
  encoder;
  updates = null;
  cloneFrom = null;
  constructor(e = {}) {
    if (((this.encoder = e.encoder || new Ql()), e.fromString)) {
      if (e.fromObject) throw new I(2805, !1);
      this.map = ck(e.fromString, this.encoder);
    } else
      e.fromObject
        ? ((this.map = new Map()),
          Object.keys(e.fromObject).forEach((n) => {
            let r = e.fromObject[n],
              i = Array.isArray(r) ? r.map(Zl) : [Zl(r)];
            this.map.set(n, i);
          }))
        : (this.map = null);
  }
  has(e) {
    return (this.init(), this.map.has(e));
  }
  get(e) {
    this.init();
    let n = this.map.get(e);
    return n ? n[0] : null;
  }
  getAll(e) {
    return (this.init(), this.map.get(e) || null);
  }
  keys() {
    return (this.init(), Array.from(this.map.keys()));
  }
  append(e, n) {
    return this.clone({ param: e, value: n, op: `a` });
  }
  appendAll(e) {
    let n = [];
    return (
      Object.keys(e).forEach((r) => {
        let i = e[r];
        Array.isArray(i)
          ? i.forEach((o) => {
              n.push({ param: r, value: o, op: `a` });
            })
          : n.push({ param: r, value: i, op: `a` });
      }),
      this.clone(n)
    );
  }
  set(e, n) {
    return this.clone({ param: e, value: n, op: `s` });
  }
  delete(e, n) {
    return this.clone({ param: e, value: n, op: `d` });
  }
  toString() {
    return (
      this.init(),
      this.keys()
        .map((e) => {
          let n = this.encoder.encodeKey(e);
          return this.map
            .get(e)
            .map((r) => n + `=` + this.encoder.encodeValue(r))
            .join(`&`);
        })
        .filter((e) => e !== ``)
        .join(`&`)
    );
  }
  clone(e) {
    let n = new t({ encoder: this.encoder });
    return (
      (n.cloneFrom = this.cloneFrom || this),
      (n.updates = (this.updates || []).concat(e)),
      n
    );
  }
  init() {
    if ((this.map === null && (this.map = new Map()), this.cloneFrom !== null)) {
      this.cloneFrom.init();
      for (let [e, n] of this.cloneFrom.map.entries()) this.map.set(e, n);
      (this.updates.forEach((e) => {
        switch (e.op) {
          case `a`:
          case `s`:
            let n = e.op === `a` ? (this.map.get(e.param) || []).slice() : [];
            (n.push(Zl(e.value)), this.map.set(e.param, n));
            break;
          case `d`:
            if (e.value !== void 0) {
              let r = (this.map.get(e.param) || []).slice(),
                i = r.indexOf(Zl(e.value));
              (i !== -1 && r.splice(i, 1),
                r.length > 0 ? this.map.set(e.param, r) : this.map.delete(e.param));
            } else {
              this.map.delete(e.param);
              break;
            }
        }
      }),
        (this.cloneFrom = this.updates = null));
    }
  }
};
function dk(t) {
  switch (t) {
    case `DELETE`:
    case `GET`:
    case `HEAD`:
    case `OPTIONS`:
    case `JSONP`:
      return !1;
    default:
      return !0;
  }
}
function mw(t) {
  return typeof ArrayBuffer < `u` && t instanceof ArrayBuffer;
}
function vw(t) {
  return typeof Blob < `u` && t instanceof Blob;
}
function yw(t) {
  return typeof FormData < `u` && t instanceof FormData;
}
function fk(t) {
  return typeof URLSearchParams < `u` && t instanceof URLSearchParams;
}
var Pg = `Content-Type`;
var _w = `Accept`;
var Cw = `text/plain`;
var ww = `application/json`;
var hk = `${ww}, ${Cw}, */*`;
var Xo = class t {
  url;
  body = null;
  headers;
  context;
  reportProgress = !1;
  reportUploadProgress = !1;
  reportDownloadProgress = !1;
  withCredentials = !1;
  credentials;
  keepalive = !1;
  cache;
  priority;
  mode;
  redirect;
  referrer;
  integrity;
  referrerPolicy;
  responseType = `json`;
  method;
  params;
  urlWithParams;
  transferCache;
  timeout;
  constructor(e, n, r, i) {
    ((this.url = n), (this.method = e.toUpperCase()));
    let o;
    if ((dk(this.method) || i ? ((this.body = r !== void 0 ? r : null), (o = i)) : (o = r), o)) {
      if (
        ((this.reportProgress = !!o.reportProgress),
        (this.reportUploadProgress = !!o.reportUploadProgress),
        (this.reportDownloadProgress = !!o.reportDownloadProgress),
        (this.withCredentials = !!o.withCredentials),
        (this.keepalive = !!o.keepalive),
        o.responseType && (this.responseType = o.responseType),
        o.headers && (this.headers = o.headers),
        o.context && (this.context = o.context),
        o.params && (this.params = o.params),
        o.priority && (this.priority = o.priority),
        o.cache && (this.cache = o.cache),
        o.credentials && (this.credentials = o.credentials),
        typeof o.timeout == `number`)
      ) {
        if (o.timeout < 1 || !Number.isInteger(o.timeout)) throw new I(2822, ``);
        this.timeout = o.timeout;
      }
      (o.mode && (this.mode = o.mode),
        o.redirect && (this.redirect = o.redirect),
        o.integrity && (this.integrity = o.integrity),
        o.referrer !== void 0 && (this.referrer = o.referrer),
        o.referrerPolicy && (this.referrerPolicy = o.referrerPolicy),
        (this.transferCache = o.transferCache));
    }
    if (((this.headers ??= new sr()), (this.context ??= new Kl()), !this.params))
      ((this.params = new or()), (this.urlWithParams = n));
    else {
      let s = this.params.toString();
      if (s.length === 0) this.urlWithParams = n;
      else {
        let a = n,
          c = ``,
          u = n.indexOf(`#`);
        u !== -1 && ((c = n.substring(u)), (a = n.substring(0, u)));
        let l = a.indexOf(`?`),
          d = l === -1 ? `?` : l < a.length - 1 ? `&` : ``;
        this.urlWithParams = a + d + s + c;
      }
    }
  }
  serializeBody() {
    return this.body === null
      ? null
      : typeof this.body == `string` ||
          mw(this.body) ||
          vw(this.body) ||
          yw(this.body) ||
          fk(this.body)
        ? this.body
        : this.body instanceof or
          ? this.body.toString()
          : typeof this.body == `object` ||
              typeof this.body == `boolean` ||
              Array.isArray(this.body)
            ? JSON.stringify(this.body)
            : this.body.toString();
  }
  detectContentTypeHeader() {
    return this.body === null || yw(this.body)
      ? null
      : vw(this.body)
        ? this.body.type || null
        : mw(this.body)
          ? null
          : typeof this.body == `string`
            ? Cw
            : this.body instanceof or
              ? `application/x-www-form-urlencoded;charset=UTF-8`
              : typeof this.body == `object` ||
                  typeof this.body == `number` ||
                  typeof this.body == `boolean`
                ? ww
                : null;
  }
  clone(e = {}) {
    let n = e.method || this.method,
      r = e.url || this.url,
      i = e.responseType || this.responseType,
      o = e.keepalive ?? this.keepalive,
      s = e.priority || this.priority,
      a = e.cache || this.cache,
      c = e.mode || this.mode,
      u = e.redirect || this.redirect,
      l = e.credentials || this.credentials,
      d = e.referrer ?? this.referrer,
      f = e.integrity || this.integrity,
      h = e.referrerPolicy || this.referrerPolicy,
      g = e.transferCache ?? this.transferCache,
      p = e.timeout ?? this.timeout,
      m = e.body !== void 0 ? e.body : this.body,
      y = e.withCredentials ?? this.withCredentials,
      _ = e.reportProgress ?? this.reportProgress,
      w = e.reportUploadProgress ?? this.reportUploadProgress,
      b = e.reportDownloadProgress ?? this.reportDownloadProgress,
      C = e.headers || this.headers,
      N = e.params || this.params,
      T = e.context ?? this.context;
    return (
      e.setHeaders !== void 0 &&
        (C = Object.keys(e.setHeaders).reduce((M, S) => M.set(S, e.setHeaders[S]), C)),
      e.setParams && (N = Object.keys(e.setParams).reduce((M, S) => M.set(S, e.setParams[S]), N)),
      new t(n, r, m, {
        params: N,
        headers: C,
        context: T,
        reportProgress: _,
        reportUploadProgress: w,
        reportDownloadProgress: b,
        responseType: i,
        withCredentials: y,
        transferCache: g,
        keepalive: o,
        cache: a,
        priority: s,
        timeout: p,
        mode: c,
        redirect: u,
        credentials: l,
        referrer: d,
        integrity: f,
        referrerPolicy: h,
      })
    );
  }
};
var Hi = (function (t) {
  return (
    (t[(t.Sent = 0)] = `Sent`),
    (t[(t.UploadProgress = 1)] = `UploadProgress`),
    (t[(t.ResponseHeader = 2)] = `ResponseHeader`),
    (t[(t.DownloadProgress = 3)] = `DownloadProgress`),
    (t[(t.Response = 4)] = `Response`),
    (t[(t.User = 5)] = `User`),
    t
  );
})(Hi || {});
var Jo = class {
  headers;
  status;
  statusText;
  url;
  ok;
  type;
  redirected;
  responseType;
  constructor(e, n = 200, r = `OK`) {
    ((this.headers = e.headers || new sr()),
      (this.status = e.status !== void 0 ? e.status : n),
      (this.statusText = e.statusText || r),
      (this.url = e.url || null),
      (this.redirected = e.redirected),
      (this.responseType = e.responseType),
      (this.ok = this.status >= 200 && this.status < 300));
  }
};
var Xl = class t extends Jo {
  constructor(e = {}) {
    super(e);
  }
  type = Hi.ResponseHeader;
  clone(e = {}) {
    return new t({
      headers: e.headers || this.headers,
      status: e.status !== void 0 ? e.status : this.status,
      statusText: e.statusText || this.statusText,
      url: e.url || this.url || void 0,
    });
  }
};
var Ya = class t extends Jo {
  body;
  constructor(e = {}) {
    (super(e), (this.body = e.body !== void 0 ? e.body : null));
  }
  type = Hi.Response;
  clone(e = {}) {
    return new t({
      body: e.body !== void 0 ? e.body : this.body,
      headers: e.headers || this.headers,
      status: e.status !== void 0 ? e.status : this.status,
      statusText: e.statusText || this.statusText,
      url: e.url || this.url || void 0,
      redirected: e.redirected ?? this.redirected,
      responseType: e.responseType ?? this.responseType,
    });
  }
};
var Bi = class extends Jo {
  name = `HttpErrorResponse`;
  message;
  error;
  ok = !1;
  constructor(e) {
    (super(e, 0, `Unknown Error`),
      this.status >= 200 && this.status < 300
        ? (this.message = `Http failure during parsing for ${e.url || `(unknown url)`}`)
        : (this.message = `Http failure response for ${e.url || `(unknown url)`}: ${e.status} ${e.statusText}`),
      (this.error = e.error || null));
  }
};
var pk = 200;
var gk = /^\)\]\}',?\n/;
var Iw = new E(``, { factory: () => null });
var es = (() => {
  class t {
    fetchImpl = v(Lg, { optional: !0 })?.fetch ?? ((...n) => globalThis.fetch(...n));
    ngZone = v(Se);
    destroyRef = v(J);
    maxResponseSize = v(Iw);
    handle(n) {
      return new k((r) => {
        let i = new AbortController(),
          o = !1,
          s = {
            next: (c) => {
              (c.type === Hi.Response && (o = !0), r.next(c));
            },
            error: (c) => {
              ((o = !0), r.error(c));
            },
            complete: () => {
              ((o = !0), r.complete());
            },
          };
        this.doRequest(n, i.signal, s).then(Vg, (c) => s.error(new Bi({ error: c })));
        let a;
        return (
          n.timeout &&
            (a = this.ngZone.runOutsideAngular(() =>
              setTimeout(() => {
                i.signal.aborted || i.abort(new DOMException(`signal timed out`, `TimeoutError`));
              }, n.timeout),
            )),
          () => {
            (a !== void 0 && clearTimeout(a), !o && !i.signal.aborted && i.abort());
          }
        );
      });
    }
    async doRequest(n, r, i) {
      let o = this.createRequestInit(n),
        s;
      try {
        let m = this.ngZone.runOutsideAngular(() =>
          this.fetchImpl(n.urlWithParams, l({ signal: r }, o)),
        );
        (mk(m), i.next({ type: Hi.Sent }), (s = await m));
      } catch (m) {
        i.error(
          new Bi({
            error: m,
            status: m.status ?? 0,
            statusText: m.statusText,
            url: n.urlWithParams,
            headers: m.headers,
          }),
        );
        return;
      }
      let a = new sr(s.headers),
        c = s.statusText,
        u = s.url || n.urlWithParams,
        l$1 = s.status,
        d = null,
        f = n.reportProgress || n.reportDownloadProgress;
      if ((f && i.next(new Xl({ headers: a, status: l$1, statusText: c, url: u })), s.body)) {
        let m = s.headers.get(Pg) ?? ``,
          y = s.headers.get(`content-length`),
          _ = y !== null ? Number(y) : NaN;
        this.maxResponseSize !== null &&
          Number.isFinite(_) &&
          _ > this.maxResponseSize &&
          Dw(this.maxResponseSize);
        let w = [],
          b = s.body.getReader(),
          C = 0,
          N,
          T,
          M = typeof Zone < `u` && Zone.current,
          S = !1;
        if (
          (await this.ngZone.runOutsideAngular(async () => {
            for (;;) {
              if (this.destroyRef.destroyed) {
                (await b.cancel(), (S = !0));
                break;
              }
              let { done: me, value: he } = await b.read();
              if (me) break;
              if (
                (w.push(he),
                (C += he.length),
                this.maxResponseSize !== null &&
                  C > this.maxResponseSize &&
                  (await b.cancel(), Dw(this.maxResponseSize)),
                f)
              ) {
                T =
                  n.responseType === `text`
                    ? (T ?? ``) + (N ??= Ew(m)).decode(he, { stream: !0 })
                    : void 0;
                let ce = () =>
                  i.next({
                    type: Hi.DownloadProgress,
                    total: Number.isFinite(_) ? _ : void 0,
                    loaded: C,
                    partialText: T,
                  });
                M ? M.run(ce) : ce();
              }
            }
          }),
          S)
        ) {
          i.complete();
          return;
        }
        let $ = this.concatChunks(w, C);
        try {
          d = this.parseBody(n, $, m, l$1);
        } catch (me) {
          i.error(
            new Bi({
              error: me,
              headers: new sr(s.headers),
              status: s.status,
              statusText: s.statusText,
              url: s.url || n.urlWithParams,
            }),
          );
          return;
        }
      }
      l$1 === 0 && (l$1 = d ? pk : 0);
      let h = l$1 >= 200 && l$1 < 300,
        g = s.redirected,
        p = s.type;
      h
        ? (i.next(
            new Ya({
              body: d,
              headers: a,
              status: l$1,
              statusText: c,
              url: u,
              redirected: g,
              responseType: p,
            }),
          ),
          i.complete())
        : i.error(
            new Bi({
              error: d,
              headers: a,
              status: l$1,
              statusText: c,
              url: u,
              redirected: g,
              responseType: p,
            }),
          );
    }
    parseBody(n, r, i, o) {
      switch (n.responseType) {
        case `json`:
          let s = new TextDecoder().decode(r).replace(gk, ``);
          if (s === ``) return null;
          try {
            return JSON.parse(s);
          } catch (a) {
            if (o < 200 || o >= 300) return s;
            throw a;
          }
        case `text`:
          return Ew(i).decode(r);
        case `blob`:
          return new Blob([r], { type: i });
        case `arraybuffer`:
          return r.buffer;
      }
    }
    createRequestInit(n) {
      if (n.reportUploadProgress) throw new I(2824, !1);
      let r = {},
        i;
      if (
        ((i = n.credentials),
        n.withCredentials && (i = `include`),
        n.headers.forEach((o, s) => (r[o] = s.join(`,`))),
        n.headers.has(_w) || (r[_w] = hk),
        !n.headers.has(Pg))
      ) {
        let o = n.detectContentTypeHeader();
        o !== null && (r[Pg] = o);
      }
      return {
        body: n.serializeBody(),
        method: n.method,
        headers: r,
        credentials: i,
        keepalive: n.keepalive,
        cache: n.cache,
        priority: n.priority,
        mode: n.mode,
        redirect: n.redirect,
        referrer: n.referrer,
        integrity: n.integrity,
        referrerPolicy: n.referrerPolicy,
      };
    }
    concatChunks(n, r) {
      let i = new Uint8Array(r),
        o = 0;
      for (let s of n) (i.set(s, o), (o += s.length));
      return i;
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var Lg = class {};
function Vg() {}
function mk(t) {
  t.then(Vg, Vg);
}
function Dw(t) {
  throw new I(-2825, !1);
}
var vk = /charset=\s*["']?([^;"'\s]+)["']?/i;
function Ew(t) {
  let e = t.match(vk);
  if (e !== null)
    try {
      return new TextDecoder(e[1]);
    } catch {}
  return new TextDecoder();
}
var yk = new E(``, { factory: () => !0 });
var _k = `XSRF-TOKEN`;
var Dk = new E(``, { factory: () => _k });
var Ek = `X-XSRF-TOKEN`;
var Ck = new E(``, { factory: () => Ek });
var wk = (() => {
  class t {
    cookieName = v(Dk);
    doc = v(ie);
    lastCookieString = ``;
    lastToken = null;
    parseCount = 0;
    getToken() {
      let n = this.doc.cookie || ``;
      return (
        n !== this.lastCookieString &&
          (this.parseCount++,
          (this.lastToken = Ha(n, this.cookieName)),
          (this.lastCookieString = n)),
        this.lastToken
      );
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var bw = (() => {
  class t {
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = q({
      token: t,
      factory: function (r) {
        let i = null;
        return (r ? (i = new (r || t)()) : (i = j(wk)), i);
      },
      providedIn: `root`,
    });
  }
  return t;
})();
function Sw(t, e) {
  if (!v(yk) || t.method === `GET` || t.method === `HEAD`) return e(t);
  try {
    let i = v(Yo).href,
      { origin: o } = new URL(i),
      { origin: s } = new URL(t.url, o);
    if (o !== s) return e(t);
  } catch {
    return e(t);
  }
  let n = v(bw).getToken(),
    r = v(Ck);
  return (n != null && !t.headers.has(r) && (t = t.clone({ headers: t.headers.set(r, n) })), e(t));
}
function Ik(t, e) {
  return e(t);
}
function bk(t, e, n) {
  return (r, i) => $e(n, () => e(r, (o) => t(o, i)));
}
var Tw = new E(``, { factory: () => [Sw] });
var Mw = new E(``);
var Aw = new E(``, { factory: () => !0 });
var ed = (() => {
  class t {
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = q({
      token: t,
      factory: function (r) {
        let i = null;
        return (r ? (i = new (r || t)()) : (i = j(es)), i);
      },
      providedIn: `root`,
    });
  }
  return t;
})();
var Jl = (() => {
  class t {
    backend;
    injector;
    chain = null;
    pendingTasks = v(Si);
    contributeToStability = v(Aw);
    constructor(n, r) {
      ((this.backend = n), (this.injector = r));
    }
    handle(n) {
      if (this.chain === null) {
        let i = this.injector.get(td, null, { skipSelf: !0 }),
          o = i !== null && this.backend === i,
          s = this.injector.get(Mw, [], o ? { self: !0 } : void 0),
          a = Array.from(new Set([...this.injector.get(Tw), ...s]));
        this.chain = a.reduceRight((c, u) => bk(c, u, this.injector), Ik);
      }
      let r = this.chain;
      if (this.contributeToStability) {
        let i = this.pendingTasks.add();
        return F(() => r(n, (o) => this.backend.handle(o))).pipe(mo(i));
      } else return F(() => r(n, (i) => this.backend.handle(i)));
    }
    static ɵfac = function (r) {
      return new (r || t)(j(ed), j(ve));
    };
    static ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
  }
  return t;
})();
var td = (() => {
  class t {
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = q({
      token: t,
      factory: function (r) {
        let i = null;
        return (r ? (i = new (r || t)()) : (i = j(Jl)), i);
      },
      providedIn: `root`,
    });
  }
  return t;
})();
function Fg(t, e) {
  return l({ body: e }, t);
}
var Nw = (() => {
  class t {
    handler;
    constructor(n) {
      this.handler = n;
    }
    request(n, r, i = {}) {
      let o;
      if (n instanceof Xo) o = n;
      else {
        let c;
        i.headers instanceof sr ? (c = i.headers) : (c = new sr(i.headers));
        let u;
        (i.params &&
          (i.params instanceof or ? (u = i.params) : (u = new or({ fromObject: i.params }))),
          (o = new Xo(n, r, i.body !== void 0 ? i.body : null, {
            headers: c,
            context: i.context,
            params: u,
            reportProgress: i.reportProgress,
            reportUploadProgress: i.reportUploadProgress,
            reportDownloadProgress: i.reportDownloadProgress,
            responseType: i.responseType || `json`,
            withCredentials: i.withCredentials,
            transferCache: i.transferCache,
            keepalive: i.keepalive,
            priority: i.priority,
            cache: i.cache,
            mode: i.mode,
            redirect: i.redirect,
            credentials: i.credentials,
            referrer: i.referrer,
            referrerPolicy: i.referrerPolicy,
            integrity: i.integrity,
            timeout: i.timeout,
          })));
      }
      let s = z(o).pipe(go((c) => this.handler.handle(c)));
      if (n instanceof Xo || i.observe === `events`) return s;
      let a = s.pipe(et((c) => c instanceof Ya));
      switch (i.observe || `body`) {
        case `body`:
          switch (o.responseType) {
            case `arraybuffer`:
              return a.pipe(
                Y((c) => {
                  if (c.body !== null && !(c.body instanceof ArrayBuffer)) throw new I(2806, !1);
                  return c.body;
                }),
              );
            case `blob`:
              return a.pipe(
                Y((c) => {
                  if (c.body !== null && !(c.body instanceof Blob)) throw new I(2807, !1);
                  return c.body;
                }),
              );
            case `text`:
              return a.pipe(
                Y((c) => {
                  if (c.body !== null && typeof c.body != `string`) throw new I(2808, !1);
                  return c.body;
                }),
              );
            default:
              return a.pipe(Y((c) => c.body));
          }
        case `response`:
          return a;
        default:
          throw new I(2809, !1);
      }
    }
    delete(n, r = {}) {
      return this.request(`DELETE`, n, r);
    }
    get(n, r = {}) {
      return this.request(`GET`, n, r);
    }
    head(n, r = {}) {
      return this.request(`HEAD`, n, r);
    }
    jsonp(n, r) {
      return this.request(`JSONP`, n, {
        params: new or().append(r, `JSONP_CALLBACK`),
        observe: `body`,
        responseType: `json`,
      });
    }
    options(n, r = {}) {
      return this.request(`OPTIONS`, n, r);
    }
    patch(n, r, i = {}) {
      return this.request(`PATCH`, n, Fg(i, r));
    }
    post(n, r, i = {}) {
      return this.request(`POST`, n, Fg(i, r));
    }
    put(n, r, i = {}) {
      return this.request(`PUT`, n, Fg(i, r));
    }
    static ɵfac = function (r) {
      return new (r || t)(j(td));
    };
    static ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
  }
  return t;
})();
var jg = (function (t) {
  return (
    (t[(t.Interceptors = 0)] = `Interceptors`),
    (t[(t.LegacyInterceptors = 1)] = `LegacyInterceptors`),
    (t[(t.CustomXsrfConfiguration = 2)] = `CustomXsrfConfiguration`),
    (t[(t.NoXsrfProtection = 3)] = `NoXsrfProtection`),
    (t[(t.JsonpSupport = 4)] = `JsonpSupport`),
    (t[(t.RequestsMadeViaParent = 5)] = `RequestsMadeViaParent`),
    (t[(t.Fetch = 6)] = `Fetch`),
    (t[(t.Xhr = 7)] = `Xhr`),
    t
  );
})(jg || {});
function Sk(t, e) {
  return { ɵkind: t, ɵproviders: e };
}
function Tk(...t) {
  let e = [
    Nw,
    es,
    Jl,
    { provide: td, useExisting: Jl },
    { provide: ed, useFactory: () => v(es) },
    { provide: Tw, useValue: Sw, multi: !0 },
  ];
  for (let n of t) e.push(...n.ɵproviders);
  return sn(e);
}
function Mk() {
  return Sk(jg.Fetch, [es, { provide: ed, useExisting: es }]);
}
var CZ = (() => {
  class t {
    _doc = v(ie);
    _dom = Rt();
    _cachedHead;
    addTag(n, r = !1) {
      return n ? this._getOrCreateElement(n, r) : null;
    }
    addTags(n, r = !1) {
      return n.filter((i) => !!i).map((i) => this._getOrCreateElement(i, r));
    }
    getTag(n) {
      if (!n) return null;
      let r = this._doc.querySelector(xw(n));
      return kw(r) ? r : null;
    }
    getTags(n) {
      if (!n) return [];
      let r = this._doc.querySelectorAll(xw(n));
      return r ? Array.from(r).filter((i) => kw(i)) : [];
    }
    updateTag(n, r) {
      r ??= Ow(n);
      let i = this.getTag(r);
      return i ? (Rw(n, i), i) : this._getOrCreateElement(n, !0);
    }
    removeTag(n) {
      this.removeTagElement(this.getTag(n));
    }
    removeTagElement(n) {
      n && this._dom.remove(n);
    }
    _getOrCreateElement(n, r = !1) {
      if (!r) {
        let s = Ow(n),
          a = this.getTags(s).filter((c) => Nk(n, c))[0];
        if (a !== void 0) return a;
      }
      let i = this._dom.createElement(`meta`);
      return (Rw(n, i), this._doc.getElementsByTagName(`head`)[0].appendChild(i), i);
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
function xw(t) {
  return `meta[${t}]`;
}
function Rw(t, e) {
  Object.keys(t).forEach((n) => e.setAttribute(Pw(n), t[n]));
}
function Ow(t) {
  let e = t.name ? `name` : `property`;
  return `${e}=${Ak(String(t[e]))}`;
}
function Ak(t) {
  return `"${t.replace(/\\/g, `\\\\`).replace(/"/g, `\\"`)}"`;
}
function Nk(t, e) {
  return Object.keys(t).every((n) => e.getAttribute(Pw(n)) === t[n]);
}
function Pw(t) {
  return xk[t] || t;
}
function kw(t) {
  return t?.nodeName.toLowerCase() === `meta`;
}
var xk = { httpEquiv: `http-equiv` };
var Fw = (() => {
  class t {
    _doc;
    constructor(n) {
      this._doc = n;
    }
    getTitle() {
      return this._doc.title;
    }
    setTitle(n) {
      this._doc.title = n || ``;
    }
    static ɵfac = function (r) {
      return new (r || t)(j(ie));
    };
    static ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
  }
  return t;
})();
var G = `primary`;
var cc = Symbol(`RouteTitle`);
var Gg = class {
  params;
  constructor(e) {
    this.params = e || {};
  }
  has(e) {
    return Object.prototype.hasOwnProperty.call(this.params, e);
  }
  get(e) {
    if (this.has(e)) {
      let n = this.params[e];
      return Array.isArray(n) ? n[0] : n;
    }
    return null;
  }
  getAll(e) {
    if (this.has(e)) {
      let n = this.params[e];
      return Array.isArray(n) ? n : [n];
    }
    return [];
  }
  get keys() {
    return Object.keys(this.params);
  }
};
function Gi(t) {
  return new Gg(t);
}
function Ug(t, e, n) {
  for (let r = 0; r < t.length; r++) {
    let i = t[r],
      o = e[r];
    if (i[0] === `:`) n[i.substring(1)] = o;
    else if (i !== o.path) return !1;
  }
  return !0;
}
function zw(t, e, n) {
  let r = n.path.split(`/`),
    i = r.indexOf(`**`);
  if (i === -1) {
    if (r.length > t.length || (n.pathMatch === `full` && (e.hasChildren() || r.length < t.length)))
      return null;
    let c = {},
      u = t.slice(0, r.length);
    return Ug(r, u, c) ? { consumed: u, posParams: c } : null;
  }
  if (i !== r.lastIndexOf(`**`)) return null;
  let o = r.slice(0, i),
    s = r.slice(i + 1);
  if (
    o.length + s.length > t.length ||
    (n.pathMatch === `full` && e.hasChildren() && n.path !== `**`)
  )
    return null;
  let a = {};
  return !Ug(o, t.slice(0, o.length), a) || !Ug(s, t.slice(t.length - s.length), a)
    ? null
    : { consumed: t, posParams: a };
}
function ad(t) {
  return new Promise((e, n) => {
    t.pipe(Un()).subscribe({ next: (r) => e(r), error: (r) => n(r) });
  });
}
function Ok(t, e) {
  if (t.length !== e.length) return !1;
  for (let n = 0; n < t.length; ++n) if (!xn(t[n], e[n])) return !1;
  return !0;
}
function xn(t, e) {
  let n = t ? zg(t) : void 0,
    r = e ? zg(e) : void 0;
  if (!n || !r || n.length != r.length) return !1;
  let i;
  for (let o = 0; o < n.length; o++) if (((i = n[o]), !Ww(t[i], e[i]))) return !1;
  return !0;
}
function zg(t) {
  return [...Object.keys(t), ...Object.getOwnPropertySymbols(t)];
}
function Ww(t, e) {
  if (Array.isArray(t) && Array.isArray(e)) {
    if (t.length !== e.length) return !1;
    let n = [...t].sort(),
      r = [...e].sort();
    return n.every((i, o) => r[o] === i);
  } else return t === e;
}
function kk(t) {
  return t.length > 0 ? t[t.length - 1] : null;
}
function qi(t) {
  return Jc(t) ? t : er(t) ? _e(Promise.resolve(t)) : z(t);
}
function qw(t) {
  return Jc(t) ? ad(t) : Promise.resolve(t);
}
var Pk = { exact: Kw, subset: Qw };
var Yw = { exact: Fk, subset: Lk, ignored: () => !0 };
var Zw = { paths: `exact`, fragment: `ignored`, matrixParams: `ignored`, queryParams: `exact` };
var Wg = { paths: `subset`, fragment: `ignored`, matrixParams: `ignored`, queryParams: `subset` };
function Lw(t, e, n) {
  return (
    Pk[n.paths](t.root, e.root, n.matrixParams) &&
    Yw[n.queryParams](t.queryParams, e.queryParams) &&
    !(n.fragment === `exact` && t.fragment !== e.fragment)
  );
}
function Fk(t, e) {
  return xn(t, e);
}
function Kw(t, e, n) {
  if (
    !$i(t.segments, e.segments) ||
    !id(t.segments, e.segments, n) ||
    t.numberOfChildren !== e.numberOfChildren
  )
    return !1;
  for (let r in e.children) if (!t.children[r] || !Kw(t.children[r], e.children[r], n)) return !1;
  return !0;
}
function Lk(t, e) {
  return (
    Object.keys(e).length <= Object.keys(t).length && Object.keys(e).every((n) => Ww(t[n], e[n]))
  );
}
function Qw(t, e, n) {
  return Xw(t, e, e.segments, n);
}
function Xw(t, e, n, r) {
  if (t.segments.length > n.length) {
    let i = t.segments.slice(0, n.length);
    return !(!$i(i, n) || e.hasChildren() || !id(i, n, r));
  } else if (t.segments.length === n.length) {
    if (!$i(t.segments, n) || !id(t.segments, n, r)) return !1;
    for (let i in e.children) if (!t.children[i] || !Qw(t.children[i], e.children[i], r)) return !1;
    return !0;
  } else {
    let i = n.slice(0, t.segments.length),
      o = n.slice(t.segments.length);
    return !$i(t.segments, i) || !id(t.segments, i, r) || !t.children[G]
      ? !1
      : Xw(t.children[G], e, o, r);
  }
}
function id(t, e, n) {
  return e.every((r, i) => Yw[n](t[i].parameters, r.parameters));
}
var kt = class {
  root;
  queryParams;
  fragment;
  _queryParamMap;
  constructor(e = new Q([], {}), n = {}, r = null) {
    ((this.root = e), (this.queryParams = n), (this.fragment = r));
  }
  get queryParamMap() {
    return ((this._queryParamMap ??= Gi(this.queryParams)), this._queryParamMap);
  }
  toString() {
    return Uk.serialize(this);
  }
};
var Q = class {
  segments;
  children;
  parent = null;
  constructor(e, n) {
    ((this.segments = e), (this.children = n), Object.values(n).forEach((r) => (r.parent = this)));
  }
  hasChildren() {
    return this.numberOfChildren > 0;
  }
  get numberOfChildren() {
    return Object.keys(this.children).length;
  }
  toString() {
    return od(this);
  }
};
var Fr = class {
  path;
  parameters;
  _parameterMap;
  constructor(e, n) {
    ((this.path = e), (this.parameters = n));
  }
  get parameterMap() {
    return ((this._parameterMap ??= Gi(this.parameters)), this._parameterMap);
  }
  toString() {
    return eI(this);
  }
};
function Vk(t, e) {
  return $i(t, e) && t.every((n, r) => xn(n.parameters, e[r].parameters));
}
function $i(t, e) {
  return t.length !== e.length ? !1 : t.every((n, r) => n.path === e[r].path);
}
function jk(t, e) {
  let n = [];
  return (
    Object.entries(t.children).forEach(([r, i]) => {
      r === G && (n = n.concat(e(i, r)));
    }),
    Object.entries(t.children).forEach(([r, i]) => {
      r !== G && (n = n.concat(e(i, r)));
    }),
    n
  );
}
var us = (() => {
  class t {
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: () => new Lr() });
  }
  return t;
})();
var Lr = class {
  parse(e) {
    let n = new Yg(e);
    return new kt(n.parseRootSegment(), n.parseQueryParams(), n.parseFragment());
  }
  serialize(e) {
    let n = `/${Za(e.root, !0)}`;
    if (n.startsWith(`//`)) throw new I(4019, !1);
    return `${n}${$k(e.queryParams)}${typeof e.fragment == `string` ? `#${Bk(e.fragment)}` : ``}`;
  }
};
var Uk = new Lr();
function od(t) {
  return t.segments.map((e) => eI(e)).join(`/`);
}
function Za(t, e) {
  if (!t.hasChildren()) return od(t);
  if (e) {
    let n = t.children[G] ? Za(t.children[G], !1) : ``,
      r = [];
    return (
      Object.entries(t.children).forEach(([i, o]) => {
        i !== G && r.push(`${i}:${Za(o, !1)}`);
      }),
      r.length > 0 ? `${n}(${r.join(`//`)})` : n
    );
  } else {
    let n = jk(t, (r, i) => (i === G ? [Za(t.children[G], !1)] : [`${i}:${Za(r, !1)}`]));
    return Object.keys(t.children).length === 1 && t.children[G] != null
      ? `${od(t)}/${n[0]}`
      : `${od(t)}/(${n.join(`//`)})`;
  }
}
function Jw(t) {
  return encodeURIComponent(t)
    .replace(/%40/g, `@`)
    .replace(/%3A/gi, `:`)
    .replace(/%24/g, `$`)
    .replace(/%2C/gi, `,`);
}
function nd(t) {
  return Jw(t).replace(/%3B/gi, `;`);
}
function Bk(t) {
  return encodeURI(t);
}
function qg(t) {
  return Jw(t).replace(/\(/g, `%28`).replace(/\)/g, `%29`).replace(/%26/gi, `&`);
}
function sd(t) {
  return decodeURIComponent(t);
}
function Vw(t) {
  return sd(t.replace(/\+/g, `%20`));
}
function eI(t) {
  return `${qg(t.path)}${Hk(t.parameters)}`;
}
function Hk(t) {
  return Object.entries(t)
    .map(([e, n]) => `;${qg(e)}=${qg(n)}`)
    .join(``);
}
function $k(t) {
  let e = Object.entries(t)
    .map(([n, r]) =>
      Array.isArray(r) ? r.map((i) => `${nd(n)}=${nd(i)}`).join(`&`) : `${nd(n)}=${nd(r)}`,
    )
    .filter((n) => n);
  return e.length ? `?${e.join(`&`)}` : ``;
}
var Gk = /^[^\/()?;#]+/;
function Bg(t) {
  let e = t.match(Gk);
  return e ? e[0] : ``;
}
var zk = /^[^\/()?;=#]+/;
function Wk(t) {
  let e = t.match(zk);
  return e ? e[0] : ``;
}
var qk = /^[^=?&#]+/;
function Yk(t) {
  let e = t.match(qk);
  return e ? e[0] : ``;
}
var Zk = /^[^&#]+/;
function Kk(t) {
  let e = t.match(Zk);
  return e ? e[0] : ``;
}
var Yg = class {
  url;
  remaining;
  constructor(e) {
    ((this.url = e), (this.remaining = e));
  }
  parseRootSegment() {
    for (; this.consumeOptional(`/`););
    return this.remaining === `` || this.peekStartsWith(`?`) || this.peekStartsWith(`#`)
      ? new Q([], {})
      : new Q([], this.parseChildren());
  }
  parseQueryParams() {
    let e = {};
    if (this.consumeOptional(`?`))
      do this.parseQueryParam(e);
      while (this.consumeOptional(`&`));
    return e;
  }
  parseFragment() {
    return this.consumeOptional(`#`) ? decodeURIComponent(this.remaining) : null;
  }
  parseChildren(e = 0) {
    if (e > 50) throw new I(4010, !1);
    if (this.remaining === ``) return {};
    this.consumeOptional(`/`);
    let n = [];
    for (
      this.peekStartsWith(`(`) || n.push(this.parseSegment());
      this.peekStartsWith(`/`) && !this.peekStartsWith(`//`) && !this.peekStartsWith(`/(`);
    )
      (this.capture(`/`), n.push(this.parseSegment()));
    let r = {};
    this.peekStartsWith(`/(`) && (this.capture(`/`), (r = this.parseParens(!0, e)));
    let i = {};
    return (
      this.peekStartsWith(`(`) && (i = this.parseParens(!1, e)),
      (n.length > 0 || Object.keys(r).length > 0) && (i[G] = new Q(n, r)),
      i
    );
  }
  parseSegment() {
    let e = Bg(this.remaining);
    if (e === `` && this.peekStartsWith(`;`)) throw new I(4009, !1);
    return (this.capture(e), new Fr(sd(e), this.parseMatrixParams()));
  }
  parseMatrixParams() {
    let e = {};
    for (; this.consumeOptional(`;`);) this.parseParam(e);
    return e;
  }
  parseParam(e) {
    let n = Wk(this.remaining);
    if (!n) return;
    this.capture(n);
    let r = ``;
    if (this.consumeOptional(`=`)) {
      let i = Bg(this.remaining);
      i && ((r = i), this.capture(r));
    }
    e[sd(n)] = sd(r);
  }
  parseQueryParam(e) {
    let n = Yk(this.remaining);
    if (!n) return;
    this.capture(n);
    let r = ``;
    if (this.consumeOptional(`=`)) {
      let s = Kk(this.remaining);
      s && ((r = s), this.capture(r));
    }
    let i = Vw(n),
      o = Vw(r);
    if (Object.hasOwn(e, i)) {
      let s = e[i];
      (Array.isArray(s) || ((s = [s]), (e[i] = s)), s.push(o));
    } else e[i] = o;
  }
  parseParens(e, n) {
    let r = Object.create(null);
    for (this.capture(`(`); !this.consumeOptional(`)`) && this.remaining.length > 0;) {
      let i = Bg(this.remaining),
        o = this.remaining[i.length];
      if (o !== `/` && o !== `)` && o !== `;`) throw new I(4010, !1);
      let s;
      i.indexOf(`:`) > -1
        ? ((s = i.slice(0, i.indexOf(`:`))), this.capture(s), this.capture(`:`))
        : e && (s = G);
      let a = this.parseChildren(n + 1);
      ((r[s ?? G] = Object.keys(a).length === 1 && a[G] ? a[G] : new Q([], a)),
        this.consumeOptional(`//`));
    }
    return r;
  }
  peekStartsWith(e) {
    return this.remaining.startsWith(e);
  }
  consumeOptional(e) {
    return this.peekStartsWith(e)
      ? ((this.remaining = this.remaining.substring(e.length)), !0)
      : !1;
  }
  capture(e) {
    if (!this.consumeOptional(e)) throw new I(4011, !1);
  }
};
function tI(t) {
  return t.segments.length > 0 ? new Q([], { [G]: t }) : t;
}
function nI(t) {
  let e = Object.create(null);
  for (let [r, i] of Object.entries(t.children)) {
    let o = nI(i);
    if (r === G && o.segments.length === 0 && o.hasChildren())
      for (let [s, a] of Object.entries(o.children)) e[s] = a;
    else (o.segments.length > 0 || o.hasChildren()) && (e[r] = o);
  }
  return Qk(new Q(t.segments, e));
}
function Qk(t) {
  if (t.numberOfChildren === 1 && t.children[G]) {
    let e = t.children[G];
    return new Q(t.segments.concat(e.segments), e.children);
  }
  return t;
}
function Vr(t) {
  return t instanceof kt;
}
function rI(t, e, n = null, r = null, i = new Lr()) {
  return oI(iI(t), e, n, r, i);
}
function iI(t) {
  let e;
  function n(o) {
    let s = {};
    for (let c of o.children) {
      let u = n(c);
      s[c.outlet] = u;
    }
    let a = new Q(o.url, s);
    return (o === t && (e = a), a);
  }
  let i = tI(n(t.root));
  return e ?? i;
}
function oI(t, e, n, r, i) {
  let o = t;
  for (; o.parent;) o = o.parent;
  if (e.length === 0) return Hg(o, o, o, n, r, i);
  let s = Xk(e);
  if (s.toRoot()) return Hg(o, o, new Q([], {}), n, r, i);
  let a = Jk(s, o, t),
    c = a.processChildren
      ? Qa(a.segmentGroup, a.index, s.commands)
      : aI(a.segmentGroup, a.index, s.commands);
  return Hg(o, a.segmentGroup, c, n, r, i);
}
function cd(t) {
  return typeof t == `object` && t != null && !t.outlets && !t.segmentPath;
}
function ec(t) {
  return typeof t == `object` && t != null && t.outlets;
}
function jw(t, e, n) {
  t ||= `ɵ`;
  let r = new kt();
  return ((r.queryParams = { [t]: e }), n.parse(n.serialize(r)).queryParams[t]);
}
function Hg(t, e, n, r, i, o) {
  let s = {};
  for (let [u, l] of Object.entries(r ?? {}))
    s[u] = Array.isArray(l) ? l.map((d) => jw(u, d, o)) : jw(u, l, o);
  let a;
  t === e ? (a = n) : (a = sI(t, e, n));
  return new kt(tI(nI(a)), s, i);
}
function sI(t, e, n) {
  let r = Object.create(null);
  return (
    Object.entries(t.children).forEach(([i, o]) => {
      o === e ? (r[i] = n) : (r[i] = sI(o, e, n));
    }),
    new Q(t.segments, r)
  );
}
var ud = class {
  isAbsolute;
  numberOfDoubleDots;
  commands;
  constructor(e, n, r) {
    if (
      ((this.isAbsolute = e),
      (this.numberOfDoubleDots = n),
      (this.commands = r),
      e && r.length > 0 && cd(r[0]))
    )
      throw new I(4003, !1);
    let i = r.find(ec);
    if (i && i !== kk(r)) throw new I(4004, !1);
  }
  toRoot() {
    return this.isAbsolute && this.commands.length === 1 && this.commands[0] == `/`;
  }
};
function Xk(t) {
  if (typeof t[0] == `string` && t.length === 1 && t[0] === `/`) return new ud(!0, 0, t);
  let e = 0,
    n = !1,
    r = t.reduce((i, o, s) => {
      if (typeof o == `object` && o != null) {
        if (o.outlets) {
          let a = {};
          return (
            Object.entries(o.outlets).forEach(([c, u]) => {
              a[c] = typeof u == `string` ? u.split(`/`) : u;
            }),
            [...i, { outlets: a }]
          );
        }
        if (o.segmentPath) return [...i, o.segmentPath];
      }
      return typeof o != `string`
        ? [...i, o]
        : s === 0
          ? (o.split(`/`).forEach((a, c) => {
              (c == 0 && a === `.`) ||
                (c == 0 && a === `` ? (n = !0) : a === `..` ? e++ : a != `` && i.push(a));
            }),
            i)
          : [...i, o];
    }, []);
  return new ud(n, e, r);
}
var ns = class {
  segmentGroup;
  processChildren;
  index;
  constructor(e, n, r) {
    ((this.segmentGroup = e), (this.processChildren = n), (this.index = r));
  }
};
function Jk(t, e, n) {
  if (t.isAbsolute) return new ns(e, !0, 0);
  if (!n) return new ns(e, !1, NaN);
  if (n.parent === null) return new ns(n, !0, 0);
  let r = cd(t.commands[0]) ? 0 : 1;
  return eP(n, n.segments.length - 1 + r, t.numberOfDoubleDots);
}
function eP(t, e, n) {
  let r = t,
    i = e,
    o = n;
  for (; o > i;) {
    if (((o -= i), (r = r.parent), !r)) throw new I(4005, !1);
    i = r.segments.length;
  }
  return new ns(r, !1, i - o);
}
function tP(t) {
  return ec(t[0]) ? t[0].outlets : { [G]: t };
}
function aI(t, e, n) {
  if (((t ??= new Q([], {})), t.segments.length === 0 && t.hasChildren())) return Qa(t, e, n);
  let r = nP(t, e, n),
    i = n.slice(r.commandIndex);
  if (r.match && r.pathIndex < t.segments.length) {
    let o = new Q(t.segments.slice(0, r.pathIndex), {});
    return ((o.children[G] = new Q(t.segments.slice(r.pathIndex), t.children)), Qa(o, 0, i));
  } else
    return r.match && i.length === 0
      ? new Q(t.segments, {})
      : r.match && !t.hasChildren()
        ? Zg(t, e, n)
        : r.match
          ? Qa(t, 0, i)
          : Zg(t, e, n);
}
function Qa(t, e, n) {
  if (n.length === 0) return new Q(t.segments, {});
  {
    let r = tP(n),
      i = Object.create(null);
    if (
      Object.keys(r).some((o) => o !== G) &&
      t.children[G] &&
      t.numberOfChildren === 1 &&
      t.children[G].segments.length === 0
    ) {
      let o = Qa(t.children[G], e, n);
      return new Q(t.segments, o.children);
    }
    return (
      Object.entries(r).forEach(([o, s]) => {
        (typeof s == `string` && (s = [s]), s !== null && (i[o] = aI(t.children[o], e, s)));
      }),
      Object.entries(t.children).forEach(([o, s]) => {
        r[o] === void 0 && (i[o] = s);
      }),
      new Q(t.segments, i)
    );
  }
}
function nP(t, e, n) {
  let r = 0,
    i = e,
    o = { match: !1, pathIndex: 0, commandIndex: 0 };
  for (; i < t.segments.length;) {
    if (r >= n.length) return o;
    let s = t.segments[i],
      a = n[r];
    if (ec(a)) break;
    let c = `${a}`,
      u = r < n.length - 1 ? n[r + 1] : null;
    if (i > 0 && c === void 0) break;
    if (c && u && typeof u == `object` && u.outlets === void 0) {
      if (!Bw(c, u, s)) return o;
      r += 2;
    } else {
      if (!Bw(c, {}, s)) return o;
      r++;
    }
    i++;
  }
  return { match: !0, pathIndex: i, commandIndex: r };
}
function Zg(t, e, n) {
  let r = t.segments.slice(0, e),
    i = 0;
  for (; i < n.length;) {
    let o = n[i];
    if (ec(o)) return new Q(r, rP(o.outlets));
    if (i === 0 && cd(n[0])) {
      let c = t.segments[e];
      (r.push(new Fr(c.path, Uw(n[0]))), i++);
      continue;
    }
    let s = ec(o) ? o.outlets[G] : `${o}`,
      a = i < n.length - 1 ? n[i + 1] : null;
    s && a && cd(a) ? (r.push(new Fr(s, Uw(a))), (i += 2)) : (r.push(new Fr(s, {})), i++);
  }
  return new Q(r, {});
}
function rP(t) {
  let e = {};
  return (
    Object.entries(t).forEach(([n, r]) => {
      (typeof r == `string` && (r = [r]), r !== null && (e[n] = Zg(new Q([], {}), 0, r)));
    }),
    e
  );
}
function Uw(t) {
  let e = {};
  return (Object.entries(t).forEach(([n, r]) => (e[n] = `${r}`)), e);
}
function Bw(t, e, n) {
  return t == n.path && xn(e, n.parameters);
}
var Xa = `imperative`;
var Ye = (function (t) {
  return (
    (t[(t.NavigationStart = 0)] = `NavigationStart`),
    (t[(t.NavigationEnd = 1)] = `NavigationEnd`),
    (t[(t.NavigationCancel = 2)] = `NavigationCancel`),
    (t[(t.NavigationError = 3)] = `NavigationError`),
    (t[(t.RoutesRecognized = 4)] = `RoutesRecognized`),
    (t[(t.ResolveStart = 5)] = `ResolveStart`),
    (t[(t.ResolveEnd = 6)] = `ResolveEnd`),
    (t[(t.GuardsCheckStart = 7)] = `GuardsCheckStart`),
    (t[(t.GuardsCheckEnd = 8)] = `GuardsCheckEnd`),
    (t[(t.RouteConfigLoadStart = 9)] = `RouteConfigLoadStart`),
    (t[(t.RouteConfigLoadEnd = 10)] = `RouteConfigLoadEnd`),
    (t[(t.ChildActivationStart = 11)] = `ChildActivationStart`),
    (t[(t.ChildActivationEnd = 12)] = `ChildActivationEnd`),
    (t[(t.ActivationStart = 13)] = `ActivationStart`),
    (t[(t.ActivationEnd = 14)] = `ActivationEnd`),
    (t[(t.Scroll = 15)] = `Scroll`),
    (t[(t.NavigationSkipped = 16)] = `NavigationSkipped`),
    t
  );
})(Ye || {});
var Pt = class {
  id;
  url;
  constructor(e, n) {
    ((this.id = e), (this.url = n));
  }
};
var zi = class extends Pt {
  type = Ye.NavigationStart;
  navigationTrigger;
  restoredState;
  constructor(e, n, r = `imperative`, i = null) {
    (super(e, n), (this.navigationTrigger = r), (this.restoredState = i));
  }
  toString() {
    return `NavigationStart(id: ${this.id}, url: '${this.url}')`;
  }
};
var Rn = class extends Pt {
  urlAfterRedirects;
  type = Ye.NavigationEnd;
  constructor(e, n, r) {
    (super(e, n), (this.urlAfterRedirects = r));
  }
  toString() {
    return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
  }
};
var at = (function (t) {
  return (
    (t[(t.Redirect = 0)] = `Redirect`),
    (t[(t.SupersededByNewNavigation = 1)] = `SupersededByNewNavigation`),
    (t[(t.NoDataFromResolver = 2)] = `NoDataFromResolver`),
    (t[(t.GuardRejected = 3)] = `GuardRejected`),
    (t[(t.Aborted = 4)] = `Aborted`),
    t
  );
})(at || {});
var tc = (function (t) {
  return (
    (t[(t.IgnoredSameUrlNavigation = 0)] = `IgnoredSameUrlNavigation`),
    (t[(t.IgnoredByUrlHandlingStrategy = 1)] = `IgnoredByUrlHandlingStrategy`),
    t
  );
})(tc || {});
var Xt = class extends Pt {
  reason;
  code;
  type = Ye.NavigationCancel;
  constructor(e, n, r, i) {
    (super(e, n), (this.reason = r), (this.code = i));
  }
  toString() {
    return `NavigationCancel(id: ${this.id}, url: '${this.url}')`;
  }
};
function cI(t) {
  return t instanceof Xt && (t.code === at.Redirect || t.code === at.SupersededByNewNavigation);
}
var cr = class extends Pt {
  reason;
  code;
  type = Ye.NavigationSkipped;
  constructor(e, n, r, i) {
    (super(e, n), (this.reason = r), (this.code = i));
  }
};
var Wi = class extends Pt {
  error;
  target;
  type = Ye.NavigationError;
  constructor(e, n, r, i) {
    (super(e, n), (this.error = r), (this.target = i));
  }
  toString() {
    return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
  }
};
var nc = class extends Pt {
  urlAfterRedirects;
  state;
  type = Ye.RoutesRecognized;
  constructor(e, n, r, i) {
    (super(e, n), (this.urlAfterRedirects = r), (this.state = i));
  }
  toString() {
    return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
};
var ld = class extends Pt {
  urlAfterRedirects;
  state;
  type = Ye.GuardsCheckStart;
  constructor(e, n, r, i) {
    (super(e, n), (this.urlAfterRedirects = r), (this.state = i));
  }
  toString() {
    return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
};
var dd = class extends Pt {
  urlAfterRedirects;
  state;
  shouldActivate;
  type = Ye.GuardsCheckEnd;
  constructor(e, n, r, i, o) {
    (super(e, n), (this.urlAfterRedirects = r), (this.state = i), (this.shouldActivate = o));
  }
  toString() {
    return `GuardsCheckEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state}, shouldActivate: ${this.shouldActivate})`;
  }
};
var fd = class extends Pt {
  urlAfterRedirects;
  state;
  type = Ye.ResolveStart;
  constructor(e, n, r, i) {
    (super(e, n), (this.urlAfterRedirects = r), (this.state = i));
  }
  toString() {
    return `ResolveStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
};
var hd = class extends Pt {
  urlAfterRedirects;
  state;
  type = Ye.ResolveEnd;
  constructor(e, n, r, i) {
    (super(e, n), (this.urlAfterRedirects = r), (this.state = i));
  }
  toString() {
    return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
};
var pd = class {
  route;
  type = Ye.RouteConfigLoadStart;
  constructor(e) {
    this.route = e;
  }
  toString() {
    return `RouteConfigLoadStart(path: ${this.route.path})`;
  }
};
var gd = class {
  route;
  type = Ye.RouteConfigLoadEnd;
  constructor(e) {
    this.route = e;
  }
  toString() {
    return `RouteConfigLoadEnd(path: ${this.route.path})`;
  }
};
var md = class {
  snapshot;
  type = Ye.ChildActivationStart;
  constructor(e) {
    this.snapshot = e;
  }
  toString() {
    return `ChildActivationStart(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ``}')`;
  }
};
var vd = class {
  snapshot;
  type = Ye.ChildActivationEnd;
  constructor(e) {
    this.snapshot = e;
  }
  toString() {
    return `ChildActivationEnd(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ``}')`;
  }
};
var yd = class {
  snapshot;
  type = Ye.ActivationStart;
  constructor(e) {
    this.snapshot = e;
  }
  toString() {
    return `ActivationStart(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ``}')`;
  }
};
var _d = class {
  snapshot;
  type = Ye.ActivationEnd;
  constructor(e) {
    this.snapshot = e;
  }
  toString() {
    return `ActivationEnd(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ``}')`;
  }
};
var is = class {};
var rc = class {};
var os = class {
  url;
  navigationBehaviorOptions;
  constructor(e, n) {
    ((this.url = e), (this.navigationBehaviorOptions = n));
  }
};
function iP(t) {
  return !(t instanceof is) && !(t instanceof os) && !(t instanceof rc);
}
var Dd = class {
  rootInjector;
  outlet = null;
  route = null;
  children;
  attachRef = null;
  get injector() {
    return this.route?.snapshot._environmentInjector ?? this.rootInjector;
  }
  constructor(e) {
    ((this.rootInjector = e), (this.children = new ls(this.rootInjector)));
  }
};
var ls = (() => {
  class t {
    rootInjector;
    contexts = new Map();
    constructor(n) {
      this.rootInjector = n;
    }
    onChildOutletCreated(n, r) {
      let i = this.getOrCreateContext(n);
      ((i.outlet = r), this.contexts.set(n, i));
    }
    onChildOutletDestroyed(n) {
      let r = this.getContext(n);
      r && ((r.outlet = null), (r.attachRef = null));
    }
    onOutletDeactivated() {
      let n = this.contexts;
      return ((this.contexts = new Map()), n);
    }
    onOutletReAttached(n) {
      this.contexts = n;
    }
    getOrCreateContext(n) {
      let r = this.getContext(n);
      return (r || ((r = new Dd(this.rootInjector)), this.contexts.set(n, r)), r);
    }
    getContext(n) {
      return this.contexts.get(n) || null;
    }
    static ɵfac = function (r) {
      return new (r || t)(j(ve));
    };
    static ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
  }
  return t;
})();
var Ed = class {
  _root;
  constructor(e) {
    this._root = e;
  }
  get root() {
    return this._root.value;
  }
  parent(e) {
    let n = this.pathFromRoot(e);
    return n.length > 1 ? n[n.length - 2] : null;
  }
  children(e) {
    let n = Kg(e, this._root);
    return n ? n.children.map((r) => r.value) : [];
  }
  firstChild(e) {
    let n = Kg(e, this._root);
    return n && n.children.length > 0 ? n.children[0].value : null;
  }
  siblings(e) {
    let n = Qg(e, this._root);
    return n.length < 2 ? [] : n[n.length - 2].children.map((i) => i.value).filter((i) => i !== e);
  }
  pathFromRoot(e) {
    return Qg(e, this._root).map((n) => n.value);
  }
};
function Kg(t, e) {
  if (t === e.value) return e;
  for (let n of e.children) {
    let r = Kg(t, n);
    if (r) return r;
  }
  return null;
}
function Qg(t, e) {
  if (t === e.value) return [e];
  for (let n of e.children) {
    let r = Qg(t, n);
    if (r.length) return (r.unshift(e), r);
  }
  return [];
}
var Ot = class {
  value;
  children;
  constructor(e, n) {
    ((this.value = e), (this.children = n));
  }
  toString() {
    return `TreeNode(${this.value})`;
  }
};
function ts(t) {
  let e = {};
  return (t && t.children.forEach((n) => (e[n.value.outlet] = n)), e);
}
var ic = class extends Ed {
  snapshot;
  constructor(e, n) {
    (super(e), (this.snapshot = n), sm(this, e));
  }
  toString() {
    return this.snapshot.toString();
  }
};
function uI(t, e) {
  let n = oP(t, e),
    r = new Ze([new Fr(``, {})]),
    i = new Ze({}),
    o = new Ze({}),
    c = new ur(r, i, new Ze({}), new Ze(``), o, G, t, n.root);
  return ((c.snapshot = n.root), new ic(new Ot(c, []), n));
}
function oP(t, e) {
  return new oc(``, new Ot(new ss([], {}, {}, ``, {}, G, t, null, {}, e), []));
}
var ur = class {
  urlSubject;
  paramsSubject;
  queryParamsSubject;
  fragmentSubject;
  dataSubject;
  outlet;
  component;
  snapshot;
  _futureSnapshot;
  _routerState;
  _paramMap;
  _queryParamMap;
  title;
  url;
  params;
  queryParams;
  fragment;
  data;
  _localInjector;
  constructor(e, n, r, i, o, s, a, c) {
    ((this.urlSubject = e),
      (this.paramsSubject = n),
      (this.queryParamsSubject = r),
      (this.fragmentSubject = i),
      (this.dataSubject = o),
      (this.outlet = s),
      (this.component = a),
      (this._futureSnapshot = c),
      (this.title = this.dataSubject?.pipe(Y((u) => u[cc])) ?? z(void 0)),
      (this.url = e),
      (this.params = n),
      (this.queryParams = r),
      (this.fragment = i),
      (this.data = o));
  }
  get routeConfig() {
    return this._futureSnapshot.routeConfig;
  }
  get root() {
    return this._routerState.root;
  }
  get parent() {
    return this._routerState.parent(this);
  }
  get firstChild() {
    return this._routerState.firstChild(this);
  }
  get children() {
    return this._routerState.children(this);
  }
  get pathFromRoot() {
    return this._routerState.pathFromRoot(this);
  }
  get paramMap() {
    return ((this._paramMap ??= this.params.pipe(Y((e) => Gi(e)))), this._paramMap);
  }
  get queryParamMap() {
    return ((this._queryParamMap ??= this.queryParams.pipe(Y((e) => Gi(e)))), this._queryParamMap);
  }
  toString() {
    return this.snapshot ? this.snapshot.toString() : `Future(${this._futureSnapshot})`;
  }
};
var sP = `always`;
function om(t, e, n) {
  let r,
    { routeConfig: i } = t;
  return (
    e !== null &&
    (n === `always` || i?.path === `` || (!e.component && !e.routeConfig?.loadComponent))
      ? (r = {
          params: l(l({}, e.params), t.params),
          data: l(l({}, e.data), t.data),
          resolve: l(l(l(l({}, t.data), e.data), i?.data), t._resolvedData),
        })
      : (r = {
          params: l({}, t.params),
          data: l({}, t.data),
          resolve: l(l({}, t.data), t._resolvedData ?? {}),
        }),
    i && dI(i) && (r.resolve[cc] = i.title),
    r
  );
}
var ss = class {
  url;
  params;
  queryParams;
  fragment;
  data;
  outlet;
  component;
  routeConfig;
  _resolve;
  _resolvedData;
  _routerState;
  _paramMap;
  _queryParamMap;
  _environmentInjector;
  get title() {
    return this.data?.[cc];
  }
  constructor(e, n, r, i, o, s, a, c, u, l) {
    ((this.url = e),
      (this.params = n),
      (this.queryParams = r),
      (this.fragment = i),
      (this.data = o),
      (this.outlet = s),
      (this.component = a),
      (this.routeConfig = c),
      (this._resolve = u),
      (this._environmentInjector = l));
  }
  get root() {
    return this._routerState.root;
  }
  get parent() {
    return this._routerState.parent(this);
  }
  get firstChild() {
    return this._routerState.firstChild(this);
  }
  get children() {
    return this._routerState.children(this);
  }
  get pathFromRoot() {
    return this._routerState.pathFromRoot(this);
  }
  get paramMap() {
    return ((this._paramMap ??= Gi(this.params)), this._paramMap);
  }
  get queryParamMap() {
    return ((this._queryParamMap ??= Gi(this.queryParams)), this._queryParamMap);
  }
  toString() {
    return `Route(url:'${this.url.map((r) => r.toString()).join(`/`)}', path:'${this.routeConfig ? this.routeConfig.path : ``}')`;
  }
};
var oc = class extends Ed {
  url;
  constructor(e, n) {
    (super(n), (this.url = e), sm(this, n));
  }
  toString() {
    return lI(this._root);
  }
};
function sm(t, e) {
  ((e.value._routerState = t), e.children.forEach((n) => sm(t, n)));
}
function lI(t) {
  let e = t.children.length > 0 ? ` { ${t.children.map(lI).join(`, `)} } ` : ``;
  return `${t.value}${e}`;
}
function $g(t) {
  if (t.snapshot) {
    let e = t.snapshot,
      n = t._futureSnapshot;
    ((t.snapshot = n),
      xn(e.queryParams, n.queryParams) || t.queryParamsSubject.next(n.queryParams),
      e.fragment !== n.fragment && t.fragmentSubject.next(n.fragment),
      xn(e.params, n.params) || t.paramsSubject.next(n.params),
      Ok(e.url, n.url) || t.urlSubject.next(n.url),
      xn(e.data, n.data) || t.dataSubject.next(n.data));
  } else ((t.snapshot = t._futureSnapshot), t.dataSubject.next(t._futureSnapshot.data));
}
function Xg(t, e) {
  let n = xn(t.params, e.params) && Vk(t.url, e.url),
    r = !t.parent != !e.parent;
  return n && !r && (!t.parent || Xg(t.parent, e.parent));
}
function dI(t) {
  return typeof t.title == `string` || t.title === null;
}
var fI = new E(``);
var am = (() => {
  class t {
    activated = null;
    get activatedComponentRef() {
      return this.activated;
    }
    _activatedRoute = null;
    name = G;
    activateEvents = new Ue();
    deactivateEvents = new Ue();
    attachEvents = new Ue();
    detachEvents = new Ue();
    routerOutletData = tr();
    parentContexts = v(ls);
    location = v(Li);
    changeDetector = v(nr);
    inputBinder = v(uc, { optional: !0 });
    supportsBindingToComponentInputs = !0;
    ngOnChanges(n) {
      if (n.name) {
        let { firstChange: r, previousValue: i } = n.name;
        if (r) return;
        (this.isTrackedInParentContexts(i) &&
          (this.deactivate(), this.parentContexts.onChildOutletDestroyed(i)),
          this.initializeOutletWithName());
      }
    }
    ngOnDestroy() {
      (this.isTrackedInParentContexts(this.name) &&
        this.parentContexts.onChildOutletDestroyed(this.name),
        this.inputBinder?.unsubscribeFromRouteData(this));
    }
    isTrackedInParentContexts(n) {
      return this.parentContexts.getContext(n)?.outlet === this;
    }
    ngOnInit() {
      this.initializeOutletWithName();
    }
    initializeOutletWithName() {
      if ((this.parentContexts.onChildOutletCreated(this.name, this), this.activated)) return;
      let n = this.parentContexts.getContext(this.name);
      n?.route &&
        (n.attachRef ? this.attach(n.attachRef, n.route) : this.activateWith(n.route, n.injector));
    }
    get isActivated() {
      return !!this.activated;
    }
    get component() {
      if (!this.activated) throw new I(4012, !1);
      return this.activated.instance;
    }
    get activatedRoute() {
      if (!this.activated) throw new I(4012, !1);
      return this._activatedRoute;
    }
    get activatedRouteData() {
      return this._activatedRoute ? this._activatedRoute.snapshot.data : {};
    }
    detach() {
      if (!this.activated) throw new I(4012, !1);
      this.location.detach();
      let n = this.activated;
      return (
        (this.activated = null),
        (this._activatedRoute = null),
        this.detachEvents.emit(n.instance),
        n
      );
    }
    attach(n, r) {
      ((this.activated = n),
        (this._activatedRoute = r),
        this.location.insert(n.hostView),
        this.inputBinder?.bindActivatedRouteToOutletComponent(this),
        this.attachEvents.emit(n.instance));
    }
    deactivate() {
      if (this.activated) {
        let n = this.component;
        (this.activated.destroy(),
          (this.activated = null),
          (this._activatedRoute = null),
          this.deactivateEvents.emit(n));
      }
    }
    activateWith(n, r) {
      if (this.isActivated) throw new I(4013, !1);
      this._activatedRoute = n;
      let i = this.location,
        s = n.snapshot.component,
        a = this.parentContexts.getOrCreateContext(this.name).children,
        c = new Jg(n, a, i.injector, this.routerOutletData);
      ((this.activated = i.createComponent(s, {
        index: i.length,
        injector: c,
        environmentInjector: r,
      })),
        this.changeDetector.markForCheck(),
        this.inputBinder?.bindActivatedRouteToOutletComponent(this),
        this.activateEvents.emit(this.activated.instance));
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵdir = ot({
      type: t,
      selectors: [[`router-outlet`]],
      inputs: { name: `name`, routerOutletData: [1, `routerOutletData`] },
      outputs: {
        activateEvents: `activate`,
        deactivateEvents: `deactivate`,
        attachEvents: `attach`,
        detachEvents: `detach`,
      },
      exportAs: [`outlet`],
      features: [Xn],
    });
  }
  return t;
})();
var Jg = class {
  route;
  childContexts;
  parent;
  outletData;
  constructor(e, n, r, i) {
    ((this.route = e), (this.childContexts = n), (this.parent = r), (this.outletData = i));
  }
  get(e, n) {
    return e === ur
      ? this.route
      : e === ls
        ? this.childContexts
        : e === fI
          ? this.outletData
          : this.parent.get(e, n);
  }
};
var uc = new E(``);
var hI = (() => {
  class t {
    options;
    outletDataSubscriptions = new Map();
    outletSeenKeys = new Map();
    constructor(n) {
      ((this.options = n), (this.options.queryParams ??= !0));
    }
    bindActivatedRouteToOutletComponent(n) {
      (this.unsubscribeFromRouteData(n), this.subscribeToRouteData(n));
    }
    unsubscribeFromRouteData(n) {
      (this.outletDataSubscriptions.get(n)?.unsubscribe(),
        this.outletDataSubscriptions.delete(n),
        this.outletSeenKeys.delete(n));
    }
    subscribeToRouteData(n) {
      let { activatedRoute: r } = n,
        i = ru([this.options.queryParams ? r.queryParams : z({}), r.params, r.data])
          .pipe(
            qe(([o, s, a], c) => ((a = l(l(l({}, o), s), a)), c === 0 ? z(a) : Promise.resolve(a))),
          )
          .subscribe((o) => {
            if (
              !n.isActivated ||
              !n.activatedComponentRef ||
              n.activatedRoute !== r ||
              r.component === null
            ) {
              this.unsubscribeFromRouteData(n);
              return;
            }
            let s = UC(r.component);
            if (!s) {
              this.unsubscribeFromRouteData(n);
              return;
            }
            let a = this.outletSeenKeys.get(n);
            a || ((a = new Set()), this.outletSeenKeys.set(n, a));
            for (let u of Object.keys(o)) a.add(u);
            let c = this.options.unmatchedInputBehavior ?? `alwaysUndefined`;
            for (let { templateName: u } of s.inputs) {
              let l = o[u];
              (l !== void 0 || c === `alwaysUndefined` || a.has(u)) &&
                n.activatedComponentRef.setInput(u, l);
            }
          });
      this.outletDataSubscriptions.set(n, i);
    }
    static ɵfac = function (r) {
      Ml();
    };
    static ɵprov = q({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var cm = (() => {
  class t {
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵcmp = Vi({
      type: t,
      selectors: [[`ng-component`]],
      exportAs: [`emptyRouterOutlet`],
      decls: 1,
      vars: 0,
      template: function (r, i) {
        r & 1 && Rl(0, `router-outlet`);
      },
      dependencies: [am],
      encapsulation: 2,
      changeDetection: 1,
    });
  }
  return t;
})();
function um(t) {
  let e = t.children && t.children.map(um),
    n = e ? m(l({}, t), { children: e }) : l({}, t);
  return (
    !n.component &&
      !n.loadComponent &&
      (e || n.loadChildren) &&
      n.outlet &&
      n.outlet !== G &&
      (n.component = cm),
    n
  );
}
function aP(t, e, n) {
  let r = new Set();
  return { newlyCreatedRoutes: r, state: new ic(sc(t, e._root, n ? n._root : void 0, r), e) };
}
function sc(t, e, n, r) {
  if (n && t.shouldReuseRoute(e.value, n.value.snapshot)) {
    let i = n.value;
    i._futureSnapshot = e.value;
    return new Ot(i, cP(t, e, n, r));
  } else {
    if (t.shouldAttach(e.value)) {
      let s = t.retrieve(e.value);
      if (s !== null) {
        let a = s.route;
        return (
          (a.value._futureSnapshot = e.value),
          (a.children = e.children.map((c) => sc(t, c, void 0, r))),
          a
        );
      }
    }
    let i = uP(e.value);
    r.add(i);
    return new Ot(
      i,
      e.children.map((s) => sc(t, s, void 0, r)),
    );
  }
}
function cP(t, e, n, r) {
  return e.children.map((i) => {
    for (let o of n.children)
      if (t.shouldReuseRoute(i.value, o.value.snapshot)) return sc(t, i, o, r);
    return sc(t, i, void 0, r);
  });
}
function uP(t) {
  return new ur(
    new Ze(t.url),
    new Ze(t.params),
    new Ze(t.queryParams),
    new Ze(t.fragment),
    new Ze(t.data),
    t.outlet,
    t.component,
    t,
  );
}
var as = class {
  redirectTo;
  navigationBehaviorOptions;
  constructor(e, n) {
    ((this.redirectTo = e), (this.navigationBehaviorOptions = n));
  }
};
var pI = `ngNavigationCancelingError`;
function Cd(t, e) {
  let { redirectTo: n, navigationBehaviorOptions: r } = Vr(e)
      ? { redirectTo: e, navigationBehaviorOptions: void 0 }
      : e,
    i = gI(!1, at.Redirect);
  return ((i.url = n), (i.navigationBehaviorOptions = r), i);
}
function gI(t, e) {
  let n = new Error(`NavigationCancelingError: ${t || ``}`);
  return ((n[pI] = !0), (n.cancellationCode = e), n);
}
function lP(t) {
  return mI(t) && Vr(t.url);
}
function mI(t) {
  return !!t && t[pI];
}
var em = class {
  routeReuseStrategy;
  futureState;
  currState;
  forwardEvent;
  inputBindingEnabled;
  constructor(e, n, r, i, o) {
    ((this.routeReuseStrategy = e),
      (this.futureState = n),
      (this.currState = r),
      (this.forwardEvent = i),
      (this.inputBindingEnabled = o));
  }
  activate(e) {
    let n = this.futureState._root,
      r = this.currState ? this.currState._root : null;
    (this.deactivateChildRoutes(n, r, e),
      $g(this.futureState.root),
      this.activateChildRoutes(n, r, e));
  }
  deactivateChildRoutes(e, n, r) {
    let i = ts(n);
    (e.children.forEach((o) => {
      let s = o.value.outlet;
      (this.deactivateRoutes(o, i[s], r), delete i[s]);
    }),
      Object.values(i).forEach((o) => {
        this.deactivateRouteAndItsChildren(o, r);
      }));
  }
  deactivateRoutes(e, n, r) {
    let i = e.value,
      o = n ? n.value : null;
    if (i === o)
      if (i.component) {
        let s = r.getContext(i.outlet);
        s && this.deactivateChildRoutes(e, n, s.children);
      } else this.deactivateChildRoutes(e, n, r);
    else o && this.deactivateRouteAndItsChildren(n, r);
  }
  deactivateRouteAndItsChildren(e, n) {
    e.value.component && this.routeReuseStrategy.shouldDetach(e.value.snapshot)
      ? this.detachAndStoreRouteSubtree(e, n)
      : this.deactivateRouteAndOutlet(e, n);
  }
  detachAndStoreRouteSubtree(e, n) {
    let r = n.getContext(e.value.outlet),
      i = r && e.value.component ? r.children : n,
      o = ts(e);
    for (let s of Object.values(o)) this.deactivateRouteAndItsChildren(s, i);
    if (r && r.outlet) {
      let s = r.outlet.detach(),
        a = r.children.onOutletDeactivated();
      this.routeReuseStrategy.store(e.value.snapshot, { componentRef: s, route: e, contexts: a });
    }
  }
  deactivateRouteAndOutlet(e, n) {
    let r = n.getContext(e.value.outlet),
      i = r && e.value.component ? r.children : n,
      o = ts(e);
    for (let s of Object.values(o)) this.deactivateRouteAndItsChildren(s, i);
    (r &&
      (r.outlet && (r.outlet.deactivate(), r.children.onOutletDeactivated()),
      (r.attachRef = null),
      (r.route = null)),
      e.value._localInjector?.destroy());
  }
  activateChildRoutes(e, n, r) {
    let i = ts(n);
    (e.children.forEach((o) => {
      (this.activateRoutes(o, i[o.value.outlet], r), this.forwardEvent(new _d(o.value.snapshot)));
    }),
      e.children.length && this.forwardEvent(new vd(e.value.snapshot)));
  }
  activateRoutes(e, n, r) {
    let i = e.value,
      o = n ? n.value : null;
    if (($g(i), i === o))
      if (i.component) {
        let s = r.getOrCreateContext(i.outlet);
        this.activateChildRoutes(e, n, s.children);
      } else this.activateChildRoutes(e, n, r);
    else if (i.component) {
      let s = r.getOrCreateContext(i.outlet);
      if (this.routeReuseStrategy.shouldAttach(i.snapshot)) {
        let a = this.routeReuseStrategy.retrieve(i.snapshot);
        (this.routeReuseStrategy.store(i.snapshot, null),
          s.children.onOutletReAttached(a.contexts),
          (s.attachRef = a.componentRef),
          (s.route = a.route.value),
          s.outlet && s.outlet.attach(a.componentRef, a.route.value),
          $g(a.route.value),
          this.activateChildRoutes(e, null, s.children));
      } else
        ((s.attachRef = null),
          (s.route = i),
          s.outlet && s.outlet.activateWith(i, s.injector),
          this.activateChildRoutes(e, null, s.children));
    } else this.activateChildRoutes(e, null, r);
  }
};
var wd = class {
  path;
  route;
  constructor(e) {
    ((this.path = e), (this.route = this.path[this.path.length - 1]));
  }
};
var rs = class {
  component;
  route;
  constructor(e, n) {
    ((this.component = e), (this.route = n));
  }
};
function dP(t, e, n) {
  let r = t._root;
  return Ka(r, e ? e._root : null, n, [r.value]);
}
function fP(t) {
  let e = t.routeConfig ? t.routeConfig.canActivateChild : null;
  return !e || e.length === 0 ? null : { node: t, guards: e };
}
function ds(t, e) {
  let n = Symbol(),
    r = e.get(t, n);
  return r === n ? (typeof t == `function` && !Bf(t) ? t : e.get(t)) : r;
}
function Ka(t, e, n, r, i = { canDeactivateChecks: [], canActivateChecks: [] }) {
  let o = ts(e);
  return (
    t.children.forEach((s) => {
      (hP(s, o[s.value.outlet], n, r.concat([s.value]), i), delete o[s.value.outlet]);
    }),
    Object.entries(o).forEach(([s, a]) => Ja(a, n.getContext(s), i)),
    i
  );
}
function hP(t, e, n, r, i = { canDeactivateChecks: [], canActivateChecks: [] }) {
  let o = t.value,
    s = e ? e.value : null,
    a = n ? n.getContext(t.value.outlet) : null;
  if (s && o.routeConfig === s.routeConfig) {
    let c = pP(s, o, o.routeConfig.runGuardsAndResolvers);
    (c
      ? i.canActivateChecks.push(new wd(r))
      : ((o.data = s.data), (o._resolvedData = s._resolvedData)),
      o.component ? Ka(t, e, a ? a.children : null, r, i) : Ka(t, e, n, r, i),
      c &&
        a &&
        a.outlet &&
        a.outlet.isActivated &&
        i.canDeactivateChecks.push(new rs(a.outlet.component, s)));
  } else
    (s && Ja(e, a, i),
      i.canActivateChecks.push(new wd(r)),
      o.component ? Ka(t, null, a ? a.children : null, r, i) : Ka(t, null, n, r, i));
  return i;
}
function pP(t, e, n) {
  if (typeof n == `function`) return $e(e._environmentInjector, () => n(t, e));
  switch (n) {
    case `pathParamsChange`:
      return !$i(t.url, e.url);
    case `pathParamsOrQueryParamsChange`:
      return !$i(t.url, e.url) || !xn(t.queryParams, e.queryParams);
    case `always`:
      return !0;
    case `paramsOrQueryParamsChange`:
      return !Xg(t, e) || !xn(t.queryParams, e.queryParams);
    default:
      return !Xg(t, e);
  }
}
function Ja(t, e, n) {
  let r = ts(t),
    i = t.value;
  (Object.entries(r).forEach(([o, s]) => {
    i.component ? (e ? Ja(s, e.children.getContext(o), n) : Ja(s, null, n)) : Ja(s, e, n);
  }),
    i.component
      ? e && e.outlet && e.outlet.isActivated
        ? n.canDeactivateChecks.push(new rs(e.outlet.component, i))
        : n.canDeactivateChecks.push(new rs(null, i))
      : n.canDeactivateChecks.push(new rs(null, i)));
}
function lc(t) {
  return typeof t == `function`;
}
function gP(t) {
  return typeof t == `boolean`;
}
function mP(t) {
  return t && lc(t.canLoad);
}
function vP(t) {
  return t && lc(t.canActivate);
}
function yP(t) {
  return t && lc(t.canActivateChild);
}
function _P(t) {
  return t && lc(t.canDeactivate);
}
function DP(t) {
  return t && lc(t.canMatch);
}
function vI(t) {
  return t instanceof ni || t?.name === `EmptyError`;
}
var rd = Symbol(`INITIAL_VALUE`);
function cs() {
  return qe((t) =>
    ru(t.map((e) => e.pipe(yt(1), _r(rd)))).pipe(
      Y((e) => {
        for (let n of e)
          if (n !== !0) {
            if (n === rd) return rd;
            if (n === !1 || EP(n)) return n;
          }
        return !0;
      }),
      et((e) => e !== rd),
      yt(1),
    ),
  );
}
function EP(t) {
  return Vr(t) || t instanceof as;
}
function yI(t) {
  return t.aborted
    ? z(void 0).pipe(yt(1))
    : new k((e) => {
        let n = () => {
          (e.next(), e.complete());
        };
        return (t.addEventListener(`abort`, n), () => t.removeEventListener(`abort`, n));
      });
}
function _I(t) {
  return on(yI(t));
}
function CP(t) {
  return Ve((e) => {
    let {
      targetSnapshot: n,
      currentSnapshot: r,
      guards: { canActivateChecks: i, canDeactivateChecks: o },
    } = e;
    return o.length === 0 && i.length === 0
      ? z(m(l({}, e), { guardsResult: !0 }))
      : wP(o, n, r).pipe(
          Ve((s) => (s && gP(s) ? IP(n, i, t) : z(s))),
          Y((s) => m(l({}, e), { guardsResult: s })),
        );
  });
}
function wP(t, e, n) {
  return _e(t).pipe(
    Ve((r) => AP(r.component, r.route, n, e)),
    Un((r) => r !== !0, !0),
  );
}
function IP(t, e, n) {
  return _e(e).pipe(
    go((r) => rn(SP(r.route.parent, n), bP(r.route, n), MP(t, r.path), TP(t, r.route))),
    Un((r) => r !== !0, !0),
  );
}
function bP(t, e) {
  return (t !== null && e && e(new yd(t)), z(!0));
}
function SP(t, e) {
  return (t !== null && e && e(new md(t)), z(!0));
}
function TP(t, e) {
  let n = e.routeConfig ? e.routeConfig.canActivate : null;
  if (!n || n.length === 0) return z(!0);
  return z(
    n.map((i) =>
      Rs(() => {
        let o = e._environmentInjector,
          s = ds(i, o);
        return qi(vP(s) ? s.canActivate(e, t) : $e(o, () => s(e, t))).pipe(Un());
      }),
    ),
  ).pipe(cs());
}
function MP(t, e) {
  let n = e[e.length - 1];
  return z(
    e
      .slice(0, e.length - 1)
      .reverse()
      .map((o) => fP(o))
      .filter((o) => o !== null)
      .map((o) =>
        Rs(() => {
          return z(
            o.guards.map((a) => {
              let c = o.node._environmentInjector,
                u = ds(a, c);
              return qi(yP(u) ? u.canActivateChild(n, t) : $e(c, () => u(n, t))).pipe(Un());
            }),
          ).pipe(cs());
        }),
      ),
  ).pipe(cs());
}
function AP(t, e, n, r) {
  let i = e && e.routeConfig ? e.routeConfig.canDeactivate : null;
  if (!i || i.length === 0) return z(!0);
  return z(
    i.map((s) => {
      let a = e._environmentInjector,
        c = ds(s, a);
      return qi(_P(c) ? c.canDeactivate(t, e, n, r) : $e(a, () => c(t, e, n, r))).pipe(Un());
    }),
  ).pipe(cs());
}
function NP(t, e, n, r, i) {
  let o = e.canLoad;
  if (o === void 0 || o.length === 0) return z(!0);
  return z(
    o.map((a) => {
      let c = ds(a, t),
        l = qi(mP(c) ? c.canLoad(e, n) : $e(t, () => c(e, n)));
      return i ? l.pipe(_I(i)) : l;
    }),
  ).pipe(cs(), DI(r));
}
function DI(t) {
  return Jr(
    ft((e) => {
      if (typeof e != `boolean`) throw Cd(t, e);
    }),
    Y((e) => e === !0),
  );
}
function xP(t, e, n, r, i, o) {
  let s = e.canMatch;
  if (!s || s.length === 0) return z(!0);
  return z(
    s.map((c) => {
      let u = ds(c, t);
      return qi(DP(u) ? u.canMatch(e, n, i) : $e(t, () => u(e, n, i))).pipe(_I(o));
    }),
  ).pipe(cs(), DI(r));
}
var ar = class t extends Error {
  segmentGroup;
  constructor(e) {
    (super(), (this.segmentGroup = e || null), Object.setPrototypeOf(this, t.prototype));
  }
};
var ac = class t extends Error {
  urlTree;
  constructor(e) {
    (super(), (this.urlTree = e), Object.setPrototypeOf(this, t.prototype));
  }
};
function RP(t) {
  throw new I(4e3, !1);
}
function OP(t) {
  throw gI(!1, at.GuardRejected);
}
var tm = class {
  urlSerializer;
  urlTree;
  constructor(e, n) {
    ((this.urlSerializer = e), (this.urlTree = n));
  }
  async lineralizeSegments(e, n) {
    let r = [],
      i = n.root;
    for (;;) {
      if (((r = r.concat(i.segments)), i.numberOfChildren === 0)) return r;
      if (i.numberOfChildren > 1 || !i.children[G]) throw RP(`${e.redirectTo}`);
      i = i.children[G];
    }
  }
  async applyRedirectCommands(e, n, r, i, o) {
    let s = await kP(n, i, o);
    if (s instanceof kt) throw new ac(s);
    let a = this.applyRedirectCreateUrlTree(s, this.urlSerializer.parse(s), e, r);
    if (s[0] === `/`) throw new ac(a);
    return a;
  }
  applyRedirectCreateUrlTree(e, n, r, i) {
    return new kt(
      this.createSegmentGroup(e, n.root, r, i),
      this.createQueryParams(n.queryParams, this.urlTree.queryParams),
      n.fragment,
    );
  }
  createQueryParams(e, n) {
    let r = {};
    return (
      Object.entries(e).forEach(([i, o]) => {
        if (typeof o == `string` && o[0] === `:`) {
          let a = o.substring(1);
          r[i] = n[a];
        } else r[i] = o;
      }),
      r
    );
  }
  createSegmentGroup(e, n, r, i) {
    let o = this.createSegments(e, n.segments, r, i),
      s = Object.create(null);
    return (
      Object.entries(n.children).forEach(([a, c]) => {
        s[a] = this.createSegmentGroup(e, c, r, i);
      }),
      new Q(o, s)
    );
  }
  createSegments(e, n, r, i) {
    return n.map((o) => (o.path[0] === `:` ? this.findPosParam(e, o, i) : this.findOrReturn(o, r)));
  }
  findPosParam(e, n, r) {
    let i = r[n.path.substring(1)];
    if (!i) throw new I(4001, !1);
    return i;
  }
  findOrReturn(e, n) {
    let r = 0;
    for (let i of n) {
      if (i.path === e.path) return (n.splice(r), i);
      r++;
    }
    return e;
  }
};
function kP(t, e, n) {
  if (typeof t == `string`) return Promise.resolve(t);
  let r = t;
  return ad(qi($e(n, () => r(e))));
}
function PP(t, e) {
  return (
    t.providers && !t._injector && (t._injector = Sa(t.providers, e, `Route: ${t.path}`)),
    t._injector ?? e
  );
}
function pn(t) {
  return t.outlet || G;
}
function FP(t, e) {
  let n = t.filter((r) => pn(r) === e);
  return (n.push(...t.filter((r) => pn(r) !== e)), n);
}
var nm = {
  matched: !1,
  consumedSegments: [],
  remainingSegments: [],
  parameters: {},
  positionalParamSegments: {},
};
function EI(t) {
  return {
    routeConfig: t.routeConfig,
    url: t.url,
    params: t.params,
    queryParams: t.queryParams,
    fragment: t.fragment,
    data: t.data,
    outlet: t.outlet,
    title: t.title,
    paramMap: t.paramMap,
    queryParamMap: t.queryParamMap,
  };
}
function LP(t, e, n, r, i, o, s) {
  let a = CI(t, e, n);
  if (!a.matched) return z(a);
  let c = EI(o(a));
  return ((r = PP(e, r)), xP(r, e, n, i, c, s).pipe(Y((u) => (u === !0 ? a : l({}, nm)))));
}
function CI(t, e, n) {
  if (e.path === ``)
    return e.pathMatch === `full` && (t.hasChildren() || n.length > 0)
      ? l({}, nm)
      : {
          matched: !0,
          consumedSegments: [],
          remainingSegments: n,
          parameters: {},
          positionalParamSegments: {},
        };
  let i = (e.matcher || zw)(n, t, e);
  if (!i) return l({}, nm);
  let o = {};
  Object.entries(i.posParams ?? {}).forEach(([a, c]) => {
    o[a] = c.path;
  });
  let s = i.consumed.length > 0 ? l(l({}, o), i.consumed[i.consumed.length - 1].parameters) : o;
  return {
    matched: !0,
    consumedSegments: i.consumed,
    remainingSegments: n.slice(i.consumed.length),
    parameters: s,
    positionalParamSegments: i.posParams ?? {},
  };
}
function Hw(t, e, n, r, i) {
  return n.length > 0 && UP(t, n, r, i)
    ? { segmentGroup: new Q(e, jP(r, new Q(n, t.children))), slicedSegments: [] }
    : n.length === 0 && BP(t, n, r)
      ? { segmentGroup: new Q(t.segments, VP(t, n, r, t.children)), slicedSegments: n }
      : { segmentGroup: new Q(t.segments, t.children), slicedSegments: n };
}
function VP(t, e, n, r) {
  let i = {};
  for (let o of n)
    if (bd(t, e, o) && !r[pn(o)]) {
      let s = new Q([], {});
      i[pn(o)] = s;
    }
  return l(l({}, r), i);
}
function jP(t, e) {
  let n = {};
  n[G] = e;
  for (let r of t)
    if (r.path === `` && pn(r) !== G) {
      let i = new Q([], {});
      n[pn(r)] = i;
    }
  return n;
}
function UP(t, e, n, r) {
  return n.some((i) => (!bd(t, e, i) || !(pn(i) !== G) ? !1 : !(r !== void 0 && pn(i) === r)));
}
function BP(t, e, n) {
  return n.some((r) => bd(t, e, r));
}
function bd(t, e, n) {
  return (t.hasChildren() || e.length > 0) && n.pathMatch === `full` ? !1 : n.path === ``;
}
function HP(t, e, n) {
  return e.length === 0 && !t.children[n];
}
var rm = class {};
async function $P(t, e, n, r, i, o, s, a) {
  return new im(t, e, n, r, i, s, o, a).recognize();
}
var GP = 31;
var im = class {
  injector;
  configLoader;
  rootComponentType;
  config;
  urlTree;
  paramsInheritanceStrategy;
  urlSerializer;
  abortSignal;
  applyRedirects;
  absoluteRedirectCount = 0;
  allowRedirects = !0;
  constructor(e, n, r, i, o, s, a, c) {
    ((this.injector = e),
      (this.configLoader = n),
      (this.rootComponentType = r),
      (this.config = i),
      (this.urlTree = o),
      (this.paramsInheritanceStrategy = s),
      (this.urlSerializer = a),
      (this.abortSignal = c),
      (this.applyRedirects = new tm(this.urlSerializer, this.urlTree)));
  }
  noMatchError(e) {
    return new I(4002, `'${e.segmentGroup}'`);
  }
  async recognize() {
    let e = Hw(this.urlTree.root, [], [], this.config).segmentGroup,
      { children: n, rootSnapshot: r } = await this.match(e),
      o = new oc(``, new Ot(r, n)),
      s = rI(r, [], this.urlTree.queryParams, this.urlTree.fragment);
    return (
      (s.queryParams = this.urlTree.queryParams),
      (o.url = this.urlSerializer.serialize(s)),
      { state: o, tree: s }
    );
  }
  async match(e) {
    let n = new ss(
      [],
      Object.freeze({}),
      Object.freeze(l({}, this.urlTree.queryParams)),
      this.urlTree.fragment,
      Object.freeze({}),
      G,
      this.rootComponentType,
      null,
      {},
      this.injector,
    );
    try {
      return {
        children: await this.processSegmentGroup(this.injector, this.config, e, G, n),
        rootSnapshot: n,
      };
    } catch (r) {
      if (r instanceof ac) return ((this.urlTree = r.urlTree), this.match(r.urlTree.root));
      throw r instanceof ar ? this.noMatchError(r) : r;
    }
  }
  async processSegmentGroup(e, n, r, i, o) {
    if (r.segments.length === 0 && r.hasChildren()) return this.processChildren(e, n, r, o);
    let s = await this.processSegment(e, n, r, r.segments, i, !0, o);
    return s instanceof Ot ? [s] : [];
  }
  async processChildren(e, n, r, i) {
    let o = [];
    for (let c of Object.keys(r.children)) c === `primary` ? o.unshift(c) : o.push(c);
    let s = [];
    for (let c of o) {
      let u = r.children[c],
        l = FP(n, c),
        d = await this.processSegmentGroup(e, l, u, c, i);
      s.push(...d);
    }
    let a = wI(s);
    return (zP(a), a);
  }
  async processSegment(e, n, r, i, o, s, a) {
    for (let c of n)
      try {
        return await this.processSegmentAgainstRoute(c._injector ?? e, n, c, r, i, o, s, a);
      } catch (u) {
        if (u instanceof ar || vI(u)) continue;
        throw u;
      }
    if (HP(r, i, o)) return new rm();
    throw new ar(r);
  }
  async processSegmentAgainstRoute(e, n, r, i, o, s, a, c) {
    if (pn(r) !== s && (s === G || !bd(i, o, r))) throw new ar(i);
    if (r.redirectTo === void 0) return this.matchSegmentAgainstRoute(e, i, r, o, s, c);
    if (this.allowRedirects && a)
      return this.expandSegmentAgainstRouteUsingRedirect(e, i, n, r, o, s, c);
    throw new ar(i);
  }
  async expandSegmentAgainstRouteUsingRedirect(e, n, r, i, o, s, a) {
    let {
      matched: c,
      parameters: u,
      consumedSegments: l,
      positionalParamSegments: d,
      remainingSegments: f,
    } = CI(n, i, o);
    if (!c) throw new ar(n);
    typeof i.redirectTo == `string` &&
      i.redirectTo[0] === `/` &&
      (this.absoluteRedirectCount++, this.absoluteRedirectCount > GP && (this.allowRedirects = !1));
    let h = this.createSnapshot(e, i, o, u, a);
    if (this.abortSignal.aborted) throw new Error(this.abortSignal.reason);
    let g = await this.applyRedirects.applyRedirectCommands(l, i.redirectTo, d, EI(h), e),
      p = await this.applyRedirects.lineralizeSegments(i, g);
    return this.processSegment(e, r, n, p.concat(f), s, !1, a);
  }
  createSnapshot(e, n, r, i, o) {
    let s = new ss(
        r,
        i,
        Object.freeze(l({}, this.urlTree.queryParams)),
        this.urlTree.fragment,
        qP(n),
        pn(n),
        n.component ?? n._loadedComponent ?? null,
        n,
        YP(n),
        e,
      ),
      a = om(s, o, this.paramsInheritanceStrategy);
    return ((s.params = Object.freeze(a.params)), (s.data = Object.freeze(a.data)), s);
  }
  async matchSegmentAgainstRoute(e, n, r, i, o, s) {
    if (this.abortSignal.aborted) throw new Error(this.abortSignal.reason);
    let a = (w) => this.createSnapshot(e, r, w.consumedSegments, w.parameters, s),
      c = await ad(LP(n, r, i, e, this.urlSerializer, a, this.abortSignal));
    if ((r.path === `**` && (n.children = {}), !c?.matched)) throw new ar(n);
    e = r._injector ?? e;
    let { routes: u } = await this.getChildConfig(e, r, i),
      l = r._loadedInjector ?? e,
      { parameters: d, consumedSegments: f, remainingSegments: h } = c,
      g = this.createSnapshot(e, r, f, d, s),
      { segmentGroup: p, slicedSegments: m } = Hw(n, f, h, u, o);
    if (m.length === 0 && p.hasChildren()) return new Ot(g, await this.processChildren(l, u, p, g));
    if (u.length === 0 && m.length === 0) return new Ot(g, []);
    let y = pn(r) === o,
      _ = await this.processSegment(l, u, p, m, y ? G : o, !0, g);
    return new Ot(g, _ instanceof Ot ? [_] : []);
  }
  async getChildConfig(e, n, r) {
    if (n.children) return { routes: n.children, injector: e };
    if (n.loadChildren) {
      if (n._loadedRoutes !== void 0) {
        let o = n._loadedNgModuleFactory;
        return (
          o && !n._loadedInjector && (n._loadedInjector = o.create(e).injector),
          { routes: n._loadedRoutes, injector: n._loadedInjector }
        );
      }
      if (this.abortSignal.aborted) throw new Error(this.abortSignal.reason);
      if (await ad(NP(e, n, r, this.urlSerializer, this.abortSignal))) {
        let o = await this.configLoader.loadChildren(e, n);
        return (
          (n._loadedRoutes = o.routes),
          (n._loadedInjector = o.injector),
          (n._loadedNgModuleFactory = o.factory),
          o
        );
      }
      throw OP(n);
    }
    return { routes: [], injector: e };
  }
};
function zP(t) {
  t.sort((e, n) =>
    e.value.outlet === G
      ? -1
      : n.value.outlet === G
        ? 1
        : e.value.outlet.localeCompare(n.value.outlet),
  );
}
function WP(t) {
  let e = t.value.routeConfig;
  return e && e.path === ``;
}
function wI(t) {
  let e = [],
    n = new Set();
  for (let r of t) {
    if (!WP(r)) {
      e.push(r);
      continue;
    }
    let i = e.find((o) => r.value.routeConfig === o.value.routeConfig);
    i !== void 0 ? (i.children.push(...r.children), n.add(i)) : e.push(r);
  }
  for (let r of n) {
    let i = wI(r.children);
    e.push(new Ot(r.value, i));
  }
  return e.filter((r) => !n.has(r));
}
function qP(t) {
  return t.data || {};
}
function YP(t) {
  return t.resolve || {};
}
function ZP(t, e, n, r, i, o, s) {
  return Ve(async (a) => {
    let { state: c, tree: u } = await $P(t, e, n, r, a.extractedUrl, i, o, s);
    return m(l({}, a), { targetSnapshot: c, urlAfterRedirects: u });
  });
}
function KP(t) {
  return Ve((e) => {
    let {
      targetSnapshot: n,
      guards: { canActivateChecks: r },
    } = e;
    if (!r.length) return z(e);
    let i = new Set(r.map((a) => a.route)),
      o = new Set();
    for (let a of i) if (!o.has(a)) for (let c of II(a)) o.add(c);
    let s = 0;
    return _e(o).pipe(
      go((a) => (i.has(a) ? QP(a, n, t) : ((a.data = om(a, a.parent, t).resolve), z(void 0)))),
      ft(() => s++),
      ou(1),
      Ve((a) => (s === o.size ? z(e) : ye)),
    );
  });
}
function II(t) {
  return [t, ...t.children.map((n) => II(n)).flat()];
}
function QP(t, e, n) {
  let r = t.routeConfig,
    i = t._resolve;
  return (
    r?.title !== void 0 && !dI(r) && (i[cc] = r.title),
    Rs(
      () => (
        (t.data = om(t, t.parent, n).resolve),
        XP(i, t, e).pipe(Y((o) => ((t._resolvedData = o), (t.data = l(l({}, t.data), o)), null)))
      ),
    )
  );
}
function XP(t, e, n) {
  let r = zg(t);
  if (r.length === 0) return z({});
  let i = {};
  return _e(r).pipe(
    Ve((o) =>
      JP(t[o], e, n).pipe(
        Un(),
        ft((s) => {
          if (s instanceof as) throw Cd(new Lr(), s);
          i[o] = s;
        }),
      ),
    ),
    ou(1),
    Y(() => i),
    yr((o) => (vI(o) ? ye : lf(o))),
  );
}
function JP(t, e, n) {
  let r = e._environmentInjector,
    i = ds(t, r);
  return qi(i.resolve ? i.resolve(e, n) : $e(r, () => i(e, n)));
}
function $w(t) {
  return qe((e) => {
    let n = t(e);
    return n ? _e(n).pipe(Y(() => e)) : z(e);
  });
}
var lm = (() => {
  class t {
    buildTitle(n) {
      let r,
        i = n.root;
      for (; i !== void 0;)
        ((r = this.getResolvedTitleForRoute(i) ?? r), (i = i.children.find((o) => o.outlet === G)));
      return r;
    }
    getResolvedTitleForRoute(n) {
      return n.data[cc];
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: () => v(bI) });
  }
  return t;
})();
var bI = (() => {
  class t extends lm {
    title;
    constructor(n) {
      (super(), (this.title = n));
    }
    updateTitle(n) {
      let r = this.buildTitle(n);
      r !== void 0 && this.title.setTitle(r);
    }
    static ɵfac = function (r) {
      return new (r || t)(j(Fw));
    };
    static ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
  }
  return t;
})();
var fs = new E(``, { factory: () => ({}) });
var dc = new E(``);
var SI = (() => {
  class t {
    componentLoaders = new WeakMap();
    childrenLoaders = new WeakMap();
    onLoadStartListener;
    onLoadEndListener;
    compiler = v(dg);
    async loadComponent(n, r) {
      if (this.componentLoaders.get(r)) return this.componentLoaders.get(r);
      if (r._loadedComponent) return Promise.resolve(r._loadedComponent);
      this.onLoadStartListener && this.onLoadStartListener(r);
      let i = (async () => {
        try {
          let s = await MI(Cg(await qw($e(n, () => r.loadComponent()))));
          return (this.onLoadEndListener && this.onLoadEndListener(r), (r._loadedComponent = s), s);
        } finally {
          this.componentLoaders.delete(r);
        }
      })();
      return (this.componentLoaders.set(r, i), i);
    }
    loadChildren(n, r) {
      if (this.childrenLoaders.get(r)) return this.childrenLoaders.get(r);
      if (r._loadedRoutes)
        return Promise.resolve({ routes: r._loadedRoutes, injector: r._loadedInjector });
      this.onLoadStartListener && this.onLoadStartListener(r);
      let i = (async () => {
        try {
          let o = await TI(r, this.compiler, n, this.onLoadEndListener);
          return (
            (r._loadedRoutes = o.routes),
            (r._loadedInjector = o.injector),
            (r._loadedNgModuleFactory = o.factory),
            o
          );
        } finally {
          this.childrenLoaders.delete(r);
        }
      })();
      return (this.childrenLoaders.set(r, i), i);
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
async function TI(t, e, n, r) {
  let o = await MI(Cg(await qw($e(n, () => t.loadChildren())))),
    s;
  (o instanceof Nl || Array.isArray(o) ? (s = o) : (s = await e.compileModuleAsync(o)), r && r(t));
  let a, c, l;
  return (
    Array.isArray(s)
      ? (c = s)
      : ((a = s.create(n).injector),
        (l = s),
        (c = a.get(dc, [], { optional: !0, self: !0 }).flat())),
    { routes: c.map(um), injector: a, factory: l }
  );
}
async function MI(t) {
  return t;
}
var Sd = (() => {
  class t {
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: () => v(eF) });
  }
  return t;
})();
var eF = (() => {
  class t {
    shouldProcessUrl(n) {
      return !0;
    }
    extract(n) {
      return n;
    }
    merge(n, r) {
      return n;
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var dm = new E(``);
var fm = new E(``);
function AI(t, e, n) {
  let r = t.get(fm),
    i = t.get(ie);
  if (!i.startViewTransition || r.skipNextTransition)
    return ((r.skipNextTransition = !1), new Promise((u) => setTimeout(u)));
  let o,
    s = new Promise((u) => {
      o = u;
    }),
    a = i.startViewTransition(() => (o(), tF(t)));
  (a.updateCallbackDone.catch((u) => {}), a.ready.catch((u) => {}), a.finished.catch((u) => {}));
  let { onViewTransitionCreated: c } = r;
  return (c && $e(t, () => c({ transition: a, from: e, to: n })), s);
}
function tF(t) {
  return new Promise((e) => {
    Ca({ read: () => setTimeout(e) }, { injector: t });
  });
}
var NI = new E(``);
var nF = () => {};
var xI = new E(``);
var RI = (() => {
  class t {
    currentNavigation = H(null, { equal: () => !1 });
    currentTransition = null;
    lastSuccessfulNavigation = H(null);
    events = new ue();
    transitionAbortWithErrorSubject = new ue();
    configLoader = v(SI);
    environmentInjector = v(ve);
    destroyRef = v(J);
    urlSerializer = v(us);
    rootContexts = v(ls);
    location = v(Ko);
    inputBindingEnabled = v(uc, { optional: !0 }) !== null;
    titleStrategy = v(lm);
    options = v(fs, { optional: !0 }) || {};
    paramsInheritanceStrategy = this.options.paramsInheritanceStrategy || sP;
    urlHandlingStrategy = v(Sd);
    createViewTransition = v(dm, { optional: !0 });
    navigationErrorHandler = v(xI, { optional: !0 });
    activatedRouteInjectorFeature = v(NI, { optional: !0 });
    navigationId = 0;
    get hasRequestedNavigation() {
      return this.navigationId !== 0;
    }
    transitions;
    afterPreactivation = () => z(void 0);
    rootComponentType = null;
    destroyed = !1;
    constructor() {
      let n = (i) => this.events.next(new pd(i)),
        r = (i) => this.events.next(new gd(i));
      ((this.configLoader.onLoadEndListener = r),
        (this.configLoader.onLoadStartListener = n),
        this.destroyRef.onDestroy(() => {
          this.destroyed = !0;
        }));
    }
    complete() {
      this.transitions?.complete();
    }
    handleNavigationRequest(n) {
      let r = ++this.navigationId;
      F(() => {
        this.transitions?.next(
          m(l({}, n), {
            extractedUrl: this.urlHandlingStrategy.extract(n.rawUrl),
            targetSnapshot: null,
            targetRouterState: null,
            guards: { canActivateChecks: [], canDeactivateChecks: [] },
            guardsResult: null,
            id: r,
            routesRecognizeHandler: {},
            beforeActivateHandler: {},
          }),
        );
      });
    }
    setupNavigations(n) {
      return (
        (this.transitions = new Ze(null)),
        this.transitions.pipe(
          et((r) => r !== null),
          qe((r) => {
            let i = !0,
              o = !1,
              s = new AbortController(),
              a = () => !o && this.currentTransition?.id === r.id;
            return z(r).pipe(
              qe((c) => {
                if (this.navigationId > r.id)
                  return (this.cancelNavigationTransition(r, ``, at.SupersededByNewNavigation), ye);
                this.currentTransition = r;
                let u = this.lastSuccessfulNavigation();
                this.currentNavigation.set({
                  id: c.id,
                  initialUrl: c.rawUrl,
                  extractedUrl: c.extractedUrl,
                  targetBrowserUrl:
                    typeof c.extras.browserUrl == `string`
                      ? this.urlSerializer.parse(c.extras.browserUrl)
                      : c.extras.browserUrl,
                  trigger: c.source,
                  extras: c.extras,
                  previousNavigation: u ? m(l({}, u), { previousNavigation: null }) : null,
                  abort: () => s.abort(),
                  routesRecognizeHandler: c.routesRecognizeHandler,
                  beforeActivateHandler: c.beforeActivateHandler,
                });
                let l$2 =
                    !n.navigated || this.isUpdatingInternalState() || this.isUpdatedBrowserUrl(),
                  d = c.extras.onSameUrlNavigation ?? n.onSameUrlNavigation;
                if (!l$2 && d !== `reload`)
                  return (
                    this.events.next(
                      new cr(
                        c.id,
                        this.urlSerializer.serialize(c.rawUrl),
                        ``,
                        tc.IgnoredSameUrlNavigation,
                      ),
                    ),
                    c.resolve(!1),
                    ye
                  );
                if (this.urlHandlingStrategy.shouldProcessUrl(c.rawUrl))
                  return z(c).pipe(
                    qe(
                      (f) => (
                        this.events.next(
                          new zi(
                            f.id,
                            this.urlSerializer.serialize(f.extractedUrl),
                            f.source,
                            f.restoredState,
                          ),
                        ),
                        f.id !== this.navigationId ? ye : Promise.resolve(f)
                      ),
                    ),
                    ZP(
                      this.environmentInjector,
                      this.configLoader,
                      this.rootComponentType,
                      n.config,
                      this.urlSerializer,
                      this.paramsInheritanceStrategy,
                      s.signal,
                    ),
                    ft((f) => {
                      ((r.targetSnapshot = f.targetSnapshot),
                        (r.urlAfterRedirects = f.urlAfterRedirects),
                        this.currentNavigation.update(
                          (h) => ((h.finalUrl = f.urlAfterRedirects), h),
                        ),
                        this.events.next(new rc()));
                    }),
                    qe((f) =>
                      _e(r.routesRecognizeHandler.deferredHandle ?? z(void 0)).pipe(Y(() => f)),
                    ),
                    ft(() => {
                      let f = new nc(
                        c.id,
                        this.urlSerializer.serialize(c.extractedUrl),
                        this.urlSerializer.serialize(c.urlAfterRedirects),
                        c.targetSnapshot,
                      );
                      this.events.next(f);
                    }),
                  );
                if (l$2 && this.urlHandlingStrategy.shouldProcessUrl(c.currentRawUrl)) {
                  let { id: f, extractedUrl: h, source: g, restoredState: p, extras: m$1 } = c,
                    y = new zi(f, this.urlSerializer.serialize(h), g, p);
                  this.events.next(y);
                  let _ = uI(this.rootComponentType, this.environmentInjector).snapshot;
                  return (
                    (this.currentTransition = r =
                      m(l({}, c), {
                        targetSnapshot: _,
                        urlAfterRedirects: h,
                        extras: m(l({}, m$1), { skipLocationChange: !1, replaceUrl: !1 }),
                      })),
                    this.currentNavigation.update((w) => ((w.finalUrl = h), w)),
                    z(r)
                  );
                } else
                  return (
                    this.events.next(
                      new cr(
                        c.id,
                        this.urlSerializer.serialize(c.extractedUrl),
                        ``,
                        tc.IgnoredByUrlHandlingStrategy,
                      ),
                    ),
                    c.resolve(!1),
                    ye
                  );
              }),
              Y((c) => {
                let u = new ld(
                  c.id,
                  this.urlSerializer.serialize(c.extractedUrl),
                  this.urlSerializer.serialize(c.urlAfterRedirects),
                  c.targetSnapshot,
                );
                return (
                  this.events.next(u),
                  (this.currentTransition = r =
                    m(l({}, c), {
                      guards: dP(c.targetSnapshot, c.currentSnapshot, this.rootContexts),
                    })),
                  r
                );
              }),
              CP((c) => this.events.next(c)),
              qe((c) => {
                if (
                  ((r.guardsResult = c.guardsResult),
                  c.guardsResult && typeof c.guardsResult != `boolean`)
                )
                  throw Cd(this.urlSerializer, c.guardsResult);
                let u = new dd(
                  c.id,
                  this.urlSerializer.serialize(c.extractedUrl),
                  this.urlSerializer.serialize(c.urlAfterRedirects),
                  c.targetSnapshot,
                  !!c.guardsResult,
                );
                if ((this.events.next(u), !a())) return ye;
                if (!c.guardsResult)
                  return (this.cancelNavigationTransition(c, ``, at.GuardRejected), ye);
                if (c.guards.canActivateChecks.length === 0) return z(c);
                let l = new fd(
                  c.id,
                  this.urlSerializer.serialize(c.extractedUrl),
                  this.urlSerializer.serialize(c.urlAfterRedirects),
                  c.targetSnapshot,
                );
                if ((this.events.next(l), !a())) return ye;
                let d = !1;
                return z(c).pipe(
                  KP(this.paramsInheritanceStrategy),
                  ft({
                    next: () => {
                      d = !0;
                      let f = new hd(
                        c.id,
                        this.urlSerializer.serialize(c.extractedUrl),
                        this.urlSerializer.serialize(c.urlAfterRedirects),
                        c.targetSnapshot,
                      );
                      this.events.next(f);
                    },
                    complete: () => {
                      d || this.cancelNavigationTransition(c, ``, at.NoDataFromResolver);
                    },
                  }),
                );
              }),
              $w((c) => {
                let u = (d) => {
                    let f = [];
                    if (d.routeConfig?._loadedComponent)
                      d.component = d.routeConfig?._loadedComponent;
                    else if (d.routeConfig?.loadComponent) {
                      let h = d._environmentInjector;
                      f.push(
                        this.configLoader.loadComponent(h, d.routeConfig).then((g) => {
                          d.component = g;
                        }),
                      );
                    }
                    for (let h of d.children) f.push(...u(h));
                    return f;
                  },
                  l = u(c.targetSnapshot.root);
                return l.length === 0 ? z(c) : _e(Promise.all(l).then(() => c));
              }),
              qe((c) => {
                let { newlyCreatedRoutes: u, state: l$3 } = aP(
                  n.routeReuseStrategy,
                  c.targetSnapshot,
                  c.currentRouterState,
                );
                return (
                  (this.currentTransition =
                    r =
                    c =
                      m(l({}, c), { targetRouterState: l$3, newlyCreatedRoutes: u })),
                  this.currentNavigation.update((d) => ((d.targetRouterState = l$3), d)),
                  z(c)
                );
              }),
              this.activatedRouteInjectorFeature?.operator() ?? ((c) => c),
              $w(() => this.afterPreactivation()),
              qe(() => {
                let { currentSnapshot: c, targetSnapshot: u } = r,
                  l = this.createViewTransition?.(this.environmentInjector, c.root, u.root);
                return l ? _e(l).pipe(Y(() => r)) : z(r);
              }),
              yt(1),
              qe((c) => {
                ((i = !1), this.events.next(new is()));
                let u = r.beforeActivateHandler.deferredHandle;
                return u ? _e(u.then(() => c)) : z(c);
              }),
              ft((c) => {
                (new em(
                  n.routeReuseStrategy,
                  r.targetRouterState,
                  r.currentRouterState,
                  (u) => this.events.next(u),
                  this.inputBindingEnabled,
                ).activate(this.rootContexts),
                  c.newlyCreatedRoutes?.clear(),
                  a() &&
                    ((o = !0),
                    this.currentNavigation.update((u) => ((u.abort = nF), u)),
                    this.lastSuccessfulNavigation.set(F(this.currentNavigation)),
                    this.events.next(
                      new Rn(
                        c.id,
                        this.urlSerializer.serialize(c.extractedUrl),
                        this.urlSerializer.serialize(c.urlAfterRedirects),
                      ),
                    ),
                    this.titleStrategy?.updateTitle(c.targetRouterState.snapshot),
                    c.resolve(!0)));
              }),
              on(
                yI(s.signal).pipe(
                  et(() => !o && i),
                  ft(() => {
                    this.cancelNavigationTransition(r, s.signal.reason + ``, at.Aborted);
                  }),
                ),
              ),
              ft({
                complete: () => {
                  o = !0;
                },
              }),
              on(
                this.transitionAbortWithErrorSubject.pipe(
                  ft((c) => {
                    throw c;
                  }),
                ),
              ),
              mo(() => {
                (s.abort(),
                  o || this.cancelNavigationTransition(r, ``, at.SupersededByNewNavigation),
                  this.currentTransition?.id === r.id &&
                    (this.currentNavigation.set(null), (this.currentTransition = null)));
              }),
              yr((c) => {
                if (((o = !0), Gw(r), this.destroyed)) return (r.resolve(!1), ye);
                if (mI(c))
                  (this.events.next(
                    new Xt(
                      r.id,
                      this.urlSerializer.serialize(r.extractedUrl),
                      c.message,
                      c.cancellationCode,
                    ),
                  ),
                    lP(c)
                      ? this.events.next(new os(c.url, c.navigationBehaviorOptions))
                      : r.resolve(!1));
                else {
                  let u = new Wi(
                    r.id,
                    this.urlSerializer.serialize(r.extractedUrl),
                    c,
                    r.targetSnapshot ?? void 0,
                  );
                  try {
                    let l = $e(this.environmentInjector, () => this.navigationErrorHandler?.(u));
                    if (l instanceof as) {
                      let { message: d, cancellationCode: f } = Cd(this.urlSerializer, l);
                      (this.events.next(
                        new Xt(r.id, this.urlSerializer.serialize(r.extractedUrl), d, f),
                      ),
                        this.events.next(new os(l.redirectTo, l.navigationBehaviorOptions)));
                    } else throw (this.events.next(u), c);
                  } catch (l) {
                    this.options.resolveNavigationPromiseOnError ? r.resolve(!1) : r.reject(l);
                  }
                }
                return ye;
              }),
            );
          }),
        )
      );
    }
    cancelNavigationTransition(n, r, i) {
      Gw(n);
      let o = new Xt(n.id, this.urlSerializer.serialize(n.extractedUrl), r, i);
      (this.events.next(o), n.resolve(!1));
    }
    isUpdatingInternalState() {
      return (
        this.currentTransition?.extractedUrl.toString() !==
        this.currentTransition?.currentUrlTree.toString()
      );
    }
    isUpdatedBrowserUrl() {
      let n = this.urlHandlingStrategy.extract(this.urlSerializer.parse(this.location.path(!0))),
        r = F(this.currentNavigation),
        i = r?.targetBrowserUrl ?? r?.extractedUrl;
      return n.toString() !== i?.toString() && !r?.extras.skipLocationChange;
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
function rF(t) {
  return t !== Xa;
}
function Gw(t) {
  if (t.newlyCreatedRoutes) for (let e of t.newlyCreatedRoutes) e._localInjector?.destroy();
}
var OI = new E(``);
var kI = (() => {
  class t {
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: () => v(iF) });
  }
  return t;
})();
var Id = class {
  shouldDetach(e) {
    return !1;
  }
  store(e, n) {}
  shouldAttach(e) {
    return !1;
  }
  retrieve(e) {
    return null;
  }
  shouldReuseRoute(e, n) {
    return e.routeConfig === n.routeConfig;
  }
  shouldDestroyInjector(e) {
    return !0;
  }
};
var iF = (() => {
  class t extends Id {
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var Td = (() => {
  class t {
    urlSerializer = v(us);
    options = v(fs, { optional: !0 }) || {};
    canceledNavigationResolution = this.options.canceledNavigationResolution || `replace`;
    location = v(Ko);
    urlHandlingStrategy = v(Sd);
    urlUpdateStrategy = this.options.urlUpdateStrategy || `deferred`;
    currentUrlTree = new kt();
    getCurrentUrlTree() {
      return this.currentUrlTree;
    }
    rawUrlTree = this.currentUrlTree;
    getRawUrlTree() {
      return this.rawUrlTree;
    }
    createBrowserPath({ finalUrl: n, initialUrl: r, targetBrowserUrl: i }) {
      let o = n !== void 0 ? this.urlHandlingStrategy.merge(n, r) : r,
        s = i ?? o;
      return s instanceof kt ? this.urlSerializer.serialize(s) : s;
    }
    routerUrlState(n) {
      return n?.targetBrowserUrl === void 0 || n?.finalUrl === void 0
        ? {}
        : { ɵrouterUrl: this.urlSerializer.serialize(n.finalUrl) };
    }
    commitTransition({ targetRouterState: n, finalUrl: r, initialUrl: i }) {
      r && n
        ? ((this.currentUrlTree = r),
          (this.rawUrlTree = this.urlHandlingStrategy.merge(r, i)),
          (this.routerState = n))
        : (this.rawUrlTree = i);
    }
    routerState = uI(null, v(ve));
    getRouterState() {
      return this.routerState;
    }
    _stateMemento = this.createStateMemento();
    get stateMemento() {
      return this._stateMemento;
    }
    updateStateMemento() {
      this._stateMemento = this.createStateMemento();
    }
    createStateMemento() {
      return {
        rawUrlTree: this.rawUrlTree,
        currentUrlTree: this.currentUrlTree,
        routerState: this.routerState,
      };
    }
    restoredState() {
      return this.location.getState();
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: () => v(oF) });
  }
  return t;
})();
var oF = (() => {
  class t extends Td {
    currentPageId = 0;
    lastSuccessfulId = -1;
    get browserPageId() {
      return this.canceledNavigationResolution !== `computed`
        ? this.currentPageId
        : (this.restoredState()?.ɵrouterPageId ?? this.currentPageId);
    }
    registerNonRouterCurrentEntryChangeListener(n) {
      return this.location.subscribe((r) => {
        r.type === `popstate` &&
          setTimeout(() => {
            n(r.url, r.state, `popstate`, { replaceUrl: !0 });
          });
      });
    }
    handleRouterEvent(n, r) {
      n instanceof zi
        ? this.updateStateMemento()
        : n instanceof cr
          ? this.commitTransition(r)
          : n instanceof nc
            ? this.urlUpdateStrategy === `eager` &&
              (r.extras.skipLocationChange || this.setBrowserUrl(this.createBrowserPath(r), r))
            : n instanceof is
              ? (this.commitTransition(r),
                this.urlUpdateStrategy === `deferred` &&
                  !r.extras.skipLocationChange &&
                  this.setBrowserUrl(this.createBrowserPath(r), r))
              : n instanceof Xt && !cI(n)
                ? this.restoreHistory(r)
                : n instanceof Wi
                  ? this.restoreHistory(r, !0)
                  : n instanceof Rn &&
                    ((this.lastSuccessfulId = n.id), (this.currentPageId = this.browserPageId));
    }
    setBrowserUrl(n, r) {
      let { extras: i, id: o } = r,
        { replaceUrl: s, state: a } = i;
      if (this.location.isCurrentPathEqualTo(n) || s) {
        let c = this.browserPageId,
          u = l(l({}, a), this.generateNgRouterState(o, c, r));
        this.location.replaceState(n, ``, u);
      } else {
        let c = l(l({}, a), this.generateNgRouterState(o, this.browserPageId + 1, r));
        this.location.go(n, ``, c);
      }
    }
    restoreHistory(n, r = !1) {
      if (this.canceledNavigationResolution === `computed`) {
        let i = this.browserPageId,
          o = this.currentPageId - i;
        o !== 0
          ? this.location.historyGo(o)
          : this.getCurrentUrlTree() === n.finalUrl &&
            o === 0 &&
            (this.resetInternalState(n), this.resetUrlToCurrentUrlTree());
      } else
        this.canceledNavigationResolution === `replace` &&
          (r && this.resetInternalState(n), this.resetUrlToCurrentUrlTree());
    }
    resetInternalState({ finalUrl: n }) {
      ((this.routerState = this.stateMemento.routerState),
        (this.currentUrlTree = this.stateMemento.currentUrlTree),
        (this.rawUrlTree = this.urlHandlingStrategy.merge(
          this.currentUrlTree,
          n ?? this.rawUrlTree,
        )));
    }
    resetUrlToCurrentUrlTree() {
      this.location.replaceState(
        this.urlSerializer.serialize(this.getRawUrlTree()),
        ``,
        this.generateNgRouterState(this.lastSuccessfulId, this.currentPageId),
      );
    }
    generateNgRouterState(n, r, i) {
      return this.canceledNavigationResolution === `computed`
        ? l({ navigationId: n, ɵrouterPageId: r }, this.routerUrlState(i))
        : l({ navigationId: n }, this.routerUrlState(i));
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
function hm(t, e) {
  t.events
    .pipe(
      et((n) => n instanceof Rn || n instanceof Xt || n instanceof Wi || n instanceof cr),
      Y((n) =>
        n instanceof Rn || n instanceof cr
          ? 0
          : (
                n instanceof Xt
                  ? n.code === at.Redirect || n.code === at.SupersededByNewNavigation
                  : !1
              )
            ? 2
            : 1,
      ),
      et((n) => n !== 2),
      yt(1),
    )
    .subscribe(() => {
      e();
    });
}
var hs = (() => {
  class t {
    get currentUrlTree() {
      return this.stateManager.getCurrentUrlTree();
    }
    get rawUrlTree() {
      return this.stateManager.getRawUrlTree();
    }
    disposed = !1;
    nonRouterCurrentEntryChangeSubscription;
    console = v(xl);
    stateManager = v(Td);
    options = v(fs, { optional: !0 }) || {};
    pendingTasks = v(Kn);
    urlUpdateStrategy = this.options.urlUpdateStrategy || `deferred`;
    navigationTransitions = v(RI);
    urlSerializer = v(us);
    location = v(Ko);
    urlHandlingStrategy = v(Sd);
    injector = v(ve);
    _events = new ue();
    get events() {
      return this._events;
    }
    get routerState() {
      return this.stateManager.getRouterState();
    }
    navigated = !1;
    routeReuseStrategy = v(kI);
    injectorCleanup = v(OI, { optional: !0 });
    onSameUrlNavigation = this.options.onSameUrlNavigation || `ignore`;
    config = v(dc, { optional: !0 })?.flat() ?? [];
    componentInputBindingEnabled = !!v(uc, { optional: !0 });
    currentNavigation = this.navigationTransitions.currentNavigation.asReadonly();
    constructor() {
      (this.resetConfig(this.config),
        this.navigationTransitions.setupNavigations(this).subscribe({ error: (n) => {} }),
        this.subscribeToNavigationEvents());
    }
    eventsSubscription = new Ne();
    subscribeToNavigationEvents() {
      let n = this.navigationTransitions.events.subscribe((r) => {
        try {
          let i = this.navigationTransitions.currentTransition,
            o = F(this.navigationTransitions.currentNavigation);
          if (i !== null && o !== null) {
            if (
              (this.stateManager.handleRouterEvent(r, o),
              r instanceof Xt && r.code !== at.Redirect && r.code !== at.SupersededByNewNavigation)
            )
              this.navigated = !0;
            else if (r instanceof Rn)
              ((this.navigated = !0),
                this.injectorCleanup?.(this.routeReuseStrategy, this.routerState, this.config));
            else if (r instanceof os) {
              let s = r.navigationBehaviorOptions,
                a = this.urlHandlingStrategy.merge(r.url, i.currentRawUrl),
                c = l(
                  {
                    scroll: i.extras.scroll,
                    browserUrl: i.extras.browserUrl,
                    info: i.extras.info,
                    skipLocationChange: i.extras.skipLocationChange,
                    replaceUrl:
                      i.extras.replaceUrl || this.urlUpdateStrategy === `eager` || rF(i.source),
                  },
                  s,
                );
              this.scheduleNavigation(a, Xa, null, c, {
                resolve: i.resolve,
                reject: i.reject,
                promise: i.promise,
              });
            }
          }
          iP(r) && this._events.next(r);
        } catch (i) {
          this.navigationTransitions.transitionAbortWithErrorSubject.next(i);
        }
      });
      this.eventsSubscription.add(n);
    }
    resetRootComponentType(n) {
      ((this.routerState.root.component = n), (this.navigationTransitions.rootComponentType = n));
    }
    initialNavigation() {
      (this.setUpLocationChangeListener(),
        this.navigationTransitions.hasRequestedNavigation ||
          this.navigateToSyncWithBrowser(
            this.location.path(!0),
            Xa,
            this.stateManager.restoredState(),
            { replaceUrl: !0 },
          ));
    }
    setUpLocationChangeListener() {
      this.nonRouterCurrentEntryChangeSubscription ??=
        this.stateManager.registerNonRouterCurrentEntryChangeListener((n, r, i, o) => {
          this.navigateToSyncWithBrowser(n, i, r, o);
        });
    }
    navigateToSyncWithBrowser(n, r, i, o) {
      let s = i?.navigationId ? i : null,
        a = i?.ɵrouterUrl ?? n;
      if ((i?.ɵrouterUrl && (o = m(l({}, o), { browserUrl: n })), i)) {
        let u = l({}, i);
        (delete u.navigationId,
          delete u.ɵrouterPageId,
          delete u.ɵrouterUrl,
          Object.keys(u).length !== 0 && (o.state = u));
      }
      let c = this.parseUrl(a);
      this.scheduleNavigation(c, r, s, o).catch((u) => {
        this.disposed || this.injector.get(_t)(u);
      });
    }
    get url() {
      return this.serializeUrl(this.currentUrlTree);
    }
    getCurrentNavigation() {
      return F(this.navigationTransitions.currentNavigation);
    }
    get lastSuccessfulNavigation() {
      return this.navigationTransitions.lastSuccessfulNavigation;
    }
    resetConfig(n) {
      ((this.config = n.map(um)), (this.navigated = !1));
    }
    ngOnDestroy() {
      this.dispose();
    }
    dispose() {
      (this._events.unsubscribe(),
        this.navigationTransitions.complete(),
        this.nonRouterCurrentEntryChangeSubscription?.unsubscribe(),
        (this.nonRouterCurrentEntryChangeSubscription = void 0),
        (this.disposed = !0),
        this.eventsSubscription.unsubscribe());
    }
    createUrlTree(n, r = {}) {
      let {
          relativeTo: i,
          queryParams: o,
          fragment: s,
          queryParamsHandling: a,
          preserveFragment: c,
        } = r,
        u = c ? this.currentUrlTree.fragment : s,
        l$4 = null;
      switch (a ?? this.options.defaultQueryParamsHandling) {
        case `merge`:
          l$4 = l(l({}, this.currentUrlTree.queryParams), o);
          break;
        case `preserve`:
          l$4 = this.currentUrlTree.queryParams;
          break;
        default:
          l$4 = o || null;
      }
      l$4 !== null && (l$4 = this.removeEmptyProps(l$4));
      let d;
      try {
        d = iI(i ? i.snapshot : this.routerState.snapshot.root);
      } catch {
        ((typeof n[0] != `string` || n[0][0] !== `/`) && (n = []), (d = this.currentUrlTree.root));
      }
      return oI(d, n, l$4, u ?? null, this.urlSerializer);
    }
    navigateByUrl(n, r = { skipLocationChange: !1 }) {
      let i = Vr(n) ? n : this.parseUrl(n),
        o = this.urlHandlingStrategy.merge(i, this.rawUrlTree);
      return this.scheduleNavigation(o, Xa, null, r);
    }
    navigate(n, r = { skipLocationChange: !1 }) {
      return (sF(n), this.navigateByUrl(this.createUrlTree(n, r), r));
    }
    serializeUrl(n) {
      return this.urlSerializer.serialize(n);
    }
    parseUrl(n) {
      try {
        return this.urlSerializer.parse(n);
      } catch {
        return (this.console.warn(En(4018, !1)), this.urlSerializer.parse(`/`));
      }
    }
    isActive(n, r) {
      let i;
      if ((r === !0 ? (i = l({}, Zw)) : r === !1 ? (i = l({}, Wg)) : (i = l(l({}, Wg), r)), Vr(n)))
        return Lw(this.currentUrlTree, n, i);
      let o = this.parseUrl(n);
      return Lw(this.currentUrlTree, o, i);
    }
    removeEmptyProps(n) {
      return Object.entries(n).reduce((r, [i, o]) => (o != null && (r[i] = o), r), {});
    }
    scheduleNavigation(n, r, i, o, s) {
      if (this.disposed) return Promise.resolve(!1);
      let a, c, u;
      s
        ? ((a = s.resolve), (c = s.reject), (u = s.promise))
        : (u = new Promise((d, f) => {
            ((a = d), (c = f));
          }));
      let l = this.pendingTasks.add();
      return (
        hm(this, () => {
          queueMicrotask(() => this.pendingTasks.remove(l));
        }),
        this.navigationTransitions.handleNavigationRequest({
          source: r,
          restoredState: i,
          currentUrlTree: this.currentUrlTree,
          currentRawUrl: this.currentUrlTree,
          rawUrl: n,
          extras: o,
          resolve: a,
          reject: c,
          promise: u,
          currentSnapshot: this.routerState.snapshot,
          currentRouterState: this.routerState,
        }),
        u.catch(Promise.reject.bind(Promise))
      );
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
function sF(t) {
  for (let e = 0; e < t.length; e++) if (t[e] == null) throw new I(4008, !1);
}
var uF = (() => {
  class t {
    router = v(hs);
    stateManager = v(Td);
    fragment = H(``);
    queryParams = H({});
    path = H(``);
    serializer = v(us);
    constructor() {
      (this.updateState(),
        this.router.events?.subscribe((n) => {
          n instanceof Rn && this.updateState();
        }));
    }
    updateState() {
      let { fragment: n, root: r, queryParams: i } = this.stateManager.getCurrentUrlTree();
      (this.fragment.set(n),
        this.queryParams.set(i),
        this.path.set(this.serializer.serialize(new kt(r))));
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵprov = pe({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var PI = (() => {
  class t {
    router;
    route;
    tabIndexAttribute;
    renderer;
    el;
    locationStrategy;
    hrefAttributeValue = v(new Pl(`href`), { optional: !0 });
    reactiveHref = Oa(() =>
      this.isAnchorElement ? this.computeHref(this._urlTree()) : this.hrefAttributeValue,
    );
    get href() {
      return F(this.reactiveHref);
    }
    set href(n) {
      this.reactiveHref.set(n);
    }
    set target(n) {
      this._target.set(n);
    }
    get target() {
      return F(this._target);
    }
    _target = H(void 0);
    set queryParams(n) {
      this._queryParams.set(n);
    }
    get queryParams() {
      return F(this._queryParams);
    }
    _queryParams = H(void 0, { equal: () => !1 });
    set fragment(n) {
      this._fragment.set(n);
    }
    get fragment() {
      return F(this._fragment);
    }
    _fragment = H(void 0);
    set queryParamsHandling(n) {
      this._queryParamsHandling.set(n);
    }
    get queryParamsHandling() {
      return F(this._queryParamsHandling);
    }
    _queryParamsHandling = H(void 0);
    set state(n) {
      this._state.set(n);
    }
    get state() {
      return F(this._state);
    }
    _state = H(void 0, { equal: () => !1 });
    set info(n) {
      this._info.set(n);
    }
    get info() {
      return F(this._info);
    }
    _info = H(void 0, { equal: () => !1 });
    set relativeTo(n) {
      this._relativeTo.set(n);
    }
    get relativeTo() {
      return F(this._relativeTo);
    }
    _relativeTo = H(void 0);
    set preserveFragment(n) {
      this._preserveFragment.set(n);
    }
    get preserveFragment() {
      return F(this._preserveFragment);
    }
    _preserveFragment = H(!1);
    set skipLocationChange(n) {
      this._skipLocationChange.set(n);
    }
    get skipLocationChange() {
      return F(this._skipLocationChange);
    }
    _skipLocationChange = H(!1);
    set replaceUrl(n) {
      this._replaceUrl.set(n);
    }
    get replaceUrl() {
      return F(this._replaceUrl);
    }
    _replaceUrl = H(!1);
    browserUrl = tr(void 0);
    isAnchorElement;
    onChanges = new ue();
    applicationErrorHandler = v(_t);
    options = v(fs, { optional: !0 });
    reactiveRouterState = v(uF);
    constructor(n, r, i, o, s, a) {
      ((this.router = n),
        (this.route = r),
        (this.tabIndexAttribute = i),
        (this.renderer = o),
        (this.el = s),
        (this.locationStrategy = a));
      let c = s.nativeElement.tagName?.toLowerCase();
      this.isAnchorElement =
        c === `a` ||
        c === `area` ||
        !!(
          typeof customElements == `object` &&
          customElements.get(c)?.observedAttributes?.includes?.(`href`)
        );
    }
    setTabIndexIfNotOnNativeEl(n) {
      this.tabIndexAttribute != null ||
        this.isAnchorElement ||
        this.applyAttributeValue(`tabindex`, n);
    }
    ngOnChanges(n) {
      this.onChanges.next(this);
    }
    routerLinkInput = H(null);
    set routerLink(n) {
      n == null
        ? (this.routerLinkInput.set(null), this.setTabIndexIfNotOnNativeEl(null))
        : (Vr(n)
            ? this.routerLinkInput.set(n)
            : this.routerLinkInput.set(Array.isArray(n) ? n : [n]),
          this.setTabIndexIfNotOnNativeEl(`0`));
    }
    onClick(n, r, i, o, s) {
      let a = this._urlTree();
      if (
        a === null ||
        (this.isAnchorElement &&
          (n !== 0 ||
            r ||
            i ||
            o ||
            s ||
            (typeof this.target == `string` && this.target != `_self`)))
      )
        return !0;
      let c = this.browserUrl(),
        u = l(
          {
            skipLocationChange: this.skipLocationChange,
            replaceUrl: this.replaceUrl,
            state: this.state,
            info: this.info,
          },
          c !== void 0 && { browserUrl: c },
        );
      return (
        this.router.navigateByUrl(a, u)?.catch((l) => {
          this.applicationErrorHandler(l);
        }),
        !this.isAnchorElement
      );
    }
    ngOnDestroy() {}
    applyAttributeValue(n, r) {
      let i = this.renderer,
        o = this.el.nativeElement;
      r !== null ? i.setAttribute(o, n, r) : i.removeAttribute(o, n);
    }
    _urlTree = oe(
      () => {
        (this.reactiveRouterState.path(),
          this._preserveFragment() && this.reactiveRouterState.fragment());
        let n = (i) => i === `preserve` || i === `merge`;
        (n(this._queryParamsHandling()) || n(this.options?.defaultQueryParamsHandling)) &&
          this.reactiveRouterState.queryParams();
        let r = this.routerLinkInput();
        return r === null || !this.router.createUrlTree
          ? null
          : Vr(r)
            ? r
            : this.router.createUrlTree(r, {
                relativeTo: this._relativeTo() !== void 0 ? this._relativeTo() : this.route,
                queryParams: this._queryParams(),
                fragment: this._fragment(),
                queryParamsHandling: this._queryParamsHandling(),
                preserveFragment: this._preserveFragment(),
              });
      },
      { equal: (n, r) => this.computeHref(n) === this.computeHref(r) },
    );
    get urlTree() {
      return F(this._urlTree);
    }
    computeHref(n) {
      return n !== null && this.locationStrategy
        ? (this.locationStrategy?.prepareExternalUrl(this.router.serializeUrl(n)) ?? ``)
        : null;
    }
    static ɵfac = function (r) {
      return new (r || t)(te(hs), te(ur), _a(`tabindex`), te(An), te(it), te(Zo));
    };
    static ɵdir = ot({
      type: t,
      selectors: [[``, `routerLink`, ``]],
      hostVars: 2,
      hostBindings: function (r, i) {
        (r & 1 &&
          zo(`click`, function (s) {
            return i.onClick(s.button, s.ctrlKey, s.shiftKey, s.altKey, s.metaKey);
          }),
          r & 2 && kr(`href`, i.reactiveHref(), Dp)(`target`, i._target()));
      },
      inputs: {
        target: `target`,
        queryParams: `queryParams`,
        fragment: `fragment`,
        queryParamsHandling: `queryParamsHandling`,
        state: `state`,
        info: `info`,
        relativeTo: `relativeTo`,
        preserveFragment: [2, `preserveFragment`, `preserveFragment`, Ui],
        skipLocationChange: [2, `skipLocationChange`, `skipLocationChange`, Ui],
        replaceUrl: [2, `replaceUrl`, `replaceUrl`, Ui],
        browserUrl: [1, `browserUrl`],
        routerLink: `routerLink`,
      },
      features: [Xn],
    });
  }
  return t;
})();
var lF = new E(``);
function dF(t, ...e) {
  return sn([
    { provide: dc, multi: !0, useValue: t },
    { provide: ur, useFactory: fF },
    { provide: Ma, multi: !0, useFactory: hF },
    e.map((n) => n.ɵproviders),
  ]);
}
function fF() {
  return v(hs).routerState.root;
}
function FI(t, e) {
  return { ɵkind: t, ɵproviders: e };
}
function hF() {
  let t = v(He);
  return (e) => {
    let n = t.get(Or);
    if (e !== n.components[0]) return;
    let r = t.get(hs),
      i = t.get(pF);
    (t.get(gF) === 1 && r.initialNavigation(),
      t.get(mF, null, { optional: !0 })?.setUpPreloading(),
      t.get(lF, null, { optional: !0 })?.init(),
      r.resetRootComponentType(n.componentTypes[0]),
      i.closed || (i.next(), i.complete(), i.unsubscribe()));
  };
}
var pF = new E(``, { factory: () => new ue() });
var gF = new E(``, { factory: () => 1 });
var mF = new E(``);
function vF(t = {}) {
  return FI(8, [{ provide: uc, useFactory: () => new hI(t) }]);
}
function yF(t) {
  fn(`NgRouterViewTransitions`);
  return FI(9, [
    { provide: dm, useValue: AI },
    { provide: fm, useValue: l({ skipNextTransition: !!t?.skipInitialTransition }, t) },
  ]);
}
function fc(t) {
  t || (t = v(J));
  let e = new k((n) => {
    if (t.destroyed) {
      n.next();
      return;
    }
    return t.onDestroy(n.next.bind(n));
  });
  return (n) => n.pipe(on(e));
}
var pm = class {
  source;
  destroyed = !1;
  destroyRef = v(J);
  constructor(e) {
    ((this.source = e),
      this.destroyRef.onDestroy(() => {
        this.destroyed = !0;
      }));
  }
  subscribe(e) {
    if (this.destroyed) throw new I(953, !1);
    let n = this.source.pipe(fc(this.destroyRef)).subscribe({ next: (r) => e(r) });
    return { unsubscribe: () => n.unsubscribe() };
  }
};
function PK(t, e) {
  return new pm(t);
}
function FK(t, e) {
  let n = e?.injector ?? v(He),
    r = new ti(1),
    i = Yt(
      () => {
        let o;
        try {
          o = t();
        } catch (s) {
          F(() => r.error(s));
          return;
        }
        F(() => r.next(o));
      },
      { injector: n, manualCleanup: !0 },
    );
  return (
    n.get(J).onDestroy(() => {
      (i.destroy(), r.complete());
    }),
    r.asObservable()
  );
}
function LI(t, e) {
  let r = !e?.manualCleanup ? (e?.injector?.get(J) ?? v(J)) : null,
    i = _F(e?.equal),
    o;
  e?.requireSync
    ? (o = H({ kind: 0 }, { equal: i }))
    : (o = H({ kind: 1, value: e?.initialValue }, { equal: i }));
  let s,
    a = t.subscribe({
      next: (c) => o.set({ kind: 1, value: c }),
      error: (c) => {
        (o.set({ kind: 2, error: c }), s?.());
      },
      complete: () => {
        s?.();
      },
    });
  if (e?.requireSync && o().kind === 0) throw new I(601, !1);
  return (
    (s = r?.onDestroy(a.unsubscribe.bind(a))),
    oe(
      () => {
        let c = o();
        switch (c.kind) {
          case 1:
            return c.value;
          case 2:
            throw c.error;
          case 0:
            throw new I(601, !1);
        }
      },
      { equal: e?.equal },
    )
  );
}
function _F(t = Object.is) {
  return (e, n) => e.kind === 1 && n.kind === 1 && t(e.value, n.value);
}
function LK(t) {
  return wC(
    m(l({}, t), {
      loader: void 0,
      stream: (e) => {
        let n,
          r = !1,
          i = H({ value: void 0 }),
          { resolve: o, promise: s } = ra(),
          a = !1;
        function c() {
          a || ((a = !0), o(i));
        }
        let u = () => {
          ((r = !0), n?.unsubscribe(), e.abortSignal.removeEventListener(`abort`, u), c());
        };
        e.abortSignal.addEventListener(`abort`, u);
        function l(f) {
          (i.set(f), c());
        }
        let d = t.stream;
        if (d === void 0) throw new I(990, !1);
        return (
          (n = d(e).subscribe({
            next: (f) => l({ value: f }),
            error: (f) => {
              (l({ error: ka(f) }), e.abortSignal.removeEventListener(`abort`, u));
            },
            complete: () => {
              (a || l({ error: new I(991, !1) }), e.abortSignal.removeEventListener(`abort`, u));
            },
          })),
          r && n.unsubscribe(),
          a ? i : s
        );
      },
    }),
  );
}
var WI = (() => {
  class t {
    _renderer;
    _elementRef;
    onChange = (n) => {};
    onTouched = () => {};
    constructor(n, r) {
      ((this._renderer = n), (this._elementRef = r));
    }
    setProperty(n, r) {
      this._renderer.setProperty(this._elementRef.nativeElement, n, r);
    }
    registerOnTouched(n) {
      this.onTouched = n;
    }
    registerOnChange(n) {
      this.onChange = n;
    }
    setDisabledState(n) {
      this.setProperty(`disabled`, n);
    }
    static ɵfac = function (r) {
      return new (r || t)(te(An), te(it));
    };
    static ɵdir = ot({ type: t });
  }
  return t;
})();
var DF = (() => {
  class t extends WI {
    static ɵfac = (() => {
      let n;
      return function (i) {
        return (n || (n = ya(t)))(i || t);
      };
    })();
    static ɵdir = ot({ type: t, features: [ji] });
  }
  return t;
})();
var qI = new E(``);
var EF = { provide: qI, useExisting: Ir(() => YI), multi: !0 };
function CF() {
  let t = Rt() ? Rt().getUserAgent() : ``;
  return /android (\d+)/.test(t.toLowerCase());
}
var wF = new E(``);
var YI = (() => {
  class t extends WI {
    _compositionMode;
    _composing = !1;
    constructor(n, r, i) {
      (super(n, r), (this._compositionMode = i), (this._compositionMode ??= !CF()));
    }
    writeValue(n) {
      let r = n ?? ``;
      this.setProperty(`value`, r);
    }
    _handleInput(n) {
      (!this._compositionMode || (this._compositionMode && !this._composing)) && this.onChange(n);
    }
    _compositionStart() {
      this._composing = !0;
    }
    _compositionEnd(n) {
      ((this._composing = !1), this._compositionMode && this.onChange(n));
    }
    static ɵfac = function (r) {
      return new (r || t)(te(An), te(it), te(wF, 8));
    };
    static ɵdir = ot({
      type: t,
      selectors: [
        [`input`, `formControlName`, ``, 3, `type`, `checkbox`, 3, `ngNoCva`, ``],
        [`textarea`, `formControlName`, ``, 3, `ngNoCva`, ``],
        [`input`, `formControl`, ``, 3, `type`, `checkbox`, 3, `ngNoCva`, ``],
        [`textarea`, `formControl`, ``, 3, `ngNoCva`, ``],
        [`input`, `ngModel`, ``, 3, `type`, `checkbox`, 3, `ngNoCva`, ``],
        [`textarea`, `ngModel`, ``, 3, `ngNoCva`, ``],
        [``, `ngDefaultControl`, ``],
      ],
      hostBindings: function (r, i) {
        r & 1 &&
          zo(`input`, function (s) {
            return i._handleInput(s.target.value);
          })(`blur`, function () {
            return i.onTouched();
          })(`compositionstart`, function () {
            return i._compositionStart();
          })(`compositionend`, function (s) {
            return i._compositionEnd(s.target.value);
          });
      },
      standalone: !1,
      features: [Na([EF]), ji],
    });
  }
  return t;
})();
function Dm(t) {
  return t == null || Em(t) === 0;
}
function Em(t) {
  return t == null
    ? null
    : Array.isArray(t) || typeof t == `string`
      ? t.length
      : t instanceof Set
        ? t.size
        : null;
}
var ZI = new E(``);
var IF = new E(``);
var bF =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
var gm = class {
  static min(e) {
    return SF(e);
  }
  static max(e) {
    return TF(e);
  }
  static required(e) {
    return KI(e);
  }
  static requiredTrue(e) {
    return MF(e);
  }
  static email(e) {
    return AF(e);
  }
  static minLength(e) {
    return NF(e);
  }
  static maxLength(e) {
    return xF(e);
  }
  static pattern(e) {
    return RF(e);
  }
  static nullValidator(e) {
    return Ad();
  }
  static compose(e) {
    return nb(e);
  }
  static composeAsync(e) {
    return ib(e);
  }
};
function SF(t) {
  return (e) => {
    if (e.value == null || t == null) return null;
    let n = parseFloat(e.value);
    return !isNaN(n) && n < t ? { min: { min: t, actual: e.value } } : null;
  };
}
function TF(t) {
  return (e) => {
    if (e.value == null || t == null) return null;
    let n = parseFloat(e.value);
    return !isNaN(n) && n > t ? { max: { max: t, actual: e.value } } : null;
  };
}
function KI(t) {
  return Dm(t.value) ? { required: !0 } : null;
}
function MF(t) {
  return t.value === !0 ? null : { required: !0 };
}
function AF(t) {
  return Dm(t.value) || bF.test(t.value) ? null : { email: !0 };
}
function NF(t) {
  return (e) => {
    let n = e.value?.length ?? Em(e.value);
    return n === null || n === 0
      ? null
      : n < t
        ? { minlength: { requiredLength: t, actualLength: n } }
        : null;
  };
}
function xF(t) {
  return (e) => {
    let n = e.value?.length ?? Em(e.value);
    return n !== null && n > t ? { maxlength: { requiredLength: t, actualLength: n } } : null;
  };
}
function RF(t) {
  if (!t) return Ad;
  let e, n;
  return (
    typeof t == `string`
      ? ((n = ``),
        t.charAt(0) !== `^` && (n += `^`),
        (n += t),
        t.charAt(t.length - 1) !== `$` && (n += `$`),
        (e = new RegExp(n)))
      : ((n = t.toString()), (e = t)),
    (r) => {
      if (Dm(r.value)) return null;
      let i = r.value;
      return e.test(i) ? null : { pattern: { requiredPattern: n, actualValue: i } };
    }
  );
}
function Ad(t) {
  return null;
}
function QI(t) {
  return t != null;
}
function XI(t) {
  return er(t) ? _e(t) : t;
}
function JI(t) {
  let e = {};
  return (
    t.forEach((n) => {
      e = n != null ? l(l({}, e), n) : e;
    }),
    Object.keys(e).length === 0 ? null : e
  );
}
function eb(t, e) {
  return e.map((n) => n(t));
}
function OF(t) {
  return !t.validate;
}
function tb(t) {
  return t.map((e) => (OF(e) ? e : (n) => e.validate(n)));
}
function nb(t) {
  if (!t) return null;
  let e = t.filter(QI);
  return e.length == 0
    ? null
    : function (n) {
        return JI(eb(n, e));
      };
}
function rb(t) {
  return t != null ? nb(tb(t)) : null;
}
function ib(t) {
  if (!t) return null;
  let e = t.filter(QI);
  return e.length == 0
    ? null
    : function (n) {
        return df(eb(n, e).map(XI)).pipe(Y(JI));
      };
}
function ob(t) {
  return t != null ? ib(tb(t)) : null;
}
function VI(t, e) {
  return t === null ? [e] : Array.isArray(t) ? [...t, e] : [t, e];
}
function kF(t) {
  return t._rawValidators;
}
function PF(t) {
  return t._rawAsyncValidators;
}
function mm(t) {
  return t ? (Array.isArray(t) ? t : [t]) : [];
}
function Nd(t, e) {
  return Array.isArray(t) ? t.includes(e) : t === e;
}
function jI(t, e) {
  let n = mm(e);
  return (
    mm(t).forEach((i) => {
      Nd(n, i) || n.push(i);
    }),
    n
  );
}
function UI(t, e) {
  return mm(e).filter((n) => !Nd(t, n));
}
var xd = class {
  get value() {
    return this.control ? this.control.value : null;
  }
  get valid() {
    return this.control ? this.control.valid : null;
  }
  get invalid() {
    return this.control ? this.control.invalid : null;
  }
  get pending() {
    return this.control ? this.control.pending : null;
  }
  get disabled() {
    return this.control ? this.control.disabled : null;
  }
  get enabled() {
    return this.control ? this.control.enabled : null;
  }
  get errors() {
    return this.control ? this.control.errors : null;
  }
  get pristine() {
    return this.control ? this.control.pristine : null;
  }
  get dirty() {
    return this.control ? this.control.dirty : null;
  }
  get touched() {
    return this.control ? this.control.touched : null;
  }
  get status() {
    return this.control ? this.control.status : null;
  }
  get untouched() {
    return this.control ? this.control.untouched : null;
  }
  get statusChanges() {
    return this.control ? this.control.statusChanges : null;
  }
  get valueChanges() {
    return this.control ? this.control.valueChanges : null;
  }
  get path() {
    return null;
  }
  _composedValidatorFn;
  _composedAsyncValidatorFn;
  _rawValidators = [];
  _rawAsyncValidators = [];
  _setValidators(e) {
    ((this._rawValidators = e || []), (this._composedValidatorFn = rb(this._rawValidators)));
  }
  _setAsyncValidators(e) {
    ((this._rawAsyncValidators = e || []),
      (this._composedAsyncValidatorFn = ob(this._rawAsyncValidators)));
  }
  get validator() {
    return this._composedValidatorFn || null;
  }
  get asyncValidator() {
    return this._composedAsyncValidatorFn || null;
  }
  _onDestroyCallbacks = [];
  _registerOnDestroy(e) {
    this._onDestroyCallbacks.push(e);
  }
  _invokeOnDestroyCallbacks() {
    (this._onDestroyCallbacks.forEach((e) => e()), (this._onDestroyCallbacks = []));
  }
  reset(e = void 0) {
    this.control?.reset(e);
  }
  hasError(e, n) {
    return this.control ? this.control.hasError(e, n) : !1;
  }
  getError(e, n) {
    return this.control ? this.control.getError(e, n) : null;
  }
};
var vm = class extends xd {
  name;
  get formDirective() {
    return null;
  }
  get path() {
    return null;
  }
};
var hc = `VALID`;
var Md = `INVALID`;
var ps = `PENDING`;
var pc = `DISABLED`;
var Yi = class {};
var Rd = class extends Yi {
  value;
  source;
  constructor(e, n) {
    (super(), (this.value = e), (this.source = n));
  }
};
var gc = class extends Yi {
  pristine;
  source;
  constructor(e, n) {
    (super(), (this.pristine = e), (this.source = n));
  }
};
var mc = class extends Yi {
  touched;
  source;
  constructor(e, n) {
    (super(), (this.touched = e), (this.source = n));
  }
};
var gs = class extends Yi {
  status;
  source;
  constructor(e, n) {
    (super(), (this.status = e), (this.source = n));
  }
};
var vc = class extends Yi {
  source;
  constructor(e) {
    (super(), (this.source = e));
  }
};
function FF(t) {
  return (Od(t) ? t.validators : t) || null;
}
function LF(t) {
  return Array.isArray(t) ? rb(t) : t || null;
}
function VF(t, e) {
  return (Od(e) ? e.asyncValidators : t) || null;
}
function jF(t) {
  return Array.isArray(t) ? ob(t) : t || null;
}
function Od(t) {
  return t != null && !Array.isArray(t) && typeof t == `object`;
}
var ym = class {
  _pendingDirty = !1;
  _hasOwnPendingAsyncValidator = null;
  _pendingTouched = !1;
  _onCollectionChange = () => {};
  _updateOn;
  _hasRequired = H(!1);
  _parent = null;
  _asyncValidationSubscription;
  _composedValidatorFn;
  _composedAsyncValidatorFn;
  _rawValidators;
  _rawAsyncValidators;
  value;
  constructor(e, n) {
    (this._assignValidators(e), this._assignAsyncValidators(n));
  }
  get validator() {
    return this._composedValidatorFn;
  }
  set validator(e) {
    ((this._rawValidators = this._composedValidatorFn = e), this._updateHasRequiredValidator());
  }
  get asyncValidator() {
    return this._composedAsyncValidatorFn;
  }
  set asyncValidator(e) {
    this._rawAsyncValidators = this._composedAsyncValidatorFn = e;
  }
  get parent() {
    return this._parent;
  }
  get status() {
    return F(this.statusReactive);
  }
  set status(e) {
    F(() => this.statusReactive.set(e));
  }
  _status = oe(() => this.statusReactive());
  statusReactive = H(void 0);
  get valid() {
    return this.status === hc;
  }
  get invalid() {
    return this.status === Md;
  }
  get pending() {
    return this.status === ps;
  }
  get disabled() {
    return this.status === pc;
  }
  get enabled() {
    return this.status !== pc;
  }
  errors;
  get pristine() {
    return F(this.pristineReactive);
  }
  set pristine(e) {
    F(() => this.pristineReactive.set(e));
  }
  _pristine = oe(() => this.pristineReactive());
  pristineReactive = H(!0);
  get dirty() {
    return !this.pristine;
  }
  get touched() {
    return F(this.touchedReactive);
  }
  set touched(e) {
    F(() => this.touchedReactive.set(e));
  }
  _touched = oe(() => this.touchedReactive());
  touchedReactive = H(!1);
  get untouched() {
    return !this.touched;
  }
  _events = new ue();
  events = this._events.asObservable();
  valueChanges;
  statusChanges;
  get updateOn() {
    return this._updateOn ? this._updateOn : this.parent ? this.parent.updateOn : `change`;
  }
  setValidators(e) {
    this._assignValidators(e);
  }
  setAsyncValidators(e) {
    this._assignAsyncValidators(e);
  }
  addValidators(e) {
    this.setValidators(jI(e, this._rawValidators));
  }
  addAsyncValidators(e) {
    this.setAsyncValidators(jI(e, this._rawAsyncValidators));
  }
  removeValidators(e) {
    this.setValidators(UI(e, this._rawValidators));
  }
  removeAsyncValidators(e) {
    this.setAsyncValidators(UI(e, this._rawAsyncValidators));
  }
  hasValidator(e) {
    return Nd(this._rawValidators, e);
  }
  hasAsyncValidator(e) {
    return Nd(this._rawAsyncValidators, e);
  }
  clearValidators() {
    this.validator = null;
  }
  clearAsyncValidators() {
    this.asyncValidator = null;
  }
  markAsTouched(e = {}) {
    let n = this.touched === !1;
    this.touched = !0;
    let r = e.sourceControl ?? this;
    (e.onlySelf || this._parent?.markAsTouched(m(l({}, e), { sourceControl: r })),
      n && e.emitEvent !== !1 && this._events.next(new mc(!0, r)));
  }
  markAllAsDirty(e = {}) {
    (this.markAsDirty({ onlySelf: !0, emitEvent: e.emitEvent, sourceControl: this }),
      this._forEachChild((n) => n.markAllAsDirty(e)));
  }
  markAllAsTouched(e = {}) {
    (this.markAsTouched({ onlySelf: !0, emitEvent: e.emitEvent, sourceControl: this }),
      this._forEachChild((n) => n.markAllAsTouched(e)));
  }
  markAsUntouched(e = {}) {
    let n = this.touched === !0;
    ((this.touched = !1), (this._pendingTouched = !1));
    let r = e.sourceControl ?? this;
    (this._forEachChild((i) => {
      i.markAsUntouched({ onlySelf: !0, emitEvent: e.emitEvent, sourceControl: r });
    }),
      e.onlySelf || this._parent?._updateTouched(e, r),
      n && e.emitEvent !== !1 && this._events.next(new mc(!1, r)));
  }
  markAsDirty(e = {}) {
    let n = this.pristine === !0;
    this.pristine = !1;
    let r = e.sourceControl ?? this;
    (e.onlySelf || this._parent?.markAsDirty(m(l({}, e), { sourceControl: r })),
      n && e.emitEvent !== !1 && this._events.next(new gc(!1, r)));
  }
  markAsPristine(e = {}) {
    let n = this.pristine === !1;
    ((this.pristine = !0), (this._pendingDirty = !1));
    let r = e.sourceControl ?? this;
    (this._forEachChild((i) => {
      i.markAsPristine({ onlySelf: !0, emitEvent: e.emitEvent });
    }),
      e.onlySelf || this._parent?._updatePristine(e, r),
      n && e.emitEvent !== !1 && this._events.next(new gc(!0, r)));
  }
  markAsPending(e = {}) {
    this.status = ps;
    let n = e.sourceControl ?? this;
    (e.emitEvent !== !1 &&
      (this._events.next(new gs(this.status, n)), this.statusChanges.emit(this.status)),
      e.onlySelf || this._parent?.markAsPending(m(l({}, e), { sourceControl: n })));
  }
  disable(e = {}) {
    let n = this._parentMarkedDirty(e.onlySelf);
    ((this.status = pc),
      (this.errors = null),
      this._forEachChild((i) => {
        i.disable(m(l({}, e), { onlySelf: !0 }));
      }),
      this._updateValue());
    let r = e.sourceControl ?? this;
    (e.emitEvent !== !1 &&
      (this._events.next(new Rd(this.value, r)),
      this._events.next(new gs(this.status, r)),
      this.valueChanges.emit(this.value),
      this.statusChanges.emit(this.status)),
      this._updateAncestors(m(l({}, e), { skipPristineCheck: n }), this),
      this._onDisabledChange.forEach((i) => i(!0)));
  }
  enable(e = {}) {
    let n = this._parentMarkedDirty(e.onlySelf);
    ((this.status = hc),
      this._forEachChild((r) => {
        r.enable(m(l({}, e), { onlySelf: !0 }));
      }),
      this.updateValueAndValidity({ onlySelf: !0, emitEvent: e.emitEvent }),
      this._updateAncestors(m(l({}, e), { skipPristineCheck: n }), this),
      this._onDisabledChange.forEach((r) => r(!1)));
  }
  _updateAncestors(e, n) {
    e.onlySelf ||
      (this._parent?.updateValueAndValidity(e),
      e.skipPristineCheck || this._parent?._updatePristine({}, n),
      this._parent?._updateTouched({}, n));
  }
  setParent(e) {
    this._parent = e;
  }
  getRawValue() {
    return this.value;
  }
  updateValueAndValidity(e = {}) {
    if ((this._setInitialStatus(), this._updateValue(), this.enabled)) {
      let r = this._cancelExistingSubscription();
      ((this.errors = this._runValidator()),
        (this.status = this._calculateStatus()),
        (this.status === hc || this.status === ps) && this._runAsyncValidator(r, e.emitEvent));
    }
    let n = e.sourceControl ?? this;
    (e.emitEvent !== !1 &&
      (this._events.next(new Rd(this.value, n)),
      this._events.next(new gs(this.status, n)),
      this.valueChanges.emit(this.value),
      this.statusChanges.emit(this.status)),
      e.onlySelf || this._parent?.updateValueAndValidity(m(l({}, e), { sourceControl: n })));
  }
  _updateTreeValidity(e = { emitEvent: !0 }) {
    (this._forEachChild((n) => n._updateTreeValidity(e)),
      this.updateValueAndValidity({ onlySelf: !0, emitEvent: e.emitEvent }));
  }
  _setInitialStatus() {
    this.status = this._allControlsDisabled() ? pc : hc;
  }
  _runValidator() {
    return this.validator ? this.validator(this) : null;
  }
  _runAsyncValidator(e, n) {
    if (this.asyncValidator) {
      ((this.status = ps),
        (this._hasOwnPendingAsyncValidator = { emitEvent: n !== !1, shouldHaveEmitted: e !== !1 }));
      let r = XI(this.asyncValidator(this));
      this._asyncValidationSubscription = r.subscribe((i) => {
        ((this._hasOwnPendingAsyncValidator = null),
          this.setErrors(i, { emitEvent: n, shouldHaveEmitted: e }));
      });
    }
  }
  _cancelExistingSubscription() {
    if (this._asyncValidationSubscription) {
      this._asyncValidationSubscription.unsubscribe();
      let e =
        (this._hasOwnPendingAsyncValidator?.emitEvent ||
          this._hasOwnPendingAsyncValidator?.shouldHaveEmitted) ??
        !1;
      return ((this._hasOwnPendingAsyncValidator = null), e);
    }
    return !1;
  }
  setErrors(e, n = {}) {
    ((this.errors = e), this._updateControlsErrors(n.emitEvent !== !1, this, n.shouldHaveEmitted));
  }
  get(e) {
    let n = e;
    return n == null || (Array.isArray(n) || (n = n.split(`.`)), n.length === 0)
      ? null
      : n.reduce((r, i) => r && r._find(i), this);
  }
  getError(e, n) {
    let r = n ? this.get(n) : this;
    return r?.errors ? r.errors[e] : null;
  }
  hasError(e, n) {
    return !!this.getError(e, n);
  }
  get root() {
    let e = this;
    for (; e._parent;) e = e._parent;
    return e;
  }
  _updateControlsErrors(e, n, r) {
    ((this.status = this._calculateStatus()),
      e && this.statusChanges.emit(this.status),
      (e || r) && this._events.next(new gs(this.status, n)),
      this._parent && this._parent._updateControlsErrors(e, n, r));
  }
  _initObservables() {
    ((this.valueChanges = new Ue()), (this.statusChanges = new Ue()));
  }
  _calculateStatus() {
    return this._allControlsDisabled()
      ? pc
      : this.errors
        ? Md
        : this._hasOwnPendingAsyncValidator || this._anyControlsHaveStatus(ps)
          ? ps
          : this._anyControlsHaveStatus(Md)
            ? Md
            : hc;
  }
  _anyControlsHaveStatus(e) {
    return this._anyControls((n) => n.status === e);
  }
  _anyControlsDirty() {
    return this._anyControls((e) => e.dirty);
  }
  _anyControlsTouched() {
    return this._anyControls((e) => e.touched);
  }
  _updatePristine(e, n) {
    let r = !this._anyControlsDirty(),
      i = this.pristine !== r;
    ((this.pristine = r),
      e.onlySelf || this._parent?._updatePristine(e, n),
      i && this._events.next(new gc(this.pristine, n)));
  }
  _updateTouched(e = {}, n) {
    ((this.touched = this._anyControlsTouched()),
      this._events.next(new mc(this.touched, n)),
      e.onlySelf || this._parent?._updateTouched(e, n));
  }
  _onDisabledChange = [];
  _registerOnCollectionChange(e) {
    this._onCollectionChange = e;
  }
  _setUpdateStrategy(e) {
    Od(e) && e.updateOn != null && (this._updateOn = e.updateOn);
  }
  _parentMarkedDirty(e) {
    return !e && !!this._parent?.dirty && !this._parent._anyControlsDirty();
  }
  _find(e) {
    return null;
  }
  _assignValidators(e) {
    ((this._rawValidators = Array.isArray(e) ? e.slice() : e),
      (this._composedValidatorFn = LF(this._rawValidators)),
      this._updateHasRequiredValidator());
  }
  _assignAsyncValidators(e) {
    ((this._rawAsyncValidators = Array.isArray(e) ? e.slice() : e),
      (this._composedAsyncValidatorFn = jF(this._rawAsyncValidators)));
  }
  _updateHasRequiredValidator() {
    F(() => this._hasRequired.set(this.hasValidator(gm.required)));
  }
};
function UF(t) {
  return t.tagName === `INPUT` || t.tagName === `SELECT` || t.tagName === `TEXTAREA`;
}
function tQ(t) {
  if (t.tagName !== `INPUT`) return !1;
  let e = t.type;
  return e === `number` || e === `range` || e === `date` || e === `month`;
}
function nQ(t) {
  return t.tagName === `INPUT` || t.tagName === `TEXTAREA`;
}
function BF(t, e, n, r) {
  switch (n) {
    case `name`:
      t.setAttribute(e, n, r);
      break;
    case `disabled`:
    case `readonly`:
    case `required`:
      r ? t.setAttribute(e, n, ``) : t.removeAttribute(e, n);
      break;
    case `max`:
    case `min`:
    case `minLength`:
    case `maxLength`:
      r !== void 0 ? t.setAttribute(e, n, r.toString()) : t.removeAttribute(e, n);
      break;
  }
}
var _m = class {
  kind;
  context;
  control;
  message;
  constructor({ kind: e, context: n, control: r }) {
    ((this.kind = e), (this.context = n), (this.control = r));
  }
};
var HF = (() => {
  class t {
    _validator = Ad;
    _onChange;
    _enabled;
    ngOnChanges(n) {
      if (this.inputName in n) {
        let r = this.normalizeInput(n[this.inputName].currentValue);
        ((this._enabled = this.enabled(r)),
          (this._validator = this._enabled ? this.createValidator(r) : Ad),
          this._onChange?.());
      }
    }
    validate(n) {
      return this._validator(n);
    }
    registerOnValidatorChange(n) {
      this._onChange = n;
    }
    enabled(n) {
      return n != null;
    }
    static ɵfac = function (r) {
      return new (r || t)();
    };
    static ɵdir = ot({ type: t, features: [Xn] });
  }
  return t;
})();
var $F = { provide: ZI, useExisting: Ir(() => sb), multi: !0 };
var sb = (() => {
  class t extends HF {
    required;
    inputName = `required`;
    normalizeInput = Ui;
    createValidator = (n) => KI;
    enabled(n) {
      return n;
    }
    static ɵfac = (() => {
      let n;
      return function (i) {
        return (n || (n = ya(t)))(i || t);
      };
    })();
    static ɵdir = ot({
      type: t,
      selectors: [
        [``, `required`, ``, `formControlName`, ``, 3, `type`, `checkbox`],
        [``, `required`, ``, `formControl`, ``, 3, `type`, `checkbox`],
        [``, `required`, ``, `ngModel`, ``, 3, `type`, `checkbox`],
      ],
      hostVars: 1,
      hostBindings: function (r, i) {
        r & 2 && kr(`required`, i._enabled ? `` : null);
      },
      inputs: { required: `required` },
      standalone: !1,
      features: [Na([$F]), ji],
    });
  }
  return t;
})();
var GF = new E(``);
var zF = new E(``, { factory: () => ab });
var ab = `always`;
function WF(t, e) {
  return [...e.path, t];
}
function BI(t, e, n = ab) {
  (YF(t, e),
    e.valueAccessor.writeValue(t.value),
    (t.disabled || n === `always`) && e.valueAccessor.setDisabledState?.(t.disabled),
    ZF(t, e),
    QF(t, e),
    KF(t, e),
    qF(t, e));
}
function HI(t, e) {
  t.forEach((n) => {
    n.registerOnValidatorChange && n.registerOnValidatorChange(e);
  });
}
function qF(t, e) {
  if (e.valueAccessor.setDisabledState) {
    let n = (r) => {
      e.valueAccessor.setDisabledState(r);
    };
    (t.registerOnDisabledChange(n),
      e._registerOnDestroy(() => {
        t._unregisterOnDisabledChange(n);
      }));
  }
}
function YF(t, e) {
  let n = kF(t);
  e.validator !== null
    ? t.setValidators(VI(n, e.validator))
    : typeof n == `function` && t.setValidators([n]);
  let r = PF(t);
  e.asyncValidator !== null
    ? t.setAsyncValidators(VI(r, e.asyncValidator))
    : typeof r == `function` && t.setAsyncValidators([r]);
  let i = () => t.updateValueAndValidity();
  (HI(e._rawValidators, i), HI(e._rawAsyncValidators, i));
}
function ZF(t, e) {
  e.valueAccessor.registerOnChange((n) => {
    ((t._pendingValue = n),
      (t._pendingChange = !0),
      (t._pendingDirty = !0),
      t.updateOn === `change` && cb(t, e));
  });
}
function KF(t, e) {
  e.valueAccessor.registerOnTouched(() => {
    ((t._pendingTouched = !0),
      t.updateOn === `blur` && t._pendingChange && cb(t, e),
      t.updateOn !== `submit` && t.markAsTouched());
  });
}
function cb(t, e) {
  (t._pendingDirty && t.markAsDirty(),
    t.setValue(t._pendingValue, { emitModelToViewChange: !1 }),
    e.viewToModelUpdate(t._pendingValue),
    (t._pendingChange = !1));
}
function QF(t, e) {
  let n = (r, i) => {
    (e.valueAccessor.writeValue(r), i && e.viewToModelUpdate(r));
  };
  (t.registerOnChange(n),
    e._registerOnDestroy(() => {
      t._unregisterOnChange(n);
    }));
}
function XF(t, e) {
  if (!t.hasOwnProperty(`model`)) return !1;
  let n = t.model;
  return n.isFirstChange() ? !0 : !Object.is(e, n.currentValue);
}
function JF(t) {
  return Object.getPrototypeOf(t.constructor) === DF;
}
function e1(t, e) {
  if (!e) return null;
  let n, r, i;
  return (
    e.forEach((o) => {
      o.constructor === YI ? (n = o) : JF(o) ? (r = o) : (i = o);
    }),
    i || r || n || null
  );
}
var t1 = {
  provide: GF,
  useFactory: () => {
    let t = v(yc, { self: !0 });
    return {
      setParseErrors: (e) => {
        t.setParseErrorSource(e);
      },
      set onReset(e) {
        t.onReset = e;
      },
    };
  },
};
var yc = class extends xd {
  _parent = null;
  name = null;
  valueAccessor = null;
  isCustomControlBased = !1;
  userOnReset;
  resetSubscription;
  set onReset(e) {
    ((this.userOnReset = e),
      this.resetSubscription?.unsubscribe(),
      (this.resetSubscription = void 0),
      this.control &&
        ((this.resetSubscription = this.control.events.subscribe((n) => {
          n instanceof vc && this.control && this.userOnReset?.(this.control.value);
        })),
        this.subscription?.add(this.resetSubscription)));
  }
  isNativeFormElement = !1;
  rawValueAccessors;
  _selectedValueAccessor = null;
  get selectedValueAccessor() {
    return (this._selectedValueAccessor ??= e1(this, this.rawValueAccessors));
  }
  parseErrorsValidator = null;
  renderer;
  injector;
  requiredValidatorViaDi;
  subscription;
  customControlBindings = null;
  constructor(e, n, r) {
    (super(),
      (this.injector = e),
      (this.renderer = n),
      (this.rawValueAccessors = r),
      this.injector?.get(J)?.onDestroy(() => {
        (this.removeParseErrorsValidator(this.control), this.subscription?.unsubscribe());
      }));
  }
  setupCustomControl() {
    this.subscription?.unsubscribe();
    let e = this.injector?.get(nr);
    if (!this.control || !e) return;
    let n = e.markForCheck.bind(e);
    ((this.subscription = new Ne()),
      this.subscription.add(this.control.valueChanges.subscribe(n)),
      this.subscription.add(this.control.statusChanges.subscribe(n)),
      this.resetSubscription?.unsubscribe(),
      (this.resetSubscription = void 0),
      this.userOnReset &&
        ((this.resetSubscription = this.control.events.subscribe((r) => {
          r instanceof vc && this.control && this.userOnReset?.(this.control.value);
        })),
        this.subscription.add(this.resetSubscription)),
      this.parseErrorsValidator && this.control.addValidators(this.parseErrorsValidator));
  }
  ngControlCreate(e) {
    (!e.nativeElement.hasAttribute?.(`ngNoCva`) &&
      ((this.rawValueAccessors && this.rawValueAccessors.length > 0) ||
        this.valueAccessor !== null)) ||
      !e.customControl ||
      ((this.isCustomControlBased = !0),
      e.listenToCustomControlModel((i) => {
        (this.control?.setValue(i, { emitModelToViewChange: !1 }),
          this.control?.markAsDirty(),
          this.viewToModelUpdate(i));
      }),
      e.listenToCustomControlOutput(`touch`, () => {
        this.control?.markAsTouched();
      }),
      (this.customControlBindings = {}),
      (this.isNativeFormElement = UF(e.nativeElement)),
      (this.requiredValidatorViaDi = this._rawValidators.find((i) => i instanceof sb)));
  }
  ngControlUpdate(e, n) {
    if (!this.isCustomControlBased) return;
    let r = this.control,
      i = this.customControlBindings;
    (Object.is(i.value, r.value) || ((i.value = r.value), e.setCustomControlModelInput(r.value)),
      this.bindControlProperty(e, i, `touched`, r.touched),
      this.bindControlProperty(e, i, `dirty`, r.dirty),
      this.bindControlProperty(e, i, `valid`, r.valid),
      this.bindControlProperty(e, i, `invalid`, r.invalid),
      this.bindControlProperty(e, i, `pending`, r.pending),
      this.bindControlProperty(e, i, `disabled`, r.disabled),
      this.shouldBindRequired && this.bindControlProperty(e, i, `required`, this.isRequired));
    let o = r.errors;
    if (i.errors !== o) {
      i.errors = o;
      let s = this._convertErrors(o);
      e.setInputOnDirectives(`errors`, s);
    }
  }
  get isRequired() {
    return (this.requiredValidatorViaDi?._enabled || this.control?._hasRequired()) ?? !1;
  }
  get shouldBindRequired() {
    return !0;
  }
  bindControlProperty(e, n, r, i) {
    if (n[r] === i) return;
    n[r] = i;
    let o = e.setInputOnDirectives(r, i);
    this.isNativeFormElement &&
      !o &&
      (r === `disabled` || r === `required`) &&
      this.renderer &&
      BF(this.renderer, e.nativeElement, r, i);
  }
  _convertErrors(e) {
    if (e === null) return [];
    let n = this.control;
    return Object.entries(e).map(([r, i]) => new _m({ context: i, kind: r, control: n }));
  }
  setParseErrorSource(e) {
    if (e === void 0) return;
    let n = null,
      r = oe(() => {
        let i = e();
        return i.length === 0 ? null : i.reduce((o, s) => ((o[s.kind] = s), o), {});
      });
    ((this.parseErrorsValidator = (() => n).bind(this)),
      Yt(
        () => {
          ((n = r()), this.control?.updateValueAndValidity({ emitEvent: !1 }));
        },
        { injector: this.injector },
      ));
  }
  removeParseErrorsValidator(e) {
    this.parseErrorsValidator &&
      (e?.removeValidators(this.parseErrorsValidator),
      e?.updateValueAndValidity({ emitEvent: !1 }));
  }
};
function $I(t, e) {
  let n = t.indexOf(e);
  n > -1 && t.splice(n, 1);
}
function GI(t) {
  return (
    typeof t == `object` &&
    t !== null &&
    Object.keys(t).length === 2 &&
    `value` in t &&
    `disabled` in t
  );
}
var n1 = class extends ym {
  defaultValue = null;
  _onChange = [];
  _pendingValue;
  _pendingChange = !1;
  constructor(e = null, n, r) {
    (super(FF(n), VF(r, n)),
      this._applyFormState(e),
      this._setUpdateStrategy(n),
      this._initObservables(),
      this.updateValueAndValidity({ onlySelf: !0, emitEvent: !!this.asyncValidator }),
      Od(n) &&
        (n.nonNullable || n.initialValueIsDefault) &&
        (GI(e) ? (this.defaultValue = e.value) : (this.defaultValue = e)));
  }
  setValue(e, n = {}) {
    F(() => {
      ((this.value = this._pendingValue = e),
        this._onChange.length &&
          n.emitModelToViewChange !== !1 &&
          this._onChange.forEach((r) => r(this.value, n.emitViewToModelChange !== !1)),
        this.updateValueAndValidity(n));
    });
  }
  patchValue(e, n = {}) {
    this.setValue(e, n);
  }
  reset(e = this.defaultValue, n = {}) {
    (this._applyFormState(e),
      this.markAsPristine(n),
      this.markAsUntouched(n),
      this.setValue(this.value, n),
      n.overwriteDefaultValue && (this.defaultValue = this.value),
      (this._pendingChange = !1),
      n?.emitEvent !== !1 && this._events.next(new vc(this)));
  }
  _updateValue() {}
  _anyControls(e) {
    return !1;
  }
  _allControlsDisabled() {
    return this.disabled;
  }
  registerOnChange(e) {
    this._onChange.push(e);
  }
  _unregisterOnChange(e) {
    $I(this._onChange, e);
  }
  registerOnDisabledChange(e) {
    this._onDisabledChange.push(e);
  }
  _unregisterOnDisabledChange(e) {
    $I(this._onDisabledChange, e);
  }
  _forEachChild(e) {}
  _syncPendingControls() {
    return this.updateOn === `submit` &&
      (this._pendingDirty && this.markAsDirty(),
      this._pendingTouched && this.markAsTouched(),
      this._pendingChange)
      ? (this.setValue(this._pendingValue, { onlySelf: !0, emitModelToViewChange: !1 }), !0)
      : !1;
  }
  _applyFormState(e) {
    GI(e)
      ? ((this.value = this._pendingValue = e.value),
        e.disabled
          ? this.disable({ onlySelf: !0, emitEvent: !1 })
          : this.enable({ onlySelf: !0, emitEvent: !1 }))
      : (this.value = this._pendingValue = e);
  }
};
var r1 = { provide: yc, useExisting: Ir(() => i1) };
var zI = Promise.resolve();
var i1 = (() => {
  class t extends yc {
    _changeDetectorRef;
    callSetDisabledState;
    control = new n1();
    static ngAcceptInputType_isDisabled;
    _registered = !1;
    viewModel;
    name = ``;
    isDisabled;
    model;
    options;
    update = new Ue();
    constructor(n, r, i, o, s, a, c, u) {
      (super(c, u, o),
        (this._changeDetectorRef = s),
        (this.callSetDisabledState = a),
        (this._parent = n),
        this._setValidators(r),
        this._setAsyncValidators(i));
    }
    ngOnChanges(n) {
      if ((this._checkForErrors(), !this._registered || `name` in n)) {
        if (this._registered && (this._checkName(), this.formDirective)) {
          let r = n.name.previousValue;
          this.formDirective.removeControl({ name: r, path: this._getPath(r) });
        }
        this._setUpControl();
      }
      (`isDisabled` in n && this._updateDisabled(n),
        XF(n, this.viewModel) && (this._updateValue(this.model), (this.viewModel = this.model)));
    }
    ngOnDestroy() {
      this.formDirective?.removeControl(this);
    }
    ɵngControlCreate(n) {
      super.ngControlCreate(n);
    }
    ɵngControlUpdate(n) {
      super.ngControlUpdate(n, !1);
    }
    get shouldBindRequired() {
      return !1;
    }
    get path() {
      return this._getPath(this.name);
    }
    get formDirective() {
      return this._parent ? this._parent.formDirective : null;
    }
    viewToModelUpdate(n) {
      ((this.viewModel = n), this.update.emit(n));
    }
    _setUpControl() {
      (this._setUpdateStrategy(),
        this._isStandalone() ? this._setUpStandalone() : this.formDirective.addControl(this),
        (this._registered = !0));
    }
    _setUpdateStrategy() {
      this.options &&
        this.options.updateOn != null &&
        (this.control._updateOn = this.options.updateOn);
    }
    _isStandalone() {
      return !this._parent || !!(this.options && this.options.standalone);
    }
    _setUpStandalone() {
      (this.isCustomControlBased
        ? this.setupCustomControl()
        : ((this.valueAccessor ??= this.selectedValueAccessor),
          BI(this.control, this, this.callSetDisabledState)),
        this.control.updateValueAndValidity({ emitEvent: !1 }));
    }
    _setupWithForm(n) {
      this.isCustomControlBased
        ? this.setupCustomControl()
        : ((this.valueAccessor ??= this.selectedValueAccessor), BI(this.control, this, n));
    }
    _checkForErrors() {
      this._checkName();
    }
    _checkName() {
      (this.options && this.options.name && (this.name = this.options.name),
        !this._isStandalone() && this.name);
    }
    _updateValue(n) {
      zI.then(() => {
        (this.control.setValue(n, { emitViewToModelChange: !1 }),
          this._changeDetectorRef?.markForCheck());
      });
    }
    _updateDisabled(n) {
      let r = n.isDisabled.currentValue,
        i = r !== 0 && Ui(r);
      zI.then(() => {
        (i && !this.control.disabled
          ? this.control.disable()
          : !i && this.control.disabled && this.control.enable(),
          this._changeDetectorRef?.markForCheck());
      });
    }
    _getPath(n) {
      return this._parent ? WF(n, this._parent) : [n];
    }
    static ɵfac = function (r) {
      return new (r || t)(
        te(vm, 9),
        te(ZI, 10),
        te(IF, 10),
        te(qI, 10),
        te(nr, 8),
        te(zF, 8),
        te(He, 8),
        te(An, 8),
      );
    };
    static ɵdir = ot({
      type: t,
      selectors: [[``, `ngModel`, ``, 3, `formControlName`, ``, 3, `formControl`, ``]],
      inputs: {
        name: `name`,
        isDisabled: [0, `disabled`, `isDisabled`],
        model: [0, `ngModel`, `model`],
        options: [0, `ngModelOptions`, `options`],
      },
      outputs: { update: `ngModelChange` },
      exportAs: [`ngModel`],
      standalone: !1,
      features: [Na([r1, t1]), ji, Xn, Qp(null)],
    });
  }
  return t;
})();
function sQ(t, e, n) {
  let r = s1(e ?? t, t);
  return o1(n ?? r, r);
}
function o1(t, ...e) {
  return e.reduce((n, r) => (n < r ? n : r), t);
}
function s1(t, ...e) {
  return e.reduce((n, r) => (n > r ? n : r), t);
}
function a1(t, e) {
  return t.slice(0, Math.max(e, 0)).concat(t.slice(Math.max(e + 1, 0)));
}
function lQ(t, e, n) {
  let r = n ? t.findIndex((i) => n(i, e)) : t.indexOf(e);
  return r === -1 ? [...t, e] : a1(t, r);
}
function dQ(t) {
  return typeof t == `string`;
}
var c1 = 0;
function fQ() {
  return `tui_${c1++}${Date.now().toString(36)}`;
}
function ub(t) {
  return t != null;
}
function hQ(t) {
  return `${t}px`;
}
function lb(t, e) {
  `set` in t
    ? t.set(e)
    : `applyValueToInputSignal` in t[le] && t[le].applyValueToInputSignal(t[le], e);
}
var u1 = new E(``, {
  factory: () => {
    let t = new Map();
    return (v(J).onDestroy(() => t.forEach((e) => e.destroy())), t);
  },
});
function db(t) {
  let e = v(u1),
    n = v(ve);
  e.has(t) || e.set(t, jC(t, { environmentInjector: n }));
}
function fb(t, e, n) {
  return {
    provide: t,
    useFactory: () =>
      l(
        l({}, v(t, { optional: !0, skipSelf: !0 }) || n),
        v(e, { optional: !0 }) || (typeof e == `function` ? e() : e),
      ),
  };
}
function hb(t) {
  let e = new E(``, { factory: () => t });
  return [e, (n) => fb(e, n, t)];
}
function vQ(t, e, n, r = { self: !0 }) {
  let i = Zt(n) ? n : H(n),
    o = v(t, r),
    s = o?.[`${e.toString()}Change`];
  if (!o) return i;
  let a;
  return (
    Yt(() => {
      let c = i();
      a !== c && (Zt(o[e]) ? lb(o[e], c) : (o[e] = c), o.ngOnChanges?.({}), s?.emit?.(c), (a = c));
    }),
    i
  );
}
function pb(t, e, n = !1) {
  return { provide: t, useExisting: e, multi: n };
}
var lr = new E(``, {
  factory: () => {
    let { defaultView: t } = v(ie);
    if (!t) throw new Error(`Window is not available`);
    return t;
  },
});
var wQ = new E(``, {
  factory: () => {
    let { requestAnimationFrame: t, cancelAnimationFrame: e } = v(lr);
    return new k((r) => {
      let i = NaN,
        o = (s) => {
          (r.next(s), (i = t(o)));
        };
      return (
        (i = t(o)),
        () => {
          e(i);
        }
      );
    }).pipe(vo());
  },
});
var gb = new E(``, { factory: () => v(lr).localStorage });
var l1 = new E(``, { factory: () => v(lr).navigator });
var IQ = new E(``, { factory: () => v(l1).userAgent });
function kd(t) {
  return t instanceof it ? t.nativeElement : t;
}
function d1(t) {
  return Array.isArray(t) ? t : [t];
}
function xQ(t) {
  return t != null && `${t}` != `false`;
}
function HQ(t, e) {
  try {
    return t.contains(e) || !!(e.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_PRECEDING);
  } catch {
    return !1;
  }
}
function f1(t) {
  return t.matches(`input`);
}
function h1(t) {
  return t.matches(`textarea`);
}
function p1(t) {
  return f1(t) || h1(t);
}
function $Q(t) {
  return !!t && `nodeType` in t && t.nodeType === Node.ELEMENT_NODE;
}
function g1(t) {
  let e = t?.ownerDocument.defaultView;
  return !!t && !!e && t instanceof e.HTMLElement;
}
function GQ(t) {
  return t.composedPath()[0];
}
function m1(t) {
  return `getRootNode` in t && t.isConnected ? t.getRootNode() : t.ownerDocument;
}
function zQ(t) {
  if (!t.getBoundingClientRect) return null;
  let { left: e, right: n, top: r, bottom: i, width: o, height: s } = t.getBoundingClientRect();
  if (o === 0 && s === 0) return null;
  let a = m1(t),
    c = Math.round(e + o / 2),
    u = Math.round(r + s / 2),
    l = [
      a.elementFromPoint(c, Math.round(r) + 2),
      a.elementFromPoint(c, Math.round(i) - 2),
      a.elementFromPoint(Math.round(e) + 2, u),
      a.elementFromPoint(Math.round(n) - 2, u),
    ].filter(ub);
  if (!l.length) return [];
  let d = l.filter((f) => !t.contains(f) && !f.contains(t));
  return d.length === 4 ? d : null;
}
function WQ(t, e) {
  let { offsetTop: n, offsetLeft: r, offsetParent: i } = e;
  for (; g1(i) && i !== t;) ((n += i.offsetTop), (r += i.offsetLeft), (i = i.offsetParent));
  return { offsetTop: n, offsetLeft: r };
}
function qQ() {
  return v(it).nativeElement;
}
function YQ(t) {
  return (p1(t) && !t.readOnly && t.inputMode !== `none`) || !!t.isContentEditable;
}
function ZQ(t = 0, e = 0) {
  let n = { x: t, y: e, left: t, right: t, top: e, bottom: e, width: 0, height: 0 };
  return m(l({}, n), { toJSON: () => n });
}
function KQ(t, e = v(pi)) {
  let n = e.get(lr);
  !n.tuiInputPatched &&
    sw(e.get(bi)) &&
    ((n.tuiInputPatched = !0),
    Cm(n.HTMLInputElement.prototype),
    Cm(n.HTMLTextAreaElement.prototype),
    Cm(n.HTMLSelectElement.prototype));
  let r = Zt(t) ? void 0 : kd(t),
    i = () => {},
    o = { injector: e },
    s = H(r?.value || ``),
    a = (c) => {
      let u = () => F(() => s.set(c.value));
      return (
        c.addEventListener(`input`, u, { capture: !0 }),
        c.addEventListener(`tui-input`, u, { capture: !0 }),
        () => {
          (c.removeEventListener(`input`, u, { capture: !0 }),
            c.removeEventListener(`tui-input`, u, { capture: !0 }));
        }
      );
    };
  return (
    e.get(J).onDestroy(() => i()),
    Zt(t)
      ? Yt(() => {
          ((r = kd(t())), i(), r && !r.matches(`select[multiple]`) && (s.set(r.value), (i = a(r))));
        }, o)
      : r && !r.matches(`select[multiple]`) && (i = a(r)),
    Yt(() => {
      let c = s();
      if (!r?.matches(`select[multiple]`))
        if (r?.matches(`:focus`) && `selectionStart` in r) {
          let { selectionStart: u, selectionEnd: l } = r;
          r.value = c;
          try {
            r.setSelectionRange(u, l);
          } catch {}
        } else r && (r.value = c);
    }, o),
    s
  );
}
function Cm(t) {
  let { set: e } = Object.getOwnPropertyDescriptor(t, `value`);
  Object.defineProperty(t, 'value', {
    set(n) {
      let r = this.value,
        i = new CustomEvent(`tui-input`, { detail: n, bubbles: !0 });
      (e.call(this, n), r !== n && this.dispatchEvent(i));
    },
  });
}
function mb(t) {
  return LI(
    mn(t, `resize`).pipe(
      _r(null),
      Y(() => {
        let e = Math.max(
            t.document.documentElement.clientWidth || 0,
            t.innerWidth || 0,
            t.visualViewport?.width || 0,
          ),
          n = Math.max(
            t.document.documentElement.clientHeight || 0,
            t.innerHeight || 0,
            t.visualViewport?.height || 0,
          ),
          r = { width: e, height: n, top: 0, left: 0, right: e, bottom: n, x: 0, y: 0 };
        return m(l({}, r), { toJSON: () => JSON.stringify(r) });
      }),
    ),
    { requireSync: !0 },
  );
}
var vb = l(
  l(
    l(
      l(
        l(
          l(
            l(
              { name: `english` },
              {
                months: [
                  `January`,
                  `February`,
                  `March`,
                  `April`,
                  `May`,
                  `June`,
                  `July`,
                  `August`,
                  `September`,
                  `October`,
                  `November`,
                  `December`,
                ],
                close: `Close`,
                back: `Back`,
                clear: `Clear`,
                nothingFoundMessage: `Nothing found`,
                defaultErrorMessage: `Value is invalid`,
                spinTexts: [`Previous`, `Next`],
                shortWeekDays: [`Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`, `Sun`],
                countries: {
                  AD: `Andorra`,
                  AE: `United Arab Emirates`,
                  AF: `Afghanistan`,
                  AG: `Antigua & Barbuda`,
                  AI: `Anguilla`,
                  AL: `Albania`,
                  AM: `Armenia`,
                  AO: `Angola`,
                  AR: `Argentina`,
                  AT: `Austria`,
                  AU: `Australia`,
                  AW: `Aruba`,
                  AZ: `Azerbaijan`,
                  BA: `Bosnia & Herzegovina`,
                  BB: `Barbados`,
                  BD: `Bangladesh`,
                  BE: `Belgium`,
                  BF: `Burkina Faso`,
                  BG: `Bulgaria`,
                  BH: `Bahrain`,
                  BI: `Burundi`,
                  BJ: `Benin`,
                  BL: `St. Barthélemy`,
                  BM: `Bermuda`,
                  BN: `Brunei`,
                  BO: `Bolivia`,
                  BQ: `Caribbean Netherlands`,
                  BR: `Brazil`,
                  BS: `Bahamas`,
                  BT: `Bhutan`,
                  BW: `Botswana`,
                  BY: `Belarus`,
                  BZ: `Belize`,
                  CA: `Canada`,
                  CD: `Congo - Kinshasa`,
                  CF: `Central African Republic`,
                  CG: `Congo - Brazzaville`,
                  CH: `Switzerland`,
                  CI: `Côte d’Ivoire`,
                  CL: `Chile`,
                  CM: `Cameroon`,
                  CN: `China`,
                  CO: `Colombia`,
                  CR: `Costa Rica`,
                  CU: `Cuba`,
                  CV: `Cape Verde`,
                  CW: `Curaçao`,
                  CY: `Cyprus`,
                  CZ: `Czechia`,
                  DE: `Germany`,
                  DJ: `Djibouti`,
                  DK: `Denmark`,
                  DM: `Dominica`,
                  DO: `Dominican Republic`,
                  DZ: `Algeria`,
                  EC: `Ecuador`,
                  EE: `Estonia`,
                  EG: `Egypt`,
                  ER: `Eritrea`,
                  ES: `Spain`,
                  ET: `Ethiopia`,
                  FI: `Finland`,
                  FJ: `Fiji`,
                  FK: `Falkland Islands`,
                  FM: `Federated States of Micronesia`,
                  FR: `France`,
                  GA: `Gabon`,
                  GB: `United Kingdom`,
                  GD: `Grenada`,
                  GE: `Georgia`,
                  GF: `French Guiana`,
                  GH: `Ghana`,
                  GI: `Gibraltar`,
                  GL: `Greenland`,
                  GM: `Gambia`,
                  GN: `Guinea`,
                  GP: `Guadeloupe`,
                  GQ: `Equatorial Guinea`,
                  GR: `Greece`,
                  GT: `Guatemala`,
                  GW: `Guinea-Bissau`,
                  GY: `Guyana`,
                  HK: `Hong Kong`,
                  HN: `Honduras`,
                  HR: `Croatia`,
                  HT: `Haiti`,
                  HU: `Hungary`,
                  ID: `Indonesia`,
                  IE: `Ireland`,
                  IL: `Israel`,
                  IN: `India`,
                  IQ: `Iraq`,
                  IR: `Iran`,
                  IS: `Iceland`,
                  IT: `Italy`,
                  JM: `Jamaica`,
                  JO: `Jordan`,
                  JP: `Japan`,
                  KE: `Kenya`,
                  KG: `Kyrgyzstan`,
                  KH: `Cambodia`,
                  KM: `Comoros`,
                  KN: `St. Kitts & Nevis`,
                  KP: `North Korea`,
                  KR: `South Korea`,
                  KW: `Kuwait`,
                  KY: `Cayman Islands`,
                  KZ: `Kazakhstan`,
                  LA: `Laos`,
                  LB: `Lebanon`,
                  LC: `St. Lucia`,
                  LI: `Liechtenstein`,
                  LK: `Sri Lanka`,
                  LR: `Liberia`,
                  LS: `Lesotho`,
                  LT: `Lithuania`,
                  LU: `Luxembourg`,
                  LV: `Latvia`,
                  LY: `Libya`,
                  MA: `Morocco`,
                  MC: `Monaco`,
                  MD: `Moldova`,
                  ME: `Montenegro`,
                  MF: `St. Martin`,
                  MG: `Madagascar`,
                  MK: `North Macedonia`,
                  ML: `Mali`,
                  MM: `Myanmar (Burma)`,
                  MN: `Mongolia`,
                  MO: `Macao`,
                  MQ: `Martinique`,
                  MR: `Mauritania`,
                  MS: `Montserrat`,
                  MT: `Malta`,
                  MU: `Mauritius`,
                  MV: `Maldives`,
                  MW: `Malawi`,
                  MX: `Mexico`,
                  MY: `Malaysia`,
                  MZ: `Mozambique`,
                  NA: `Namibia`,
                  NC: `New Caledonia`,
                  NE: `Niger`,
                  NG: `Nigeria`,
                  NI: `Nicaragua`,
                  NL: `Netherlands`,
                  NO: `Norway`,
                  NP: `Nepal`,
                  NZ: `New Zealand`,
                  OM: `Oman`,
                  PA: `Panama`,
                  PE: `Peru`,
                  PF: `French Polynesia`,
                  PG: `Papua New Guinea`,
                  PH: `Philippines`,
                  PK: `Pakistan`,
                  PL: `Poland`,
                  PT: `Portugal`,
                  PW: `Palau`,
                  PY: `Paraguay`,
                  QA: `Qatar`,
                  RE: `Réunion`,
                  RO: `Romania`,
                  RS: `Serbia`,
                  RU: `Russia`,
                  RW: `Rwanda`,
                  SA: `Saudi Arabia`,
                  SB: `Solomon Islands`,
                  SC: `Seychelles`,
                  SD: `Sudan`,
                  SE: `Sweden`,
                  SG: `Singapore`,
                  SH: `St. Helena`,
                  SI: `Slovenia`,
                  SK: `Slovakia`,
                  SL: `Sierra Leone`,
                  SM: `San Marino`,
                  SN: `Senegal`,
                  SO: `Somalia`,
                  SR: `Suriname`,
                  ST: `São Tomé & Príncipe`,
                  SV: `El Salvador`,
                  SX: `Sint Maarten`,
                  SY: `Syria`,
                  SZ: `Eswatini`,
                  TC: `Turks & Caicos Islands`,
                  TD: `Chad`,
                  TG: `Togo`,
                  TH: `Thailand`,
                  TJ: `Tajikistan`,
                  TL: `Timor-Leste`,
                  TM: `Turkmenistan`,
                  TN: `Tunisia`,
                  TO: `Tonga`,
                  TR: `Türkiye`,
                  TT: `Trinidad & Tobago`,
                  TW: `Taiwan`,
                  TZ: `Tanzania`,
                  UA: `Ukraine`,
                  UG: `Uganda`,
                  US: `United States`,
                  UY: `Uruguay`,
                  UZ: `Uzbekistan`,
                  VC: `St. Vincent & Grenadines`,
                  VE: `Venezuela`,
                  VG: `British Virgin Islands`,
                  VN: `Vietnam`,
                  VU: `Vanuatu`,
                  WS: `Samoa`,
                  XK: `Kosovo`,
                  YE: `Yemen`,
                  YT: `Mayotte`,
                  ZA: `South Africa`,
                  ZM: `Zambia`,
                  ZW: `Zimbabwe`,
                  AC: `Ascension Island`,
                  AS: `American Samoa`,
                  AX: `Åland Islands`,
                  CC: `Cocos (Keeling) Islands`,
                  CK: `Cook Islands`,
                  CX: `Christmas Island`,
                  EH: `Western Sahara`,
                  FO: `Faroe Islands`,
                  GG: `Guernsey`,
                  GU: `Guam`,
                  IM: `Isle of Man`,
                  JE: `Jersey`,
                  IO: `British Indian Ocean Territory`,
                  KI: `Kiribati`,
                  MH: `Marshall Islands`,
                  MP: `Northern Mariana Islands`,
                  NF: `Norfolk Island`,
                  NR: `Nauru`,
                  NU: `Niue`,
                  PM: `Saint Pierre and Miquelon`,
                  PR: `Puerto Rico`,
                  PS: `Palestine`,
                  SJ: `Svalbard and Jan Mayen`,
                  SS: `South Sudan`,
                  TA: `Tristan da Cunha`,
                  TK: `Tokelau`,
                  TV: `Tuvalu`,
                  VA: `Holy See`,
                  VI: `Virgin Islands`,
                  WF: `Wallis and Futuna`,
                },
              },
            ),
            {
              cancel: `Cancel`,
              done: `Done`,
              more: `More`,
              otherDate: `Other date...`,
              showAll: `Show all`,
              hide: `Hide`,
              mobileCalendarTexts: [`Choose day`, `Choose range`, `Choose days`],
              range: [`from`, `to`],
              countTexts: [`Plus`, `Minus`],
              time: {
                'MM:SS': `MM:SS`,
                'HH:MM': `HH:MM`,
                'HH:MM AA': `HH:MM AA`,
                'HH:MM:SS': `HH:MM:SS`,
                'HH:MM:SS AA': `HH:MM:SS AA`,
                'HH:MM:SS.MSS': `HH:MM:SS.MSS`,
                'HH:MM:SS.MSS AA': `HH:MM:SS.MSS AA`,
                'HH AA': `HH AA`,
                HH: `HH`,
                'MM:SS.MSS': `MM:SS.MSS`,
                'SS.MSS': `SS.MSS`,
              },
              dateTexts: {
                'dd/mm/yyyy': `DD/MM/YYYY`,
                'mm/dd/yyyy': `MM/DD/YYYY`,
                'yyyy/mm/dd': `YYYY/MM/DD`,
              },
              digitalInformationUnits: [`B`, `KiB`, `MiB`],
              passwordTexts: [`Show password`, `Hide password`],
              copyTexts: [`Copy`, `Copied`],
              shortCalendarMonths: [
                `Jan`,
                `Feb`,
                `Mar`,
                `Apr`,
                `May`,
                `Jun`,
                `Jul`,
                `Aug`,
                `Sep`,
                `Oct`,
                `Nov`,
                `Dec`,
              ],
              pagination: [`Previous page`, `Next page`],
              fileTexts: { loadingError: `Upload failed`, preview: `Preview`, remove: `Remove` },
              inputFileTexts: {
                defaultLabelSingle: `or drop\xA0it\xA0here`,
                defaultLabelMultiple: `or drop\xA0them\xA0here`,
                defaultLinkSingle: `Choose a file`,
                defaultLinkMultiple: `Choose files`,
                maxSizeRejectionReason: `File is larger than`,
                formatRejectionReason: `Wrong file type`,
                drop: `Drop file here`,
                dropMultiple: `Drop files here`,
              },
              multiSelectTexts: { all: `Select all`, none: `Select none` },
              confirm: { yes: `Yes`, no: `No` },
              previewTexts: { rotate: `Rotate` },
              zoomTexts: { zoomOut: `Zoom out`, zoomIn: `Zoom in`, reset: `Reset` },
              phoneSearch: `Type country or code`,
              dayRangePeriods: [
                `For all the time`,
                `Today`,
                `Yesterday`,
                `Current week`,
                `Current month`,
                `Previous month`,
              ],
            },
          ),
          {
            showHideText: `Show/Hide`,
            paginationTexts: { pages: `Pages`, linesPerPage: `Lines per page`, of: `of` },
          },
        ),
        { cardNumber: [`Number`, `Card number`], cardExpiry: [`Expires`, `Valid through`] },
      ),
      {
        colorSelectorModeNames: [`Solid color`, `Gradient`],
        toolbarTools: {
          undo: `Undo`,
          redo: `Redo`,
          font: `Font`,
          fontStyle: `Font style`,
          fontSize: `Font size`,
          bold: `Bold`,
          italic: `Italic`,
          underline: `Underline`,
          strikeThrough: `Strike through`,
          justify: `Justify`,
          justifyLeft: `Justify left`,
          justifyCenter: `Justify center`,
          justifyRight: `Justify right`,
          justifyFull: `Justify full`,
          list: `List`,
          indent: `Indent`,
          outdent: `Outdent`,
          unorderedList: `Unordered list`,
          orderedList: `Ordered list`,
          taskList: `Task list`,
          quote: `Quote`,
          foreColor: `Color`,
          backColor: `Background color`,
          hiliteColor: `Highlight color`,
          clear: `Clear`,
          link: `Link`,
          attach: `Attach file`,
          tex: `Insert TeX`,
          code: `Code`,
          image: `Insert image`,
          insertHorizontalRule: `Insert horizontal rule`,
          superscript: `Superscript`,
          subscript: `Subscript`,
          insertTable: `Insert table`,
          insertGroup: `Insert group`,
          hiliteGroup: `Hilite group`,
          removeGroup: `Remove group`,
          insertAnchor: `Insert anchor`,
          mergeCells: `Merge cells`,
          splitCells: `Split cells`,
          rowsColumnsManaging: `Managing rows and columns`,
          cellColor: `Cell color`,
          setDetails: `Details`,
          removeDetails: `Remove details`,
        },
        editorEditLink: { urlExample: `example.com`, anchorExample: `anchor` },
        editorTableCommands: [
          [`Insert column before`, `Insert column after`],
          [`Insert row before`, `Insert row after`],
          [`Delete column`, `Delete row`],
        ],
        editorCodeOptions: [`Code in the text`, `Code in block`],
        editorFontOptions: {
          small: `Small`,
          large: `Large`,
          normal: `Normal`,
          title: `Title`,
          subtitle: `Subtitle`,
        },
      },
    ),
    {
      demoTexts: [`Dark mode`, `Background`, `Value`],
      preview: `Preview`,
      menuText: `Menu`,
      searchText: `Search`,
      seeAlsoText: `See also`,
      tocText: `On this page`,
      sourceCodeText: `Source code`,
    },
  ),
  {
    inputSearch: {
      popular: `Popular`,
      history: `Recent`,
      placeholder: `Type query`,
      hotkey: `to search`,
      all: `All`,
      empty: `Nothing found`,
    },
  },
);
var yb = new E(``, { factory: () => vb });
var _b = new E(``, { factory: () => H(v(yb)) });
function dr(t) {
  return (e = v(_b)) => oe(() => e()[t]);
}
var Db = { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0 };
var lX = () => {};
var dX = m(l({}, Db), { toJSON: () => Db });
var fX = () => !1;
var hX = () => !0;
function b1(t, e) {
  return Array.isArray(t) && Array.isArray(e) && !t.length && !e.length;
}
var pX = (t, e, n = String) => n(t).toLowerCase().includes(e.toLowerCase());
var gX = (t, e, n = String) => n(t).toLowerCase() === e.toLowerCase();
var mX = (t, e) => t === e || b1(t, e);
var vX = {
  acceptNode(t) {
    return `ownerSVGElement` in t ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
  },
};
var yX = `5.19.0`;
function IX() {
  return new k((t) => {
    let e,
      n = () => {
        ((e = S1()),
          (e.onclose = () => n()),
          (e.oncancel = (r) => {
            (r.preventDefault(), t.next());
          }));
      };
    return (n(), () => e.destroy());
  });
}
function S1() {
  try {
    return new CloseWatcher();
  } catch {
    return { destroy: () => {} };
  }
}
function T1(t, e, n = {}) {
  return mn(t, e, n);
}
function bX() {
  return ft((t) => t.stopPropagation());
}
function SX(t, e = Boolean) {
  return Jr(qe((n) => (e(n) ? t(n) : ye)));
}
function TX(t) {
  return T1(t === t.ownerDocument.documentElement ? t.ownerDocument : t, `scroll`);
}
function MX(t) {
  return Jr(
    on(
      hf.pipe(
        fc(t),
        yr(() => ye),
        Os(null),
      ),
    ),
  );
}
var AX = {
  now: Ns.now.bind(Ns),
  schedule(t, e, n) {
    return Ns.schedule(
      function (r) {
        return F(() => t.call(this, r));
      },
      e,
      n,
    );
  },
};
function M1(t = v(Se)) {
  return (e) =>
    new k((n) =>
      e.subscribe({
        next: (r) => t.run(() => n.next(r)),
        error: (r) => t.run(() => n.error(r)),
        complete: () => t.run(() => n.complete()),
      }),
    );
}
function A1(t = v(Se)) {
  return (e) => new k((n) => t.runOutsideAngular(() => e.subscribe(n)));
}
function NX(t = v(Se)) {
  return Jr(A1(t), M1(t));
}
var wm = class {
  constructor(e, n = dt) {
    ((this.zoneConditionFn = e), (this.scheduler = n));
  }
  now() {
    return this.scheduler.now();
  }
  schedule(...e) {
    return this.zoneConditionFn(() => this.scheduler.schedule(...e));
  }
};
function xX(t = v(Se), e = dt) {
  return new wm(t.runOutsideAngular.bind(t), e);
}
var N1 = new E(``, {
  factory: () => v(ie).defaultView?.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches ?? !1,
});
var HX = new E(``, { factory: () => (v(N1) ? 0 : 1) });
var x1 = new E(``, { factory: () => `assets/taiga-ui/icons` });
var R1 = new E(``, { factory: () => null });
function $X(t) {
  return pb(R1, t);
}
var O1 = new E(``, {
    factory: () => ({ mobile: 768, desktopSmall: 1280, desktopLarge: Infinity }),
  }),
  GX = new E(``, {
    factory: () => {
      let t = mb(v(lr)),
        e = v(O1),
        n = Object.values(e).sort((i, o) => i - o),
        r = Object.keys(e).reduce((i, o) => m(l({}, i), { [e[o]]: o }), {});
      return oe(() => {
        let { width: i } = t(),
          s = n.find((a) => a > i) || n[n.length - 1] || 0;
        return r[s] ?? `desktopLarge`;
      });
    },
  }),
  [zX, WX] = hb({
    check: `@tui.check`,
    close: `@tui.x`,
    error: `@tui.circle-alert`,
    more: `@tui.chevron-right`,
    search: `@tui.search`,
    ellipsis: `@tui.ellipsis`,
    decrement: `@tui.chevron-left`,
    increment: `@tui.chevron-right`,
  }),
  P1 = `tuiDark`,
  F1 = new E(``, { factory: () => P1 }),
  qX = new E(``, {
    factory: () => {
      let t = v(gb),
        e = v(F1),
        n = t?.getItem(e),
        r = v(lr).matchMedia(`(prefers-color-scheme: dark)`),
        i = H(n ? n === `true` : r.matches),
        o = i.set.bind(i),
        s = (a) => {
          (t?.setItem(e, String(a)), o(a));
        };
      return (
        mn(r, `change`)
          .pipe(
            et(() => !t?.getItem(e)),
            fc(),
          )
          .subscribe(() => o(r.matches)),
        Object.assign(i, {
          set: s,
          update: (a) => s(a(i())),
          reset: () => {
            (t?.removeItem(e), o(r.matches));
          },
        })
      );
    },
  });
new E(``, { factory: dr(`months`) });
var ZX = new E(``, { factory: dr(`close`) });
new E(``, { factory: dr(`back`) });
var QX = new E(``, { factory: dr(`clear`) });
var XX = new E(``, { factory: dr(`nothingFoundMessage`) });
var JX = new E(``, { factory: dr(`defaultErrorMessage`) });
new E(``, { factory: dr(`spinTexts`) });
new E(``, { factory: dr(`shortWeekDays`) });
var Cb = new E(``, { factory: () => `` });
var wb = new E(``, { factory: () => `` });
var L1 = new E(``, { factory: () => ({}) });
var V1 = new E(``, {
  factory: () => {
    let t = v(x1);
    return (e) => `${t}/${e.replace(/@[a-z]+\./i, ``).replaceAll(`.`, `/`)}.svg`;
  },
});
function Pd(t) {
  return t?.match(/@([^.]*)\./)?.[1] || t || void 0;
}
function Ib() {
  let t = v(L1),
    e = v(V1);
  return (n) =>
    !n || n.includes(`/`)
      ? n.replace(/@[a-z]+\./i, ``)
      : n.startsWith(`@font.`)
        ? n.replace(`@font.`, ``)
        : (t[n] ?? e(n));
}
var rJ = new E(``);
var iJ = new E(``, {
  factory: () => {
    let t = v(lr);
    return {
      type: `viewport`,
      getClientRect() {
        let { height: e = 0, offsetTop: n = 0 } = t.visualViewport || {},
          r = {
            top: 0,
            left: 0,
            right: t.innerWidth,
            bottom: t.innerHeight,
            width: t.innerWidth,
            height: e + n || t.innerHeight,
            x: 0,
            y: 0,
          };
        return m(l({}, r), { toJSON: () => JSON.stringify(r) });
      },
    };
  },
});
var bb = { self: !0, optional: !0 };
var j1 = (() => {
  class t {
    static {
      this.ɵfac = function (r) {
        return new (r || t)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [[`ng-component`]],
        exportAs: [`tui-icons-5.19.0`],
        decls: 0,
        vars: 0,
        template: function (r, i) {},
        styles: [
          `:where([tuiIcons][data-tui-version="5.19.0"]){--%NS%t-icon-start: none;--%NS%t-icon-end: none;--%NS%t-zoom: clamp(0, var(--%NS%t-font-offset, 0) - 10, 1) }:where([tuiIcons][data-tui-version="5.19.0"]):before,:where([tuiIcons][data-tui-version="5.19.0"]):after{content:"";display:var(--%NS%t-icon-start);inline-size:1em;block-size:1em;line-height:1em;font-size:var(--%NS%tui-icon-size, 1.5rem);flex-shrink:0;box-sizing:content-box;background:currentColor;zoom:calc(100% + 25% * var(--%NS%t-zoom));-webkit-mask-image:var(--%NS%t-icon-start);mask-image:var(--%NS%t-icon-start);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:calc(min(1em,100%) + 10 * var(--%NS%tui-stroke-width)) min(1em,100%),100%;mask-size:calc(min(1em,100%) + 10 * var(--%NS%tui-stroke-width)) min(1em,100%),100%;mask-clip:padding-box}:where([tuiIcons][data-tui-version="5.19.0"]):after{display:var(--%NS%t-icon-end);-webkit-mask-image:var(--%NS%t-icon-end);mask-image:var(--%NS%t-icon-end)}:where([tuiIcons][data-tui-version="5.19.0"]):where([data-icon-start=img]):before{-webkit-mask-image:none;mask-image:none;background:var(--%NS%t-icon-start) no-repeat center / 1em padding-box}:where([tuiIcons][data-tui-version="5.19.0"]):where([data-icon-end=img]):after{-webkit-mask-image:none;mask-image:none;background:var(--%NS%t-icon-end) no-repeat center / 1em padding-box}:where([tuiIcons][data-tui-version="5.19.0"]):where([data-icon-start=font]):before,:where([tuiIcons][data-tui-version="5.19.0"]):where([data-icon-end=font]):after{display:grid;-webkit-mask-image:none;mask-image:none;background:none;font:1.5em / 1 var(--%NS%tui-font-icon, inherit);text-align:center;place-content:center;text-transform:none}:where([tuiIcons][data-tui-version="5.19.0"]):where([data-icon-start=font]):before{content:var(--%NS%t-icon-start)}:where([tuiIcons][data-tui-version="5.19.0"]):where([data-icon-end=font]):after{content:var(--%NS%t-icon-end)}
`,
        ],
        encapsulation: 2,
      });
    }
  }
  return t;
})();
var _c = (() => {
  class t {
    constructor() {
      ((this.resolver = Ib()),
        (this.nothing = db(j1)),
        (this.start = oe(() => this.resolve(this.iconStart()))),
        (this.end = oe(() => this.resolve(this.iconEnd()))),
        (this.startMode = oe(() => Pd(this.iconStart()))),
        (this.endMode = oe(() => Pd(this.iconEnd()))),
        (this.iconEnd = tr(v(wb, bb))),
        (this.iconStart = tr(v(Cb, bb))));
    }
    resolve(n) {
      return n ? (Pd(n) === `font` ? `'${this.resolver(n)}'` : `url(${this.resolver(n)})`) : null;
    }
    static {
      this.ɵfac = function (r) {
        return new (r || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        hostAttrs: [`data-tui-version`, `5.19.0`, `tuiIcons`, ``],
        hostVars: 6,
        hostBindings: function (r, i) {
          r & 2 &&
            (kr(`data-icon-end`, i.endMode())(`data-icon-start`, i.startMode()),
            Wo(`--%NS%t-icon-end`, i.end())(`--%NS%t-icon-start`, i.start()));
        },
        inputs: { iconEnd: [1, `iconEnd`], iconStart: [1, `iconStart`] },
      });
    }
  }
  return t;
})();
var pJ = (() => {
  class t {
    static {
      this.ɵfac = function (r) {
        return new (r || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        features: [
          Ta([{ directive: _c, inputs: [`iconStart`, `iconStart`, `iconEnd`, `iconEnd`] }]),
        ],
      });
    }
  }
  return t;
})();
var EJ = (() => {
  class t {
    constructor() {
      ((this.icons = v(_c)),
        (this.mask = oe(() => this.icons.resolve(this.background()))),
        (this.background = tr(``)));
    }
    static {
      this.ɵfac = function (r) {
        return new (r || t)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [[`tui-icon`, 3, `tuiBadge`, ``]],
        hostVars: 2,
        hostBindings: function (r, i) {
          r & 2 && Wo(`--%NS%t-icon-bg`, i.mask());
        },
        inputs: { background: [1, `background`] },
        features: [Ta([{ directive: _c, inputs: [`iconStart`, `icon`, `iconEnd`, `badge`] }])],
        decls: 0,
        vars: 0,
        template: function (r, i) {},
        styles: [
          `tui-icon:where(*[data-tui-version="5.19.0"]){--%NS%tui-icon-size: 1em;position:relative;display:inline-flex;inline-size:1em;block-size:1em;font-size:1.5rem;flex-shrink:0;border:0 solid transparent;vertical-align:middle;box-sizing:border-box;-webkit-mask-image:var(--%NS%t-icon-bg);mask-image:var(--%NS%t-icon-bg);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;-webkit-mask-size:calc(100% + 10 * var(--%NS%tui-stroke-width)) 100%;mask-size:calc(100% + 10 * var(--%NS%tui-stroke-width)) 100%;zoom:calc(100%*clamp(0px,var(--%NS%tui-font-offset) - 10px,1px)/.8px)}@media(hover:hover)and (pointer:fine){tui-icon:where(*[data-tui-version="5.19.0"])[data-appearance=icon]:hover{color:var(--%NS%tui-text-secondary)}}tui-icon:where(*[data-tui-version="5.19.0"])[tuiIcons]:before,tui-icon:where(*[data-tui-version="5.19.0"])[tuiIcons]:after{zoom:1}tui-icon:where(*[data-tui-version="5.19.0"])[data-icon-end]:before{-webkit-mask-image:var(--%NS%t-icon-start),radial-gradient(circle at bottom .1em right .1em,transparent calc(.4em - .5px),#000 .4em);mask-image:var(--%NS%t-icon-start),radial-gradient(circle at bottom .1em right .1em,transparent calc(.4em - .5px),#000 .4em);-webkit-mask-composite:source-in;mask-composite:intersect}tui-icon:where(*[data-tui-version="5.19.0"])[data-icon-end][data-icon-start=img]:before,tui-icon:where(*[data-tui-version="5.19.0"])[data-icon-end][data-icon-start=font]:before{-webkit-mask-image:radial-gradient(circle at bottom .1em right .1em,transparent calc(.4em - .5px),#000 .4em);mask-image:radial-gradient(circle at bottom .1em right .1em,transparent calc(.4em - .5px),#000 .4em)}tui-icon:where(*[data-tui-version="5.19.0"])[data-icon-end]:after{position:absolute;inset-block-start:0;inset-inline-start:0;inline-size:100%;block-size:100%}tui-icon:where(*[data-tui-version="5.19.0"])[data-icon-start]:before{position:absolute;inset-block-start:0;inset-inline-start:0;inline-size:100%;block-size:100%}tui-icon:where(*[data-tui-version="5.19.0"])[data-icon-start]:after{transform:translate(36%,36%);--%NS%tui-icon-size: .5715em}tui-icon:where(*[data-tui-version="5.19.0"])[data-icon-start=font]:before,tui-icon:where(*[data-tui-version="5.19.0"])[data-icon-end=font]:after{zoom:.667}
`,
        ],
        encapsulation: 2,
      });
    }
  }
  return t;
})();
function fr(t) {
  if (t === void 0)
    throw new ReferenceError(`this hasn't been initialised - super() hasn't been called`);
  return t;
}
function kb(t, e) {
  ((t.prototype = Object.create(e.prototype)), (t.prototype.constructor = t), (t.__proto__ = e));
}
var It = { autoSleep: 120, force3D: `auto`, nullTargetWarn: 1, units: { lineHeight: `` } };
var bc = { duration: 0.5, overwrite: !1, delay: 0 };
var Bm;
var Xe;
var De;
var en = 1e8;
var fe = 1 / en;
var xm = Math.PI * 2;
var B1 = xm / 4;
var H1 = 0;
var Pb = Math.sqrt;
var $1 = Math.cos;
var G1 = Math.sin;
var ze = function (e) {
  return typeof e == `string`;
};
var Te = function (e) {
  return typeof e == `function`;
};
var pr = function (e) {
  return typeof e == `number`;
};
var zd = function (e) {
  return typeof e > `u`;
};
var Pn = function (e) {
  return typeof e == `object`;
};
var wt = function (e) {
  return e !== !1;
};
var Hm = function () {
  return typeof window < `u`;
};
var Fd = function (e) {
  return Te(e) || ze(e);
};
var Fb = (typeof ArrayBuffer == `function` && ArrayBuffer.isView) || function () {};
var ut = Array.isArray;
var z1 = /random\([^)]+\)/g;
var W1 = /,\s*/g;
var Sb = /(?:-?\.?\d|\.)+/gi;
var $m = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g;
var Xi = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g;
var Im = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi;
var Gm = /[+-]=-?[.\d]+/;
var q1 = /[^,'"\[\]\s]+/gi;
var Y1 = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i;
var we;
var On;
var Rm;
var zm;
var Lt = {};
var Ud = {};
var Lb;
var Vb = function (e) {
  return (Ud = vs(e, Lt)) && lt;
};
var Wd = function (e, n) {
  return console.warn(`Invalid property`, e, `set to`, n, `Missing plugin? gsap.registerPlugin()`);
};
var Sc = function (e, n) {
  return !n && console.warn(e);
};
var jb = function (e, n) {
  return (e && (Lt[e] = n) && Ud && (Ud[e] = n)) || Lt;
};
var Tc = function () {
  return 0;
};
var Z1 = { suppressEvents: !0, isStart: !0, kill: !1 };
var Ld = { suppressEvents: !0, kill: !1 };
var K1 = { suppressEvents: !0 };
var Wm = {};
var Ur = [];
var Om = {};
var Ub;
var Et = {};
var bm = {};
var Tb = 30;
var Vd = [];
var qm = ``;
var Ym = function (e) {
  var n = e[0],
    r,
    i;
  if ((Pn(n) || Te(n) || (e = [e]), !(r = (n._gsap || {}).harness))) {
    for (i = Vd.length; i-- && !Vd[i].targetTest(n););
    r = Vd[i];
  }
  for (i = e.length; i--;)
    (e[i] && (e[i]._gsap || (e[i]._gsap = new Xm(e[i], r)))) || e.splice(i, 1);
  return e;
};
var Br = function (e) {
  return e._gsap || Ym(tn(e))[0]._gsap;
};
var Zm = function (e, n, r) {
  return (r = e[n]) && Te(r) ? e[n]() : (zd(r) && e.getAttribute && e.getAttribute(n)) || r;
};
var mt = function (e, n) {
  return (e = e.split(`,`)).forEach(n) || e;
};
var Me = function (e) {
  return Math.round(e * 1e5) / 1e5 || 0;
};
var Ce = function (e) {
  return Math.round(e * 1e7) / 1e7 || 0;
};
var Ji = function (e, n) {
  var r = n.charAt(0),
    i = parseFloat(n.substr(2));
  return ((e = parseFloat(e)), r === `+` ? e + i : r === `-` ? e - i : r === `*` ? e * i : e / i);
};
var Q1 = function (e, n) {
  for (var r = n.length, i = 0; e.indexOf(n[i]) < 0 && ++i < r;);
  return i < r;
};
var Bd = function () {
  var e = Ur.length,
    n = Ur.slice(0),
    r,
    i;
  for (Om = {}, Ur.length = 0, r = 0; r < e; r++)
    ((i = n[r]), i && i._lazy && (i.render(i._lazy[0], i._lazy[1], !0)._lazy = 0));
};
var Km = function (e) {
  return !!(e._initted || e._startAt || e.add);
};
var Bb = function (e, n, r, i) {
  (Ur.length && !Xe && Bd(),
    e.render(n, r, i || !!(Xe && n < 0 && Km(e))),
    Ur.length && !Xe && Bd());
};
var Hb = function (e) {
  var n = parseFloat(e);
  return (n || n === 0) && (e + ``).match(q1).length < 2 ? n : ze(e) ? e.trim() : e;
};
var $b = function (e) {
  return e;
};
var Vt = function (e, n) {
  for (var r in n) r in e || (e[r] = n[r]);
  return e;
};
var X1 = function (e) {
  return function (n, r) {
    for (var i in r) i in n || (i === `duration` && e) || i === `ease` || (n[i] = r[i]);
  };
};
var vs = function (e, n) {
  for (var r in n) e[r] = n[r];
  return e;
};
var Mb = function t(e, n) {
  for (var r in n)
    r !== `__proto__` &&
      r !== `constructor` &&
      r !== `prototype` &&
      (e[r] = Pn(n[r]) ? t(e[r] || (e[r] = {}), n[r]) : n[r]);
  return e;
};
var Hd = function (e, n) {
  var r = {},
    i;
  for (i in e) i in n || (r[i] = e[i]);
  return r;
};
var Cc = function (e) {
  var n = e.parent || we,
    r = e.keyframes ? X1(ut(e.keyframes)) : Vt;
  if (wt(e.inherit)) for (; n;) (r(e, n.vars.defaults), (n = n.parent || n._dp));
  return e;
};
var J1 = function (e, n) {
  for (var r = e.length, i = r === n.length; i && r-- && e[r] === n[r];);
  return r < 0;
};
var Gb = function (e, n, r, i, o) {
  (r === void 0 && (r = `_first`), i === void 0 && (i = `_last`));
  var s = e[i],
    a;
  if (o) for (a = n[o]; s && s[o] > a;) s = s._prev;
  return (
    s ? ((n._next = s._next), (s._next = n)) : ((n._next = e[r]), (e[r] = n)),
    n._next ? (n._next._prev = n) : (e[i] = n),
    (n._prev = s),
    (n.parent = n._dp = e),
    n
  );
};
var qd = function (e, n, r, i) {
  (r === void 0 && (r = `_first`), i === void 0 && (i = `_last`));
  var o = n._prev,
    s = n._next;
  (o ? (o._next = s) : e[r] === n && (e[r] = s),
    s ? (s._prev = o) : e[i] === n && (e[i] = o),
    (n._next = n._prev = n.parent = null));
};
var Hr = function (e, n) {
  (e.parent && (!n || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e),
    (e._act = 0));
};
var Zi = function (e, n) {
  if (e && (!n || n._end > e._dur || n._start < 0))
    for (var r = e; r;) ((r._dirty = 1), (r = r.parent));
  return e;
};
var eL = function (e) {
  for (var n = e.parent; n && n.parent;) ((n._dirty = 1), n.totalDuration(), (n = n.parent));
  return e;
};
var km = function (e, n, r, i) {
  return (
    e._startAt &&
    (Xe
      ? e._startAt.revert(Ld)
      : (e.vars.immediateRender && !e.vars.autoRevert) || e._startAt.render(n, !0, i))
  );
};
var tL = function t(e) {
  return !e || (e._ts && t(e.parent));
};
var Ab = function (e) {
  return e._repeat ? ys(e._tTime, (e = e.duration() + e._rDelay)) * e : 0;
};
var ys = function (e, n) {
  var r = Math.floor((e = Ce(e / n)));
  return e && r === e ? r - 1 : r;
};
var $d = function (e, n) {
  return (e - n._start) * n._ts + (n._ts >= 0 ? 0 : n._dirty ? n.totalDuration() : n._tDur);
};
var Yd = function (e) {
  return (e._end = Ce(e._start + (e._tDur / Math.abs(e._ts || e._rts || fe) || 0)));
};
var Zd = function (e, n) {
  var r = e._dp;
  return (
    r &&
      r.smoothChildTiming &&
      e._ts &&
      ((e._start = Ce(
        r._time - (e._ts > 0 ? n / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - n) / -e._ts),
      )),
      Yd(e),
      r._dirty || Zi(r, e)),
    e
  );
};
var zb = function (e, n) {
  var r;
  if (
    ((n._time || (!n._dur && n._initted) || (n._start < e._time && (n._dur || !n.add))) &&
      ((r = $d(e.rawTime(), n)),
      (!n._dur || Nc(0, n.totalDuration(), r) - n._tTime > fe) && n.render(r, !0)),
    Zi(e, n)._dp && e._initted && e._time >= e._dur && e._ts)
  ) {
    if (e._dur < e.duration())
      for (r = e; r._dp;) (r.rawTime() >= 0 && r.totalTime(r._tTime), (r = r._dp));
    e._zTime = -fe;
  }
};
var kn = function (e, n, r, i) {
  return (
    n.parent && Hr(n),
    (n._start = Ce((pr(r) ? r : r || e !== we ? Jt(e, r, n) : e._time) + n._delay)),
    (n._end = Ce(n._start + (n.totalDuration() / Math.abs(n.timeScale()) || 0))),
    Gb(e, n, `_first`, `_last`, e._sort ? `_start` : 0),
    Pm(n) || (e._recent = n),
    i || zb(e, n),
    e._ts < 0 && Zd(e, e._tTime),
    e
  );
};
var Wb = function (e, n) {
  return (Lt.ScrollTrigger || Wd(`scrollTrigger`, n)) && Lt.ScrollTrigger.create(n, e);
};
var qb = function (e, n, r, i, o) {
  if ((tv(e, n, o), !e._initted)) return 1;
  if (
    !r &&
    e._pt &&
    !Xe &&
    ((e._dur && e.vars.lazy !== !1) || (!e._dur && e.vars.lazy)) &&
    Ub !== Ct.frame
  )
    return (Ur.push(e), (e._lazy = [o, i]), 1);
};
var nL = function t(e) {
  var n = e.parent;
  return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || t(n));
};
var Pm = function (e) {
  var n = e.data;
  return n === `isFromStart` || n === `isStart`;
};
var rL = function (e, n, r, i) {
  var o = e.ratio,
    s =
      n < 0 ||
      (!n &&
        ((!e._start && nL(e) && !(!e._initted && Pm(e))) ||
          ((e._ts < 0 || e._dp._ts < 0) && !Pm(e))))
        ? 0
        : 1,
    a = e._rDelay,
    c = 0,
    u,
    l,
    d;
  if (
    (a &&
      e._repeat &&
      ((c = Nc(0, e._tDur, n)),
      (l = ys(c, a)),
      e._yoyo && l & 1 && (s = 1 - s),
      l !== ys(e._tTime, a) && ((o = 1 - s), e.vars.repeatRefresh && e._initted && e.invalidate())),
    s !== o || Xe || i || e._zTime === fe || (!n && e._zTime))
  ) {
    if (!e._initted && qb(e, n, i, r, c)) return;
    for (
      d = e._zTime,
        e._zTime = n || (r ? fe : 0),
        r || (r = n && !d),
        e.ratio = s,
        e._from && (s = 1 - s),
        e._time = 0,
        e._tTime = c,
        u = e._pt;
      u;
    )
      (u.r(s, u.d), (u = u._next));
    (n < 0 && km(e, n, r, !0),
      e._onUpdate && !r && Ft(e, `onUpdate`),
      c && e._repeat && !r && e.parent && Ft(e, `onRepeat`),
      (n >= e._tDur || n < 0) &&
        e.ratio === s &&
        (s && Hr(e, 1),
        !r && !Xe && (Ft(e, s ? `onComplete` : `onReverseComplete`, !0), e._prom && e._prom())));
  } else e._zTime || (e._zTime = n);
};
var iL = function (e, n, r) {
  var i;
  if (r > n)
    for (i = e._first; i && i._start <= r;) {
      if (i.data === `isPause` && i._start > n) return i;
      i = i._next;
    }
  else
    for (i = e._last; i && i._start >= r;) {
      if (i.data === `isPause` && i._start < n) return i;
      i = i._prev;
    }
};
var _s = function (e, n, r, i) {
  var o = e._repeat,
    s = Ce(n) || 0,
    a = e._tTime / e._tDur;
  return (
    a && !i && (e._time *= s / e._dur),
    (e._dur = s),
    (e._tDur = o ? (o < 0 ? 1e10 : Ce(s * (o + 1) + e._rDelay * o)) : s),
    a > 0 && !i && Zd(e, (e._tTime = e._tDur * a)),
    e.parent && Yd(e),
    r || Zi(e.parent, e),
    e
  );
};
var Nb = function (e) {
  return e instanceof ct ? Zi(e) : _s(e, e._dur);
};
var oL = { _start: 0, endTime: Tc, totalDuration: Tc };
var Jt = function t(e, n, r) {
  var i = e.labels,
    o = e._recent || oL,
    s = e.duration() >= en ? o.endTime(!1) : e._dur,
    a,
    c,
    u;
  return ze(n) && (isNaN(n) || n in i)
    ? ((c = n.charAt(0)),
      (u = n.substr(-1) === `%`),
      (a = n.indexOf(`=`)),
      c === `<` || c === `>`
        ? (a >= 0 && (n = n.replace(/=/, ``)),
          (c === `<` ? o._start : o.endTime(o._repeat >= 0)) +
            (parseFloat(n.substr(1)) || 0) * (u ? (a < 0 ? o : r).totalDuration() / 100 : 1))
        : a < 0
          ? (n in i || (i[n] = s), i[n])
          : ((c = parseFloat(n.charAt(a - 1) + n.substr(a + 1))),
            u && r && (c = (c / 100) * (ut(r) ? r[0] : r).totalDuration()),
            a > 1 ? t(e, n.substr(0, a - 1), r) + c : s + c))
    : n == null
      ? s
      : +n;
};
var wc = function (e, n, r) {
  var i = pr(n[1]),
    o = (i ? 2 : 1) + (e < 2 ? 0 : 1),
    s = n[o],
    a,
    c;
  if ((i && (s.duration = n[1]), (s.parent = r), e)) {
    for (a = s, c = r; c && !(`immediateRender` in a);)
      ((a = c.vars.defaults || {}), (c = wt(c.vars.inherit) && c.parent));
    ((s.immediateRender = wt(a.immediateRender)),
      e < 2 ? (s.runBackwards = 1) : (s.startAt = n[o - 1]));
  }
  return new Re(n[0], s, n[o + 1]);
};
var $r = function (e, n) {
  return e || e === 0 ? n(e) : n;
};
var Nc = function (e, n, r) {
  return r < e ? e : r > n ? n : r;
};
var Je = function (e, n) {
  return !ze(e) || !(n = Y1.exec(e)) ? `` : n[1];
};
var sL = function (e, n, r) {
  return $r(r, function (i) {
    return Nc(e, n, i);
  });
};
var Fm = [].slice;
var Yb = function (e, n) {
  return (
    e &&
    Pn(e) &&
    `length` in e &&
    ((!n && !e.length) || (e.length - 1 in e && Pn(e[0]))) &&
    !e.nodeType &&
    e !== On
  );
};
var aL = function (e, n, r) {
  return (
    r === void 0 && (r = []),
    e.forEach(function (i) {
      var o;
      return (ze(i) && !n) || Yb(i, 1) ? (o = r).push.apply(o, tn(i)) : r.push(i);
    }) || r
  );
};
var tn = function (e, n, r) {
  return De && !n && De.selector
    ? De.selector(e)
    : ze(e) && !r && (Rm || !Ds())
      ? Fm.call((n || zm).querySelectorAll(e), 0)
      : ut(e)
        ? aL(e, r)
        : Yb(e)
          ? Fm.call(e, 0)
          : e
            ? [e]
            : [];
};
var Lm = function (e) {
  return (
    (e = tn(e)[0] || Sc(`Invalid scope`) || {}),
    function (n) {
      var r = e.current || e.nativeElement || e;
      return tn(
        n,
        r.querySelectorAll ? r : r === e ? Sc(`Invalid scope`) || zm.createElement(`div`) : e,
      );
    }
  );
};
var Zb = function (e) {
  return e.sort(function () {
    return 0.5 - Math.random();
  });
};
var Kb = function (e) {
  if (Te(e)) return e;
  var n = Pn(e) ? e : { each: e },
    r = Ki(n.ease),
    i = n.from || 0,
    o = parseFloat(n.base) || 0,
    s = {},
    a = i > 0 && i < 1,
    c = isNaN(i) || a,
    u = n.axis,
    l = i,
    d = i;
  return (
    ze(i)
      ? (l = d = { center: 0.5, edges: 0.5, end: 1 }[i] || 0)
      : !a && c && ((l = i[0]), (d = i[1])),
    function (f, h, g) {
      var p = (g || n).length,
        m = s[p],
        y,
        _,
        w,
        b,
        C,
        N,
        T,
        M,
        S;
      if (!m) {
        if (((S = n.grid === `auto` ? 0 : (n.grid || [1, en])[1]), !S)) {
          for (T = -en; T < (T = g[S++].getBoundingClientRect().left) && S < p;);
          S < p && S--;
        }
        for (
          m = s[p] = [],
            y = c ? Math.min(S, p) * l - 0.5 : i % S,
            _ = S === en ? 0 : c ? (p * d) / S - 0.5 : (i / S) | 0,
            T = 0,
            M = en,
            N = 0;
          N < p;
          N++
        )
          ((w = (N % S) - y),
            (b = _ - ((N / S) | 0)),
            (m[N] = C = u ? Math.abs(u === `y` ? b : w) : Pb(w * w + b * b)),
            C > T && (T = C),
            C < M && (M = C));
        (i === `random` && Zb(m),
          (m.max = T - M),
          (m.min = M),
          (m.v = p =
            (parseFloat(n.amount) ||
              parseFloat(n.each) *
                (S > p ? p - 1 : u ? (u === `y` ? p / S : S) : Math.max(S, p / S)) ||
              0) * (i === `edges` ? -1 : 1)),
          (m.b = p < 0 ? o - p : o),
          (m.u = Je(n.amount || n.each) || 0),
          (r = r && p < 0 ? DL(r) : r));
      }
      return ((p = (m[f] - m.min) / m.max || 0), Ce(m.b + (r ? r(p) : p) * m.v) + m.u);
    }
  );
};
var Vm = function (e) {
  var n = Math.pow(10, ((e + ``).split(`.`)[1] || ``).length);
  return function (r) {
    var i = Ce(Math.round(parseFloat(r) / e) * e * n);
    return (i - (i % 1)) / n + (pr(r) ? 0 : Je(r));
  };
};
var Qb = function (e, n) {
  var r = ut(e),
    i,
    o;
  return (
    !r &&
      Pn(e) &&
      ((i = r = e.radius || en),
      e.values ? ((e = tn(e.values)), (o = !pr(e[0])) && (i *= i)) : (e = Vm(e.increment))),
    $r(
      n,
      r
        ? Te(e)
          ? function (s) {
              return ((o = e(s)), Math.abs(o - s) <= i ? o : s);
            }
          : function (s) {
              for (
                var a = parseFloat(o ? s.x : s),
                  c = parseFloat(o ? s.y : 0),
                  u = en,
                  l = 0,
                  d = e.length,
                  f,
                  h;
                d--;
              )
                (o
                  ? ((f = e[d].x - a), (h = e[d].y - c), (f = f * f + h * h))
                  : (f = Math.abs(e[d] - a)),
                  f < u && ((u = f), (l = d)));
              return ((l = !i || u <= i ? e[l] : s), o || l === s || pr(s) ? l : l + Je(s));
            }
        : Vm(e),
    )
  );
};
var Xb = function (e, n, r, i) {
  return $r(ut(e) ? !n : r === !0 ? !!(r = 0) : !i, function () {
    return ut(e)
      ? e[~~(Math.random() * e.length)]
      : (r = r || 1e-5) &&
          (i = r < 1 ? Math.pow(10, (r + ``).length - 2) : 1) &&
          Math.floor(Math.round((e - r / 2 + Math.random() * (n - e + r * 0.99)) / r) * r * i) / i;
  });
};
var cL = function () {
  for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++) n[r] = arguments[r];
  return function (i) {
    return n.reduce(function (o, s) {
      return s(o);
    }, i);
  };
};
var uL = function (e, n) {
  return function (r) {
    return e(parseFloat(r)) + (n || Je(r));
  };
};
var lL = function (e, n, r) {
  return eS(e, n, 0, 1, r);
};
var Jb = function (e, n, r) {
  return $r(r, function (i) {
    return e[~~n(i)];
  });
};
var dL = function t(e, n, r) {
  var i = n - e;
  return ut(e)
    ? Jb(e, t(0, e.length), n)
    : $r(r, function (o) {
        return ((i + ((o - e) % i)) % i) + e;
      });
};
var fL = function t(e, n, r) {
  var i = n - e,
    o = i * 2;
  return ut(e)
    ? Jb(e, t(0, e.length - 1), n)
    : $r(r, function (s) {
        return ((s = (o + ((s - e) % o)) % o || 0), e + (s > i ? o - s : s));
      });
};
var Es = function (e) {
  return e.replace(z1, function (n) {
    var r = n.indexOf(`[`) + 1,
      i = n.substring(r || 7, r ? n.indexOf(`]`) : n.length - 1).split(W1);
    return Xb(r ? i : +i[0], r ? 0 : +i[1], +i[2] || 1e-5);
  });
};
var eS = function (e, n, r, i, o) {
  var s = n - e,
    a = i - r;
  return $r(o, function (c) {
    return r + (((c - e) / s) * a || 0);
  });
};
var hL = function t(e, n, r, i) {
  var o = isNaN(e + n)
    ? 0
    : function (h) {
        return (1 - h) * e + h * n;
      };
  if (!o) {
    var s = ze(e),
      a = {},
      c,
      u,
      l,
      d,
      f;
    if ((r === !0 && (i = 1) && (r = null), s)) ((e = { p: e }), (n = { p: n }));
    else if (ut(e) && !ut(n)) {
      for (l = [], d = e.length, f = d - 2, u = 1; u < d; u++) l.push(t(e[u - 1], e[u]));
      (d--,
        (o = function (g) {
          g *= d;
          var p = Math.min(f, ~~g);
          return l[p](g - p);
        }),
        (r = n));
    } else i || (e = vs(ut(e) ? [] : {}, e));
    if (!l) {
      for (c in n) Jm.call(a, e, c, `get`, n[c]);
      o = function (g) {
        return iv(g, a) || (s ? e.p : e);
      };
    }
  }
  return $r(r, o);
};
var xb = function (e, n, r) {
  var i = e.labels,
    o = en,
    s,
    a,
    c;
  for (s in i) ((a = i[s] - n), a < 0 == !!r && a && o > (a = Math.abs(a)) && ((c = s), (o = a)));
  return c;
};
var Ft = function (e, n, r) {
  var i = e.vars,
    o = i[n],
    s = De,
    a = e._ctx,
    c,
    u,
    l;
  if (o)
    return (
      (c = i[n + `Params`]),
      (u = i.callbackScope || e),
      r && Ur.length && Bd(),
      a && (De = a),
      (l = c ? o.apply(u, c) : o.call(u)),
      (De = s),
      l
    );
};
var Dc = function (e) {
  return (
    Hr(e),
    e.scrollTrigger && e.scrollTrigger.kill(!!Xe),
    e.progress() < 1 && Ft(e, `onInterrupt`),
    e
  );
};
var ms;
var tS = [];
var nS = function (e) {
  if (e)
    if (((e = (!e.name && e.default) || e), Hm() || e.headless)) {
      var n = e.name,
        r = Te(e),
        i =
          n && !r && e.init
            ? function () {
                this._props = [];
              }
            : e,
        o = { init: Tc, render: iv, add: Jm, kill: NL, modifier: AL, rawVars: 0 },
        s = { targetTest: 0, get: 0, getSetter: Kd, aliases: {}, register: 0 };
      if ((Ds(), e !== i)) {
        if (Et[n]) return;
        (Vt(i, Vt(Hd(e, o), s)),
          vs(i.prototype, vs(o, Hd(e, s))),
          (Et[(i.prop = n)] = i),
          e.targetTest && (Vd.push(i), (Wm[n] = 1)),
          (n = (n === `css` ? `CSS` : n.charAt(0).toUpperCase() + n.substr(1)) + `Plugin`));
      }
      (jb(n, i), e.register && e.register(lt, i, vt));
    } else tS.push(e);
};
var de = 255;
var Ec = {
  aqua: [0, de, de],
  lime: [0, de, 0],
  silver: [192, 192, 192],
  black: [0, 0, 0],
  maroon: [128, 0, 0],
  teal: [0, 128, 128],
  blue: [0, 0, de],
  navy: [0, 0, 128],
  white: [de, de, de],
  olive: [128, 128, 0],
  yellow: [de, de, 0],
  orange: [de, 165, 0],
  gray: [128, 128, 128],
  purple: [128, 0, 128],
  green: [0, 128, 0],
  red: [de, 0, 0],
  pink: [de, 192, 203],
  cyan: [0, de, de],
  transparent: [de, de, de, 0],
};
var Sm = function (e, n, r) {
  return (
    (e += e < 0 ? 1 : e > 1 ? -1 : 0),
    ((e * 6 < 1
      ? n + (r - n) * e * 6
      : e < 0.5
        ? r
        : e * 3 < 2
          ? n + (r - n) * (2 / 3 - e) * 6
          : n) *
      de +
      0.5) |
      0
  );
};
var rS = function (e, n, r) {
  var i = e ? (pr(e) ? [e >> 16, (e >> 8) & de, e & de] : 0) : Ec.black,
    o,
    s,
    a,
    c,
    u,
    l,
    d,
    f,
    h,
    g;
  if (!i) {
    if ((e.substr(-1) === `,` && (e = e.substr(0, e.length - 1)), Ec[e])) i = Ec[e];
    else if (e.charAt(0) === `#`) {
      if (
        (e.length < 6 &&
          ((o = e.charAt(1)),
          (s = e.charAt(2)),
          (a = e.charAt(3)),
          (e = `#` + o + o + s + s + a + a + (e.length === 5 ? e.charAt(4) + e.charAt(4) : ``))),
        e.length === 9)
      )
        return (
          (i = parseInt(e.substr(1, 6), 16)),
          [i >> 16, (i >> 8) & de, i & de, parseInt(e.substr(7), 16) / 255]
        );
      ((e = parseInt(e.substr(1), 16)), (i = [e >> 16, (e >> 8) & de, e & de]));
    } else if (e.substr(0, 3) === `hsl`) {
      if (((i = g = e.match(Sb)), !n))
        ((c = (+i[0] % 360) / 360),
          (u = +i[1] / 100),
          (l = +i[2] / 100),
          (s = l <= 0.5 ? l * (u + 1) : l + u - l * u),
          (o = l * 2 - s),
          i.length > 3 && (i[3] *= 1),
          (i[0] = Sm(c + 1 / 3, o, s)),
          (i[1] = Sm(c, o, s)),
          (i[2] = Sm(c - 1 / 3, o, s)));
      else if (~e.indexOf(`=`)) return ((i = e.match($m)), r && i.length < 4 && (i[3] = 1), i);
    } else i = e.match(Sb) || Ec.transparent;
    i = i.map(Number);
  }
  return (
    n &&
      !g &&
      ((o = i[0] / de),
      (s = i[1] / de),
      (a = i[2] / de),
      (d = Math.max(o, s, a)),
      (f = Math.min(o, s, a)),
      (l = (d + f) / 2),
      d === f
        ? (c = u = 0)
        : ((h = d - f),
          (u = l > 0.5 ? h / (2 - d - f) : h / (d + f)),
          (c =
            d === o ? (s - a) / h + (s < a ? 6 : 0) : d === s ? (a - o) / h + 2 : (o - s) / h + 4),
          (c *= 60)),
      (i[0] = ~~(c + 0.5)),
      (i[1] = ~~(u * 100 + 0.5)),
      (i[2] = ~~(l * 100 + 0.5))),
    r && i.length < 4 && (i[3] = 1),
    i
  );
};
var iS = function (e) {
  var n = [],
    r = [],
    i = -1;
  return (
    e.split(hr).forEach(function (o) {
      var s = o.match(Xi) || [];
      (n.push.apply(n, s), r.push((i += s.length + 1)));
    }),
    (n.c = r),
    n
  );
};
var Rb = function (e, n, r) {
  var i = ``,
    o = (e + i).match(hr),
    s = n ? `hsla(` : `rgba(`,
    a = 0,
    c,
    u,
    l,
    d;
  if (!o) return e;
  if (
    ((o = o.map(function (f) {
      return (
        (f = rS(f, n, 1)) &&
        s + (n ? f[0] + `,` + f[1] + `%,` + f[2] + `%,` + f[3] : f.join(`,`)) + `)`
      );
    })),
    r && ((l = iS(e)), (c = r.c), c.join(i) !== l.c.join(i)))
  )
    for (u = e.replace(hr, `1`).split(Xi), d = u.length - 1; a < d; a++)
      i +=
        u[a] +
        (~c.indexOf(a) ? o.shift() || s + `0,0,0,0)` : (l.length ? l : o.length ? o : r).shift());
  if (!u) for (u = e.split(hr), d = u.length - 1; a < d; a++) i += u[a] + o[a];
  return i + u[d];
};
var hr = (function () {
  var t = `(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b`,
    e;
  for (e in Ec) t += `|` + e + `\\b`;
  return new RegExp(t + `)`, `gi`);
})();
var pL = /hsl[a]?\(/;
var Qm = function (e) {
  var n = e.join(` `),
    r;
  if (((hr.lastIndex = 0), hr.test(n)))
    return ((r = pL.test(n)), (e[1] = Rb(e[1], r)), (e[0] = Rb(e[0], r, iS(e[1]))), !0);
};
var Mc;
var Ct = (function () {
  var t = Date.now,
    e = 500,
    n = 33,
    r = t(),
    i = r,
    o = 1e3 / 240,
    s = o,
    a = [],
    c,
    u,
    l,
    d,
    f,
    h,
    g = function p(m) {
      var y = t() - i,
        _ = m === !0,
        w,
        b,
        C,
        N;
      if (
        ((y > e || y < 0) && (r += y - n),
        (i += y),
        (C = i - r),
        (w = C - s),
        (w > 0 || _) &&
          ((N = ++d.frame),
          (f = C - d.time * 1e3),
          (d.time = C = C / 1e3),
          (s += w + (w >= o ? 4 : o - w)),
          (b = 1)),
        _ || (c = u(p)),
        b)
      )
        for (h = 0; h < a.length; h++) a[h](C, f, N, m);
    };
  return (
    (d = {
      time: 0,
      frame: 0,
      tick: function () {
        g(!0);
      },
      deltaRatio: function (m) {
        return f / (1e3 / (m || 60));
      },
      wake: function () {
        Lb &&
          (!Rm &&
            Hm() &&
            ((On = Rm = window),
            (zm = On.document || {}),
            (Lt.gsap = lt),
            (On.gsapVersions || (On.gsapVersions = [])).push(lt.version),
            Vb(Ud || On.GreenSockGlobals || (!On.gsap && On) || {}),
            tS.forEach(nS)),
          (l = typeof requestAnimationFrame < `u` && requestAnimationFrame),
          c && d.sleep(),
          (u =
            l ||
            function (m) {
              return setTimeout(m, (s - d.time * 1e3 + 1) | 0);
            }),
          (Mc = 1),
          g(2));
      },
      sleep: function () {
        ((l ? cancelAnimationFrame : clearTimeout)(c), (Mc = 0), (u = Tc));
      },
      lagSmoothing: function (m, y) {
        ((e = m || Infinity), (n = Math.min(y || 33, e)));
      },
      fps: function (m) {
        ((o = 1e3 / (m || 240)), (s = d.time * 1e3 + o));
      },
      add: function (m, y, _) {
        var w = y
          ? function (b, C, N, T) {
              (m(b, C, N, T), d.remove(w));
            }
          : m;
        return (d.remove(m), a[_ ? `unshift` : `push`](w), Ds(), w);
      },
      remove: function (m, y) {
        ~(y = a.indexOf(m)) && a.splice(y, 1) && h >= y && h--;
      },
      _listeners: a,
    }),
    d
  );
})();
var Ds = function () {
  return !Mc && Ct.wake();
};
var Z = {};
var gL = /^[\d.\-M][\d.\-,\s]/;
var mL = /["']/g;
var vL = function (e) {
  for (
    var n = {}, r = e.substr(1, e.length - 3).split(`:`), i = r[0], o = 1, s = r.length, a, c, u;
    o < s;
    o++
  )
    ((c = r[o]),
      (a = o !== s - 1 ? c.lastIndexOf(`,`) : c.length),
      (u = c.substr(0, a)),
      (n[i] = isNaN(u) ? u.replace(mL, ``).trim() : +u),
      (i = c.substr(a + 1).trim()));
  return n;
};
var yL = function (e) {
  var n = e.indexOf(`(`) + 1,
    r = e.indexOf(`)`),
    i = e.indexOf(`(`, n);
  return e.substring(n, ~i && i < r ? e.indexOf(`)`, r + 1) : r);
};
var _L = function (e) {
  var n = (e + ``).split(`(`),
    r = Z[n[0]];
  return r && n.length > 1 && r.config
    ? r.config.apply(null, ~e.indexOf(`{`) ? [vL(n[1])] : yL(e).split(`,`).map(Hb))
    : Z._CE && gL.test(e)
      ? Z._CE(``, e)
      : r;
};
var DL = function (e) {
  return function (n) {
    return 1 - e(1 - n);
  };
};
var Ki = function (e, n) {
  return (e && (Te(e) ? e : Z[e] || _L(e))) || n;
};
var eo = function (e, n, r, i) {
  (r === void 0 &&
    (r = function (c) {
      return 1 - n(1 - c);
    }),
    i === void 0 &&
      (i = function (c) {
        return c < 0.5 ? n(c * 2) / 2 : 1 - n((1 - c) * 2) / 2;
      }));
  var o = { easeIn: n, easeOut: r, easeInOut: i },
    s;
  return (
    mt(e, function (a) {
      ((Z[a] = Lt[a] = o), (Z[(s = a.toLowerCase())] = r));
      for (var c in o)
        Z[s + (c === `easeIn` ? `.in` : c === `easeOut` ? `.out` : `.inOut`)] = Z[a + `.` + c] =
          o[c];
    }),
    o
  );
};
var oS = function (e) {
  return function (n) {
    return n < 0.5 ? (1 - e(1 - n * 2)) / 2 : 0.5 + e((n - 0.5) * 2) / 2;
  };
};
var Tm = function t(e, n, r) {
  var i = n >= 1 ? n : 1,
    o = (r || (e ? 0.3 : 0.45)) / (n < 1 ? n : 1),
    s = (o / xm) * (Math.asin(1 / i) || 0),
    a = function (l) {
      return l === 1 ? 1 : i * Math.pow(2, -10 * l) * G1((l - s) * o) + 1;
    },
    c =
      e === `out`
        ? a
        : e === `in`
          ? function (u) {
              return 1 - a(1 - u);
            }
          : oS(a);
  return (
    (o = xm / o),
    (c.config = function (u, l) {
      return t(e, u, l);
    }),
    c
  );
};
var Mm = function t(e, n) {
  n === void 0 && (n = 1.70158);
  var r = function (s) {
      return s ? --s * s * ((n + 1) * s + n) + 1 : 0;
    },
    i =
      e === `out`
        ? r
        : e === `in`
          ? function (o) {
              return 1 - r(1 - o);
            }
          : oS(r);
  return (
    (i.config = function (o) {
      return t(e, o);
    }),
    i
  );
};
mt(`Linear,Quad,Cubic,Quart,Quint,Strong`, function (t, e) {
  var n = e < 5 ? e + 1 : e;
  eo(
    t + `,Power` + (n - 1),
    e
      ? function (r) {
          return Math.pow(r, n);
        }
      : function (r) {
          return r;
        },
    function (r) {
      return 1 - Math.pow(1 - r, n);
    },
    function (r) {
      return r < 0.5 ? Math.pow(r * 2, n) / 2 : 1 - Math.pow((1 - r) * 2, n) / 2;
    },
  );
});
Z.Linear.easeNone = Z.none = Z.Linear.easeIn;
eo(`Elastic`, Tm(`in`), Tm(`out`), Tm());
(function (t, e) {
  var n = 1 / e,
    r = 2 * n,
    i = 2.5 * n,
    o = function (a) {
      return a < n
        ? t * a * a
        : a < r
          ? t * Math.pow(a - 1.5 / e, 2) + 0.75
          : a < i
            ? t * (a -= 2.25 / e) * a + 0.9375
            : t * Math.pow(a - 2.625 / e, 2) + 0.984375;
    };
  eo(
    `Bounce`,
    function (s) {
      return 1 - o(1 - s);
    },
    o,
  );
})(7.5625, 2.75);
eo(`Expo`, function (t) {
  return Math.pow(2, 10 * (t - 1)) * t + t * t * t * t * t * t * (1 - t);
});
eo(`Circ`, function (t) {
  return -(Pb(1 - t * t) - 1);
});
eo(`Sine`, function (t) {
  return t === 1 ? 1 : -$1(t * B1) + 1;
});
eo(`Back`, Mm(`in`), Mm(`out`), Mm());
Z.SteppedEase =
  Z.steps =
  Lt.SteppedEase =
    {
      config: function (e, n) {
        e === void 0 && (e = 1);
        var r = 1 / e,
          i = e + (n ? 0 : 1),
          o = n ? 1 : 0,
          s = 1 - fe;
        return function (a) {
          return (((i * Nc(0, s, a)) | 0) + o) * r;
        };
      },
    };
bc.ease = Z[`quad.out`];
mt(`onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt`, function (t) {
  return (qm += t + `,` + t + `Params,`);
});
var Xm = function (e, n) {
  ((this.id = H1++),
    (e._gsap = this),
    (this.target = e),
    (this.harness = n),
    (this.get = n ? n.get : Zm),
    (this.set = n ? n.getSetter : Kd));
};
var Ac = (function () {
  function t(n) {
    ((this.vars = n),
      (this._delay = +n.delay || 0),
      (this._repeat = n.repeat === Infinity ? -2 : n.repeat || 0) &&
        ((this._rDelay = n.repeatDelay || 0), (this._yoyo = !!n.yoyo || !!n.yoyoEase)),
      (this._ts = 1),
      _s(this, +n.duration, 1, 1),
      (this.data = n.data),
      De && ((this._ctx = De), De.data.push(this)),
      Mc || Ct.wake());
  }
  var e = t.prototype;
  return (
    (e.delay = function (r) {
      return r || r === 0
        ? (this.parent &&
            this.parent.smoothChildTiming &&
            this.startTime(this._start + r - this._delay),
          (this._delay = r),
          this)
        : this._delay;
    }),
    (e.duration = function (r) {
      return arguments.length
        ? this.totalDuration(this._repeat > 0 ? r + (r + this._rDelay) * this._repeat : r)
        : this.totalDuration() && this._dur;
    }),
    (e.totalDuration = function (r) {
      return arguments.length
        ? ((this._dirty = 0),
          _s(this, this._repeat < 0 ? r : (r - this._repeat * this._rDelay) / (this._repeat + 1)))
        : this._tDur;
    }),
    (e.totalTime = function (r, i) {
      if ((Ds(), !arguments.length)) return this._tTime;
      var o = this._dp;
      if (o && o.smoothChildTiming && this._ts) {
        for (Zd(this, r), !o._dp || o.parent || zb(o, this); o && o.parent;)
          (o.parent._time !==
            o._start + (o._ts >= 0 ? o._tTime / o._ts : (o.totalDuration() - o._tTime) / -o._ts) &&
            o.totalTime(o._tTime, !0),
            (o = o.parent));
        !this.parent &&
          this._dp.autoRemoveChildren &&
          ((this._ts > 0 && r < this._tDur) || (this._ts < 0 && r > 0) || (!this._tDur && !r)) &&
          kn(this._dp, this, this._start - this._delay);
      }
      return (
        (this._tTime !== r ||
          (!this._dur && !i) ||
          (this._initted && Math.abs(this._zTime) === fe) ||
          (!this._initted && this._dur && r) ||
          (!r && !this._initted && (this.add || this._ptLookup))) &&
          (this._ts || (this._pTime = r), Bb(this, r, i)),
        this
      );
    }),
    (e.time = function (r, i) {
      return arguments.length
        ? this.totalTime(
            Math.min(this.totalDuration(), r + Ab(this)) % (this._dur + this._rDelay) ||
              (r ? this._dur : 0),
            i,
          )
        : this._time;
    }),
    (e.totalProgress = function (r, i) {
      return arguments.length
        ? this.totalTime(this.totalDuration() * r, i)
        : this.totalDuration()
          ? Math.min(1, this._tTime / this._tDur)
          : this.rawTime() >= 0 && this._initted
            ? 1
            : 0;
    }),
    (e.progress = function (r, i) {
      return arguments.length
        ? this.totalTime(
            this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - r : r) + Ab(this),
            i,
          )
        : this.duration()
          ? Math.min(1, this._time / this._dur)
          : this.rawTime() > 0
            ? 1
            : 0;
    }),
    (e.iteration = function (r, i) {
      var o = this.duration() + this._rDelay;
      return arguments.length
        ? this.totalTime(this._time + (r - 1) * o, i)
        : this._repeat
          ? ys(this._tTime, o) + 1
          : 1;
    }),
    (e.timeScale = function (r, i) {
      if (!arguments.length) return this._rts === -fe ? 0 : this._rts;
      if (this._rts === r) return this;
      var o = this.parent && this._ts ? $d(this.parent._time, this) : this._tTime;
      return (
        (this._rts = +r || 0),
        (this._ts = this._ps || r === -fe ? 0 : this._rts),
        this.totalTime(Nc(-Math.abs(this._delay), this.totalDuration(), o), i !== !1),
        Yd(this),
        eL(this)
      );
    }),
    (e.paused = function (r) {
      return arguments.length
        ? (this._ps !== r &&
            ((this._ps = r),
            r
              ? ((this._pTime = this._tTime || Math.max(-this._delay, this.rawTime())),
                (this._ts = this._act = 0))
              : (Ds(),
                (this._ts = this._rts),
                this.totalTime(
                  this.parent && !this.parent.smoothChildTiming
                    ? this.rawTime()
                    : this._tTime || this._pTime,
                  this.progress() === 1 && Math.abs(this._zTime) !== fe && (this._tTime -= fe),
                ))),
          this)
        : this._ps;
    }),
    (e.startTime = function (r) {
      if (arguments.length) {
        this._start = Ce(r);
        var i = this.parent || this._dp;
        return (i && (i._sort || !this.parent) && kn(i, this, this._start - this._delay), this);
      }
      return this._start;
    }),
    (e.endTime = function (r) {
      return (
        this._start + (wt(r) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1)
      );
    }),
    (e.rawTime = function (r) {
      var i = this.parent || this._dp;
      return i
        ? r && (!this._ts || (this._repeat && this._time && this.totalProgress() < 1))
          ? this._tTime % (this._dur + this._rDelay)
          : this._ts
            ? $d(i.rawTime(r), this)
            : this._tTime
        : this._tTime;
    }),
    (e.revert = function (r) {
      r === void 0 && (r = K1);
      var i = Xe;
      return (
        (Xe = r),
        Km(this) &&
          (this.timeline && this.timeline.revert(r), this.totalTime(-0.01, r.suppressEvents)),
        this.data !== `nested` && r.kill !== !1 && this.kill(),
        (Xe = i),
        this
      );
    }),
    (e.globalTime = function (r) {
      for (var i = this, o = arguments.length ? r : i.rawTime(); i;)
        ((o = i._start + o / (Math.abs(i._ts) || 1)), (i = i._dp));
      return !this.parent && this._sat ? this._sat.globalTime(r) : o;
    }),
    (e.repeat = function (r) {
      return arguments.length
        ? ((this._repeat = r === Infinity ? -2 : r), Nb(this))
        : this._repeat === -2
          ? Infinity
          : this._repeat;
    }),
    (e.repeatDelay = function (r) {
      if (arguments.length) {
        var i = this._time;
        return ((this._rDelay = r), Nb(this), i ? this.time(i) : this);
      }
      return this._rDelay;
    }),
    (e.yoyo = function (r) {
      return arguments.length ? ((this._yoyo = r), this) : this._yoyo;
    }),
    (e.seek = function (r, i) {
      return this.totalTime(Jt(this, r), wt(i));
    }),
    (e.restart = function (r, i) {
      return (
        this.play().totalTime(r ? -this._delay : 0, wt(i)),
        this._dur || (this._zTime = -fe),
        this
      );
    }),
    (e.play = function (r, i) {
      return (r != null && this.seek(r, i), this.reversed(!1).paused(!1));
    }),
    (e.reverse = function (r, i) {
      return (r != null && this.seek(r || this.totalDuration(), i), this.reversed(!0).paused(!1));
    }),
    (e.pause = function (r, i) {
      return (r != null && this.seek(r, i), this.paused(!0));
    }),
    (e.resume = function () {
      return this.paused(!1);
    }),
    (e.reversed = function (r) {
      return arguments.length
        ? (!!r !== this.reversed() && this.timeScale(-this._rts || (r ? -fe : 0)), this)
        : this._rts < 0;
    }),
    (e.invalidate = function () {
      return ((this._initted = this._act = 0), (this._zTime = -fe), this);
    }),
    (e.isActive = function () {
      var r = this.parent || this._dp,
        i = this._start,
        o;
      return !!(
        !r ||
        (this._ts &&
          this._initted &&
          r.isActive() &&
          (o = r.rawTime(!0)) >= i &&
          o < this.endTime(!0) - fe)
      );
    }),
    (e.eventCallback = function (r, i, o) {
      var s = this.vars;
      return arguments.length > 1
        ? (i
            ? ((s[r] = i), o && (s[r + `Params`] = o), r === `onUpdate` && (this._onUpdate = i))
            : delete s[r],
          this)
        : s[r];
    }),
    (e.then = function (r) {
      var i = this,
        o = i._prom;
      return new Promise(function (s) {
        var a = Te(r) ? r : $b,
          c = function () {
            var l = i.then;
            ((i.then = null),
              o && o(),
              Te(a) && (a = a(i)) && (a.then || a === i) && (i.then = l),
              s(a),
              (i.then = l));
          };
        (i._initted && i.totalProgress() === 1 && i._ts >= 0) || (!i._tTime && i._ts < 0)
          ? c()
          : (i._prom = c);
      });
    }),
    (e.kill = function () {
      Dc(this);
    }),
    t
  );
})();
Vt(Ac.prototype, {
  _time: 0,
  _start: 0,
  _end: 0,
  _tTime: 0,
  _tDur: 0,
  _dirty: 0,
  _repeat: 0,
  _yoyo: !1,
  parent: null,
  _initted: !1,
  _rDelay: 0,
  _ts: 1,
  _dp: 0,
  ratio: 0,
  _zTime: -fe,
  _prom: 0,
  _ps: !1,
  _rts: 1,
});
var ct = (function (t) {
  kb(e, t);
  function e(r, i) {
    var o;
    return (
      r === void 0 && (r = {}),
      (o = t.call(this, r) || this),
      (o.labels = {}),
      (o.smoothChildTiming = !!r.smoothChildTiming),
      (o.autoRemoveChildren = !!r.autoRemoveChildren),
      (o._sort = wt(r.sortChildren)),
      we && kn(r.parent || we, fr(o), i),
      r.reversed && o.reverse(),
      r.paused && o.paused(!0),
      r.scrollTrigger && Wb(fr(o), r.scrollTrigger),
      o
    );
  }
  var n = e.prototype;
  return (
    (n.to = function (i, o, s) {
      return (wc(0, arguments, this), this);
    }),
    (n.from = function (i, o, s) {
      return (wc(1, arguments, this), this);
    }),
    (n.fromTo = function (i, o, s, a) {
      return (wc(2, arguments, this), this);
    }),
    (n.set = function (i, o, s) {
      return (
        (o.duration = 0),
        (o.parent = this),
        Cc(o).repeatDelay || (o.repeat = 0),
        (o.immediateRender = !!o.immediateRender),
        new Re(i, o, Jt(this, s), 1),
        this
      );
    }),
    (n.call = function (i, o, s) {
      return kn(this, Re.delayedCall(0, i, o), s);
    }),
    (n.staggerTo = function (i, o, s, a, c, u, l) {
      return (
        (s.duration = o),
        (s.stagger = s.stagger || a),
        (s.onComplete = u),
        (s.onCompleteParams = l),
        (s.parent = this),
        new Re(i, s, Jt(this, c)),
        this
      );
    }),
    (n.staggerFrom = function (i, o, s, a, c, u, l) {
      return (
        (s.runBackwards = 1),
        (Cc(s).immediateRender = wt(s.immediateRender)),
        this.staggerTo(i, o, s, a, c, u, l)
      );
    }),
    (n.staggerFromTo = function (i, o, s, a, c, u, l, d) {
      return (
        (a.startAt = s),
        (Cc(a).immediateRender = wt(a.immediateRender)),
        this.staggerTo(i, o, a, c, u, l, d)
      );
    }),
    (n.render = function (i, o, s) {
      var a = this._time,
        c = this._dirty ? this.totalDuration() : this._tDur,
        u = this._dur,
        l = i <= 0 ? 0 : Ce(i),
        d = this._zTime < 0 != i < 0 && (this._initted || !u),
        f,
        h,
        g,
        p,
        m,
        y,
        _,
        w,
        b,
        C,
        N,
        T;
      if ((this !== we && l > c && i >= 0 && (l = c), l !== this._tTime || s || d)) {
        if (
          (a !== this._time && u && ((l += this._time - a), (i += this._time - a)),
          (f = l),
          (b = this._start),
          (w = this._ts),
          (y = !w),
          d && (u || (a = this._zTime), (i || !o) && (this._zTime = i)),
          this._repeat)
        ) {
          if (((N = this._yoyo), (m = u + this._rDelay), this._repeat < -1 && i < 0))
            return this.totalTime(m * 100 + i, o, s);
          if (
            ((f = Ce(l % m)),
            l === c
              ? ((p = this._repeat), (f = u))
              : ((C = Ce(l / m)), (p = ~~C), p && p === C && ((f = u), p--), f > u && (f = u)),
            (C = ys(this._tTime, m)),
            !a && this._tTime && C !== p && this._tTime - C * m - this._dur <= 0 && (C = p),
            N && p & 1 && ((f = u - f), (T = 1)),
            p !== C && !this._lock)
          ) {
            var M = N && C & 1,
              S = M === (N && p & 1);
            if (
              (p < C && (M = !M),
              (a = M ? 0 : l % u ? u : l),
              (this._lock = 1),
              (this.render(a || (T ? 0 : Ce(p * m)), o, !u)._lock = 0),
              (this._tTime = l),
              !o && this.parent && Ft(this, `onRepeat`),
              this.vars.repeatRefresh && !T && ((this.invalidate()._lock = 1), (C = p)),
              (a && a !== this._time) ||
                y !== !this._ts ||
                (this.vars.onRepeat && !this.parent && !this._act))
            )
              return this;
            if (
              ((u = this._dur),
              (c = this._tDur),
              S &&
                ((this._lock = 2),
                (a = M ? u : -1e-4),
                this.render(a, !0),
                this.vars.repeatRefresh && !T && this.invalidate()),
              (this._lock = 0),
              !this._ts && !y)
            )
              return this;
          }
        }
        if (
          (this._hasPause &&
            !this._forcing &&
            this._lock < 2 &&
            ((_ = iL(this, Ce(a), Ce(f))), _ && (l -= f - (f = _._start))),
          (this._tTime = l),
          (this._time = f),
          (this._act = !!w),
          this._initted ||
            ((this._onUpdate = this.vars.onUpdate),
            (this._initted = 1),
            (this._zTime = i),
            (a = 0)),
          !a && l && u && !o && !C && (Ft(this, `onStart`), this._tTime !== l))
        )
          return this;
        if (f >= a && i >= 0)
          for (h = this._first; h;) {
            if (((g = h._next), (h._act || f >= h._start) && h._ts && _ !== h)) {
              if (h.parent !== this) return this.render(i, o, s);
              if (
                (h.render(
                  h._ts > 0
                    ? (f - h._start) * h._ts
                    : (h._dirty ? h.totalDuration() : h._tDur) + (f - h._start) * h._ts,
                  o,
                  s,
                ),
                f !== this._time || (!this._ts && !y))
              ) {
                ((_ = 0), g && (l += this._zTime = -fe));
                break;
              }
            }
            h = g;
          }
        else {
          h = this._last;
          for (var $ = i < 0 ? i : f; h;) {
            if (((g = h._prev), (h._act || $ <= h._end) && h._ts && _ !== h)) {
              if (h.parent !== this) return this.render(i, o, s);
              if (
                (h.render(
                  h._ts > 0
                    ? ($ - h._start) * h._ts
                    : (h._dirty ? h.totalDuration() : h._tDur) + ($ - h._start) * h._ts,
                  o,
                  s || (Xe && Km(h)),
                ),
                f !== this._time || (!this._ts && !y))
              ) {
                ((_ = 0), g && (l += this._zTime = $ ? -fe : fe));
                break;
              }
            }
            h = g;
          }
        }
        if (
          _ &&
          !o &&
          (this.pause(), (_.render(f >= a ? 0 : -fe)._zTime = f >= a ? 1 : -1), this._ts)
        )
          return ((this._start = b), Yd(this), this.render(i, o, s));
        (this._onUpdate && !o && Ft(this, `onUpdate`, !0),
          ((l === c && this._tTime >= this.totalDuration()) || (!l && a)) &&
            (b === this._start || Math.abs(w) !== Math.abs(this._ts)) &&
            (this._lock ||
              ((i || !u) && ((l === c && this._ts > 0) || (!l && this._ts < 0)) && Hr(this, 1),
              !o &&
                !(i < 0 && !a) &&
                (l || a || !c) &&
                (Ft(this, l === c && i >= 0 ? `onComplete` : `onReverseComplete`, !0),
                this._prom && !(l < c && this.timeScale() > 0) && this._prom()))));
      }
      return this;
    }),
    (n.add = function (i, o) {
      var s = this;
      if ((pr(o) || (o = Jt(this, o, i)), !(i instanceof Ac))) {
        if (ut(i))
          return (
            i.forEach(function (a) {
              return s.add(a, o);
            }),
            this
          );
        if (ze(i)) return this.addLabel(i, o);
        if (Te(i)) i = Re.delayedCall(0, i);
        else return this;
      }
      return this !== i ? kn(this, i, o) : this;
    }),
    (n.getChildren = function (i, o, s, a) {
      (i === void 0 && (i = !0),
        o === void 0 && (o = !0),
        s === void 0 && (s = !0),
        a === void 0 && (a = -en));
      for (var c = [], u = this._first; u;)
        (u._start >= a &&
          (u instanceof Re
            ? o && c.push(u)
            : (s && c.push(u), i && c.push.apply(c, u.getChildren(!0, o, s)))),
          (u = u._next));
      return c;
    }),
    (n.getById = function (i) {
      for (var o = this.getChildren(1, 1, 1), s = o.length; s--;)
        if (o[s].vars.id === i) return o[s];
    }),
    (n.remove = function (i) {
      return ze(i)
        ? this.removeLabel(i)
        : Te(i)
          ? this.killTweensOf(i)
          : (i.parent === this && qd(this, i),
            i === this._recent && (this._recent = this._last),
            Zi(this));
    }),
    (n.totalTime = function (i, o) {
      return arguments.length
        ? ((this._forcing = 1),
          !this._dp &&
            this._ts &&
            (this._start = Ce(
              Ct.time - (this._ts > 0 ? i / this._ts : (this.totalDuration() - i) / -this._ts),
            )),
          t.prototype.totalTime.call(this, i, o),
          (this._forcing = 0),
          this)
        : this._tTime;
    }),
    (n.addLabel = function (i, o) {
      return ((this.labels[i] = Jt(this, o)), this);
    }),
    (n.removeLabel = function (i) {
      return (delete this.labels[i], this);
    }),
    (n.addPause = function (i, o, s) {
      var a = Re.delayedCall(0, o || Tc, s);
      return ((a.data = `isPause`), (this._hasPause = 1), kn(this, a, Jt(this, i)));
    }),
    (n.removePause = function (i) {
      var o = this._first;
      for (i = Jt(this, i); o;) (o._start === i && o.data === `isPause` && Hr(o), (o = o._next));
    }),
    (n.killTweensOf = function (i, o, s) {
      for (var a = this.getTweensOf(i, s), c = a.length; c--;) jr !== a[c] && a[c].kill(i, o);
      return this;
    }),
    (n.getTweensOf = function (i, o) {
      for (var s = [], a = tn(i), c = this._first, u = pr(o), l; c;)
        (c instanceof Re
          ? Q1(c._targets, a) &&
            (u
              ? (!jr || (c._initted && c._ts)) &&
                c.globalTime(0) <= o &&
                c.globalTime(c.totalDuration()) > o
              : !o || c.isActive()) &&
            s.push(c)
          : (l = c.getTweensOf(a, o)).length && s.push.apply(s, l),
          (c = c._next));
      return s;
    }),
    (n.tweenTo = function (i, o) {
      o = o || {};
      var s = this,
        a = Jt(s, i),
        c = o,
        u = c.startAt,
        l = c.onStart,
        d = c.onStartParams,
        f = c.immediateRender,
        h,
        g = Re.to(
          s,
          Vt(
            {
              ease: o.ease || `none`,
              lazy: !1,
              immediateRender: !1,
              time: a,
              overwrite: `auto`,
              duration:
                o.duration ||
                Math.abs((a - (u && `time` in u ? u.time : s._time)) / s.timeScale()) ||
                fe,
              onStart: function () {
                if ((s.pause(), !h)) {
                  var m =
                    o.duration ||
                    Math.abs((a - (u && `time` in u ? u.time : s._time)) / s.timeScale());
                  (g._dur !== m && _s(g, m, 0, 1).render(g._time, !0, !0), (h = 1));
                }
                l && l.apply(g, d || []);
              },
            },
            o,
          ),
        );
      return f ? g.render(0) : g;
    }),
    (n.tweenFromTo = function (i, o, s) {
      return this.tweenTo(o, Vt({ startAt: { time: Jt(this, i) } }, s));
    }),
    (n.recent = function () {
      return this._recent;
    }),
    (n.nextLabel = function (i) {
      return (i === void 0 && (i = this._time), xb(this, Jt(this, i)));
    }),
    (n.previousLabel = function (i) {
      return (i === void 0 && (i = this._time), xb(this, Jt(this, i), 1));
    }),
    (n.currentLabel = function (i) {
      return arguments.length ? this.seek(i, !0) : this.previousLabel(this._time + fe);
    }),
    (n.shiftChildren = function (i, o, s) {
      s === void 0 && (s = 0);
      var a = this._first,
        c = this.labels,
        u;
      for (i = Ce(i); a;) (a._start >= s && ((a._start += i), (a._end += i)), (a = a._next));
      if (o) for (u in c) c[u] >= s && (c[u] += i);
      return Zi(this);
    }),
    (n.invalidate = function (i) {
      var o = this._first;
      for (this._lock = 0; o;) (o.invalidate(i), (o = o._next));
      return t.prototype.invalidate.call(this, i);
    }),
    (n.clear = function (i) {
      i === void 0 && (i = !0);
      for (var o = this._first, s; o;) ((s = o._next), this.remove(o), (o = s));
      return (
        this._dp && (this._time = this._tTime = this._pTime = 0),
        i && (this.labels = {}),
        Zi(this)
      );
    }),
    (n.totalDuration = function (i) {
      var o = 0,
        s = this,
        a = s._last,
        c = en,
        u,
        l,
        d;
      if (arguments.length)
        return s.timeScale(
          (s._repeat < 0 ? s.duration() : s.totalDuration()) / (s.reversed() ? -i : i),
        );
      if (s._dirty) {
        for (d = s.parent; a;)
          ((u = a._prev),
            a._dirty && a.totalDuration(),
            (l = a._start),
            l > c && s._sort && a._ts && !s._lock
              ? ((s._lock = 1), (kn(s, a, l - a._delay, 1)._lock = 0))
              : (c = l),
            l < 0 &&
              a._ts &&
              ((o -= l),
              ((!d && !s._dp) || (d && d.smoothChildTiming)) &&
                ((s._start += Ce(l / s._ts)), (s._time -= l), (s._tTime -= l)),
              s.shiftChildren(-l, !1, -Infinity),
              (c = 0)),
            a._end > o && a._ts && (o = a._end),
            (a = u));
        (_s(s, s === we && s._time > o ? s._time : o, 1, 1), (s._dirty = 0));
      }
      return s._tDur;
    }),
    (e.updateRoot = function (i) {
      if ((we._ts && (Bb(we, $d(i, we)), (Ub = Ct.frame)), Ct.frame >= Tb)) {
        Tb += It.autoSleep || 120;
        var o = we._first;
        if ((!o || !o._ts) && It.autoSleep && Ct._listeners.length < 2) {
          for (; o && !o._ts;) o = o._next;
          o || Ct.sleep();
        }
      }
    }),
    e
  );
})(Ac);
Vt(ct.prototype, { _lock: 0, _hasPause: 0, _forcing: 0 });
var EL = function (e, n, r, i, o, s, a) {
  var c = new vt(this._pt, e, n, 0, 1, rv, null, o),
    u = 0,
    l = 0,
    d,
    f,
    h,
    g,
    p,
    m,
    y,
    _;
  for (
    c.b = r,
      c.e = i,
      r += ``,
      i += ``,
      (y = ~i.indexOf(`random(`)) && (i = Es(i)),
      s && ((_ = [r, i]), s(_, e, n), (r = _[0]), (i = _[1])),
      f = r.match(Im) || [];
    (d = Im.exec(i));
  )
    ((g = d[0]),
      (p = i.substring(u, d.index)),
      h ? (h = (h + 1) % 5) : p.substr(-5) === `rgba(` && (h = 1),
      g !== f[l++] &&
        ((m = parseFloat(f[l - 1]) || 0),
        (c._pt = {
          _next: c._pt,
          p: p || l === 1 ? p : `,`,
          s: m,
          c: g.charAt(1) === `=` ? Ji(m, g) - m : parseFloat(g) - m,
          m: h && h < 4 ? Math.round : 0,
        }),
        (u = Im.lastIndex)));
  return (
    (c.c = u < i.length ? i.substring(u, i.length) : ``),
    (c.fp = a),
    (Gm.test(i) || y) && (c.e = 0),
    (this._pt = c),
    c
  );
};
var Jm = function (e, n, r, i, o, s, a, c, u, l) {
  Te(i) && (i = i(o || 0, e, s));
  var d = e[n],
    f =
      r !== `get`
        ? r
        : Te(d)
          ? u
            ? e[n.indexOf(`set`) || !Te(e[`get` + n.substr(3)]) ? n : `get` + n.substr(3)](u)
            : e[n]()
          : d,
    h = Te(d) ? (u ? SL : cS) : nv,
    g;
  if (
    (ze(i) &&
      (~i.indexOf(`random(`) && (i = Es(i)),
      i.charAt(1) === `=` && ((g = Ji(f, i) + (Je(f) || 0)), (g || g === 0) && (i = g))),
    !l || f !== i || jm)
  )
    return !isNaN(f * i) && i !== ``
      ? ((g = new vt(this._pt, e, n, +f || 0, i - (f || 0), typeof d == `boolean` ? ML : uS, 0, h)),
        u && (g.fp = u),
        a && g.modifier(a, this, e),
        (this._pt = g))
      : (!d && !(n in e) && Wd(n, i), EL.call(this, e, n, f, i, h, c || It.stringFilter, u));
};
var CL = function (e, n, r, i, o) {
  if ((Te(e) && (e = Ic(e, o, n, r, i)), !Pn(e) || (e.style && e.nodeType) || ut(e) || Fb(e)))
    return ze(e) ? Ic(e, o, n, r, i) : e;
  var s = {},
    a;
  for (a in e) s[a] = Ic(e[a], o, n, r, i);
  return s;
};
var ev = function (e, n, r, i, o, s) {
  var a, c, u, l;
  if (
    Et[e] &&
    (a = new Et[e]()).init(o, a.rawVars ? n[e] : CL(n[e], i, o, s, r), r, i, s) !== !1 &&
    ((r._pt = c = new vt(r._pt, o, e, 0, 1, a.render, a, 0, a.priority)), r !== ms)
  )
    for (u = r._ptLookup[r._targets.indexOf(o)], l = a._props.length; l--;) u[a._props[l]] = c;
  return a;
};
var jr;
var jm;
var tv = function t(e, n, r) {
  var i = e.vars,
    o = i.ease,
    s = i.startAt,
    a = i.immediateRender,
    c = i.lazy,
    u = i.onUpdate,
    l = i.runBackwards,
    d = i.yoyoEase,
    f = i.keyframes,
    h = i.autoRevert,
    g = e._dur,
    p = e._startAt,
    m = e._targets,
    y = e.parent,
    _ = y && y.data === `nested` ? y.vars.targets : m,
    w = e._overwrite === `auto` && !Bm,
    b = e.timeline,
    C = i.easeReverse || d,
    N,
    T,
    M,
    S,
    $,
    me,
    he,
    ce,
    be,
    We,
    Le,
    Ae,
    Ut;
  if (
    (b && (!f || !o) && (o = `none`),
    (e._ease = Ki(o, bc.ease)),
    (e._rEase = C && (Ki(C) || e._ease)),
    (e._from = !b && !!i.runBackwards),
    e._from && (e.ratio = 1),
    !b || (f && !i.stagger))
  ) {
    if (
      ((ce = m[0] ? Br(m[0]).harness : 0),
      (Ae = ce && i[ce.prop]),
      (N = Hd(i, Wm)),
      p &&
        (p._zTime < 0 && p.progress(1),
        n < 0 && l && a && !h ? p.render(-1, !0) : p.revert(l && g ? Ld : Z1),
        (p._lazy = 0)),
      s)
    ) {
      if (
        (Hr(
          (e._startAt = Re.set(
            m,
            Vt(
              {
                data: `isStart`,
                overwrite: !1,
                parent: y,
                immediateRender: !0,
                lazy: !p && wt(c),
                startAt: null,
                delay: 0,
                onUpdate:
                  u &&
                  function () {
                    return Ft(e, `onUpdate`);
                  },
                stagger: 0,
              },
              s,
            ),
          )),
        ),
        (e._startAt._dp = 0),
        (e._startAt._sat = e),
        n < 0 && (Xe || (!a && !h)) && e._startAt.revert(Ld),
        a && g && n <= 0 && r <= 0)
      ) {
        n && (e._zTime = n);
        return;
      }
    } else if (l && g && !p) {
      if (
        (n && (a = !1),
        (M = Vt(
          {
            overwrite: !1,
            data: `isFromStart`,
            lazy: a && !p && wt(c),
            immediateRender: a,
            stagger: 0,
            parent: y,
          },
          N,
        )),
        Ae && (M[ce.prop] = Ae),
        Hr((e._startAt = Re.set(m, M))),
        (e._startAt._dp = 0),
        (e._startAt._sat = e),
        n < 0 && (Xe ? e._startAt.revert(Ld) : e._startAt.render(-1, !0)),
        (e._zTime = n),
        !a)
      )
        t(e._startAt, fe, fe);
      else if (!n) return;
    }
    for (e._pt = e._ptCache = 0, c = (g && wt(c)) || (c && !g), T = 0; T < m.length; T++) {
      if (
        (($ = m[T]),
        (he = $._gsap || Ym(m)[T]._gsap),
        (e._ptLookup[T] = We = {}),
        Om[he.id] && Ur.length && Bd(),
        (Le = _ === m ? T : _.indexOf($)),
        ce &&
          (be = new ce()).init($, Ae || N, e, Le, _) !== !1 &&
          ((e._pt = S = new vt(e._pt, $, be.name, 0, 1, be.render, be, 0, be.priority)),
          be._props.forEach(function (oo) {
            We[oo] = S;
          }),
          be.priority && (me = 1)),
        !ce || Ae)
      )
        for (M in N)
          Et[M] && (be = ev(M, N, e, Le, $, _))
            ? be.priority && (me = 1)
            : (We[M] = S = Jm.call(e, $, M, `get`, N[M], Le, _, 0, i.stringFilter));
      (e._op && e._op[T] && e.kill($, e._op[T]),
        w &&
          e._pt &&
          ((jr = e), we.killTweensOf($, We, e.globalTime(n)), (Ut = !e.parent), (jr = 0)),
        e._pt && c && (Om[he.id] = 1));
    }
    (me && ov(e), e._onInit && e._onInit(e));
  }
  ((e._onUpdate = u), (e._initted = (!e._op || e._pt) && !Ut), f && n <= 0 && b.render(en, !0, !0));
};
var wL = function (e, n, r, i, o, s, a, c) {
  var u = ((e._pt && e._ptCache) || (e._ptCache = {}))[n],
    l,
    d,
    f,
    h;
  if (!u)
    for (u = e._ptCache[n] = [], f = e._ptLookup, h = e._targets.length; h--;) {
      if (((l = f[h][n]), l && l.d && l.d._pt))
        for (l = l.d._pt; l && l.p !== n && l.fp !== n;) l = l._next;
      if (!l)
        return (
          (jm = 1),
          (e.vars[n] = `+=0`),
          tv(e, a),
          (jm = 0),
          c ? Sc(n + ` not eligible for reset. Try splitting into individual properties`) : 1
        );
      u.push(l);
    }
  for (h = u.length; h--;)
    ((d = u[h]),
      (l = d._pt || d),
      (l.s = (i || i === 0) && !o ? i : l.s + (i || 0) + s * l.c),
      (l.c = r - l.s),
      d.e && (d.e = Me(r) + Je(d.e)),
      d.b && (d.b = l.s + Je(d.b)));
};
var IL = function (e, n) {
  var r = e[0] ? Br(e[0]).harness : 0,
    i = r && r.aliases,
    o,
    s,
    a,
    c;
  if (!i) return n;
  o = vs({}, n);
  for (s in i) if (s in o) for (c = i[s].split(`,`), a = c.length; a--;) o[c[a]] = o[s];
  return o;
};
var bL = function (e, n, r, i) {
  var o = n.ease || i || `power1.inOut`,
    s,
    a;
  if (ut(n))
    ((a = r[e] || (r[e] = [])),
      n.forEach(function (c, u) {
        return a.push({ t: (u / (n.length - 1)) * 100, v: c, e: o });
      }));
  else
    for (s in n)
      ((a = r[s] || (r[s] = [])), s === `ease` || a.push({ t: parseFloat(e), v: n[s], e: o }));
};
var Ic = function (e, n, r, i, o) {
  return Te(e) ? e.call(n, r, i, o) : ze(e) && ~e.indexOf(`random(`) ? Es(e) : e;
};
var sS = qm + `repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert`;
var aS = {};
mt(sS + `,id,stagger,delay,duration,paused,scrollTrigger`, function (t) {
  return (aS[t] = 1);
});
var Re = (function (t) {
  kb(e, t);
  function e(r, i, o, s) {
    var a;
    (typeof i == `number` && ((o.duration = i), (i = o), (o = null)),
      (a = t.call(this, s ? i : Cc(i)) || this));
    var c = a.vars,
      u = c.duration,
      l = c.delay,
      d = c.immediateRender,
      f = c.stagger,
      h = c.overwrite,
      g = c.keyframes,
      p = c.defaults,
      m = c.scrollTrigger,
      y = i.parent || we,
      _ = (ut(r) || Fb(r) ? pr(r[0]) : `length` in i) ? [r] : tn(r),
      w,
      b,
      C,
      N,
      T,
      M,
      S,
      $;
    if (
      ((a._targets = _.length
        ? Ym(_)
        : Sc(`GSAP target ` + r + ` not found. https://gsap.com`, !It.nullTargetWarn) || []),
      (a._ptLookup = []),
      (a._overwrite = h),
      g || f || Fd(u) || Fd(l))
    ) {
      i = a.vars;
      var me = i.easeReverse || i.yoyoEase;
      if (
        ((w = a.timeline =
          new ct({
            data: `nested`,
            defaults: p || {},
            targets: y && y.data === `nested` ? y.vars.targets : _,
          })),
        w.kill(),
        (w.parent = w._dp = fr(a)),
        (w._start = 0),
        f || Fd(u) || Fd(l))
      ) {
        if (((N = _.length), (S = f && Kb(f)), Pn(f)))
          for (T in f) ~sS.indexOf(T) && ($ || ($ = {}), ($[T] = f[T]));
        for (b = 0; b < N; b++)
          ((C = Hd(i, aS)),
            (C.stagger = 0),
            me && (C.easeReverse = me),
            $ && vs(C, $),
            (M = _[b]),
            (C.duration = +Ic(u, fr(a), b, M, _)),
            (C.delay = (+Ic(l, fr(a), b, M, _) || 0) - a._delay),
            !f && N === 1 && C.delay && ((a._delay = l = C.delay), (a._start += l), (C.delay = 0)),
            w.to(M, C, S ? S(b, M, _) : 0),
            (w._ease = Z.none));
        w.duration() ? (u = l = 0) : (a.timeline = 0);
      } else if (g) {
        (Cc(Vt(w.vars.defaults, { ease: `none` })), (w._ease = Ki(g.ease || i.ease || `none`)));
        var he = 0,
          ce,
          be,
          We;
        if (ut(g))
          (g.forEach(function (Le) {
            return w.to(_, Le, `>`);
          }),
            w.duration());
        else {
          C = {};
          for (T in g) T === `ease` || T === `easeEach` || bL(T, g[T], C, g.easeEach);
          for (T in C)
            for (
              ce = C[T].sort(function (Le, Ae) {
                return Le.t - Ae.t;
              }),
                he = 0,
                b = 0;
              b < ce.length;
              b++
            )
              ((be = ce[b]),
                (We = { ease: be.e, duration: ((be.t - (b ? ce[b - 1].t : 0)) / 100) * u }),
                (We[T] = be.v),
                w.to(_, We, he),
                (he += We.duration));
          w.duration() < u && w.to({}, { duration: u - w.duration() });
        }
      }
      u || a.duration((u = w.duration()));
    } else a.timeline = 0;
    return (
      h === !0 && !Bm && ((jr = fr(a)), we.killTweensOf(_), (jr = 0)),
      kn(y, fr(a), o),
      i.reversed && a.reverse(),
      i.paused && a.paused(!0),
      (d || (!u && !g && a._start === Ce(y._time) && wt(d) && tL(fr(a)) && y.data !== `nested`)) &&
        ((a._tTime = -fe), a.render(Math.max(0, -l) || 0)),
      m && Wb(fr(a), m),
      a
    );
  }
  var n = e.prototype;
  return (
    (n.render = function (i, o, s) {
      var a = this._time,
        c = this._tDur,
        u = this._dur,
        l = i < 0,
        d = i > c - fe && !l ? c : i < fe ? 0 : i,
        f,
        h,
        g,
        p,
        m,
        y,
        _,
        w;
      if (!u) rL(this, i, o, s);
      else if (
        d !== this._tTime ||
        !i ||
        s ||
        (!this._initted && this._tTime) ||
        (this._startAt && this._zTime < 0 !== l) ||
        this._lazy
      ) {
        if (((f = d), (w = this.timeline), this._repeat)) {
          if (((p = u + this._rDelay), this._repeat < -1 && l))
            return this.totalTime(p * 100 + i, o, s);
          if (
            ((f = Ce(d % p)),
            d === c
              ? ((g = this._repeat), (f = u))
              : ((m = Ce(d / p)), (g = ~~m), g && g === m ? ((f = u), g--) : f > u && (f = u)),
            (y = this._yoyo && g & 1),
            y && (f = u - f),
            (m = ys(this._tTime, p)),
            f === a && !s && this._initted && g === m)
          )
            return ((this._tTime = d), this);
          g !== m &&
            this.vars.repeatRefresh &&
            !y &&
            !this._lock &&
            f !== p &&
            this._initted &&
            ((this._lock = s = 1), (this.render(Ce(p * g), !0).invalidate()._lock = 0));
        }
        if (!this._initted) {
          if (qb(this, l ? i : f, s, o, d)) return ((this._tTime = 0), this);
          if (a !== this._time && !(s && this.vars.repeatRefresh && g !== m)) return this;
          if (u !== this._dur) return this.render(i, o, s);
        }
        if (this._rEase) {
          var b = f < a;
          if (b !== this._inv) {
            var C = b ? a : u - a;
            ((this._inv = b),
              this._from && (this.ratio = 1 - this.ratio),
              (this._invRatio = this.ratio),
              (this._invTime = a),
              (this._invRecip = C ? (b ? -1 : 1) / C : 0),
              (this._invScale = b ? -this.ratio : 1 - this.ratio),
              (this._invEase = b ? this._rEase : this._ease));
          }
          this.ratio = _ =
            this._invRatio + this._invScale * this._invEase((f - this._invTime) * this._invRecip);
        } else this.ratio = _ = this._ease(f / u);
        if (
          (this._from && (this.ratio = _ = 1 - _),
          (this._tTime = d),
          (this._time = f),
          !this._act && this._ts && ((this._act = 1), (this._lazy = 0)),
          !a && d && !o && !m && (Ft(this, `onStart`), this._tTime !== d))
        )
          return this;
        for (h = this._pt; h;) (h.r(_, h.d), (h = h._next));
        ((w && w.render(i < 0 ? i : w._dur * w._ease(f / this._dur), o, s)) ||
          (this._startAt && (this._zTime = i)),
          this._onUpdate && !o && (l && km(this, i, o, s), Ft(this, `onUpdate`)),
          this._repeat &&
            g !== m &&
            this.vars.onRepeat &&
            !o &&
            this.parent &&
            Ft(this, `onRepeat`),
          (d === this._tDur || !d) &&
            this._tTime === d &&
            (l && !this._onUpdate && km(this, i, !0, !0),
            (i || !u) &&
              ((d === this._tDur && this._ts > 0) || (!d && this._ts < 0)) &&
              Hr(this, 1),
            !o &&
              !(l && !a) &&
              (d || a || y) &&
              (Ft(this, d === c ? `onComplete` : `onReverseComplete`, !0),
              this._prom && !(d < c && this.timeScale() > 0) && this._prom())));
      }
      return this;
    }),
    (n.targets = function () {
      return this._targets;
    }),
    (n.invalidate = function (i) {
      return (
        (!i || !this.vars.runBackwards) && (this._startAt = 0),
        (this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0),
        (this._ptLookup = []),
        this.timeline && this.timeline.invalidate(i),
        t.prototype.invalidate.call(this, i)
      );
    }),
    (n.resetTo = function (i, o, s, a, c) {
      (Mc || Ct.wake(), this._ts || this.play());
      var u = Math.min(this._dur, (this._dp._time - this._start) * this._ts),
        l;
      return (
        this._initted || tv(this, u),
        (l = this._ease(u / this._dur)),
        wL(this, i, o, s, a, l, u, c)
          ? this.resetTo(i, o, s, a, 1)
          : (Zd(this, 0),
            this.parent || Gb(this._dp, this, `_first`, `_last`, this._dp._sort ? `_start` : 0),
            this.render(0))
      );
    }),
    (n.kill = function (i, o) {
      if ((o === void 0 && (o = `all`), !i && (!o || o === `all`)))
        return (
          (this._lazy = this._pt = 0),
          this.parent ? Dc(this) : this.scrollTrigger && this.scrollTrigger.kill(!!Xe),
          this
        );
      if (this.timeline) {
        var s = this.timeline.totalDuration();
        return (
          this.timeline.killTweensOf(i, o, jr && jr.vars.overwrite !== !0)._first || Dc(this),
          this.parent &&
            s !== this.timeline.totalDuration() &&
            _s(this, (this._dur * this.timeline._tDur) / s, 0, 1),
          this
        );
      }
      var a = this._targets,
        c = i ? tn(i) : a,
        u = this._ptLookup,
        l = this._pt,
        d,
        f,
        h,
        g,
        p,
        m,
        y;
      if ((!o || o === `all`) && J1(a, c)) return (o === `all` && (this._pt = 0), Dc(this));
      for (
        d = this._op = this._op || [],
          o !== `all` &&
            (ze(o) &&
              ((p = {}),
              mt(o, function (_) {
                return (p[_] = 1);
              }),
              (o = p)),
            (o = IL(a, o))),
          y = a.length;
        y--;
      )
        if (~c.indexOf(a[y])) {
          ((f = u[y]),
            o === `all` ? ((d[y] = o), (g = f), (h = {})) : ((h = d[y] = d[y] || {}), (g = o)));
          for (p in g)
            ((m = f && f[p]),
              m && ((!(`kill` in m.d) || m.d.kill(p) === !0) && qd(this, m, `_pt`), delete f[p]),
              h !== `all` && (h[p] = 1));
        }
      return (this._initted && !this._pt && l && Dc(this), this);
    }),
    (e.to = function (i, o) {
      return new e(i, o, arguments[2]);
    }),
    (e.from = function (i, o) {
      return wc(1, arguments);
    }),
    (e.delayedCall = function (i, o, s, a) {
      return new e(o, 0, {
        immediateRender: !1,
        lazy: !1,
        overwrite: !1,
        delay: i,
        onComplete: o,
        onReverseComplete: o,
        onCompleteParams: s,
        onReverseCompleteParams: s,
        callbackScope: a,
      });
    }),
    (e.fromTo = function (i, o, s) {
      return wc(2, arguments);
    }),
    (e.set = function (i, o) {
      return ((o.duration = 0), o.repeatDelay || (o.repeat = 0), new e(i, o));
    }),
    (e.killTweensOf = function (i, o, s) {
      return we.killTweensOf(i, o, s);
    }),
    e
  );
})(Ac);
Vt(Re.prototype, { _targets: [], _lazy: 0, _startAt: 0, _op: 0, _onInit: 0 });
mt(`staggerTo,staggerFrom,staggerFromTo`, function (t) {
  Re[t] = function () {
    var e = new ct(),
      n = Fm.call(arguments, 0);
    return (n.splice(t === `staggerFromTo` ? 5 : 4, 0, 0), e[t].apply(e, n));
  };
});
var nv = function (e, n, r) {
  return (e[n] = r);
};
var cS = function (e, n, r) {
  return e[n](r);
};
var SL = function (e, n, r, i) {
  return e[n](i.fp, r);
};
var TL = function (e, n, r) {
  return e.setAttribute(n, r);
};
var Kd = function (e, n) {
  return Te(e[n]) ? cS : zd(e[n]) && e.setAttribute ? TL : nv;
};
var uS = function (e, n) {
  return n.set(n.t, n.p, Math.round((n.s + n.c * e) * 1e6) / 1e6, n);
};
var ML = function (e, n) {
  return n.set(n.t, n.p, !!(n.s + n.c * e), n);
};
var rv = function (e, n) {
  var r = n._pt,
    i = ``;
  if (!e && n.b) i = n.b;
  else if (e === 1 && n.e) i = n.e;
  else {
    for (; r;)
      ((i = r.p + (r.m ? r.m(r.s + r.c * e) : Math.round((r.s + r.c * e) * 1e4) / 1e4) + i),
        (r = r._next));
    i += n.c;
  }
  n.set(n.t, n.p, i, n);
};
var iv = function (e, n) {
  for (var r = n._pt; r;) (r.r(e, r.d), (r = r._next));
};
var AL = function (e, n, r, i) {
  for (var o = this._pt, s; o;) ((s = o._next), o.p === i && o.modifier(e, n, r), (o = s));
};
var NL = function (e) {
  for (var n = this._pt, r, i; n;)
    ((i = n._next),
      (n.p === e && !n.op) || n.op === e ? qd(this, n, `_pt`) : n.dep || (r = 1),
      (n = i));
  return !r;
};
var xL = function (e, n, r, i) {
  i.mSet(e, n, i.m.call(i.tween, r, i.mt), i);
};
var ov = function (e) {
  for (var n = e._pt, r, i, o, s; n;) {
    for (r = n._next, i = o; i && i.pr > n.pr;) i = i._next;
    ((n._prev = i ? i._prev : s) ? (n._prev._next = n) : (o = n),
      (n._next = i) ? (i._prev = n) : (s = n),
      (n = r));
  }
  e._pt = o;
};
var vt = (function () {
  function t(n, r, i, o, s, a, c, u, l) {
    ((this.t = r),
      (this.s = o),
      (this.c = s),
      (this.p = i),
      (this.r = a || uS),
      (this.d = c || this),
      (this.set = u || nv),
      (this.pr = l || 0),
      (this._next = n),
      n && (n._prev = this));
  }
  var e = t.prototype;
  return (
    (e.modifier = function (r, i, o) {
      ((this.mSet = this.mSet || this.set),
        (this.set = xL),
        (this.m = r),
        (this.mt = o),
        (this.tween = i));
    }),
    t
  );
})();
mt(
  qm +
    `parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse`,
  function (t) {
    return (Wm[t] = 1);
  },
);
Lt.TweenMax = Lt.TweenLite = Re;
Lt.TimelineLite = Lt.TimelineMax = ct;
we = new ct({
  sortChildren: !1,
  defaults: bc,
  autoRemoveChildren: !0,
  id: `root`,
  smoothChildTiming: !0,
});
It.stringFilter = Qm;
var Qi = [];
var jd = {};
var RL = [];
var Ob = 0;
var OL = 0;
var Am = function (e) {
  return (jd[e] || RL).map(function (n) {
    return n();
  });
};
var Um = function () {
  var e = Date.now(),
    n = [];
  e - Ob > 2 &&
    (Am(`matchMediaInit`),
    Qi.forEach(function (r) {
      var i = r.queries,
        o = r.conditions,
        s,
        a,
        c,
        u;
      for (a in i)
        ((s = On.matchMedia(i[a]).matches), s && (c = 1), s !== o[a] && ((o[a] = s), (u = 1)));
      u && (r.revert(), c && n.push(r));
    }),
    Am(`matchMediaRevert`),
    n.forEach(function (r) {
      return r.onMatch(r, function (i) {
        return r.add(null, i);
      });
    }),
    (Ob = e),
    Am(`matchMedia`));
};
var lS = (function () {
  function t(n, r) {
    ((this.selector = r && Lm(r)),
      (this.data = []),
      (this._r = []),
      (this.isReverted = !1),
      (this.id = OL++),
      n && this.add(n));
  }
  var e = t.prototype;
  return (
    (e.add = function (r, i, o) {
      Te(r) && ((o = i), (i = r), (r = Te));
      var s = this,
        a = function () {
          var u = De,
            l = s.selector,
            d;
          return (
            u && u !== s && u.data.push(s),
            o && (s.selector = Lm(o)),
            (De = s),
            (d = i.apply(s, arguments)),
            Te(d) && s._r.push(d),
            (De = u),
            (s.selector = l),
            (s.isReverted = !1),
            d
          );
        };
      return (
        (s.last = a),
        r === Te
          ? a(s, function (c) {
              return s.add(null, c);
            })
          : r
            ? (s[r] = a)
            : a
      );
    }),
    (e.ignore = function (r) {
      var i = De;
      ((De = null), r(this), (De = i));
    }),
    (e.getTweens = function () {
      var r = [];
      return (
        this.data.forEach(function (i) {
          return i instanceof t
            ? r.push.apply(r, i.getTweens())
            : i instanceof Re && !(i.parent && i.parent.data === `nested`) && r.push(i);
        }),
        r
      );
    }),
    (e.clear = function () {
      this._r.length = this.data.length = 0;
    }),
    (e.kill = function (r, i) {
      var o = this;
      if (
        (r
          ? (function () {
              for (var a = o.getTweens(), c = o.data.length, u; c--;)
                ((u = o.data[c]),
                  u.data === `isFlip` &&
                    (u.revert(),
                    u.getChildren(!0, !0, !1).forEach(function (l) {
                      return a.splice(a.indexOf(l), 1);
                    })));
              for (
                a
                  .map(function (l) {
                    return {
                      g:
                        l._dur || l._delay || (l._sat && !l._sat.vars.immediateRender)
                          ? l.globalTime(0)
                          : -Infinity,
                      t: l,
                    };
                  })
                  .sort(function (l, d) {
                    return d.g - l.g || -Infinity;
                  })
                  .forEach(function (l) {
                    return l.t.revert(r);
                  }),
                  c = o.data.length;
                c--;
              )
                ((u = o.data[c]),
                  u instanceof ct
                    ? u.data !== `nested` && (u.scrollTrigger && u.scrollTrigger.revert(), u.kill())
                    : !(u instanceof Re) && u.revert && u.revert(r));
              (o._r.forEach(function (l) {
                return l(r, o);
              }),
                (o.isReverted = !0));
            })()
          : this.data.forEach(function (a) {
              return a.kill && a.kill();
            }),
        this.clear(),
        i)
      )
        for (var s = Qi.length; s--;) Qi[s].id === this.id && Qi.splice(s, 1);
    }),
    (e.revert = function (r) {
      this.kill(r || {});
    }),
    t
  );
})();
var kL = (function () {
  function t(n) {
    ((this.contexts = []), (this.scope = n), De && De.data.push(this));
  }
  var e = t.prototype;
  return (
    (e.add = function (r, i, o) {
      Pn(r) || (r = { matches: r });
      var s = new lS(0, o || this.scope),
        a = (s.conditions = {}),
        c,
        u,
        l;
      (De && !s.selector && (s.selector = De.selector),
        this.contexts.push(s),
        (i = s.add(`onMatch`, i)),
        (s.queries = r));
      for (u in r)
        u === `all`
          ? (l = 1)
          : ((c = On.matchMedia(r[u])),
            c &&
              (Qi.indexOf(s) < 0 && Qi.push(s),
              (a[u] = c.matches) && (l = 1),
              c.addListener ? c.addListener(Um) : c.addEventListener(`change`, Um)));
      return (
        l &&
          i(s, function (d) {
            return s.add(null, d);
          }),
        this
      );
    }),
    (e.revert = function (r) {
      this.kill(r || {});
    }),
    (e.kill = function (r) {
      this.contexts.forEach(function (i) {
        return i.kill(r, !0);
      });
    }),
    t
  );
})();
var Gd = {
  registerPlugin: function () {
    for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++) n[r] = arguments[r];
    n.forEach(function (i) {
      return nS(i);
    });
  },
  timeline: function (e) {
    return new ct(e);
  },
  getTweensOf: function (e, n) {
    return we.getTweensOf(e, n);
  },
  getProperty: function (e, n, r, i) {
    ze(e) && (e = tn(e)[0]);
    var o = Br(e || {}).get,
      s = r ? $b : Hb;
    return (
      r === `native` && (r = ``),
      e &&
        (n
          ? s(((Et[n] && Et[n].get) || o)(e, n, r, i))
          : function (a, c, u) {
              return s(((Et[a] && Et[a].get) || o)(e, a, c, u));
            })
    );
  },
  quickSetter: function (e, n, r) {
    if (((e = tn(e)), e.length > 1)) {
      var i = e.map(function (l) {
          return lt.quickSetter(l, n, r);
        }),
        o = i.length;
      return function (l) {
        for (var d = o; d--;) i[d](l);
      };
    }
    e = e[0] || {};
    var s = Et[n],
      a = Br(e),
      c = (a.harness && (a.harness.aliases || {})[n]) || n,
      u = s
        ? function (l) {
            var d = new s();
            ((ms._pt = 0),
              d.init(e, r ? l + r : l, ms, 0, [e]),
              d.render(1, d),
              ms._pt && iv(1, ms));
          }
        : a.set(e, c);
    return s
      ? u
      : function (l) {
          return u(e, c, r ? l + r : l, a, 1);
        };
  },
  quickTo: function (e, n, r) {
    var i,
      o = lt.to(e, Vt(((i = {}), (i[n] = `+=0.1`), (i.paused = !0), (i.stagger = 0), i), r || {})),
      s = function (c, u, l) {
        return o.resetTo(n, c, u, l);
      };
    return ((s.tween = o), s);
  },
  isTweening: function (e) {
    return we.getTweensOf(e, !0).length > 0;
  },
  defaults: function (e) {
    return (e && e.ease && (e.ease = Ki(e.ease, bc.ease)), Mb(bc, e || {}));
  },
  config: function (e) {
    return Mb(It, e || {});
  },
  registerEffect: function (e) {
    var n = e.name,
      r = e.effect,
      i = e.plugins,
      o = e.defaults,
      s = e.extendTimeline;
    ((i || ``).split(`,`).forEach(function (a) {
      return a && !Et[a] && !Lt[a] && Sc(n + ` effect requires ` + a + ` plugin.`);
    }),
      (bm[n] = function (a, c, u) {
        return r(tn(a), Vt(c || {}, o), u);
      }),
      s &&
        (ct.prototype[n] = function (a, c, u) {
          return this.add(bm[n](a, Pn(c) ? c : (u = c) && {}, this), u);
        }));
  },
  registerEase: function (e, n) {
    Z[e] = Ki(n);
  },
  parseEase: function (e, n) {
    return arguments.length ? Ki(e, n) : Z;
  },
  getById: function (e) {
    return we.getById(e);
  },
  exportRoot: function (e, n) {
    e === void 0 && (e = {});
    var r = new ct(e),
      i,
      o;
    for (
      r.smoothChildTiming = wt(e.smoothChildTiming),
        we.remove(r),
        r._dp = 0,
        r._time = r._tTime = we._time,
        i = we._first;
      i;
    )
      ((o = i._next),
        (n || !(!i._dur && i instanceof Re && i.vars.onComplete === i._targets[0])) &&
          kn(r, i, i._start - i._delay),
        (i = o));
    return (kn(we, r, 0), r);
  },
  context: function (e, n) {
    return e ? new lS(e, n) : De;
  },
  matchMedia: function (e) {
    return new kL(e);
  },
  matchMediaRefresh: function () {
    return (
      Qi.forEach(function (e) {
        var n = e.conditions,
          r,
          i;
        for (i in n) n[i] && ((n[i] = !1), (r = 1));
        r && e.revert();
      }) || Um()
    );
  },
  addEventListener: function (e, n) {
    var r = jd[e] || (jd[e] = []);
    ~r.indexOf(n) || r.push(n);
  },
  removeEventListener: function (e, n) {
    var r = jd[e],
      i = r && r.indexOf(n);
    i >= 0 && r.splice(i, 1);
  },
  utils: {
    wrap: dL,
    wrapYoyo: fL,
    distribute: Kb,
    random: Xb,
    snap: Qb,
    normalize: lL,
    getUnit: Je,
    clamp: sL,
    splitColor: rS,
    toArray: tn,
    selector: Lm,
    mapRange: eS,
    pipe: cL,
    unitize: uL,
    interpolate: hL,
    shuffle: Zb,
  },
  install: Vb,
  effects: bm,
  ticker: Ct,
  updateRoot: ct.updateRoot,
  plugins: Et,
  globalTimeline: we,
  core: {
    PropTween: vt,
    globals: jb,
    Tween: Re,
    Timeline: ct,
    Animation: Ac,
    getCache: Br,
    _removeLinkedListItem: qd,
    reverting: function () {
      return Xe;
    },
    context: function (e) {
      return (e && De && (De.data.push(e), (e._ctx = De)), De);
    },
    suppressOverwrites: function (e) {
      return (Bm = e);
    },
  },
};
mt(`to,from,fromTo,delayedCall,set,killTweensOf`, function (t) {
  return (Gd[t] = Re[t]);
});
Ct.add(ct.updateRoot);
ms = Gd.to({}, { duration: 0 });
var PL = function (e, n) {
  for (var r = e._pt; r && r.p !== n && r.op !== n && r.fp !== n;) r = r._next;
  return r;
};
var FL = function (e, n) {
  var r = e._targets,
    i,
    o,
    s;
  for (i in n)
    for (o = r.length; o--;)
      ((s = e._ptLookup[o][i]),
        s &&
          (s = s.d) &&
          (s._pt && (s = PL(s, i)), s && s.modifier && s.modifier(n[i], e, r[o], i)));
};
var Nm = function (e, n) {
  return {
    name: e,
    headless: 1,
    rawVars: 1,
    init: function (i, o, s) {
      s._onInit = function (a) {
        var c, u;
        if (
          (ze(o) &&
            ((c = {}),
            mt(o, function (l) {
              return (c[l] = 1);
            }),
            (o = c)),
          n)
        ) {
          c = {};
          for (u in o) c[u] = n(o[u]);
          o = c;
        }
        FL(a, o);
      };
    },
  };
};
var lt =
  Gd.registerPlugin(
    {
      name: `attr`,
      init: function (e, n, r, i, o) {
        var s, a, c;
        this.tween = r;
        for (s in n)
          ((c = e.getAttribute(s) || ``),
            (a = this.add(e, `setAttribute`, (c || 0) + ``, n[s], i, o, 0, 0, s)),
            (a.op = s),
            (a.b = c),
            this._props.push(s));
      },
      render: function (e, n) {
        for (var r = n._pt; r;) (Xe ? r.set(r.t, r.p, r.b, r) : r.r(e, r.d), (r = r._next));
      },
    },
    {
      name: `endArray`,
      headless: 1,
      init: function (e, n) {
        for (var r = n.length; r--;) this.add(e, r, e[r] || 0, n[r], 0, 0, 0, 0, 0, 1);
      },
    },
    Nm(`roundProps`, Vm),
    Nm(`modifiers`),
    Nm(`snap`, Qb),
  ) || Gd;
Re.version = ct.version = lt.version = `3.15.0`;
Lb = 1;
Hm() && Ds();
Z.Power0;
Z.Power1;
Z.Power2;
Z.Power3;
Z.Power4;
Z.Linear;
Z.Quad;
Z.Cubic;
Z.Quart;
Z.Quint;
Z.Strong;
Z.Elastic;
Z.Back;
Z.SteppedEase;
Z.Bounce;
Z.Sine;
Z.Expo;
Z.Circ;
var dS;
var Gr;
var ws;
var dv;
var io;
var fS;
var fv;
var nV = function () {
  return typeof window < `u`;
};
var mr = {};
var ro = 180 / Math.PI;
var Is = Math.PI / 180;
var Cs = Math.atan2;
var hS = 1e8;
var hv = /([A-Z])/g;
var rV = /(left|right|width|margin|padding|x)/i;
var iV = /[\s,\(]\S/;
var Fn = { autoAlpha: `opacity,visibility`, scale: `scaleX,scaleY`, alpha: `opacity` };
var av = function (e, n) {
  return n.set(n.t, n.p, Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u, n);
};
var oV = function (e, n) {
  return n.set(n.t, n.p, e === 1 ? n.e : Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u, n);
};
var sV = function (e, n) {
  return n.set(n.t, n.p, e ? Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u : n.b, n);
};
var aV = function (e, n) {
  return n.set(
    n.t,
    n.p,
    e === 1 ? n.e : e ? Math.round((n.s + n.c * e) * 1e4) / 1e4 + n.u : n.b,
    n,
  );
};
var cV = function (e, n) {
  var r = n.s + n.c * e;
  n.set(n.t, n.p, ~~(r + (r < 0 ? -0.5 : 0.5)) + n.u, n);
};
var ES = function (e, n) {
  return n.set(n.t, n.p, e ? n.e : n.b, n);
};
var CS = function (e, n) {
  return n.set(n.t, n.p, e !== 1 ? n.b : n.e, n);
};
var uV = function (e, n, r) {
  return (e.style[n] = r);
};
var lV = function (e, n, r) {
  return e.style.setProperty(n, r);
};
var dV = function (e, n, r) {
  return (e._gsap[n] = r);
};
var fV = function (e, n, r) {
  return (e._gsap.scaleX = e._gsap.scaleY = r);
};
var hV = function (e, n, r, i, o) {
  var s = e._gsap;
  ((s.scaleX = s.scaleY = r), s.renderTransform(o, s));
};
var pV = function (e, n, r, i, o) {
  var s = e._gsap;
  ((s[n] = r), s.renderTransform(o, s));
};
var Ie = `transform`;
var bt = Ie + `Origin`;
var gV = function t(e, n) {
  var r = this,
    i = this.target,
    o = i.style,
    s = i._gsap;
  if (e in mr && o) {
    if (((this.tfm = this.tfm || {}), e !== `transform`))
      ((e = Fn[e] || e),
        ~e.indexOf(`,`)
          ? e.split(`,`).forEach(function (a) {
              return (r.tfm[a] = gr(i, a));
            })
          : (this.tfm[e] = s.x ? s[e] : gr(i, e)),
        e === bt && (this.tfm.zOrigin = s.zOrigin));
    else
      return Fn.transform.split(`,`).forEach(function (a) {
        return t.call(r, a, n);
      });
    if (this.props.indexOf(Ie) >= 0) return;
    (s.svg && ((this.svgo = i.getAttribute(`data-svg-origin`)), this.props.push(bt, n, ``)),
      (e = Ie));
  }
  (o || n) && this.props.push(e, n, o[e]);
};
var wS = function (e) {
  e.translate &&
    (e.removeProperty(`translate`), e.removeProperty(`scale`), e.removeProperty(`rotate`));
};
var mV = function () {
  var e = this.props,
    n = this.target,
    r = n.style,
    i = n._gsap,
    o,
    s;
  for (o = 0; o < e.length; o += 3)
    e[o + 1]
      ? e[o + 1] === 2
        ? n[e[o]](e[o + 2])
        : (n[e[o]] = e[o + 2])
      : e[o + 2]
        ? (r[e[o]] = e[o + 2])
        : r.removeProperty(
            e[o].substr(0, 2) === `--` ? e[o] : e[o].replace(hv, `-$1`).toLowerCase(),
          );
  if (this.tfm) {
    for (s in this.tfm) i[s] = this.tfm[s];
    (i.svg && (i.renderTransform(), n.setAttribute(`data-svg-origin`, this.svgo || ``)),
      (o = fv()),
      (!o || !o.isStart) &&
        !r[Ie] &&
        (wS(r),
        i.zOrigin &&
          r[bt] &&
          ((r[bt] += ` ` + i.zOrigin + `px`), (i.zOrigin = 0), i.renderTransform()),
        (i.uncache = 1)));
  }
};
var IS = function (e, n) {
  var r = { target: e, props: [], revert: mV, save: gV };
  return (
    e._gsap || lt.core.getCache(e),
    n &&
      e.style &&
      e.nodeType &&
      n.split(`,`).forEach(function (i) {
        return r.save(i);
      }),
    r
  );
};
var bS;
var cv = function (e, n) {
  var r = Gr.createElementNS
    ? Gr.createElementNS((n || `http://www.w3.org/1999/xhtml`).replace(/^https/, `http`), e)
    : Gr.createElement(e);
  return r && r.style ? r : Gr.createElement(e);
};
var jt = function t(e, n, r) {
  var i = getComputedStyle(e);
  return (
    i[n] ||
    i.getPropertyValue(n.replace(hv, `-$1`).toLowerCase()) ||
    i.getPropertyValue(n) ||
    (!r && t(e, bs(n) || n, 1)) ||
    ``
  );
};
var pS = `O,Moz,ms,Ms,Webkit`.split(`,`);
var bs = function (e, n, r) {
  var o = (n || io).style,
    s = 5;
  if (e in o && !r) return e;
  for (e = e.charAt(0).toUpperCase() + e.substr(1); s-- && !(pS[s] + e in o););
  return s < 0 ? null : (s === 3 ? `ms` : s >= 0 ? pS[s] : ``) + e;
};
var uv = function () {
  nV() &&
    window.document &&
    ((dS = window),
    (Gr = dS.document),
    (ws = Gr.documentElement),
    (io = cv(`div`) || { style: {} }),
    cv(`div`),
    (Ie = bs(Ie)),
    (bt = Ie + `Origin`),
    (io.style.cssText = `border-width:0;line-height:0;position:absolute;padding:0`),
    (bS = !!bs(`perspective`)),
    (fv = lt.core.reverting),
    (dv = 1));
};
var gS = function (e) {
  var n = e.ownerSVGElement,
    r = cv(`svg`, (n && n.getAttribute(`xmlns`)) || `http://www.w3.org/2000/svg`),
    i = e.cloneNode(!0),
    o;
  ((i.style.display = `block`), r.appendChild(i), ws.appendChild(r));
  try {
    o = i.getBBox();
  } catch {}
  return (r.removeChild(i), ws.removeChild(r), o);
};
var mS = function (e, n) {
  for (var r = n.length; r--;) if (e.hasAttribute(n[r])) return e.getAttribute(n[r]);
};
var SS = function (e) {
  var n, r;
  try {
    n = e.getBBox();
  } catch {
    ((n = gS(e)), (r = 1));
  }
  return (
    (n && (n.width || n.height)) || r || (n = gS(e)),
    n && !n.width && !n.x && !n.y
      ? {
          x: +mS(e, [`x`, `cx`, `x1`]) || 0,
          y: +mS(e, [`y`, `cy`, `y1`]) || 0,
          width: 0,
          height: 0,
        }
      : n
  );
};
var TS = function (e) {
  return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && SS(e));
};
var Wr = function (e, n) {
  if (n) {
    var r = e.style,
      i;
    (n in mr && n !== bt && (n = Ie),
      r.removeProperty
        ? ((i = n.substr(0, 2)),
          (i === `ms` || n.substr(0, 6) === `webkit`) && (n = `-` + n),
          r.removeProperty(i === `--` ? n : n.replace(hv, `-$1`).toLowerCase()))
        : r.removeAttribute(n));
  }
};
var zr = function (e, n, r, i, o, s) {
  var a = new vt(e._pt, n, r, 0, 1, s ? CS : ES);
  return ((e._pt = a), (a.b = i), (a.e = o), e._props.push(r), a);
};
var vS = { deg: 1, rad: 1, turn: 1 };
var vV = { grid: 1, flex: 1 };
var qr = function t(e, n, r, i) {
  var o = parseFloat(r) || 0,
    s = (r + ``).trim().substr((o + ``).length) || `px`,
    a = io.style,
    c = rV.test(n),
    u = e.tagName.toLowerCase() === `svg`,
    l = (u ? `client` : `offset`) + (c ? `Width` : `Height`),
    d = 100,
    f = i === `px`,
    h = i === `%`,
    g,
    p,
    m,
    y;
  if (i === s || !o || vS[i] || vS[s]) return o;
  if (
    (s !== `px` && !f && (o = t(e, n, r, `px`)),
    (y = e.getCTM && TS(e)),
    (h || s === `%`) && (mr[n] || ~n.indexOf(`adius`)))
  )
    return (
      (g = y ? e.getBBox()[c ? `width` : `height`] : e[l]),
      Me(h ? (o / g) * d : (o / 100) * g)
    );
  if (
    ((a[c ? `width` : `height`] = d + (f ? s : i)),
    (p =
      (i !== `rem` && ~n.indexOf(`adius`)) || (i === `em` && e.appendChild && !u)
        ? e
        : e.parentNode),
    y && (p = (e.ownerSVGElement || {}).parentNode),
    (!p || p === Gr || !p.appendChild) && (p = Gr.body),
    (m = p._gsap),
    m && h && m.width && c && m.time === Ct.time && !m.uncache)
  )
    return Me((o / m.width) * d);
  if (h && (n === `height` || n === `width`)) {
    var _ = e.style[n];
    ((e.style[n] = d + i), (g = e[l]), _ ? (e.style[n] = _) : Wr(e, n));
  } else
    ((h || s === `%`) && !vV[jt(p, `display`)] && (a.position = jt(e, `position`)),
      p === e && (a.position = `static`),
      p.appendChild(io),
      (g = io[l]),
      p.removeChild(io),
      (a.position = `absolute`));
  return (
    c && h && ((m = Br(p)), (m.time = Ct.time), (m.width = p[l])),
    Me(f ? (g * o) / d : g && o ? (d / g) * o : 0)
  );
};
var gr = function (e, n, r, i) {
  var o;
  return (
    dv || uv(),
    n in Fn && n !== `transform` && ((n = Fn[n]), ~n.indexOf(`,`) && (n = n.split(`,`)[0])),
    mr[n] && n !== `transform`
      ? ((o = Oc(e, i)),
        (o =
          n !== `transformOrigin`
            ? o[n]
            : o.svg
              ? o.origin
              : Xd(jt(e, bt)) + ` ` + o.zOrigin + `px`))
      : ((o = e.style[n]),
        (!o || o === `auto` || i || ~(o + ``).indexOf(`calc(`)) &&
          (o = (Qd[n] && Qd[n](e, n, r)) || jt(e, n) || Zm(e, n) || (n === `opacity` ? 1 : 0))),
    r && !~(o + ``).trim().indexOf(` `) ? qr(e, n, o, r) + r : o
  );
};
var yV = function (e, n, r, i) {
  if (!r || r === `none`) {
    var o = bs(n, e, 1),
      s = o && jt(e, o, 1);
    s && s !== r ? ((n = o), (r = s)) : n === `borderColor` && (r = jt(e, `borderTopColor`));
  }
  var a = new vt(this._pt, e.style, n, 0, 1, rv),
    c = 0,
    u = 0,
    l,
    d,
    f,
    h,
    g,
    p,
    m,
    y,
    _,
    w,
    b,
    C;
  if (
    ((a.b = r),
    (a.e = i),
    (r += ``),
    (i += ``),
    i.substring(0, 6) === `var(--` && (i = jt(e, i.substring(4, i.indexOf(`)`)))),
    i === `auto` &&
      ((p = e.style[n]), (e.style[n] = i), (i = jt(e, n) || i), p ? (e.style[n] = p) : Wr(e, n)),
    (l = [r, i]),
    Qm(l),
    (r = l[0]),
    (i = l[1]),
    (f = r.match(Xi) || []),
    (C = i.match(Xi) || []),
    C.length)
  ) {
    for (; (d = Xi.exec(i));)
      ((m = d[0]),
        (_ = i.substring(c, d.index)),
        g ? (g = (g + 1) % 5) : (_.substr(-5) === `rgba(` || _.substr(-5) === `hsla(`) && (g = 1),
        m !== (p = f[u++] || ``) &&
          ((h = parseFloat(p) || 0),
          (b = p.substr((h + ``).length)),
          m.charAt(1) === `=` && (m = Ji(h, m) + b),
          (y = parseFloat(m)),
          (w = m.substr((y + ``).length)),
          (c = Xi.lastIndex - w.length),
          w || ((w = w || It.units[n] || b), c === i.length && ((i += w), (a.e += w))),
          b !== w && (h = qr(e, n, p, w) || 0),
          (a._pt = {
            _next: a._pt,
            p: _ || u === 1 ? _ : `,`,
            s: h,
            c: y - h,
            m: (g && g < 4) || n === `zIndex` ? Math.round : 0,
          })));
    a.c = c < i.length ? i.substring(c, i.length) : ``;
  } else a.r = n === `display` && i === `none` ? CS : ES;
  return (Gm.test(i) && (a.e = 0), (this._pt = a), a);
};
var yS = { top: `0%`, bottom: `100%`, left: `0%`, right: `100%`, center: `50%` };
var _V = function (e) {
  var n = e.split(` `),
    r = n[0],
    i = n[1] || `50%`;
  return (
    (r === `top` || r === `bottom` || i === `left` || i === `right`) && ((e = r), (r = i), (i = e)),
    (n[0] = yS[r] || r),
    (n[1] = yS[i] || i),
    n.join(` `)
  );
};
var DV = function (e, n) {
  if (n.tween && n.tween._time === n.tween._dur) {
    var r = n.t,
      i = r.style,
      o = n.u,
      s = r._gsap,
      a,
      c,
      u;
    if (o === `all` || o === !0) ((i.cssText = ``), (c = 1));
    else
      for (o = o.split(`,`), u = o.length; --u > -1;)
        ((a = o[u]), mr[a] && ((c = 1), (a = a === `transformOrigin` ? bt : Ie)), Wr(r, a));
    c &&
      (Wr(r, Ie),
      s &&
        (s.svg && r.removeAttribute(`transform`),
        (i.scale = i.rotate = i.translate = `none`),
        Oc(r, 1),
        (s.uncache = 1),
        wS(i)));
  }
};
var Qd = {
  clearProps: function (e, n, r, i, o) {
    if (o.data !== `isFromStart`) {
      var s = (e._pt = new vt(e._pt, n, r, 0, 0, DV));
      return ((s.u = i), (s.pr = -10), (s.tween = o), e._props.push(r), 1);
    }
  },
};
var Rc = [1, 0, 0, 1, 0, 0];
var MS = {};
var AS = function (e) {
  return e === `matrix(1, 0, 0, 1, 0, 0)` || e === `none` || !e;
};
var _S = function (e) {
  var n = jt(e, Ie);
  return AS(n) ? Rc : n.substr(7).match($m).map(Me);
};
var pv = function (e, n) {
  var r = e._gsap || Br(e),
    i = e.style,
    o = _S(e),
    s,
    a,
    c,
    u;
  return r.svg && e.getAttribute(`transform`)
    ? ((c = e.transform.baseVal.consolidate().matrix),
      (o = [c.a, c.b, c.c, c.d, c.e, c.f]),
      o.join(`,`) === `1,0,0,1,0,0` ? Rc : o)
    : (o === Rc &&
        !e.offsetParent &&
        e !== ws &&
        !r.svg &&
        ((c = i.display),
        (i.display = `block`),
        (s = e.parentNode),
        (!s || (!e.offsetParent && !e.getBoundingClientRect().width)) &&
          ((u = 1), (a = e.nextElementSibling), ws.appendChild(e)),
        (o = _S(e)),
        c ? (i.display = c) : Wr(e, `display`),
        u && (a ? s.insertBefore(e, a) : s ? s.appendChild(e) : ws.removeChild(e))),
      n && o.length > 6 ? [o[0], o[1], o[4], o[5], o[12], o[13]] : o);
};
var lv = function (e, n, r, i, o, s) {
  var a = e._gsap,
    c = o || pv(e, !0),
    u = a.xOrigin || 0,
    l = a.yOrigin || 0,
    d = a.xOffset || 0,
    f = a.yOffset || 0,
    h = c[0],
    g = c[1],
    p = c[2],
    m = c[3],
    y = c[4],
    _ = c[5],
    w = n.split(` `),
    b = parseFloat(w[0]) || 0,
    C = parseFloat(w[1]) || 0,
    N,
    T,
    M,
    S;
  (r
    ? c !== Rc &&
      (T = h * m - g * p) &&
      ((M = b * (m / T) + C * (-p / T) + (p * _ - m * y) / T),
      (S = b * (-g / T) + C * (h / T) - (h * _ - g * y) / T),
      (b = M),
      (C = S))
    : ((N = SS(e)),
      (b = N.x + (~w[0].indexOf(`%`) ? (b / 100) * N.width : b)),
      (C = N.y + (~(w[1] || w[0]).indexOf(`%`) ? (C / 100) * N.height : C))),
    i || (i !== !1 && a.smooth)
      ? ((y = b - u),
        (_ = C - l),
        (a.xOffset = d + (y * h + _ * p) - y),
        (a.yOffset = f + (y * g + _ * m) - _))
      : (a.xOffset = a.yOffset = 0),
    (a.xOrigin = b),
    (a.yOrigin = C),
    (a.smooth = !!i),
    (a.origin = n),
    (a.originIsAbsolute = !!r),
    (e.style[bt] = `0px 0px`),
    s &&
      (zr(s, a, `xOrigin`, u, b),
      zr(s, a, `yOrigin`, l, C),
      zr(s, a, `xOffset`, d, a.xOffset),
      zr(s, a, `yOffset`, f, a.yOffset)),
    e.setAttribute(`data-svg-origin`, b + ` ` + C));
};
var Oc = function (e, n) {
  var r = e._gsap || new Xm(e);
  if (`x` in r && !n && !r.uncache) return r;
  var i = e.style,
    o = r.scaleX < 0,
    s = `px`,
    a = `deg`,
    c = getComputedStyle(e),
    u = jt(e, bt) || `0`,
    l,
    d,
    f,
    h,
    g,
    p,
    m,
    y,
    _,
    w,
    b,
    C,
    N,
    T,
    M,
    S,
    $,
    me,
    he,
    ce,
    be,
    We,
    Le,
    Ae,
    Ut,
    oo,
    Ss,
    Ts,
    Yr,
    mv,
    Ln,
    Zr;
  return (
    (l = d = f = p = m = y = _ = w = b = 0),
    (h = g = 1),
    (r.svg = !!(e.getCTM && TS(e))),
    c.translate &&
      ((c.translate !== `none` || c.scale !== `none` || c.rotate !== `none`) &&
        (i[Ie] =
          (c.translate !== `none`
            ? `translate3d(` + (c.translate + ` 0 0`).split(` `).slice(0, 3).join(`, `) + `) `
            : ``) +
          (c.rotate !== `none` ? `rotate(` + c.rotate + `) ` : ``) +
          (c.scale !== `none` ? `scale(` + c.scale.split(` `).join(`,`) + `) ` : ``) +
          (c[Ie] !== `none` ? c[Ie] : ``)),
      (i.scale = i.rotate = i.translate = `none`)),
    (T = pv(e, r.svg)),
    r.svg &&
      (r.uncache
        ? ((Ut = e.getBBox()),
          (u = r.xOrigin - Ut.x + `px ` + (r.yOrigin - Ut.y) + `px`),
          (Ae = ``))
        : (Ae = !n && e.getAttribute(`data-svg-origin`)),
      lv(e, Ae || u, !!Ae || r.originIsAbsolute, r.smooth !== !1, T)),
    (C = r.xOrigin || 0),
    (N = r.yOrigin || 0),
    T !== Rc &&
      ((me = T[0]),
      (he = T[1]),
      (ce = T[2]),
      (be = T[3]),
      (l = We = T[4]),
      (d = Le = T[5]),
      T.length === 6
        ? ((h = Math.sqrt(me * me + he * he)),
          (g = Math.sqrt(be * be + ce * ce)),
          (p = me || he ? Cs(he, me) * ro : 0),
          (_ = ce || be ? Cs(ce, be) * ro + p : 0),
          _ && (g *= Math.abs(Math.cos(_ * Is))),
          r.svg && ((l -= C - (C * me + N * ce)), (d -= N - (C * he + N * be))))
        : ((Zr = T[6]),
          (mv = T[7]),
          (Ss = T[8]),
          (Ts = T[9]),
          (Yr = T[10]),
          (Ln = T[11]),
          (l = T[12]),
          (d = T[13]),
          (f = T[14]),
          (M = Cs(Zr, Yr)),
          (m = M * ro),
          M &&
            ((S = Math.cos(-M)),
            ($ = Math.sin(-M)),
            (Ae = We * S + Ss * $),
            (Ut = Le * S + Ts * $),
            (oo = Zr * S + Yr * $),
            (Ss = We * -$ + Ss * S),
            (Ts = Le * -$ + Ts * S),
            (Yr = Zr * -$ + Yr * S),
            (Ln = mv * -$ + Ln * S),
            (We = Ae),
            (Le = Ut),
            (Zr = oo)),
          (M = Cs(-ce, Yr)),
          (y = M * ro),
          M &&
            ((S = Math.cos(-M)),
            ($ = Math.sin(-M)),
            (Ae = me * S - Ss * $),
            (Ut = he * S - Ts * $),
            (oo = ce * S - Yr * $),
            (Ln = be * $ + Ln * S),
            (me = Ae),
            (he = Ut),
            (ce = oo)),
          (M = Cs(he, me)),
          (p = M * ro),
          M &&
            ((S = Math.cos(M)),
            ($ = Math.sin(M)),
            (Ae = me * S + he * $),
            (Ut = We * S + Le * $),
            (he = he * S - me * $),
            (Le = Le * S - We * $),
            (me = Ae),
            (We = Ut)),
          m && Math.abs(m) + Math.abs(p) > 359.9 && ((m = p = 0), (y = 180 - y)),
          (h = Me(Math.sqrt(me * me + he * he + ce * ce))),
          (g = Me(Math.sqrt(Le * Le + Zr * Zr))),
          (M = Cs(We, Le)),
          (_ = Math.abs(M) > 2e-4 ? M * ro : 0),
          (b = Ln ? 1 / (Ln < 0 ? -Ln : Ln) : 0)),
      r.svg &&
        ((Ae = e.getAttribute(`transform`)),
        (r.forceCSS = e.setAttribute(`transform`, ``) || !AS(jt(e, Ie))),
        Ae && e.setAttribute(`transform`, Ae))),
    Math.abs(_) > 90 &&
      Math.abs(_) < 270 &&
      (o
        ? ((h *= -1), (_ += p <= 0 ? 180 : -180), (p += p <= 0 ? 180 : -180))
        : ((g *= -1), (_ += _ <= 0 ? 180 : -180))),
    (n = n || r.uncache),
    (r.x =
      l -
      ((r.xPercent =
        l && ((!n && r.xPercent) || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0)))
        ? (e.offsetWidth * r.xPercent) / 100
        : 0) +
      s),
    (r.y =
      d -
      ((r.yPercent =
        d && ((!n && r.yPercent) || (Math.round(e.offsetHeight / 2) === Math.round(-d) ? -50 : 0)))
        ? (e.offsetHeight * r.yPercent) / 100
        : 0) +
      s),
    (r.z = f + s),
    (r.scaleX = Me(h)),
    (r.scaleY = Me(g)),
    (r.rotation = Me(p) + a),
    (r.rotationX = Me(m) + a),
    (r.rotationY = Me(y) + a),
    (r.skewX = _ + a),
    (r.skewY = w + a),
    (r.transformPerspective = b + s),
    (r.zOrigin = parseFloat(u.split(` `)[2]) || (!n && r.zOrigin) || 0) && (i[bt] = Xd(u)),
    (r.xOffset = r.yOffset = 0),
    (r.force3D = It.force3D),
    (r.renderTransform = r.svg ? CV : bS ? NS : EV),
    (r.uncache = 0),
    r
  );
};
var Xd = function (e) {
  return (e = e.split(` `))[0] + ` ` + e[1];
};
var sv = function (e, n, r) {
  var i = Je(n);
  return Me(parseFloat(n) + parseFloat(qr(e, `x`, r + `px`, i))) + i;
};
var EV = function (e, n) {
  ((n.z = `0px`), (n.rotationY = n.rotationX = `0deg`), (n.force3D = 0), NS(e, n));
};
var to = `0deg`;
var xc = `0px`;
var no = `) `;
var NS = function (e, n) {
  var r = n || this,
    i = r.xPercent,
    o = r.yPercent,
    s = r.x,
    a = r.y,
    c = r.z,
    u = r.rotation,
    l = r.rotationY,
    d = r.rotationX,
    f = r.skewX,
    h = r.skewY,
    g = r.scaleX,
    p = r.scaleY,
    m = r.transformPerspective,
    y = r.force3D,
    _ = r.target,
    w = r.zOrigin,
    b = ``,
    C = (y === `auto` && e && e !== 1) || y === !0;
  if (w && (d !== to || l !== to)) {
    var N = parseFloat(l) * Is,
      T = Math.sin(N),
      M = Math.cos(N),
      S;
    ((N = parseFloat(d) * Is),
      (S = Math.cos(N)),
      (s = sv(_, s, T * S * -w)),
      (a = sv(_, a, -Math.sin(N) * -w)),
      (c = sv(_, c, M * S * -w + w)));
  }
  (m !== xc && (b += `perspective(` + m + no),
    (i || o) && (b += `translate(` + i + `%, ` + o + `%) `),
    (C || s !== xc || a !== xc || c !== xc) &&
      (b +=
        c !== xc || C
          ? `translate3d(` + s + `, ` + a + `, ` + c + `) `
          : `translate(` + s + `, ` + a + no),
    u !== to && (b += `rotate(` + u + no),
    l !== to && (b += `rotateY(` + l + no),
    d !== to && (b += `rotateX(` + d + no),
    (f !== to || h !== to) && (b += `skew(` + f + `, ` + h + no),
    (g !== 1 || p !== 1) && (b += `scale(` + g + `, ` + p + no),
    (_.style[Ie] = b || `translate(0, 0)`));
};
var CV = function (e, n) {
  var r = n || this,
    i = r.xPercent,
    o = r.yPercent,
    s = r.x,
    a = r.y,
    c = r.rotation,
    u = r.skewX,
    l = r.skewY,
    d = r.scaleX,
    f = r.scaleY,
    h = r.target,
    g = r.xOrigin,
    p = r.yOrigin,
    m = r.xOffset,
    y = r.yOffset,
    _ = r.forceCSS,
    w = parseFloat(s),
    b = parseFloat(a),
    C,
    N,
    T,
    M,
    S;
  ((c = parseFloat(c)),
    (u = parseFloat(u)),
    (l = parseFloat(l)),
    l && ((l = parseFloat(l)), (u += l), (c += l)),
    c || u
      ? ((c *= Is),
        (u *= Is),
        (C = Math.cos(c) * d),
        (N = Math.sin(c) * d),
        (T = Math.sin(c - u) * -f),
        (M = Math.cos(c - u) * f),
        u &&
          ((l *= Is),
          (S = Math.tan(u - l)),
          (S = Math.sqrt(1 + S * S)),
          (T *= S),
          (M *= S),
          l && ((S = Math.tan(l)), (S = Math.sqrt(1 + S * S)), (C *= S), (N *= S))),
        (C = Me(C)),
        (N = Me(N)),
        (T = Me(T)),
        (M = Me(M)))
      : ((C = d), (M = f), (N = T = 0)),
    ((w && !~(s + ``).indexOf(`px`)) || (b && !~(a + ``).indexOf(`px`))) &&
      ((w = qr(h, `x`, s, `px`)), (b = qr(h, `y`, a, `px`))),
    (g || p || m || y) &&
      ((w = Me(w + g - (g * C + p * T) + m)), (b = Me(b + p - (g * N + p * M) + y))),
    (i || o) &&
      ((S = h.getBBox()), (w = Me(w + (i / 100) * S.width)), (b = Me(b + (o / 100) * S.height))),
    (S = `matrix(` + C + `,` + N + `,` + T + `,` + M + `,` + w + `,` + b + `)`),
    h.setAttribute(`transform`, S),
    _ && (h.style[Ie] = S));
};
var wV = function (e, n, r, i, o) {
  var s = 360,
    a = ze(o),
    u = parseFloat(o) * (a && ~o.indexOf(`rad`) ? ro : 1) - i,
    l = i + u + `deg`,
    d,
    f;
  return (
    a &&
      ((d = o.split(`_`)[1]),
      d === `short` && ((u %= s), u !== u % (s / 2) && (u += u < 0 ? s : -s)),
      d === `cw` && u < 0
        ? (u = ((u + s * hS) % s) - ~~(u / s) * s)
        : d === `ccw` && u > 0 && (u = ((u - s * hS) % s) - ~~(u / s) * s)),
    (e._pt = f = new vt(e._pt, n, r, i, u, oV)),
    (f.e = l),
    (f.u = `deg`),
    e._props.push(r),
    f
  );
};
var DS = function (e, n) {
  for (var r in n) e[r] = n[r];
  return e;
};
var IV = function (e, n, r) {
  var i = DS({}, r._gsap),
    o = `perspective,force3D,transformOrigin,svgOrigin`,
    s = r.style,
    a,
    c,
    u,
    l,
    d,
    f,
    h,
    g;
  i.svg
    ? ((u = r.getAttribute(`transform`)),
      r.setAttribute(`transform`, ``),
      (s[Ie] = n),
      (a = Oc(r, 1)),
      Wr(r, Ie),
      r.setAttribute(`transform`, u))
    : ((u = getComputedStyle(r)[Ie]), (s[Ie] = n), (a = Oc(r, 1)), (s[Ie] = u));
  for (c in mr)
    ((u = i[c]),
      (l = a[c]),
      u !== l &&
        o.indexOf(c) < 0 &&
        ((h = Je(u)),
        (g = Je(l)),
        (d = h !== g ? qr(r, c, u, g) : parseFloat(u)),
        (f = parseFloat(l)),
        (e._pt = new vt(e._pt, a, c, d, f - d, av)),
        (e._pt.u = g || 0),
        e._props.push(c)));
  DS(a, i);
};
mt(`padding,margin,Width,Radius`, function (t, e) {
  var n = `Top`,
    r = `Right`,
    i = `Bottom`,
    o = `Left`,
    s = (e < 3 ? [n, r, i, o] : [n + o, n + r, i + r, i + o]).map(function (a) {
      return e < 2 ? t + a : `border` + a + t;
    });
  Qd[e > 1 ? `border` + t : t] = function (a, c, u, l, d) {
    var f, h;
    if (arguments.length < 4)
      return (
        (f = s.map(function (g) {
          return gr(a, g, u);
        })),
        (h = f.join(` `)),
        h.split(f[0]).length === 5 ? f[0] : h
      );
    ((f = (l + ``).split(` `)),
      (h = {}),
      s.forEach(function (g, p) {
        return (h[g] = f[p] = f[p] || f[((p - 1) / 2) | 0]);
      }),
      a.init(c, h, d));
  };
});
var gv = {
  name: `css`,
  register: uv,
  targetTest: function (e) {
    return e.style && e.nodeType;
  },
  init: function (e, n, r, i, o) {
    var s = this._props,
      a = e.style,
      c = r.vars.startAt,
      u,
      l,
      d,
      f,
      h,
      g,
      p,
      m,
      y,
      _,
      w,
      b,
      C,
      N,
      T,
      M,
      S;
    (dv || uv(), (this.styles = this.styles || IS(e)), (M = this.styles.props), (this.tween = r));
    for (p in n)
      if (p !== `autoRound` && ((l = n[p]), !(Et[p] && ev(p, n, r, i, e, o)))) {
        if (
          ((h = typeof l),
          (g = Qd[p]),
          h === `function` && ((l = l.call(r, i, e, o)), (h = typeof l)),
          h === `string` && ~l.indexOf(`random(`) && (l = Es(l)),
          g)
        )
          g(this, e, p, l, r) && (T = 1);
        else if (p.substr(0, 2) === `--`)
          ((u = (getComputedStyle(e).getPropertyValue(p) + ``).trim()),
            (l += ``),
            (hr.lastIndex = 0),
            hr.test(u) ||
              ((m = Je(u)), (y = Je(l)), y ? m !== y && (u = qr(e, p, u, y) + y) : m && (l += m)),
            this.add(a, `setProperty`, u, l, i, o, 0, 0, p),
            s.push(p),
            M.push(p, 0, a[p]));
        else if (h !== `undefined`) {
          if (
            (c && p in c
              ? ((u = typeof c[p] == `function` ? c[p].call(r, i, e, o) : c[p]),
                ze(u) && ~u.indexOf(`random(`) && (u = Es(u)),
                Je(u + ``) || u === `auto` || (u += It.units[p] || Je(gr(e, p)) || ``),
                (u + ``).charAt(1) === `=` && (u = gr(e, p)))
              : (u = gr(e, p)),
            (f = parseFloat(u)),
            (_ = h === `string` && l.charAt(1) === `=` && l.substr(0, 2)),
            _ && (l = l.substr(2)),
            (d = parseFloat(l)),
            p in Fn &&
              (p === `autoAlpha` &&
                (f === 1 && gr(e, `visibility`) === `hidden` && d && (f = 0),
                M.push(`visibility`, 0, a.visibility),
                zr(this, a, `visibility`, f ? `inherit` : `hidden`, d ? `inherit` : `hidden`, !d)),
              p !== `scale` &&
                p !== `transform` &&
                ((p = Fn[p]), ~p.indexOf(`,`) && (p = p.split(`,`)[0]))),
            (w = p in mr),
            w)
          ) {
            if ((this.styles.save(p), (S = l), h === `string` && l.substring(0, 6) === `var(--`)) {
              if (((l = jt(e, l.substring(4, l.indexOf(`)`)))), l.substring(0, 5) === `calc(`)) {
                var $ = e.style.perspective;
                ((e.style.perspective = l),
                  (l = jt(e, `perspective`)),
                  $ ? (e.style.perspective = $) : Wr(e, `perspective`));
              }
              d = parseFloat(l);
            }
            if (
              (b ||
                ((C = e._gsap),
                (C.renderTransform && !n.parseTransform) || Oc(e, n.parseTransform),
                (N = n.smoothOrigin !== !1 && C.smooth),
                (b = this._pt = new vt(this._pt, a, Ie, 0, 1, C.renderTransform, C, 0, -1)),
                (b.dep = 1)),
              p === `scale`)
            )
              ((this._pt = new vt(
                this._pt,
                C,
                `scaleY`,
                C.scaleY,
                (_ ? Ji(C.scaleY, _ + d) : d) - C.scaleY || 0,
                av,
              )),
                (this._pt.u = 0),
                s.push(`scaleY`, p),
                (p += `X`));
            else if (p === `transformOrigin`) {
              (M.push(bt, 0, a[bt]),
                (l = _V(l)),
                C.svg
                  ? lv(e, l, 0, N, 0, this)
                  : ((y = parseFloat(l.split(` `)[2]) || 0),
                    y !== C.zOrigin && zr(this, C, `zOrigin`, C.zOrigin, y),
                    zr(this, a, p, Xd(u), Xd(l))));
              continue;
            } else if (p === `svgOrigin`) {
              lv(e, l, 1, N, 0, this);
              continue;
            } else if (p in MS) {
              wV(this, C, p, f, _ ? Ji(f, _ + l) : l);
              continue;
            } else if (p === `smoothOrigin`) {
              zr(this, C, `smooth`, C.smooth, l);
              continue;
            } else if (p === `force3D`) {
              C[p] = l;
              continue;
            } else if (p === `transform`) {
              IV(this, l, e);
              continue;
            }
          } else p in a || (p = bs(p) || p);
          if (w || ((d || d === 0) && (f || f === 0) && !iV.test(l) && p in a))
            ((m = (u + ``).substr((f + ``).length)),
              d || (d = 0),
              (y = Je(l) || (p in It.units ? It.units[p] : m)),
              m !== y && (f = qr(e, p, u, y)),
              (this._pt = new vt(
                this._pt,
                w ? C : a,
                p,
                f,
                (_ ? Ji(f, _ + d) : d) - f,
                !w && (y === `px` || p === `zIndex`) && n.autoRound !== !1 ? cV : av,
              )),
              (this._pt.u = y || 0),
              w && S !== l
                ? ((this._pt.b = u), (this._pt.e = S), (this._pt.r = aV))
                : m !== y && y !== `%` && ((this._pt.b = u), (this._pt.r = sV)));
          else if (p in a) yV.call(this, e, p, u, _ ? _ + l : l);
          else if (p in e) this.add(e, p, u || e[p], _ ? _ + l : l, i, o);
          else if (p !== `parseTransform`) {
            Wd(p, l);
            continue;
          }
          (w ||
            (p in a
              ? M.push(p, 0, a[p])
              : typeof e[p] == `function`
                ? M.push(p, 2, e[p]())
                : M.push(p, 1, u || e[p])),
            s.push(p));
        }
      }
    T && ov(this);
  },
  render: function (e, n) {
    if (n.tween._time || !fv()) for (var r = n._pt; r;) (r.r(e, r.d), (r = r._next));
    else n.styles.revert();
  },
  get: gr,
  aliases: Fn,
  getSetter: function (e, n, r) {
    var i = Fn[n];
    return (
      i && i.indexOf(`,`) < 0 && (n = i),
      n in mr && n !== bt && (e._gsap.x || gr(e, `x`))
        ? r && fS === r
          ? n === `scale`
            ? fV
            : dV
          : (fS = r || {}) && (n === `scale` ? hV : pV)
        : e.style && !zd(e.style[n])
          ? uV
          : ~n.indexOf(`-`)
            ? lV
            : Kd(e, n)
    );
  },
  core: { _removeProperty: Wr, _getMatrix: pv },
};
lt.utils.checkPrefix = bs;
lt.core.getStyleSaver = IS;
(function (t, e, n, r) {
  var i = mt(t + `,` + e + `,` + n, function (o) {
    mr[o] = 1;
  });
  (mt(e, function (o) {
    ((It.units[o] = `deg`), (MS[o] = 1));
  }),
    (Fn[i[13]] = t + `,` + e),
    mt(r, function (o) {
      var s = o.split(`:`);
      Fn[s[1]] = i[s[0]];
    }));
})(
  `x,y,z,scale,scaleX,scaleY,xPercent,yPercent`,
  `rotation,rotationX,rotationY,skewX,skewY`,
  `transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective`,
  `0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY`,
);
mt(`x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective`, function (t) {
  It.units[t] = `px`;
});
lt.registerPlugin(gv);
var bV = lt.registerPlugin(gv) || lt;
bV.core.Tween;
export {
  LI as $,
  ym as $i,
  hC as $n,
  px as $r,
  Y as $t,
  GX as A,
  vT as Ai,
  dQ as An,
  le as Ar,
  Rs as At,
  IR as B,
  xQ as Bi,
  eg as Bn,
  nr as Br,
  U0 as Bt,
  F as C,
  ue as Ci,
  bX as Cn,
  kx as Cr,
  Qp as Ct,
  GE as D,
  vF as Di,
  d1 as Dn,
  lT as Dr,
  Rl as Dt,
  FO as E,
  vA as Ei,
  cT as En,
  lQ as Er,
  R9 as Et,
  HX as F,
  vx as Fi,
  df as Fn,
  mn as Fr,
  Se as Ft,
  JX as G,
  yF as Gi,
  fX as Gn,
  on as Gr,
  VO as Gt,
  Ir as H,
  xi as Hi,
  fQ as Hn,
  oN as Hr,
  UF as Ht,
  He as I,
  wQ as Ii,
  dr as In,
  mo as Ir,
  T1 as It,
  KQ as J,
  yX as Ji,
  ft as Jn,
  pX as Jr,
  WQ as Jt,
  Jc as K,
  yR as Ki,
  fc as Kn,
  ot as Kr,
  Vi as Kt,
  Hy as L,
  wR as Li,
  dw as Ln,
  mx as Lr,
  TX as Lt,
  H0 as M,
  ve as Mi,
  dT as Mn,
  m1 as Mr,
  SM as Mt,
  HE as N,
  vg as Ni,
  dX as Nn,
  mT as Nr,
  SR as Nt,
  GF as O,
  vQ as Oi,
  dC as On,
  lX as Or,
  Rn as Ot,
  HQ as P,
  vo as Pi,
  db as Pn,
  mX as Pr,
  SX as Pt,
  LD as Q,
  ye as Qi,
  gx as Qn,
  pl as Qr,
  Xn as Qt,
  I as R,
  wb as Ri,
  e1 as Rn,
  nQ as Rr,
  Ta as Rt,
  ET as S,
  ub as Si,
  bV as Sn,
  kr as Sr,
  Qo as St,
  FK as T,
  v as Ti,
  cC as Tn,
  lC as Tr,
  R1 as Tt,
  Ix as U,
  xs as Ui,
  fR as Un,
  oe as Ur,
  Ue as Ut,
  IX as V,
  xX as Vi,
  et as Vn,
  o0 as Vr,
  UC as Vt,
  J as W,
  xx as Wi,
  fT as Wn,
  og as Wr,
  VE as Wt,
  Kv as X,
  yc as Xi,
  gX as Xn,
  pe as Xr,
  Wo as Xt,
  Ko as Y,
  ya as Yi,
  g1 as Yn,
  pb as Yr,
  Wa as Yt,
  Kx as Z,
  yd as Zi,
  gm as Zn,
  pi as Zr,
  XX as Zt,
  Cb as _,
  tg as _i,
  aN as _n,
  ji as _r,
  P9 as _t,
  A9 as a,
  zS as aa,
  qe as ai,
  ZE as an,
  hs as ar,
  Mk as at,
  EJ as b,
  tt as bi,
  bC as bn,
  k as br,
  Px as bt,
  An as c,
  zv as ca,
  rg as ci,
  ZX as cn,
  iJ as cr,
  N9 as ct,
  BE as d,
  n as da,
  sR as di,
  _R as dn,
  ig as dr,
  Na as dt,
  yr as ea,
  q as ei,
  YE as en,
  hQ as er,
  LK as et,
  BF as f,
  sg as fi,
  _T as fn,
  it as fr,
  Nw as ft,
  Ca as g,
  te as gi,
  aC as gn,
  jO as gr,
  Os as gt,
  CZ as h,
  tQ as hi,
  a1 as hn,
  jE as hr,
  Oa as ht,
  A1 as i,
  zQ as ia,
  qX as ii,
  Yx as in,
  hb as ir,
  MX as it,
  H as j,
  vX as ji,
  dR as jn,
  lr as jr,
  Rx as jt,
  GQ as k,
  vR as ki,
  dF as kn,
  lb as kr,
  Ro as kt,
  Ax as l,
  l as la,
  ru as li,
  Ze as ln,
  ia as lr,
  NM as lt,
  By as m,
  sw as mi,
  _r as mn,
  jC as mr,
  OE as mt,
  $X as n,
  yx as na,
  qI as ni,
  Yt as nn,
  hT as nr,
  M1 as nt,
  AM as o,
  zX as oa,
  qv as oi,
  ZI as on,
  hx as or,
  Ml as ot,
  Bi as p,
  sn as pi,
  _e as pn,
  j as pr,
  O9 as pt,
  Jy as q,
  yT as qi,
  ff as qn,
  pJ as qr,
  WE as qt,
  $e as r,
  z as ra,
  qQ as ri,
  Yv as rn,
  hX as rr,
  M9 as rt,
  AX as s,
  zo as sa,
  rJ as si,
  ZQ as sn,
  i1 as sr,
  N1 as st,
  $Q as t,
  yt as ta,
  qE as ti,
  YQ as tn,
  hR as tr,
  Li as tt,
  B0 as u,
  m as ua,
  sQ as ui,
  Zv as un,
  ie as ur,
  NX as ut,
  DT as v,
  tk as vi,
  ag as vn,
  jn as vr,
  PI as vt,
  FE as w,
  ur as wi,
  bi as wn,
  l1 as wr,
  Qv as wt,
  ER as x,
  uC as xi,
  bR as xn,
  kd as xr,
  QX as xt,
  E as y,
  tr as yi,
  am as yn,
  jo as yr,
  PK as yt,
  IQ as z,
  x9 as zi,
  e_ as zn,
  ng as zr,
  Tk as zt,
};
