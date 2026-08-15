import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

import { LogEntry, TaskLogApi, toLogEntry } from '@entities/task-log';

@Injectable()
export class LogStreamStore {
  private readonly api = inject(TaskLogApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly entriesState = signal<readonly LogEntry[]>([]);
  private readonly connectedState = signal(false);
  private readonly taskIdState = signal('');
  private eventSource?: EventSource;
  private reconnectTimer?: ReturnType<typeof setTimeout>;

  readonly entries = this.entriesState.asReadonly();
  readonly connected = this.connectedState.asReadonly();
  readonly downloadUrl = computed(() => {
    const taskId = this.taskIdState();
    return taskId ? this.api.downloadUrl(taskId) : '';
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.disconnect());
  }

  connect(taskId: string): void {
    if (taskId === this.taskIdState() && this.eventSource) return;

    this.disconnect();
    this.taskIdState.set(taskId);
    this.entriesState.set([]);
    this.open();
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = undefined;
    this.connectedState.set(false);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
  }

  private open(): void {
    const taskId = this.taskIdState();
    if (!taskId) return;

    const source = new EventSource(this.api.streamUrl(taskId));
    this.eventSource = source;
    source.onopen = () => this.connectedState.set(true);
    source.onmessage = (event) => this.receive(event.data);
    source.onerror = () => {
      this.connectedState.set(false);
      source.close();
      this.eventSource = undefined;
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = undefined;
        this.open();
      }, 3000);
    };
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
}
