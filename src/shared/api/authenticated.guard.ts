import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthTokenStore } from './auth-token.store';

export const authenticatedGuard: CanActivateFn = () =>
  inject(AuthTokenStore).authenticated() ? true : inject(Router).createUrlTree(['/login']);
