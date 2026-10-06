import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, Routes } from '@angular/router';

import { TWO_PANE_QUERY } from '@shared/ui/breakpoint/wide-screen';

/* Activity's two-pane width: a 13" iPad upright would squeeze the thread. */
const twoPane = () => inject(DOCUMENT).defaultView?.matchMedia(TWO_PANE_QUERY).matches ?? false;

const intoSplit = (route: ActivatedRouteSnapshot) =>
  !twoPane() ||
  inject(Router).createUrlTree(['/chats'], {
    queryParams: { chat: route.params['id'] ?? 'new', project: route.queryParams['project'] },
  });

const chatPage = () => import('@pages/chat/chat-page').then(({ ChatPage }) => ChatPage);

export const chatsRoutes: Routes = [
  {
    path: '',
    canMatch: [twoPane],
    title: 'Chat | Boreas',
    loadComponent: () => import('../chat-split').then(({ ChatSplit }) => ChatSplit),
  },
  {
    path: '',
    title: 'Chat | Boreas',
    loadComponent: () => import('@pages/chats/chats-page').then(({ ChatsPage }) => ChatsPage),
  },
  { path: 'new', title: 'New chat | Boreas', canActivate: [intoSplit], loadComponent: chatPage },
  { path: ':id', title: 'Chat | Boreas', canActivate: [intoSplit], loadComponent: chatPage },
];
