import { Service, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, catchError, defer, finalize, map, of } from 'rxjs';

import { AuthApi, Session, User } from '@entities/user';
import { AuthTokenStore } from '@shared/api/auth-token.store';

@Service()
export class SessionStore {
  private readonly tokens = inject(AuthTokenStore);
  private readonly api = inject(AuthApi);

  /* Login already returns the user; seeding avoids a blank header while /auth/me runs. */
  private readonly seeded = signal<User | undefined>(undefined);

  private readonly profile = rxResource({
    params: () => this.tokens.token() || undefined,
    stream: () => this.api.me(),
  });

  readonly authenticated = this.tokens.authenticated;
  readonly user = computed(() => (this.profile.hasValue() ? this.profile.value() : this.seeded()));
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  signIn(session: Session): void {
    this.seeded.set(session.user);
    this.tokens.set(session.token);
  }

  /** Best-effort revocation; the local token is cleared no matter what the server says. */
  signOut(): Observable<void> {
    return defer(() => this.api.logout()).pipe(
      catchError(() => of(undefined)),
      map(() => undefined),
      finalize(() => {
        this.tokens.clear();
        this.seeded.set(undefined);
      }),
    );
  }
}
