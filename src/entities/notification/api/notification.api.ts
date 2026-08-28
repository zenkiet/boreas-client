import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import { Notification } from '../model/notification';
import { NotificationsResponseDto } from './notification.dto';
import { toNotification } from './notification.mapper';

/* The server accepts 1-200 and rejects anything outside. */
const DEFAULT_LIMIT = 50;

@Service()
export class NotificationApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  /** Newest first. */
  list(project: string, limit = DEFAULT_LIMIT): Observable<readonly Notification[]> {
    return this.http
      .get<NotificationsResponseDto>(`${this.root(project)}?limit=${limit}`)
      .pipe(map((response) => (response.notifications ?? []).map(toNotification)));
  }

  /** Idempotent; ids outside the caller's visibility are a server-side no-op. */
  markSeen(project: string, id: string): Observable<void> {
    return this.http
      .post(`${this.root(project)}/${encodeURIComponent(id)}/seen`, null)
      .pipe(map(() => undefined));
  }

  private root(project: string): string {
    return `${this.config.baseUrl()}/api/v1/projects/${encodeURIComponent(project)}/notifications`;
  }
}
