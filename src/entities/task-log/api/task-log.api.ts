import {
  HttpClient,
  HttpDownloadProgressEvent,
  HttpEventType,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, filter, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';

@Injectable({ providedIn: 'root' })
export class TaskLogApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  private base(project: string, name: string): string {
    const root = this.config.baseUrl();
    return `${root}/api/v1/projects/${encodeURIComponent(project)}/tasks/${encodeURIComponent(name)}/logs`;
  }

  /** Cumulative SSE body; EventSource cannot send the auth header, so this rides progressive download. */
  stream(project: string, name: string, tail = 100): Observable<string> {
    return this.http
      .get(`${this.base(project, name)}/stream?tail=${tail}`, {
        headers: { Accept: 'text/event-stream' },
        observe: 'events',
        responseType: 'text',
        reportProgress: true,
      })
      .pipe(
        filter((event) => event.type === HttpEventType.DownloadProgress),
        map((event) => (event as HttpDownloadProgressEvent).partialText ?? ''),
      );
  }

  download(project: string, name: string, tail = 10000): Observable<Blob> {
    return this.http.get(`${this.base(project, name)}?tail=${tail}&download=true`, {
      responseType: 'blob',
    });
  }
}
