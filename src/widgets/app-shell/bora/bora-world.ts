import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { AnimationBuilder } from '@ionic/angular';
import { createAnimation } from '@ionic/core/components';
import { Subscription, finalize, from, fromEvent, take, tap } from 'rxjs';

import { BoraFigure, type BoraState, BoraWaiting } from '@entities/bora';
import { BoraStore } from '@features/bora/model';
import { ListAlertsStore } from '@features/list-alerts/model';
import { ListProjectsStore } from '@features/list-projects/model';
import { audioLevel, canHear, hear, hearingFailed } from '@shared/ui/dictation/dictation';
import { trackKeyboard } from '@shared/ui/keyboard/keyboard';
import { E, reduced } from '@shared/ui/motion/motion';
import { NotifyService } from '@shared/ui/notify/notify';
import { SheetService } from '@shared/ui/sheet/sheet.service';
import {
  type Chime,
  type Spoken,
  chime,
  screenReader,
  speak,
  unlockSpeech,
  warmUp,
} from '@shared/ui/speech/speech';
import { endpoint, isVietnamese, sentences, words } from '@shared/ui/speech/voice';

import {
  BoraChip,
  type Suggestion,
  freshFailure,
  problemText,
  subjectLinks,
  suggestions,
  taskHints,
} from './bora-chip';
import { BoraComposer } from './bora-composer';
import { boraPose } from './bora-pose';
import { BoraSheet } from './bora-sheet';
import { BoraSky } from './bora-sky';
import { BoraSteps } from './bora-steps';

const WAIT_MS = 8000;
const FOLLOW_MS = 5000;

type Asked = 'voice' | 'tap' | 'typed';
type Mode = 'ready' | 'listening' | 'follow' | 'thinking' | 'talking' | 'answered';

const SKY_FROM = 0.8;
/* Across starts slow while up starts at once, so the flight curves. */
const ACROSS = 'cubic-bezier(0.5, 0, 0.2, 1)';

/** Bora flies from its resting spot to the centre and lands as the world grows from that spot; no repaint. */
export const worldAnimation =
  (spot: () => DOMRect | undefined, opening: boolean): AnimationBuilder =>
  (base: HTMLElement) => {
    const home = spot();
    const wrapper = base.shadowRoot?.querySelector<HTMLElement>('.modal-wrapper') ?? base;
    const bora = base.querySelector<HTMLElement>('.stage .bora');
    const world = createAnimation()
      .duration(opening ? 560 : 320)
      // Played backwards, ease-in starts at once and settles into Bora.
      .easing(opening ? E.out.css : E.in.css)
      .direction(opening ? 'normal' : 'reverse')
      .addAnimation(
        createAnimation()
          .addElement(wrapper)
          .beforeStyles({
            'transform-origin': home
              ? `${home.left + home.width / 2}px ${home.top + home.height / 2}px`
              : 'bottom',
          })
          // Also brings back the wrapper iOS parks below the screen for its own slide-up.
          .keyframes([
            { offset: 0, transform: `scale(${SKY_FROM})`, opacity: 0 },
            { offset: 1, transform: 'none', opacity: 1 },
          ]),
      );
    if (!home || !bora || reduced()) return world;

    // Measured against the parked wrapper: where Bora sits in it is where it lands.
    const box = wrapper.getBoundingClientRect();
    const at = bora.getBoundingClientRect();
    const size = bora.querySelector('app-bora-figure')?.getBoundingClientRect().width || at.width;
    const dx = home.left + home.width / 2 - (at.left - box.left + at.width / 2);
    const dy = home.top + home.height / 2 - (at.top - box.top + at.height / 2);
    world.addAnimation([
      createAnimation()
        .addElement(bora)
        .easing(ACROSS)
        .keyframes([
          { offset: 0, translate: `${dx}px 0` },
          { offset: 1, translate: '0 0' },
        ]),
      createAnimation()
        .addElement(bora)
        .keyframes([
          { offset: 0, transform: `translateY(${dy}px) scale(${home.width / size / SKY_FROM})` },
          { offset: 1, transform: 'none' },
        ]),
    ]);
    if (!opening) return world;

    return world.addAnimation([
      createAnimation()
        .addElement(bora)
        .delay(460)
        .duration(380)
        // Not kept: typing shrinks Bora through the same property.
        .fill('none')
        .keyframes([
          { offset: 0, scale: '1' },
          { offset: 0.35, scale: '1.08 0.92' },
          { offset: 0.7, scale: '0.97 1.03' },
          { offset: 1, scale: '1' },
        ]),
      // No end frame: the halo settles back on its own opacity, which follows the voice.
      createAnimation()
        .addElement(base.querySelectorAll('.stage .halo'))
        .delay(280)
        .duration(520)
        .fill('backwards')
        .keyframes([
          { offset: 0, opacity: 0, scale: '0.3' },
          { offset: 0.6, opacity: 1, scale: '1.1' },
        ]),
      ...Array.from(base.querySelectorAll('.middle .sug, .middle .card'), (card, i) =>
        createAnimation()
          .addElement(card)
          .delay(380 + i * 70)
          .duration(420)
          .fill('backwards')
          .keyframes([{ offset: 0, opacity: 0, translate: '0 16px' }]),
      ),
    ]);
  };

@Component({
  selector: 'app-bora-world',
  imports: [BoraChip, BoraComposer, BoraFigure, BoraSky, BoraSteps, BoraWaiting, RouterLink],
  host: { '[class.typing]': 'typing()', '(document:visibilitychange)': 'hidden()' },
  template: `
    <app-bora-sky [health]="health()" />
    <p class="sr-only" role="status">{{ announced() }}</p>

    <div class="top">
      <button type="button" class="disc" aria-label="Close" (click)="bora.close()">
        <span class="icon-[regular--xmark]" aria-hidden="true"></span>
      </button>
      <app-bora-chip class="chip" (opened)="bora.close()" />
      <button
        type="button"
        class="disc"
        [attr.aria-label]="
          reader() ? 'Read answers aloud, off while VoiceOver is on' : 'Read answers aloud'
        "
        [attr.aria-pressed]="aloud()"
        [attr.aria-disabled]="reader() || null"
        (click)="toggleAloud()"
      >
        @if (aloud()) {
          <span class="icon-[regular--volume]" aria-hidden="true"></span>
        } @else {
          <span class="icon-[regular--volume-xmark]" aria-hidden="true"></span>
        }
      </button>
    </div>

    <div class="stage">
      <span class="halo"></span>
      <button
        type="button"
        class="bora"
        [attr.aria-label]="talkLabel()"
        [attr.aria-pressed]="!!take()"
        [disabled]="bora.ended()"
        (click)="tapped()"
      >
        <svg
          class="pace"
          viewBox="0 0 184 184"
          fill="none"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="566"
          aria-hidden="true"
        >
          <circle class="track" cx="92" cy="92" r="90" stroke="#ffffff24" stroke-dasharray="none" />
          @if (mode() === 'follow') {
            <circle class="count" cx="92" cy="92" r="90" stroke="#7cc4ffb3" />
          }
          <!-- Keyed on the words heard: each new word starts the pause over. -->
          @for (heard of sending(); track heard) {
            <circle class="send" cx="92" cy="92" r="90" stroke="#7cc4ff" />
          }
        </svg>
        <app-bora-figure [size]="160" shadow="none" [state]="pose()" [beat]="beat()" />
      </button>
      @if (mode() === 'thinking') {
        <app-bora-waiting
          class="state"
          [label]="talk()?.asking?.step || 'Looking into it…'"
          [since]="talk()?.asking?.since ?? 0"
        />
      } @else {
        <p class="state">{{ stateLine() }}</p>
      }
    </div>

    <div class="middle">
      @if (take()?.heard; as heard) {
        <p class="cap" [attr.lang]="lang(heard)">
          @for (word of heardWords(); track $index; let last = $last) {
            <span [class.tail]="last">{{ word }} </span>
          }
        </p>
      } @else if (mode() !== 'listening') {
        @if (question(); as question) {
          <p class="you" [attr.lang]="lang(question)">{{ question }}</p>
        }
        @if (caption(); as caption) {
          <p class="cap" [class.settled]="caption.settled" [attr.lang]="caption.lang">
            <span aria-hidden="true">
              @for (word of caption.words; track $index) {
                <span [class]="word.state">{{ word.text }} </span>
              }
            </span>
            <span class="sr-only">{{ caption.text }}</span>
          </p>
        }
        @if (talk()?.problem; as problem) {
          <p class="cap settled">{{ problemText(problem) }}</p>
          @if (!bora.ended()) {
            <button type="button" class="link" (click)="retry()">Try again</button>
          }
        }
        @if (mode() === 'ready' || mode() === 'answered' || mode() === 'follow') {
          <div class="cards">
            @if (again(); as again) {
              <button type="button" class="sug" (click)="send(again, 'tap')">
                <span class="pre">Ask again:</span> {{ again }}
              </button>
            }
            @if (mode() === 'ready' && !talk()?.problem) {
              <div class="cards" role="group" aria-label="Suggested questions">
                @for (suggestion of offered(); track suggestion.question) {
                  <button type="button" class="sug" (click)="offer(suggestion)">
                    {{ suggestion.question }}
                  </button>
                }
              </div>
            }
            @if (last(); as answer) {
              @if (answer.choices.length) {
                <div class="cards" role="group" aria-label="Pick one">
                  @for (choice of answer.choices; track choice) {
                    <button type="button" class="sug" (click)="send(choice, 'tap')">
                      {{ choice }}
                    </button>
                  }
                </div>
              }
              @if (answer.actions.length) {
                <app-bora-steps
                  class="card"
                  [message]="answer"
                  (ran)="outcome($event)"
                  (left)="bora.close()"
                />
              }
              <div class="card links">
                @if (links(); as link) {
                  <a
                    class="link"
                    [routerLink]="link.task"
                    [queryParams]="{ section: 'logs' }"
                    (click)="bora.close()"
                    >View logs</a
                  >
                  @if (link.build) {
                    <a class="link" target="_blank" rel="noopener" [href]="link.build"
                      >View the build</a
                    >
                  }
                }
                <button type="button" class="more" (click)="openSheet()">
                  Read the full answer
                  <span class="icon-[regular--angle-right]" aria-hidden="true"></span>
                </button>
              </div>
            }
          </div>
        }
      }
    </div>

    @if (typing()) {
      <div class="compose">
        <app-bora-composer (sent)="typed()" />
        <button type="button" class="link" (click)="typing.set(false)">Leave typing</button>
      </div>
    } @else {
      <div class="bar">
        <button
          type="button"
          class="round"
          aria-label="Type a question"
          [disabled]="bora.ended()"
          (click)="type()"
        >
          <span class="icon-[regular--keyboard]" aria-hidden="true"></span>
        </button>
        @if (pill(); as pill) {
          <button type="button" class="pill" (click)="pillTapped(pill)">{{ pill }}</button>
        }
        <button type="button" class="round" aria-label="Conversation" (click)="openSheet()">
          <span class="icon-[regular--comments]" aria-hidden="true"></span>
        </button>
      </div>
    }
  `,
  styles: `
    :host {
      --w-ink-2: rgb(235 241 255 / 0.8);
      --w-ink-3: rgb(235 241 255 / 0.62);
      --w-glass: rgb(255 255 255 / 0.1);
      --w-glass-2: rgb(255 255 255 / 0.16);
      --w-card: rgb(16 26 48 / 0.72);
      --w-accent: #7cc4ff;
      --w-blur: blur(20px) saturate(160%);
      --app-accent-soft: var(--w-accent);
      --app-accent-text: #03122b;
      --lvl: 0;
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      padding: calc(var(--ion-safe-area-top, 0px) + 0.5rem) 1rem
        calc(var(--ion-safe-area-bottom, 0px) + 0.75rem);
      overflow: hidden;
      isolation: isolate;
      color: #fff;
      color-scheme: dark;
    }

    .top {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .chip {
      flex-grow: 1;
      min-inline-size: 0;
    }

    .disc,
    .round,
    .pill,
    .sug,
    .card,
    .link {
      border: 0;
      background: var(--w-glass);
      color: inherit;
      font: inherit;
      -webkit-backdrop-filter: var(--w-blur);
      backdrop-filter: var(--w-blur);
    }

    .disc,
    .round {
      display: grid;
      flex: none;
      place-items: center;
      inline-size: 44px;
      block-size: 44px;
      border-radius: 50%;
      font-size: 1.125rem;
    }

    .round {
      inline-size: 52px;
      block-size: 52px;
    }

    [aria-pressed='true'].disc,
    .pill,
    .link {
      background: var(--w-glass-2);
    }

    [aria-disabled='true'],
    :disabled {
      opacity: 0.5;
    }

    .stage {
      position: relative;
      display: grid;
      justify-items: center;
      gap: 12px;
      padding-block-start: 20px;
    }

    .halo {
      position: absolute;
      inset-block-start: -48px;
      inline-size: 320px;
      block-size: 320px;
      border-radius: 50%;
      background: radial-gradient(closest-side, #7cc4ff4d, #7cc4ff1a 55%, transparent);
      opacity: calc(0.75 + var(--lvl) * 0.25);
      transition: opacity 0.2s ease-out;
      pointer-events: none;
    }

    .bora {
      position: relative;
      display: grid;
      place-items: center;
      inline-size: 184px;
      block-size: 184px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: scale 0.3s;
    }

    :host(.typing) .bora {
      scale: 0.6;
      margin-block: -37px;
    }

    .pace {
      position: absolute;
      inset: 0;
      rotate: -90deg;
    }

    .track {
      opacity: calc(0.5 + var(--lvl) * 0.5);
      transition: opacity 0.2s ease-out;
    }

    .send {
      animation: fill 1.5s linear forwards;
    }

    .count {
      animation: fill 5s linear reverse forwards;
    }

    .state {
      min-block-size: 20px;
      margin: 0;
      font-size: 15px;
      line-height: 20px;
      font-weight: 600;
      text-align: center;
      color: var(--w-ink-2);
    }

    .middle {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 12px;
      min-block-size: 0;
      padding: 16px 8px 8px;
      overflow-y: auto;
    }

    .you {
      align-self: flex-end;
      max-inline-size: 85%;
      margin: 0;
      font-size: 17px;
      line-height: 22px;
      text-align: end;
      color: var(--w-ink-3);
    }

    .cap {
      margin: 0;
      font-size: 28px;
      line-height: 36px;
      font-weight: 650;
    }

    .settled {
      font-size: 22px;
      line-height: 28px;
      font-weight: 600;
    }

    .said {
      color: rgb(255 255 255 / 0.9);
    }

    /* Lit, never heavier: a bolder word would reflow the line. */
    .now {
      text-shadow: 0 0 18px rgb(124 196 255 / 0.6);
      text-decoration: underline 3px rgb(124 196 255 / 0.85);
      text-underline-offset: 7px;
    }

    .next {
      color: rgb(255 255 255 / 0.56);
    }

    .tail {
      color: var(--w-ink-3);
    }

    .cards {
      display: grid;
      gap: 10px;
    }

    .sug {
      min-block-size: 52px;
      padding: 14px 18px;
      border-radius: 20px;
      background: var(--w-card);
      font-size: 16px;
      line-height: 22px;
      text-align: start;
    }

    .pre,
    .more {
      color: var(--w-ink-2);
    }

    .card {
      padding: 12px 14px;
      border-radius: 22px;
      background: var(--w-card);
    }

    .links {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .link,
    .pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-block-size: 44px;
      padding: 0 16px;
      border-radius: 22px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
    }

    .link {
      align-self: flex-start;
    }

    .pill {
      min-inline-size: 96px;
    }

    .more {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-block-size: 44px;
      margin-inline-start: auto;
      border: 0;
      background: none;
      font: inherit;
      font-size: 15px;
    }

    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .compose {
      display: grid;
      justify-items: end;
      gap: 8px;
      margin-block-end: var(--app-keyboard, 0px);
    }

    .compose app-bora-composer {
      justify-self: stretch;
    }

    :focus-visible {
      outline: 3px solid var(--w-accent);
      outline-offset: 2px;
    }

    @keyframes fill {
      from {
        stroke-dashoffset: 566;
      }
      to {
        stroke-dashoffset: 0;
      }
    }

    @media (prefers-reduced-transparency: reduce) {
      :host {
        --w-glass: #1c2233;
        --w-glass-2: #1c2233;
        --w-card: #1c2233;
        --w-blur: none;
      }
    }
  `,
})
export class BoraWorld {
  protected readonly bora = inject(BoraStore);
  private readonly fleet = inject(ListProjectsStore);
  private readonly alerts = inject(ListAlertsStore);
  private readonly notify = inject(NotifyService);
  private readonly sheets = inject(SheetService);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly composer = viewChild(BoraComposer);
  private readonly resting = boraPose();

  protected readonly reader = screenReader();
  private readonly hearing = canHear();
  protected readonly problemText = problemText;

  protected readonly take = signal<{ readonly heard: string; readonly follow: boolean } | null>(
    null,
  );
  private readonly voice = signal<{ readonly text: string; readonly at: Spoken | null } | null>(
    null,
  );
  protected readonly typing = signal(false);
  protected readonly beat = signal(0);
  protected readonly announced = signal('');
  private readonly asked = signal<Asked>('tap');

  private listening?: Subscription;
  private speaking?: Subscription;
  private sheet?: HTMLIonModalElement;

  protected readonly talk = this.bora.conversation;
  protected readonly last = computed(() => {
    const message = this.talk()?.messages.at(-1);
    return message?.role === 'assistant' ? message : undefined;
  });
  protected readonly question = computed(
    () => this.talk()?.messages.findLast(({ role }) => role === 'user')?.content ?? '',
  );
  protected readonly aloud = computed(() => this.bora.prefs().aloud && !this.reader());
  protected readonly mode = computed<Mode>(() => {
    const take = this.take();
    if (take) return take.follow ? 'follow' : 'listening';
    if (this.voice()) return 'talking';
    if (this.bora.busy()) return 'thinking';
    return this.last() ? 'answered' : 'ready';
  });
  protected readonly health = computed(() =>
    !this.fleet.live() ? 'offline' : this.alerts.unseenFailures().length ? 'attention' : 'calm',
  );
  protected readonly pose = computed<BoraState>(() => {
    const mode = this.mode();
    if (mode === 'listening' || mode === 'follow') return 'listen';
    if (mode === 'talking') return 'talk';
    return this.fleet.live() ? this.resting() : 'sleep';
  });
  protected readonly talkLabel = computed(() => {
    if (this.bora.ended()) return 'Bora can’t answer here';
    if (this.take()) return 'Send now';
    const mode = this.mode();
    return mode === 'thinking' || mode === 'talking' ? 'Interrupt Bora' : 'Talk to Bora';
  });
  protected readonly stateLine = computed(() => {
    if (this.typing()) return 'Typed questions get answers in captions';
    if (this.talk()?.problem?.kind === 'forbidden') {
      return 'Ask a project owner to add you as a member.';
    }
    switch (this.mode()) {
      case 'listening':
        return this.take()?.heard ? 'Pause to send' : 'Listening…';
      case 'follow':
        return 'Still listening…';
      case 'talking':
        return 'Tap Bora to interrupt';
      default:
        return this.hearing() ? 'Tap Bora to talk' : 'Type a question for Bora';
    }
  });
  protected readonly pill = computed(() => {
    switch (this.mode()) {
      case 'listening':
        return 'Cancel';
      case 'follow':
        return 'Done';
      case 'thinking':
      case 'talking':
        return 'Stop';
      case 'answered':
        return this.last()?.say ? 'Read aloud' : null;
      default:
        return null;
    }
  });
  protected readonly sending = computed(() => {
    const take = this.take();
    return take && !take.follow && take.heard ? [take.heard] : [];
  });
  protected readonly heardWords = computed(() => words(this.take()?.heard ?? ''));
  protected readonly caption = computed(() => {
    const voice = this.voice();
    const talk = this.talk();
    const said = talk?.asking ? talk.asking.say : talk?.problem ? '' : this.last()?.say;
    const text = voice?.text ?? said ?? '';
    if (!text) return null;
    const at = voice?.at;
    const line = at ? (sentences(text)[at.sentence] ?? '') : text;
    return {
      text,
      lang: this.lang(text),
      settled: !at,
      words: words(line).map((word, i) => ({
        text: word,
        state: !at || i < at.word ? 'said' : i === at.word ? 'now' : 'next',
      })),
    };
  });
  protected readonly again = computed(() =>
    this.bora.busy() || this.typing() ? '' : (this.talk()?.draft ?? ''),
  );
  protected readonly offered = computed(() => {
    const about = this.talk()?.about;
    const projects = this.fleet.summaries();
    const failure = freshFailure(this.alerts.unseenFailures(), projects);
    return about ? suggestions(about, projects, failure).slice(0, this.again() ? 2 : 3) : [];
  });
  protected readonly links = computed(() => {
    const about = this.talk()?.about;
    return about ? subjectLinks(about, this.alerts.alerts(), this.fleet.summaries()) : null;
  });

  constructor() {
    warmUp();
    this.follow();
    this.statusBar(SystemBarsStyle.Dark);
    afterNextRender(() => {
      const untrack = trackKeyboard(this.host);
      // The sheet and the light status bar leave with the world, not after its exit.
      const modal = this.host.closest('ion-modal');
      if (modal) {
        fromEvent(modal, 'ionModalWillDismiss')
          .pipe(take(1))
          .subscribe(() => {
            void this.sheet?.dismiss();
            this.statusBar(SystemBarsStyle.Default);
          });
      }
      this.destroyRef.onDestroy(untrack);
    });
    this.destroyRef.onDestroy(() => {
      this.endTake();
      this.stopVoice();
      void this.sheet?.dismiss();
    });
  }

  protected tapped(): void {
    unlockSpeech();
    if (!this.hearing()) return this.type();
    const take = this.take();
    if (take) return take.heard.trim() ? this.send(take.heard, 'voice') : this.endTake();
    if (this.mode() === 'thinking') this.bora.cancel();
    this.listen(false);
  }

  protected pillTapped(pill: string): void {
    unlockSpeech();
    if (pill === 'Read aloud') return this.say(this.last()?.say ?? '', true);
    if (pill !== 'Stop') return this.endTake();
    if (this.mode() === 'thinking') return this.bora.cancel();
    this.stopVoice();
  }

  protected toggleAloud(): void {
    if (this.reader()) return;
    this.bora.setPrefs({ aloud: !this.bora.prefs().aloud });
    if (!this.bora.prefs().aloud) this.stopVoice();
  }

  protected send(text: string, asked: Asked): void {
    unlockSpeech();
    this.endTake();
    this.cue('sent');
    this.asked.set(asked);
    this.bora.reply(text);
  }

  protected offer({ about, question }: Suggestion): void {
    unlockSpeech();
    this.cue('sent');
    this.asked.set('tap');
    this.bora.ask(about, question);
  }

  protected retry(): void {
    this.asked.set('tap');
    this.bora.retry();
  }

  protected type(): void {
    this.endTake();
    this.stopVoice();
    this.typing.set(true);
    afterNextRender(() => this.composer()?.focus(), { injector: this.injector });
  }

  protected typed(): void {
    this.asked.set('typed');
    this.typing.set(false);
  }

  protected outcome(line: string): void {
    this.announced.set(line);
    this.notify.haptic(true);
    if (!this.aloud() || this.asked() === 'typed') return;
    this.stopVoice();
    const { rate, voices } = this.bora.prefs();
    this.speaking = speak(line, { pace: rate, voice: voices.en }).subscribe();
  }

  protected openSheet(): void {
    if (this.sheet) return;
    this.sheets
      .present(BoraSheet, 'Conversation', {}, 0.66, 'ion-palette-dark')
      .subscribe((sheet) => {
        this.sheet = sheet;
        from(sheet.onWillDismiss()).subscribe(() => (this.sheet = undefined));
      });
  }

  protected hidden(): void {
    if (!this.host.ownerDocument.hidden) return;
    this.endTake();
    this.stopVoice();
  }

  protected lang(text: string): string | null {
    return isVietnamese(text) ? 'vi' : null;
  }

  private follow(): void {
    // The turn is its question's place: a re-attached turn is the same one, not a new one to say again.
    let turn: number | null = null;
    let said = '';
    effect(() => {
      const talk = this.talk();
      untracked(() => {
        const asking = talk?.asking;
        if (asking) {
          if (turn !== talk.messages.length) {
            turn = talk.messages.length;
            said = '';
            this.announced.set('');
          }
          if (asking.say === said) return;
          said = asking.say;
          return said ? this.say(said) : this.stopVoice();
        }
        if (turn === null) return;
        // Stopped or failed, the question went back and nothing was answered.
        const answer = (talk?.messages.length ?? 0) > turn ? this.last() : undefined;
        turn = null;
        if (!answer) return this.stopVoice();
        this.announced.set(answer.say ? `Bora: ${answer.say}` : 'Bora answered');
        if (!said && answer.say) this.say(answer.say);
      });
    });
  }

  private listen(follow: boolean): void {
    this.stopVoice();
    this.endTake();
    this.cue(follow ? 'follow' : 'listen');
    this.take.set({ heard: '', follow });
    const level = audioLevel().subscribe((value) => this.level(value));
    this.listening = hear(
      this.bora.prefs().language,
      taskHints(this.talk()?.about, this.fleet.summaries()),
    )
      .pipe(
        tap((heard) => {
          this.take.update((take) => take && { ...take, heard });
          if (!Capacitor.isNativePlatform()) this.level(1);
        }),
        endpoint(follow ? FOLLOW_MS : WAIT_MS),
        finalize(() => {
          level.unsubscribe();
          this.level(0);
        }),
      )
      .subscribe({
        next: (text) => this.send(text, 'voice'),
        complete: () => {
          if (!this.take()) return;
          this.take.set(null);
          if (!follow) this.failed('Didn’t catch that. Tap Bora to try again.');
        },
        error: (error: unknown) => {
          this.take.set(null);
          this.failed(hearingFailed(error));
        },
      });
  }

  private endTake(): void {
    this.listening?.unsubscribe();
    this.take.set(null);
  }

  private say(text: string, aloud = this.asked() !== 'typed' && this.aloud()): void {
    this.stopVoice();
    if (!text || !aloud) return;
    this.voice.set({ text, at: reduced() ? null : { sentence: 0, word: -1 } });
    const { rate, voices } = this.bora.prefs();
    this.speaking = speak(text, {
      pace: rate,
      voice: isVietnamese(text) ? voices.vi : voices.en,
    }).subscribe({
      next: (at) => {
        if (reduced()) return;
        this.voice.update((voice) => voice && { ...voice, at });
        this.beat.update((beat) => beat + 1);
      },
      complete: () => {
        this.voice.set(null);
        if (this.asked() === 'voice' && this.bora.prefs().follow && this.hearing()) {
          this.listen(true);
        }
      },
    });
  }

  private stopVoice(): void {
    this.speaking?.unsubscribe();
    this.voice.set(null);
  }

  /* The toast brings its own haptic. */
  private failed(message: string): void {
    this.cue('error');
    this.notify.failure(message);
  }

  private cue(sound: Chime): void {
    if (this.bora.prefs().aloud) chime(sound);
    if (sound === 'error' || !Capacitor.isNativePlatform()) return;
    void Haptics.impact({ style: sound === 'sent' ? ImpactStyle.Medium : ImpactStyle.Light });
  }

  private statusBar(style: SystemBarsStyle): void {
    if (Capacitor.isNativePlatform()) void SystemBars.setStyle({ style });
  }

  private level(value: number): void {
    this.host.style.setProperty('--lvl', value.toFixed(2));
  }
}
