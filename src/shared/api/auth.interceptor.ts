import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavController } from '@ionic/angular/nav-controller';
import { catchError, throwError } from 'rxjs';

import { AuthTokenStore } from './auth-token.store';

/* Matching the path instead of the origin keeps shared/api free of shared/config. */
const API_PATH = '/api/v1/';
const LOGIN_PATH = '/api/v1/auth/login';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokens = inject(AuthTokenStore);
  const navCtrl = inject(NavController);

  const token = tokens.token();
  const outgoing =
    token && request.url.includes(API_PATH) && !request.url.endsWith(LOGIN_PATH)
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !request.url.endsWith(LOGIN_PATH) &&
        tokens.authenticated()
      ) {
        tokens.clear();
        void navCtrl.navigateRoot('/login');
      }

      return throwError(() => error);
    }),
  );
};
