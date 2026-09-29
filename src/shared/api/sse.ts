import { HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import {
  MonoTypeOperatorFunction,
  Observable,
  defer,
  finalize,
  from,
  repeat,
  retry,
  switchMap,
  throwError,
  timer,
} from 'rxjs';

import { AuthTokenStore } from './auth-token.store';
import { expireSession } from './auth.interceptor';
import { sseData } from './sse-data';

const RECONNECT_MS = 3000;
/* Signed out, outranked or gone: reopening cannot help. A 409 (no container yet) can clear. */
const FINAL = new Set([401, 403, 404]);

export type SseParams = Readonly<Record<string, string | number | undefined>>;

/** fetch and a stream reader: HttpClient re-sends the whole body, EventSource cannot send the header. */
@Service()
export class SseClient {
  private readonly tokens = inject(AuthTokenStore);
  private readonly expire = expireSession();

  /** Each frame's data once ('' for a heartbeat); completes when the server ends the stream. */
  open(url: string, params: SseParams = {}): Observable<string> {
    return defer(() => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) query.set(key, String(value));
      }
      /* toString, not .size: size is missing before iOS 17. */
      const search = query.toString();
      const href = search ? `${url}?${search}` : url;
      const abort = new AbortController();

      return from(
        fetch(href, {
          headers: { Accept: 'text/event-stream', Authorization: `Bearer ${this.tokens.token()}` },
          signal: abort.signal,
        }),
      ).pipe(
        switchMap((response) => {
          if (response.status === 401) this.expire();
          return response.ok && response.body
            ? /* The DOM typings' getReader overloads defeat RxJS's stream inference. */
              (from(response.body.pipeThrough(new TextDecoderStream())) as Observable<string>)
            : throwError(() => new HttpErrorResponse({ status: response.status, url: href }));
        }),
        sseData(),
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
