import { DOCUMENT } from '@angular/common';
import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';

/* -apple-system-body at the default iOS text size: the design's 16px root maps to it. */
const DEFAULT_BODY_PX = 17;
/* ponytail: xxLarge (124%); reflow the Live card on phones, then raise it toward 200%. */
const MAX_BODY_PX = 21;

export function provideDynamicType(): EnvironmentProviders {
  return provideAppInitializer(() => {
    const document = inject(DOCUMENT);
    const view = document.defaultView;
    /* Ionic's own iOS test: macOS Safari also knows -apple-system-body, at 13px. */
    if (!view?.CSS.supports('-webkit-touch-callout', 'none')) return;

    const probe = document.createElement('span');
    probe.hidden = true;
    probe.style.font = '-apple-system-body';
    document.body.append(probe);

    const scale = () => {
      const body = Math.min(parseFloat(view.getComputedStyle(probe).fontSize), MAX_BODY_PX);
      document.documentElement.style.fontSize = `${(body / DEFAULT_BODY_PX) * 100}%`;
    };
    scale();
    /* The setting changes in another app, so the return is when to read it. */
    document.addEventListener('visibilitychange', scale);
  });
}
