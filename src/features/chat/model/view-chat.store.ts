import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { Chat, ChatApi } from '@entities/chat';
import { mapApiError } from '@shared/api/api-error';
import { keepLastValue, resourceError } from '@shared/api/resource-cache';

@Injectable()
export class ViewChatStore {
  private readonly api = inject(ChatApi);
  /* An object, so retry() starts a new read where reload() would be dropped mid-flight. */
  private readonly ref = signal<{ readonly id: string } | undefined>(undefined);

  private readonly snapshot = rxResource({
    params: () => this.ref(),
    stream: ({ params }) => this.api.get(params.id),
  });

  readonly chat = keepLastValue<Chat>(this.snapshot, () => this.ref()?.id ?? '');
  readonly error = resourceError(this.snapshot);
  readonly gone = computed(() => mapApiError(this.snapshot.error()).kind === 'not-found');

  /** Call from a page constructor, so the effect dies with the page, not the store. */
  track(id: Signal<string | undefined>): void {
    effect(() => {
      const chat = id();
      if (chat) this.ref.set({ id: chat });
    });
  }

  retry(): void {
    const ref = this.ref();
    if (ref) this.ref.set({ ...ref });
  }
}
