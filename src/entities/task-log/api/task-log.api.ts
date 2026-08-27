import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { streamSse } from '@shared/api/sse';
import { ServerConfigStore } from '@shared/config/server-config.store';

@Service()
export class TaskLogApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  private base(project: string, name: string): string {
    const root = this.config.baseUrl();
    return `${root}/api/v1/projects/${encodeURIComponent(project)}/tasks/${encodeURIComponent(name)}/logs`;
  }

  stream(project: string, name: string, tail = 100): Observable<string> {
    return streamSse(this.http, `${this.base(project, name)}/stream`, { tail });
  }

  download(project: string, name: string, tail = 10000): Observable<Blob> {
    return this.http.get(`${this.base(project, name)}?tail=${tail}&download=true`, {
      responseType: 'blob',
    });
  }
}
