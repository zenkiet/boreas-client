import { NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';

import { ChatsStore } from '@features/chat';
import { ChatPage } from '@pages/chat/chat-page';
import { ChatsPage } from '@pages/chats/chats-page';
import { onReturn } from '@shared/lib/pull-to-refresh/pull-to-refresh';

/** iPad and desktop chat split. Lives in `app` because it composes pages. */
@Component({
  selector: 'app-chat-split',
  imports: [ChatsPage, NgComponentOutlet],
  host: { class: 'split-view' },
  template: `
    <app-chats-page class="ion-page split__list" [split]="true" [selected]="pane()?.id ?? ''" />
    <section id="chat-pane" class="split__pane" aria-label="Conversation">
      <!-- Keyed: each conversation gets a fresh page, as a push would. -->
      @for (key of [paneKey()]; track key) {
        @if (pane(); as pane) {
          <ng-container
            *ngComponentOutlet="
              page;
              inputs: { id: pane.id || undefined, project: pane.project || undefined, split: true }
            "
          />
        }
      }
    </section>
  `,
  styles: `
    :host {
      --split-list: 21.25rem;
    }

    @media (min-width: 80rem) {
      :host {
        --split-list: 22.5rem;
      }
    }
  `,
})
export class ChatSplit {
  private readonly chats = inject(ChatsStore);

  readonly chat = input<string>();
  readonly project = input<string>();

  protected readonly page = ChatPage;

  protected readonly pane = computed(() => {
    const chat = this.chat();
    if (chat === 'new') return { id: '', project: this.project() ?? '' };
    if (chat) return { id: chat, project: '' };
    if (!this.chats.hasLoaded()) return undefined;
    return { id: this.chats.chats()[0]?.id ?? '', project: '' };
  });

  protected readonly paneKey = computed(() => {
    const pane = this.pane();
    return pane ? `${pane.id}/${pane.project}` : '';
  });

  constructor() {
    /* Ionic's lifecycle events reach this routed host only, never the pages inside it. */
    onReturn(() => this.chats.load());
  }
}
