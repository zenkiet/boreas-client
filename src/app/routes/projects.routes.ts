import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';

import { IS_ADMIN } from '@shared/api/role';

export const projectsRoutes: Routes = [
  {
    path: '',
    title: 'Home | Boreas',
    loadComponent: () =>
      import('@pages/projects/projects-page').then(({ ProjectsPage }) => ProjectsPage),
  },
  {
    path: 'new',
    title: 'New project | Boreas',
    canActivate: [() => inject(IS_ADMIN)() !== false || inject(Router).parseUrl('/projects')],
    loadComponent: () =>
      import('@pages/project-create/project-create-page').then(
        ({ ProjectCreatePage }) => ProjectCreatePage,
      ),
  },
  {
    path: ':slug',
    title: 'Project | Boreas',
    loadComponent: () =>
      import('@pages/project-detail/project-detail-page').then(
        ({ ProjectDetailPage }) => ProjectDetailPage,
      ),
  },
  {
    path: ':slug/tasks',
    loadChildren: () => import('./tasks.routes').then((m) => m.tasksRoutes),
  },
];
