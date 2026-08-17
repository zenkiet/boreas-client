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
    loadChildren: () => import('./routes/onboarding.routes').then((m) => m.onboardingRoutes),
  },
  {
    path: 'login',
    title: 'Sign in | Boreas',
    canActivate: [serverConfiguredGuard],
    loadComponent: () => import('@pages/login/login-page').then(({ LoginPage }) => LoginPage),
  },
  {
    path: 'projects',
    canActivate: guards,
    loadChildren: () => import('./routes/projects.routes').then((m) => m.projectsRoutes),
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
    canActivate: guards,
    loadChildren: () => import('./routes/settings.routes').then((m) => m.settingsRoutes),
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
