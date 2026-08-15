import {
  $r as px,
  Bn as eg,
  Cr as kx,
  Dt as Rl,
  Ei as vA,
  Fi as vx,
  Hr as oN,
  Kt as Vi,
  L as Hy,
  Lr as mx,
  On as dC,
  Qr as pl,
  Sr as kr,
  Ti as v,
  Tr as lC,
  U as Ix,
  Ur as oe,
  Wt as VE,
  _n as aN,
  a as A9,
  an as ZE,
  ar as hs,
  b as EJ,
  ct as N9,
  di as sR,
  dt as Na,
  ei as q,
  gn as aC,
  j as H,
  jn as dR,
  ki as vR,
  l as Ax,
  lt as NM,
  m as By,
  na as yx,
  or as hx,
  rt as M9,
  sa as zo,
  vn as ag,
  yi as tr,
} from './chunk-CD8PwEax.js';
import { i as It } from './chunk-bRWS10C8.js';
import { i as j } from './main-YU6HVKXZ.js';
import './chunk-Cxjo7Efo.js';
import './chunk-C4cee0NY.js';
import { n as Qi, t as Nt } from './chunk-CXFBjKgF.js';
import './chunk-PFRT3jyP.js';
import { i as j$1 } from './chunk-COdxrnu4.js';
import { t as y } from './chunk-BQF1IQ6o.js';
import { i as Qt, s as tn } from './chunk-BUsGNQJo.js';
import { t as b$1 } from './chunk-xBD-xwVE.js';
import { t as v$1 } from './chunk-thr6BV2C.js';
var h = class r {
  query = H(``);
  filter(t) {
    let e = this.query().trim().toLowerCase();
    return e
      ? t.filter((n) => n.id.toLowerCase().includes(e) || n.image.toLowerCase().includes(e))
      : t;
  }
  static ɵfac = function (e) {
    return new (e || r)();
  };
  static ɵprov = q({ token: r, factory: r.ɵfac });
};
var le = (r, t) => t.id;
function ce(r, t) {
  if (r & 1) {
    let e = Ix();
    (pl(0, `button`, 2),
      zo(`click`, function () {
        let s = By(e).$implicit;
        return Hy(Ax().taskOpened.emit(s));
      }),
      Rl(1, `span`, 3),
      pl(2, `span`, 4)(3, `span`, 5),
      sR(4),
      pl(5, `span`, 6),
      sR(6),
      eg()(),
      pl(7, `span`, 7),
      sR(8),
      eg()(),
      Rl(9, `tui-icon`, 8),
      eg());
  }
  if (r & 2) {
    let e = t.$implicit;
    (vA(),
      kr(`data-status`, e.status),
      vA(3),
      ag(` `, e.id, ` `),
      vA(2),
      ag(`, `, e.status),
      vA(2),
      aC(e.image));
  }
}
function ue(r, t) {
  if ((r & 1 && (pl(0, `p`, 1), sR(1), eg()), r & 2)) {
    let e = Ax();
    (vA(),
      ag(
        ` `,
        e.query() ? `No task ID or image matches "` + e.query() + `".` : `No tasks yet.`,
        ` `,
      ));
  }
}
var k = class r {
  tasks = tr.required();
  query = tr(``);
  taskOpened = M9();
  static ɵfac = function (e) {
    return new (e || r)();
  };
  static ɵcmp = Vi({
    type: r,
    selectors: [[`app-search-results`]],
    inputs: { tasks: [1, `tasks`], query: [1, `query`] },
    outputs: { taskOpened: `taskOpened` },
    decls: 3,
    vars: 1,
    consts: [
      [`type`, `button`, 1, `result`],
      [1, `result__empty`],
      [`type`, `button`, 1, `result`, 3, `click`],
      [`aria-hidden`, `true`, 1, `result__dot`],
      [1, `min-w-0`, `flex-1`],
      [1, `result__id`],
      [1, `sr-only`],
      [1, `result__sub`],
      [`icon`, `@tui.chevron-right`, `aria-hidden`, `true`, 1, `result__chevron`],
    ],
    template: function (e, n) {
      (e & 1 && vx(0, ce, 10, 4, `button`, 0, le, !1, ue, 2, 1, `p`, 1), e & 2 && yx(n.tasks()));
    },
    dependencies: [EJ],
    styles: [
      `.result[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem;inline-size:100%;margin:0;border:0;padding:.6875rem 1rem;min-block-size:3.25rem;background:none;font:inherit;color:inherit;text-align:start;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background-color var(--%NS%tui-duration)}.result[_ngcontent-%COMP%]:hover, .result[_ngcontent-%COMP%]:focus-visible{background:var(--%NS%tui-background-neutral-1)}.result[_ngcontent-%COMP%] + .result[_ngcontent-%COMP%]{border-block-start:1px solid var(--%NS%tui-border-normal)}.result__dot[_ngcontent-%COMP%]{inline-size:.4375rem;block-size:.4375rem;flex:none;border-radius:999px;background:var(--%NS%tui-status-neutral)}.result__dot[data-status=running][_ngcontent-%COMP%]{background:var(--%NS%tui-status-positive)}.result__dot[data-status=error][_ngcontent-%COMP%]{background:var(--%NS%tui-status-negative)}.result__dot[data-status=creating][_ngcontent-%COMP%], .result__dot[data-status=starting][_ngcontent-%COMP%]{background:var(--%NS%tui-status-warning)}.result__id[_ngcontent-%COMP%]{display:block;overflow:hidden;font-family:var(--%NS%app-font-mono);font-size:1.0625rem;font-weight:600;color:var(--%NS%tui-text-primary);text-overflow:ellipsis;white-space:nowrap}.result__sub[_ngcontent-%COMP%]{display:block;overflow:hidden;font-family:var(--%NS%app-font-mono);font-size:.8125rem;color:var(--%NS%tui-text-tertiary);text-overflow:ellipsis;white-space:nowrap}.result__chevron[_ngcontent-%COMP%]{flex:none;font-size:.9375rem;color:var(--%NS%tui-text-tertiary)}.result__empty[_ngcontent-%COMP%]{margin:0;padding:2rem 1rem;font-size:.9375rem;color:var(--%NS%tui-text-tertiary);text-align:center}`,
    ],
  });
};
var de = [`search`];
function pe(r, t) {
  if (r & 1) {
    let e = Ix();
    (pl(0, `button`, 4),
      zo(`click`, function () {
        By(e);
        return Hy(Ax().clear());
      }),
      Rl(1, `tui-icon`, 5),
      eg());
  }
}
var b = class r {
  search = N9(`search`);
  query = A9(``);
  field = Qt(this.query);
  clear() {
    (this.query.set(``), this.search()?.nativeElement.focus());
  }
  onDocumentKeydown(t) {
    t.key !== `/` ||
      t.metaKey ||
      t.ctrlKey ||
      t.altKey ||
      t.target?.closest(`input, textarea, select, [contenteditable]`) ||
      (t.preventDefault(), this.search()?.nativeElement.focus());
  }
  static ɵfac = function (e) {
    return new (e || r)();
  };
  static ɵcmp = Vi({
    type: r,
    selectors: [[`app-task-filter-bar`]],
    viewQuery: function (e, n) {
      (e & 1 && ZE(n.search, de, 5), e & 2 && kx());
    },
    hostAttrs: [1, `block`],
    hostBindings: function (e, n) {
      e & 1 &&
        zo(
          `keydown`,
          function (c) {
            return n.onDocumentKeydown(c);
          },
          NM,
        );
    },
    inputs: { query: [1, `query`] },
    outputs: { query: `queryChange` },
    decls: 5,
    vars: 3,
    consts: [
      [`search`, ``],
      [`tuiTextfieldSize`, `m`, `iconStart`, `@tui.search`, 1, `w-full`, 3, `tuiTextfieldCleaner`],
      [
        `tuiInput`,
        ``,
        `type`,
        `search`,
        `autocomplete`,
        `off`,
        `aria-label`,
        `Search tasks by ID or image`,
        `aria-keyshortcuts`,
        `/`,
        `placeholder`,
        `Search task ID or image`,
        3,
        `keydown.escape`,
        `formField`,
      ],
      [
        `tuiIconButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `s`,
        `appearance`,
        `flat-grayscale`,
        `aria-label`,
        `Clear search`,
      ],
      [
        `tuiIconButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `s`,
        `appearance`,
        `flat-grayscale`,
        `aria-label`,
        `Clear search`,
        3,
        `click`,
      ],
      [`icon`, `@tui.x`, 1, `icon-sm`],
    ],
    template: function (e, n) {
      (e & 1 &&
        (pl(0, `search`)(1, `tui-textfield`, 1)(2, `input`, 2, 0),
        zo(`keydown.escape`, function () {
          return n.clear();
        }),
        eg(),
        oN(),
        hx(4, pe, 2, 0, `button`, 3),
        eg()()),
        e & 2 &&
          (vA(),
          VE(`tuiTextfieldCleaner`, !1),
          vA(),
          VE(`formField`, n.field),
          aN(),
          vA(2),
          px(n.query() ? 4 : -1)));
    },
    dependencies: [tn, It, EJ, Nt, Qi],
    styles: [
      `input[type=search][_ngcontent-%COMP%]::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}`,
    ],
  });
};
var me = () => [0, 1, 2];
function ye(r, t) {
  r & 1 && Rl(0, `div`, 6);
}
function fe(r, t) {
  (r & 1 && (pl(0, `div`, 3), vx(1, ye, 1, 0, `div`, 6, mx), eg()), r & 2 && (vA(), yx(vR(0, me))));
}
function _e(r, t) {
  if (r & 1) {
    let e = Ix();
    (pl(0, `app-error-state`, 7),
      zo(`retry`, function () {
        By(e);
        return Hy(Ax().tasks.load());
      }),
      eg());
  }
  if (r & 2) VE(`message`, Ax().tasks.error());
}
function ge(r, t) {
  if (r & 1) {
    let e = Ix();
    (pl(0, `app-inset-group`, 5)(1, `app-search-results`, 8),
      zo(`taskOpened`, function (s) {
        By(e);
        return Hy(Ax().openTask(s));
      }),
      eg()());
  }
  if (r & 2) {
    let e = Ax();
    (VE(`trailing`, e.summary()), vA(), VE(`tasks`, e.filtered())(`query`, e.search.query()));
  }
}
var se = class r {
  tasks = v(j$1);
  search = v(h);
  router = v(hs);
  filtered = oe(() => this.search.filter(this.tasks.tasks()));
  summary = oe(() => {
    let t = this.filtered().length;
    return `${t} ${t === 1 ? `task` : `tasks`}`;
  });
  constructor() {
    j({ busy: this.tasks.loading, trigger: () => this.tasks.load() });
  }
  openTask(t) {
    this.router.navigate([`/tasks`, t.id]);
  }
  static ɵfac = function (e) {
    return new (e || r)();
  };
  static ɵcmp = Vi({
    type: r,
    selectors: [[`app-search-page`]],
    features: [Na([j$1, h])],
    decls: 8,
    vars: 2,
    consts: [
      [`appReveal`, ``, 1, `mx-auto`, `grid`, `w-full`, `max-w-[40rem]`, `grid-cols-1`, `gap-4`],
      [1, `page-title`],
      [3, `queryChange`, `query`],
      [`aria-hidden`, `true`, 1, `skeleton`],
      [3, `message`],
      [`label`, `Results`, 3, `trailing`],
      [1, `skeleton__row`],
      [3, `retry`, `message`],
      [3, `taskOpened`, `tasks`, `query`],
    ],
    template: function (e, n) {
      (e & 1 &&
        (pl(0, `div`, 0)(1, `header`)(2, `h1`, 1),
        sR(3, `Search`),
        eg()(),
        pl(4, `app-task-filter-bar`, 2),
        dC(`queryChange`, function (c) {
          return (dR(n.search.query, c) || (n.search.query = c), c);
        }),
        eg(),
        hx(5, fe, 3, 1, `div`, 3)(6, _e, 1, 1, `app-error-state`, 4)(
          7,
          ge,
          2,
          3,
          `app-inset-group`,
          5,
        ),
        eg()),
        e & 2 &&
          (vA(4),
          lC(`query`, n.search.query),
          vA(),
          px(
            n.tasks.loading() && !n.tasks.hasLoaded()
              ? 5
              : n.tasks.error() && !n.tasks.hasLoaded()
                ? 6
                : 7,
          )));
    },
    dependencies: [y, b$1, v$1, k, b],
    styles: [
      `.page-title[_ngcontent-%COMP%]{margin:0;font-size:2.125rem;font-weight:700;line-height:1.2;letter-spacing:-.022em;color:var(--%NS%tui-text-primary)}.skeleton[_ngcontent-%COMP%]{display:grid;gap:.5rem}.skeleton__row[_ngcontent-%COMP%]{block-size:3.25rem;border-radius:var(--%NS%tui-radius-l);background:var(--%NS%tui-background-neutral-1);animation:_ngcontent-%COMP%_skeleton-pulse 1.4s ease-in-out infinite}@keyframes _ngcontent-%COMP%_skeleton-pulse{50%{opacity:.55}}`,
    ],
  });
};
export { se as SearchPage };
