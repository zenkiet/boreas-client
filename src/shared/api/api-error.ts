import { HttpErrorResponse } from '@angular/common/http';

export type ApiErrorKind =
  | 'invalid-input'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'server'
  | 'network'
  | 'unknown';

export interface ApiError {
  readonly kind: ApiErrorKind;
  readonly message: string;
}

export function mapApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return { kind: 'unknown', message: 'An unexpected error occurred.' };
  }

  switch (error.status) {
    case 0:
      return { kind: 'network', message: 'Boreas is unreachable. Check the server and try again.' };
    case 400:
      return { kind: 'invalid-input', message: 'The request contains invalid data.' };
    case 401:
      return { kind: 'unauthorized', message: 'Your session has expired. Sign in again.' };
    case 403:
      /* RBAC: 403 means visible but outranked; invisible things 404 instead. */
      return { kind: 'forbidden', message: 'Your role does not allow that.' };
    case 404:
      /* Deliberately silent on permissions: the server hides names it will not confirm. */
      return { kind: 'not-found', message: 'The requested item was not found.' };
    case 409:
      return {
        kind: 'conflict',
        message:
          'The request conflicts with the current state. Wait for it to settle and try again.',
      };
    default:
      return {
        kind: error.status >= 500 ? 'server' : 'unknown',
        message:
          error.status >= 500 ? 'Boreas could not complete the request.' : 'The request failed.',
      };
  }
}
