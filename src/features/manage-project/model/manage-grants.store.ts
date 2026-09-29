import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, of } from 'rxjs';

import { AddMemberInput, Member, ProjectApi } from '@entities/project';
import { User, UserApi } from '@entities/user';
import { CommandGate, CommandResult } from '@shared/api/command';
import { IS_ADMIN } from '@shared/api/role';

interface GrantTarget {
  readonly slug: string;
  readonly task: string;
}

@Injectable()
export class ManageGrantsStore {
  private readonly projectApi = inject(ProjectApi);
  private readonly userApi = inject(UserApi);
  private readonly isAdmin = inject(IS_ADMIN);
  private readonly target = signal<GrantTarget | null>(null);
  private readonly gate = new CommandGate('Another access change is already running.');

  readonly busy = this.gate.busy;

  /* Listing grants is owner-only, so a 403/404 doubles as the "hide the panel" signal. */
  private readonly grantsResource = rxResource({
    params: () => this.target() ?? undefined,
    stream: ({ params }) =>
      this.projectApi
        .grants(params.slug, params.task)
        .pipe(catchError(() => of<readonly Member[] | null>(null))),
  });

  /* Admin-only and needed once grants are; null sends the picker into its raw-id fallback. */
  private readonly usersResource = rxResource({
    params: () => (this.target() !== null && this.isAdmin() !== false) || undefined,
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

  /** The same POST grants or re-roles, so a role change only swaps the toast copy. */
  add(input: AddMemberInput, done = 'Access granted.'): Observable<CommandResult> {
    const target = this.target();
    if (!target) return of({ success: false, message: 'No task selected.' });

    return this.gate.run(this.projectApi.addGrant(target.slug, target.task, input), done);
  }

  remove(userId: string, username: string): Observable<CommandResult> {
    const target = this.target();
    if (!target) return of({ success: false, message: 'No task selected.' });

    return this.gate.run(
      this.projectApi.removeGrant(target.slug, target.task, userId),
      `Access revoked for ${username}.`,
    );
  }
}
