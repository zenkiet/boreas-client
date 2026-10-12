import { Injectable, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';

import { BoraApi } from '@entities/bora/api';
import type { BoraListItem } from '@entities/bora/model';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { toCommandResult } from '@shared/api/command';
import { listView } from '@shared/api/resource-cache';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { NotifyService } from '@shared/ui/notify/notify';
import { BoraStore } from './bora.store';

@Injectable()
export class BoraHistory {
  private readonly api = inject(BoraApi);
  private readonly bora = inject(BoraStore);
  private readonly tokens = inject(AuthTokenStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly notify = inject(NotifyService);

  readonly query = signal('');
  private readonly rev = signal(0);
  private readonly page = rxResource({
    params: () => {
      const token = this.tokens.token();
      return token ? { token, query: this.query().trim(), rev: this.rev() } : undefined;
    },
    stream: ({ params }) => this.api.list(params.query),
  });
  private readonly list = listView<BoraListItem>(this.page, () => this.tokens.token() ?? '');

  readonly items = this.list.items;
  readonly hasLoaded = this.list.hasLoaded;
  readonly error = this.list.error;

  reload(): void {
    this.rev.update((rev) => rev + 1);
  }

  remove(item?: BoraListItem): void {
    this.confirmations
      .confirm(
        item
          ? {
              title: 'Delete this conversation?',
              message: `“${item.title}” and its answers are removed for good.`,
              confirmLabel: 'Delete',
              destructive: true,
            }
          : {
              title: 'Delete all conversations?',
              message: 'Bora forgets every conversation you had. This can’t be undone.',
              confirmLabel: 'Delete all',
              destructive: true,
            },
      )
      .pipe(
        filter(Boolean),
        switchMap(() =>
          toCommandResult(
            this.api.remove(item?.id),
            item ? 'Conversation deleted.' : 'Conversations deleted.',
          ),
        ),
      )
      .subscribe((result) => {
        this.notify.result(result);
        if (!result.success) return;
        this.bora.forget(item?.id);
        this.reload();
      });
  }
}
