import {
  $r as px,
  $t as Y$1,
  At as Rs,
  Bn as eg,
  Cr as kx,
  Dt as Rl,
  E as FO,
  Ei as vA,
  Fi as vx,
  Kr as ot,
  Kt as Vi,
  L as Hy,
  Li as wR,
  Lr as mx,
  Oi as vQ,
  Pn as db,
  Qi as ye,
  Qn as gx,
  Qr as pl,
  Rt as Ta,
  Sr as kr,
  Ti as v,
  U as Ix,
  Ur as oe,
  Wi as xx,
  Wt as VE,
  Xt as Wo,
  an as ZE,
  b as EJ,
  bt as Px,
  di as sR,
  dt as Na,
  fi as sg,
  gn as aC,
  hr as jE,
  j as H,
  jt as Rx,
  l as Ax,
  m as By,
  na as yx,
  nn as Yt,
  nt as M1,
  oa as zX,
  or as hx,
  pn as _e,
  q as Jy,
  qn as ff,
  ri as qQ,
  rt as M9,
  sa as zo,
  ur as ie,
  vn as ag,
  vt as PI,
  x as ER,
  yi as tr,
  zi as x9,
  zn as e_,
} from './chunk-CD8PwEax.js';
import { c as R, i as It, l as V, p as bt } from './chunk-bRWS10C8.js';
import { M as ws, T as ei$1, k as sr } from './main-YU6HVKXZ.js';
import { a as h, i as g, n as N, r as W, t as Ft } from './chunk-BBNeZJmf.js';
var Oe = class t {
  link = tr.required();
  label = tr.required();
  static ɵfac = function (e) {
    return new (e || t)();
  };
  static ɵcmp = Vi({
    type: t,
    selectors: [[`app-back-link`]],
    inputs: { link: [1, `link`], label: [1, `label`] },
    decls: 3,
    vars: 2,
    consts: [
      [1, `back`, 3, `routerLink`],
      [`icon`, `@tui.chevron-left`, 1, `icon-sm`],
    ],
    template: function (e, n) {
      (e & 1 && (pl(0, `a`, 0), Rl(1, `tui-icon`, 1), sR(2), eg()),
        e & 2 && (VE(`routerLink`, n.link()), vA(2), ag(` `, n.label(), ` `)));
    },
    dependencies: [PI, EJ],
    styles: [
      `.back[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:.125rem;margin-inline-start:-.25rem;font-size:1.0625rem;font-weight:500;color:var(--%NS%tui-text-secondary);text-decoration:none;transition:color var(--%NS%tui-duration)}.back[_ngcontent-%COMP%]:hover{color:var(--%NS%tui-text-primary)}`,
    ],
  });
};
var De = /^[A-Za-z_][A-Za-z0-9_]*$/;
function q(t) {
  return Object.entries(t)
    .sort(([i], [e]) => i.localeCompare(e))
    .map(([i, e]) => `${i}=${e}`).join(`
`);
}
function Y(t) {
  let i = {},
    e = [],
    n = new Set();
  return (
    t.split(/\r?\n/).forEach((r, g) => {
      let p = r.trim().replace(/^export\s+/, ``);
      if (!p || p.startsWith(`#`)) return;
      let F = p.indexOf(`=`),
        V = `Line ${g + 1}`;
      if (F < 0) {
        e.push(`${V}: expected KEY=value.`);
        return;
      }
      let w = p.slice(0, F).trim(),
        Ae = p
          .slice(F + 1)
          .trim()
          .replace(/^(["'])([\s\S]*)\1$/, `$2`);
      if (!De.test(w)) {
        e.push(`${V}: "${w}" is not a valid variable name.`);
        return;
      }
      if (n.has(w)) {
        e.push(`${V}: "${w}" is set more than once.`);
        return;
      }
      (n.add(w), (i[w] = Ae));
    }),
    { env: i, errors: e }
  );
}
function ze(t, i) {
  if ((t & 1 && (pl(0, `li`), sR(1), eg()), t & 2)) {
    let e = i.$implicit;
    (vA(), aC(e));
  }
}
function Ie(t, i) {
  if (
    (t & 1 && (pl(0, `app-callout`, 7)(1, `ul`, 9), vx(2, ze, 2, 1, `li`, null, mx), eg()()), t & 2)
  ) {
    let e = Ax();
    (vA(2), yx(e.parsed().errors));
  }
}
function Re(t, i) {
  if ((t & 1 && (pl(0, `p`, 8), sR(1), eg()), t & 2)) {
    let e = Ax();
    (vA(), aC(e.summary()));
  }
}
var Z = class t {
  environment = tr.required();
  resetKey = tr(0);
  environmentChange = M9();
  errorsChange = M9();
  text = H(``);
  parsed = oe(() => Y(this.text()));
  summary = oe(() => {
    let i = Object.keys(this.parsed().env).length;
    return i === 1 ? `1 variable` : `${i} variables`;
  });
  touched = H(!1);
  previousResetKey = -1;
  constructor() {
    Yt(() => {
      let i = this.resetKey(),
        e = this.environment();
      i !== this.previousResetKey
        ? ((this.previousResetKey = i), this.touched.set(!1), this.text.set(q(e)))
        : this.touched() || this.text.set(q(e));
    });
  }
  updateText(i) {
    (this.touched.set(!0), this.text.set(i.target.value), this.emit());
  }
  importFile(i) {
    let e = i.target,
      n = e.files?.[0];
    ((e.value = ``),
      n &&
        _e(n.text()).subscribe((r) => {
          (this.touched.set(!0), this.text.set(r.trimEnd()), this.emit());
        }));
  }
  emit() {
    let { env: i, errors: e } = this.parsed();
    (this.errorsChange.emit(e), e.length || this.environmentChange.emit(i));
  }
  static ɵfac = function (e) {
    return new (e || t)();
  };
  static ɵcmp = Vi({
    type: t,
    selectors: [[`app-environment-editor`]],
    inputs: { environment: [1, `environment`], resetKey: [1, `resetKey`] },
    outputs: { environmentChange: `environmentChange`, errorsChange: `errorsChange` },
    decls: 10,
    vars: 3,
    consts: [
      [`file`, ``],
      [`aria-label`, `Environment variables editor`, 1, `grid`, `grid-cols-1`, `gap-2.5`],
      [1, `flex`, `flex-wrap`, `items-center`, `justify-end`, `gap-2`],
      [`tuiButton`, ``, `type`, `button`, `size`, `s`, `appearance`, `secondary`, 3, `click`],
      [`icon`, `@tui.file-up`, 1, `icon-sm`],
      [
        `type`,
        `file`,
        `accept`,
        `.env,.txt,text/plain`,
        `tabindex`,
        `-1`,
        `aria-hidden`,
        `true`,
        1,
        `sr-only`,
        3,
        `change`,
      ],
      [
        `rows`,
        `8`,
        `spellcheck`,
        `false`,
        `autocomplete`,
        `off`,
        `autocapitalize`,
        `off`,
        `aria-label`,
        `Environment variables in .env format`,
        `placeholder`,
        `DATABASE_URL=postgres://localhost:5432/app
LOG_LEVEL=debug`,
        1,
        `glass-field`,
        `env__input`,
        3,
        `input`,
        `value`,
      ],
      [`tone`, `negative`, `size`, `s`, `role`, `alert`],
      [1, `text-[0.8125rem]`, `tabular`, `text-tertiary`],
      [1, `m-0`, `grid`, `list-none`, `gap-0.5`, `p-0`],
    ],
    template: function (e, n) {
      if (e & 1) {
        let r = Ix();
        (pl(0, `section`, 1)(1, `div`, 2)(2, `button`, 3),
          zo(`click`, function () {
            By(r);
            return Hy(Px(6).click());
          }),
          Rl(3, `tui-icon`, 4),
          sR(4, ` Import .env `),
          eg(),
          pl(5, `input`, 5, 0),
          zo(`change`, function (p) {
            return n.importFile(p);
          }),
          eg()(),
          pl(7, `textarea`, 6),
          zo(`input`, function (p) {
            return n.updateText(p);
          }),
          eg(),
          hx(8, Ie, 4, 0, `app-callout`, 7)(9, Re, 2, 1, `p`, 8),
          eg());
      }
      e & 2 &&
        (vA(7),
        VE(`value`, n.text()),
        kr(`aria-invalid`, n.parsed().errors.length > 0),
        vA(),
        px(n.parsed().errors.length > 0 ? 8 : 9));
    },
    dependencies: [W, It, EJ],
    styles: [
      `.env__input[_ngcontent-%COMP%]{display:block;inline-size:100%;padding:.625rem .75rem;border:0;border-radius:var(--%NS%tui-radius-m);font-family:var(--%NS%app-font-mono);font-size:.8125rem;line-height:1.6;resize:vertical;white-space:pre;overflow-wrap:normal;overflow-x:auto}`,
    ],
  });
};
var Le = (t, i) => i.key;
function qe(t, i) {
  if (t & 1) {
    let e = Ix();
    (pl(0, `button`, 6),
      zo(`click`, function () {
        By(e);
        let r = Ax().$implicit;
        return Hy(Ax().toggleRevealed(r.key));
      }),
      Rl(1, `tui-icon`, 7),
      eg());
  }
  if (t & 2) {
    let e = Ax().$implicit,
      n = Ax();
    (kr(`aria-label`, (n.revealed().has(e.key) ? `Hide ` : `Reveal `) + e.key),
      vA(),
      VE(`icon`, n.revealed().has(e.key) ? `@tui.eye-off` : `@tui.eye`));
  }
}
function Fe(t, i) {
  if (t & 1) {
    let e = Ix();
    (pl(0, `div`, 0)(1, `button`, 2),
      zo(`click`, function () {
        let r = By(e).$implicit;
        return Hy(Ax().toggleExpanded(r.key));
      }),
      pl(2, `span`, 3),
      sR(3),
      eg(),
      pl(4, `span`, 4),
      sR(5),
      eg()(),
      hx(6, qe, 2, 2, `button`, 5),
      pl(7, `button`, 6),
      zo(`click`, function () {
        let r = By(e).$implicit;
        return Hy(Ax().copy(r));
      }),
      Rl(8, `tui-icon`, 7),
      eg()());
  }
  if (t & 2) {
    let e = i.$implicit,
      n = Ax();
    (vA(),
      kr(`aria-expanded`, n.expanded().has(e.key))(`aria-label`, `Expand ` + e.key),
      vA(2),
      aC(e.key),
      vA(),
      sg(`env-row__value--open`, n.expanded().has(e.key)),
      vA(),
      ag(` `, e.secret && !n.revealed().has(e.key) ? n.MASK : e.value, ` `),
      vA(),
      px(e.secret ? 6 : -1),
      vA(),
      kr(`aria-label`, `Copy ` + e.key),
      vA(),
      VE(`icon`, n.copiedKey() === e.key ? `@tui.check` : `@tui.copy`));
  }
}
function Ve(t, i) {
  t & 1 && (pl(0, `p`, 1), sR(1, `No variables set.`), eg());
}
var $e = new Set([
  `SECRET`,
  `SECRETS`,
  `TOKEN`,
  `PASSWORD`,
  `PASSWD`,
  `PASS`,
  `KEY`,
  `APIKEY`,
  `CREDENTIAL`,
  `CREDENTIALS`,
  `PRIVATE`,
]);
var Ke = 1600;
var je = `••••••••`;
var Q = class t {
  document = v(ie);
  environment = tr.required();
  copyFailed = M9();
  MASK = je;
  revealed = H(new Set());
  expanded = H(new Set());
  copiedKey = H(null);
  rows = oe(() =>
    Object.entries(this.environment())
      .sort(([i], [e]) => i.localeCompare(e))
      .map(([i, e]) => ({ key: i, value: e, secret: We(i) })),
  );
  toggleExpanded(i) {
    this.expanded.update((e) => Be(e, i));
  }
  toggleRevealed(i) {
    this.revealed.update((e) => Be(e, i));
  }
  copy(i) {
    Rs(() => _e(this.document.defaultView?.navigator.clipboard.writeText(i.value) ?? ye)).subscribe(
      {
        next: () => {
          (this.copiedKey.set(i.key),
            this.document.defaultView?.setTimeout(() => {
              this.copiedKey() === i.key && this.copiedKey.set(null);
            }, Ke));
        },
        error: () => this.copyFailed.emit(),
      },
    );
  }
  static ɵfac = function (e) {
    return new (e || t)();
  };
  static ɵcmp = Vi({
    type: t,
    selectors: [[`app-environment-list`]],
    inputs: { environment: [1, `environment`] },
    outputs: { copyFailed: `copyFailed` },
    decls: 3,
    vars: 1,
    consts: [
      [1, `env-row`],
      [1, `env-empty`],
      [`type`, `button`, 1, `env-row__main`, 3, `click`],
      [1, `env-row__key`],
      [1, `env-row__value`],
      [`tuiIconButton`, ``, `type`, `button`, `size`, `xs`, `appearance`, `flat-grayscale`],
      [
        `tuiIconButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `xs`,
        `appearance`,
        `flat-grayscale`,
        3,
        `click`,
      ],
      [1, `icon-sm`, 3, `icon`],
    ],
    template: function (e, n) {
      (e & 1 && vx(0, Fe, 9, 9, `div`, 0, Le, !1, Ve, 2, 0, `p`, 1), e & 2 && yx(n.rows()));
    },
    dependencies: [It, EJ],
    styles: [
      `.env-row[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.25rem;padding-block:.5625rem}.env-row[_ngcontent-%COMP%] + .env-row[_ngcontent-%COMP%]{border-block-start:1px solid var(--%NS%tui-border-normal)}.env-row__main[_ngcontent-%COMP%]{display:grid;flex:1;gap:.125rem;min-inline-size:0;margin:0;border:0;padding:0;background:none;font:inherit;color:inherit;text-align:start;cursor:pointer;-webkit-tap-highlight-color:transparent}.env-row__key[_ngcontent-%COMP%]{font-family:var(--%NS%app-font-mono);font-size:.8125rem;letter-spacing:.02em;color:var(--%NS%tui-text-tertiary);overflow-wrap:anywhere}.env-row__value[_ngcontent-%COMP%]{overflow:hidden;font-family:var(--%NS%app-font-mono);font-size:.9375rem;color:var(--%NS%tui-text-primary);text-overflow:ellipsis;white-space:nowrap}.env-row__value--open[_ngcontent-%COMP%]{white-space:normal;overflow-wrap:anywhere}.env-empty[_ngcontent-%COMP%]{margin:0;padding-block:1.5rem;font-size:.9375rem;color:var(--%NS%tui-text-tertiary);text-align:center}`,
    ],
  });
};
function We(t) {
  return t
    .toUpperCase()
    .split(`_`)
    .some((i) => $e.has(i));
}
function Be(t, i) {
  let e = new Set(t);
  return (e.has(i) ? e.delete(i) : e.add(i), e);
}
function Ue(t, i) {
  if ((t & 1 && jE(0, `span`), t & 2)) {
    let e = i.$index;
    Wo(`--%NS%t-step`, e);
  }
}
var He = [`side`];
var Ge = [[[``, `tuiSlot`, `start`]], `*`, [[``, `tuiSlot`, `end`]]];
var Ye = [`[tuiSlot='start']`, `*`, `[tuiSlot='end']`];
function Ze(t, i) {
  t & 1 && Rl(0, `tui-progressive-blur`);
}
var Qe = [`*`];
var Xe = [
  h,
  g,
  { provide: N, useValue: { characterData: !0, childList: !0, subtree: !0 } },
  bt((t = v(ws), i = v(sr)) => ({
    appearance: t && i === `ios` ? `` : `action`,
    size: t && i === `ios` ? `m` : `l`,
  })),
];
var Je = (() => {
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
        exportAs: [`tui-app-bar-button-5.19.0`],
        decls: 0,
        vars: 0,
        template: function (n, r) {},
        styles: [
          `[data-platform=ios].tui-liquid-glass [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]){border-radius:2.75rem;margin-inline:1rem;-webkit-backdrop-filter:blur(.25rem) saturate(6) brightness(1.05);backdrop-filter:blur(.25rem) saturate(6) brightness(1.05);box-shadow:0 .5rem 2rem #00000017;overflow:hidden;box-sizing:border-box;background:var(--%NS%t-appbar-button-bg);color:var(--%NS%tui-text-primary);transition:transform var(--%NS%tui-duration) var(--%NS%tui-curve-expressive-entrance),background-color calc(var(--%NS%tui-duration) / 2) ease,color calc(var(--%NS%tui-duration) / 2) ease,box-shadow calc(var(--%NS%tui-duration) / 2) ease,backdrop-filter calc(var(--%NS%tui-duration) / 2) ease;--%NS%t-appbar-button-bg: rgba(255, 255, 255, .7);--%NS%t-appbar-glow: var(--%NS%tui-background-base);--%NS%t-appbar-bevel: linear-gradient(319deg, #fff 4%, #fff 19%, rgba(255, 255, 255, .12) 40%, rgba(255, 255, 255, .02) 45%, rgba(255, 255, 255, 0) 48%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0) 52%, rgba(255, 255, 255, .02) 55%, rgba(255, 255, 255, .12) 60%, #fff 80%, #fff 96%)}@supports not (backdrop-filter: blur(1px)){[data-platform=ios].tui-liquid-glass [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]){background:var(--%NS%tui-background-elevation-1)}}[data-platform=ios].tui-liquid-glass [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]):before{content:"";position:absolute;inset:0;box-sizing:border-box;border-radius:inherit;box-shadow:inset 0 0 .75rem var(--%NS%t-appbar-glow)}[data-platform=ios].tui-liquid-glass [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]):after{content:"";position:absolute;inset:0;box-sizing:border-box;border-radius:inherit;pointer-events:none;padding:1px;-webkit-mask-image:linear-gradient(#000 0 0),linear-gradient(#000 0 0);mask-image:linear-gradient(#000 0 0),linear-gradient(#000 0 0);-webkit-mask-origin:content-box,border-box;mask-origin:content-box,border-box;mask-clip:content-box,border-box;background:var(--%NS%t-appbar-bevel);-webkit-mask-composite:xor;mask-composite:exclude}[data-platform=ios].tui-liquid-glass [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]):active{transform:scale(1.25);filter:brightness(3)}[data-platform=ios].tui-liquid-glass [tuiAppBarButton]:where(*[data-tui-version="5.19.0"])>[tuiIconButton]{margin:0}[data-platform=ios].tui-liquid-glass [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]).tui-enter{--%NS%tui-blur: 1rem;animation-name:tuiFade,tuiBlur}[data-platform=ios].tui-liquid-glass [tuiTheme=dark] [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]),[tuiTheme=dark] [data-platform=ios].tui-liquid-glass [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]),[data-platform=ios][tuiTheme=dark].tui-liquid-glass [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]){--%NS%t-appbar-button-bg: rgba(88, 88, 88, .31);--%NS%t-appbar-glow: var(--%NS%tui-appbar-background, rgba(31, 31, 31, .8));--%NS%t-appbar-bevel: linear-gradient(319deg, rgba(255, 255, 255, .2), rgba(255, 255, 255, .12) 19%, rgba(255, 255, 255, .04) 40%, rgba(255, 255, 255, .02) 45%, rgba(255, 255, 255, 0) 48%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0) 52%, rgba(255, 255, 255, .02) 55%, rgba(255, 255, 255, .04) 60%, rgba(255, 255, 255, .12) 80%, rgba(255, 255, 255, .2) 96%);-webkit-backdrop-filter:blur(.25rem) saturate(4);backdrop-filter:blur(.25rem) saturate(4)}[data-platform=ios].tui-liquid-glass [tuiTheme=dark] [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]):after,[tuiTheme=dark] [data-platform=ios].tui-liquid-glass [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]):after,[data-platform=ios][tuiTheme=dark].tui-liquid-glass [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]):after{filter:brightness(.6)}[data-platform=ios].tui-liquid-glass tui-app-bar[tuiTheme=dark] [tuiAppBarButton]:where(*[data-tui-version="5.19.0"]){--%NS%t-appbar-bevel: linear-gradient(319deg, #fff 4%, #fff 19%, rgba(255, 255, 255, .12) 40%, rgba(255, 255, 255, .02) 45%, rgba(255, 255, 255, 0) 48%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0) 52%, rgba(255, 255, 255, .02) 55%, rgba(255, 255, 255, .12) 60%, #fff 80%, #fff 96%)}
`,
        ],
        encapsulation: 2,
      });
    }
  }
  return t;
})();
var et = (() => {
  class t {
    constructor() {
      this.styles = db(Je);
    }
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        selectors: [[``, `tuiAppBarButton`, ``]],
        hostAttrs: [`data-tui-version`, `5.19.0`, `tuiAppBarButton`, ``],
        features: [Ta([ei$1])],
      });
    }
  }
  return t;
})();
var tt = (() => {
  class t {
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [[`tui-progressive-blur`]],
        decls: 2,
        vars: 0,
        consts: [[3, `--%NS%t-step`]],
        template: function (n, r) {
          (n & 1 && vx(0, Ue, 1, 2, `span`, 0, gx), n & 2 && yx(`-`.repeat(20)));
        },
        styles: [
          `[_nghost-%COMP%]{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity var(--%NS%tui-duration) linear}.tui-liquid-glass_blur   [_nghost-%COMP%]{display:block;opacity:1}[_nghost-%COMP%]:before{content:"";position:absolute;inset:0;transition:background-color var(--%NS%tui-duration) linear;background:var(--%NS%tui-appbar-background, var(--%NS%tui-background-base));-webkit-mask-image:linear-gradient(0deg,transparent 0%,rgba(0,0,0,.01) 7%,rgba(0,0,0,.04) 13%,rgba(0,0,0,.08) 20%,rgba(0,0,0,.15) 27%,rgba(0,0,0,.23) 33%,rgba(0,0,0,.33) 40%,rgba(0,0,0,.44) 47%,rgba(0,0,0,.56) 53%,rgba(0,0,0,.67) 60%,rgba(0,0,0,.77) 67%,rgba(0,0,0,.85) 73%,rgba(0,0,0,.92) 80%,rgba(0,0,0,.96) 87%,rgba(0,0,0,.99) 93%,#000 100%);mask-image:linear-gradient(0deg,transparent 0%,rgba(0,0,0,.01) 7%,rgba(0,0,0,.04) 13%,rgba(0,0,0,.08) 20%,rgba(0,0,0,.15) 27%,rgba(0,0,0,.23) 33%,rgba(0,0,0,.33) 40%,rgba(0,0,0,.44) 47%,rgba(0,0,0,.56) 53%,rgba(0,0,0,.67) 60%,rgba(0,0,0,.77) 67%,rgba(0,0,0,.85) 73%,rgba(0,0,0,.92) 80%,rgba(0,0,0,.96) 87%,rgba(0,0,0,.99) 93%,#000 100%)}span[_ngcontent-%COMP%]{position:absolute;z-index:calc(-1 * var(--%NS%t-step));inline-size:100%;inset-block-start:0;inset-inline-start:0;block-size:calc(12.5rem - .625rem * var(--%NS%t-step));-webkit-backdrop-filter:blur(calc(.00375rem * var(--%NS%t-step)));backdrop-filter:blur(calc(.00375rem * var(--%NS%t-step)))}`,
        ],
      });
    }
  }
  return t;
})();
var it = (() => {
  class t {
    constructor() {
      ((this.side = x9(`side`)),
        (this.el = qQ()),
        (this.liquidGlass = v(ws) && v(sr) === `ios`),
        (this.width$ = ff(v(h, { self: !0 }), v(g, { self: !0 })).pipe(
          M1(),
          Y$1(
            () =>
              2 *
              Math.max(
                this.side()[0]?.nativeElement.clientWidth ?? 0,
                this.side()[this.side().length - 1]?.nativeElement.clientWidth ?? 0,
              ),
          ),
        )),
        (this.size = tr(`m`)));
    }
    ngAfterViewInit() {
      this.el.closest(`tui-dialog`)?.classList.add(`tui-app-bar`);
    }
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [[`tui-app-bar`]],
        viewQuery: function (n, r) {
          (n & 1 && ZE(r.side, He, 5), n & 2 && kx());
        },
        hostAttrs: [`data-tui-version`, `5.19.0`],
        hostVars: 1,
        hostBindings: function (n, r) {
          n & 2 && kr(`data-size`, r.size());
        },
        inputs: { size: [1, `size`] },
        features: [Na(Xe)],
        ngContentSelectors: Ye,
        decls: 12,
        vars: 5,
        consts: [
          [`side`, ``],
          [`tuiAppBarButton`, ``],
          [`tuiFade`, ``, 1, `t-content`],
        ],
        template: function (n, r) {
          (n & 1 &&
            (xx(Ge),
            hx(0, Ze, 1, 0, `tui-progressive-blur`),
            pl(1, `div`, null, 0)(3, `div`, 1),
            Rx(4),
            eg()(),
            pl(5, `div`, 2),
            ER(6, `async`),
            Rx(7, 1),
            eg(),
            pl(8, `div`, null, 0)(10, `div`, 1),
            Rx(11, 2),
            eg()()),
            n & 2 &&
              (px(r.liquidGlass ? 0 : -1), vA(5), Wo(`--%NS%t-sides`, wR(6, 3, r.width$), `px`)));
        },
        dependencies: [FO, et, Ft, tt],
        styles: [
          `tui-app-bar:where(*[data-tui-version="5.19.0"]){position:relative;display:flex;block-size:2.75rem;align-items:center;justify-content:space-between;box-sizing:border-box;font:var(--%NS%tui-typography-body-m);font-weight:700;text-align:center;color:var(--%NS%tui-text-primary);background:var(--%NS%tui-background-base);background:color-mix(in hsl,var(--%NS%tui-background-base) 80%,transparent);-webkit-backdrop-filter:blur(2rem);backdrop-filter:blur(2rem)}tui-app-bar:where(*[data-tui-version="5.19.0"])>.t-content{left:50%;transform:translate(-50%);position:absolute;display:flex;block-size:100%;max-inline-size:calc(100% - var(--%NS%t-sides, 0px));inline-size:calc(100% - var(--%NS%t-sides, 0px));flex-direction:column;justify-content:center;flex:1;padding:0 .375rem;box-sizing:border-box;text-align:inherit;white-space:nowrap}tui-app-bar:where(*[data-tui-version="5.19.0"])>.t-content progress{margin:auto}tui-app-bar:where(*[data-tui-version="5.19.0"])>:last-child [tuiIconButton]{margin:0 -.375rem}tui-app-bar:where(*[data-tui-version="5.19.0"])>:last-child [tuiIconButton]:last-child{margin-inline-end:0}tui-app-bar:where(*[data-tui-version="5.19.0"])>:last-child [tuiIconButton]:only-child{margin:0}tui-app-bar:where(*[data-tui-version="5.19.0"]) [tuiButton][data-size=l]{font:var(--%NS%tui-typography-body-l);margin:0 -.25rem}tui-app-bar:where(*[data-tui-version="5.19.0"]) [tuiTitle]{text-align:inherit;font:inherit}tui-app-bar:where(*[data-tui-version="5.19.0"]) [tuiSubtitle]{color:var(--%NS%tui-text-secondary)}tui-app-bar:where(*[data-tui-version="5.19.0"])[data-size=m] [tuiTitle]{line-height:1.2em;gap:0}tui-app-bar:where(*[data-tui-version="5.19.0"])[data-size=l]{block-size:4rem}tui-app-bar:where(*[data-tui-version="5.19.0"])[data-size=l]>:first-child,tui-app-bar:where(*[data-tui-version="5.19.0"])[data-size=l]>:last-child{margin:0 -1em}tui-app-bar:where(*[data-tui-version="5.19.0"])[data-size=l] [tuiAppBarBack]{font:var(--%NS%tui-typography-body-l)}tui-app-bar:where(*[data-tui-version="5.19.0"]) [tuiProgressBar]{inline-size:8.75rem}tui-dialog tui-app-bar[data-size=l]:where(*[data-tui-version="5.19.0"]){margin:-3rem 0 2rem}tui-dialog tui-app-bar[data-size=m]:where(*[data-tui-version="5.19.0"]){margin:-1rem -1rem .75rem}tui-sheet-dialog tui-app-bar:where(*[data-tui-version="5.19.0"]){margin:-.75rem -1rem;block-size:3.5rem;background:none;-webkit-backdrop-filter:none;backdrop-filter:none}
`,
        ],
        encapsulation: 2,
      });
    }
  }
  return t;
})();
var Jt = (() => {
  class t {
    constructor() {
      this.tuiSlot = tr(`start`);
    }
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵdir = ot({
        type: t,
        selectors: [[``, `tuiSlot`, ``]],
        inputs: { tuiSlot: [1, `tuiSlot`] },
      });
    }
  }
  return t;
})();
var ei = (() => {
  class t {
    constructor() {
      ((this.icons = v(zX)), (this.appearance = v(ws) && v(sr) === `ios` ? `` : `action`));
    }
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: t,
        selectors: [
          [`button`, `tuiAppBarBack`, ``],
          [`a`, `tuiAppBarBack`, ``],
        ],
        features: [Na([R(t)]), Ta([V])],
        ngContentSelectors: Qe,
        decls: 6,
        vars: 1,
        consts: [
          [
            `height`,
            `24`,
            `viewBox`,
            `0 0 24 24`,
            `width`,
            `24`,
            `xmlns`,
            `http://www.w3.org/2000/svg`,
            1,
            `t-ios`,
          ],
          [
            `d`,
            `M7.44025 12L14.9826 4.43872C15.5391 3.88083 15.5391 2.97631 14.9826 2.41842C14.4261 1.86053 13.5239 1.86053 12.9674 2.41842L4.41737 10.9898C3.86088 11.5477 3.86088 12.4523 4.41737 13.0102L12.9674 21.5816C13.5239 22.1395 14.4261 22.1395 14.9826 21.5816C15.5391 21.0237 15.5391 20.1192 14.9826 19.5613L7.44025 12Z`,
            `fill`,
            `currentColor`,
          ],
          [
            `height`,
            `24`,
            `viewBox`,
            `0 0 24 24`,
            `width`,
            `24`,
            `xmlns`,
            `http://www.w3.org/2000/svg`,
            1,
            `t-android`,
          ],
          [
            `d`,
            `M19.6999 11.5899C19.6999 11.0377 19.2522 10.5899 18.6999 10.5899H7.49992L12.3999 5.68995C12.7865 5.30335 12.7865 4.67655 12.3999 4.28995V4.28995C12.0133 3.90335 11.3865 3.90335 10.9999 4.28995L4.40703 10.8828C4.0165 11.2734 4.01651 11.9065 4.40703 12.2971L10.9999 18.89C11.3865 19.2765 12.0133 19.2765 12.3999 18.8899V18.8899C12.7865 18.5034 12.7865 17.8765 12.3999 17.49L7.49992 12.5899H18.6999C19.2522 12.5899 19.6999 12.1422 19.6999 11.5899V11.5899Z`,
            `fill`,
            `currentColor`,
          ],
          [1, `t-web`, 3, `icon`],
        ],
        template: function (n, r) {
          (n & 1 &&
            (xx(),
            Jy(),
            pl(0, `svg`, 0),
            Rl(1, `path`, 1),
            eg(),
            pl(2, `svg`, 2),
            Rl(3, `path`, 3),
            eg(),
            e_(),
            Rl(4, `tui-icon`, 4),
            Rx(5)),
            n & 2 && (vA(4), VE(`icon`, r.icons.decrement)));
        },
        dependencies: [EJ],
        styles: [
          `[_nghost-%COMP%]{-webkit-appearance:none;appearance:none;padding:0;border:0;background:none;font:inherit;line-height:inherit;text-decoration:none;display:flex;align-items:center;padding:0 1rem 0 0;cursor:pointer}[_nghost-%COMP%]   [data-platform="web"][_ngcontent-%COMP%]   tui-dialog[_nghost-%COMP%], [data-platform="web"]   tui-dialog   [_nghost-%COMP%]{padding:0 .5rem}[_nghost-%COMP%]   [data-platform="android"][_nghost-%COMP%], [data-platform="android"]   [_nghost-%COMP%]{font-size:0;padding:0 1rem}[_nghost-%COMP%]   [data-platform="android"][_nghost-%COMP%]   .t-android[_ngcontent-%COMP%], [data-platform="android"]   [_nghost-%COMP%]   .t-android[_ngcontent-%COMP%]{display:block}[_nghost-%COMP%]   [data-platform="android"][_nghost-%COMP%]   .t-web[_ngcontent-%COMP%], [data-platform="android"]   [_nghost-%COMP%]   .t-web[_ngcontent-%COMP%]{display:none}[_nghost-%COMP%]   [data-platform="ios"][_nghost-%COMP%]   .t-ios[_ngcontent-%COMP%], [data-platform="ios"]   [_nghost-%COMP%]   .t-ios[_ngcontent-%COMP%]{display:block;margin-inline-start:.5rem}[_nghost-%COMP%]   [data-platform="ios"][_nghost-%COMP%]   .t-web[_ngcontent-%COMP%], [data-platform="ios"]   [_nghost-%COMP%]   .t-web[_ngcontent-%COMP%]{display:none}[data-platform="ios"].tui-liquid-glass[data-platform="ios"][_nghost-%COMP%], [data-platform="ios"].tui-liquid-glass[data-platform="ios"]   [_nghost-%COMP%], [data-platform="ios"].tui-liquid-glass   [data-platform="ios"][_nghost-%COMP%], [data-platform="ios"].tui-liquid-glass   [data-platform="ios"]   [_nghost-%COMP%], [data-platform="ios"]   [data-platform="ios"].tui-liquid-glass[_nghost-%COMP%], [data-platform="ios"]   [data-platform="ios"].tui-liquid-glass   [_nghost-%COMP%]{display:flex;font-size:0;block-size:2.75rem;inline-size:2.75rem;padding:0;justify-content:center}[data-platform="ios"].tui-liquid-glass[data-platform="ios"][_nghost-%COMP%]   .t-ios[_ngcontent-%COMP%], [data-platform="ios"].tui-liquid-glass[data-platform="ios"]   [_nghost-%COMP%]   .t-ios[_ngcontent-%COMP%], [data-platform="ios"].tui-liquid-glass   [data-platform="ios"][_nghost-%COMP%]   .t-ios[_ngcontent-%COMP%], [data-platform="ios"].tui-liquid-glass   [data-platform="ios"]   [_nghost-%COMP%]   .t-ios[_ngcontent-%COMP%], [data-platform="ios"]   [data-platform="ios"].tui-liquid-glass[_nghost-%COMP%]   .t-ios[_ngcontent-%COMP%], [data-platform="ios"]   [data-platform="ios"].tui-liquid-glass   [_nghost-%COMP%]   .t-ios[_ngcontent-%COMP%]{margin-inline-start:0}.t-web[_ngcontent-%COMP%]{transform:scaleX(var(--%NS%tui-inline))}.t-android[_ngcontent-%COMP%], .t-ios[_ngcontent-%COMP%]{display:none}`,
        ],
      });
    }
  }
  return t;
})();
var ti = (() => {
  class t {
    constructor() {
      ((this.platform = v(sr)),
        (this.size = vQ(
          it,
          `size`,
          oe(() => (this.platform === `web` ? `l` : `m`)),
        )));
    }
    static {
      this.ɵfac = function (n) {
        return new (n || t)();
      };
    }
    static {
      this.ɵdir = ot({ type: t, selectors: [[`tui-app-bar`, `tuiAppBarSize`, ``]] });
    }
  }
  return t;
})();
export { ei as a, Z as i, Oe as n, it as o, Q as r, ti as s, Jt as t };
