import {
  $r as px,
  At as Rs,
  Bn as eg,
  Dt as Rl,
  Ei as vA,
  Hr as oN,
  Ir as mo,
  Kt as Vi,
  Qr as pl,
  Ti as v,
  Ur as oe,
  Wt as VE,
  _n as aN,
  ar as hs,
  b as EJ,
  di as sR,
  dt as Na,
  ea as yr,
  ei as q,
  gn as aC,
  j as H,
  or as hx,
  ra as z,
  rt as M9,
  sa as zo,
  vt as PI,
  yi as tr,
} from './chunk-CD8PwEax.js';
import { i as It } from './chunk-bRWS10C8.js';
import { b as Yn } from './main-YU6HVKXZ.js';
import './chunk-Cxjo7Efo.js';
import './chunk-C4cee0NY.js';
import { a as Ut, t as Bt, u as no } from './chunk-PFRT3jyP.js';
import { a as Zr, i as Qt, n as Jt, o as en, r as Qr, s as tn, t as Jr } from './chunk-BUsGNQJo.js';
import { t as b$1 } from './chunk-xBD-xwVE.js';
import { t as v$1 } from './chunk-thr6BV2C.js';
import { r as W } from './chunk-BBNeZJmf.js';
import { t as it } from './chunk-WGNEVt_R.js';
import { t as u } from './chunk-nkCGMQ89.js';
import { a as ei, i as Z, n as Oe, o as it$1, s as ti, t as Jt$1 } from './chunk-CUkRMx85.js';
var g = class r {
  api = v(Bt);
  creatingState = H(!1);
  errorState = H(void 0);
  creating = this.creatingState.asReadonly();
  error = this.errorState.asReadonly();
  create(e) {
    return Rs(() =>
      this.creatingState()
        ? z(void 0)
        : (this.creatingState.set(!0),
          this.errorState.set(void 0),
          this.api.create(e).pipe(
            yr((i) => (this.errorState.set(no(i).message), z(void 0))),
            mo(() => this.creatingState.set(!1)),
          )),
    );
  }
  static ɵfac = function (i) {
    return new (i || r)();
  };
  static ɵprov = q({ token: r, factory: r.ɵfac });
};
function se(r, e) {
  (r & 1 && (pl(0, `app-callout`, 1), sR(1), eg()), r & 2 && (vA(), aC(e)));
}
function pe(r, e) {
  (r & 1 && Rl(0, `tui-error`, 6), r & 2 && VE(`error`, e));
}
function le(r, e) {
  (r & 1 && Rl(0, `tui-error`, 6), r & 2 && VE(`error`, e));
}
function ue(r, e) {
  (r & 1 && (pl(0, `div`, 11), Rl(1, `tui-error`, 6), eg()), r & 2 && (vA(), VE(`error`, e)));
}
function ce(r, e) {
  (r & 1 && (Rl(0, `tui-loader`, 18), sR(1, ` Creating `)), r & 2 && VE(`inheritColor`, !0));
}
function fe(r, e) {
  r & 1 && (Rl(0, `tui-icon`, 19), sR(1, ` Create task `));
}
var ge = /^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/;
var ve = 0;
var b = class r {
  uid = `task-form-${(ve += 1)}`;
  creating = tr(!1);
  error = tr(void 0);
  formId = tr(this.uid);
  submitted = M9();
  model = H({ id: ``, image: ``, port: 80 });
  draft = Qt(this.model, (e) => {
    (en(e.id, { message: `Task ID is required.` }),
      Jr(e.id, ge, { message: `Use 1–63 letters, numbers, dots, underscores or hyphens.` }),
      en(e.image, { message: `Docker image is required.` }),
      Qr(e.port, 1, { message: `Internal port must be between 1 and 65535.` }),
      Zr(e.port, 65535, { message: `Internal port must be between 1 and 65535.` }));
  });
  environment = H({});
  environmentErrors = H([]);
  ids = { id: `${this.uid}-id`, image: `${this.uid}-image`, port: `${this.uid}-port` };
  idError = oe(() => this.firstError(this.draft.id()));
  imageError = oe(() => this.firstError(this.draft.image()));
  portError = oe(() => this.firstError(this.draft.port()));
  onSubmit(e) {
    (e.preventDefault(),
      !(this.environmentErrors().length > 0 || this.creating()) &&
        Jt(this.draft, async () => {
          let i = this.model(),
            t = this.environment();
          this.submitted.emit({
            id: i.id.trim(),
            image: i.image.trim(),
            port: i.port,
            environment: t,
          });
        }));
  }
  firstError(e) {
    return e.touched() ? (e.errors()[0]?.message ?? null) : null;
  }
  static ɵfac = function (i) {
    return new (i || r)();
  };
  static ɵcmp = Vi({
    type: r,
    selectors: [[`app-task-form`]],
    inputs: { creating: [1, `creating`], error: [1, `error`], formId: [1, `formId`] },
    outputs: { submitted: `submitted` },
    decls: 31,
    vars: 17,
    consts: [
      [`novalidate`, ``, 1, `grid`, `grid-cols-1`, `gap-3.5`, 3, `submit`, `id`],
      [`tone`, `negative`, `role`, `alert`],
      [`label`, `Container`],
      [1, `frow`, `row-divider`, `relative`],
      [1, `frow__label`, 3, `for`],
      [
        `autocomplete`,
        `off`,
        `autocapitalize`,
        `off`,
        `spellcheck`,
        `false`,
        `placeholder`,
        `api-preview`,
        1,
        `frow__input`,
        3,
        `id`,
        `formField`,
      ],
      [3, `error`],
      [
        `autocomplete`,
        `off`,
        `autocapitalize`,
        `off`,
        `spellcheck`,
        `false`,
        `placeholder`,
        `nginx:alpine`,
        1,
        `frow__input`,
        3,
        `id`,
        `formField`,
      ],
      [1, `frow`, `frow--inline`, `row-divider`, `relative`],
      [1, `frow__inline-label`, 3, `for`],
      [
        `type`,
        `number`,
        `inputmode`,
        `numeric`,
        1,
        `frow__input`,
        `frow__input--end`,
        3,
        `id`,
        `formField`,
      ],
      [1, `frow__trailing-error`],
      [1, `form__footnote`],
      [`label`, `Environment variables`],
      [1, `form__pad`],
      [3, `environmentChange`, `errorsChange`, `environment`],
      [1, `hidden`, `md:flex`, `md:justify-end`],
      [`tuiButton`, ``, `type`, `submit`, `size`, `m`, `appearance`, `primary`, 3, `disabled`],
      [`size`, `s`, 3, `inheritColor`],
      [`icon`, `@tui.plus`, 1, `icon-sm`],
    ],
    template: function (i, t) {
      if (
        (i & 1 &&
          (pl(0, `form`, 0),
          zo(`submit`, function (p) {
            return t.onSubmit(p);
          }),
          hx(1, se, 2, 1, `app-callout`, 1),
          pl(2, `div`)(3, `app-inset-group`, 2)(4, `div`, 3)(5, `label`, 4),
          sR(6, `Task ID`),
          eg(),
          Rl(7, `input`, 5),
          oN(),
          hx(8, pe, 1, 1, `tui-error`, 6),
          eg(),
          pl(9, `div`, 3)(10, `label`, 4),
          sR(11, `Docker image`),
          eg(),
          Rl(12, `input`, 7),
          oN(),
          hx(13, le, 1, 1, `tui-error`, 6),
          eg(),
          pl(14, `div`, 8)(15, `label`, 9),
          sR(16, `Internal port`),
          eg(),
          Rl(17, `input`, 10),
          oN(),
          eg(),
          hx(18, ue, 2, 1, `div`, 11),
          eg(),
          pl(19, `p`, 12),
          sR(
            20,
            ` The ID becomes part of the proxy URL and has to stay unique. The image is any reference Docker can pull; the port is what the process listens on inside the container. `,
          ),
          eg()(),
          pl(21, `div`)(22, `app-inset-group`, 13)(23, `div`, 14)(24, `app-environment-editor`, 15),
          zo(`environmentChange`, function (p) {
            return t.environment.set(p);
          })(`errorsChange`, function (p) {
            return t.environmentErrors.set(p);
          }),
          eg()()(),
          pl(25, `p`, 12),
          sR(26, `Optional. Values replace the whole map when applied.`),
          eg()(),
          pl(27, `div`, 16)(28, `button`, 17),
          hx(29, ce, 2, 1)(30, fe, 2, 0),
          eg()()()),
        i & 2)
      ) {
        let u, p, w, D;
        (VE(`id`, t.formId()),
          vA(),
          px((u = t.error()) ? 1 : -1, u),
          vA(4),
          VE(`for`, t.ids.id),
          vA(2),
          VE(`id`, t.ids.id)(`formField`, t.draft.id),
          aN(),
          vA(),
          px((p = t.idError()) ? 8 : -1, p),
          vA(2),
          VE(`for`, t.ids.image),
          vA(2),
          VE(`id`, t.ids.image)(`formField`, t.draft.image),
          aN(),
          vA(),
          px((w = t.imageError()) ? 13 : -1, w),
          vA(2),
          VE(`for`, t.ids.port),
          vA(2),
          VE(`id`, t.ids.port)(`formField`, t.draft.port),
          aN(),
          vA(),
          px((D = t.portError()) ? 18 : -1, D),
          vA(6),
          VE(`environment`, t.environment()),
          vA(4),
          VE(`disabled`, t.creating() || t.environmentErrors().length > 0),
          vA(),
          px(t.creating() ? 29 : 30));
      }
    },
    dependencies: [W, Z, tn, b$1, It, it, EJ, Yn],
    styles: [
      `.frow[_ngcontent-%COMP%]{display:grid;gap:.125rem;padding:.625rem 1rem;transition:background-color var(--%NS%tui-duration)}.frow[_ngcontent-%COMP%]:focus-within{background:var(--%NS%tui-background-neutral-1)}.frow--inline[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem;min-block-size:3rem}.frow__label[_ngcontent-%COMP%]{font-size:.8125rem;color:var(--%NS%tui-text-tertiary)}.frow__inline-label[_ngcontent-%COMP%]{flex:1;font-size:1.0625rem;color:var(--%NS%tui-text-primary)}.frow__input[_ngcontent-%COMP%]{inline-size:100%;margin:0;border:0;padding:0;background:none;font-family:var(--%NS%app-font-mono);font-size:1.0625rem;color:var(--%NS%tui-text-primary)}.frow__input[_ngcontent-%COMP%]:focus{outline:none}.frow__input[_ngcontent-%COMP%]::placeholder{color:var(--%NS%tui-text-tertiary);opacity:.6}.frow__input--end[_ngcontent-%COMP%]{inline-size:7ch;flex:none;text-align:end;font-variant-numeric:tabular-nums}.frow__input[type=number][_ngcontent-%COMP%]::-webkit-inner-spin-button, .frow__input[type=number][_ngcontent-%COMP%]::-webkit-outer-spin-button{appearance:none;margin:0}.frow__input[type=number][_ngcontent-%COMP%]{-moz-appearance:textfield;appearance:textfield}.frow__trailing-error[_ngcontent-%COMP%]{padding:0 1rem .625rem}.form__footnote[_ngcontent-%COMP%]{margin:0;padding:.5rem 1rem 0;font-size:.8125rem;line-height:1.5;color:var(--%NS%tui-text-tertiary)}.form__pad[_ngcontent-%COMP%]{padding:.875rem 1rem}`,
    ],
  });
};
var de = class r {
  create = v(g);
  router = v(hs);
  createTask(e) {
    this.create.create(e).subscribe((i) => {
      i && this.router.navigate([`/tasks`, i.id]);
    });
  }
  static ɵfac = function (i) {
    return new (i || r)();
  };
  static ɵcmp = Vi({
    type: r,
    selectors: [[`app-task-create-page`]],
    features: [Na([g])],
    decls: 11,
    vars: 3,
    consts: [
      [
        `appReveal`,
        ``,
        1,
        `mx-auto`,
        `grid`,
        `max-w-[56rem]`,
        `grid-cols-1`,
        `gap-3.5`,
        `md:gap-4`,
      ],
      [
        1,
        `scroll-edge`,
        `sticky`,
        `top-0`,
        `z-10`,
        `-mx-4`,
        `-mt-[max(1rem,env(safe-area-inset-top))]`,
        `pt-[env(safe-area-inset-top)]`,
        `md:hidden`,
      ],
      [`tuiAppBarSize`, ``],
      [
        `tuiSlot`,
        `start`,
        `tuiAppBarBack`,
        ``,
        `routerLink`,
        `/dashboard`,
        `aria-label`,
        `Back to tasks`,
      ],
      [
        `tuiSlot`,
        `end`,
        `appGlassIconButton`,
        ``,
        `icon`,
        `@tui.check`,
        `type`,
        `submit`,
        `form`,
        `create-task-form`,
        `aria-label`,
        `Create task`,
        3,
        `disabled`,
      ],
      [1, `hidden`, `md:block`],
      [`link`, `/dashboard`, `label`, `Tasks`],
      [1, `mt-1.5`],
      [
        `title`,
        `New task environment`,
        `description`,
        `Boreas assigns the proxy route once the container is ready.`,
      ],
      [`formId`, `create-task-form`, 3, `submitted`, `creating`, `error`],
    ],
    template: function (i, t) {
      (i & 1 &&
        (pl(0, `div`, 0)(1, `div`, 1)(2, `tui-app-bar`, 2),
        Rl(3, `a`, 3),
        sR(4, ` New task `),
        Rl(5, `button`, 4),
        eg()(),
        pl(6, `div`, 5),
        Rl(7, `app-back-link`, 6),
        pl(8, `div`, 7),
        Rl(9, `app-page-header`, 8),
        eg()(),
        pl(10, `app-task-form`, 9),
        zo(`submitted`, function (p) {
          return t.createTask(p);
        }),
        eg()()),
        i & 2 &&
          (vA(5),
          VE(`disabled`, t.create.creating()),
          vA(5),
          VE(`creating`, t.create.creating())(`error`, t.create.error())));
    },
    dependencies: [Oe, Ut, u, v$1, PI, b, it$1, Jt$1, ei, ti],
    encapsulation: 2,
  });
};
export { de as TaskCreatePage };
