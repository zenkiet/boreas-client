import { Routes } from '@angular/router';

import { authenticatedGuard } from '@shared/api/authenticated.guard';
import { welcomeSeenGuard } from '@shared/api/welcome-seen.guard';
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
    data: { pullToRefresh: false },
    loadChildren: () => import('./routes/onboarding.routes').then((m) => m.onboardingRoutes),
  },
  {
    path: 'login',
    title: 'Sign in | Boreas',
    data: { pullToRefresh: false },
    canActivate: [serverConfiguredGuard, welcomeSeenGuard],
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
    title: 'Alerts | Boreas',
    canActivate: guards,
    loadComponent: () => import('@pages/alerts/alerts-page').then(({ AlertsPage }) => AlertsPage),
  },
  {
    path: 'settings',
    canActivate: guards,
    loadChildren: () => import('./routes/settings.routes').then((m) => m.settingsRoutes),
  },
  {
    path: 'legal',
    data: { pullToRefresh: false },
    loadChildren: () => import('./routes/legal.routes').then((m) => m.legalRoutes),
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
