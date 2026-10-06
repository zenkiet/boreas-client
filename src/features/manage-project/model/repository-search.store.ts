import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of } from 'rxjs';

import { ProjectApi } from '@entities/project';
import { mapApiError } from '@shared/api/api-error';

@Injectable()
export class RepositorySearchStore {
  private readonly api = inject(ProjectApi);

  readonly query = signal('');
  private readonly attempt = signal(0);

  private readonly search = rxResource({
    params: () => ({ query: this.query().trim(), attempt: this.attempt() }),
    stream: ({ params }) => this.api.searchRepositories(params.query),
  });

  readonly results = computed(() => (this.search.hasValue() ? this.search.value() : []));
  readonly loading = this.search.isLoading;
  readonly off = computed(() => mapApiError(this.search.error()).kind === 'conflict');
  readonly failed = computed(() => !!this.search.error() && !this.off());

  retry(): void {
    this.attempt.update((attempt) => attempt + 1);
  }

  /** The reason it failed, or undefined once saved; the server's 400 names nothing. */
  save(slug: string, repositories: readonly string[]): Observable<string | undefined> {
    return this.api.update(slug, { repositories }).pipe(
      map(() => undefined),
      catchError((error: unknown) => {
        const { kind, message } = mapApiError(error);
        return of(
          kind === 'invalid-input'
            ? 'Couldn’t save the list. A repository may have left Sourcebot since it was chosen; check the names and save again.'
            : message,
        );
      }),
    );
  }
}
