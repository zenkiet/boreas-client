import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, Observable, of, timeout } from 'rxjs';

import { HealthDto } from './health.dto';

/* Onboarding fails fast so an invalid address does not leave the operator waiting. */
const HEALTH_TIMEOUT_MS = 4000;

@Service()
export class HealthApi {
  private readonly http = inject(HttpClient);

  /** Requires Boreas JSON because SPA hosts often return index.html with 200 for unknown paths. */
  isHealthy(baseUrl: string): Observable<boolean> {
    return this.http.get<HealthDto>(`${baseUrl}/api/v1/health`).pipe(
      timeout(HEALTH_TIMEOUT_MS),
      map((body) => body?.status === 'healthy'),
      catchError(() => of(false)),
    );
  }
}
