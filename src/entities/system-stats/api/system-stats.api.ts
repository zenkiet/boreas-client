import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import { SystemStats } from '../model/system-stats';
import { SystemStatsDto } from './system-stats.dto';
import { toSystemStats } from './system-stats.mapper';

@Service()
export class SystemStatsApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  get(): Observable<SystemStats> {
    return this.http
      .get<SystemStatsDto>(`${this.config.baseUrl()}/api/v1/stats`)
      .pipe(map(toSystemStats));
  }
}
