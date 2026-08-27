import { Injectable, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, of } from 'rxjs';

import {
  AddMemberInput,
  CreateProjectInput,
  Project,
  ProjectApi,
  UpdateProjectInput,
} from '@entities/project';
import { RegistryCredential, RegistryCredentialApi } from '@entities/registry-credential';
import { User, UserApi } from '@entities/user';
import { CommandGate, CommandResult } from '@shared/api/command';

export type ProjectCommandResult = CommandResult;

@Injectable()
export class ManageProjectStore {
  private readonly projectApi = inject(ProjectApi);
  private readonly credentialApi = inject(RegistryCredentialApi);
  private readonly userApi = inject(UserApi);
  private readonly gate = new CommandGate('Another project action is already running.');

  readonly busy = this.gate.busy;
  readonly createError = this.gate.error;

  /* Both lists 403 for non-admins; null hides the pickers that need them. */
  private readonly usersResource = rxResource({
    stream: () => this.userApi.list().pipe(catchError(() => of<readonly User[] | null>(null))),
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
    return this.gate.attempt(this.projectApi.create(input));
  }

  update(slug: string, input: UpdateProjectInput): Observable<ProjectCommandResult> {
    return this.gate.run(this.projectApi.update(slug, input), `Project ${slug} updated.`);
  }

  delete(slug: string): Observable<ProjectCommandResult> {
    return this.gate.run(this.projectApi.delete(slug), `Project ${slug} deleted.`);
  }

  addMember(slug: string, input: AddMemberInput): Observable<ProjectCommandResult> {
    return this.gate.run(this.projectApi.addMember(slug, input), 'Member added.');
  }

  removeMember(slug: string, userId: string, username: string): Observable<ProjectCommandResult> {
    return this.gate.run(
      this.projectApi.removeMember(slug, userId),
      `${username} removed from the project.`,
    );
  }
}
