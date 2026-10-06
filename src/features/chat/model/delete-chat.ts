import { inject } from '@angular/core';
import { Observable, filter, map, switchMap, tap } from 'rxjs';

import type { Chat } from '@entities/chat';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { NotifyService } from '@shared/ui/notify/notify';
import { ChatsStore } from './chats.store';

/** Confirms, deletes and toasts; emits only on success. Injection context only. */
export function chatDeleter(): (chat: Pick<Chat, 'id' | 'title'>) => Observable<void> {
  const confirmations = inject(ConfirmActionService);
  const notifications = inject(NotifyService);
  const chats = inject(ChatsStore);

  return (chat) =>
    confirmations
      .confirm({
        title: 'Delete this chat?',
        message: `“${chat.title}” and its answers are removed for good.`,
        confirmLabel: 'Delete',
        destructive: true,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => chats.remove(chat.id)),
        tap((result) => notifications.result(result)),
        filter(({ success }) => success),
        map(() => undefined),
      );
}
