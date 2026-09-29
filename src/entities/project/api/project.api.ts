import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { SseClient } from '@shared/api/sse';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { AddMemberInput, Member } from '../model/member';
import { CreateProjectInput, Project, UpdateProjectInput } from '../model/project';
import { GrantsResponseDto, MembersResponseDto, ProjectResponseDto } from './project.dto';
import {
  toAddMemberRequestDto,
  toCreateProjectRequestDto,
  toMember,
  toProject,
  toUpdateProjectRequestDto,
} from './project.mapper';

@Service()
export class ProjectApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);
  private readonly sse = inject(SseClient);

  /* Read per call so requests follow server changes without a reload. */
  private get root(): string {
    return `${this.config.baseUrl()}/api/v1/projects`;
  }

  private projectUrl(slug: string): string {
    return `${this.root}/${encodeURIComponent(slug)}`;
  }

  get(slug: string): Observable<Project> {
    return this.http
      .get<ProjectResponseDto>(this.projectUrl(slug))
      .pipe(map((response) => toProject(response.project)));
  }

  create(input: CreateProjectInput): Observable<Project> {
    return this.http
      .post<ProjectResponseDto>(this.root, toCreateProjectRequestDto(input))
      .pipe(map((response) => toProject(response.project)));
  }

  update(slug: string, input: UpdateProjectInput): Observable<Project> {
    return this.http
      .patch<ProjectResponseDto>(this.projectUrl(slug), toUpdateProjectRequestDto(input))
      .pipe(map((response) => toProject(response.project)));
  }

  /** Rejected with 409 while the project still owns tasks. */
  delete(slug: string): Observable<void> {
    return this.http.delete(this.projectUrl(slug)).pipe(map(() => undefined));
  }

  members(slug: string): Observable<readonly Member[]> {
    return this.http
      .get<MembersResponseDto>(`${this.projectUrl(slug)}/members`)
      .pipe(map((response) => (response.members ?? []).map(toMember)));
  }

  addMember(slug: string, input: AddMemberInput): Observable<void> {
    return this.http
      .post(`${this.projectUrl(slug)}/members`, toAddMemberRequestDto(input))
      .pipe(map(() => undefined));
  }

  removeMember(slug: string, userId: string): Observable<void> {
    return this.http
      .delete(`${this.projectUrl(slug)}/members/${encodeURIComponent(userId)}`)
      .pipe(map(() => undefined));
  }

  /** Owner-only; a grant raises one task's access, never lowers it. */
  grants(slug: string, task: string): Observable<readonly Member[]> {
    return this.http
      .get<GrantsResponseDto>(`${this.grantsUrl(slug, task)}`)
      .pipe(map((response) => (response.grants ?? []).map(toMember)));
  }

  addGrant(slug: string, task: string, input: AddMemberInput): Observable<void> {
    return this.http
      .post(this.grantsUrl(slug, task), toAddMemberRequestDto(input))
      .pipe(map(() => undefined));
  }

  removeGrant(slug: string, task: string, userId: string): Observable<void> {
    return this.http
      .delete(`${this.grantsUrl(slug, task)}/${encodeURIComponent(userId)}`)
      .pipe(map(() => undefined));
  }

  metricsStream(slug: string): Observable<string> {
    return this.sse.open(`${this.projectUrl(slug)}/metrics/stream`);
  }

  taskMetricsStream(slug: string, task: string): Observable<string> {
    return this.sse.open(
      `${this.projectUrl(slug)}/tasks/${encodeURIComponent(task)}/metrics/stream`,
    );
  }

  private grantsUrl(slug: string, task: string): string {
    return `${this.projectUrl(slug)}/tasks/${encodeURIComponent(task)}/grants`;
  }
}
