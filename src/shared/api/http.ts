import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders } from '@angular/core';

import { authInterceptor } from './auth.interceptor';

export function provideAppHttpClient(): EnvironmentProviders {
  return provideHttpClient(withFetch(), withInterceptors([authInterceptor]));
}
