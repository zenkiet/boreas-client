import { Injectable, inject } from '@angular/core';

import { ServerConfigStore } from '@shared/config/server-config.store';

@Injectable({ providedIn: 'root' })
export class TaskLogApi {
  private readonly config = inject(ServerConfigStore);

  private base(taskId: string): string {
    return `${this.config.baseUrl()}/api/v1/tasks/${encodeURIComponent(taskId)}/logs`;
  }

  downloadUrl(taskId: string, tail = 10000): string {
    return `${this.base(taskId)}?tail=${tail}&download=true`;
  }

  streamUrl(taskId: string, tail = 100): string {
    return `${this.base(taskId)}/stream?tail=${tail}`;
  }
}
