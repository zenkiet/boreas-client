import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, Observable, of, timeout } from 'rxjs';

import { HealthDto } from './health.dto';

/* Onboarding fails fast so an invalid address does not leave the operator waiting. */
const HEALTH_TIMEOUT_MS = 4000;

@Service()
export class HealthApi {
  private readonly http = inject(HttpClient);

  /** A bare 2xx is not enough: SPA hosts answer unknown paths with index.html. */
  isHealthy(baseUrl: string): Observable<boolean> {
    return this.http.get<HealthDto>(`${baseUrl}/api/v1/health`).pipe(
      timeout(HEALTH_TIMEOUT_MS),
      map((body) => body?.status === 'healthy'),
      catchError(() => of(false)),
    );
  }

  /** undefined before server 1.11 or when it does not answer. */
  version(baseUrl: string): Observable<string | undefined> {
    return this.http.get<HealthDto>(`${baseUrl}/api/v1/health`).pipe(
      timeout(HEALTH_TIMEOUT_MS),
      map((body) => body?.version || undefined),
      catchError(() => of(undefined)),
    );
  }
}
