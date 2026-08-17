import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, defer, finalize, map, of } from 'rxjs';

import {
  AddMemberInput,
  CreateProjectInput,
  Project,
  ProjectApi,
  UpdateProjectInput,
} from '@entities/project';
import { RegistryCredential, RegistryCredentialApi } from '@entities/registry-credential';
import { User, UserApi } from '@entities/user';
import { mapApiError } from '@shared/api/api-error';

export interface ProjectCommandResult {
  readonly success: boolean;
  readonly message: string;
}

@Injectable()
export class ManageProjectStore {
  private readonly projectApi = inject(ProjectApi);
  private readonly credentialApi = inject(RegistryCredentialApi);
  private readonly userApi = inject(UserApi);
  private readonly busyState = signal(false);
  private readonly createErrorState = signal<string | undefined>(undefined);

  readonly busy = this.busyState.asReadonly();
  readonly createError = this.createErrorState.asReadonly();

  /* Both lists 403 for non-admins; null hides the pickers that need them. */
  private readonly usersResource = rxResource({
    stream: () =>
      this.userApi.list().pipe(catchError(() => of<readonly User[] | null>(null))),
  });

  private readonly credentialsResource = rxResource({
    stream: () =>
      this.credentialApi
        .list()
        .pipe(catchError(() => of<readonly RegistryCredential[] | null>(null))),
  });

  readonly users = computed(() =>
    this.usersResource.hasValue() ? this.usersResource.value() : null,
  );
  readonly credentials = computed(() =>
    this.credentialsResource.hasValue() ? this.credentialsResource.value() : null,
  );

  create(input: CreateProjectInput): Observable<Project | undefined> {
    return defer(() => {
      if (this.busyState()) return of(undefined);

      this.busyState.set(true);
      this.createErrorState.set(undefined);

      return this.projectApi.create(input).pipe(
        catchError((error: unknown) => {
          this.createErrorState.set(mapApiError(error).message);
          return of(undefined);
        }),
        finalize(() => this.busyState.set(false)),
      );
    });
  }

  update(slug: string, input: UpdateProjectInput): Observable<ProjectCommandResult> {
    return this.execute(this.projectApi.update(slug, input), `Project ${slug} updated.`);
  }

  delete(slug: string): Observable<ProjectCommandResult> {
    return this.execute(this.projectApi.delete(slug), `Project ${slug} deleted.`);
  }

  addMember(slug: string, input: AddMemberInput): Observable<ProjectCommandResult> {
    return this.execute(this.projectApi.addMember(slug, input), 'Member added.');
  }

  removeMember(slug: string, userId: string, username: string): Observable<ProjectCommandResult> {
    return this.execute(
      this.projectApi.removeMember(slug, userId),
      `${username} removed from the project.`,
    );
  }

  private execute(
    command: Observable<unknown>,
    successMessage: string,
  ): Observable<ProjectCommandResult> {
    return defer(() => {
      if (this.busyState()) {
        return of({ success: false, message: 'Another project action is already running.' });
      }

      this.busyState.set(true);

      return command.pipe(
        map(() => ({ success: true, message: successMessage })),
        catchError((error: unknown) => of({ success: false, message: mapApiError(error).message })),
        finalize(() => this.busyState.set(false)),
      );
    });
  }
}
