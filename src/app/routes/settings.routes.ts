import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: '',
    title: 'Settings | Boreas',
    loadComponent: () =>
      import('@pages/settings/settings-page').then(({ SettingsPage }) => SettingsPage),
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
];
