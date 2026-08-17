import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, finalize, forkJoin, map, of } from 'rxjs';

import { Task, TaskApi } from '@entities/task';
import { mapApiError } from '@shared/api/api-error';

interface TaskRef {
  readonly project: string;
  readonly name: string;
}

interface TaskSnapshot {
  readonly task: Task;
  readonly environment: Readonly<Record<string, string>>;
}

@Injectable()
export class ViewTaskStore {
  private readonly api = inject(TaskApi);
  private readonly ref = signal<TaskRef | undefined>(undefined);
  private readonly savingEnvironmentState = signal(false);
  private readonly saveError = signal<string | undefined>(undefined);

  private readonly snapshot = rxResource({
    params: () => this.ref(),
    stream: ({ params }) =>
      forkJoin({
        task: this.api.get(params.project, params.name),
        environment: this.api.getEnvironment(params.project, params.name),
      }),
  });

  /* Keep stale data after reload failures, but never across task refs. */
  private readonly current = linkedSignal<
    { readonly key: string; readonly value: TaskSnapshot | undefined },
    TaskSnapshot | undefined
  >({
    source: () => ({
      key: this.key(),
      value: this.snapshot.hasValue() ? this.snapshot.value() : undefined,
    }),
    computation: (source, previous) =>
      source.value ?? (previous && previous.source.key === source.key ? previous.value : undefined),
  });

  readonly project = computed(() => this.ref()?.project ?? '');
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
    const ref = this.ref();
    return ref ? this.api.accessUrl(ref.project, ref.name) : '';
  });

  refresh(project: string, name: string): void {
    const ref = this.ref();
    if (ref && ref.project === project && ref.name === name) {
      this.snapshot.reload();
      return;
    }
    this.ref.set({ project, name });
  }

  updateEnvironment(environment: Record<string, string>): Observable<string> {
    const ref = this.ref();

    if (!ref || this.savingEnvironmentState()) {
      return of('An environment update is already running.');
    }

    this.savingEnvironmentState.set(true);
    this.saveError.set(undefined);

    return this.api.updateEnvironment(ref.project, ref.name, { environment }).pipe(
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

  private key(): string {
    const ref = this.ref();
    return ref ? `${ref.project}/${ref.name}` : '';
  }
}
