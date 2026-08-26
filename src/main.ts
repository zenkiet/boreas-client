import { bootstrapApplication } from '@angular/platform-browser';

import { createLogger } from '@shared/lib/logging/logger';
import { App } from './app/app';
import { appConfig } from './app/app.config';

const logger = createLogger('bootstrap');

bootstrapApplication(App, appConfig).catch((error: unknown) =>
  logger.error('Application bootstrap failed', { error }),
);
