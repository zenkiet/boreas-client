import {
  $t as Y,
  Br as nr,
  C as F$1,
  Ci as ue,
  Kn as fc,
  Kr as ot,
  Or as lX,
  Ti as v,
  Ur as oe,
  Vn as et,
  Xi as yc,
  ai as qe,
  bi as tt,
  ca as zv,
  j as H,
  mn as _r,
  nr as hT,
  qn as ff,
  sr as i1,
  yi as tr,
} from './chunk-CD8PwEax.js';
import { D as or } from './main-YU6HVKXZ.js';
var d = class {};
var L = { fromControlValue: tt, toControlValue: tt };
var b = { self: !0, optional: !0 };
var R = (() => {
  class i {
    constructor() {
      ((this.fallback = v(or, b)),
        (this.refresh$ = new ue()),
        (this.internal = H(this.fallback)),
        (this.control = v(yc, { self: !0 })),
        (this.cdr = v(nr)),
        (this.transformer = v(d, b) ?? L),
        (this.value = oe(() => this.internal() ?? this.fallback)),
        (this.readOnly = tr(!1)),
        (this.pseudoInvalid = tr(void 0, { alias: `invalid` })),
        (this.touched = H(!1)),
        (this.status = H(void 0)),
        (this.disabled = oe(() => this.status() === `DISABLED`)),
        (this.interactive = oe(() => !this.disabled() && !this.readOnly())),
        (this.invalid = oe(() => {
          let t = this.pseudoInvalid();
          return t == null
            ? this.interactive() && this.touched() && this.status() === `INVALID`
            : t && this.interactive();
        })),
        (this.mode = oe(() =>
          this.readOnly() ? `readonly` : this.invalid() ? `invalid` : `valid`,
        )),
        (this.onTouched = lX),
        (this.onChange = lX),
        (this.control.valueAccessor = this),
        this.refresh$
          .pipe(
            hT(0),
            _r(null),
            Y(() => this.control.control),
            et(Boolean),
            zv(),
            qe((t) => ff(t.valueChanges, t.statusChanges, t.events).pipe(_r(null))),
            fc(),
          )
          .subscribe(() => this.update()));
    }
    registerOnChange(t) {
      (this.refresh$.next(),
        (this.onChange = (e) => {
          e !== F$1(this.internal) &&
            (t(this.transformer.toControlValue(e)), this.internal.set(e), this.update());
        }));
    }
    registerOnTouched(t) {
      this.onTouched = () => {
        (t(), this.update());
      };
    }
    setDisabledState() {
      this.update();
    }
    writeValue(t) {
      let e = this.control instanceof i1 ? this.control.model : t;
      (this.internal.set(this.transformer.fromControlValue(e)), this.update());
    }
    update() {
      (this.status.set(this.control.control?.status),
        this.touched.set(!!this.control.control?.touched),
        this.cdr.markForCheck());
    }
    static {
      this.ɵfac = function (e) {
        return new (e || i)();
      };
    }
    static {
      this.ɵdir = ot({
        type: i,
        inputs: { readOnly: [1, `readOnly`], pseudoInvalid: [1, `invalid`, `pseudoInvalid`] },
      });
    }
  }
  return i;
})();
var F = class {
  constructor(T, t = {}) {
    ((this.message = T), (this.context = t));
  }
};
export { R as n, F as t };
