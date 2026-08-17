import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import { CreateUserInput, UpdateUserInput, User } from '../model/user';
import { UserResponseDto, UsersResponseDto } from './user.dto';
import { toCreateUserRequestDto, toUpdateUserRequestDto, toUser } from './user.mapper';

/** Administration surface; every call 403s for non-admin users. */
@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  private get root(): string {
    return `${this.config.baseUrl()}/api/v1/users`;
  }

  list(): Observable<readonly User[]> {
    return this.http
      .get<UsersResponseDto>(this.root)
      .pipe(map((response) => (response.users ?? []).map(toUser)));
  }

  create(input: CreateUserInput): Observable<User> {
    return this.http
      .post<UserResponseDto>(this.root, toCreateUserRequestDto(input))
      .pipe(map((response) => toUser(response.user)));
  }

  update(id: string, input: UpdateUserInput): Observable<User> {
    return this.http
      .patch<UserResponseDto>(`${this.root}/${encodeURIComponent(id)}`, toUpdateUserRequestDto(input))
      .pipe(map((response) => toUser(response.user)));
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete(`${this.root}/${encodeURIComponent(id)}`)
      .pipe(map(() => undefined));
  }
}
