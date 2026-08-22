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

  /** Newest first; only deploy outcomes are recorded. */
  list(project: string, limit = DEFAULT_LIMIT): Observable<readonly Notification[]> {
    const url = `${this.config.baseUrl()}/api/v1/projects/${encodeURIComponent(project)}/notifications?limit=${limit}`;
    return this.http
      .get<NotificationsResponseDto>(url)
      .pipe(map((response) => (response.notifications ?? []).map(toNotification)));
  }
}
