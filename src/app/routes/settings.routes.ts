import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { Route, Router, Routes, UrlSegment } from '@angular/router';

import { ManageCredentialsStore } from '@features/manage-credentials';
import { ManageTokensStore } from '@features/manage-tokens/model';
import { ManageUsersStore } from '@features/manage-users';
import { WIDE_QUERY } from '@shared/ui/breakpoint/wide-screen';

/* Decided per navigation: a rotation after landing keeps the layout it landed in. */
const wide = () => inject(DOCUMENT).defaultView?.matchMedia(WIDE_QUERY).matches ?? false;
const PANES = ['account', 'tokens', 'about', 'users', 'registries'];

/* Route-level stores: the list's counts and the panes beside it must share one instance. */
export const settingsRoutes: Routes = [
  {
    path: '',
    providers: [ManageTokensStore, ManageUsersStore, ManageCredentialsStore],
    children: [
      {
        path: '',
        canMatch: [wide],
        title: 'Settings | Boreas',
        loadComponent: () => import('../settings-split').then(({ SettingsSplit }) => SettingsSplit),
      },
      /* iPad: a deep link to a pane redirects into the split instead of pushing. */
      {
        path: ':pane',
        pathMatch: 'full',
        canMatch: [
          (_route: Route, [pane]: UrlSegment[]) =>
            wide() && PANES.includes(pane.path)
              ? inject(Router).createUrlTree(['/settings'], { queryParams: { pane: pane.path } })
              : false,
        ],
        children: [],
      },
      {
        path: '',
        title: 'Settings | Boreas',
        loadComponent: () =>
          import('@pages/settings/settings-page').then(({ SettingsPage }) => SettingsPage),
      },
      {
        path: 'account',
        title: 'Account | Boreas',
        loadComponent: () =>
          import('@pages/account/account-page').then(({ AccountPage }) => AccountPage),
      },
      {
        path: 'about',
        title: 'About | Boreas',
        loadComponent: () => import('@pages/about/about-page').then(({ AboutPage }) => AboutPage),
      },
      {
        path: 'users',
        title: 'Users | Boreas',
        loadComponent: () => import('@pages/users/users-page').then(({ UsersPage }) => UsersPage),
      },
      {
        path: 'registries',
        title: 'Registry credentials | Boreas',
        loadComponent: () =>
          import('@pages/registries/registries-page').then(({ RegistriesPage }) => RegistriesPage),
      },
      {
        path: 'tokens',
        title: 'API tokens | Boreas',
        loadComponent: () =>
          import('@pages/tokens/tokens-page').then(({ TokensPage }) => TokensPage),
      },
      {
        path: 'tokens/new',
        title: 'New API token | Boreas',
        loadComponent: () =>
          import('@pages/token-create/token-create-page').then(
            ({ TokenCreatePage }) => TokenCreatePage,
          ),
      },
    ],
  },
];
