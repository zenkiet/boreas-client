import { Routes } from '@angular/router';

import { authenticatedGuard } from '@shared/api/authenticated.guard';
import { serverConfiguredGuard } from '@shared/config/server-configured.guard';

const guards = [serverConfiguredGuard, authenticatedGuard];

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'projects',
  },
  {
    path: 'welcome',
    loadChildren: () => import('./onboarding.routes').then((m) => m.onboardingRoutes),
  },
  {
    path: 'login',
    title: 'Sign in | Boreas',
    canActivate: [serverConfiguredGuard],
    loadComponent: () => import('@pages/login/login-page').then(({ LoginPage }) => LoginPage),
  },
  {
    path: 'projects',
    title: 'Projects | Boreas',
    canActivate: guards,
    loadComponent: () =>
      import('@pages/projects/projects-page').then(({ ProjectsPage }) => ProjectsPage),
  },
  {
    path: 'projects/new',
    title: 'New project | Boreas',
    canActivate: guards,
    loadComponent: () =>
      import('@pages/project-create/project-create-page').then(
        ({ ProjectCreatePage }) => ProjectCreatePage,
      ),
  },
  {
    path: 'projects/:slug',
    title: 'Project | Boreas',
    canActivate: guards,
    loadComponent: () =>
      import('@pages/project-detail/project-detail-page').then(
        ({ ProjectDetailPage }) => ProjectDetailPage,
      ),
  },
  {
    path: 'projects/:slug/tasks/new',
    title: 'Create task | Boreas',
    canActivate: guards,
    loadComponent: () =>
      import('@pages/task-create/task-create-page').then(({ TaskCreatePage }) => TaskCreatePage),
  },
  {
    path: 'projects/:slug/tasks/:name',
    title: 'Task | Boreas',
    canActivate: guards,
    loadComponent: () =>
      import('@pages/task-detail/task-detail-page').then(({ TaskDetailPage }) => TaskDetailPage),
  },
  {
    path: 'search',
    title: 'Search | Boreas',
    canActivate: guards,
    loadComponent: () => import('@pages/search/search-page').then(({ SearchPage }) => SearchPage),
  },
  {
    path: 'notifications',
    title: 'Notifications | Boreas',
    canActivate: guards,
    data: {
      icon: '@tui.bell',
      description: 'Realtime alerts for your tasks are on the way. Check back in a future update.',
    },
    loadComponent: () =>
      import('@pages/coming-soon/coming-soon-page').then(({ ComingSoonPage }) => ComingSoonPage),
  },
  {
    path: 'settings',
    title: 'Settings | Boreas',
    canActivate: guards,
    loadComponent: () =>
      import('@pages/settings/settings-page').then(({ SettingsPage }) => SettingsPage),
  },
  {
    path: 'settings/users',
    title: 'Users | Boreas',
    canActivate: guards,
    loadComponent: () => import('@pages/users/users-page').then(({ UsersPage }) => UsersPage),
  },
  {
    path: 'settings/registries',
    title: 'Registry credentials | Boreas',
    canActivate: guards,
    loadComponent: () =>
      import('@pages/registries/registries-page').then(({ RegistriesPage }) => RegistriesPage),
  },
  /* Pre-projects bookmarks land on the new home. */
  {
    path: 'dashboard',
    redirectTo: 'projects',
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
