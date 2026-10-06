import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import { Chat, ChatMessage } from '../model/chat';
import { ChatMessagesResponseDto, ChatResponseDto, ChatsResponseDto } from './chat.dto';
import { toChat, toChatMessage } from './chat.mapper';

/** No timeout: answers take up to 55 s, and cancelling drops the question. */
@Service()
export class ChatApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  private get root(): string {
    return `${this.config.baseUrl()}/api/v1/chats`;
  }

  private chatUrl(id: string): string {
    return `${this.root}/${encodeURIComponent(id)}`;
  }

  list(): Observable<readonly Chat[]> {
    return this.http
      .get<ChatsResponseDto>(this.root)
      .pipe(map((response) => (response.chats ?? []).map(toChat)));
  }

  get(id: string): Observable<Chat> {
    return this.http
      .get<ChatResponseDto>(this.chatUrl(id))
      .pipe(map((response) => toChat(response.chat)));
  }

  start(project: string, message: string): Observable<Chat> {
    return this.http
      .post<ChatResponseDto>(
        `${this.config.baseUrl()}/api/v1/projects/${encodeURIComponent(project)}/chats`,
        { message },
      )
      .pipe(map((response) => toChat(response.chat)));
  }

  ask(id: string, message: string): Observable<readonly ChatMessage[]> {
    return this.http
      .post<ChatMessagesResponseDto>(`${this.chatUrl(id)}/messages`, { message })
      .pipe(map((response) => (response.messages ?? []).map(toChatMessage)));
  }

  remove(id: string): Observable<void> {
    return this.http.delete(this.chatUrl(id)).pipe(map(() => undefined));
  }
}
