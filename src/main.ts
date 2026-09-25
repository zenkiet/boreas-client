import { bootstrapApplication } from '@angular/platform-browser';

import { createLogger } from '@shared/lib/logging/logger';
import { App } from './app/app';
import { appConfig } from './app/app.config';

const logger = createLogger('bootstrap');

/* The theme's tab-bar gesture needs crypto.randomUUID, absent on iOS < 15.4 and insecure http. */
crypto.randomUUID ??= () =>
  '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
  ) as ReturnType<Crypto['randomUUID']>;

bootstrapApplication(App, appConfig).catch((error: unknown) =>
  logger.error('Application bootstrap failed', { error }),
);
