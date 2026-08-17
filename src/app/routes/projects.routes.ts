import { Routes } from '@angular/router';

export const projectsRoutes: Routes = [
  {
    path: '',
    title: 'Projects | Boreas',
    loadComponent: () =>
      import('@pages/projects/projects-page').then(({ ProjectsPage }) => ProjectsPage),
  },
  {
    path: 'new',
    title: 'New project | Boreas',
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
