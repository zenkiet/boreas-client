import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ServerConfigStore } from './server-config.store';

export const serverConfiguredGuard: CanActivateFn = () =>
  inject(ServerConfigStore).configured() ? true : inject(Router).createUrlTree(['/welcome']);
