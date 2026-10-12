import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, filter, map } from 'rxjs';

import { SseClient } from '@shared/api/sse';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { BoraAbout, BoraListItem, BoraThread } from '../model/bora';
import { BoraListDto, BoraThreadDto } from './bora.dto';
import { BoraEvent, toBoraEvent, toBoraListItem, toBoraThread } from './bora.mapper';

@Service()
export class BoraApi {
  private readonly http = inject(HttpClient);
  private readonly sse = inject(SseClient);
  private readonly config = inject(ServerConfigStore);

  private get root(): string {
    return `${this.config.baseUrl()}/api/v1/bora/conversations`;
  }

  private url(id: string, path = ''): string {
    return `${this.root}/${encodeURIComponent(id)}${path}`;
  }

  start(about: BoraAbout, question: string, screen?: string): Observable<BoraEvent> {
    return this.turn(this.root, { about, question, ...(screen && { screen }) });
  }

  ask(id: string, question: string, screen?: string): Observable<BoraEvent> {
    return this.turn(this.url(id, '/messages'), { question, ...(screen && { screen }) });
  }

  /** Completes empty when no turn runs. */
  follow(id: string): Observable<BoraEvent> {
    return this.turn(this.url(id, '/stream'));
  }

  stop(id: string): Observable<void> {
    return this.http.post(this.url(id, '/stop'), null).pipe(map(() => undefined));
  }

  list(query = ''): Observable<readonly BoraListItem[]> {
    const page = query
      ? this.http.post<BoraListDto>(`${this.root}/search`, { query })
      : this.http.get<BoraListDto>(this.root);
    return page.pipe(map(({ conversations }) => (conversations ?? []).map(toBoraListItem)));
  }

  get(id: string): Observable<BoraThread> {
    return this.http.get<BoraThreadDto>(this.url(id)).pipe(map(toBoraThread));
  }

  ran(id: string, index: number, line: string): Observable<void> {
    return this.http
      .post(this.url(id, `/messages/${index}/ran`), { line })
      .pipe(map(() => undefined));
  }

  remove(id?: string): Observable<void> {
    return this.http.delete(id ? this.url(id) : this.root).pipe(map(() => undefined));
  }

  private turn(href: string, body?: unknown): Observable<BoraEvent> {
    return this.sse.events(href, body).pipe(
      map(({ event, data }) => toBoraEvent(event, data)),
      filter((event): event is BoraEvent => event !== null),
    );
  }
}
