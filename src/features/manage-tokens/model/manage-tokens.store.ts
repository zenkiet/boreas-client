import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, defer, finalize, map, Observable, of } from 'rxjs';

import { ApiToken, ApiTokenApi, CreateApiTokenInput, CreatedApiToken } from '@entities/api-token';
import { mapApiError } from '@shared/api/api-error';
import { AuthTokenStore } from '@shared/api/auth-token.store';

export interface TokenCommandResult {
  readonly success: boolean;
  readonly message: string;
}

@Injectable()
export class ManageTokensStore {
  private readonly api = inject(ApiTokenApi);
  private readonly session = inject(AuthTokenStore);
  private readonly busyState = signal(false);
  private readonly createErrorState = signal<string | undefined>(undefined);

  private readonly listResource = rxResource({
    params: () => this.session.token() || undefined,
    stream: () => this.api.list(),
  });

  /* Keep the last good list when a reload fails, but never across sessions. */
  private readonly current = linkedSignal<
    { readonly token: string; readonly value: readonly ApiToken[] | undefined },
    readonly ApiToken[] | undefined
  >({
    source: () => ({
      token: this.session.token(),
      value: this.listResource.hasValue() ? this.listResource.value() : undefined,
    }),
    computation: (source, previous) =>
      source.value ??
      (previous && previous.source.token === source.token ? previous.value : undefined),
  });

  readonly tokens = computed(() => this.current() ?? []);
  readonly loading = this.listResource.isLoading;
  readonly hasLoaded = computed(() => this.current() !== undefined);
  readonly busy = this.busyState.asReadonly();
  readonly createError = this.createErrorState.asReadonly();

  readonly activeCount = computed(
    () => this.tokens().filter((token) => token.status === 'active').length,
  );

  readonly error = computed(() => {
    const error = this.listResource.error();
    return error ? mapApiError(error).message : undefined;
  });

  /** 403 here means the caller authenticated with an API token, not a login session. */
  readonly sessionRequired = computed(() => {
    const error = this.listResource.error();
    return error ? mapApiError(error).kind === 'forbidden' : false;
  });

  load(): void {
    this.listResource.reload();
  }

  create(input: CreateApiTokenInput): Observable<CreatedApiToken | undefined> {
    return defer(() => {
      if (this.busyState()) return of(undefined);

      this.busyState.set(true);
      this.createErrorState.set(undefined);

      return this.api.create(input).pipe(
        catchError((error: unknown) => {
          this.createErrorState.set(mapApiError(error).message);
          return of(undefined);
        }),
        finalize(() => this.busyState.set(false)),
      );
    });
  }

  revoke(token: ApiToken): Observable<TokenCommandResult> {
    return defer(() => {
      if (this.busyState()) {
        return of({ success: false, message: 'Another token action is already running.' });
      }

      this.busyState.set(true);

      return this.api.revoke(token.id).pipe(
        map(() => ({ success: true, message: `Token ${token.name} revoked.` })),
        catchError((error: unknown) => of({ success: false, message: mapApiError(error).message })),
        finalize(() => this.busyState.set(false)),
      );
    });
  }
}
