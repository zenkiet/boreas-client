import { Component, computed, input, output } from '@angular/core';
import { IonItem } from '@ionic/angular/ion-item';
import { IonItemOption } from '@ionic/angular/ion-item-option';
import { IonItemOptions } from '@ionic/angular/ion-item-options';
import { IonItemSliding } from '@ionic/angular/ion-item-sliding';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';

import type { Chat } from '@entities/chat';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { chatWhen } from '../../model/chat-time';

@Component({
  selector: 'app-chat-list',
  imports: [InsetGroup, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonNote],
  template: `
    <app-inset-group label="Recent" [trailing]="count()">
      @for (row of rows(); track row.chat.id) {
        @if (split()) {
          <!-- Not an ion-item button: Delete would be nested interactive content (AXE). -->
          <ion-item class="pick" [class.picked]="row.chat.id === selected()">
            <button
              type="button"
              class="open"
              aria-controls="chat-pane"
              [attr.aria-current]="row.chat.id === selected() ? 'true' : null"
              (click)="opened.emit(row.chat)"
            >
              <span class="title truncate">{{ row.chat.title }}</span>
              <span class="meta truncate">{{ row.meta }}</span>
            </button>
            <button type="button" class="del" (click)="deleteRequested.emit(row.chat)">
              <span class="icon-[regular--trash]" aria-hidden="true"></span>
              <span class="sr-only">Delete “{{ row.chat.title }}”</span>
            </button>
          </ion-item>
        } @else {
          <ion-item-sliding #sliding>
            <ion-item button (click)="opened.emit(row.chat)">
              <ion-label class="ion-text-wrap">
                <span class="title line-clamp-2">{{ row.chat.title }}</span>
                <span class="meta truncate">{{ row.meta }}</span>
              </ion-label>
            </ion-item>
            <ion-item-options side="end">
              <ion-item-option
                color="danger"
                (click)="deleteRequested.emit(row.chat); sliding.close()"
              >
                <span slot="top" class="icon-[solid--trash]" aria-hidden="true"></span>
                Delete
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        }
      }
      <ion-note>
        Only you can see your chats, not even an administrator. The latest 100 are listed here.
      </ion-note>
    </app-inset-group>
  `,
  styles: `
    .title {
      font-size: 1rem;
      line-height: 1.3125rem;
      font-weight: 500;
      color: var(--app-text-primary);
    }

    .meta {
      display: block;
      margin-block-start: 0.1875rem;
      font-size: 0.875rem;
      line-height: 1.1875rem;
      color: var(--app-text-tertiary);
    }

    ion-label {
      padding-block: 0.375rem;
    }

    .pick {
      --row-min-height: 4.25rem;
    }

    .pick.picked {
      --background: var(--app-fill);
    }

    .open {
      flex-grow: 1;
      min-inline-size: 0;
      padding: 0.75rem 0;
      border: 0;
      background: none;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    /* One line beside the list: Delete taking width on hover then only moves the ellipsis. */
    .open .title {
      display: block;
    }

    .del {
      display: none;
      flex: none;
      align-items: center;
      justify-content: center;
      inline-size: 2.5rem;
      block-size: 2.5rem;
      margin-inline-start: 0.5rem;
      border: 0;
      border-radius: 1.25rem;
      background: var(--ion-item-background);
      box-shadow: 0 0 0 0.5px var(--app-border-normal);
      font-size: 1.0625rem;
      color: var(--ion-color-danger);
      cursor: pointer;
    }

    .pick:is(:hover, :focus-within) .del {
      display: flex;
    }
  `,
})
export class ChatList {
  readonly chats = input.required<readonly Chat[]>();
  readonly names = input.required<ReadonlyMap<string, string>>();
  readonly split = input(false);
  readonly selected = input('');

  readonly opened = output<Chat>();
  readonly deleteRequested = output<Chat>();

  protected readonly count = computed(() => {
    const count = this.chats().length;
    return `${count} ${count === 1 ? 'chat' : 'chats'}`;
  });

  protected readonly rows = computed(() => {
    const now = new Date();
    return this.chats().map((chat) => ({
      chat,
      meta: `${this.names().get(chat.project) ?? chat.project} · ${chatWhen(chat.updatedAt, now)}`,
    }));
  });
}
