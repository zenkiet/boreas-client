import { Service, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, map, tap } from 'rxjs';

import { Chat, ChatApi, ChatMessage, QUESTION_MAX, questionLength } from '@entities/chat';
import { ApiErrorKind, mapApiError } from '@shared/api/api-error';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { CommandResult, toCommandResult } from '@shared/api/command';
import { listView } from '@shared/api/resource-cache';

/** Per conversation; key `''` is New chat. */
export interface Turn {
  readonly draft: string;
  readonly asking?: { readonly question: string; readonly project: string; readonly since: number };
  /** Answers this session added, shown until the page's own read includes them. */
  readonly landed: readonly ChatMessage[];
  readonly problem?: { readonly kind: ApiErrorKind; readonly message: string };
  /** New chat only: the chat its answer created. */
  readonly started?: string;
}

const IDLE: Turn = { draft: '', landed: [] };

const PROBLEMS: Partial<Record<ApiErrorKind, string>> = {
  forbidden: 'Only project members can ask about its code',
  'not-found': 'This chat no longer exists',
  conflict:
    'Chat isn’t set up for this project yet. An admin adds repositories in project settings.',
};

/** Root, not page-provided: dropping a request drops its question, and chat writes send no event. */
@Service()
export class ChatsStore {
  private readonly api = inject(ChatApi);
  private readonly tokens = inject(AuthTokenStore);

  private readonly listRev = signal(0);
  private readonly listed = rxResource({
    params: () => {
      const token = this.tokens.token();
      return token ? { token, rev: this.listRev() } : undefined;
    },
    stream: () => this.api.list(),
  });

  private readonly list = listView<Chat>(this.listed, () => this.tokens.token());

  readonly chats = this.list.items;
  readonly loading = this.list.loading;
  readonly hasLoaded = this.list.hasLoaded;
  readonly error = this.list.error;

  /* Another account starts clean. */
  private readonly turns = linkedSignal<string | null, Readonly<Record<string, Turn>>>({
    source: this.tokens.token,
    computation: () => ({}),
  });

  load(): void {
    this.listRev.update((rev) => rev + 1);
  }

  turn(key: string): Turn {
    return this.turns()[key] ?? IDLE;
  }

  type(key: string, draft: string): void {
    this.patch(key, { draft });
  }

  /** Forgets New chat's last outcome: the chat it opened or its refusal. */
  settle(): void {
    this.patch('', { started: undefined, problem: undefined });
  }

  send(key: string, project: string): void {
    const { draft, asking } = this.turn(key);
    const question = draft.trim();
    if (!question || questionLength(question) > QUESTION_MAX || asking) return;

    const token = this.tokens.token();
    this.patch(key, {
      draft: '',
      asking: { question, project, since: Date.now() },
      problem: undefined,
      started: undefined,
    });

    const answer: Observable<{ id: string; messages: readonly ChatMessage[] }> = key
      ? this.api.ask(key, question).pipe(map((messages) => ({ id: key, messages })))
      : this.api.start(project, question);

    answer.subscribe({
      next: ({ id, messages }) => {
        if (this.tokens.token() !== token) return;
        this.patch(id, { landed: [...this.turn(id).landed, ...messages] });
        this.patch(key, { asking: undefined, started: key ? undefined : id });
        this.load();
      },
      /* The server saved nothing, so the question goes back into the field. */
      error: (error: unknown) => {
        if (this.tokens.token() !== token) return;
        /* On New chat a 404 is the project, not a chat: retryable like any failure. */
        const { kind } = mapApiError(error);
        const shown = key || kind !== 'not-found' ? kind : 'unknown';
        this.patch(key, {
          asking: undefined,
          draft: this.turn(key).draft || question,
          problem: {
            kind: shown,
            message: PROBLEMS[shown] ?? 'Couldn’t get an answer. Try again.',
          },
        });
      },
    });
  }

  remove(id: string): Observable<CommandResult> {
    return toCommandResult(this.api.remove(id), 'Chat deleted.').pipe(
      tap(({ success }) => {
        if (success) this.load();
      }),
    );
  }

  private patch(key: string, change: Partial<Turn>): void {
    this.turns.update((turns) => ({ ...turns, [key]: { ...(turns[key] ?? IDLE), ...change } }));
  }
}
