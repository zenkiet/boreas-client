import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonNote } from '@ionic/angular/ion-note';
import { NavController } from '@ionic/angular/nav-controller';

import { SessionStore } from '@features/auth';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';

@Component({
  selector: 'app-account-page',
  imports: [
    DatePipe,
    InsetGroup,
    IonBackButton,
    IonButtons,
    IonItem,
    IonLabel,
    IonNote,
    PAGE_CHROME,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/settings" /></ion-buttons>
        <ion-title>Account</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="mx-auto max-w-(--app-column)">
        <!-- Sign out must survive a failed profile load: on iPad this is the default pane. -->
        @if (session.user(); as user) {
          <div class="profile">
            <span class="avatar" aria-hidden="true">{{ user.username.slice(0, 2) }}</span>
            <span class="profile__name">{{ user.username }}</span>
            <span class="profile__role">{{
              user.role === 'admin' ? 'Administrator' : 'User'
            }}</span>
          </div>

          <app-inset-group>
            <ion-item>
              <ion-label>Username</ion-label>
              <ion-note slot="end" class="font-mono">{{ user.username }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Email</ion-label>
              <ion-note slot="end">{{ user.email }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Member since</ion-label>
              <ion-note slot="end" class="tabular">{{ user.createdAt | date: 'MMM y' }}</ion-note>
            </ion-item>
            <ion-note>
              Accounts live on your server. Ask an administrator to change your email or password.
            </ion-note>
          </app-inset-group>
        }

        <app-inset-group class="mt-3">
          <ion-item button [detail]="false" (click)="signOut()">
            <ion-label color="danger">Sign out</ion-label>
          </ion-item>
          <ion-note>Signs out this device only. Your API tokens keep working.</ion-note>
        </app-inset-group>
      </div>
    </ion-content>
  `,
  styles: `
    .profile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      margin-block: 0.5rem 0.625rem;
    }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 5.5rem;
      block-size: 5.5rem;
      margin-block-end: 0.625rem;
      border-radius: 999px;
      background: linear-gradient(160deg, #3b82f6, #4f46e5);
      color: #fff;
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .profile__name {
      font-size: 1.5rem;
      line-height: 1.875rem;
      font-weight: 700;
    }

    .profile__role {
      font-size: 0.9375rem;
      color: var(--app-text-secondary);
    }
  `,
})
export class AccountPage {
  private readonly navCtrl = inject(NavController);

  protected readonly session = inject(SessionStore);

  protected signOut(): void {
    /* Root, not a push: back from Login must not reopen a signed-out screen. */
    this.session.signOut().subscribe(() => void this.navCtrl.navigateRoot('/login'));
  }
}
