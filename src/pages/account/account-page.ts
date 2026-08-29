import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiAppBar } from '@taiga-ui/layout';

import { SessionStore } from '@features/auth';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { BackLink } from '@shared/ui/back-link/back-link';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  selector: 'app-account-page',
  imports: [BackLink, InsetGroup, PageHeader, Reveal, RouterLink, TuiAppBar],
  template: `
    <div appReveal class="mx-auto grid w-full max-w-3xl grid-cols-1 gap-3.5 pb-16 md:gap-4 md:pb-0">
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <a tuiSlot="start" tuiAppBarBack routerLink="/settings" aria-label="Back to settings"></a>
          <span>Account</span>
        </tui-app-bar>
      </div>

      <header class="hidden md:block">
        <app-back-link link="/settings" label="Settings" />
        <app-page-header title="Account" />
      </header>

      @if (session.user(); as user) {
        <app-inset-group>
          <div class="lrow row-divider relative">
            <span class="lrow__label">Username</span>
            <span class="lrow__value">{{ user.username }}</span>
          </div>
          <div class="lrow row-divider relative">
            <span class="lrow__label">Email</span>
            <span class="lrow__value">{{ user.email }}</span>
          </div>
          <div class="lrow row-divider relative">
            <span class="lrow__label">Role</span>
            <span class="lrow__value">{{ user.role }}</span>
          </div>
        </app-inset-group>

        <div>
          <app-inset-group>
            <button type="button" class="lrow action-row row-divider relative" (click)="signOut()">
              Sign out
            </button>
          </app-inset-group>
          <p class="footnote">
            Accounts live on your server. Ask an administrator to change your details or password.
          </p>
        </div>
      }
    </div>
  `,
})
export class AccountPage {
  private readonly router = inject(Router);

  protected readonly session = inject(SessionStore);

  protected signOut(): void {
    this.session.signOut().subscribe(() => void this.router.navigate(['/login']));
  }
}
