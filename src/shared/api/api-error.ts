import { HttpErrorResponse } from '@angular/common/http';

export type ApiErrorKind =
  | 'invalid-input'
  | 'not-found'
  | 'conflict'
  | 'server'
  | 'network'
  | 'unknown';

export interface ApiError {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly message: string;
}

export function mapApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return {kind: 'unknown', status: 0, message: 'An unexpected error occurred.'};
  }

  switch (error.status) {
    case 0:
      return {kind: 'network', status: 0, message: 'Boreas is unreachable. Check the server and try again.'};
    case 400:
      return {kind: 'invalid-input', status: 400, message: 'The request contains invalid data.'};
    case 404:
      return {kind: 'not-found', status: 404, message: 'The requested task was not found.'};
    case 409:
      return {kind: 'conflict', status: 409, message: 'The task changed state or is already transitioning. Wait for it to settle and try again.'};
    default:
      return {
        kind: error.status >= 500 ? 'server' : 'unknown',
        status: error.status,
        message: error.status >= 500 ? 'Boreas could not complete the request.' : 'The request failed.',
      };
  }
}
