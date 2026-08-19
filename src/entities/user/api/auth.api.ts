import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import { Credentials, Session, User } from '../model/user';
import { LoginRequestDto, LoginResponseDto, UserResponseDto } from './user.dto';
import { toSession, toUser } from './user.mapper';

@Service()
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  /* Read per call so requests follow server changes without a reload. */
  private get root(): string {
    return `${this.config.baseUrl()}/api/v1/auth`;
  }

  /** The token is returned once and expires after 30 days. */
  login(credentials: Credentials): Observable<Session> {
    const body: LoginRequestDto = {
      username: credentials.username,
      password: credentials.password,
    };

    return this.http.post<LoginResponseDto>(`${this.root}/login`, body).pipe(map(toSession));
  }

  logout(): Observable<void> {
    return this.http.post(`${this.root}/logout`, {}).pipe(map(() => undefined));
  }

  me(): Observable<User> {
    return this.http
      .get<UserResponseDto>(`${this.root}/me`)
      .pipe(map((response) => toUser(response.user)));
  }
}
