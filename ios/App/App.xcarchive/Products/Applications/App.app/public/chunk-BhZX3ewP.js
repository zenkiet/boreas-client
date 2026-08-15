import {
  $r as px,
  $t as Y,
  Bn as eg,
  Ci as ue,
  Cr as kx,
  Dt as Rl,
  Ei as vA,
  Fi as vx,
  K as Jc,
  Kn as fc,
  Kt as Vi,
  L as Hy,
  Lr as mx,
  Mt as SM,
  Qr as pl,
  Rt as Ta,
  Sr as kr,
  Ti as v,
  U as Ix,
  V as IX,
  Vn as et,
  Wt as VE,
  Xt as Wo,
  Yi as ya,
  Yr as pb,
  an as ZE,
  ci as rg,
  di as sR,
  dr as ig,
  dt as Na,
  ei as q,
  fi as sg,
  fr as it,
  ir as hb,
  l as Ax,
  lt as NM,
  m as By,
  na as yx,
  nt as M1,
  or as hx,
  qn as ff,
  ra as z,
  ri as qQ,
  rn as Yv,
  rr as hX,
  sa as zo,
  ta as yt$1,
  vn as ag,
  w as FE,
  zi as x9,
} from './chunk-CD8PwEax.js';
import { i as It } from './chunk-bRWS10C8.js';
import {
  C as ae,
  T as ei,
  _ as Nn,
  a as Ai,
  c as ht,
  o as Qe,
  p as Ei,
  r as l,
  x as Yt,
} from './main-YU6HVKXZ.js';
var ft = [`stops`];
function vt(t, s) {
  if ((t & 1 && Rl(0, `div`, 8, 0), t & 2)) {
    let e = s.$implicit;
    Wo(`margin-block-start`, e);
  }
}
function _t(t, s) {
  if ((t & 1 && Rl(0, `header`, 6), t & 2)) {
    let e = Ax();
    VE(`id`, e.context.id)(`innerHTML`, e.context.label, SM);
  }
}
function bt(t, s) {
  if (t & 1) {
    let e = Ix();
    (pl(0, `footer`)(1, `button`, 10),
      zo(`click`, function () {
        By(e);
        return Hy(Ax(2).context.$implicit.complete());
      }),
      sR(2),
      eg()());
  }
  if (t & 2) {
    let e = Ax(2);
    (vA(2), ag(` `, e.context.data || `OK`, ` `));
  }
}
function Ct(t, s) {
  if ((t & 1 && (rg(0), Rl(1, `div`, 9), hx(2, bt, 3, 1, `footer`), ig()), t & 2)) {
    let e = s.polymorpheusOutlet,
      i = Ax();
    (vA(), VE(`innerHTML`, e, SM), vA(), px(i.context.closable ? 2 : -1));
  }
}
var xt = new Error(``),
  yt = (() => {
    class t {
      constructor() {
        ((this.stops = x9(`stops`, { read: it })),
          (this.el = qQ()),
          (this.pointers = 0),
          (this.context = Nn()),
          (this.close$ = new ue()),
          (this.$ = ff(this.close$, IX(), v(ht).pipe(Y(hX)))
            .pipe(
              M1(),
              Yv(() =>
                Jc(this.context.closable)
                  ? (this.el.scrollTop <= 0 &&
                      this.el.scrollTo({ top: this.initial, behavior: `smooth` }),
                    this.context.closable.pipe(yt$1(1)))
                  : z(this.context.closable),
              ),
              et(Boolean),
              fc(),
            )
            .subscribe(() => this.close())));
      }
      ngAfterViewInit() {
        this.el.scrollTop = this.initial || 0;
      }
      onPointerChange(e) {
        ((this.pointers = Math.max(this.pointers + e, 0)),
          !this.pointers && this.el.scrollTop <= 0 && this.close$.next());
      }
      get initial() {
        return this.context.closable
          ? this.stops()
              .map((e) => e.nativeElement.offsetTop - this.context.offset)
              .concat(this.el.clientHeight ?? Infinity)[this.context.initial]
          : 0;
      }
      close() {
        this.context.required
          ? this.context.$implicit.error(xt)
          : this.context.$implicit.complete();
      }
      static {
        this.ɵfac = function (i) {
          return new (i || t)();
        };
      }
      static {
        this.ɵcmp = Vi({
          type: t,
          selectors: [[`tui-sheet-dialog`]],
          viewQuery: function (i, o) {
            (i & 1 && ZE(o.stops, ft, 5, it), i & 2 && kx());
          },
          hostVars: 7,
          hostBindings: function (i, o) {
            (i & 1 &&
              zo(`click.self`, function () {
                return o.close$.next();
              })(
                `touchcancel.zoneless`,
                function () {
                  return o.onPointerChange(-1);
                },
                NM,
              )(
                `touchend.zoneless`,
                function () {
                  return o.onPointerChange(-1);
                },
                NM,
              )(
                `touchstart.passive.zoneless`,
                function () {
                  return o.onPointerChange(1);
                },
                NM,
              )(`scroll.zoneless`, function () {
                return o.onPointerChange(0);
              }),
              i & 2 &&
                (kr(`data-appearance`, o.context.appearance),
                Wo(`--%NS%tui-offset`, o.context.offset, `px`),
                sg(`_bar`, o.context.bar)(`_closeable`, o.context.closable)));
          },
          features: [Na([pb(ae, it)]), Ta([ei])],
          decls: 8,
          vars: 3,
          consts: [
            [`stops`, ``],
            [1, `t-stops`],
            [1, `t-stop`, 3, `margin-block-start`],
            [1, `t-sheet`],
            [1, `t-bar`],
            [1, `t-content`],
            [3, `id`, `innerHTML`],
            [4, `polymorpheusOutlet`, `polymorpheusOutletContext`],
            [1, `t-stop`],
            [3, `innerHTML`],
            [`tuiButton`, ``, `type`, `button`, 3, `click`],
          ],
          template: function (i, o) {
            (i & 1 &&
              (pl(0, `div`, 1),
              vx(1, vt, 2, 2, `div`, 2, mx),
              eg(),
              pl(3, `div`, 3),
              Rl(4, `div`, 4),
              pl(5, `div`, 5),
              hx(6, _t, 1, 2, `header`, 6),
              FE(7, Ct, 3, 2, `ng-container`, 7),
              eg()()),
              i & 2 &&
                (vA(),
                yx(o.context.stops),
                vA(5),
                px(o.context.label ? 6 : -1),
                vA(),
                VE(`polymorpheusOutlet`, o.context.content)(
                  `polymorpheusOutletContext`,
                  o.context,
                )));
          },
          dependencies: [Yt, It],
          styles: [
            `[_nghost-%COMP%]{scrollbar-width:none;-ms-overflow-style:none;position:sticky;display:flex;inset-inline-start:0;inline-size:100%;max-inline-size:40rem;block-size:calc(100% - max(var(--%NS%tui-offset),env(safe-area-inset-top)));flex-direction:column;font:var(--%NS%tui-typography-body-m);overflow-y:scroll;overscroll-behavior:none;scroll-snap-type:y mandatory;margin:max(var(--%NS%tui-offset),env(safe-area-inset-top)) auto 0;border-radius:.75rem .75rem 0 0;box-shadow:0 5rem var(--%NS%tui-background-elevation-1);--%NS%t-top: 0}[_nghost-%COMP%]::-webkit-scrollbar, [_nghost-%COMP%]::-webkit-scrollbar-thumb{display:none}@supports (-webkit-touch-callout: none){[_nghost-%COMP%]{overscroll-behavior:contain}}.tui-enter[_nghost-%COMP%], .tui-leave[_nghost-%COMP%]{animation-name:tuiSlide;animation-timing-function:var(--%NS%tui-curve-expressive-exit)}.tui-enter[_nghost-%COMP%]{animation-duration:calc(var(--%NS%tui-duration) / .6);animation-timing-function:var(--%NS%tui-curve-expressive-entrance)}[_nghost-%COMP%]:before{position:fixed;inset-block-start:0;inset-inline-start:0;inline-size:100%;block-size:100%;content:"";z-index:-1}._bar[_nghost-%COMP%]{--%NS%t-top: 1.5rem}._bar[_nghost-%COMP%]   .t-bar[_ngcontent-%COMP%]{display:block}._closeable[_nghost-%COMP%]{display:block}._closeable[_nghost-%COMP%]   .t-stops[_ngcontent-%COMP%]{display:flex}[data-appearance~=fullscreen][_nghost-%COMP%]{display:block}[data-appearance~=fullscreen][_nghost-%COMP%]   .t-sheet[_ngcontent-%COMP%]{min-block-size:100%}[_nghost-%COMP%]     tui-data-list[data-size]{padding:0}[_nghost-%COMP%]     tui-data-list[data-size] [tuiOption][data-size]{box-sizing:content-box;margin-inline:-.5rem;padding-inline:.5rem}.t-stops[_ngcontent-%COMP%]{display:none;block-size:100%;scroll-snap-stop:always;scroll-snap-align:start;pointer-events:none}.t-stop[_ngcontent-%COMP%]{position:relative;inset-block-start:env(safe-area-inset-bottom);scroll-snap-stop:normal;scroll-snap-align:start;block-size:1rem;inline-size:1rem}.t-sheet[_ngcontent-%COMP%]{display:flex;inline-size:100%;flex-direction:column;box-shadow:var(--%NS%tui-shadow-small);border-radius:inherit;padding:0 1rem;margin-block-start:auto;background:var(--%NS%tui-background-elevation-1);box-sizing:border-box;scroll-snap-stop:always;scroll-snap-align:start}.t-bar[_ngcontent-%COMP%]{position:sticky;z-index:1;display:none;inset-block-start:0;block-size:1.5rem;margin:0 -1rem;border-radius:inherit;background:var(--%NS%tui-background-elevation-1)}.t-bar[_ngcontent-%COMP%]:after{position:absolute;left:50%;transform:translate(-50%);content:"";inset-block-start:.5rem;inline-size:2rem;block-size:.25rem;background:var(--%NS%tui-border-normal);border-radius:1rem}.t-content[_ngcontent-%COMP%]{position:relative;display:flex;flex-direction:column;flex-grow:1;border-radius:inherit;isolation:isolate;padding-block-end:max(1.5rem,env(safe-area-inset-bottom))}.t-content[_ngcontent-%COMP%]:after{content:"";position:relative;z-index:-1;display:block;inset-block-start:max(1.5rem,env(safe-area-inset-bottom));scroll-snap-stop:always;scroll-snap-align:end;border-image:conic-gradient(var(--%NS%tui-background-elevation-1) 0 0) fill 0/0/0 100vh 100vh}*[_ngcontent-%COMP%]    >header, *[_ngcontent-%COMP%]    >[tuiSlides]>*>header, *[_ngcontent-%COMP%]    >ng-component>header, *[_ngcontent-%COMP%]    >ng-component>[tuiSlides]>*>header{position:sticky;z-index:1;inset-block-start:var(--%NS%t-top);margin:0 -1rem;padding:.75rem 1rem;border-radius:inherit;background:var(--%NS%tui-background-elevation-1);font:var(--%NS%tui-typography-heading-h6)}*[_ngcontent-%COMP%]    >footer:not([tuiFloatingContainer]), *[_ngcontent-%COMP%]    >[tuiSlides]>*>footer:not([tuiFloatingContainer]), *[_ngcontent-%COMP%]    >ng-component>footer:not([tuiFloatingContainer]), *[_ngcontent-%COMP%]    >ng-component>[tuiSlides]>*>footer:not([tuiFloatingContainer]){display:flex;flex-direction:column-reverse;gap:.5rem;margin-block-start:1rem}`,
          ],
        });
      }
    }
    return t;
  })(),
  [Dt, Vt] = hb({
    label: ``,
    appearance: ``,
    stops: [],
    initial: 0,
    offset: 16,
    closable: !0,
    data: void 0,
    bar: !0,
    required: !1,
  }),
  Ot = `#404040`,
  dt = (() => {
    class t extends Qe {
      constructor() {
        (super(...arguments),
          (this.theme = v(l)),
          (this.initial = this.theme.color),
          (this.count = 0),
          (this.options = v(Dt)),
          (this.content = yt));
      }
      add(e) {
        (this.count++, (this.theme.color = Ot));
        let i = super.add(e);
        return () => {
          (i(), this.count--, this.count || (this.theme.color = this.initial));
        };
      }
      static {
        this.ɵfac = (() => {
          let e;
          return function (o) {
            return (e || (e = ya(t)))(o || t);
          };
        })();
      }
      static {
        this.ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
      }
    }
    return t;
  })();
var Xt = (() => {
  class t {
    constructor() {
      ((this.isMobile = v(Ei)), (this.dialogs = v(Ai)), (this.sheets = v(dt)));
    }
    open(e, i = {}) {
      return this.isMobile ? this.sheets.open(e, i) : this.dialogs.open(e, i);
    }
    static {
      this.ɵfac = function (i) {
        return new (i || t)();
      };
    }
    static {
      this.ɵprov = q({ token: t, factory: t.ɵfac, providedIn: `root` });
    }
  }
  return t;
})();
export { Xt as t };
