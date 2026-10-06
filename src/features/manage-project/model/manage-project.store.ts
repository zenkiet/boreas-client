import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of } from 'rxjs';

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
import { CommandGate, CommandResult } from '@shared/api/command';
import { IS_ADMIN } from '@shared/api/role';

@Injectable()
export class ManageProjectStore {
  private readonly projectApi = inject(ProjectApi);
  private readonly credentialApi = inject(RegistryCredentialApi);
  private readonly userApi = inject(UserApi);
  private readonly isAdmin = inject(IS_ADMIN);
  private readonly gate = new CommandGate('Another project action is already running.');

  readonly busy = this.gate.busy;
  readonly createError = this.gate.error;

  /* Both lists are admin-only; null hides the pickers that need them. */
  private readonly usersResource = rxResource({
    params: () => this.isAdmin() !== false || undefined,
    stream: () => this.userApi.list().pipe(catchError(() => of<readonly User[] | null>(null))),
  });

  private readonly credentialsResource = rxResource({
    params: () => this.isAdmin() !== false || undefined,
    stream: () =>
      this.credentialApi
        .list()
        .pipe(catchError(() => of<readonly RegistryCredential[] | null>(null))),
  });

  /* Asked once About opens: a 409 means no Sourcebot. */
  private readonly codeWanted = signal(false);
  private readonly codeSearchResource = rxResource({
    params: () => (this.codeWanted() && this.isAdmin()) || undefined,
    stream: () =>
      this.projectApi.searchRepositories('').pipe(
        map(() => true),
        catchError((error: unknown) => of(mapApiError(error).kind !== 'conflict')),
      ),
  });

  readonly codeSearch = computed(
    () => !this.codeSearchResource.hasValue() || this.codeSearchResource.value(),
  );

  probeCodeSearch(): void {
    this.codeWanted.set(true);
  }

  readonly users = computed(() =>
    this.usersResource.hasValue() ? this.usersResource.value() : null,
  );
  readonly credentials = computed(() =>
    this.credentialsResource.hasValue() ? this.credentialsResource.value() : null,
  );

  create(input: CreateProjectInput): Observable<Project | undefined> {
    return this.gate.attempt(this.projectApi.create(input));
  }

  update(slug: string, input: UpdateProjectInput): Observable<CommandResult> {
    return this.gate.run(this.projectApi.update(slug, input), `Project ${slug} updated.`);
  }

  delete(slug: string): Observable<CommandResult> {
    return this.gate.run(this.projectApi.delete(slug), `Project ${slug} deleted.`);
  }

  /** The same POST adds or re-roles, so a role change only swaps the toast copy. */
  addMember(
    slug: string,
    input: AddMemberInput,
    done = 'Member added.',
  ): Observable<CommandResult> {
    return this.gate.run(this.projectApi.addMember(slug, input), done);
  }

  removeMember(slug: string, userId: string, username: string): Observable<CommandResult> {
    return this.gate.run(
      this.projectApi.removeMember(slug, userId),
      `${username} removed from the project.`,
    );
  }
}
