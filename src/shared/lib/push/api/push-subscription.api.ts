import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

// eslint-disable-next-line boundaries/dependencies -- push keeps its whole stack in one folder; deliberate crossing
import { ServerConfigStore } from '@shared/config/server-config.store';

@Service()
export class PushSubscriptionApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  private get root(): string {
    return `${this.config.baseUrl()}/api/v1/push/subscriptions`;
  }

  subscribe(token: string): Observable<void> {
    return this.http.post<void>(this.root, { token });
  }

  unsubscribe(token: string): Observable<void> {
    return this.http.delete<void>(`${this.root}/${encodeURIComponent(token)}`);
  }
}
