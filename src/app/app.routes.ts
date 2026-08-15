import { Routes } from '@angular/router';

import { serverConfiguredGuard } from '@shared/config/server-configured.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'welcome',
    loadChildren: () => import('./onboarding.routes').then((m) => m.onboardingRoutes),
  },
  {
    path: 'dashboard',
    title: 'Tasks | Boreas',
    canActivate: [serverConfiguredGuard],
    loadComponent: () =>
      import('@pages/dashboard/dashboard-page').then(({ DashboardPage }) => DashboardPage),
  },
  {
    path: 'search',
    title: 'Search | Boreas',
    canActivate: [serverConfiguredGuard],
    loadComponent: () => import('@pages/search/search-page').then(({ SearchPage }) => SearchPage),
  },
  {
    path: 'notifications',
    title: 'Notifications | Boreas',
    canActivate: [serverConfiguredGuard],
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
    canActivate: [serverConfiguredGuard],
    loadComponent: () =>
      import('@pages/settings/settings-page').then(({ SettingsPage }) => SettingsPage),
  },
  {
    path: 'tasks/new',
    title: 'Create task | Boreas',
    canActivate: [serverConfiguredGuard],
    loadComponent: () =>
      import('@pages/task-create/task-create-page').then(({ TaskCreatePage }) => TaskCreatePage),
  },
  {
    path: 'tasks/:id',
    title: 'Task | Boreas',
    canActivate: [serverConfiguredGuard],
    loadComponent: () =>
      import('@pages/task-detail/task-detail-page').then(({ TaskDetailPage }) => TaskDetailPage),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
