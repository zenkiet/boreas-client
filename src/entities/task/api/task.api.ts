import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ServerConfigStore } from '@shared/config/server-config.store';
import {
  CreateTaskInput,
  EnvironmentUpdateResult,
  UpdateEnvironmentInput,
} from '../model/create-task-input';
import { Task } from '../model/task';
import { TaskStateAction } from '../model/task-state-action';
import {
  DeleteTaskResponseDto,
  TaskEnvironmentResponseDto,
  TaskListResponseDto,
  TaskResponseDto,
  TaskStateResponseDto,
  UpdateTaskEnvironmentResponseDto,
} from './task.dto';
import {
  toCreateTaskRequestDto,
  toEnvironmentUpdateResult,
  toTask,
  toUpdateEnvironmentRequestDto,
} from './task.mapper';

@Injectable({ providedIn: 'root' })
export class TaskApi {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ServerConfigStore);

  /* Read per call so requests follow server changes without a reload. */
  private get root(): string {
    return `${this.config.baseUrl()}/api/v1/tasks`;
  }

  private taskUrl(taskId: string): string {
    return `${this.root}/${encodeURIComponent(taskId)}`;
  }

  list(): Observable<readonly Task[]> {
    return this.http
      .get<TaskListResponseDto>(this.root)
      .pipe(map((response) => response.tasks.map(toTask)));
  }

  get(taskId: string): Observable<Task> {
    return this.http
      .get<TaskResponseDto>(this.taskUrl(taskId))
      .pipe(map((response) => toTask(response.task)));
  }

  create(input: CreateTaskInput): Observable<Task> {
    return this.http
      .post<TaskResponseDto>(this.root, toCreateTaskRequestDto(input))
      .pipe(map((response) => toTask(response.task)));
  }

  changeState(taskId: string, action: TaskStateAction): Observable<Task> {
    return this.http
      .put<TaskStateResponseDto>(`${this.taskUrl(taskId)}/state`, { action })
      .pipe(map((response) => toTask(response.task)));
  }

  delete(taskId: string): Observable<string> {
    return this.http
      .delete<DeleteTaskResponseDto>(this.taskUrl(taskId))
      .pipe(map((response) => response.message));
  }

  getEnvironment(taskId: string): Observable<Readonly<Record<string, string>>> {
    return this.http
      .get<TaskEnvironmentResponseDto>(`${this.taskUrl(taskId)}/env`)
      .pipe(map((response) => ({ ...response.env })));
  }

  updateEnvironment(
    taskId: string,
    input: UpdateEnvironmentInput,
  ): Observable<EnvironmentUpdateResult> {
    return this.http
      .put<UpdateTaskEnvironmentResponseDto>(
        `${this.taskUrl(taskId)}/env`,
        toUpdateEnvironmentRequestDto(input),
      )
      .pipe(map(toEnvironmentUpdateResult));
  }

  /** The per-task proxy route lives on the server root, not under /api. */
  accessUrl(taskId: string): string {
    return `${this.config.baseUrl()}/${encodeURIComponent(taskId)}/`;
  }
}
