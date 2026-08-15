import {
  Kr as ot,
  Sn as bV,
  Ti as v$1,
  W as J,
  fr as it,
  g as Ca,
  yi as tr,
} from './chunk-CD8PwEax.js';
var h = 0.045;
var v = class i {
  host = v$1(it);
  destroyRef = v$1(J);
  stagger = tr(h, {
    alias: `appReveal`,
    transform: (t) => (t === `` || t === null ? h : Number(t)),
  });
  constructor() {
    Ca(() => {
      let t = this.host.nativeElement,
        a = bV.matchMedia();
      (a.add(`(prefers-reduced-motion: no-preference)`, () => {
        let d = new WeakSet(),
          c = (o) => {
            let r = o.filter((e) => !d.has(e) && !e.hasAttribute(`data-no-reveal`));
            r.length &&
              (r.forEach((e) => d.add(e)),
              bV.from(r, {
                autoAlpha: 0,
                y: 8,
                duration: 0.42,
                ease: `power2.out`,
                stagger: this.stagger(),
              }));
          };
        c(Array.from(t.children));
        let l = new MutationObserver((o) => {
          let r = o
            .flatMap((e) => Array.from(e.addedNodes))
            .filter((e) => e.nodeType === Node.ELEMENT_NODE);
          c(r);
        });
        return (l.observe(t, { childList: !0 }), () => l.disconnect());
      }),
        this.destroyRef.onDestroy(() => a.revert()));
    });
  }
  static ɵfac = function (a) {
    return new (a || i)();
  };
  static ɵdir = ot({
    type: i,
    selectors: [[``, `appReveal`, ``]],
    inputs: { stagger: [1, `appReveal`, `stagger`] },
  });
};
export { v as t };
