import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import { CreateTaskInput, UpdateTaskInput } from '../model/create-task-input';
import { Task } from '../model/task';
import { TaskStateAction } from '../model/task-state-action';
import {
  DeleteTaskResponseDto,
  TaskListResponseDto,
  TaskResponseDto,
  TaskStateResponseDto,
} from './task.dto';
import { toCreateTaskRequestDto, toTask, toUpdateTaskRequestDto } from './task.mapper';

@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  /* Read per call so requests follow server changes without a reload. */
  private root(project: string): string {
    return `${this.config.baseUrl()}/api/v1/projects/${encodeURIComponent(project)}/tasks`;
  }

  private taskUrl(project: string, name: string): string {
    return `${this.root(project)}/${encodeURIComponent(name)}`;
  }

  list(project: string): Observable<readonly Task[]> {
    return this.http
      .get<TaskListResponseDto>(this.root(project))
      .pipe(map((response) => (response.tasks ?? []).map(toTask)));
  }

  get(project: string, name: string): Observable<Task> {
    return this.http
      .get<TaskResponseDto>(this.taskUrl(project, name))
      .pipe(map((response) => toTask(response.task)));
  }

  create(project: string, input: CreateTaskInput): Observable<Task> {
    return this.http
      .post<TaskResponseDto>(this.root(project), toCreateTaskRequestDto(input))
      .pipe(map((response) => toTask(response.task)));
  }

  changeState(project: string, name: string, action: TaskStateAction): Observable<Task> {
    return this.http
      .put<TaskStateResponseDto>(`${this.taskUrl(project, name)}/state`, { action })
      .pipe(map((response) => toTask(response.task)));
  }

  delete(project: string, name: string): Observable<string> {
    return this.http
      .delete<DeleteTaskResponseDto>(this.taskUrl(project, name))
      .pipe(map((response) => response.message));
  }

  /** Environment updates ride this too; the dedicated /env endpoints are gone. */
  update(project: string, name: string, input: UpdateTaskInput): Observable<Task> {
    return this.http
      .patch<TaskResponseDto>(this.taskUrl(project, name), toUpdateTaskRequestDto(input))
      .pipe(map((response) => toTask(response.task)));
  }

  /** The per-task proxy route lives on the server root, not under /api. */
  accessUrl(project: string, name: string): string {
    return `${this.config.baseUrl()}/${encodeURIComponent(project)}/${encodeURIComponent(name)}/`;
  }
}
