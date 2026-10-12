import { DestroyRef, Signal, effect, inject, signal, untracked } from '@angular/core';

import type { BoraState } from '@entities/bora';
import { BoraStore } from '@features/bora/model';

export function boraPose(): Signal<BoraState> {
  const bora = inject(BoraStore);
  const pose = signal<BoraState>('idle');
  let timer: ReturnType<typeof setTimeout> | undefined;
  inject(DestroyRef).onDestroy(() => clearTimeout(timer));
  effect(() => {
    const talk = bora.conversation();
    const cheered = bora.cheered();
    const listening = bora.listening();
    untracked(() => {
      clearTimeout(timer);
      if (listening) return pose.set('listen');
      if (talk?.asking) return pose.set('think');
      if (talk?.problem) return pose.set('sorry');
      const last = talk?.messages.at(-1);
      const now = Date.now();
      const [beat, ms] =
        now - cheered < 1600
          ? (['done', 1600 - (now - cheered)] as const)
          : last?.role === 'assistant' && now - last.at.getTime() < 1200
            ? (['speak', 1200 - (now - last.at.getTime())] as const)
            : (['idle', 0] as const);
      pose.set(beat);
      if (ms) timer = setTimeout(() => pose.set('idle'), ms);
    });
  });
  return pose.asReadonly();
}
