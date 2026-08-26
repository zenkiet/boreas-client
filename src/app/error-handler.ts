import { ErrorHandler, Injectable } from '@angular/core';

import { createLogger } from '@shared/lib/logging/logger';

/** Routes every uncaught error (global listeners included) through the structured logger. */
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly logger = createLogger('app');

  handleError(error: unknown): void {
    this.logger.error('Unhandled error', { error });
  }
}
