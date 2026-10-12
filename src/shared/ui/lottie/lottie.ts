import type { Config } from '@lottiefiles/dotlottie-web';

/** nginx caches the wasm as immutable: the folder carries the version, so new JS never meets an old binary. */
export const LOTTIE_WASM = '/animations/dotlottie-0.81/dotlottie-player.wasm';

export function lottieConfig(
  view: Window,
  sharpest = 1.5,
): Pick<Config, 'layout' | 'renderConfig'> {
  return {
    layout: { fit: 'contain', align: [0.5, 0.5] },
    renderConfig: {
      autoResize: true,
      devicePixelRatio: Math.min(view.devicePixelRatio, sharpest),
      freezeOnOffscreen: true,
      quality: 90,
    },
  };
}
