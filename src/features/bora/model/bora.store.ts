import { DOCUMENT } from '@angular/common';
import { Service, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription, TimeoutError, timer } from 'rxjs';

import { BoraApi, type BoraEvent } from '@entities/bora/api';
import { BoraAbout, BoraMessage, BoraThread, defaultQuestion } from '@entities/bora/model';
import { ApiError, mapApiError } from '@shared/api/api-error';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import type { Language, Pace } from '@shared/ui/speech/voice';

const PREFS_KEY = 'boreas-bora';

export interface BoraPrefs {
  readonly show: boolean;
  readonly aloud: boolean;
  readonly follow: boolean;
  readonly language: Language;
  readonly rate: Pace;
  readonly voices: Readonly<Partial<Record<Language, string>>>;
}

const PREFS: BoraPrefs = {
  show: true,
  aloud: true,
  follow: true,
  language: 'en',
  rate: 'normal',
  voices: {},
};
/* A grantee, a server without an assistant, or a target that is gone: asking again changes nothing. */
const ENDED: ReadonlySet<string> = new Set(['forbidden', 'conflict', 'not-found']);
const same = (a: BoraAbout | undefined, b: BoraAbout) => JSON.stringify(a) === JSON.stringify(b);
const REATTACH_MS = 3000;

/** `id` stays null until the first answer is saved. */
export interface BoraConversation {
  readonly id: string | null;
  readonly title: string;
  readonly about: BoraAbout;
  readonly messages: readonly BoraMessage[];
  readonly asking: {
    readonly since: number;
    readonly step: string;
    readonly say: string;
    readonly text: string;
  } | null;
  readonly problem: ApiError | null;
  readonly draft: string;
}

type Turn = NonNullable<BoraConversation['asking']>;

const fresh = (about: BoraAbout): BoraConversation => ({
  id: null,
  title: '',
  about,
  messages: [],
  asking: null,
  problem: null,
  draft: '',
});

const question = (content: string): BoraMessage => ({
  index: -1,
  role: 'user',
  content,
  say: '',
  actions: [],
  choices: [],
  sources: [],
  at: new Date(),
});

/** Root: an answer outlives the page that asked. */
@Service()
export class BoraStore {
  private readonly api = inject(BoraApi);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly tokens = inject(AuthTokenStore);
  private request?: Subscription;
  private readonly refusal = new Subject<void>();
  readonly refused = this.refusal.asObservable();

  private readonly prefsState = signal<BoraPrefs>(this.readPrefs());
  readonly prefs = this.prefsState.asReadonly();

  /* Another account starts with no conversation. */
  private readonly talk = linkedSignal<string, BoraConversation | null>({
    source: this.tokens.token,
    computation: () => null,
  });

  readonly conversation = this.talk.asReadonly();
  readonly busy = computed(() => !!this.talk()?.asking);
  readonly ended = computed(() => ENDED.has(this.talk()?.problem?.kind ?? ''));
  readonly open = linkedSignal({ source: this.tokens.token, computation: () => false });
  readonly recent = signal(false);
  /** Asked before the layer loaded on idle: load it now. */
  readonly wanted = signal(false);
  readonly cheered = signal(0);
  readonly listening = signal(false);
  readonly unread = linkedSignal({ source: this.tokens.token, computation: () => false });

  constructor() {
    effect(() => this.writePrefs(this.prefsState()));
  }

  setPrefs(patch: Partial<BoraPrefs>): void {
    this.prefsState.update((prefs) => ({ ...prefs, ...patch }));
  }

  /** A subject with its answer opens it again; false, and `refused`, while one answers. */
  ask(about: BoraAbout, text = defaultQuestion(about)): boolean {
    if (this.busy()) {
      this.refusal.next();
      return false;
    }
    this.reveal();
    const talk = this.talk();
    if (!talk?.messages.length || !same(talk.about, about)) this.send(fresh(about), text);
    return true;
  }

  /** While one answers or waits unread, that one opens, wherever it was asked. */
  show(about: BoraAbout): void {
    if (!this.busy() && !this.unread() && !same(this.talk()?.about, about)) {
      this.talk.set(fresh(about));
    }
    this.reveal();
  }

  openSaved(id: string): void {
    if (this.busy()) return this.refusal.next();
    this.recent.set(false);
    // Read again even when it is the open one: another device may have asked since.
    this.attach(this.api.get(id), (thread) => this.load(thread));
  }

  forget(id?: string): void {
    const talk = this.talk();
    if (!talk?.id || (id && talk.id !== id)) return;
    this.request?.unsubscribe();
    this.talk.set(fresh(talk.about));
  }

  reply(text: string): void {
    const talk = this.talk();
    const asked = text.trim();
    if (!talk || talk.asking || !asked) return;
    this.send(talk, asked);
  }

  retry(): void {
    const talk = this.talk();
    if (talk?.draft) this.reply(talk.draft);
  }

  type(draft: string): void {
    this.talk.update((talk) => talk && { ...talk, draft });
  }

  /** Keeps a question in flight: its answer waits for the next open. */
  close(): void {
    this.open.set(false);
  }

  cancel(): void {
    const id = this.talk()?.id;
    // ponytail: a Stop before the first event names the conversation lets that turn finish; it lands in Recent.
    if (id) this.api.stop(id).subscribe({ error: () => undefined });
    this.request?.unsubscribe();
    this.putBack();
  }

  ran(message: BoraMessage, line: string): void {
    const id = this.talk()?.id;
    // Bookkeeping: a lost line only lets Bora suggest the same step again.
    if (id && message.index >= 0) {
      this.api.ran(id, message.index, line).subscribe({ error: () => undefined });
    }
  }

  private reveal(): void {
    this.wanted.set(true);
    this.open.set(true);
    this.recent.set(false);
    this.unread.set(false);
  }

  private send(talk: BoraConversation, text: string): void {
    this.talk.set({
      ...talk,
      messages: [...talk.messages, question(text)],
      asking: { since: Date.now(), step: '', say: '', text: '' },
      problem: null,
      draft: '',
    });
    const screen = this.router.url;
    this.attach(
      talk.id ? this.api.ask(talk.id, text, screen) : this.api.start(talk.about, text, screen),
      (event) => this.apply(event),
    );
  }

  /** One request at a time; anything late for a previous account is dropped. */
  private attach<T>(
    source: Observable<T>,
    next: (value: T) => void,
    fail = (error: unknown) => this.failed(error),
  ): void {
    const token = this.tokens.token();
    const mine = () => this.tokens.token() === token;
    this.request?.unsubscribe();
    this.request = source.subscribe({
      next: (value) => mine() && next(value),
      error: (error: unknown) => mine() && fail(error),
      // A turn still open when its stream ends ran on without us: fetch where it got to.
      complete: () => mine() && this.talk()?.asking && this.reattach(),
    });
  }

  private apply(event: BoraEvent): void {
    switch (event.type) {
      case 'conversation':
        return this.talk.update((talk) => talk && { ...talk, id: event.id });
      case 'step':
        return this.turn(() => ({ step: event.text }));
      case 'say':
        return this.turn(() => ({ say: event.text }));
      case 'delta':
        return this.turn(({ text }) => ({ text: text + event.text }));
      case 'reset':
        return this.turn(() => ({ say: '', text: '' }));
      case 'stopped':
        return this.putBack();
      case 'error':
        return this.putBack(event.problem);
      case 'done':
        this.talk.update(
          (talk) =>
            talk && {
              ...talk,
              title: event.title ?? talk.title,
              // The question takes its saved place, just before its answer.
              messages: [
                ...talk.messages.map((message, i) =>
                  i === talk.messages.length - 1
                    ? { ...message, index: event.message.index - 1 }
                    : message,
                ),
                event.message,
              ],
              asking: null,
            },
        );
        this.unread.set(!this.open());
    }
  }

  private turn(change: (turn: Turn) => Partial<Turn>): void {
    this.talk.update(
      (talk) =>
        talk && talk.asking && { ...talk, asking: { ...talk.asking, ...change(talk.asking) } },
    );
  }

  private load(thread: BoraThread): void {
    const pending = thread.answering;
    this.talk.set({
      id: thread.id,
      title: thread.title,
      about: thread.about,
      messages: pending ? [...thread.messages, question(pending.question)] : thread.messages,
      asking: pending && { since: pending.since.getTime(), step: '', say: '', text: '' },
      problem: null,
      draft: '',
    });
    if (pending) this.attach(this.api.follow(thread.id), (event) => this.apply(event));
  }

  private reattach(): void {
    const id = this.talk()?.id;
    const lost = () => this.putBack(mapApiError(null));
    if (!id) return lost();
    // A first turn that never saved answers 404 here: its question just goes back.
    this.attach(this.api.get(id), (thread) => this.load(thread), lost);
  }

  private failed(error: unknown): void {
    const talk = this.talk();
    const dropped = error instanceof TimeoutError || mapApiError(error).kind === 'network';
    // Dropped, not refused: the server kept answering, so look again once.
    if (dropped && talk?.asking && talk.id) {
      this.request = timer(REATTACH_MS).subscribe(() => this.reattach());
      return;
    }
    this.putBack(mapApiError(error));
  }

  private putBack(problem: ApiError | null = null): void {
    this.talk.update((talk) => {
      if (!talk?.asking) return talk && { ...talk, problem };
      const messages = talk.messages.slice(0, -1);
      return {
        ...talk,
        id: messages.length ? talk.id : null,
        messages,
        asking: null,
        problem,
        draft: talk.messages.at(-1)?.content ?? talk.draft,
      };
    });
    if (problem) this.unread.set(!this.open());
  }

  private readPrefs(): BoraPrefs {
    try {
      const saved = JSON.parse(
        this.document.defaultView?.localStorage.getItem(PREFS_KEY) ?? '{}',
      ) as Partial<BoraPrefs>;
      return {
        show: saved.show !== false,
        aloud: saved.aloud !== false,
        follow: saved.follow !== false,
        language: saved.language === 'vi' ? 'vi' : 'en',
        rate: saved.rate === 'slower' || saved.rate === 'faster' ? saved.rate : 'normal',
        voices: { vi: saved.voices?.vi, en: saved.voices?.en },
      };
    } catch {
      return PREFS;
    }
  }

  private writePrefs(prefs: BoraPrefs): void {
    try {
      this.document.defaultView?.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      return;
    }
  }
}
