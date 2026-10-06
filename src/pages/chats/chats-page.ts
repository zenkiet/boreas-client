import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { NavController } from '@ionic/angular/nav-controller';

import type { Chat } from '@entities/chat';
import { ChatList, ChatsStore, chatDeleter } from '@features/chat';
import { ListProjectsStore } from '@features/list-projects/model';
import {
  PULL_REFRESH,
  PullRefreshSource,
  onReturn,
} from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { Callout } from '@shared/ui/callout/callout';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

@Component({
  selector: 'app-chats-page',
  imports: [
    Callout,
    ChatList,
    EmptyState,
    ErrorState,
    InsetGroup,
    IonButton,
    IonButtons,
    IonSearchbar,
    PAGE_CHROME,
    PULL_REFRESH,
    SkeletonRows,
  ],
  host: { class: 'desk-wide' },
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Chat</ion-title>
        @if (canStart()) {
          <ion-buttons slot="end" class="narrow-only">
            <ion-button aria-label="New chat" (click)="startNew()">
              <span
                slot="icon-only"
                class="icon-[regular--pen-to-square]"
                aria-hidden="true"
              ></span>
            </ion-button>
          </ion-buttons>
          <ion-buttons slot="end" class="wide-only">
            <ion-button color="primary" fill="solid" class="act act--primary" (click)="startNew()">
              <span slot="start" class="icon-[regular--pen-to-square]" aria-hidden="true"></span>
              New chat
            </ion-button>
          </ion-buttons>
        }
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher [appRefresh]="pull"><ion-refresher-content /></ion-refresher>
      <div class="mx-auto max-w-(--app-column)">
        <ion-header collapse="condense">
          <ion-toolbar><ion-title size="large">Chat</ion-title></ion-toolbar>
        </ion-header>

        @if (chats.loading() && !chats.hasLoaded()) {
          <app-inset-group>
            <app-skeleton-rows variant="project" label="Loading chats" />
          </app-inset-group>
        } @else if (chats.error() && !chats.hasLoaded()) {
          <app-error-state
            class="m-5 block"
            title="Unable to load chats"
            [message]="chats.error()!"
            (retry)="chats.load()"
          />
        } @else {
          @if (chats.error()) {
            <app-callout class="m-5" tone="negative" role="alert">
              {{ chats.error() }} Existing data is still shown.
            </app-callout>
          }

          @if (chats.chats().length > 0) {
            <ion-searchbar
              class="desk-only"
              aria-label="Filter chats"
              placeholder="Filter by title or project"
              [debounce]="150"
              (ionInput)="query.set($event.detail.value ?? '')"
            />
            <app-chat-list
              [chats]="shown()"
              [names]="names()"
              [split]="split()"
              [selected]="selected()"
              (opened)="open($event)"
              (deleteRequested)="remove($event)"
            />
          } @else if (canStart()) {
            <app-empty-state
              class="m-5 block"
              icon="icon-[light--message]"
              title="Ask about a project"
              description="Ask how a feature works, in plain words."
            >
              <ion-button size="small" (click)="startNew()">New chat</ion-button>
            </app-empty-state>
          } @else if (fleet.hasLoaded()) {
            <app-empty-state
              class="m-5 block"
              icon="icon-[light--code]"
              title="Chat needs code"
              description="No project has code connected yet. An admin adds repositories in project settings."
            />
          }
        }
      </div>
    </ion-content>
  `,
})
export class ChatsPage {
  protected readonly chats = inject(ChatsStore);
  protected readonly fleet = inject(ListProjectsStore);
  private readonly router = inject(Router);
  private readonly nav = inject(NavController);
  private readonly deleteChat = chatDeleter();

  /** Set by app/chat-split: rows select through `?chat=`. */
  readonly split = input(false);
  readonly selected = input('');

  protected readonly query = signal('');

  protected readonly names = computed(
    () => new Map(this.fleet.summaries().map(({ project }) => [project.slug, project.name])),
  );

  protected readonly canStart = computed(() =>
    this.fleet.summaries().some(({ project }) => project.repositories.length > 0),
  );

  protected readonly shown = computed(() => {
    const query = this.query().trim().toLowerCase();
    const names = this.names();
    return query
      ? this.chats
          .chats()
          .filter((chat) =>
            [chat.title, names.get(chat.project) ?? chat.project].some((text) =>
              text.toLowerCase().includes(query),
            ),
          )
      : this.chats.chats();
  });

  protected readonly pull: PullRefreshSource = {
    busy: this.chats.loading,
    trigger: () => {
      this.chats.load();
      this.fleet.load();
    },
  };

  constructor() {
    this.chats.load();
    onReturn(() => this.chats.load());
  }

  protected open(chat: Chat): void {
    if (this.split()) {
      void this.router.navigate([], { queryParams: { chat: chat.id }, replaceUrl: true });
    } else {
      void this.nav.navigateForward(['/chats', chat.id]);
    }
  }

  protected startNew(): void {
    if (this.split()) {
      void this.router.navigate([], { queryParams: { chat: 'new' }, replaceUrl: true });
    } else {
      void this.nav.navigateForward(['/chats/new']);
    }
  }

  protected remove(chat: Chat): void {
    this.deleteChat(chat).subscribe(() => {
      if (this.split() && this.selected() === chat.id) {
        void this.router.navigate([], { replaceUrl: true });
      }
    });
  }
}
