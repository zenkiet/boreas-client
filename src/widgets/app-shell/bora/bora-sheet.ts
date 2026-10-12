import { Component, afterRenderEffect, inject, viewChild } from '@angular/core';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { ModalController } from '@ionic/angular/modal-controller';

import { BoraStore } from '@features/bora/model';
import { reduced } from '@shared/ui/motion/motion';

import { BoraAnswer } from './bora-answer';
import { BoraRecent } from './bora-recent';

@Component({
  selector: 'app-bora-sheet',
  imports: [BoraAnswer, BoraRecent, IonContent, IonHeader, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar>
        <div class="bar">
          <h2>{{ bora.recent() ? 'Recent' : 'Conversation' }}</h2>
          <button
            type="button"
            class="disc"
            aria-label="Recent conversations"
            [attr.aria-pressed]="bora.recent()"
            (click)="bora.recent.set(!bora.recent())"
          >
            <span class="icon-[regular--clock-rotate-left]" aria-hidden="true"></span>
          </button>
          <button type="button" class="disc" aria-label="Close the conversation" (click)="close()">
            <span class="icon-[regular--xmark]" aria-hidden="true"></span>
          </button>
        </div>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <!-- Hidden, not destroyed: the conversation keeps its scroll while Recent shows. -->
      <app-bora-answer
        [inWorld]="true"
        [style.display]="bora.recent() ? 'none' : null"
        (left)="bora.close()"
      />
      @if (bora.recent()) {
        <app-bora-recent />
      }
    </ion-content>
  `,
  styles: `
    /* The sheet's page paints the rounded glass; anything here would square its corners. */
    ion-toolbar {
      --background: transparent;
      --border-width: 0;
    }

    ion-content {
      --background: transparent;
      --padding-start: 0.875rem;
      --padding-end: 0.875rem;
      --padding-top: 0.25rem;
      --padding-bottom: calc(1rem + var(--ion-safe-area-bottom, 0px));
    }

    .bar {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding-inline: 20px 12px;
    }

    h2 {
      flex-grow: 1;
      margin: 0;
      font-size: 1.25rem;
      line-height: 1.5625rem;
      font-weight: 700;
    }

    .disc {
      display: grid;
      flex: none;
      place-items: center;
      inline-size: 2.75rem;
      block-size: 2.75rem;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: var(--app-fill);
      font-size: 1.125rem;
      color: var(--app-text-secondary);
      cursor: pointer;
    }
  `,
})
export class BoraSheet {
  protected readonly bora = inject(BoraStore);
  private readonly modals = inject(ModalController);
  private readonly content = viewChild.required(IonContent);

  constructor() {
    afterRenderEffect(() => {
      const talk = this.bora.conversation();
      if (!talk?.messages.length) return;
      void talk.asking;
      void this.content().scrollToBottom(reduced() ? 0 : 300);
    });
  }

  protected close(): void {
    void this.modals.dismiss();
  }
}
