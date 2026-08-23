import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, defer, finalize, map, of } from 'rxjs';

import { AddMemberInput, Member, ProjectApi } from '@entities/project';
import { User, UserApi } from '@entities/user';
import { mapApiError } from '@shared/api/api-error';
import { ProjectCommandResult } from './manage-project.store';

interface GrantTarget {
  readonly slug: string;
  readonly task: string;
}

@Injectable()
export class ManageGrantsStore {
  private readonly projectApi = inject(ProjectApi);
  private readonly userApi = inject(UserApi);
  private readonly target = signal<GrantTarget | null>(null);
  private readonly busyState = signal(false);

  readonly busy = this.busyState.asReadonly();

  /* Listing grants is owner-only, so a 403/404 doubles as the "hide the panel" signal. */
  private readonly grantsResource = rxResource({
    params: () => this.target() ?? undefined,
    stream: ({ params }) =>
      this.projectApi
        .grants(params.slug, params.task)
        .pipe(catchError(() => of<readonly Member[] | null>(null))),
  });

  /* 403s for non-admins; null sends the picker into its raw-id fallback. */
  private readonly usersResource = rxResource({
    stream: () => this.userApi.list().pipe(catchError(() => of<readonly User[] | null>(null))),
  });

  /** null hides the access panel: the viewer is not this project's owner. */
  readonly grants = computed(() =>
    this.grantsResource.hasValue() ? this.grantsResource.value() : null,
  );

  readonly users = computed(() =>
    this.usersResource.hasValue() ? this.usersResource.value() : null,
  );

  load(slug: string, task: string): void {
    this.target.set({ slug, task });
  }

  reload(): void {
    this.grantsResource.reload();
  }

  add(input: AddMemberInput): Observable<ProjectCommandResult> {
    const target = this.target();
    if (!target) return of({ success: false, message: 'No task selected.' });

    return this.execute(
      this.projectApi.addGrant(target.slug, target.task, input),
      'Access granted.',
    );
  }

  remove(userId: string, username: string): Observable<ProjectCommandResult> {
    const target = this.target();
    if (!target) return of({ success: false, message: 'No task selected.' });

    return this.execute(
      this.projectApi.removeGrant(target.slug, target.task, userId),
      `Access revoked for ${username}.`,
    );
  }

  private execute(
    command: Observable<unknown>,
    successMessage: string,
  ): Observable<ProjectCommandResult> {
    return defer(() => {
      if (this.busyState()) {
        return of({ success: false, message: 'Another access change is already running.' });
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
