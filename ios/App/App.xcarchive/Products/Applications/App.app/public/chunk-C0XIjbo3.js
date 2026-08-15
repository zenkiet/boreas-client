import {
  Bn as eg,
  Dt as Rl,
  Ei as vA,
  Fi as vx,
  Kt as Vi,
  Qr as pl,
  Ti as v,
  Ur as oe,
  Wt as VE,
  di as sR,
  gn as aC,
  na as yx,
  sa as zo,
  vn as ag,
  vt as PI,
} from './chunk-CD8PwEax.js';
import { i as It, r as H } from './chunk-bRWS10C8.js';
import { n as c$1, t as R } from './main-YU6HVKXZ.js';
import { t as v$1 } from './chunk-thr6BV2C.js';
import { t as b } from './chunk-BSF489_Y.js';
import { t as u } from './chunk-nkCGMQ89.js';
var D = (r, e) => e.label;
function E(r, e) {
  if (
    (r & 1 && (pl(0, `div`, 10)(1, `dt`, 11), sR(2), eg(), pl(3, `dd`, 12), sR(4), eg()()), r & 2)
  ) {
    let t = e.$implicit;
    (vA(2), aC(t.label), vA(2), aC(t.value));
  }
}
var c = [
  { mode: `system`, label: `System`, icon: `@tui.monitor` },
  { mode: `light`, label: `Light`, icon: `@tui.sun` },
  { mode: `dark`, label: `Dark`, icon: `@tui.moon` },
];
var P = [
  { label: `Frontend`, value: `Angular 22 · Signal Forms` },
  { label: `Interface`, value: `Taiga UI 5 · Tailwind CSS 4` },
  { label: `Typography`, value: `System · JetBrains Mono` },
  { label: `Navigation`, value: `Liquid Glass dock on touch devices` },
];
var w = class r {
  theme = v(c$1);
  config = v(H);
  serverUrl = oe(() => this.config.baseUrl());
  about = P;
  themeItems = c.map((e) => ({ label: e.label, icon: e.icon }));
  themeIndex = oe(() =>
    Math.max(
      0,
      c.findIndex((e) => e.mode === this.theme.mode()),
    ),
  );
  themeHint = oe(() => {
    let e = this.theme.mode();
    return e === `system`
      ? `Following your device appearance, currently ${this.theme.theme()}.`
      : `Using the ${e} appearance on this device.`;
  });
  setThemeByIndex(e) {
    let t = c[e];
    t && this.theme.setMode(t.mode);
  }
  static ɵfac = function (t) {
    return new (t || r)();
  };
  static ɵcmp = Vi({
    type: r,
    selectors: [[`app-settings-page`]],
    decls: 14,
    vars: 4,
    consts: [
      [
        `appReveal`,
        ``,
        1,
        `mx-auto`,
        `grid`,
        `max-w-[44rem]`,
        `grid-cols-1`,
        `gap-3.5`,
        `md:gap-4`,
      ],
      [`title`, `Settings`],
      [`heading`, `Appearance`, 3, `description`],
      [3, `activeIndexChange`, `items`, `activeIndex`],
      [
        `heading`,
        `Server`,
        `description`,
        `The Boreas API this device talks to. Changing it re-runs the connection check.`,
      ],
      [1, `flex`, `flex-wrap`, `items-center`, `justify-between`, `gap-3`],
      [1, `min-w-0`, `break-all`, `font-mono`, `text-[0.9375rem]`, `text-secondary`],
      [`tuiButton`, ``, `routerLink`, `/welcome/connect`, `size`, `s`, `appearance`, `secondary`],
      [`heading`, `About Boreas`],
      [1, `m-0`, `grid`, `divide-y`, `divide-border`, `text-[0.9375rem]`],
      [1, `flex`, `flex-wrap`, `justify-between`, `gap-x-4`, `py-2.5`, `first:pt-0`, `last:pb-0`],
      [1, `font-medium`, `text-primary`],
      [1, `m-0`, `text-secondary`],
    ],
    template: function (t, o) {
      (t & 1 &&
        (pl(0, `div`, 0),
        Rl(1, `app-page-header`, 1),
        pl(2, `app-panel`, 2)(3, `app-glass-segmented`, 3),
        zo(`activeIndexChange`, function (k) {
          return o.setThemeByIndex(k);
        }),
        eg()(),
        pl(4, `app-panel`, 4)(5, `div`, 5)(6, `span`, 6),
        sR(7),
        eg(),
        pl(8, `a`, 7),
        sR(9, ` Change server `),
        eg()()(),
        pl(10, `app-panel`, 8)(11, `dl`, 9),
        vx(12, E, 5, 2, `div`, 10, D),
        eg()()()),
        t & 2 &&
          (vA(2),
          VE(`description`, o.themeHint()),
          vA(),
          VE(`items`, o.themeItems)(`activeIndex`, o.themeIndex()),
          vA(4),
          ag(` `, o.serverUrl(), ` `),
          vA(5),
          yx(o.about)));
    },
    dependencies: [R, u, b, v$1, PI, It],
    encapsulation: 2,
  });
};
export { w as SettingsPage };
