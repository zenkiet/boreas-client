import {
  $i as ym,
  Ar as le$1,
  C as F$1,
  Ct as Qp,
  Ht as UF,
  I as He,
  Kr as ot,
  Ni as vg,
  O as GF,
  R as I$1,
  Rn as e1,
  Rr as nQ,
  Ti as v$1,
  Ur as oe,
  W as J$1,
  Xi as yc,
  Yi as ya,
  Zn as gm,
  _t as P9,
  bn as bC,
  c as An,
  dt as Na,
  ei as q$1,
  f as BF,
  fr as it,
  hi as tQ,
  ht as Oa,
  j as H,
  kt as Ro,
  la as l,
  lr as ia,
  ni as qI,
  nn as Yt$1,
  on as ZI,
  r as $e,
  ua as m$1,
  ur as ie,
  y as E,
  yi as tr$1,
} from './chunk-CD8PwEax.js';
var mt = Symbol(`FIELD_TREE`);
var ue = 0;
function Ft() {
  return ue;
}
function w(r, e) {
  return (...t) => {
    try {
      return ((ue = e), r(...t));
    } finally {
      ue = 0;
    }
  };
}
function Ot(r) {
  return !r;
}
function lt(r) {
  return r;
}
function v(r) {
  return Array.isArray(r);
}
function $(r) {
  return (typeof r == `object` || typeof r == `function`) && r != null;
}
var C = Symbol();
var J = Symbol();
var j = class {
  predicates;
  fns = [];
  constructor(e) {
    this.predicates = e;
  }
  push(e) {
    this.fns.push(ct(this.predicates, e));
  }
  mergeIn(e) {
    let t = this.predicates ? e.fns.map((n) => ct(this.predicates, n)) : e.fns;
    this.fns.push(...t);
  }
  hasRules() {
    return this.fns.length > 0;
  }
};
var q = class extends j {
  get defaultValue() {
    return !1;
  }
  compute(e) {
    return this.fns.some((t) => {
      let n = t(e);
      return n && n !== J;
    });
  }
};
var P = class r extends j {
  ignore;
  static ignoreNull(e) {
    return new r(e, (t) => t === null);
  }
  constructor(e, t) {
    (super(e), (this.ignore = t));
  }
  get defaultValue() {
    return [];
  }
  compute(e) {
    return this.fns.reduce((t, n) => {
      let i = n(e);
      return i === void 0 || i === J
        ? t
        : v(i)
          ? [...t, ...(this.ignore ? i.filter((s) => !this.ignore(s)) : i)]
          : this.ignore && this.ignore(i)
            ? t
            : [...t, i];
    }, []);
  }
};
var le = class extends P {
  constructor(e) {
    super(e, void 0);
  }
};
var ce = class extends j {
  key;
  get defaultValue() {
    return this.key.reducer.getInitial();
  }
  constructor(e, t) {
    (super(e), (this.key = t));
  }
  compute(e) {
    if (this.fns.length === 0) return this.key.reducer.getInitial();
    let t = this.key.reducer.getInitial();
    for (let n = 0; n < this.fns.length; n++) {
      let i = this.fns[n](e);
      i !== J && (t = this.key.reducer.reduce(t, i));
    }
    return t;
  }
};
function ct(r, e) {
  return r.length === 0
    ? e
    : (t) => {
        for (let n of r) {
          let i = t.stateOf(n.path),
            s = F$1(i.structure.pathKeys).length - n.depth;
          for (let o = 0; o < s; o++) i = i.structure.parent;
          if (!n.fn(i.context)) return J;
        }
        return e(t);
      };
}
var k = class {
  predicates;
  hidden;
  disabledReasons;
  readonly;
  syncErrors;
  syncTreeErrors;
  asyncErrors;
  metadata = new Map();
  constructor(e) {
    ((this.predicates = e),
      (this.hidden = new q(e)),
      (this.disabledReasons = new le(e)),
      (this.readonly = new q(e)),
      (this.syncErrors = P.ignoreNull(e)),
      (this.syncTreeErrors = P.ignoreNull(e)),
      (this.asyncErrors = P.ignoreNull(e)));
  }
  hasAnyLogic() {
    return (
      this.hidden.hasRules() ||
      this.disabledReasons.hasRules() ||
      this.readonly.hasRules() ||
      this.syncErrors.hasRules() ||
      this.syncTreeErrors.hasRules() ||
      this.asyncErrors.hasRules() ||
      this.metadata.size > 0
    );
  }
  hasMetadata(e) {
    return this.metadata.has(e);
  }
  hasMetadataKeys() {
    return this.metadata.size > 0;
  }
  getMetadataKeys() {
    return this.metadata.keys();
  }
  getMetadata(e) {
    return (
      this.metadata.has(e) || this.metadata.set(e, new ce(this.predicates, e)),
      this.metadata.get(e)
    );
  }
  mergeIn(e) {
    (this.hidden.mergeIn(e.hidden),
      this.disabledReasons.mergeIn(e.disabledReasons),
      this.readonly.mergeIn(e.readonly),
      this.syncErrors.mergeIn(e.syncErrors),
      this.syncTreeErrors.mergeIn(e.syncTreeErrors),
      this.asyncErrors.mergeIn(e.asyncErrors));
    for (let t of e.getMetadataKeys()) {
      let n = e.metadata.get(t);
      this.getMetadata(t).mergeIn(n);
    }
  }
};
var z = class {
  depth;
  constructor(e) {
    this.depth = e;
  }
  build() {
    return new W(this, [], 0);
  }
};
var F = class r extends z {
  constructor(e) {
    super(e);
  }
  current;
  all = [];
  addHiddenRule(e) {
    this.getCurrent().addHiddenRule(e);
  }
  addDisabledReasonRule(e) {
    this.getCurrent().addDisabledReasonRule(e);
  }
  addReadonlyRule(e) {
    this.getCurrent().addReadonlyRule(e);
  }
  addSyncErrorRule(e) {
    this.getCurrent().addSyncErrorRule(e);
  }
  addSyncTreeErrorRule(e) {
    this.getCurrent().addSyncTreeErrorRule(e);
  }
  addAsyncErrorRule(e) {
    this.getCurrent().addAsyncErrorRule(e);
  }
  addMetadataRule(e, t) {
    this.getCurrent().addMetadataRule(e, t);
  }
  getChild(e) {
    if (e === C) {
      let t = this.getCurrent().children;
      t.size > (t.has(C) ? 1 : 0) && (this.current = void 0);
    }
    return this.getCurrent().getChild(e);
  }
  hasLogic(e) {
    return this === e ? !0 : this.all.some(({ builder: t }) => t.hasLogic(e));
  }
  hasRules() {
    return this.all.length > 0;
  }
  anyChildHasLogic() {
    return this.all.some(({ builder: e }) => e.anyChildHasLogic());
  }
  mergeIn(e, t) {
    (t
      ? this.all.push({ builder: e, predicate: { fn: w(t.fn, this.depth), path: t.path } })
      : this.all.push({ builder: e }),
      (this.current = void 0));
  }
  getCurrent() {
    return (
      this.current === void 0 &&
        ((this.current = new x(this.depth)), this.all.push({ builder: this.current })),
      this.current
    );
  }
  static newRoot() {
    return new r(0);
  }
};
var x = class extends z {
  logic = new k([]);
  children = new Map();
  constructor(e) {
    super(e);
  }
  addHiddenRule(e) {
    this.logic.hidden.push(w(e, this.depth));
  }
  addDisabledReasonRule(e) {
    this.logic.disabledReasons.push(w(e, this.depth));
  }
  addReadonlyRule(e) {
    this.logic.readonly.push(w(e, this.depth));
  }
  addSyncErrorRule(e) {
    this.logic.syncErrors.push(w(e, this.depth));
  }
  addSyncTreeErrorRule(e) {
    this.logic.syncTreeErrors.push(w(e, this.depth));
  }
  addAsyncErrorRule(e) {
    this.logic.asyncErrors.push(w(e, this.depth));
  }
  addMetadataRule(e, t) {
    this.logic.getMetadata(e).push(w(t, this.depth));
  }
  getChild(e) {
    return (
      this.children.has(e) || this.children.set(e, new F(this.depth + 1)),
      this.children.get(e)
    );
  }
  hasLogic(e) {
    return this === e;
  }
  hasRules() {
    return this.logic.hasAnyLogic() || this.children.size > 0;
  }
  anyChildHasLogic() {
    for (let e of this.children.values()) if (e.hasRules()) return !0;
    return !1;
  }
};
var W = class r {
  builder;
  predicates;
  depth;
  logic;
  constructor(e, t, n) {
    ((this.builder = e),
      (this.predicates = t),
      (this.depth = n),
      (this.logic = e ? _t(e, t, n) : new k([])));
  }
  getChild(e) {
    let t = this.builder ? gt(this.builder, e) : [];
    if (t.length === 0) return new r(void 0, [], this.depth + 1);
    if (t.length === 1) {
      let { builder: n, predicates: i } = t[0];
      return new r(n, [...this.predicates, ...i.map((s) => fe(s, this.depth))], this.depth + 1);
    } else
      return new he(
        t.map(
          ({ builder: i, predicates: s }) =>
            new r(i, [...this.predicates, ...s.map((o) => fe(o, this.depth))], this.depth + 1),
        ),
      );
  }
  hasLogic(e) {
    return this.builder ? this.builder.hasLogic(e) : !1;
  }
  hasRules() {
    return this.builder ? this.builder.hasRules() : !1;
  }
  anyChildHasLogic() {
    return this.builder ? this.builder.anyChildHasLogic() : !1;
  }
};
var he = class r {
  all;
  logic;
  constructor(e) {
    ((this.all = e), (this.logic = new k([])));
    for (let t of e) this.logic.mergeIn(t.logic);
  }
  getChild(e) {
    return new r(this.all.flatMap((t) => t.getChild(e)));
  }
  hasLogic(e) {
    return this.all.some((t) => t.hasLogic(e));
  }
  hasRules() {
    return this.all.some((e) => e.hasRules());
  }
  anyChildHasLogic() {
    return this.all.some((e) => e.anyChildHasLogic());
  }
};
function gt(r, e) {
  if (r instanceof F)
    return r.all.flatMap(({ builder: t, predicate: n }) => {
      let i = gt(t, e);
      return n
        ? i.map(({ builder: s, predicates: o }) => ({ builder: s, predicates: [...o, n] }))
        : i;
    });
  if (r instanceof x)
    return [
      ...(e !== C && r.children.has(C) ? [{ builder: r.getChild(C), predicates: [] }] : []),
      ...(r.children.has(e) ? [{ builder: r.getChild(e), predicates: [] }] : []),
    ];
  throw new I$1(1909, !1);
}
function _t(r, e, t) {
  let n = new k(e);
  if (r instanceof F) {
    let i = r.all.map(({ builder: s, predicate: o }) => new W(s, o ? [...e, fe(o, t)] : e, t));
    for (let s of i) n.mergeIn(s.logic);
  } else if (r instanceof x) n.mergeIn(r.logic);
  else throw new I$1(1909, !1);
  return n;
}
function fe(r, e) {
  return m$1(l({}, r), { depth: e });
}
var yt = Symbol(`PATH`);
var N = class r {
  keys;
  parent;
  keyInParent;
  root;
  children = new Map();
  fieldPathProxy = new Proxy(this, Vt);
  logicBuilder;
  constructor(e, t, n, i) {
    ((this.keys = e),
      (this.parent = n),
      (this.keyInParent = i),
      (this.root = t ?? this),
      n || (this.logicBuilder = F.newRoot()));
  }
  get builder() {
    return this.logicBuilder ? this.logicBuilder : this.parent.builder.getChild(this.keyInParent);
  }
  getChild(e) {
    return (
      this.children.has(e) || this.children.set(e, new r([...this.keys, e], this.root, this, e)),
      this.children.get(e)
    );
  }
  mergeIn(e, t) {
    let n = e.compile();
    this.builder.mergeIn(n.builder, t);
  }
  static unwrapFieldPath(e) {
    return e[yt];
  }
  static newRoot() {
    return new r([], void 0, void 0, void 0);
  }
};
var Vt = {
  get(r, e) {
    return e === yt ? r : r.getChild(e).fieldPathProxy;
  },
};
var G;
var K = new Map();
var Y = class r {
  schemaFn;
  constructor(e) {
    this.schemaFn = e;
  }
  compile() {
    if (K.has(this)) return K.get(this);
    let e = N.newRoot();
    K.set(this, e);
    let t = G;
    try {
      ((G = e), this.schemaFn(e.fieldPathProxy));
    } finally {
      G = t;
    }
    return e;
  }
  static create(e) {
    return e instanceof r ? e : new r(e);
  }
  static rootCompile(e) {
    try {
      return (
        K.clear(),
        e === void 0 ? N.newRoot() : e instanceof r ? e.compile() : new r(e).compile()
      );
    } finally {
      K.clear();
    }
  }
};
function Lt(r) {
  return r instanceof Y || typeof r == `function`;
}
function Se(r) {
  if (G !== N.unwrapFieldPath(r).root) throw new I$1(1908, !1);
}
function b(r, e, t) {
  return (Se(r), N.unwrapFieldPath(r).builder.addMetadataRule(e, t), e);
}
var S = {
  list() {
    return { reduce: (r, e) => (e === void 0 ? r : [...r, e]), getInitial: () => [] };
  },
  min() {
    return {
      reduce: (r, e) => (r === void 0 || e === void 0 ? (r ?? e) : e < r ? e : r),
      getInitial: () => {},
    };
  },
  max() {
    return {
      reduce: (r, e) => (r === void 0 || e === void 0 ? (r ?? e) : e > r ? e : r),
      getInitial: () => {},
    };
  },
  or() {
    return { reduce: (r, e) => r || e, getInitial: () => !1 };
  },
  and() {
    return { reduce: (r, e) => r && e, getInitial: () => !0 };
  },
  override: Kt,
};
function Kt(r) {
  return { reduce: (e, t) => t, getInitial: () => r?.() };
}
var Re = Symbol(`IS_ASYNC_VALIDATION_RESOURCE`);
var X = class {
  reducer;
  create;
  brand;
  [Re];
  constructor(e, t) {
    ((this.reducer = e), (this.create = t));
  }
};
function g(r) {
  return new X(r ?? S.override());
}
function Te() {
  return g();
}
var De = g(S.or());
var Ce = Te();
var Ae = g(S.max());
var Ie = Te();
var Pe = g(S.min());
var pt = g(S.max());
var bt = g(S.min());
var ke = g(S.list());
function m(r, e) {
  if (r === e) return !0;
  if (!r || !e || r.length !== e.length) return !1;
  for (let t = 0; t < r.length; t++) if (!Object.is(r[t], e[t])) return !1;
  return !0;
}
function jt(r) {
  return r.errors().length > 0 ? `invalid` : r.pending() ? `unknown` : `valid`;
}
var me = class {
  node;
  constructor(e) {
    this.node = e;
  }
  rawSyncTreeErrors = oe(
    () =>
      this.shouldSkipValidation()
        ? []
        : [
            ...this.node.logicNode.logic.syncTreeErrors.compute(this.node.context),
            ...(this.node.structure.parent?.validationState.rawSyncTreeErrors() ?? []),
          ],
    { equal: m },
  );
  syncErrors = oe(
    () =>
      this.shouldSkipValidation()
        ? []
        : [
            ...this.node.logicNode.logic.syncErrors.compute(this.node.context),
            ...this.syncTreeErrors(),
            ...xt(this.node.submitState.submissionErrors()),
          ],
    { equal: m },
  );
  syncValid = oe(() =>
    this.shouldSkipValidation()
      ? !0
      : this.node.structure.reduceChildren(
          this.syncErrors().length === 0,
          (e, t) => t && e.validationState.syncValid(),
          Ot,
        ),
  );
  syncTreeErrors = oe(
    () => this.rawSyncTreeErrors().filter((e) => e.fieldTree === this.node.fieldTree),
    { equal: m },
  );
  rawAsyncErrors = oe(
    () =>
      this.shouldSkipValidation()
        ? []
        : [
            ...this.node.logicNode.logic.asyncErrors.compute(this.node.context),
            ...(this.node.structure.parent?.validationState.rawAsyncErrors() ?? []),
          ],
    { equal: m },
  );
  asyncErrors = oe(
    () =>
      this.shouldSkipValidation()
        ? []
        : this.rawAsyncErrors().filter(
            (e) => e === `pending` || e.fieldTree === this.node.fieldTree,
          ),
    { equal: m },
  );
  parseErrors = oe(() => this.node.formFieldBindings().flatMap((e) => e.parseErrors()), {
    equal: m,
  });
  errors = oe(
    () => [
      ...this.parseErrors(),
      ...this.syncErrors(),
      ...this.asyncErrors().filter((e) => e !== `pending`),
    ],
    { equal: m },
  );
  errorSummary = oe(
    () => {
      let e = this.node.structure.reduceChildren(this.errors(), (t, n) => [
        ...n,
        ...t.errorSummary(),
      ]);
      return (F$1(() => e.sort(Bt)), e);
    },
    { equal: m },
  );
  pending = oe(() =>
    this.node.structure.reduceChildren(
      this.asyncErrors().includes(`pending`),
      (e, t) => t || e.validationState.pending(),
    ),
  );
  status = oe(() => {
    if (this.shouldSkipValidation()) return `valid`;
    let e = jt(this);
    return this.node.structure.reduceChildren(
      e,
      (t, n) =>
        n === `invalid` || t.validationState.status() === `invalid`
          ? `invalid`
          : n === `unknown` || t.validationState.status() === `unknown`
            ? `unknown`
            : `valid`,
      (t) => t === `invalid`,
    );
  });
  valid = oe(() => this.status() === `valid`);
  invalid = oe(() => this.status() === `invalid`);
  shouldSkipValidation = oe(
    () =>
      this.node.hidden() ||
      this.node.disabled() ||
      this.node.readonly() ||
      this.node.structure.isOrphaned(),
  );
};
function xt(r) {
  return r === void 0 ? [] : v(r) ? r : [r];
}
function Fe(r, e) {
  if (v(r)) for (let t of r) t.fieldTree ??= e;
  else r && (r.fieldTree ??= e);
  return r;
}
function ht(r) {
  return r.formField
    ? r.formField.element
    : r
        .fieldTree()
        .formFieldBindings()
        .reduce(
          (e, t) =>
            !e || !t.element
              ? (e ?? t.element)
              : e.compareDocumentPosition(t.element) & Node.DOCUMENT_POSITION_PRECEDING
                ? t.element
                : e,
          void 0,
        );
}
function Bt(r, e) {
  let t = ht(r),
    n = ht(e);
  return t === n
    ? 0
    : t === void 0 || n === void 0
      ? t === void 0
        ? 1
        : -1
      : t.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING
        ? 1
        : -1;
}
var ge = g();
var ye = class {
  node;
  cache = new WeakMap();
  constructor(e) {
    ((this.node = e),
      (this.fieldTreeOf = this.fieldTreeOf.bind(this)),
      (this.stateOf = this.stateOf.bind(this)));
  }
  resolve(e) {
    if (!this.cache.has(e)) {
      let t = oe(() => {
        let n = N.unwrapFieldPath(e),
          i = this.node,
          s = Ft();
        for (; s > 0 || !i.structure.logic.hasLogic(n.root.builder);)
          if ((s--, (i = i.structure.parent), i === void 0)) throw new I$1(1900, !1);
        for (let o of n.keys)
          if (((i = i.structure.getChild(o)), i === void 0)) throw new I$1(1901, !1);
        return i.fieldTree;
      });
      this.cache.set(e, t);
    }
    return this.cache.get(e)();
  }
  get fieldTree() {
    return this.node.fieldProxy;
  }
  get state() {
    return this.node;
  }
  get value() {
    return this.node.structure.value;
  }
  get key() {
    return this.node.structure.keyInParent;
  }
  get pathKeys() {
    return this.node.structure.pathKeys;
  }
  index = oe(() => {
    let e = this.key();
    if (!v(F$1(this.node.structure.parent.value))) throw new I$1(1906, !1);
    return Number(e);
  });
  fieldTreeOf(e) {
    return this.resolve(e);
  }
  stateOf(e) {
    return this.resolve(e)();
  }
  valueOf = (e) => {
    let t = this.resolve(e)().value();
    if (t instanceof ym) throw new I$1(1907, !1);
    return t;
  };
};
var pe = class {
  node;
  metadata = new Map();
  constructor(e) {
    this.node = e;
  }
  runMetadataCreateLifecycle() {
    if (!this.node.logicNode.logic.hasMetadataKeys()) return;
    let e = bC();
    e && vg(!1);
    try {
      F$1(() =>
        $e(this.node.structure.injector, () => {
          for (let t of this.node.logicNode.logic.getMetadataKeys())
            if (t.create) {
              let n = this.node.logicNode.logic.getMetadata(t),
                i = t.create(
                  this.node,
                  oe(() => n.compute(this.node.context)),
                );
              this.metadata.set(t, i);
            }
        }),
      );
    } finally {
      e && vg(!0);
    }
  }
  get(e) {
    if (this.has(e) && !this.metadata.has(e)) {
      if (e.create) throw new I$1(1912, !1);
      let t = this.node.logicNode.logic.getMetadata(e);
      this.metadata.set(
        e,
        oe(() => t.compute(this.node.context)),
      );
    }
    return this.metadata.get(e);
  }
  has(e) {
    return this.node.logicNode.logic.hasMetadata(e);
  }
};
var Ut = {
  get(r, e, t) {
    if (e === mt) return !0;
    let n = r(),
      i = n.structure.getChild(e);
    if (i !== void 0) return i.fieldTree;
    let s = F$1(n.value);
    if (v(s)) {
      if (e === `length`) return n.value().length;
      if (e === Symbol.iterator)
        return () => (n.value(), Array.prototype[Symbol.iterator].apply(n.fieldTree));
    }
    if ($(s) && e === Symbol.iterator)
      return function* () {
        for (let o in t) yield [o, t[o]];
      };
  },
  getOwnPropertyDescriptor(r, e) {
    let t = F$1(r().value),
      n = Reflect.getOwnPropertyDescriptor(t, e);
    return (n && !n.configurable && (n.configurable = !0), n);
  },
  ownKeys(r) {
    let e = F$1(r().value);
    return typeof e == `object` && e !== null ? Reflect.ownKeys(e) : [];
  },
};
function Ht(r, e) {
  let t = oe(() => r()[e()]);
  return (
    (t[le$1] = r[le$1]),
    (t.set = (n) => {
      Object.is(F$1(t), n) || r.update((i) => Gt(i, n, e()));
    }),
    (t.update = (n) => {
      t.set(n(F$1(t)));
    }),
    (t.asReadonly = () => t),
    t
  );
}
function Gt(r, e, t) {
  if (v(r)) {
    let n = [...r];
    return ((n[t] = e), n);
  } else return m$1(l({}, r), { [t]: e });
}
var I = Symbol(``);
var vt = oe(() => !1);
var Z = class {
  logic;
  node;
  createChildNode;
  identitySymbol = Symbol();
  _injector = void 0;
  _anyChildHasLogic;
  get injector() {
    return (
      (this._injector ??= He.create({ providers: [], parent: this.fieldManager.injector })),
      this._injector
    );
  }
  constructor(e, t, n) {
    ((this.logic = e), (this.node = t), (this.createChildNode = n));
  }
  children() {
    this.ensureChildrenMap();
    let e = this.childrenMap();
    return e === void 0 ? [] : Array.from(e.byPropertyKey.values()).map((t) => F$1(t.reader));
  }
  materializedChildren() {
    let e = this.childrenMap();
    return e === void 0 ? [] : Array.from(e.byPropertyKey.values()).map((t) => t.node);
  }
  _areChildrenMaterialized() {
    return F$1(this.childrenMap) !== void 0;
  }
  ensureChildrenMap() {
    this._areChildrenMaterialized() ||
      F$1(() => {
        this.childrenMap.update((e) => this.computeChildrenMap(this.value(), e, !0));
      });
  }
  getChild(e) {
    this.ensureChildrenMap();
    let t = e.toString(),
      n = F$1(this.childrenMap)?.byPropertyKey.get(t)?.reader;
    return (n || (n = this.createReader(t)), n());
  }
  reduceChildren(e, t, n) {
    let i = this.childrenMap();
    if (!i) return e;
    let s = e;
    for (let o of i.byPropertyKey.values()) {
      if (n?.(s)) break;
      s = t(F$1(o.reader), s);
    }
    return s;
  }
  destroy() {
    this.injector.destroy();
  }
  createKeyOrOrphanSignals(e, t, n) {
    if (e === `root`) return { keyInParent: Nt, isOrphaned: vt };
    let i = this.parent,
      s = n,
      o = oe(() => {
        if (i.structure.isOrphaned()) return I;
        let c = i.structure.childrenMap();
        if (!c) return I;
        let p = c.byPropertyKey.get(s);
        if (p && p.node === this.node) return s;
        if (t === void 0) return I;
        for (let [ne, M] of c.byPropertyKey) if (M.node === this.node) return (s = ne);
        return I;
      }),
      d = oe(() => o() === I);
    return {
      keyInParent: oe(() => {
        let c = o();
        if (c === I) throw t === void 0 ? new I$1(-1902, !1) : new I$1(1904, !1);
        return c;
      }),
      isOrphaned: d,
    };
  }
  createChildrenMap() {
    return Oa({
      source: this.value,
      computation: (e, t) => this.computeChildrenMap(e, t?.value, !1),
    });
  }
  computeChildrenMap(e, t, n) {
    if (
      !$(e) ||
      (!n && t === void 0 && !(this._anyChildHasLogic ??= this.logic.anyChildHasLogic()))
    )
      return;
    t ??= { byPropertyKey: new Map() };
    let i,
      s = v(e);
    t !== void 0 && (s ? (i = qt(t, e, this.identitySymbol)) : (i = zt(t, e)));
    for (let o of Object.keys(e)) {
      let d,
        u = e[o];
      if (u === void 0) {
        t.byPropertyKey.has(o) && ((i ??= l({}, t)), i.byPropertyKey.delete(o));
        continue;
      }
      s && $(u) && !v(u) && (d = u[this.identitySymbol] ??= Symbol(``));
      let c;
      d &&
        (t.byTrackingKey?.has(d) ||
          ((i ??= l({}, t)),
          (i.byTrackingKey ??= new Map()),
          i.byTrackingKey.set(d, this.createChildNode(o, d, s))),
        (c = (i ?? t).byTrackingKey.get(d)));
      let p = t.byPropertyKey.get(o);
      p === void 0
        ? ((i ??= l({}, t)),
          i.byPropertyKey.set(o, {
            reader: this.createReader(o),
            node: c ?? this.createChildNode(o, d, s),
          }))
        : c && c !== p.node && ((i ??= l({}, t)), (p.node = c));
    }
    return i ?? t;
  }
  createReader(e) {
    return oe(() => this.childrenMap()?.byPropertyKey.get(e)?.node);
  }
};
var be = class extends Z {
  fieldManager;
  value;
  get parent() {}
  get root() {
    return this.node;
  }
  get pathKeys() {
    return $t;
  }
  get keyInParent() {
    return Nt;
  }
  isOrphaned = vt;
  childrenMap;
  constructor(e, t, n, i, s) {
    (super(t, e, s),
      (this.fieldManager = n),
      (this.value = i),
      (this.childrenMap = this.createChildrenMap()));
  }
};
var ve = class extends Z {
  logic;
  parent;
  root;
  pathKeys;
  keyInParent;
  value;
  childrenMap;
  isOrphaned;
  get fieldManager() {
    return this.root.structure.fieldManager;
  }
  constructor(e, t, n, i, s, o) {
    (super(t, e, o), (this.logic = t), (this.parent = n), (this.root = this.parent.structure.root));
    let d = this.createKeyOrOrphanSignals(`child`, i, s);
    ((this.isOrphaned = d.isOrphaned),
      (this.keyInParent = d.keyInParent),
      (this.pathKeys = oe(() => [...n.structure.pathKeys(), this.keyInParent()])),
      (this.value = Ht(this.parent.structure.value, this.keyInParent)),
      (this.childrenMap = this.createChildrenMap()),
      this.fieldManager.structures.add(this));
  }
};
var $t = oe(() => []);
var Nt = oe(() => {
  throw new I$1(1905, !1);
});
function qt(r, e, t) {
  let n,
    i = new Set(r.byPropertyKey.keys()),
    s = r.byTrackingKey && new Set(r.byTrackingKey.keys());
  for (let o = 0; o < e.length; o++) {
    let d = e[o];
    (i.delete(o.toString()), s && $(d) && Object.hasOwn(d, t) && s.delete(d[t]));
  }
  if (i.size > 0) {
    n ??= l({}, r);
    for (let o of i) n.byPropertyKey.delete(o);
  }
  if (s && s.size > 0) {
    n ??= l({}, r);
    for (let o of s) n.byTrackingKey.delete(o);
  }
  return n;
}
function zt(r, e) {
  let t;
  for (let n of r.byPropertyKey.keys())
    e.hasOwnProperty(n) || ((t ??= l({}, r)), t.byPropertyKey.delete(n));
  return t;
}
var Ne = class {
  node;
  selfSubmitting = H(!1);
  submissionErrors;
  constructor(e) {
    ((this.node = e),
      (this.submissionErrors = Oa({ source: this.node.structure.value, computation: () => [] })));
  }
  submitting = oe(() => this.selfSubmitting() || (this.node.structure.parent?.submitting() ?? !1));
};
var B = class {
  structure;
  validationState;
  metadataState;
  nodeState;
  submitState;
  fieldAdapter;
  controlValue;
  _context = void 0;
  get context() {
    return (this._context ??= new ye(this));
  }
  fieldProxy = new Proxy(() => this, Ut);
  pathNode;
  constructor(e) {
    ((this.pathNode = e.pathNode),
      (this.fieldAdapter = e.fieldAdapter),
      (this.structure = this.fieldAdapter.createStructure(this, e)),
      (this.validationState = this.fieldAdapter.createValidationState(this, e)),
      (this.nodeState = this.fieldAdapter.createNodeState(this, e)),
      (this.metadataState = new pe(this)),
      (this.submitState = new Ne(this)),
      (this.controlValue = this.controlValueSignal()),
      this.metadataState.runMetadataCreateLifecycle());
  }
  focusBoundControl(e) {
    this.getBindingForFocus()?.focus(e);
  }
  getBindingForFocus() {
    return (
      this.formFieldBindings()
        .filter((t) => t.focus !== void 0)
        .reduce(ft, void 0) ||
      this.structure
        .children()
        .map((t) => t.getBindingForFocus())
        .reduce(ft, void 0)
    );
  }
  pendingSync = Oa({
    source: () => this.value(),
    computation: (e, t) => {
      t?.value?.abort();
    },
  });
  get fieldTree() {
    return this.fieldProxy;
  }
  get logicNode() {
    return this.structure.logic;
  }
  get value() {
    return this.structure.value;
  }
  get keyInParent() {
    return this.structure.keyInParent;
  }
  get errors() {
    return this.validationState.errors;
  }
  get parseErrors() {
    return this.validationState.parseErrors;
  }
  get errorSummary() {
    return this.validationState.errorSummary;
  }
  get pending() {
    return this.validationState.pending;
  }
  get valid() {
    return this.validationState.valid;
  }
  get invalid() {
    return this.validationState.invalid;
  }
  get dirty() {
    return this.nodeState.dirty;
  }
  get touched() {
    return this.nodeState.touched;
  }
  get disabled() {
    return this.nodeState.disabled;
  }
  get disabledReasons() {
    return this.nodeState.disabledReasons;
  }
  get hidden() {
    return this.nodeState.hidden;
  }
  get readonly() {
    return this.nodeState.readonly;
  }
  get formFieldBindings() {
    return this.nodeState.formFieldBindings;
  }
  get submitting() {
    return this.submitState.submitting;
  }
  get name() {
    return this.nodeState.name;
  }
  get max() {
    let e = this.metadata(Ie)?.();
    return e ? this.metadata(e) : void 0;
  }
  get maxLength() {
    return this.metadata(bt);
  }
  get min() {
    let e = this.metadata(Ce)?.();
    return e ? this.metadata(e) : void 0;
  }
  get minLength() {
    return this.metadata(pt);
  }
  get pattern() {
    return this.metadata(ke) ?? Wt;
  }
  get required() {
    return this.metadata(De) ?? Yt;
  }
  metadata(e) {
    return this.metadataState.get(e);
  }
  getError(e) {
    return this.errors().find((t) => t.kind === e);
  }
  hasMetadata(e) {
    return this.metadataState.has(e);
  }
  markAsTouched(e) {
    this.structure.isOrphaned() ||
      F$1(() => {
        (this.markAsTouchedInternal(e), this.flushSync());
      });
  }
  markAsTouchedInternal(e) {
    if (
      !this.structure.isOrphaned() &&
      !this.validationState.shouldSkipValidation() &&
      (this.nodeState.markAsTouched(), !e?.skipDescendants)
    )
      for (let t of this.structure.children()) t.markAsTouchedInternal();
  }
  markAsDirty() {
    this.nodeState.markAsDirty();
  }
  markAsPristine() {
    this.nodeState.markAsPristine();
  }
  markAsUntouched() {
    this.nodeState.markAsUntouched();
  }
  reset(e) {
    F$1(() => this._reset(e));
  }
  _reset(e) {
    (this.pendingSync()?.abort(),
      e !== void 0 && this.value.set(e),
      this.controlValue.rawSet(this.value()),
      this.nodeState.markAsUntouched(),
      this.nodeState.markAsPristine());
    for (let t of this.formFieldBindings()) t.reset();
    for (let t of this.structure.materializedChildren()) t._reset();
  }
  reloadValidation() {
    F$1(() => this._reloadValidation());
  }
  _reloadValidation() {
    let e = this.logicNode.logic.getMetadataKeys();
    for (let t of e) t[Re] && this.metadata(t).reload?.();
    for (let t of this.structure.children()) t._reloadValidation();
  }
  controlValueSignal() {
    let e = Oa(this.value);
    ((e.rawSet = e.set),
      (e.set = (n) => {
        (e.rawSet(n), this.markAsDirty(), this.debounceSync());
      }));
    let t = e.update;
    return (
      (e.update = (n) => {
        (t(n), this.markAsDirty(), this.debounceSync());
      }),
      e
    );
  }
  sync() {
    this.value.set(this.controlValue());
  }
  flushSync() {
    let e = this.pendingSync();
    e && !e.signal.aborted && (e.abort(), this.sync());
  }
  async debounceSync() {
    let e = F$1(() => (this.pendingSync()?.abort(), this.nodeState.debouncer()));
    if (e) {
      let t = new AbortController(),
        n = e(t.signal);
      if (n && (this.pendingSync.set(t), await n, t.signal.aborted)) return;
    }
    this.structure.isOrphaned() || this.sync();
  }
  static newRoot(e, t, n, i) {
    return i.newRoot(e, t, n, i);
  }
  createStructure(e) {
    return e.kind === `root`
      ? new be(this, e.logic, e.fieldManager, e.value, this.newChild.bind(this))
      : new ve(
          this,
          e.logic,
          e.parent,
          e.identityInParent,
          e.initialKeyInParent,
          this.newChild.bind(this),
        );
  }
  newChild(e, t, n) {
    let i, s;
    return (
      n
        ? ((i = this.pathNode.getChild(C)), (s = this.structure.logic.getChild(C)))
        : ((i = this.pathNode.getChild(e)), (s = this.structure.logic.getChild(e))),
      this.fieldAdapter.newChild({
        kind: `child`,
        parent: this,
        pathNode: i,
        logic: s,
        initialKeyInParent: e,
        identityInParent: t,
        fieldAdapter: this.fieldAdapter,
      })
    );
  }
};
var Wt = oe(() => []);
var Yt = oe(() => !1);
function ft(r, e) {
  return r
    ? e && r.element.compareDocumentPosition(e.element) & Node.DOCUMENT_POSITION_PRECEDING
      ? e
      : r
    : e;
}
var Me = class {
  node;
  selfTouched = H(!1);
  selfDirty = H(!1);
  markAsTouched() {
    this.selfTouched.set(!0);
  }
  markAsDirty() {
    this.selfDirty.set(!0);
  }
  markAsPristine() {
    this.selfDirty.set(!1);
  }
  markAsUntouched() {
    this.selfTouched.set(!1);
  }
  formFieldBindings = H([]);
  constructor(e) {
    this.node = e;
  }
  dirty = oe(() => {
    let e = this.selfDirty() && !this.isNonInteractive();
    return this.node.structure.reduceChildren(e, (t, n) => n || t.nodeState.dirty(), lt);
  });
  touched = oe(() => {
    let e = this.selfTouched() && !this.isNonInteractive();
    return this.node.structure.reduceChildren(e, (t, n) => n || t.nodeState.touched(), lt);
  });
  disabledReasons = oe(
    () => [
      ...(this.node.structure.parent?.nodeState.disabledReasons() ?? []),
      ...this.node.logicNode.logic.disabledReasons.compute(this.node.context),
    ],
    { equal: m },
  );
  disabled = oe(() => !!this.disabledReasons().length);
  readonly = oe(
    () =>
      (this.node.structure.parent?.nodeState.readonly() ||
        this.node.logicNode.logic.readonly.compute(this.node.context)) ??
      !1,
  );
  hidden = oe(
    () =>
      (this.node.structure.parent?.nodeState.hidden() ||
        this.node.logicNode.logic.hidden.compute(this.node.context)) ??
      !1,
  );
  name = oe(() => {
    let e = this.node.structure.parent;
    return e
      ? `${e.name()}.${this.node.structure.keyInParent()}`
      : this.node.structure.fieldManager.rootName;
  });
  debouncer = oe(() => {
    if (this.node.logicNode.logic.hasMetadata(ge)) {
      let t = this.node.logicNode.logic.getMetadata(ge).compute(this.node.context);
      if (t) return (n) => t(this.node.context, n);
    }
    return this.node.structure.parent?.nodeState.debouncer?.();
  });
  isNonInteractive = oe(() => this.hidden() || this.disabled() || this.readonly());
};
var Ee = class {
  newRoot(e, t, n, i) {
    return new B({
      kind: `root`,
      fieldManager: e,
      value: t,
      pathNode: n,
      logic: n.builder.build(),
      fieldAdapter: i,
    });
  }
  newChild(e) {
    return new B(e);
  }
  createNodeState(e) {
    return new Me(e);
  }
  createValidationState(e) {
    return new me(e);
  }
  createStructure(e, t) {
    return e.createStructure(t);
  }
};
var we = class {
  injector;
  rootName;
  submitOptions;
  constructor(e, t, n) {
    ((this.injector = e),
      (this.rootName = t ?? `${this.injector.get(Ro)}.form${Xt++}`),
      (this.submitOptions = n));
  }
  structures = new Set();
  createFieldManagementEffect(e) {
    Yt$1(
      () => {
        let t = new Set();
        this.markStructuresLive(e, t);
        for (let n of this.structures)
          t.has(n) || (this.structures.delete(n), F$1(() => n.destroy()));
      },
      { injector: this.injector },
    );
  }
  markStructuresLive(e, t) {
    t.add(e);
    for (let n of e.children()) this.markStructuresLive(n.structure, t);
  }
};
var Xt = 0;
var Mt = new E(``);
function Zt(r) {
  let e, t, n;
  return (
    r.length === 3
      ? ([e, t, n] = r)
      : r.length === 2
        ? Lt(r[1])
          ? ([e, t] = r)
          : ([e, n] = r)
        : ([e] = r),
    [e, t, n]
  );
}
function Qt(...r) {
  let [e, t, n] = Zt(r),
    i = n?.injector ?? v$1(He),
    s = $e(i, () => Y.rootCompile(t)),
    o = new we(i, n?.name, n?.submission),
    d = n?.adapter ?? new Ee(),
    u = B.newRoot(o, e, s, d);
  o.createFieldManagementEffect(u.structure);
  let { experimentalWebMcpTool: c } = n ?? {};
  if (c) {
    let p = $e(i, () => v$1(Mt, { optional: !0 }));
    p && $e(i, () => p(u.fieldTree, { name: c.name, description: c.description }));
  }
  return u.fieldTree;
}
async function Jt(r, e) {
  let t = F$1(r);
  if (F$1(t.submitState.submitting)) return !1;
  let n = e === void 0 ? t.structure.root.fieldProxy : r,
    i = { root: t.structure.root.fieldProxy, submitted: r };
  e = typeof e == `function` ? { action: e } : (e ?? t.structure.fieldManager.submitOptions);
  let s = e?.action;
  if (!s) throw new I$1(1915, !1);
  t.markAsTouched();
  let o = e?.onInvalid,
    d = er(t, e?.ignoreValidators);
  try {
    if (d) {
      t.submitState.selfSubmitting.set(!0);
      let u = await F$1(() => s?.(n, i));
      return (u && tr(t, u), !u || (v(u) && u.length === 0));
    } else F$1(() => o?.(n, i));
    return !1;
  } finally {
    t.submitState.selfSubmitting.set(!1);
  }
}
function er(r, e) {
  switch (e) {
    case `all`:
      return !0;
    case `none`:
      return F$1(r.valid);
    default:
      return !F$1(r.invalid);
  }
}
function tr(r, e) {
  v(e) || (e = [e]);
  let t = new Map();
  for (let n of e) {
    let i = Fe(n, r.fieldTree),
      s = i.fieldTree(),
      o = t.get(s);
    (o || ((o = []), t.set(s, o)), o.push(i));
  }
  for (let [n, i] of t) n.submitState.submissionErrors.set(i);
}
var Q = class {
  kind = `compat`;
  control;
  fieldTree;
  context;
  message;
  constructor({ context: e, kind: t, control: n }) {
    ((this.context = e), (this.kind = t), (this.control = n));
  }
};
function Et(r) {
  if (r.length === 0) return null;
  let e = {};
  for (let t of r) e[t.kind] = t instanceof Q ? t.context : t;
  return e;
}
function wt(r, e) {
  return r === null
    ? []
    : Object.entries(r).map(([t, n]) => new Q({ context: n, kind: t, control: e }));
}
var rr = new E(``);
function T(r, e) {
  return r instanceof Function ? r(e) : r;
}
function Ct(r) {
  return typeof r == `number` ? isNaN(r) : r === `` || r === !1 || r == null;
}
function St(r) {
  return r === void 0 ? [] : Array.isArray(r) ? r : [r];
}
function te(r, e) {
  (Se(r), N.unwrapFieldPath(r).builder.addSyncErrorRule((n) => Fe(e(n), n.fieldTree)));
}
function nr(r) {
  return new Oe(r);
}
function ir(r, e) {
  return new _e(r, e);
}
function sr(r, e) {
  return new Ve(r, e);
}
function or(r, e) {
  return new Le(r, e);
}
var A = class {
  __brand = void 0;
  kind = ``;
  fieldTree;
  message;
  constructor(e) {
    e && Object.assign(this, e);
  }
};
var Oe = class extends A {
  kind = `required`;
};
var _e = class extends A {
  min;
  kind = `min`;
  constructor(e, t) {
    (super(t), (this.min = e));
  }
};
var Ve = class extends A {
  max;
  kind = `max`;
  constructor(e, t) {
    (super(t), (this.max = e));
  }
};
var Le = class extends A {
  pattern;
  kind = `pattern`;
  constructor(e, t) {
    (super(t), (this.pattern = e));
  }
};
var ee = class extends A {
  kind = `parse`;
};
function Zr(r, e, t) {
  let n = g();
  (b(r, n, (i) => {
    if (!(t?.when && !t.when(i))) return typeof e == `function` ? e(i) : e;
  }),
    b(r, Pe, ({ state: i }) => i.metadata(n)()),
    b(r, Ie, () => Pe),
    te(r, (i) => {
      let s = i.value();
      if (s === null || Number.isNaN(s)) return;
      let o = i.state.metadata(n)();
      if (!(o === void 0 || Number.isNaN(o)) && s > o)
        return t?.error ? T(t.error, i) : sr(o, { message: T(t?.message, i) });
    }));
}
function Qr(r, e, t) {
  let n = g();
  (b(r, n, (i) => {
    if (!(t?.when && !t.when(i))) return typeof e == `function` ? e(i) : e;
  }),
    b(r, Ae, ({ state: i }) => i.metadata(n)()),
    b(r, Ce, () => Ae),
    te(r, (i) => {
      let s = i.value();
      if (s === null || Number.isNaN(s)) return;
      let o = i.state.metadata(n)();
      if (!(o === void 0 || Number.isNaN(o)) && s < o)
        return t?.error ? T(t.error, i) : ir(o, { message: T(t?.message, i) });
    }));
}
function Jr(r, e, t) {
  let n = b(r, g(), (i) => {
    if (!(t?.when && !t.when(i))) return e instanceof RegExp ? e : e(i);
  });
  (b(r, ke, ({ state: i }) => i.metadata(n)()),
    te(r, (i) => {
      if (Ct(i.value())) return;
      let s = i.state.metadata(n)();
      if (s !== void 0 && !s.test(i.value()))
        return t?.error ? T(t.error, i) : or(s, { message: T(t?.message, i) });
    }));
}
function en(r, e) {
  let t = b(r, g(), (n) => (e?.when ? e.when(n) : !0));
  (b(r, De, ({ state: n }) => n.metadata(t)()),
    te(r, (n) => {
      if (n.state.metadata(t)() && Ct(n.value()))
        return e?.error ? T(e.error, n) : nr({ message: T(e?.message, n) });
    }));
}
function ar(r, e, t) {
  let n = Oa({ source: r, computation: () => [], equal: m }),
    i = (o) => {
      let d = t(o);
      (n.set(St(d.error)), d.value !== void 0 && e(d.value), n.set(St(d.error)));
    },
    s = () => {
      n.set([]);
    };
  return { errors: n.asReadonly(), setRawValue: i, reset: s };
}
var Ke = class {
  field;
  constructor(e) {
    this.field = e;
  }
  control = this;
  get value() {
    return this.field().controlValue();
  }
  get valid() {
    return this.field().valid();
  }
  get invalid() {
    return this.field().invalid();
  }
  get pending() {
    return this.field().pending();
  }
  get disabled() {
    return this.field().disabled();
  }
  get enabled() {
    return !this.field().disabled();
  }
  get errors() {
    return Et(this.field().errors());
  }
  get pristine() {
    return !this.field().dirty();
  }
  get dirty() {
    return this.field().dirty();
  }
  get touched() {
    return this.field().touched();
  }
  get untouched() {
    return !this.field().touched();
  }
  get status() {
    if (this.field().disabled()) return `DISABLED`;
    if (this.field().valid()) return `VALID`;
    if (this.field().invalid()) return `INVALID`;
    if (this.field().pending()) return `PENDING`;
    throw new I$1(1910, !1);
  }
  valueAccessor = null;
  hasValidator(e) {
    return e === gm.required ? this.field().required() : !1;
  }
  updateValueAndValidity() {}
};
var je = {
  disabled: `disabled`,
  disabledReasons: `disabledReasons`,
  dirty: `dirty`,
  errors: `errors`,
  hidden: `hidden`,
  invalid: `invalid`,
  max: `max`,
  maxLength: `maxLength`,
  min: `min`,
  minLength: `minLength`,
  name: `name`,
  pattern: `pattern`,
  pending: `pending`,
  readonly: `readonly`,
  required: `required`,
  touched: `touched`,
};
var dr = (() => {
  let r = {};
  for (let e of Object.keys(je)) r[je[e]] = e;
  return r;
})();
function xe(r, e) {
  return r[dr[e]]?.();
}
var Be = Object.values(je);
function re() {
  return {};
}
function R(r, e, t) {
  return r[e] !== t ? ((r[e] = t), !0) : !1;
}
function ur(r, e, t) {
  let n;
  if (At(r) && t.isBadInput(r)) return { error: new ee() };
  switch (r.type) {
    case `checkbox`:
      return { value: r.checked };
    case `number`:
    case `range`:
    case `datetime-local`:
      if (((n = F$1(e)), typeof n == `number` || n === null))
        return { value: r.value === `` ? null : r.valueAsNumber };
      break;
    case `date`:
    case `month`:
    case `time`:
    case `week`:
      if (((n = F$1(e)), n === null || n instanceof Date)) return { value: r.valueAsDate };
      if (typeof n == `number`) return { value: r.valueAsNumber };
      break;
  }
  if (
    r.tagName === `INPUT` &&
    r.type === `text` &&
    ((n ??= F$1(e)), typeof n == `number` || n === null)
  ) {
    if (r.value === ``) return { value: null };
    let i = Number(r.value);
    return Number.isNaN(i) ? { error: new ee() } : { value: i };
  }
  return { value: r.value };
}
function Rt(r, e) {
  switch (r.type) {
    case `checkbox`:
      r.checked = e;
      return;
    case `radio`:
      r.checked = e === r.value;
      return;
    case `number`:
    case `range`:
    case `datetime-local`:
      if (typeof e == `number`) {
        Tt(r, e);
        return;
      } else if (e === null) {
        r.value = ``;
        return;
      }
      break;
    case `date`:
    case `month`:
    case `time`:
    case `week`:
      if (e === null || e instanceof Date) {
        r.valueAsDate = e;
        return;
      } else if (typeof e == `number`) {
        Tt(r, e);
        return;
      }
  }
  if (r.tagName === `INPUT` && r.type === `text`) {
    if (typeof e == `number`) {
      r.value = isNaN(e) ? `` : String(e);
      return;
    }
    if (e === null) {
      r.value = ``;
      return;
    }
  }
  r.value = e;
}
function Tt(r, e) {
  isNaN(e) ? (r.value = ``) : (r.valueAsNumber = e);
}
function At(r) {
  return r.tagName === `INPUT`;
}
function lr(r) {
  return (
    r.type === `date` ||
    r.type === `datetime-local` ||
    r.type === `month` ||
    r.type === `time` ||
    r.type === `week`
  );
}
function cr(r, e) {
  let t = r.getUTCFullYear(),
    n = String(r.getUTCMonth() + 1).padStart(2, `0`);
  if (e === `month`) return `${t}-${n}`;
  return `${t}-${n}-${String(r.getUTCDate()).padStart(2, `0`)}`;
}
function It(r, e, t) {
  return e instanceof Date && (r === `min` || r === `max`) && (t === `date` || t === `month`)
    ? cr(e, t)
    : e;
}
function hr(r, e) {
  (r.listenToCustomControlModel((n) => e.state().controlValue.set(n)),
    r.listenToCustomControlOutput(`touch`, () => e.state().markAsTouched()),
    e.registerAsBinding(r.customControl));
  let t = re();
  return () => {
    let n = e.state(),
      i = n.controlValue();
    R(t, `controlValue`, i) && r.setCustomControlModelInput(i);
    for (let s of Be) {
      let o;
      if (
        (s === `errors` ? (o = e.errors()) : (o = xe(n, s)),
        R(t, s, o) &&
          (r.setInputOnDirectives(s, o),
          e.elementAcceptsNativeProperty(s) && !r.customControlHasInput(s)))
      ) {
        let d = It(s, o, e.nativeFormElement.type);
        BF(e.renderer, e.nativeFormElement, s, d);
      }
    }
  };
}
function fr(r) {
  return typeof r == `object` && r !== null;
}
function mr(r, e) {
  let t = re();
  (e.controlValueAccessor.registerOnChange((i) => {
    ((t.controlValue = i), e.state().controlValue.set(i));
  }),
    e.controlValueAccessor.registerOnTouched(() => e.state().markAsTouched()));
  let n = e.injector.get(ZI, null, { optional: !0, self: !0 });
  if (n) {
    let i;
    for (let u of n)
      fr(u) &&
        u.registerOnValidatorChange &&
        ((i ??= H(0)),
        u.registerOnValidatorChange(() => {
          i.update((c) => c + 1);
        }));
    let s = n.map((u) => (typeof u == `function` ? u : u.validate.bind(u))),
      o = gm.compose(s),
      d = oe(() => {
        i?.();
        return wt(o ? o(e.interopNgControl.control) : null, e.interopNgControl.control);
      });
    e.parseErrorsSource.set(d);
  }
  return (
    e.registerAsBinding({
      reset: () => {
        let i = e.state().value();
        ((t.controlValue = i), F$1(() => e.controlValueAccessor.writeValue(i)));
      },
    }),
    () => {
      let i = e.state(),
        s = i.controlValue();
      R(t, `controlValue`, s) && F$1(() => e.controlValueAccessor.writeValue(s));
      for (let o of Be) {
        let d = xe(i, o);
        if (R(t, o, d)) {
          let u = r.setInputOnDirectives(o, d);
          o === `disabled` && e.controlValueAccessor.setDisabledState
            ? F$1(() => e.controlValueAccessor.setDisabledState(d))
            : !u && e.elementAcceptsNativeProperty(o) && BF(e.renderer, e.nativeFormElement, o, d);
        }
      }
    }
  );
}
function gr(r, e, t) {
  if (typeof MutationObserver != `function`) return;
  let n = new MutationObserver((i) => {
    i.some((s) => yr(s)) && e();
  });
  (n.observe(r, {
    attributes: !0,
    attributeFilter: [`value`],
    characterData: !0,
    childList: !0,
    subtree: !0,
  }),
    t.onDestroy(() => n.disconnect()));
}
function yr(r) {
  if (r.type === `childList` || r.type === `characterData`) {
    if (r.target instanceof Comment) return !1;
    for (let e of r.addedNodes) if (!(e instanceof Comment)) return !0;
    for (let e of r.removedNodes) if (!(e instanceof Comment)) return !0;
    return !1;
  }
  return r.type === `attributes` && r.target instanceof HTMLOptionElement;
}
function pr(r, e, t, n) {
  let i = !1,
    s = e.nativeFormElement,
    o = ar(
      () => e.state().value(),
      (u) => e.state().controlValue.set(u),
      (u) => ur(s, e.state().value, n),
    );
  (t.set(o.errors),
    (e.onReset = () => {
      o.reset();
      let u = e.state().value();
      ((d.controlValue = u), Rt(s, u));
    }),
    r.listenToDom(`input`, () => o.setRawValue(void 0)),
    r.listenToDom(`blur`, () => e.state().markAsTouched()),
    At(s) && lr(s) && n.watchValidity(e.destroyRef, s, () => o.setRawValue(void 0)),
    e.registerAsBinding(),
    s.tagName === `SELECT` &&
      gr(
        s,
        () => {
          i && (s.value = e.state().controlValue());
        },
        e.destroyRef,
      ));
  let d = re();
  return () => {
    let u = e.state();
    for (let M of Be) {
      let ie = xe(u, M);
      if (R(d, M, ie) && (r.setInputOnDirectives(M, ie), e.elementAcceptsNativeProperty(M))) {
        let kt = It(M, ie, s.type);
        BF(e.renderer, s, M, kt);
      }
    }
    let c = u.controlValue(),
      p = R(d, `controlValue`, c),
      ne = s.type === `radio` && R(d, `radioValue`, s.value);
    ((p || ne) && Rt(s, c), (i = !0));
  };
}
var Pt = (() => {
  class r {
    static ɵfac = function (n) {
      return new (n || r)();
    };
    static ɵprov = q$1({ token: r, factory: (t) => br.ɵfac(t), providedIn: `root` });
  }
  return r;
})();
var br = (() => {
  class r extends Pt {
    document = v$1(ie);
    cspNonce = v$1(ia, { optional: !0 });
    injectedStyles = new WeakMap();
    watchValidity(t, n, i) {
      let s = n.getRootNode();
      this.injectedStyles.has(s) || this.injectedStyles.set(s, this.createTransitionStyle(s));
      let o = (d) => {
        let u = d;
        (u.animationName === `ng-valid` || u.animationName === `ng-invalid`) && i();
      };
      (n.addEventListener(`animationstart`, o),
        t.onDestroy(() => {
          n.removeEventListener(`animationstart`, o);
        }));
    }
    isBadInput(t) {
      return t.validity?.badInput ?? !1;
    }
    createTransitionStyle(t) {
      let n = this.document.createElement(`style`);
      return (
        this.cspNonce && (n.nonce = this.cspNonce),
        (n.textContent = `
      @keyframes ng-valid {}
      @keyframes ng-invalid {}
      input:valid, textarea:valid {
        animation: ng-valid 0.001s;
      }
      input:invalid, textarea:invalid {
        animation: ng-invalid 0.001s;
      }
    `),
        t.nodeType === 9 ? t.head?.appendChild(n) : t.appendChild(n),
        n
      );
    }
    ngOnDestroy() {
      this.injectedStyles.get(this.document)?.remove();
    }
    static ɵfac = (() => {
      let t;
      return function (i) {
        return (t || (t = ya(r)))(i || r);
      };
    })();
    static ɵprov = q$1({ token: r, factory: r.ɵfac });
  }
  return r;
})();
var vr = Symbol();
var Dt = new E(``);
var tn = (() => {
  class r {
    field = tr$1.required({ alias: `formField` });
    state = oe(() => this.field()());
    renderer = v$1(An);
    destroyRef = v$1(J$1);
    injector = v$1(He);
    element = v$1(it).nativeElement;
    elementIsNativeFormElement = UF(this.element);
    elementAcceptsTextualValues = nQ(this.element);
    _elementAcceptsMinMax;
    nativeFormElement = this.elementIsNativeFormElement ? this.element : void 0;
    focuser = (t) => this.element.focus(t);
    controlValueAccessors = v$1(qI, { optional: !0, self: !0 });
    config = v$1(rr, { optional: !0 });
    validityMonitor = v$1(Pt);
    parseErrorsSource = H(void 0);
    _interopNgControl;
    get interopNgControl() {
      return (this._interopNgControl ??= new Ke(this.state));
    }
    parseErrors = oe(
      () =>
        this.parseErrorsSource()?.().map((t) =>
          m$1(l({}, t), { fieldTree: F$1(this.state).fieldTree, formField: this }),
        ) ?? [],
      { equal: m },
    );
    errors = oe(
      () =>
        this.state()
          .errors()
          .filter((t) => !t.formField || t.formField === this),
      { equal: m },
    );
    isFieldBinding = !1;
    resetter = () => {};
    parseErrorsResetCallback;
    setParseErrors(t) {
      this.parseErrorsSource.set(t);
    }
    set onReset(t) {
      this.parseErrorsResetCallback = t;
    }
    get onReset() {
      return this.parseErrorsResetCallback;
    }
    get controlValueAccessor() {
      return !this.controlValueAccessors || this.controlValueAccessors.length === 0
        ? (this.interopNgControl?.valueAccessor ?? void 0)
        : (e1(this.interopNgControl, this.controlValueAccessors) ?? void 0);
    }
    installClassBindingEffect() {
      let t = Object.entries(this.config?.classes ?? {}).map(([i, s]) => [i, oe(() => s(this))]);
      if (t.length === 0) return;
      let n = re();
      P9(
        {
          write: () => {
            for (let [i, s] of t) {
              let o = s();
              R(n, i, o) &&
                (o
                  ? this.renderer.addClass(this.element, i)
                  : this.renderer.removeClass(this.element, i));
            }
          },
        },
        { injector: this.injector },
      );
    }
    focus(t) {
      this.focuser(t);
    }
    reset() {
      (this.resetter(), this.parseErrorsResetCallback?.(this.state().value()));
    }
    registerAsBinding(t) {
      if (this.isFieldBinding) throw new I$1(1913, !1);
      ((this.isFieldBinding = !0),
        this.installClassBindingEffect(),
        t?.focus && (this.focuser = (n) => t.focus(n)),
        t?.reset && (this.resetter = () => t.reset()),
        Yt$1(
          (n) => {
            let i = this.state();
            (i.nodeState.formFieldBindings.update((s) => [...s, this]),
              n(() => {
                i.nodeState.formFieldBindings.update((s) => s.filter((o) => o !== this));
              }));
          },
          { injector: this.injector },
        ));
    }
    [vr];
    ɵngControlCreate(t) {
      if (!t.hasPassThrough)
        if (this.controlValueAccessor) this.ɵngControlUpdate = mr(t, this);
        else if (t.customControl) this.ɵngControlUpdate = hr(t, this);
        else if (this.elementIsNativeFormElement)
          this.ɵngControlUpdate = pr(t, this, this.parseErrorsSource, this.validityMonitor);
        else throw new I$1(1914, !1);
    }
    ɵngControlUpdate;
    elementAcceptsNativeProperty(t) {
      if (!this.elementIsNativeFormElement) return !1;
      switch (t) {
        case `min`:
        case `max`:
          return (this._elementAcceptsMinMax ??= tQ(this.element));
        case `minLength`:
        case `maxLength`:
          return this.elementAcceptsTextualValues;
        case `disabled`:
        case `required`:
        case `readonly`:
        case `name`:
          return !0;
        default:
          return !1;
      }
    }
    static ɵfac = function (n) {
      return new (n || r)();
    };
    static ɵdir = ot({
      type: r,
      selectors: [[``, `formField`, ``]],
      inputs: { field: [1, `formField`, `field`] },
      exportAs: [`formField`],
      features: [
        Na([
          { provide: Dt, useExisting: r },
          { provide: yc, useFactory: () => v$1(r).interopNgControl },
          { provide: GF, useFactory: () => v$1(Dt, { self: !0 }) },
        ]),
        Qp(`formField`),
      ],
    });
  }
  return r;
})();
export { Zr as a, Qt as i, Jt as n, en as o, Qr as r, tn as s, Jr as t };
