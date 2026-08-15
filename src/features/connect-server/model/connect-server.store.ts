import { Injectable, inject, signal } from '@angular/core';
import { Observable, defer, finalize, tap } from 'rxjs';

import { HealthApi } from '@shared/api/health.api';
import { ServerConfigStore } from '@shared/config/server-config.store';

@Injectable()
export class ConnectServerStore {
  private readonly config = inject(ServerConfigStore);
  private readonly health = inject(HealthApi);
  private readonly checkingState = signal(false);

  readonly checking = this.checkingState.asReadonly();

  suggestedUrl(): string {
    return this.config.suggestedUrl();
  }

  connect(url: string): Observable<boolean> {
    return defer(() => {
      this.checkingState.set(true);

      return this.health.isHealthy(url).pipe(
        tap((healthy) => {
          if (healthy) this.config.set(url);
        }),
        finalize(() => this.checkingState.set(false)),
      );
    });
  }
}
