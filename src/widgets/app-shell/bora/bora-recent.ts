import { Component, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { IonItem } from '@ionic/angular/ion-item';
import { IonNote } from '@ionic/angular/ion-note';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { from } from 'rxjs';

import type { BoraListItem } from '@entities/bora';
import { BoraHistory } from '@features/bora';
import { BoraStore } from '@features/bora/model';
import { age } from '@shared/lib/format/age';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

const DAY = 86_400_000;
const WEEKDAY = new Intl.DateTimeFormat('en', { weekday: 'short' });
const DATE = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

function when(at: Date, now = new Date()): string {
  /* Rounded: a day across a DST change is 23 or 25 hours long. */
  const days = Math.round(
    (new Date(now).setHours(0, 0, 0, 0) - new Date(at).setHours(0, 0, 0, 0)) / DAY,
  );
  if (days <= 0) return `${age(at, now.getTime())} ago`;
  if (days === 1) return 'Yesterday';
  return days < 7 ? WEEKDAY.format(at) : DATE.format(at);
}

@Component({
  selector: 'app-bora-recent',
  imports: [InsetGroup, IonItem, IonNote, IonSearchbar],
  providers: [BoraHistory],
  template: `
    <ion-searchbar
      aria-label="Search conversations"
      placeholder="Search conversations"
      [debounce]="300"
      (ionInput)="history.query.set($event.detail.value ?? '')"
    />
    @if (history.error() && !history.items().length) {
      <p class="empty">
        Couldn’t load your conversations.
        <button type="button" class="link" (click)="history.reload()">Try again</button>
      </p>
    } @else if (history.hasLoaded() && !history.items().length) {
      <p class="empty">
        {{
          history.query().trim()
            ? 'No conversation matches “' + history.query().trim() + '”.'
            : 'No conversations yet. What you ask Bora is kept here.'
        }}
      </p>
    } @else {
      <app-inset-group label="Recent">
        @for (item of history.items(); track item.id) {
          <!-- Not an ion-item button: Delete would be nested interactive content (AXE). -->
          <ion-item class="row">
            <button type="button" class="open" (click)="bora.openSaved(item.id)">
              <span class="title truncate">{{ item.title }}</span>
              <span class="meta truncate">{{ meta(item) }}</span>
            </button>
            <button type="button" class="del" (click)="history.remove(item)">
              <span class="icon-[regular--trash]" aria-hidden="true"></span>
              <span class="sr-only">Delete “{{ item.title }}”</span>
            </button>
          </ion-item>
        }
        <ion-note>
          Only you can see them, not even an administrator. The latest 50 are here; search reaches
          every one.
        </ion-note>
      </app-inset-group>
      @if (history.items().length && !history.query().trim()) {
        <button type="button" class="all" (click)="history.remove()">
          Delete all conversations
        </button>
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    ion-searchbar {
      padding-inline: 0;
    }

    .row {
      --row-min-height: 4rem;
    }

    .open {
      flex-grow: 1;
      min-inline-size: 0;
      padding: 0.625rem 0;
      border: 0;
      background: none;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }

    .title {
      display: block;
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

    .del {
      display: flex;
      flex: none;
      align-items: center;
      justify-content: center;
      inline-size: 2.75rem;
      block-size: 2.75rem;
      margin-inline-start: 0.25rem;
      border: 0;
      border-radius: 50%;
      background: none;
      font-size: 1.0625rem;
      color: var(--ion-color-danger);
      cursor: pointer;
    }

    .empty {
      margin: 1rem 0.5rem;
      color: var(--app-text-secondary);
    }

    .link,
    .all {
      border: 0;
      background: none;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }

    .link {
      padding: 0;
      color: var(--app-text-action);
    }

    .all {
      align-self: center;
      min-block-size: 2.75rem;
      padding: 0 1rem;
      color: var(--ion-color-danger);
    }
  `,
})
export class BoraRecent {
  protected readonly history = inject(BoraHistory);
  protected readonly bora = inject(BoraStore);
  private readonly searchbar = viewChild.required(IonSearchbar, { read: ElementRef });

  constructor() {
    /* Ionic hard-codes "search text" and "reset" on its own input and button. */
    afterNextRender(() =>
      from((this.searchbar().nativeElement as HTMLIonSearchbarElement).getInputElement()).subscribe(
        (input) => {
          input.setAttribute('aria-label', 'Search conversations');
          input
            .closest('ion-searchbar')
            ?.querySelector('.searchbar-clear-button')
            ?.setAttribute('aria-label', 'Clear search');
        },
      ),
    );
  }

  protected meta(item: BoraListItem): string {
    if (item.snippet) return item.snippet;
    const about = item.about;
    const subject =
      about.kind === 'fleet' ? 'Every project' : 'task' in about ? about.task : about.project;
    return `${subject} · ${item.answering ? 'Answering…' : when(item.updatedAt)}`;
  }
}
