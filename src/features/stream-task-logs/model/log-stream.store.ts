import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Observable, Subscription, catchError, map, of } from 'rxjs';

import { LogEntry, TaskLogApi, toLogEntry } from '@entities/task-log';

const RECONNECT_DELAY_MS = 3000;

/* The transport re-emits the whole body; past this size reconnect to drop the backlog. */
const MAX_BUFFER_CHARS = 1_500_000;

interface StreamTarget {
  readonly project: string;
  readonly name: string;
}

@Injectable()
export class LogStreamStore {
  private readonly api = inject(TaskLogApi);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly entriesState = signal<readonly LogEntry[]>([]);
  private readonly connectedState = signal(false);
  /* True only until the first byte or first failure; drives the console's spinner. */
  private readonly connectingState = signal(false);
  private readonly downloadingState = signal(false);
  private target?: StreamTarget;
  private subscription?: Subscription;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private consumed = 0;

  readonly entries = this.entriesState.asReadonly();
  readonly connected = this.connectedState.asReadonly();
  readonly connecting = this.connectingState.asReadonly();
  readonly downloading = this.downloadingState.asReadonly();

  constructor() {
    this.destroyRef.onDestroy(() => this.disconnect());
  }

  connect(project: string, name: string): void {
    if (this.target?.project === project && this.target.name === name && this.subscription) {
      return;
    }

    this.disconnect();
    this.target = { project, name };
    this.entriesState.set([]);
    this.connectingState.set(true);
    this.open();
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
    this.connectedState.set(false);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
  }

  /** Saves the tail through the authenticated API; a plain href cannot carry the token. */
  download(): Observable<boolean> {
    const target = this.target;

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
      catchError(() => {
        this.downloadingState.set(false);
        return of(false);
      }),
    );
  }

  private open(): void {
    const target = this.target;
    if (!target) return;

    this.consumed = 0;

    this.subscription = this.api.stream(target.project, target.name).subscribe({
      next: (text) => {
        this.connectedState.set(true);
        this.connectingState.set(false);
        this.consume(text);

        if (text.length > MAX_BUFFER_CHARS) {
          this.scheduleReconnect(0);
        }
      },
      error: () => {
        this.connectingState.set(false);
        this.scheduleReconnect(RECONNECT_DELAY_MS);
      },
      /* Boreas ends the stream once a container stops. */
      complete: () => {
        this.connectingState.set(false);
        this.scheduleReconnect(RECONNECT_DELAY_MS);
      },
    });
  }

  private scheduleReconnect(delay: number): void {
    this.disconnect();
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.open();
    }, delay);
  }

  /* Parse only the newly arrived complete frames of the cumulative SSE body. */
  private consume(text: string): void {
    const end = text.lastIndexOf('\n\n');
    if (end < this.consumed) return;

    const fresh = text.slice(this.consumed, end + 2);
    this.consumed = end + 2;

    for (const frame of fresh.split('\n\n')) {
      for (const line of frame.split('\n')) {
        if (line.startsWith('data:')) {
          this.receive(line.slice(5).trimStart());
        }
      }
    }
  }

  /* Reconnects replay the tail; message comparison preserves distinct lines sharing a timestamp. */
  private receive(data: string): void {
    const entry = toLogEntry(data);
    if (!entry) return;

    this.entriesState.update((entries) => {
      const newest = entries[entries.length - 1];

      if (newest && entry.timestamp < newest.timestamp) {
        return entries;
      }

      if (
        newest &&
        entry.timestamp === newest.timestamp &&
        entries.some((held) => held.timestamp === entry.timestamp && held.message === entry.message)
      ) {
        return entries;
      }

      return [...entries, entry].slice(-2000);
    });
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
