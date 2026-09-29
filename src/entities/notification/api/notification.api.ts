import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import { Notification } from '../model/notification';
import { NotificationsResponseDto } from './notification.dto';
import { toNotification } from './notification.mapper';

@Service()
export class NotificationApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  private get root(): string {
    return `${this.config.baseUrl()}/api/v1/notifications`;
  }

  list(limit: number, before?: string): Observable<readonly Notification[]> {
    return this.http
      .get<NotificationsResponseDto>(this.root, { params: before ? { limit, before } : { limit } })
      .pipe(map((response) => (response.notifications ?? []).map(toNotification)));
  }

  markSeen(ids: readonly string[]): Observable<void> {
    return this.http.post(`${this.root}/seen`, { ids }).pipe(map(() => undefined));
  }
}
