import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthTokenStore } from './auth-token.store';
import { WelcomeSeenStore } from './welcome-seen.store';

/* First visit ever meets the tour; a returning device (flag or live token) goes straight in. */
export const welcomeSeenGuard: CanActivateFn = () =>
  inject(WelcomeSeenStore).seen() || inject(AuthTokenStore).authenticated()
    ? true
    : inject(Router).createUrlTree(['/welcome']);
