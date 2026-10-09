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
import { entrance } from '@shared/ui/motion/page-motion';

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
    <!-- 'pane:' because tracking the bare key trips Angular's NG0956 warning. -->
    @for (key of [paneKey()]; track 'pane:' + key) {
      <section class="split__pane" [animate.enter]="fade()">
        <ng-container *ngComponentOutlet="pane()" />
      </section>
    }
  `,
  host: { class: 'split-view' },
})
export class SettingsSplit {
  private readonly query = toSignal(inject(ActivatedRoute).queryParamMap);

  protected readonly fade = entrance('fx-in');

  protected readonly paneKey = computed(() => this.query()?.get('pane') ?? 'account');
  protected readonly pane = computed(() => SETTINGS_PANES[this.paneKey()] ?? AccountPage);
}
