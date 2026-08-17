import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthTokenStore } from './auth-token.store';

/* Matching the path instead of the origin keeps shared/api free of shared/config. */
const API_PATH = '/api/v1/';
const LOGIN_PATH = '/api/v1/auth/login';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokens = inject(AuthTokenStore);
  const router = inject(Router);

  const token = tokens.token();
  const outgoing =
    token && request.url.includes(API_PATH) && !request.url.endsWith(LOGIN_PATH)
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      /* An expired or revoked token turns every call into a 401; re-authenticate centrally. */
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !request.url.endsWith(LOGIN_PATH) &&
        tokens.authenticated()
      ) {
        tokens.clear();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
