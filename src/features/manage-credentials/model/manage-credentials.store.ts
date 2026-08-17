import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, defer, finalize, map, of } from 'rxjs';

import {
  CreateRegistryCredentialInput,
  RegistryCredential,
  RegistryCredentialApi,
} from '@entities/registry-credential';
import { mapApiError } from '@shared/api/api-error';

export interface CredentialCommandResult {
  readonly success: boolean;
  readonly message: string;
}

@Injectable()
export class ManageCredentialsStore {
  private readonly api = inject(RegistryCredentialApi);
  private readonly busyState = signal(false);
  private readonly createErrorState = signal<string | undefined>(undefined);

  private readonly listResource = rxResource({
    stream: () => this.api.list(),
  });

  /* Keep the last good list when a reload fails. */
  private readonly current = linkedSignal<
    readonly RegistryCredential[] | undefined,
    readonly RegistryCredential[] | undefined
  >({
    source: () => (this.listResource.hasValue() ? this.listResource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value,
  });

  readonly credentials = computed(() => this.current() ?? []);
  readonly loading = this.listResource.isLoading;
  readonly hasLoaded = computed(() => this.current() !== undefined);
  readonly busy = this.busyState.asReadonly();
  readonly createError = this.createErrorState.asReadonly();

  readonly error = computed(() => {
    const error = this.listResource.error();
    return error ? mapApiError(error).message : undefined;
  });

  load(): void {
    this.listResource.reload();
  }

  create(input: CreateRegistryCredentialInput): Observable<RegistryCredential | undefined> {
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

  delete(credential: RegistryCredential): Observable<CredentialCommandResult> {
    return defer(() => {
      if (this.busyState()) {
        return of({ success: false, message: 'Another credential action is already running.' });
      }

      this.busyState.set(true);

      return this.api.delete(credential.id).pipe(
        map(() => ({ success: true, message: `Credential ${credential.name} deleted.` })),
        catchError((error: unknown) => of({ success: false, message: mapApiError(error).message })),
        finalize(() => this.busyState.set(false)),
      );
    });
  }
}
