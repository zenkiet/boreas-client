/** Keeps `--app-keyboard` on `root` at the height the on-screen keyboard covers; returns the stop. */
export function trackKeyboard(root: HTMLElement): () => void {
  const view = root.ownerDocument.defaultView;
  const viewport = view?.visualViewport;
  const track = () => {
    const gap = view && viewport ? view.innerHeight - viewport.height - viewport.offsetTop : 0;
    root.style.setProperty('--app-keyboard', `${Math.max(gap, 0)}px`);
  };
  viewport?.addEventListener('resize', track);
  viewport?.addEventListener('scroll', track);
  track();
  return () => {
    viewport?.removeEventListener('resize', track);
    viewport?.removeEventListener('scroll', track);
  };
}
