import { EnvironmentProviders } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';

export function provideAppHttpClient(): EnvironmentProviders {
  return provideHttpClient(withFetch());
}
