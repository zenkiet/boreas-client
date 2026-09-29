import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, required, submit } from '@angular/forms/signals';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonInput } from '@ionic/angular/ion-input';
import { IonInputPasswordToggle } from '@ionic/angular/ion-input-password-toggle';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { filter, switchMap } from 'rxjs';

import { RegistryCredential, RegistryKind } from '@entities/registry-credential';
import { ListProjectsStore } from '@features/list-projects/model';
import { ManageCredentialsStore } from '@features/manage-credentials';
import { FieldStatus } from '@shared/lib/forms/field-status.directive';
import { PULL_REFRESH, PullRefreshSource } from '@shared/lib/pull-to-refresh/pull-to-refresh';
import { Callout } from '@shared/ui/callout/callout';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { EYE, EYE_SLASH } from '@shared/ui/glyph-urls';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { NotifyService } from '@shared/ui/notify/notify';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

interface CredentialDraft {
  name: string;
  username: string;
  token: string;
}

@Component({
  selector: 'app-registries-page',
  imports: [
    Callout,
    DatePipe,
    EmptyState,
    ErrorState,
    FieldStatus,
    FormField,
    InsetGroup,
    IonBackButton,
    IonButton,
    IonButtons,
    IonInput,
    IonInputPasswordToggle,
    IonItem,
    IonLabel,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    PAGE_CHROME,
    PULL_REFRESH,
    SkeletonRows,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/settings" /></ion-buttons>
        <ion-title>Registry credentials</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-refresher [appRefresh]="pull"><ion-refresher-content /></ion-refresher>

      <div class="mx-auto max-w-(--app-column)">
        @if (credentials.error() && !credentials.hasLoaded()) {
          <app-error-state
            class="m-5 block"
            [message]="credentials.error()!"
            (retry)="credentials.load()"
          />
        } @else {
          @if (credentials.loading() && !credentials.hasLoaded()) {
            <app-inset-group label="Credentials">
              <app-skeleton-rows variant="member" label="Loading credentials" />
            </app-inset-group>
          } @else {
            <app-inset-group label="Credentials" [trailing]="summary()">
              @for (credential of credentials.credentials(); track credential.id) {
                <ion-item>
                  <ion-label
                    ><span class="name">{{ credential.name }}</span></ion-label
                  >
                  <ion-note>
                    {{ credential.registry === 'ghcr' ? 'ghcr.io' : 'Docker Hub' }} · as
                    {{ credential.username }} · added {{ credential.createdAt | date: 'MMM d' }}
                  </ion-note>
                  <ion-button
                    slot="end"
                    fill="clear"
                    color="medium"
                    [disabled]="credentials.busy()"
                    [attr.aria-label]="'Delete ' + credential.name"
                    (click)="deleteCredential(credential)"
                  >
                    <span slot="icon-only" class="icon-[light--trash]" aria-hidden="true"></span>
                  </ion-button>
                </ion-item>
              } @empty {
                <app-empty-state
                  icon="icon-[light--key]"
                  title="No credentials yet"
                  description="Add a registry credential so projects can pull private images."
                  [bordered]="false"
                />
              }
              <ion-item>
                <button
                  type="button"
                  class="disclose"
                  [attr.aria-expanded]="adding()"
                  (click)="adding.set(!adding())"
                >
                  Add credential…
                </button>
              </ion-item>
            </app-inset-group>
          }

          @if (adding()) {
            @if (credentials.createError(); as message) {
              <app-callout class="m-5" tone="negative" role="alert">{{ message }}</app-callout>
            }

            <app-inset-group label="New credential">
              <ion-item>
                <ion-input
                  label="Name"
                  labelPlacement="stacked"
                  placeholder="e.g. ghcr-acme"
                  autocomplete="off"
                  autocapitalize="off"
                  [spellcheck]="false"
                  [formField]="draft.name"
                />
              </ion-item>
              <ion-item>
                <ion-select
                  label="Registry"
                  interface="popover"
                  [value]="draftRegistry()"
                  [disabled]="credentials.busy()"
                  (ionChange)="draftRegistry.set($event.detail.value)"
                >
                  <ion-select-option value="ghcr">ghcr.io</ion-select-option>
                  <ion-select-option value="dockerhub">Docker Hub</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item>
                <ion-input
                  label="Username"
                  labelPlacement="stacked"
                  autocomplete="off"
                  autocapitalize="off"
                  [spellcheck]="false"
                  [formField]="draft.username"
                />
              </ion-item>
              <ion-item>
                <ion-input
                  label="Access token"
                  labelPlacement="stacked"
                  type="password"
                  autocomplete="off"
                  [formField]="draft.token"
                >
                  <ion-input-password-toggle
                    slot="end"
                    color="medium"
                    [showIcon]="eye"
                    [hideIcon]="eyeSlash"
                  />
                </ion-input>
              </ion-item>
              <ion-item button [detail]="false" [disabled]="credentials.busy()" (click)="create()">
                <ion-label color="primary">Add credential</ion-label>
                @if (credentials.busy()) {
                  <ion-spinner slot="end" name="lines-small" />
                }
              </ion-item>
              <ion-note>
                The token is kept on the server and never shown again. Attach it to a project from
                that project’s About section.
              </ion-note>
            </app-inset-group>
          }
        }
      </div>
    </ion-content>
  `,
  styles: `
    .name {
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      line-height: 1.25rem;
      font-weight: 600;
    }
  `,
})
export class RegistriesPage {
  protected readonly eye = EYE;
  protected readonly eyeSlash = EYE_SLASH;
  protected readonly credentials = inject(ManageCredentialsStore);
  private readonly fleet = inject(ListProjectsStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly notifications = inject(NotifyService);

  private readonly model = signal<CredentialDraft>({ name: '', username: '', token: '' });
  protected readonly draftRegistry = signal<RegistryKind>('ghcr');
  protected readonly adding = signal(false);

  protected readonly pull: PullRefreshSource = {
    busy: this.credentials.loading,
    trigger: () => this.credentials.load(),
  };

  protected readonly draft = form(this.model, (path) => {
    required(path.name, { message: 'Name is required.' });
    required(path.username, { message: 'Username is required.' });
    required(path.token, { message: 'Access token is required.' });
  });

  protected readonly summary = computed(() => {
    const credentials = this.credentials.credentials();
    const total = `${credentials.length} ${credentials.length === 1 ? 'credential' : 'credentials'}`;

    /* Fleet cache only: a header label must not cost a 2 + N fan-out. */
    const ids = new Set(credentials.map((credential) => credential.id));
    const used = this.fleet
      .summaries()
      .filter(
        ({ project }) => project.registryCredentialId && ids.has(project.registryCredentialId),
      ).length;
    return used ? `${total} · used by ${used} ${used === 1 ? 'project' : 'projects'}` : total;
  });

  constructor() {
    /* The route-provided store outlives this page: reload and drop the last visit's error. */
    this.credentials.clearCreateError();
    this.credentials.load();
  }

  protected create(): void {
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
          this.notifications.success(`Credential ${credential.name} added.`);
          /* reset(), not a model write: submit left every field touched. */
          this.draft().reset({ name: '', username: '', token: '' });
          this.draftRegistry.set('ghcr');
          this.adding.set(false);
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
      .subscribe((result) => {
        this.notifications.result(result);
        if (result.success) this.credentials.load();
      });
  }
}
