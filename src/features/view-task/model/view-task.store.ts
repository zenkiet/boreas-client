import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, finalize, map, of } from 'rxjs';

import { Task, TaskApi } from '@entities/task';
import { mapApiError } from '@shared/api/api-error';
import { keepLastValue } from '@shared/api/resource-cache';

interface TaskRef {
  readonly project: string;
  readonly name: string;
}

@Injectable()
export class ViewTaskStore {
  private readonly api = inject(TaskApi);
  private readonly ref = signal<TaskRef | undefined>(undefined);
  private readonly savingEnvironmentState = signal(false);
  private readonly saveError = signal<string | undefined>(undefined);

  private readonly snapshot = rxResource({
    params: () => this.ref(),
    stream: ({ params }) => this.api.get(params.project, params.name),
  });

  /* Keep stale data after reload failures, but never across task refs. */
  private readonly current = keepLastValue<Task>(this.snapshot, () => this.key());

  readonly project = computed(() => this.ref()?.project ?? '');
  readonly task = this.current;
  readonly environment = computed(() => this.current()?.env ?? {});
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

  /**
   * Follows the two route inputs every task screen binds.
   *
   * Call from a page constructor: the effect belongs to that page's injection context,
   * not the store's, so it dies with the screen that opened it.
   */
  track(project: Signal<string>, name: Signal<string>): void {
    effect(() => {
      const slug = project();
      const task = name();
      if (slug && task) this.refresh(slug, task);
    });
  }

  refresh(project: string, name: string): void {
    const ref = this.ref();
    if (ref && ref.project === project && ref.name === name) {
      this.snapshot.reload();
      return;
    }
    this.ref.set({ project, name });
  }

  /* Applying always recreates; the deferred-apply option stays out of the env surface. */
  updateEnvironment(environment: Record<string, string>): Observable<string> {
    const ref = this.ref();

    if (!ref || this.savingEnvironmentState()) {
      return of('An environment update is already running.');
    }

    this.savingEnvironmentState.set(true);
    this.saveError.set(undefined);

    return this.api.update(ref.project, ref.name, { environment, autoRestart: true }).pipe(
      map((task) => {
        /* PATCH returns the fresh task, so no follow-up fetch is needed. */
        this.snapshot.update(() => task);
        return `Environment updated (${task.status}).`;
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
