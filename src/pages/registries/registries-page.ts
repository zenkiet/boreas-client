import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiError, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiToastService } from '@taiga-ui/kit';
import { TuiAppBar } from '@taiga-ui/layout';
import { filter, switchMap, take } from 'rxjs';

import { RegistryCredential, RegistryKind } from '@entities/registry-credential';
import { CredentialCommandResult, ManageCredentialsStore } from '@features/manage-credentials';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { registerPullRefresh } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { BackLink } from '@shared/ui/back-link/back-link';
import { Callout } from '@shared/ui/callout/callout';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { GlassSelect, GlassSelectOption } from '@shared/ui/glass-select/glass-select';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

interface CredentialDraft {
  name: string;
  username: string;
  token: string;
}

@Component({
  selector: 'app-registries-page',
  imports: [
    BackLink,
    Callout,
    DatePipe,
    EmptyState,
    ErrorState,
    FormField,
    GlassSelect,
    InsetGroup,
    Reveal,
    SkeletonRows,
    RouterLink,
    TuiAppBar,
    TuiButton,
    TuiError,
    TuiIcon,
    TuiLoader,
  ],
  providers: [ManageCredentialsStore],
  template: `
    <div appReveal class="mx-auto grid w-full max-w-160 grid-cols-1 gap-3.5 md:gap-4">
      <!-- The scroll edge prevents content showing through Taiga's transparent app bar. -->
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <a tuiSlot="start" tuiAppBarBack routerLink="/settings" aria-label="Back to settings"></a>
          Registry credentials
        </tui-app-bar>
      </div>

      <div class="hidden md:block">
        <app-back-link link="/settings" label="Settings" />
        <h1 class="page-title mt-1.5">Registry credentials</h1>
      </div>

      <h1 class="page-title md:hidden">Registries</h1>

      @if (credentials.error() && !credentials.hasLoaded()) {
        <app-error-state [message]="credentials.error()!" (retry)="credentials.load()" />
      } @else {
        @if (credentials.loading() && !credentials.hasLoaded()) {
          <!-- The form below is local and stays live; only the credential rows wait. -->
          <app-inset-group label="Credentials">
            <app-skeleton-rows variant="member" label="Loading credentials" />
          </app-inset-group>
        } @else {
          <app-inset-group label="Credentials" [trailing]="summary()">
            @for (credential of credentials.credentials(); track credential.id) {
              <div class="row row-divider relative">
                <tui-icon class="row__icon icon-sm" icon="@tui.key-round" aria-hidden="true" />
                <span class="min-w-0 flex-1">
                  <span class="row__name">{{ credential.name }}</span>
                  <span class="row__sub">
                    {{ credential.registry === 'ghcr' ? 'ghcr.io' : 'Docker Hub' }} ·
                    {{ credential.username }} · added {{ credential.createdAt | date: 'MMM d, y' }}
                  </span>
                </span>
                <button
                  tuiIconButton
                  type="button"
                  size="s"
                  appearance="flat-grayscale"
                  [disabled]="credentials.busy()"
                  [attr.aria-label]="'Delete ' + credential.name"
                  (click)="deleteCredential(credential)"
                >
                  <tui-icon class="icon-sm" icon="@tui.trash-2" />
                </button>
              </div>
            } @empty {
              <app-empty-state
                icon="@tui.key-round"
                title="No credentials yet"
                description="Add a registry credential so projects can pull private images."
                [bordered]="false"
              />
            }
          </app-inset-group>
        }

        <div>
          <app-inset-group label="New credential">
            <form class="grid grid-cols-1" novalidate (submit)="onSubmit($event)">
              @if (credentials.createError(); as message) {
                <div class="p-3">
                  <app-callout tone="negative" role="alert">{{ message }}</app-callout>
                </div>
              }

              <div class="frow row-divider relative">
                <label class="frow__label" for="credential-name">Name</label>
                <input
                  id="credential-name"
                  class="frow__input"
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                  placeholder="ghcr"
                  [formField]="draft.name"
                />
                @if (fieldError(draft.name()); as message) {
                  <tui-error [error]="message" />
                }
              </div>

              <div class="frow frow--inline row-divider relative">
                <span class="frow__inline-label">Registry</span>
                <app-glass-select
                  ariaLabel="Registry"
                  [options]="registryOptions"
                  [value]="draftRegistry()"
                  [disabled]="credentials.busy()"
                  (valueChange)="pickRegistry($event)"
                />
              </div>

              <div class="frow row-divider relative">
                <label class="frow__label" for="credential-username">Username</label>
                <input
                  id="credential-username"
                  class="frow__input"
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                  [formField]="draft.username"
                />
                @if (fieldError(draft.username()); as message) {
                  <tui-error [error]="message" />
                }
              </div>

              <div class="frow row-divider relative">
                <label class="frow__label" for="credential-token">Access token</label>
                <input
                  id="credential-token"
                  class="frow__input"
                  type="password"
                  autocomplete="off"
                  [formField]="draft.token"
                />
                @if (fieldError(draft.token()); as message) {
                  <tui-error [error]="message" />
                }
              </div>

              <div class="row-divider relative flex justify-end p-3">
                <button
                  tuiButton
                  type="submit"
                  size="s"
                  appearance="primary"
                  [disabled]="credentials.busy()"
                >
                  @if (credentials.busy()) {
                    <tui-loader size="s" [inheritColor]="true" />
                  }
                  Add credential
                </button>
              </div>
            </form>
          </app-inset-group>
          <p class="footnote">
            The token is stored server-side and never shown again. Attach the credential to a
            project from that project's About tab.
          </p>
        </div>
      }
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6875rem 1rem;
      min-block-size: 3.5rem;
    }

    .row__icon {
      flex: none;
      color: var(--tui-text-tertiary);
    }

    .row__name {
      display: block;
      overflow: hidden;
      font-size: 1rem;
      font-weight: 600;
      color: var(--tui-text-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .row__sub {
      display: block;
      overflow: hidden;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .frow--inline {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-block-size: 3rem;
    }

    .frow__input {
      inline-size: 100%;
      margin: 0;
      border: 0;
      padding: 0;
      background: none;
      font: inherit;
      font-size: 1.0625rem;
      color: var(--tui-text-primary);
    }

    .frow__input:focus {
      outline: none;
    }

    .frow__input::placeholder {
      color: var(--tui-text-tertiary);
      opacity: 0.6;
    }
  `,
})
export class RegistriesPage {
  protected readonly credentials = inject(ManageCredentialsStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly toasts = inject(TuiToastService);

  private readonly model = signal<CredentialDraft>({ name: '', username: '', token: '' });
  protected readonly draftRegistry = signal<RegistryKind>('ghcr');

  protected readonly registryOptions: readonly GlassSelectOption[] = [
    { value: 'ghcr', label: 'ghcr.io' },
    { value: 'dockerhub', label: 'Docker Hub' },
  ];

  protected readonly draft = form(this.model, (path) => {
    required(path.name, { message: 'Name is required.' });
    required(path.username, { message: 'Username is required.' });
    required(path.token, { message: 'Access token is required.' });
  });

  protected readonly summary = computed(() => {
    const total = this.credentials.credentials().length;
    return `${total} ${total === 1 ? 'credential' : 'credentials'}`;
  });

  constructor() {
    registerPullRefresh({ busy: this.credentials.loading, trigger: () => this.credentials.load() });
  }

  protected pickRegistry(value: string): void {
    this.draftRegistry.set(value as RegistryKind);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();

    /* Signal Forms requires a promise-returning submit action. */
    void submit(this.draft, async () => {
      const draft = this.model();
      this.credentials
        .create({
          name: draft.name.trim(),
          registry: this.draftRegistry(),
          username: draft.username.trim(),
          token: draft.token,
        })
        .subscribe((credential) => {
          if (!credential) return;
          this.notify(`Credential ${credential.name} added.`, true);
          /* reset() clears touched and dirty too; setting the model alone would leave the
             emptied fields flagged as touched and light up every required error. */
          this.draft().reset({ name: '', username: '', token: '' });
          this.draftRegistry.set('ghcr');
          this.credentials.load();
        });
    });
  }

  protected deleteCredential(credential: RegistryCredential): void {
    this.confirmations
      .confirm({
        title: `Delete ${credential.name}?`,
        message: 'Projects still referencing this credential keep working until their next pull.',
        confirmLabel: 'Delete credential',
        destructive: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.credentials.delete(credential)),
      )
      .subscribe((result: CredentialCommandResult) => {
        this.notify(result.message, result.success);
        if (result.success) this.credentials.load();
      });
  }

  /* tui-error renders a generic fallback for any non-null empty value. */
  protected fieldError(state: {
    touched: () => boolean;
    errors: () => readonly { readonly message?: string }[];
  }): string | null {
    if (!state.touched()) return null;
    return state.errors()[0]?.message ?? null;
  }

  private notify(message: string, success: boolean): void {
    this.toasts
      .open(message, { appearance: success ? 'positive' : 'negative' })
      .pipe(take(1))
      .subscribe();
  }
}
