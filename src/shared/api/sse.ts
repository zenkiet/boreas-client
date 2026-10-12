import { HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import {
  EMPTY,
  MonoTypeOperatorFunction,
  Observable,
  OperatorFunction,
  defer,
  finalize,
  from,
  map,
  mergeMap,
  repeat,
  retry,
  scan,
  switchMap,
  throwError,
  timeout,
  timer,
} from 'rxjs';

import { AuthTokenStore } from './auth-token.store';
import { expireSession } from './auth.interceptor';

const RECONNECT_MS = 3000;
/* Boreas sends a heartbeat every 15 s, so this much silence means the connection is dead. */
const SILENT_MS = 45_000;
/* Signed out, outranked or gone: reopening cannot help. A 409 (no container yet) can clear. */
const FINAL = new Set([401, 403, 404]);

export type SseParams = Readonly<Record<string, string | number | undefined>>;

export interface SseEvent {
  readonly event: string;
  readonly data: string;
}

/** fetch and a stream reader: HttpClient re-sends the whole body, EventSource cannot send the header. */
@Service()
export class SseClient {
  private readonly tokens = inject(AuthTokenStore);
  private readonly expire = expireSession();

  /** Each frame's data once ('' for a heartbeat); completes when the server ends the stream. */
  open(url: string, params: SseParams = {}): Observable<string> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) query.set(key, String(value));
    }
    /* toString, not .size: size is missing before iOS 17. */
    const search = query.toString();
    return this.events(search ? `${url}?${search}` : url).pipe(map(({ data }) => data));
  }

  /** Named events: a GET, or a POST of `body` as JSON. A 204 completes empty. */
  events(href: string, body?: unknown): Observable<SseEvent> {
    return defer(() => {
      const abort = new AbortController();
      const json = body !== undefined;
      return from(
        fetch(href, {
          method: json ? 'POST' : 'GET',
          headers: {
            Accept: 'text/event-stream',
            Authorization: `Bearer ${this.tokens.token()}`,
            ...(json && { 'Content-Type': 'application/json' }),
          },
          body: json ? JSON.stringify(body) : undefined,
          signal: abort.signal,
        }),
      ).pipe(
        switchMap((response) => {
          if (response.status === 401) this.expire();
          if (response.status === 204) return EMPTY;
          return response.ok && response.body
            ? /* The DOM typings' getReader overloads defeat RxJS's stream inference. */
              (from(response.body.pipeThrough(new TextDecoderStream())) as Observable<string>)
            : throwError(() => new HttpErrorResponse({ status: response.status, url: href }));
        }),
        sseEvents(),
        timeout({ each: SILENT_MS }),
        /* An idle read never settles by itself: aborting ends the request with the subscription. */
        finalize(() => abort.abort()),
      );
    });
  }
}

/** Reopens 3 s after a failure or an ended stream; errors only with a final status. */
export function reconnect<T>(): MonoTypeOperatorFunction<T> {
  return (stream) =>
    stream.pipe(
      retry({
        delay: (error: unknown) =>
          error instanceof HttpErrorResponse && FINAL.has(error.status)
            ? throwError(() => error)
            : timer(RECONNECT_MS),
      }),
      /* A server that ends the stream waits before the reopen, or it would hot-loop. */
      repeat({ delay: () => timer(RECONNECT_MS) }),
    );
}

function sseEvents(): OperatorFunction<string, SseEvent> {
  return (chunks) =>
    chunks.pipe(
      scan(
        ({ rest }, chunk) => {
          const frames = (rest + chunk).split(/\r?\n\r?\n/);
          return { rest: frames.pop() ?? '', frames };
        },
        { rest: '', frames: [] as string[] },
      ),
      mergeMap(({ frames }) => frames),
      map((frame) => {
        let event = 'message';
        const data: string[] = [];
        for (const line of frame.split(/\r?\n/)) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:'))
            data.push(line.slice(line.startsWith('data: ') ? 6 : 5));
        }
        return { event, data: data.join('\n') };
      }),
    );
}
