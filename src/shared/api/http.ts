import { EnvironmentProviders } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './auth.interceptor';

export function provideAppHttpClient(): EnvironmentProviders {
  return provideHttpClient(withFetch(), withInterceptors([authInterceptor]));
}
