import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, computed, effect, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, combineLatest, defer, map, of, switchMap, tap } from 'rxjs';

import { LogEntry, TaskLogApi, toLogEntry } from '@entities/task-log';
import { reconnect } from '@shared/api/sse';
import { createLogger } from '@shared/lib/logging/logger';
import { onScreen } from '@shared/lib/pull-to-refresh/pull-to-refresh';

const MAX_LINES = 2000;

interface LogTarget {
  readonly project: string;
  readonly name: string;
}

@Injectable()
export class LogStreamStore {
  private readonly logger = createLogger('log-stream');
  private readonly api = inject(TaskLogApi);
  private readonly document = inject(DOCUMENT);
  private readonly target = signal<LogTarget | undefined>(undefined, { equal: sameTarget });
  /* Another task starts empty; the same one resumes after its newest line. */
  private readonly entriesState = linkedSignal<LogTarget | undefined, readonly LogEntry[]>({
    source: this.target,
    computation: () => [],
  });
  private readonly phase = signal<'connecting' | 'open' | 'down'>('connecting');
  private readonly downloadingState = signal(false);

  readonly entries = this.entriesState.asReadonly();
  readonly connected = computed(() => this.phase() === 'open');
  readonly connecting = computed(() => this.phase() === 'connecting');
  readonly downloading = this.downloadingState.asReadonly();

  constructor() {
    /* Page events, not an effect: covered or hidden, the stream must close. */
    combineLatest([onScreen(), toObservable(this.target)])
      .pipe(
        switchMap(([on, target]) => (on && target ? this.follow(target) : EMPTY)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  /** Call from the page constructor: the effect must die with the page. */
  watch(target: Signal<LogTarget | undefined>): void {
    effect(() => this.target.set(target()));
  }

  /** Through the API: a plain href cannot carry the token. */
  download(): Observable<boolean> {
    const target = this.target();

    if (!target || this.downloadingState()) {
      return of(false);
    }

    this.downloadingState.set(true);

    return this.api.download(target.project, target.name).pipe(
      map((blob) => {
        this.save(blob, `${target.project}-${target.name}.log`);
        this.downloadingState.set(false);
        return true;
      }),
      catchError((error: unknown) => {
        this.logger.error('Log download failed', { ...target, error });
        this.downloadingState.set(false);
        return of(false);
      }),
    );
  }

  private follow(target: LogTarget): Observable<unknown> {
    this.phase.set('connecting');

    /* Deferred: every reopen asks only for the lines after the newest one held. */
    return defer(() =>
      this.api.stream(target.project, target.name, this.entriesState().at(-1)?.timestamp),
    ).pipe(
      tap({
        next: (data) => {
          this.phase.set('open');
          const entry = toLogEntry(data);
          if (entry) this.entriesState.update((entries) => [...entries, entry].slice(-MAX_LINES));
        },
        error: (error: unknown) => {
          this.phase.set('down');
          this.logger.warn('Log stream failed; reconnecting', { ...target, error });
        },
        /* Boreas ends the stream once a container stops. */
        complete: () => this.phase.set('down'),
      }),
      reconnect(),
      catchError(() => EMPTY),
    );
  }

  private save(blob: Blob, filename: string): void {
    const view = this.document.defaultView;
    if (!view) return;

    const url = view.URL.createObjectURL(blob);
    const anchor = this.document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    view.URL.revokeObjectURL(url);
  }
}

function sameTarget(a: LogTarget | undefined, b: LogTarget | undefined): boolean {
  return a?.project === b?.project && a?.name === b?.name;
}
