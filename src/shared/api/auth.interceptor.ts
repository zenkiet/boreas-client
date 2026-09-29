import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavController } from '@ionic/angular/nav-controller';
import { catchError, throwError } from 'rxjs';

import { AuthTokenStore } from './auth-token.store';

/* Matching the path instead of the origin keeps shared/api free of shared/config. */
const API_PATH = '/api/v1/';
const LOGIN_PATH = '/api/v1/auth/login';

/** The one 401 path, shared with the fetch-based SSE reader. Call in an injection context. */
export function expireSession(): () => void {
  const tokens = inject(AuthTokenStore);
  const navCtrl = inject(NavController);
  return () => {
    if (!tokens.authenticated()) return;
    tokens.clear();
    void navCtrl.navigateRoot('/login');
  };
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthTokenStore).token();
  const expire = expireSession();

  const outgoing =
    token && request.url.includes(API_PATH) && !request.url.endsWith(LOGIN_PATH)
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !request.url.endsWith(LOGIN_PATH)
      ) {
        expire();
      }

      return throwError(() => error);
    }),
  );
};
