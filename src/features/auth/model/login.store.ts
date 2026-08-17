import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, defer, finalize, map, of, tap } from 'rxjs';

import { AuthApi, Credentials } from '@entities/user';
import { mapApiError } from '@shared/api/api-error';
import { SessionStore } from './session.store';

@Injectable()
export class LoginStore {
  private readonly api = inject(AuthApi);
  private readonly session = inject(SessionStore);
  private readonly signingInState = signal(false);
  private readonly errorState = signal<string | undefined>(undefined);

  readonly signingIn = this.signingInState.asReadonly();
  readonly error = this.errorState.asReadonly();

  signIn(credentials: Credentials): Observable<boolean> {
    return defer(() => {
      if (this.signingInState()) {
        return of(false);
      }

      this.signingInState.set(true);
      this.errorState.set(undefined);

      return this.api.login(credentials).pipe(
        tap((session) => this.session.signIn(session)),
        map(() => true),
        catchError((error: unknown) => {
          this.errorState.set(
            error instanceof HttpErrorResponse && error.status === 401
              ? 'Incorrect username or password.'
              : mapApiError(error).message,
          );
          return of(false);
        }),
        finalize(() => this.signingInState.set(false)),
      );
    });
  }
}
