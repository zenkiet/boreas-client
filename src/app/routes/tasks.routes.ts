import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, Routes } from '@angular/router';

import { ListProjectsStore } from '@features/list-projects/model';
import { atLeastRole } from '@shared/api/role';

export const tasksRoutes: Routes = [
  {
    path: 'new',
    title: 'New task | Boreas',
    canActivate: [
      ({ paramMap }: ActivatedRouteSnapshot) => {
        const slug = paramMap.get('slug') ?? '';
        const role = inject(ListProjectsStore)
          .summaries()
          .find(({ project }) => project.slug === slug)?.project.myRole;
        return (
          !role || atLeastRole(role, 'member') || inject(Router).createUrlTree(['/projects', slug])
        );
      },
    ],
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
    path: ':name/note',
    title: 'Note | Boreas',
    loadComponent: () =>
      import('@pages/task-note/task-note-page').then(({ TaskNotePage }) => TaskNotePage),
  },
  {
    path: ':name/edit',
    title: 'Edit task | Boreas',
    loadComponent: () =>
      import('@pages/task-edit/task-edit-page').then(({ TaskEditPage }) => TaskEditPage),
  },
];
