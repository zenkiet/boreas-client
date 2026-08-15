import {
  $r as px,
  $t as Y,
  At as Rs,
  Bn as eg,
  Cr as kx,
  Dt as Rl,
  Ei as vA,
  Fi as vx,
  Fn as df,
  Ir as mo,
  Kt as Vi,
  L as Hy,
  Nt as SR,
  On as dC,
  Q as LD,
  Qi as ye,
  Qn as gx,
  Qr as pl,
  Sr as kr,
  Ti as v,
  Tn as cC,
  Tr as lC,
  U as Ix,
  Ur as oe,
  Vn as et,
  W as J$1,
  Wt as VE,
  _t as P9,
  ai as qe,
  an as ZE,
  ar as hs,
  b as EJ,
  bt as Px,
  ct as N9,
  di as sR,
  dt as Na,
  ea as yr,
  ei as q,
  et as LK,
  fi as sg,
  gn as aC,
  gr as jO,
  ht as Oa,
  j as H$1,
  jn as dR,
  l as Ax,
  la as l,
  m as By,
  na as yx,
  nn as Yt,
  or as hx,
  pn as _e,
  ra as z$1,
  rt as M9,
  sa as zo,
  ta as yt$1,
  ua as m,
  ur as ie,
  vn as ag,
  vt as PI,
  w as FE,
  x as ER,
  xn as bR,
  yi as tr,
} from './chunk-CD8PwEax.js';
import { i as It, r as H$2 } from './chunk-bRWS10C8.js';
import { b as Yn, i as j, t as R$1 } from './main-YU6HVKXZ.js';
import './chunk-Cxjo7Efo.js';
import { b as ri, l as M } from './chunk-C4cee0NY.js';
import { n as Qi, t as Nt } from './chunk-CXFBjKgF.js';
import { a as Ut, c as j$1, n as F, r as Ft, t as Bt, u as no } from './chunk-PFRT3jyP.js';
import { t as y } from './chunk-BQF1IQ6o.js';
import { t as v$1 } from './chunk-thr6BV2C.js';
import './chunk-BhZX3ewP.js';
import { a as te, n as Q, r as Wa, t as Di } from './chunk-DIS1-kDx.js';
import { r as W } from './chunk-BBNeZJmf.js';
import { t as b } from './chunk-BSF489_Y.js';
import {
  a as ei,
  i as Z,
  n as Oe,
  o as it$1,
  r as Q$1,
  s as ti,
  t as Jt,
} from './chunk-CUkRMx85.js';
var V = class a {
  config = v(H$2);
  base(t) {
    return `${this.config.baseUrl()}/api/v1/tasks/${encodeURIComponent(t)}/logs`;
  }
  downloadUrl(t, e = 1e4) {
    return `${this.base(t)}?tail=${e}&download=true`;
  }
  streamUrl(t, e = 100) {
    return `${this.base(t)}/stream?tail=${e}`;
  }
  static ɵfac = function (e) {
    return new (e || a)();
  };
  static ɵprov = q({ token: a, factory: a.ɵfac, providedIn: `root` });
};
function J(a) {
  try {
    let t = JSON.parse(a);
    return !t.message || (t.stream !== `stdout` && t.stream !== `stderr`)
      ? null
      : { timestamp: t.timestamp, stream: t.stream, message: t.message };
  } catch {
    return null;
  }
}
var O = class a {
  api = v(V);
  destroyRef = v(J$1);
  entriesState = H$1([]);
  connectedState = H$1(!1);
  taskIdState = H$1(``);
  eventSource;
  reconnectTimer;
  entries = this.entriesState.asReadonly();
  connected = this.connectedState.asReadonly();
  downloadUrl = oe(() => {
    let t = this.taskIdState();
    return t ? this.api.downloadUrl(t) : ``;
  });
  constructor() {
    this.destroyRef.onDestroy(() => this.disconnect());
  }
  connect(t) {
    (t === this.taskIdState() && this.eventSource) ||
      (this.disconnect(), this.taskIdState.set(t), this.entriesState.set([]), this.open());
  }
  disconnect() {
    (this.eventSource?.close(),
      (this.eventSource = void 0),
      this.connectedState.set(!1),
      this.reconnectTimer && clearTimeout(this.reconnectTimer),
      (this.reconnectTimer = void 0));
  }
  open() {
    let t = this.taskIdState();
    if (!t) return;
    let e = new EventSource(this.api.streamUrl(t));
    ((this.eventSource = e),
      (e.onopen = () => this.connectedState.set(!0)),
      (e.onmessage = (n) => this.receive(n.data)),
      (e.onerror = () => {
        (this.connectedState.set(!1),
          e.close(),
          (this.eventSource = void 0),
          (this.reconnectTimer = setTimeout(() => {
            ((this.reconnectTimer = void 0), this.open());
          }, 3e3)));
      }));
  }
  receive(t) {
    let e = J(t);
    e &&
      this.entriesState.update((n) => {
        let i = n[n.length - 1];
        return (i && e.timestamp < i.timestamp) ||
          (i &&
            e.timestamp === i.timestamp &&
            n.some((m) => m.timestamp === e.timestamp && m.message === e.message))
          ? n
          : [...n, e].slice(-2e3);
      });
  }
  static ɵfac = function (e) {
    return new (e || a)();
  };
  static ɵprov = q({ token: a, factory: a.ɵfac });
};
var ot = [`body`];
function rt(a, t) {
  if ((a & 1 && (pl(0, `p`, 9), sR(1), eg()), a & 2)) {
    let e = Ax();
    (vA(),
      ag(
        ` `,
        e.connected()
          ? e.query()
            ? `No line matches the filter.`
            : `Waiting for log output.`
          : `Logs are unavailable while the stream is disconnected.`,
        ` `,
      ));
  }
}
function st(a, t) {
  if (
    (a & 1 &&
      (pl(0, `p`, 10)(1, `span`, 11),
      sR(2),
      ER(3, `slice`),
      eg(),
      pl(4, `span`, 12),
      sR(5),
      eg(),
      pl(6, `span`, 13),
      sR(7),
      eg()()),
    a & 2)
  ) {
    let e = t.$implicit;
    (kr(`data-stream`, e.stream),
      vA(2),
      aC(bR(3, 4, e.timestamp, 11, 19)),
      vA(3),
      aC(e.stream),
      vA(2),
      aC(e.message));
  }
}
function lt(a, t) {
  if ((a & 1 && vx(0, st, 8, 8, `p`, 10, gx), a & 2)) yx(Ax().visibleEntries());
}
var dt = 0;
var ct = 24;
var R = class a {
  uid = `log-console-${(dt += 1)}`;
  body = N9(`body`);
  entries = tr.required();
  connected = tr.required();
  downloadUrl = tr.required();
  filterId = `${this.uid}-filter`;
  query = H$1(``);
  follow = H$1(!0);
  visibleEntries = oe(() => {
    let t = this.query().trim().toLowerCase();
    return t ? this.entries().filter((e) => e.message.toLowerCase().includes(t)) : this.entries();
  });
  countLabel = oe(() => {
    let t = this.visibleEntries().length,
      e = this.entries().length,
      n = e === 1 ? `line` : `lines`;
    return t === e ? `${e} ${n}` : `${t} of ${e} ${n}`;
  });
  constructor() {
    P9(() => {
      let t = this.visibleEntries().length > 0,
        e = this.body()?.nativeElement;
      !e || !this.follow() || !t || (e.scrollTop = e.scrollHeight);
    });
  }
  updateQuery(t) {
    this.query.set(t.target.value);
  }
  onScroll(t) {
    let e = t.target,
      n = e.scrollHeight - e.scrollTop - e.clientHeight;
    this.follow.set(n <= ct);
  }
  static ɵfac = function (e) {
    return new (e || a)();
  };
  static ɵcmp = Vi({
    type: a,
    selectors: [[`app-log-console`]],
    viewQuery: function (e, n) {
      (e & 1 && ZE(n.body, ot, 5), e & 2 && kx());
    },
    inputs: {
      entries: [1, `entries`],
      connected: [1, `connected`],
      downloadUrl: [1, `downloadUrl`],
    },
    decls: 13,
    vars: 6,
    consts: [
      [`body`, ``],
      [`heading`, `Live logs`, 3, `flush`],
      [
        `panelActions`,
        ``,
        `tuiButton`,
        ``,
        `size`,
        `s`,
        `appearance`,
        `secondary`,
        `download`,
        ``,
        3,
        `href`,
      ],
      [`icon`, `@tui.download`, 1, `icon-sm`],
      [1, `logs__toolbar`],
      [
        `tuiTextfieldSize`,
        `s`,
        `iconStart`,
        `@tui.search`,
        1,
        `min-w-0`,
        `flex-1`,
        `md:max-w-[20rem]`,
      ],
      [
        `tuiInput`,
        ``,
        `type`,
        `search`,
        `autocomplete`,
        `off`,
        `placeholder`,
        `Filter lines`,
        `aria-label`,
        `Filter log lines`,
        3,
        `input`,
        `id`,
        `value`,
      ],
      [1, `logs__count`, `tabular`],
      [
        `role`,
        `log`,
        `aria-live`,
        `polite`,
        `aria-label`,
        `Task logs`,
        `tabindex`,
        `0`,
        1,
        `logs__body`,
        3,
        `scroll`,
      ],
      [1, `logs__empty`],
      [1, `logs__line`],
      [1, `logs__time`],
      [1, `logs__stream`],
      [1, `logs__message`],
    ],
    template: function (e, n) {
      (e & 1 &&
        (pl(0, `app-panel`, 1)(1, `a`, 2),
        Rl(2, `tui-icon`, 3),
        sR(3, ` Download `),
        eg(),
        pl(4, `div`, 4)(5, `tui-textfield`, 5)(6, `input`, 6),
        zo(`input`, function (m) {
          return n.updateQuery(m);
        }),
        eg()(),
        pl(7, `p`, 7),
        sR(8),
        eg()(),
        pl(9, `div`, 8, 0),
        zo(`scroll`, function (m) {
          return n.onScroll(m);
        }),
        hx(11, rt, 2, 1, `p`, 9)(12, lt, 2, 0),
        eg()()),
        e & 2 &&
          (VE(`flush`, !0),
          vA(),
          VE(`href`, n.downloadUrl(), LD),
          vA(5),
          VE(`id`, n.filterId)(`value`, n.query()),
          vA(2),
          aC(n.countLabel()),
          vA(3),
          px(n.visibleEntries().length === 0 ? 11 : 12)));
    },
    dependencies: [b, It, EJ, Nt, Qi, jO],
    styles: [
      `.logs__toolbar[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;padding:.625rem .875rem;border-block-end:1px solid var(--%NS%tui-border-normal)}.logs__count[_ngcontent-%COMP%]{margin:0;margin-inline-start:auto;font-size:.8125rem;color:var(--%NS%tui-text-tertiary);white-space:nowrap}.logs__body[_ngcontent-%COMP%]{min-block-size:var(--%NS%console-min, 18rem);max-block-size:var(--%NS%console-max, 32rem);overflow:auto;padding:.625rem 0;background:var(--%NS%app-code-bg);font-family:var(--%NS%app-font-mono);font-size:.8125rem;line-height:1.6;overscroll-behavior:contain}.logs__line[_ngcontent-%COMP%]{display:grid;grid-template-columns:auto auto minmax(0,1fr);gap:.75rem;margin:0;padding:.0625rem .875rem;border-inline-start:2px solid transparent;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--%NS%tui-text-primary)}.logs__line[_ngcontent-%COMP%]:hover{background:var(--%NS%tui-background-neutral-1)}.logs__line[data-stream=stderr][_ngcontent-%COMP%]{border-inline-start-color:var(--%NS%tui-status-negative)}.logs__time[_ngcontent-%COMP%], .logs__stream[_ngcontent-%COMP%]{color:var(--%NS%tui-text-tertiary);-webkit-user-select:none;user-select:none}.logs__line[data-stream=stderr][_ngcontent-%COMP%]   .logs__time[_ngcontent-%COMP%], .logs__line[data-stream=stderr][_ngcontent-%COMP%]   .logs__stream[_ngcontent-%COMP%]{color:var(--%NS%tui-status-negative)}.logs__stream[_ngcontent-%COMP%]{inline-size:3rem;font-size:.75rem;text-transform:uppercase}.logs__empty[_ngcontent-%COMP%]{margin:0;padding:4rem 1rem;font-family:var(--%NS%tui-typography-family-text);font-size:.9375rem;color:var(--%NS%tui-text-tertiary);text-align:center}@media(max-width:47.99rem){.logs__line[_ngcontent-%COMP%]{grid-template-columns:auto minmax(0,1fr)}.logs__stream[_ngcontent-%COMP%]{display:none}}`,
    ],
  });
};
var L = class a {
  api = v(Bt);
  taskId = H$1(``);
  savingEnvironmentState = H$1(!1);
  saveError = H$1(void 0);
  snapshot = LK({
    params: () => this.taskId() || void 0,
    stream: ({ params: t }) =>
      df({ task: this.api.get(t), environment: this.api.getEnvironment(t) }),
  });
  current = Oa({
    source: () => ({
      id: this.taskId(),
      value: this.snapshot.hasValue() ? this.snapshot.value() : void 0,
    }),
    computation: (t, e) => t.value ?? (e && e.source.id === t.id ? e.value : void 0),
  });
  task = oe(() => this.current()?.task);
  environment = oe(() => this.current()?.environment ?? {});
  loading = this.snapshot.isLoading;
  savingEnvironment = this.savingEnvironmentState.asReadonly();
  hasLoaded = oe(() => this.current() !== void 0);
  error = oe(() => {
    let t = this.snapshot.error();
    return this.saveError() ?? (t ? no(t).message : void 0);
  });
  proxyUrl = oe(() => {
    let t = this.task();
    return t ? this.api.accessUrl(t.id) : ``;
  });
  refresh(t) {
    if (t === this.taskId()) {
      this.snapshot.reload();
      return;
    }
    this.taskId.set(t);
  }
  updateEnvironment(t) {
    return !this.taskId() || this.savingEnvironmentState()
      ? z$1(`An environment update is already running.`)
      : (this.savingEnvironmentState.set(!0),
        this.saveError.set(void 0),
        this.api.updateEnvironment(this.taskId(), { environment: t }).pipe(
          Y(
            (e) => (
              this.snapshot.update((n) => n && m(l({}, n), { environment: l({}, t) })),
              this.snapshot.reload(),
              `${e.message} (${e.status}).`
            ),
          ),
          yr((e) => {
            let n = no(e).message;
            return (this.saveError.set(n), z$1(n));
          }),
          mo(() => this.savingEnvironmentState.set(!1)),
        ));
  }
  static ɵfac = function (e) {
    return new (e || a)();
  };
  static ɵprov = q({ token: a, factory: a.ɵfac });
};
var H = class a {
  label = tr(`Loading tasks`);
  static ɵfac = function (e) {
    return new (e || a)();
  };
  static ɵcmp = Vi({
    type: a,
    selectors: [[`app-loading-state`]],
    inputs: { label: [1, `label`] },
    decls: 4,
    vars: 1,
    consts: [
      [`role`, `status`, `aria-live`, `polite`, 1, `state`],
      [`size`, `m`],
      [1, `state__label`],
    ],
    template: function (e, n) {
      (e & 1 && (pl(0, `div`, 0), Rl(1, `tui-loader`, 1), pl(2, `span`, 2), sR(3), eg()()),
        e & 2 && (vA(3), aC(n.label())));
    },
    dependencies: [Yn],
    styles: [
      `.state[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;gap:.875rem;padding:3.5rem 1.5rem;border:1px solid var(--%NS%tui-border-normal);border-radius:var(--%NS%tui-radius-l);background:var(--%NS%tui-background-base)}.state__label[_ngcontent-%COMP%]{font-size:.9375rem;color:var(--%NS%tui-text-secondary)}`,
    ],
  });
};
var mt = (a, t) => t.label;
function pt(a, t) {
  if ((a & 1 && (pl(0, `div`)(1, `dt`, 2), sR(2), eg(), pl(3, `dd`, 8), sR(4), eg()()), a & 2)) {
    let e = t.$implicit;
    (vA(2), aC(e.label), vA(), sg(`font-mono`, e.mono), vA(), aC(e.value));
  }
}
var ut = 1600;
var z = class a {
  document = v(ie);
  task = tr.required();
  proxyUrl = tr.required();
  copyFailed = M9();
  copied = H$1(!1);
  rows = oe(() => {
    let t = this.task();
    return [
      { label: `Container IP`, value: t.containerIp || `Unavailable`, mono: !0 },
      {
        label: `Container ID`,
        value: t.containerId ? t.containerId.slice(0, 12) : `Unavailable`,
        mono: !0,
      },
      { label: `CPU limit`, value: gt(t.cpuNano) },
      { label: `Memory limit`, value: Wa(t.memoryBytes) },
      { label: `Variables`, value: String(Object.keys(t.env).length) },
      { label: `Last accessed`, value: t.lastAccessed ? X(t.lastAccessed) : `Never` },
      { label: `Created`, value: X(t.createdAt) },
      { label: `Updated`, value: X(t.updatedAt) },
    ];
  });
  copyUrl() {
    Rs(() =>
      _e(this.document.defaultView?.navigator.clipboard.writeText(this.proxyUrl()) ?? ye),
    ).subscribe({
      next: () => {
        (this.copied.set(!0), this.document.defaultView?.setTimeout(() => this.copied.set(!1), ut));
      },
      error: () => this.copyFailed.emit(),
    });
  }
  static ɵfac = function (e) {
    return new (e || a)();
  };
  static ɵcmp = Vi({
    type: a,
    selectors: [[`app-task-overview`]],
    inputs: { task: [1, `task`], proxyUrl: [1, `proxyUrl`] },
    outputs: { copyFailed: `copyFailed` },
    decls: 12,
    vars: 5,
    consts: [
      [`heading`, `Overview`],
      [1, `overview__url`],
      [1, `overview__label`],
      [1, `flex`, `items-center`, `gap-1`],
      [`rel`, `noopener`, `target`, `_blank`, 1, `overview__link`, 3, `href`],
      [
        `tuiIconButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `xs`,
        `appearance`,
        `flat-grayscale`,
        `aria-label`,
        `Copy proxy URL`,
        3,
        `click`,
        `tuiHint`,
      ],
      [1, `icon-sm`, 3, `icon`],
      [1, `overview__rows`],
      [1, `overview__value`],
    ],
    template: function (e, n) {
      (e & 1 &&
        (pl(0, `app-panel`, 0)(1, `div`, 1)(2, `span`, 2),
        sR(3, `Proxy URL`),
        eg(),
        pl(4, `div`, 3)(5, `a`, 4),
        sR(6),
        eg(),
        pl(7, `button`, 5),
        zo(`click`, function () {
          return n.copyUrl();
        }),
        Rl(8, `tui-icon`, 6),
        eg()()(),
        pl(9, `dl`, 7),
        vx(10, pt, 5, 4, `div`, null, mt),
        eg()()),
        e & 2 &&
          (vA(5),
          VE(`href`, n.proxyUrl(), LD),
          kr(`title`, n.proxyUrl()),
          vA(),
          ag(` `, n.proxyUrl(), ` `),
          vA(),
          VE(`tuiHint`, n.copied() ? `Copied` : `Copy URL`),
          vA(),
          VE(`icon`, n.copied() ? `@tui.check` : `@tui.copy`),
          vA(2),
          yx(n.rows())));
    },
    dependencies: [b, It, j$1, EJ],
    styles: [
      `.overview__url[_ngcontent-%COMP%]{display:grid;gap:.25rem;padding-block-end:1rem;border-block-end:1px solid var(--%NS%tui-border-normal)}.overview__link[_ngcontent-%COMP%]{min-inline-size:0;overflow:hidden;font-family:var(--%NS%app-font-mono);font-size:.9375rem;color:var(--%NS%tui-text-action);text-overflow:ellipsis;white-space:nowrap}.overview__link[_ngcontent-%COMP%]:hover{text-decoration:underline;text-underline-offset:.125rem}.overview__rows[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.875rem 1rem;margin:0}.overview__label[_ngcontent-%COMP%]{font-size:.75rem;font-weight:600;letter-spacing:.055em;text-transform:uppercase;color:var(--%NS%tui-text-tertiary)}.overview__value[_ngcontent-%COMP%]{margin:0;margin-block-start:.125rem;font-size:1.0625rem;color:var(--%NS%tui-text-primary);overflow-wrap:anywhere}`,
    ],
  });
};
function gt(a) {
  if (!a) return `Unlimited`;
  let t = a / 1e9;
  return `${new Intl.NumberFormat(`en`, { maximumFractionDigits: 2 }).format(t)} ${t === 1 ? `core` : `cores`}`;
}
function X(a) {
  return new Date(a).toLocaleString(`en`, { dateStyle: `medium`, timeStyle: `short` });
}
function vt(a, t) {
  a & 1 && Rl(0, `app-loading-state`, 1);
}
function _t(a, t) {
  if (a & 1) {
    let e = Ix();
    (pl(0, `app-error-state`, 4),
      zo(`retry`, function () {
        By(e);
        return Hy(Ax().reload());
      }),
      eg());
  }
  if (a & 2) VE(`message`, Ax().detail.error());
}
function yt(a, t) {
  if (a & 1) {
    let e = Ix();
    (pl(0, `app-task-menu`, 37),
      zo(`actionRequested`, function (i) {
        By(e);
        return Hy(Ax(2).onMenuAction(i));
      }),
      eg());
  }
  if (a & 2) {
    let e = Ax(),
      n = Ax();
    VE(`task`, e)(`accessUrl`, n.detail.proxyUrl())(`pending`, n.isPending(e));
  }
}
function ft(a, t) {
  if (a & 1) {
    let e = Ix();
    (pl(0, `a`, 38),
      Rl(1, `tui-icon`, 39),
      sR(2, ` Open task `),
      eg(),
      pl(3, `button`, 18),
      zo(`click`, function () {
        By(e);
        return Hy(Ax(2).changeState(`stop`));
      }),
      Rl(4, `tui-icon`, 40),
      sR(5, ` Stop `),
      eg());
  }
  if (a & 2) {
    let e = Ax(),
      n = Ax();
    (VE(`href`, n.detail.proxyUrl(), LD), vA(3), VE(`disabled`, n.actionDisabled(e)));
  }
}
function bt(a, t) {
  if (a & 1) {
    let e = Ix();
    (pl(0, `button`, 41),
      zo(`click`, function () {
        By(e);
        return Hy(Ax(2).changeState(`start`));
      }),
      Rl(1, `tui-icon`, 42),
      sR(2, ` Start `),
      eg());
  }
  if (a & 2) {
    let e = Ax();
    VE(`disabled`, Ax().actionDisabled(e));
  }
}
function ht(a, t) {
  if ((a & 1 && (pl(0, `app-callout`, 22), sR(1), eg()), a & 2)) {
    let e = Ax(2);
    (vA(), aC(e.detail.error()));
  }
}
function xt(a, t) {
  a & 1 &&
    (pl(0, `app-callout`, 23),
    sR(1, ` Environment changes are waiting for a container recreate. `),
    eg());
}
function wt(a, t) {
  (a & 1 && Rl(0, `tui-loader`, 35), a & 2 && VE(`inheritColor`, !0));
}
function kt(a, t) {
  if (a & 1) {
    let e = Ix();
    (pl(0, `div`, 3)(1, `div`, 5)(2, `tui-app-bar`, 6),
      Rl(3, `a`, 7),
      pl(4, `span`, 8),
      Rl(5, `span`, 9),
      sR(6),
      eg(),
      pl(7, `button`, 10),
      dC(`tuiDropdownOpenChange`, function (i) {
        By(e);
        let m = Ax();
        return (dR(m.menuOpen, i) || (m.menuOpen = i), Hy(i));
      }),
      eg(),
      FE(8, yt, 1, 3, `ng-template`, null, 0, SR),
      eg()(),
      pl(10, `header`, 11),
      Rl(11, `app-back-link`, 12),
      pl(12, `h1`, 13),
      Rl(13, `span`, 9),
      sR(14),
      eg(),
      pl(15, `p`, 14),
      sR(16),
      eg()(),
      pl(17, `p`, 15),
      sR(18),
      eg(),
      pl(19, `div`, 16),
      hx(20, ft, 6, 2)(21, bt, 3, 1, `button`, 17),
      pl(22, `button`, 18),
      zo(`click`, function () {
        By(e);
        return Hy(Ax().changeState(`restart`));
      }),
      Rl(23, `tui-icon`, 19),
      sR(24, ` Restart `),
      eg(),
      pl(25, `button`, 20),
      zo(`click`, function () {
        let i = By(e);
        return Hy(Ax().deleteTask(i.id));
      }),
      Rl(26, `tui-icon`, 21),
      sR(27, ` Delete `),
      eg()(),
      hx(28, ht, 2, 1, `app-callout`, 22),
      hx(29, xt, 2, 0, `app-callout`, 23),
      pl(30, `div`, 11)(31, `app-glass-segmented`, 24),
      zo(`activeIndexChange`, function (i) {
        By(e);
        return Hy(Ax().setView(i));
      }),
      eg()(),
      pl(32, `div`, 25)(33, `app-glass-segmented`, 24),
      zo(`activeIndexChange`, function (i) {
        By(e);
        return Hy(Ax().setView(i));
      }),
      eg()(),
      pl(34, `div`, 26),
      Rl(35, `app-log-console`, 27),
      eg(),
      pl(36, `div`, 28)(37, `app-glass-segmented`, 24),
      zo(`activeIndexChange`, function (i) {
        By(e);
        return Hy(Ax().setEnvMode(i));
      }),
      eg(),
      pl(38, `div`, 29)(39, `app-environment-list`, 30),
      zo(`copyFailed`, function () {
        By(e);
        return Hy(Ax().reportValueCopyFailure());
      }),
      eg()(),
      pl(40, `div`, 31)(41, `app-environment-editor`, 32),
      zo(`environmentChange`, function (i) {
        By(e);
        let m = Ax();
        return (m.draftEnvironment.set(i), Hy(m.environmentDirty.set(!0)));
      })(`errorsChange`, function (i) {
        By(e);
        return Hy(Ax().environmentErrors.set(i));
      }),
      eg(),
      pl(42, `div`, 33)(43, `button`, 34),
      zo(`click`, function () {
        By(e);
        return Hy(Ax().applyEnvironment());
      }),
      hx(44, wt, 1, 1, `tui-loader`, 35),
      sR(45, ` Apply environment `),
      eg()()()(),
      pl(46, `div`)(47, `app-task-overview`, 36),
      zo(`copyFailed`, function () {
        By(e);
        return Hy(Ax().reportCopyFailure());
      }),
      eg()()());
  }
  if (a & 2) {
    let e = t,
      n = Px(9),
      i = Ax();
    (vA(5),
      kr(`data-status`, e.status),
      vA(),
      ag(` `, e.id, ` `),
      vA(),
      VE(`tuiDropdown`, n),
      lC(`tuiDropdownOpen`, i.menuOpen),
      vA(6),
      kr(`data-status`, e.status),
      vA(),
      ag(` `, e.id, ` `),
      vA(2),
      cC(``, e.image, ` · port `, e.port),
      vA(2),
      ag(`Status: `, e.status),
      vA(2),
      px(e.status === `running` ? 20 : 21),
      vA(2),
      VE(`disabled`, i.actionDisabled(e)),
      vA(3),
      VE(`disabled`, i.actionDisabled(e)),
      vA(3),
      px(i.detail.error() ? 28 : -1),
      vA(),
      px(e.pendingRecreate ? 29 : -1),
      vA(2),
      VE(`items`, i.viewItems())(`activeIndex`, i.viewIndex()),
      vA(2),
      VE(`items`, i.viewItems())(`activeIndex`, i.viewIndex()),
      vA(),
      sg(`hidden`, i.view() !== `logs`),
      vA(),
      VE(`entries`, i.logs.entries())(`connected`, i.logs.connected())(
        `downloadUrl`,
        i.logs.downloadUrl(),
      ),
      vA(),
      sg(`hidden`, i.view() !== `environment`),
      vA(),
      VE(`items`, i.envItems())(`activeIndex`, i.envModeIndex()),
      vA(),
      sg(`hidden`, i.envMode() !== `list`),
      vA(),
      VE(`environment`, i.detail.environment()),
      vA(),
      sg(`hidden`, i.envMode() !== `raw`),
      vA(),
      VE(`environment`, i.detail.environment())(`resetKey`, i.environmentResetKey()),
      vA(2),
      VE(
        `disabled`,
        !i.environmentDirty() || i.detail.savingEnvironment() || i.environmentErrors().length > 0,
      ),
      vA(),
      px(i.detail.savingEnvironment() ? 44 : -1),
      vA(2),
      sg(`hidden`, i.view() !== `info`),
      vA(),
      VE(`task`, e)(`proxyUrl`, i.detail.proxyUrl()));
  }
}
var it = [`logs`, `environment`, `info`];
var at = class a {
  detail = v(L);
  commands = v(Q);
  confirmations = v(te);
  toasts = v(Di);
  router = v(hs);
  logs = v(O);
  id = tr(``);
  view = H$1(`logs`);
  viewIndex = oe(() => it.indexOf(this.view()));
  menuOpen = H$1(!1);
  envMode = H$1(`list`);
  envModeIndex = oe(() => (this.envMode() === `raw` ? 0 : 1));
  viewItems = oe(() => [
    { label: `Logs` },
    { label: `Environment`, dot: this.environmentDirty() },
    { label: `Info` },
  ]);
  envItems = oe(() => [{ label: `Raw`, dot: this.environmentDirty() }, { label: `List` }]);
  draftEnvironment = H$1({});
  environmentDirty = H$1(!1);
  environmentErrors = H$1([]);
  environmentResetKey = H$1(0);
  constructor() {
    (j({
      busy: this.detail.loading,
      trigger: () => {
        let t = this.id();
        t && this.detail.refresh(t);
      },
    }),
      Yt(() => {
        let t = this.id();
        t && this.detail.refresh(t);
      }),
      Yt(() => {
        let t = this.detail.task();
        t && this.logs.connect(t.id);
      }),
      Yt(() => {
        !this.environmentDirty() &&
          this.detail.hasLoaded() &&
          (this.draftEnvironment.set(l({}, this.detail.environment())),
          this.environmentResetKey.update((t) => t + 1));
      }));
  }
  setView(t) {
    let e = it[t];
    e && this.view.set(e);
  }
  reload() {
    this.id() && this.detail.refresh(this.id());
  }
  actionDisabled(t) {
    return F(t) || this.commands.isPending(t.id);
  }
  isPending(t) {
    return this.commands.isPending(t.id);
  }
  onMenuAction({ action: t, task: e }) {
    if ((this.menuOpen.set(!1), t === `delete`)) {
      this.deleteTask(e.id);
      return;
    }
    this.changeState(t);
  }
  changeState(t) {
    let e = this.detail.task();
    e &&
      this.commands.changeState(e, t).subscribe((n) => {
        (this.notify(n.message, n.success), n.success && this.reload());
      });
  }
  deleteTask(t) {
    this.confirmations
      .confirm({
        title: `Delete ${t}?`,
        message: `The container, environment metadata and proxy route will be deleted. This action cannot be undone.`,
        confirmLabel: `Delete task`,
        destructive: !0,
      })
      .pipe(
        et(Boolean),
        Y(() => this.detail.task()),
        et((e) => e !== void 0),
        qe((e) => this.commands.delete(e)),
      )
      .subscribe((e) => {
        (this.notify(e.message, e.success), e.success && this.router.navigate([`/dashboard`]));
      });
  }
  applyEnvironment() {
    this.detail.updateEnvironment(this.draftEnvironment()).subscribe((t) => {
      (this.environmentDirty.set(!1),
        this.notify(
          t,
          !t.toLowerCase().includes(`failed`) && !t.toLowerCase().includes(`invalid`),
        ));
    });
  }
  setEnvMode(t) {
    this.envMode.set(t === 0 ? `raw` : `list`);
  }
  reportValueCopyFailure() {
    this.notify(`The value could not be copied to the clipboard.`, !1);
  }
  reportCopyFailure() {
    this.notify(`The proxy URL could not be copied to the clipboard.`, !1);
  }
  notify(t, e) {
    this.toasts
      .open(t, { appearance: e ? `positive` : `negative` })
      .pipe(yt$1(1))
      .subscribe();
  }
  static ɵfac = function (e) {
    return new (e || a)();
  };
  static ɵcmp = Vi({
    type: a,
    selectors: [[`app-task-detail-page`]],
    inputs: { id: [1, `id`] },
    features: [Na([L, Q, O])],
    decls: 3,
    vars: 1,
    consts: [
      [`menu`, ``],
      [`label`, `Loading task`],
      [`title`, `Unable to load task`, 3, `message`],
      [
        `appReveal`,
        ``,
        1,
        `mx-auto`,
        `grid`,
        `w-full`,
        `max-w-[48rem]`,
        `grid-cols-1`,
        `gap-3.5`,
        `pb-16`,
        `md:gap-4`,
        `md:pb-0`,
      ],
      [`title`, `Unable to load task`, 3, `retry`, `message`],
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
      [1, `detail__bar-title`],
      [`aria-hidden`, `true`, 1, `detail__dot`],
      [
        `tuiSlot`,
        `end`,
        `appGlassIconButton`,
        ``,
        `icon`,
        `@tui.ellipsis`,
        `type`,
        `button`,
        `aria-label`,
        `More actions`,
        3,
        `tuiDropdownOpenChange`,
        `tuiDropdown`,
        `tuiDropdownOpen`,
      ],
      [1, `hidden`, `md:block`],
      [`link`, `/dashboard`, `label`, `Tasks`],
      [1, `detail__title`, `mt-1.5`],
      [1, `detail__subtitle`],
      [1, `sr-only`],
      [1, `hidden`, `flex-wrap`, `items-center`, `gap-2`, `md:flex`],
      [`tuiButton`, ``, `type`, `button`, `size`, `s`, `appearance`, `primary`, 3, `disabled`],
      [
        `tuiButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `s`,
        `appearance`,
        `secondary`,
        3,
        `click`,
        `disabled`,
      ],
      [`icon`, `@tui.rotate-cw`, 1, `icon-sm`],
      [
        `tuiButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `s`,
        `appearance`,
        `flat-destructive`,
        3,
        `click`,
        `disabled`,
      ],
      [`icon`, `@tui.trash-2`, 1, `icon-sm`],
      [`tone`, `negative`, `role`, `alert`],
      [`tone`, `warning`, `role`, `status`],
      [3, `activeIndexChange`, `items`, `activeIndex`],
      [1, `detail__nav`, `md:hidden`],
      [1, `detail__console`],
      [3, `entries`, `connected`, `downloadUrl`],
      [1, `grid`, `grid-cols-1`, `gap-3.5`],
      [1, `detail__card`],
      [3, `copyFailed`, `environment`],
      [1, `detail__card`, `grid`, `grid-cols-1`, `gap-4`],
      [3, `environmentChange`, `errorsChange`, `environment`, `resetKey`],
      [1, `flex`, `justify-end`, `border-t`, `border-border`, `pt-4`],
      [
        `tuiButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `m`,
        `appearance`,
        `primary`,
        3,
        `click`,
        `disabled`,
      ],
      [`size`, `s`, 3, `inheritColor`],
      [3, `copyFailed`, `task`, `proxyUrl`],
      [3, `actionRequested`, `task`, `accessUrl`, `pending`],
      [
        `tuiButton`,
        ``,
        `size`,
        `s`,
        `appearance`,
        `primary`,
        `rel`,
        `noopener`,
        `target`,
        `_blank`,
        3,
        `href`,
      ],
      [`icon`, `@tui.external-link`, 1, `icon-sm`],
      [`icon`, `@tui.square`, 1, `icon-sm`],
      [
        `tuiButton`,
        ``,
        `type`,
        `button`,
        `size`,
        `s`,
        `appearance`,
        `primary`,
        3,
        `click`,
        `disabled`,
      ],
      [`icon`, `@tui.play`, 1, `icon-sm`],
    ],
    template: function (e, n) {
      if (
        (e & 1 &&
          hx(0, vt, 1, 0, `app-loading-state`, 1)(1, _t, 1, 1, `app-error-state`, 2)(
            2,
            kt,
            48,
            40,
            `div`,
            3,
          ),
        e & 2)
      ) {
        let i;
        px(
          n.detail.loading() && !n.detail.hasLoaded()
            ? 0
            : n.detail.error() && !n.detail.hasLoaded()
              ? 1
              : (i = n.detail.task())
                ? 2
                : -1,
          i,
        );
      }
    },
    dependencies: [
      Oe,
      W,
      Z,
      Q$1,
      y,
      Ut,
      R$1,
      H,
      R,
      v$1,
      PI,
      Ft,
      z,
      it$1,
      Jt,
      ei,
      ti,
      It,
      M,
      ri,
      EJ,
      Yn,
    ],
    styles: [
      `.detail__bar-title[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:.5rem;min-inline-size:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.detail__title[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.625rem;margin:0;font-family:var(--%NS%app-font-mono);font-size:clamp(1.375rem,4vw,1.75rem);font-weight:700;letter-spacing:-.02em;color:var(--%NS%tui-text-primary);overflow-wrap:anywhere}.detail__subtitle[_ngcontent-%COMP%]{margin:.375rem 0 0;font-family:var(--%NS%app-font-mono);font-size:.9375rem;color:var(--%NS%tui-text-tertiary);overflow-wrap:anywhere}.detail__dot[_ngcontent-%COMP%]{inline-size:.4375rem;block-size:.4375rem;flex:none;border-radius:999px;background:var(--%NS%tui-status-neutral)}.detail__dot[data-status=running][_ngcontent-%COMP%]{background:var(--%NS%tui-status-positive)}.detail__dot[data-status=error][_ngcontent-%COMP%]{background:var(--%NS%tui-status-negative)}.detail__dot[data-status=creating][_ngcontent-%COMP%], .detail__dot[data-status=starting][_ngcontent-%COMP%]{background:var(--%NS%tui-status-warning);animation:_ngcontent-%COMP%_detail-dot-pulse 1.4s ease-in-out infinite}@keyframes _ngcontent-%COMP%_detail-dot-pulse{50%{opacity:.4}}.detail__console[_ngcontent-%COMP%]{--%NS%console-min: clamp(16rem, calc(100dvh - 19rem) , 48rem);--%NS%console-max: clamp(16rem, calc(100dvh - 19rem) , 48rem)}.detail__nav[_ngcontent-%COMP%]{position:fixed;z-index:10;inset-inline:0;inset-block-end:max(env(safe-area-inset-bottom),1.25rem);display:flex;justify-content:center;pointer-events:none}.detail__nav[_ngcontent-%COMP%]   app-glass-segmented[_ngcontent-%COMP%]{pointer-events:auto;inline-size:min(21rem,calc(100vw - 2rem))}@media(min-width:48rem){.detail__nav[_ngcontent-%COMP%]{display:none}}@media(min-width:48rem){.detail__console[_ngcontent-%COMP%]{--%NS%console-min: clamp(18rem, calc(100dvh - 26.5rem) , 48rem);--%NS%console-max: clamp(18rem, calc(100dvh - 26.5rem) , 48rem)}}.detail__card[_ngcontent-%COMP%]{border:1px solid var(--%NS%tui-border-normal);border-radius:var(--%NS%tui-radius-l);background:var(--%NS%tui-background-base);box-shadow:var(--%NS%app-shadow-panel);padding:.875rem 1rem}`,
    ],
  });
};
export { at as TaskDetailPage };
