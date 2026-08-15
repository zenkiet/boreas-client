import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, finalize, forkJoin, map, of } from 'rxjs';

import { Task, TaskApi } from '@entities/task';
import { mapApiError } from '@shared/api/api-error';

interface TaskSnapshot {
  readonly task: Task;
  readonly environment: Readonly<Record<string, string>>;
}

@Injectable()
export class ViewTaskStore {
  private readonly api = inject(TaskApi);
  private readonly taskId = signal('');
  private readonly savingEnvironmentState = signal(false);
  private readonly saveError = signal<string | undefined>(undefined);

  private readonly snapshot = rxResource({
    params: () => this.taskId() || undefined,
    stream: ({ params }) =>
      forkJoin({
        task: this.api.get(params),
        environment: this.api.getEnvironment(params),
      }),
  });

  /* Keep stale data after reload failures, but never across task IDs. */
  private readonly current = linkedSignal<
    { readonly id: string; readonly value: TaskSnapshot | undefined },
    TaskSnapshot | undefined
  >({
    source: () => ({
      id: this.taskId(),
      value: this.snapshot.hasValue() ? this.snapshot.value() : undefined,
    }),
    computation: (source, previous) =>
      source.value ?? (previous && previous.source.id === source.id ? previous.value : undefined),
  });

  readonly task = computed(() => this.current()?.task);
  readonly environment = computed(() => this.current()?.environment ?? {});
  readonly loading = this.snapshot.isLoading;
  readonly savingEnvironment = this.savingEnvironmentState.asReadonly();
  readonly hasLoaded = computed(() => this.current() !== undefined);

  readonly error = computed(() => {
    const fetchError = this.snapshot.error();
    return this.saveError() ?? (fetchError ? mapApiError(fetchError).message : undefined);
  });

  readonly proxyUrl = computed(() => {
    const task = this.task();
    return task ? this.api.accessUrl(task.id) : '';
  });

  refresh(taskId: string): void {
    if (taskId === this.taskId()) {
      this.snapshot.reload();
      return;
    }
    this.taskId.set(taskId);
  }

  updateEnvironment(environment: Record<string, string>): Observable<string> {
    if (!this.taskId() || this.savingEnvironmentState()) {
      return of('An environment update is already running.');
    }

    this.savingEnvironmentState.set(true);
    this.saveError.set(undefined);

    return this.api.updateEnvironment(this.taskId(), { environment }).pipe(
      map((result) => {
        this.snapshot.update((value) => (value ? { ...value, environment: { ...environment } } : value));
        this.snapshot.reload();
        return `${result.message} (${result.status}).`;
      }),
      catchError((error: unknown) => {
        const message = mapApiError(error).message;
        this.saveError.set(message);
        return of(message);
      }),
      finalize(() => this.savingEnvironmentState.set(false)),
    );
  }
}
