import { Routes } from '@angular/router';

export const tasksRoutes: Routes = [
  {
    path: 'new',
    title: 'Create task | Boreas',
    loadComponent: () =>
      import('@pages/task-create/task-create-page').then(({ TaskCreatePage }) => TaskCreatePage),
  },
  {
    path: ':name',
    title: 'Task | Boreas',
    loadComponent: () =>
      import('@pages/task-detail/task-detail-page').then(({ TaskDetailPage }) => TaskDetailPage),
  },
  {
    path: ':name/edit',
    title: 'Edit task | Boreas',
    loadComponent: () =>
      import('@pages/task-edit/task-edit-page').then(({ TaskEditPage }) => TaskEditPage),
  },
];
