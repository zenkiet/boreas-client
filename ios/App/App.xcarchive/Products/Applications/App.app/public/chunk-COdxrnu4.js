import {
  $r as px,
  $t as Y,
  B as IR,
  Bn as eg,
  D as GE,
  Dt as Rl,
  Ei as vA,
  Fi as vx,
  Fn as df,
  Gt as VO,
  Ki as yR,
  Kr as ot,
  Kt as Vi,
  L as Hy,
  Lr as mx,
  Nt as SR,
  Qr as pl,
  Sr as kr,
  Ti as v,
  Tn as cC,
  U as Ix,
  Ur as oe,
  Wi as xx,
  Wt as VE,
  Xt as Wo,
  _i as tg,
  b as EJ,
  bt as Px,
  di as sR,
  ei as q,
  et as LK,
  fi as sg,
  ft as Nw,
  gn as aC,
  hr as jE,
  ht as Oa,
  j as H$1,
  jt as Rx,
  k as GQ,
  l as Ax,
  lt as NM,
  m as By,
  na as yx,
  or as hx,
  ri as qQ,
  rt as M9,
  sa as zo,
  vn as ag,
  vt as PI,
  w as FE,
  x as ER,
  xi as uC,
  yi as tr,
  zr as ng,
} from './chunk-CD8PwEax.js';
import { r as H$2 } from './chunk-bRWS10C8.js';
import { l as M, x as rn } from './chunk-C4cee0NY.js';
import { a as Ut, f as qt, r as Ft$1, t as Bt, u as no } from './chunk-PFRT3jyP.js';
function wt(e) {
  return {
    totalTasks: e.total_tasks,
    runningTasks: e.running_tasks,
    stoppedTasks: e.stopped_tasks,
    maxContainers: e.max_containers,
    containerMemoryMb: e.container_memory_mb,
    totalMemoryMb: e.total_memory_mb,
  };
}
var D = class e {
  http = v(Nw);
  config = v(H$2);
  get() {
    return this.http.get(`${this.config.baseUrl()}/api/v1/stats`).pipe(Y(wt));
  }
  static ɵfac = function (t) {
    return new (t || e)();
  };
  static ɵprov = q({ token: e, factory: e.ɵfac, providedIn: `root` });
};
var j = class e {
  taskApi = v(Bt);
  statsApi = v(D);
  snapshot = LK({ stream: () => df({ tasks: this.taskApi.list(), stats: this.statsApi.get() }) });
  current = Oa({
    source: () => (this.snapshot.hasValue() ? this.snapshot.value() : void 0),
    computation: (i, t) => i ?? t?.value,
  });
  tasks = oe(() => this.current()?.tasks ?? []);
  stats = oe(() => this.current()?.stats);
  loading = this.snapshot.isLoading;
  hasLoaded = oe(() => this.current() !== void 0);
  error = oe(() => {
    let i = this.snapshot.error();
    return i ? no(i).message : void 0;
  });
  load() {
    this.snapshot.reload();
  }
  static ɵfac = function (t) {
    return new (t || e)();
  };
  static ɵprov = q({ token: e, factory: e.ɵfac });
};
function Ct(e, i) {
  e & 1 && (tg(0, `div`, 4), jE(1, `div`, 9)(2, `div`, 10), ng());
}
function Tt(e, i) {
  e & 1 &&
    (tg(0, `div`, 8),
    jE(1, `div`, 11),
    tg(2, `div`, 12),
    jE(3, `div`, 13)(4, `div`, 14),
    ng(),
    jE(5, `div`, 15),
    ng());
}
var H = class e {
  overviewRows = [0, 1, 2];
  taskRows = [0, 1, 2];
  static ɵfac = function (t) {
    return new (t || e)();
  };
  static ɵcmp = Vi({
    type: e,
    selectors: [[`app-dashboard-skeleton`]],
    decls: 14,
    vars: 0,
    consts: [
      [
        `role`,
        `status`,
        `aria-live`,
        `polite`,
        `aria-label`,
        `Loading tasks`,
        1,
        `grid`,
        `grid-cols-1`,
        `gap-4`,
      ],
      [1, `skeleton`, `h-10`, `w-full`, `rounded-lg`],
      [1, `skeleton`, `mb-2`, `ms-1`, `h-3`, `w-16`],
      [1, `overflow-hidden`, `rounded-2xl`, `bg-base`],
      [
        1,
        `flex`,
        `items-center`,
        `justify-between`,
        `border-t`,
        `border-border`,
        `px-3.5`,
        `py-3`,
        `first:border-t-0`,
      ],
      [1, `mb-2`, `flex`, `items-center`, `justify-between`, `px-1`],
      [1, `skeleton`, `h-3`, `w-24`],
      [1, `skeleton`, `h-3`, `w-12`],
      [
        1,
        `flex`,
        `items-center`,
        `gap-3`,
        `border-t`,
        `border-border`,
        `px-3.5`,
        `py-2.5`,
        `first:border-t-0`,
      ],
      [1, `skeleton`, `h-3`, `w-20`],
      [1, `skeleton`, `h-3`, `w-14`],
      [1, `skeleton`, `size-2`, `rounded-full`],
      [1, `min-w-0`, `flex-1`],
      [1, `skeleton`, `h-3`, `w-28`],
      [1, `skeleton`, `mt-1.5`, `h-2.5`, `w-44`, `max-w-full`],
      [1, `skeleton`, `h-2.5`, `w-24`],
    ],
    template: function (t, n) {
      (t & 1 &&
        (tg(0, `div`, 0),
        jE(1, `div`, 1),
        tg(2, `div`),
        jE(3, `div`, 2),
        tg(4, `div`, 3),
        vx(5, Ct, 3, 0, `div`, 4, mx),
        ng()(),
        tg(7, `div`)(8, `div`, 5),
        jE(9, `div`, 6)(10, `div`, 7),
        ng(),
        tg(11, `div`, 3),
        vx(12, Tt, 6, 0, `div`, 8, mx),
        ng()()()),
        t & 2 && (vA(5), yx(n.overviewRows), vA(7), yx(n.taskRows)));
    },
    encapsulation: 2,
  });
};
var Mt = [`*`, [[``, `tuiSwipeAction`, ``]]];
var Et = [`*`, `[tuiSwipeAction]`];
var kt = (() => {
  class e {
    constructor() {
      ((this.actionsWidth = H$1(0)), (this.scrolled = H$1(!1)));
    }
    static {
      this.ɵfac = function (n) {
        return new (n || e)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: e,
        selectors: [[`tui-swipe-actions`]],
        hostVars: 4,
        hostBindings: function (n, a) {
          (n & 1 &&
            zo(`scroll.zoneless`, function (d) {
              return a.scrolled.set(d.target.scrollLeft > 0);
            }),
            n & 2 &&
              Wo(`--%NS%t-actions-width`, a.actionsWidth())(
                `overscroll-behavior-x`,
                a.scrolled() ? `contain` : `none`,
              ));
        },
        ngContentSelectors: Et,
        decls: 5,
        vars: 0,
        consts: [
          [`actions`, ``],
          [1, `t-content`],
          [1, `t-actions`, 3, `resize`],
        ],
        template: function (n, a) {
          if (n & 1) {
            let c = Ix();
            (xx(Mt),
              tg(0, `div`, 1),
              Rx(1),
              ng(),
              tg(2, `div`, 2, 0),
              GE(`resize`, function () {
                By(c);
                let Nt = Px(3);
                return Hy(a.actionsWidth.set(Nt.clientWidth));
              }),
              Rx(4, 1),
              ng());
          }
        },
        styles: [
          `[_nghost-%COMP%]{scrollbar-width:none;-ms-overflow-style:none;--%NS%tui-action-gap: 24;--%NS%tui-actions-padding: 0rem;--%NS%tui-item-size: 44;--%NS%t-x: calc(50% + 50% * var(--%NS%tui-inline));display:flex;inline-size:-webkit-fill-available;align-items:center;overflow-x:scroll;overflow-y:hidden;scroll-snap-type:x mandatory;perspective:1px;perspective-origin:calc(var(--%NS%t-x) + var(--%NS%tui-inline) * (calc(1px * var(--%NS%tui-item-size) / 2) + var(--%NS%tui-actions-padding)))}[_nghost-%COMP%]::-webkit-scrollbar, [_nghost-%COMP%]::-webkit-scrollbar-thumb{display:none}.t-content[_ngcontent-%COMP%]{scroll-snap-align:start;flex-shrink:0;inline-size:100%}.t-actions[_ngcontent-%COMP%]{display:flex;gap:calc(1px * var(--%NS%tui-action-gap));padding:0 1.5rem 0 var(--%NS%tui-actions-padding);scroll-snap-align:start;align-items:center;transform-style:preserve-3d;pointer-events:none;transform:translateZ(-.00001px)}.t-actions[_ngcontent-%COMP%]:empty{display:none}  .t-actions>*{pointer-events:auto}  .t-actions>*:nth-child(2){--%NS%t-distance: calc(var(--%NS%tui-item-size) + var(--%NS%tui-action-gap)) * 1 ;--%NS%t-factor: calc((var(--%NS%t-actions-width) - var(--%NS%t-distance)) / var(--%NS%t-actions-width));--%NS%t-scale: calc(1 / var(--%NS%t-factor));--%NS%t-translate: calc(1px * (1 - 1 / var(--%NS%t-factor)));transform:translate3d(calc(calc((-100% * var(--%NS%tui-inline) - calc(1px * var(--%NS%tui-inline) * var(--%NS%tui-action-gap))) * (2 - 1)) / var(--%NS%t-scale)),0,var(--%NS%t-translate));scale:var(--%NS%t-scale)}  .t-actions>*:nth-child(3){--%NS%t-distance: calc(var(--%NS%tui-item-size) + var(--%NS%tui-action-gap)) * 2 ;--%NS%t-factor: calc((var(--%NS%t-actions-width) - var(--%NS%t-distance)) / var(--%NS%t-actions-width));--%NS%t-scale: calc(1 / var(--%NS%t-factor));--%NS%t-translate: calc(1px * (1 - 1 / var(--%NS%t-factor)));transform:translate3d(calc(calc((-100% * var(--%NS%tui-inline) - calc(1px * var(--%NS%tui-inline) * var(--%NS%tui-action-gap))) * (3 - 1)) / var(--%NS%t-scale)),0,var(--%NS%t-translate));scale:var(--%NS%t-scale)}  .t-actions>*:nth-child(4){--%NS%t-distance: calc(var(--%NS%tui-item-size) + var(--%NS%tui-action-gap)) * 3 ;--%NS%t-factor: calc((var(--%NS%t-actions-width) - var(--%NS%t-distance)) / var(--%NS%t-actions-width));--%NS%t-scale: calc(1 / var(--%NS%t-factor));--%NS%t-translate: calc(1px * (1 - 1 / var(--%NS%t-factor)));transform:translate3d(calc(calc((-100% * var(--%NS%tui-inline) - calc(1px * var(--%NS%tui-inline) * var(--%NS%tui-action-gap))) * (4 - 1)) / var(--%NS%t-scale)),0,var(--%NS%t-translate));scale:var(--%NS%t-scale)}  .t-actions>*:nth-child(5){--%NS%t-distance: calc(var(--%NS%tui-item-size) + var(--%NS%tui-action-gap)) * 4 ;--%NS%t-factor: calc((var(--%NS%t-actions-width) - var(--%NS%t-distance)) / var(--%NS%t-actions-width));--%NS%t-scale: calc(1 / var(--%NS%t-factor));--%NS%t-translate: calc(1px * (1 - 1 / var(--%NS%t-factor)));transform:translate3d(calc(calc((-100% * var(--%NS%tui-inline) - calc(1px * var(--%NS%tui-inline) * var(--%NS%tui-action-gap))) * (5 - 1)) / var(--%NS%t-scale)),0,var(--%NS%t-translate));scale:var(--%NS%t-scale)}  .t-actions>*:nth-child(6){--%NS%t-distance: calc(var(--%NS%tui-item-size) + var(--%NS%tui-action-gap)) * 5 ;--%NS%t-factor: calc((var(--%NS%t-actions-width) - var(--%NS%t-distance)) / var(--%NS%t-actions-width));--%NS%t-scale: calc(1 / var(--%NS%t-factor));--%NS%t-translate: calc(1px * (1 - 1 / var(--%NS%t-factor)));transform:translate3d(calc(calc((-100% * var(--%NS%tui-inline) - calc(1px * var(--%NS%tui-inline) * var(--%NS%tui-action-gap))) * (6 - 1)) / var(--%NS%t-scale)),0,var(--%NS%t-translate));scale:var(--%NS%t-scale)}@media(hover:hover)and (pointer:fine){.t-actions[_ngcontent-%COMP%]{display:none}}`,
        ],
      });
    }
  }
  return e;
})();
var ht = (() => {
  class e {
    constructor() {
      ((this.el = qQ()), (this.autoClose = tr(!0)));
    }
    handleEvent(t) {
      this.autoClose() !== !1 &&
        !this.el.contains(GQ(t)) &&
        this.el.scrollTo({ left: 0, behavior: `smooth` });
    }
    static {
      this.ɵfac = function (n) {
        return new (n || e)();
      };
    }
    static {
      this.ɵdir = ot({
        type: e,
        selectors: [[`tui-swipe-actions`, `autoClose`, ``]],
        hostBindings: function (n, a) {
          n & 1 &&
            zo(
              `focusin.zoneless`,
              function (d) {
                return a.handleEvent(d);
              },
              NM,
            )(
              `pointerdown.zoneless`,
              function (d) {
                return a.handleEvent(d);
              },
              NM,
            );
        },
        inputs: { autoClose: [1, `autoClose`] },
      });
    }
  }
  return e;
})();
var Ot = (e) => [`/tasks`, e];
var bt = (e, i) => i.id;
function Dt(e, i) {
  if ((e & 1 && (pl(0, `span`, 11), sR(1), eg()), e & 2)) {
    let t = Ax().$implicit;
    (vA(), aC(t.error));
  }
}
function Pt(e, i) {
  e & 1 && (pl(0, `span`, 12), sR(1, `Environment changes need a recreate`), eg());
}
function At(e, i) {
  if (e & 1) {
    let t = Ix();
    (pl(0, `app-task-menu`, 16),
      zo(`actionRequested`, function (a) {
        By(t);
        return Hy(Ax(3).actionRequested.emit(a));
      }),
      eg());
  }
  if (e & 2) {
    let t = Ax().$implicit,
      n = Ax(2);
    VE(`task`, t)(`accessUrl`, n.accessUrlFor()(t.id))(`pending`, n.pendingTaskIds().has(t.id));
  }
}
function It(e, i) {
  if (e & 1) {
    let t = Ix();
    (pl(0, `li`, 3)(1, `tui-swipe-actions`, 4)(2, `button`, 5),
      zo(`longtap`, function () {
        By(t);
        return Hy(Ax(2).armMenu());
      })(`click`, function (a) {
        let c = By(t).$implicit;
        return Hy(Ax(2).openTask(a, c));
      }),
      Rl(3, `span`, 6),
      pl(4, `span`, 7)(5, `span`, 8),
      sR(6),
      pl(7, `span`, 9),
      sR(8),
      eg()(),
      pl(9, `span`, 10),
      sR(10),
      eg(),
      hx(11, Dt, 2, 1, `span`, 11),
      hx(12, Pt, 2, 0, `span`, 12),
      eg(),
      Rl(13, `tui-icon`, 13),
      FE(14, At, 1, 3, `ng-template`, null, 0, SR),
      eg(),
      pl(16, `button`, 14),
      zo(`click`, function () {
        let a = By(t).$implicit;
        return Hy(Ax(2).requestLifecycle(a));
      }),
      eg(),
      pl(17, `button`, 15),
      zo(`click`, function () {
        let a = By(t).$implicit;
        return Hy(Ax(2).actionRequested.emit({ action: `delete`, task: a }));
      }),
      eg()()());
  }
  if (e & 2) {
    let t = i.$implicit,
      n = Px(15),
      a = Ax(2);
    (vA(2),
      VE(`tuiDropdown`, n),
      vA(),
      kr(`data-status`, t.status),
      vA(3),
      ag(` `, t.id, ` `),
      vA(2),
      ag(`, `, t.status),
      vA(2),
      cC(` Port `, t.port, ` · `, a.environmentCount(t), ` variables `),
      vA(),
      px(t.error ? 11 : -1),
      vA(),
      px(t.pendingRecreate ? 12 : -1),
      vA(4),
      VE(`icon`, t.status === `running` ? `@tui.square` : `@tui.play`)(
        `disabled`,
        a.pendingTaskIds().has(t.id),
      ),
      kr(`aria-label`, t.status === `running` ? `Stop` : `Start`),
      vA(),
      VE(`disabled`, a.pendingTaskIds().has(t.id)));
  }
}
function Lt(e, i) {
  if ((e & 1 && (pl(0, `ul`, 1), vx(1, It, 18, 12, `li`, 3, bt), eg()), e & 2)) {
    let t = Ax();
    (vA(), yx(t.tasks()));
  }
}
function Ft(e, i) {
  if ((e & 1 && (pl(0, `span`, 11), sR(1), eg()), e & 2)) {
    let t = Ax().$implicit;
    (vA(), aC(t.error));
  }
}
function zt(e, i) {
  e & 1 && (pl(0, `span`, 12), sR(1, `Environment changes need a recreate`), eg());
}
function Vt(e, i) {
  if (e & 1) {
    let t = Ix();
    (pl(0, `div`, 18),
      zo(`click`, function (a) {
        let c = By(t).$implicit;
        return Hy(Ax(2).openTask(a, c));
      })(`keydown.enter`, function (a) {
        let c = By(t).$implicit;
        return Hy(Ax(2).openTask(a, c));
      }),
      Rl(1, `span`, 6),
      pl(2, `span`, 7)(3, `a`, 19),
      sR(4),
      pl(5, `span`, 9),
      sR(6),
      eg()(),
      pl(7, `span`, 20),
      sR(8),
      eg(),
      hx(9, Ft, 2, 1, `span`, 11),
      hx(10, zt, 2, 0, `span`, 12),
      eg(),
      pl(11, `span`, 21),
      sR(12),
      ER(13, `date`),
      eg(),
      pl(14, `span`, 22)(15, `app-task-actions`, 16),
      zo(`actionRequested`, function (a) {
        By(t);
        return Hy(Ax(2).actionRequested.emit(a));
      }),
      eg()(),
      Rl(16, `tui-icon`, 13),
      eg());
  }
  if (e & 2) {
    let t = i.$implicit,
      n = Ax(2);
    (sg(`row--busy`, n.pendingTaskIds().has(t.id)),
      vA(),
      kr(`data-status`, t.status),
      vA(2),
      VE(`routerLink`, yR(19, Ot, t.id)),
      vA(),
      ag(` `, t.id, ` `),
      vA(2),
      ag(`, `, t.status),
      vA(),
      kr(`title`, t.image),
      vA(),
      aC(t.image),
      vA(),
      px(t.error ? 9 : -1),
      vA(),
      px(t.pendingRecreate ? 10 : -1),
      vA(2),
      uC(
        ` Port `,
        t.port,
        ` · `,
        n.environmentCount(t),
        ` vars · `,
        t.lastAccessed ? IR(13, 16, t.lastAccessed, `MMM d`) : `never used`,
        ` `,
      ),
      vA(3),
      VE(`task`, t)(`accessUrl`, n.accessUrlFor()(t.id))(`pending`, n.pendingTaskIds().has(t.id)));
  }
}
function Rt(e, i) {
  if ((e & 1 && (pl(0, `div`, 2), vx(1, Vt, 17, 21, `div`, 17, bt), eg()), e & 2)) {
    let t = Ax();
    (vA(), yx(t.tasks()));
  }
}
var $ = class e {
  tasks = tr.required();
  pendingTaskIds = tr.required();
  mobile = tr.required();
  accessUrlFor = tr.required();
  actionRequested = M9();
  taskOpened = M9();
  menuArmed = !1;
  environmentCount(i) {
    return Object.keys(i.env).length;
  }
  armMenu() {
    this.menuArmed = !0;
  }
  requestLifecycle(i) {
    this.actionRequested.emit({ action: i.status === `running` ? `stop` : `start`, task: i });
  }
  openTask(i, t) {
    if (this.menuArmed) {
      this.menuArmed = !1;
      return;
    }
    let n = i.target.closest(`a, button, input`);
    (n && n !== i.currentTarget) || this.taskOpened.emit(t);
  }
  static ɵfac = function (t) {
    return new (t || e)();
  };
  static ɵcmp = Vi({
    type: e,
    selectors: [[`app-task-list`]],
    inputs: {
      tasks: [1, `tasks`],
      pendingTaskIds: [1, `pendingTaskIds`],
      mobile: [1, `mobile`],
      accessUrlFor: [1, `accessUrlFor`],
    },
    outputs: { actionRequested: `actionRequested`, taskOpened: `taskOpened` },
    decls: 2,
    vars: 1,
    consts: [
      [`menu`, ``],
      [`aria-label`, `Boreas tasks`, 1, `m-0`, `list-none`, `p-0`],
      [`role`, `list`, `aria-label`, `Boreas tasks`],
      [1, `row-divider`, `relative`],
      [`autoClose`, ``, 1, `swipe`],
      [
        `type`,
        `button`,
        `tuiDropdownContext`,
        ``,
        1,
        `row`,
        `row--tap`,
        3,
        `longtap`,
        `click`,
        `tuiDropdown`,
      ],
      [`aria-hidden`, `true`, 1, `dot`],
      [1, `min-w-0`, `flex-1`],
      [1, `row__id`],
      [1, `sr-only`],
      [1, `row__sub`, `tabular`],
      [1, `note`, `note--negative`],
      [1, `note`, `note--warning`],
      [`icon`, `@tui.chevron-right`, `aria-hidden`, `true`, 1, `row__chevron`],
      [
        `tuiSwipeAction`,
        ``,
        `appGlassIconButton`,
        ``,
        `type`,
        `button`,
        3,
        `click`,
        `icon`,
        `disabled`,
      ],
      [
        `tuiSwipeAction`,
        ``,
        `appGlassIconButton`,
        ``,
        `icon`,
        `@tui.trash-2`,
        `tone`,
        `negative`,
        `type`,
        `button`,
        `aria-label`,
        `Delete`,
        3,
        `click`,
        `disabled`,
      ],
      [3, `actionRequested`, `task`, `accessUrl`, `pending`],
      [`role`, `listitem`, 1, `row`, `row--pointer`, `row-divider`, `relative`, 3, `row--busy`],
      [
        `role`,
        `listitem`,
        1,
        `row`,
        `row--pointer`,
        `row-divider`,
        `relative`,
        3,
        `click`,
        `keydown.enter`,
      ],
      [1, `row__id`, `row__id--link`, 3, `routerLink`],
      [1, `row__sub`],
      [1, `row__meta`, `tabular`],
      [1, `row__actions`],
    ],
    template: function (t, n) {
      (t & 1 && hx(0, Lt, 3, 0, `ul`, 1)(1, Rt, 3, 0, `div`, 2), t & 2 && px(n.mobile() ? 0 : 1));
    },
    dependencies: [Ut, PI, qt, Ft$1, M, rn, EJ, kt, ht, VO],
    styles: [
      `.swipe[_ngcontent-%COMP%]{--%NS%tui-action-gap: 10}.row[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem;padding:.6875rem 1rem;min-block-size:3.75rem;text-decoration:none;transition:background-color var(--%NS%tui-duration)}.row--tap[_ngcontent-%COMP%]{inline-size:100%;margin:0;border:0;background:none;font:inherit;color:inherit;text-align:start;-webkit-tap-highlight-color:transparent}.row--%NS%tap[_ngcontent-%COMP%]:active, .row--%NS%pointer[_ngcontent-%COMP%]:hover{background:var(--%NS%tui-background-neutral-1)}.row--pointer[_ngcontent-%COMP%]{cursor:pointer}.dot[_ngcontent-%COMP%]{inline-size:.4375rem;block-size:.4375rem;flex:none;border-radius:999px;background:var(--%NS%tui-status-neutral)}.dot[data-status=running][_ngcontent-%COMP%]{background:var(--%NS%tui-status-positive)}.dot[data-status=error][_ngcontent-%COMP%]{background:var(--%NS%tui-status-negative)}.dot[data-status=creating][_ngcontent-%COMP%], .dot[data-status=starting][_ngcontent-%COMP%]{background:var(--%NS%tui-status-warning);animation:_ngcontent-%COMP%_dot-pulse 1.4s ease-in-out infinite}@keyframes _ngcontent-%COMP%_dot-pulse{50%{opacity:.4}}.row__id[_ngcontent-%COMP%]{display:block;overflow:hidden;font-family:var(--%NS%app-font-mono);font-size:1.0625rem;font-weight:600;color:var(--%NS%tui-text-primary);text-overflow:ellipsis;white-space:nowrap;text-decoration:none}.row__id--%NS%link[_ngcontent-%COMP%]:hover{color:var(--%NS%tui-text-action)}.row__sub[_ngcontent-%COMP%]{display:block;overflow:hidden;font-family:var(--%NS%app-font-mono);font-size:.9375rem;line-height:1.5;color:var(--%NS%tui-text-tertiary);text-overflow:ellipsis;white-space:nowrap}.note[_ngcontent-%COMP%]{display:block;font-size:.8125rem;line-height:1.4}.note--negative[_ngcontent-%COMP%]{color:var(--%NS%tui-status-negative)}.note--warning[_ngcontent-%COMP%]{color:var(--%NS%tui-status-warning)}.row__meta[_ngcontent-%COMP%]{font-size:.8125rem;color:var(--%NS%tui-text-tertiary);white-space:nowrap}.row__actions[_ngcontent-%COMP%]{display:none}.row--%NS%pointer[_ngcontent-%COMP%]:hover   .row__meta[_ngcontent-%COMP%], .row--%NS%pointer[_ngcontent-%COMP%]:focus-within   .row__meta[_ngcontent-%COMP%], .row--busy[_ngcontent-%COMP%]   .row__meta[_ngcontent-%COMP%]{display:none}.row--%NS%pointer[_ngcontent-%COMP%]:hover   .row__actions[_ngcontent-%COMP%], .row--%NS%pointer[_ngcontent-%COMP%]:focus-within   .row__actions[_ngcontent-%COMP%], .row--busy[_ngcontent-%COMP%]   .row__actions[_ngcontent-%COMP%]{display:flex}.row__chevron[_ngcontent-%COMP%]{flex:none;font-size:.9375rem;color:var(--%NS%tui-text-tertiary)}`,
    ],
  });
};
export { j as i, D as n, H as r, $ as t };
