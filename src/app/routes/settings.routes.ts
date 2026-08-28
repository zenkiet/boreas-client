import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: '',
    title: 'Settings | Boreas',
    loadComponent: () =>
      import('@pages/settings/settings-page').then(({ SettingsPage }) => SettingsPage),
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
    loadComponent: () => import('@pages/tokens/tokens-page').then(({ TokensPage }) => TokensPage),
  },
  {
    path: 'tokens/new',
    title: 'New API token | Boreas',
    loadComponent: () =>
      import('@pages/token-create/token-create-page').then(
        ({ TokenCreatePage }) => TokenCreatePage,
      ),
  },
];
