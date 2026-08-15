import {
  Bn as eg,
  Dt as Rl,
  Ei as vA,
  Fr as mn,
  Kn as fc,
  Kr as ot,
  Kt as Vi,
  Pn as db,
  Qr as pl,
  Sr as kr,
  Ti as v,
  Ur as oe,
  Vn as et,
  Wi as xx,
  Wt as VE,
  Xt as Wo,
  b as EJ,
  br as k,
  dt as Na,
  ei as q$1,
  fr as it,
  g as Ca,
  i as A1,
  jt as Rx,
  qn as ff,
  ri as qQ,
  y as E,
  yi as tr,
} from './chunk-CD8PwEax.js';
var L = [`*`];
var U = {
  info: `@tui.info`,
  positive: `@tui.circle-check`,
  warning: `@tui.triangle-alert`,
  negative: `@tui.circle-alert`,
};
var W = class e {
  tone = tr(`info`);
  size = tr(`m`);
  icon = tr(``);
  defaultIcon = oe(() => U[this.tone()]);
  static ɵfac = function (t) {
    return new (t || e)();
  };
  static ɵcmp = Vi({
    type: e,
    selectors: [[`app-callout`]],
    hostAttrs: [1, `block`],
    inputs: { tone: [1, `tone`], size: [1, `size`], icon: [1, `icon`] },
    ngContentSelectors: L,
    decls: 4,
    vars: 3,
    consts: [
      [1, `callout`],
      [`aria-hidden`, `true`, 1, `callout__icon`, `icon-sm`, 3, `icon`],
      [1, `callout__body`],
    ],
    template: function (t, a) {
      (t & 1 && (xx(), pl(0, `div`, 0), Rl(1, `tui-icon`, 1), pl(2, `div`, 2), Rx(3), eg()()),
        t & 2 &&
          (kr(`data-tone`, a.tone())(`data-size`, a.size()),
          vA(),
          VE(`icon`, a.icon() || a.defaultIcon())));
    },
    dependencies: [EJ],
    styles: [
      `.callout[_ngcontent-%COMP%]{display:flex;align-items:flex-start;gap:.5rem;padding:.6875rem .875rem;border:1px solid transparent;border-radius:var(--%NS%tui-radius-m);font-size:.9375rem;line-height:1.45}.callout[data-size=s][_ngcontent-%COMP%]{padding:.5rem .625rem;font-size:.8125rem}.callout__icon[_ngcontent-%COMP%]{margin-block-start:.0625rem;flex-shrink:0}.callout__body[_ngcontent-%COMP%]{min-inline-size:0}.callout[data-tone=info][_ngcontent-%COMP%]{border-color:var(--%NS%tui-status-info-pale-hover);background:var(--%NS%tui-status-info-pale);color:var(--%NS%tui-status-info)}.callout[data-tone=positive][_ngcontent-%COMP%]{border-color:var(--%NS%tui-status-positive-pale-hover);background:var(--%NS%tui-status-positive-pale);color:var(--%NS%tui-status-positive)}.callout[data-tone=warning][_ngcontent-%COMP%]{border-color:var(--%NS%tui-status-warning-pale-hover);background:var(--%NS%tui-status-warning-pale);color:var(--%NS%tui-status-warning)}.callout[data-tone=negative][_ngcontent-%COMP%]{border-color:var(--%NS%tui-status-negative-pale-hover);background:var(--%NS%tui-status-negative-pale);color:var(--%NS%tui-status-negative)}`,
    ],
  });
};
var H =
  typeof MutationObserver > `u`
    ? class {
        observe() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      }
    : MutationObserver;
var N = new E(``);
var g = (() => {
  class e extends k {
    constructor() {
      let t = v(it).nativeElement,
        a = v(N);
      super((i) => {
        let n = new H((s) => {
          i.next(s);
        });
        return (
          n.observe(t, a),
          () => {
            n.disconnect();
          }
        );
      });
    }
    static ɵfac = function (a) {
      return new (a || e)();
    };
    static ɵprov = q$1({ token: e, factory: e.ɵfac });
  }
  return e;
})();
var Z =
  typeof ResizeObserver > `u`
    ? class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    : ResizeObserver;
var X = `content-box`;
var q = new E(``, { factory: () => X });
var h = (() => {
  class e extends k {
    constructor() {
      let t = v(it).nativeElement,
        a = v(q);
      super((i) => {
        let n = new Z((s) => i.next(s));
        return (
          n.observe(t, { box: a }),
          () => {
            n.disconnect();
          }
        );
      });
    }
    static ɵfac = function (a) {
      return new (a || e)();
    };
    static ɵprov = q$1({ token: e, factory: e.ɵfac });
  }
  return e;
})();
var w = 1;
var G = (() => {
  class e {
    static {
      this.ɵfac = function (a) {
        return new (a || e)();
      };
    }
    static {
      this.ɵcmp = Vi({
        type: e,
        selectors: [[`ng-component`]],
        exportAs: [`tui-fade-5.19.0`],
        decls: 0,
        vars: 0,
        template: function (a, i) {},
        styles: [
          `[tuiFade]:where(*[data-tui-version="5.19.0"]){scrollbar-width:none;-ms-overflow-style:none;transition-property:mask-position;transition-duration:var(--%NS%tui-duration, .3s);transition-timing-function:var(--%NS%tui-curve-productive-standard);overflow:auto;text-overflow:unset!important;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}[tuiFade]:where(*[data-tui-version="5.19.0"])::-webkit-scrollbar,[tuiFade]:where(*[data-tui-version="5.19.0"])::-webkit-scrollbar-thumb{display:none}[tuiFade]:where(*[data-tui-version="5.19.0"]):not([data-orientation=vertical]){overflow-y:hidden;-webkit-mask-image:linear-gradient(to right,transparent var(--%NS%t-fade-offset),#000 calc(var(--%NS%t-fade-size) + var(--%NS%t-fade-offset))),linear-gradient(to left,transparent var(--%NS%t-fade-offset),#000 calc(var(--%NS%t-fade-size) + var(--%NS%t-fade-offset))),linear-gradient(#000,#000);mask-image:linear-gradient(to right,transparent var(--%NS%t-fade-offset),#000 calc(var(--%NS%t-fade-size) + var(--%NS%t-fade-offset))),linear-gradient(to left,transparent var(--%NS%t-fade-offset),#000 calc(var(--%NS%t-fade-size) + var(--%NS%t-fade-offset))),linear-gradient(#000,#000);-webkit-mask-position:calc(-1 * var(--%NS%t-fade-size) - var(--%NS%t-fade-offset) + 1px) bottom,calc(100% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset) - 1px) bottom,top;mask-position:calc(-1 * var(--%NS%t-fade-size) - var(--%NS%t-fade-offset) + 1px) bottom,calc(100% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset) - 1px) bottom,top;-webkit-mask-size:calc(51% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset)) var(--%NS%t-line-height, 100%),calc(50% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset)) var(--%NS%t-line-height, 100%),100% calc(100% - var(--%NS%t-line-height, 100%));mask-size:calc(51% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset)) var(--%NS%t-line-height, 100%),calc(50% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset)) var(--%NS%t-line-height, 100%),100% calc(100% - var(--%NS%t-line-height, 100%))}[tuiFade]:where(*[data-tui-version="5.19.0"]):not([data-orientation=vertical])._start{-webkit-mask-position:left bottom,calc(100% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset) - 1px) bottom,top;mask-position:left bottom,calc(100% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset) - 1px) bottom,top}[tuiFade]:where(*[data-tui-version="5.19.0"]):not([data-orientation=vertical])._end{-webkit-mask-position:calc(-1 * var(--%NS%t-fade-size) - var(--%NS%t-fade-offset) + 1px) bottom,right bottom,top;mask-position:calc(-1 * var(--%NS%t-fade-size) - var(--%NS%t-fade-offset) + 1px) bottom,right bottom,top}[tuiFade]:where(*[data-tui-version="5.19.0"]):not([data-orientation=vertical])._start._end{-webkit-mask-position:left bottom,right bottom,top;mask-position:left bottom,right bottom,top}[dir=rtl] [tuiFade]:where(*[data-tui-version="5.19.0"]):not([data-orientation=vertical])._end{-webkit-mask-position:left bottom,calc(100% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset) - 1px) bottom,top;mask-position:left bottom,calc(100% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset) - 1px) bottom,top}[dir=rtl] [tuiFade]:where(*[data-tui-version="5.19.0"]):not([data-orientation=vertical])._start{-webkit-mask-position:calc(-1 * var(--%NS%t-fade-size) - var(--%NS%t-fade-offset) + 1px) bottom,right bottom,top;mask-position:calc(-1 * var(--%NS%t-fade-size) - var(--%NS%t-fade-offset) + 1px) bottom,right bottom,top}[dir=rtl] [tuiFade]:where(*[data-tui-version="5.19.0"]):not([data-orientation=vertical])._start._end{-webkit-mask-position:left bottom,right bottom,top;mask-position:left bottom,right bottom,top}[tuiFade]:where(*[data-tui-version="5.19.0"])[data-orientation=vertical]{overflow-x:hidden;-webkit-mask-image:linear-gradient(to bottom,transparent var(--%NS%t-fade-offset),#000 calc(var(--%NS%t-fade-size) + var(--%NS%t-fade-offset))),linear-gradient(to top,transparent var(--%NS%t-fade-offset),#000 calc(var(--%NS%t-fade-size) + var(--%NS%t-fade-offset)));mask-image:linear-gradient(to bottom,transparent var(--%NS%t-fade-offset),#000 calc(var(--%NS%t-fade-size) + var(--%NS%t-fade-offset))),linear-gradient(to top,transparent var(--%NS%t-fade-offset),#000 calc(var(--%NS%t-fade-size) + var(--%NS%t-fade-offset)));-webkit-mask-position:left calc(-1 * var(--%NS%t-fade-size) - var(--%NS%t-fade-offset) + 1px),left calc(100% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset) - 1px);mask-position:left calc(-1 * var(--%NS%t-fade-size) - var(--%NS%t-fade-offset) + 1px),left calc(100% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset) - 1px);-webkit-mask-size:100% calc(51% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset));mask-size:100% calc(51% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset))}[tuiFade]:where(*[data-tui-version="5.19.0"])[data-orientation=vertical]._start{-webkit-mask-position:left top,left calc(100% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset) - 1px);mask-position:left top,left calc(100% + var(--%NS%t-fade-size) + var(--%NS%t-fade-offset) - 1px)}[tuiFade]:where(*[data-tui-version="5.19.0"])[data-orientation=vertical]._end{-webkit-mask-position:left calc(-1 * var(--%NS%t-fade-size) - var(--%NS%t-fade-offset) + 1px),left bottom;mask-position:left calc(-1 * var(--%NS%t-fade-size) - var(--%NS%t-fade-offset) + 1px),left bottom}[tuiFade]:where(*[data-tui-version="5.19.0"])[data-orientation=vertical]._start._end{-webkit-mask-position:left top,left bottom;mask-position:left top,left bottom}
`,
        ],
        encapsulation: 2,
      });
    }
  }
  return e;
})();
var Ft = (() => {
  class e {
    constructor() {
      ((this.nothing = db(G)),
        (this.lineHeight = tr(null, { alias: `tuiFadeHeight` })),
        (this.size = tr(`1.5em`, { alias: `tuiFadeSize` })),
        (this.offset = tr(`0em`, { alias: `tuiFadeOffset` })),
        (this.orientation = tr(`horizontal`, { alias: `tuiFade` })));
      let t = qQ();
      (Ca(() => t.style.setProperty(`transition`, ``)),
        ff(v(h, { self: !0 }), v(g, { self: !0 }), mn(t, `scroll`))
          .pipe(
            et(() => !!t.scrollWidth),
            A1(),
            fc(),
          )
          .subscribe(() => {
            (t.classList.toggle(`_end`, this.isEnd(t)),
              t.classList.toggle(
                `_start`,
                !!Math.floor(t.scrollLeft) || !!Math.floor(t.scrollTop),
              ));
          }));
    }
    isEnd({
      scrollTop: t,
      scrollLeft: a,
      scrollHeight: i,
      scrollWidth: n,
      clientHeight: s,
      clientWidth: j,
    }) {
      return this.orientation() === `vertical`
        ? Math.round(t) < i - s - w
        : Math.ceil(Math.abs(a)) < n - j - w || i > s + 4 * w;
    }
    static {
      this.ɵfac = function (a) {
        return new (a || e)();
      };
    }
    static {
      this.ɵdir = ot({
        type: e,
        selectors: [[``, `tuiFade`, ``]],
        hostAttrs: [`data-tui-version`, `5.19.0`],
        hostVars: 11,
        hostBindings: function (a, i) {
          a & 2 &&
            (kr(`data-orientation`, i.orientation()),
            Wo(`--%NS%t-fade-offset`, i.offset())(`--%NS%t-fade-size`, i.size())(
              `--%NS%t-line-height`,
              i.lineHeight(),
            )(`line-height`, i.lineHeight())(`transition`, `none`));
        },
        inputs: {
          lineHeight: [1, `tuiFadeHeight`, `lineHeight`],
          size: [1, `tuiFadeSize`, `size`],
          offset: [1, `tuiFadeOffset`, `offset`],
          orientation: [1, `tuiFade`, `orientation`],
        },
        features: [Na([h, g, { provide: N, useValue: { characterData: !0, subtree: !0 } }])],
      });
    }
  }
  return e;
})();
export { h as a, g as i, N as n, W as r, Ft as t };
