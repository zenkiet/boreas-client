import { NgComponentOutlet } from '@angular/common';
import { Component, Type, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { AboutPage } from '@pages/about/about-page';
import { AccountPage } from '@pages/account/account-page';
import { RegistriesPage } from '@pages/registries/registries-page';
import { SettingsPage } from '@pages/settings/settings-page';
import { TokensPage } from '@pages/tokens/tokens-page';
import { UsersPage } from '@pages/users/users-page';

const SETTINGS_PANES: Readonly<Record<string, Type<unknown>>> = {
  account: AccountPage,
  tokens: TokensPage,
  about: AboutPage,
  users: UsersPage,
  registries: RegistriesPage,
};

/** iPad settings split. Lives in `app` because it composes pages. */
@Component({
  selector: 'app-settings-split',
  imports: [NgComponentOutlet, SettingsPage],
  template: `
    <app-settings-page class="ion-page split__list" />
    <section class="split__pane">
      <ng-container *ngComponentOutlet="pane()" />
    </section>
  `,
  styles: `
    /* Take the theme's sidebar inset once for the split, and zero it for the two pages inside. */
    :host {
      display: grid !important;
      grid-template-columns: 23.75rem minmax(0, 1fr);
      padding-inline-start: var(--ios-theme-menu-width, var(--ios26-menu-width, 0px));
    }

    :host > * {
      --ios-theme-menu-width: 0px;
    }

    .split__list {
      position: relative;
    }

    .split__pane {
      position: relative;
    }

    /* A pane is not a push: it fills its box and has nothing to go back to. */
    :host ::ng-deep .split__pane > :not(ng-container) {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
    }

    :host ::ng-deep .split__pane ion-back-button {
      display: none;
    }

    /* Title on the cards' edge, not centred; !important beats the theme's split-pane padding. */
    :host ::ng-deep .split__pane ion-header > ion-toolbar {
      --padding-start: calc(max(0px, (100% - var(--app-column)) / 2) + 1.25rem) !important;
      --padding-end: calc(max(0px, (100% - var(--app-column)) / 2) + 1.25rem);
    }

    /* The global 12px-margin reset needs .ion-page, which panes are not. */
    :host ::ng-deep .split__pane ion-header > ion-toolbar > ion-buttons {
      margin-inline: 0;
    }

    :host ::ng-deep .split__pane ion-header ion-title {
      position: static;
      padding-inline: 0 !important;
      text-align: start;
      font-size: 1.375rem;
      line-height: 1.75rem;
      font-weight: 700;
    }
  `,
})
export class SettingsSplit {
  private readonly query = toSignal(inject(ActivatedRoute).queryParamMap);

  protected readonly pane = computed(
    () => SETTINGS_PANES[this.query()?.get('pane') ?? 'account'] ?? AccountPage,
  );
}
