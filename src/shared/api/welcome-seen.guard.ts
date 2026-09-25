import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthTokenStore } from './auth-token.store';
import { WelcomeSeenStore } from './welcome-seen.store';

/* Only a first-ever visit meets the tour; a live token counts as seen. */
export const welcomeSeenGuard: CanActivateFn = () =>
  inject(WelcomeSeenStore).seen() || inject(AuthTokenStore).authenticated()
    ? true
    : inject(Router).createUrlTree(['/welcome']);
