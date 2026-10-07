import {
  Component,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonFooter } from '@ionic/angular/ion-footer';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonNote } from '@ionic/angular/ion-note';
import { IonPopover } from '@ionic/angular/ion-popover';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { NavController } from '@ionic/angular/nav-controller';

import { ChatComposer, ChatThread, ChatsStore, ViewChatStore, chatDeleter } from '@features/chat';
import { ListProjectsStore } from '@features/list-projects/model';
import { Callout } from '@shared/ui/callout/callout';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { NotifyService } from '@shared/ui/notify/notify';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

const SUGGESTIONS = [
  'How does sign-in work?',
  'What happens when a request fails?',
  'Which settings can an admin change?',
];

/** New chat without an `id`, else that conversation. */
@Component({
  selector: 'app-chat-page',
  imports: [
    Callout,
    ChatComposer,
    ChatThread,
    EmptyState,
    ErrorState,
    InsetGroup,
    IonBackButton,
    IonButton,
    IonButtons,
    IonFooter,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonPopover,
    IonSelect,
    IonSelectOption,
    PAGE_CHROME,
    RouterLink,
    SkeletonRows,
  ],
  providers: [ViewChatStore],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          @if (id()) {
            <ion-back-button defaultHref="/chats" text="Back" aria-label="Back" />
          } @else if (!split()) {
            <ion-button aria-label="Close" (click)="close()">
              <span slot="icon-only" class="icon-[regular--xmark]" aria-hidden="true"></span>
            </ion-button>
          }
        </ion-buttons>
        <ion-title>
          <span class="head" [class.head--pane]="split()">
            <span class="head__title">{{ title() }}</span>
            @if (id() && projectName()) {
              @if (split()) {
                <a class="head__sub" [routerLink]="['/projects', projectSlug()]">{{
                  projectName()
                }}</a>
              } @else {
                <span class="head__sub">{{ projectName() }}</span>
              }
            }
          </span>
        </ion-title>
        <!-- Beside the list, its rows delete on hover. -->
        @if (id() && !split()) {
          <ion-buttons slot="end">
            <ion-button [id]="menuId()" aria-label="More">
              <span slot="icon-only" class="icon-[regular--ellipsis]" aria-hidden="true"></span>
            </ion-button>
          </ion-buttons>
        }
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="column">
        @if (id()) {
          @if (messages().length || turn().asking) {
            <app-chat-thread [messages]="messages()" [asking]="turn().asking" />
          } @else if (view.error() && !view.gone()) {
            <app-error-state
              class="m-5 block"
              title="Unable to load the chat"
              [message]="view.error()!"
              (retry)="view.retry()"
            />
          } @else {
            <app-inset-group>
              <app-skeleton-rows variant="task" label="Loading the chat" />
            </app-inset-group>
          }
        } @else if (turn().asking) {
          <app-chat-thread [messages]="[]" [asking]="turn().asking" />
        } @else if (target()) {
          @if (!project()) {
            <app-inset-group>
              <ion-item>
                @if (projects().length > 1) {
                  <ion-select
                    label="Project"
                    interface="popover"
                    [value]="chosen()"
                    (ionChange)="chosen.set($event.detail.value); chats.settle()"
                  >
                    @for (option of projects(); track option.slug) {
                      <ion-select-option [value]="option.slug">{{ option.name }}</ion-select-option>
                    }
                  </ion-select>
                } @else {
                  <ion-label>Project</ion-label>
                  <ion-note slot="end">{{ projectName() }}</ion-note>
                }
              </ion-item>
              @if (projects().length > 1) {
                <ion-note>Only projects with code connected are listed.</ion-note>
              } @else {
                <ion-note>The only project with code connected, so it is chosen for you.</ion-note>
              }
            </app-inset-group>
          }
          <app-inset-group label="Try asking">
            @for (suggestion of suggestions; track suggestion) {
              <!-- Points down at the field it fills. -->
              <ion-item button [detail]="false" (click)="suggest(suggestion)">
                <ion-label class="ion-text-wrap">{{ suggestion }}</ion-label>
                <span
                  slot="end"
                  class="icon-[regular--arrow-down-left] text-accent"
                  aria-hidden="true"
                ></span>
              </ion-item>
            }
            <ion-note>
              Answers come from {{ projectName() }}’s code, in plain words and in the language you
              ask in. Chat only explains: it never changes code, deploys or runs anything.
            </ion-note>
          </app-inset-group>
        } @else if (fleet.hasLoaded()) {
          <app-empty-state
            class="m-5 block"
            icon="icon-[light--code]"
            title="Chat needs code"
            description="No project has code connected yet. An admin adds repositories in project settings."
          />
        }
      </div>
    </ion-content>

    @if (id() || target()) {
      <ion-footer>
        <div class="column foot">
          @if (turn().problem; as problem) {
            @if (blocked()) {
              <app-callout tone="warning" role="status">{{ problem.message }}</app-callout>
            } @else {
              <app-callout tone="negative" role="alert">
                <span class="retry">
                  {{ problem.message }}
                  <ion-button size="small" fill="clear" (click)="send()">Try again</ion-button>
                </span>
              </app-callout>
            }
          }
          <app-chat-composer
            #composer
            [draft]="turn().draft"
            [placeholder]="id() ? 'Ask a follow-up' : 'Ask about ' + projectName()"
            [label]="id() ? 'Ask a follow-up' : 'Your question'"
            [busy]="!!turn().asking"
            [off]="blocked()"
            (draftChange)="chats.type(key(), $event)"
            (send)="send()"
          />
        </div>
      </ion-footer>
    }

    @if (id() && !split()) {
      <ion-popover aria-label="Chat actions" [trigger]="menuId()" [dismissOnSelect]="true">
        <ng-template>
          <ion-list>
            <ion-item button [detail]="false" (click)="remove()">
              <span
                slot="start"
                class="icon-[regular--trash] text-danger"
                aria-hidden="true"
              ></span>
              <ion-label color="danger">Delete chat…</ion-label>
            </ion-item>
          </ion-list>
        </ng-template>
      </ion-popover>
    }
  `,
  styles: `
    .head {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-inline-size: 0;
    }

    .head__title,
    .head__sub {
      max-inline-size: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .head__title {
      font-size: 0.9375rem;
      line-height: 1.25rem;
      font-weight: 600;
    }

    .head__sub {
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 400;
      color: var(--app-text-tertiary);
      text-decoration: none;
    }

    .head--pane {
      align-items: flex-start;
    }

    .head--pane .head__title {
      font-size: 1.375rem;
      line-height: 1.75rem;
      font-weight: 700;
    }

    .head--pane .head__sub {
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: var(--ion-color-primary);
    }

    .column {
      max-inline-size: 47.5rem;
      margin-inline: auto;
    }

    app-chat-thread {
      padding: 1rem;
    }

    ion-footer {
      background: linear-gradient(to top, var(--ion-background-color) 55%, transparent);
    }

    .foot {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      padding: 0.5rem 1rem max(var(--ion-safe-area-bottom, 0px), 0.75rem);
    }

    .retry {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .retry ion-button {
      flex: none;
      margin: -0.5rem -0.5rem -0.5rem 0;
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) {
      /* On the pane title's 20px edge. */
      app-chat-thread {
        padding: 1.25rem;
      }

      .foot {
        padding-inline: 1.25rem;
      }

      /* Both reserve the scrollbar's width, so the composer ends where the bubbles do. */
      ion-content::part(scroll) {
        scrollbar-gutter: stable;
      }

      ion-footer {
        overflow: hidden;
        scrollbar-gutter: stable;
      }
    }
  `,
})
export class ChatPage {
  protected readonly chats = inject(ChatsStore);
  protected readonly view = inject(ViewChatStore);
  protected readonly fleet = inject(ListProjectsStore);
  private readonly router = inject(Router);
  private readonly nav = inject(NavController);
  private readonly deleteChat = chatDeleter();
  private readonly notifications = inject(NotifyService);
  private readonly content = viewChild(IonContent);
  private readonly composer = viewChild<ChatComposer>('composer');

  readonly id = input<string>();
  /** `?project=`: New chat for it, without the picker. */
  readonly project = input<string>();
  readonly split = input(false);

  protected readonly suggestions = SUGGESTIONS;
  protected readonly key = computed(() => this.id() ?? '');
  protected readonly turn = computed(() => this.chats.turn(this.key()));
  protected readonly menuId = computed(() => `chat-more-${this.key()}`);
  protected readonly blocked = computed(() => {
    const kind = this.turn().problem?.kind;
    return kind === 'forbidden' || kind === 'conflict';
  });

  protected readonly projects = computed(() =>
    this.fleet
      .summaries()
      .filter(({ project }) => project.repositories.length > 0)
      .map(({ project }) => project),
  );

  protected readonly chosen = linkedSignal(() => this.project() || this.projects()[0]?.slug || '');
  protected readonly target = computed(() => this.turn().asking?.project ?? this.chosen());

  private readonly listed = computed(() => this.chats.chats().find(({ id }) => id === this.id()));
  protected readonly projectSlug = computed(() =>
    this.id() ? (this.view.chat()?.project ?? this.listed()?.project ?? '') : this.target(),
  );
  protected readonly projectName = computed(() => {
    const slug = this.projectSlug();
    return (
      this.fleet.summaries().find(({ project }) => project.slug === slug)?.project.name ?? slug
    );
  });

  protected readonly title = computed(() => {
    if (this.id()) return this.view.chat()?.title ?? this.listed()?.title ?? 'Chat';
    return this.project() ? `Ask about ${this.projectName()}` : 'New chat';
  });

  /* Its own signal: a keystroke changes the turn's draft, never its answers. */
  private readonly landed = computed(() => this.turn().landed);

  /* Messages carry no id: a landed one counts once it is newer than the read's last. */
  protected readonly messages = computed(() => {
    const read = this.view.chat()?.messages ?? [];
    const last = read.at(-1)?.at.getTime() ?? 0;
    return [...read, ...this.landed().filter(({ at }) => at.getTime() > last)];
  });

  private readonly started = computed(() => this.chats.turn('').started);
  private readonly askedAt = computed(() => this.turn().asking?.since);
  private readonly loaded = computed(() => this.messages().length > 0);
  private opened = false;
  private scrolled = false;

  constructor() {
    this.view.track(this.id);

    /* A New chat answer opens its thread; one that landed before this page opened stays in the list. */
    effect(() => {
      const id = this.id();
      const started = this.started();
      untracked(() => {
        if (started && !id && this.opened) this.openStarted(started);
        else if (!id ? !this.opened && !this.chats.turn('').asking : id === started) {
          this.chats.settle();
        }
      });
      this.opened = true;
    });

    effect(() => {
      if (this.id() && (this.view.gone() || this.turn().problem?.kind === 'not-found')) {
        untracked(() => this.leave('This chat no longer exists'));
      }
    });

    /* Not on an answer: it lands in place, so reading is never yanked. */
    afterRenderEffect(() => {
      const askedAt = this.askedAt();
      if (askedAt || (this.loaded() && !this.scrolled)) {
        this.scrolled = true;
        void this.content()?.scrollToBottom(askedAt ? 300 : 0);
      }
    });
  }

  protected suggest(question: string): void {
    this.chats.type('', question);
    this.composer()?.focus();
  }

  protected send(): void {
    this.chats.send(this.key(), this.projectSlug());
  }

  protected close(): void {
    const project = this.project();
    void this.nav.navigateBack(project ? ['/projects', project] : ['/chats']);
  }

  protected remove(): void {
    const id = this.id();
    if (id) this.deleteChat({ id, title: this.title() }).subscribe(() => this.goToList());
  }

  private leave(message: string): void {
    this.notifications.failure(message);
    this.chats.load();
    this.goToList();
  }

  private goToList(): void {
    if (this.split()) void this.router.navigate([], { replaceUrl: true });
    else void this.nav.navigateBack(['/chats']);
  }

  private openStarted(id: string): void {
    this.chats.settle();
    if (this.split()) {
      void this.router.navigate([], { queryParams: { chat: id }, replaceUrl: true });
    } else {
      /* Replaces New chat in Ionic's stack, so Back skips the empty form. */
      void this.nav.navigateForward(['/chats', id], { replaceUrl: true, animated: false });
    }
  }
}
