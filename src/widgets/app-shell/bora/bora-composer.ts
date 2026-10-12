import { Component, computed, effect, inject, output, viewChild } from '@angular/core';

import { BoraField } from '@entities/bora';
import { BoraStore } from '@features/bora/model';
import { ListProjectsStore } from '@features/list-projects/model';
import { dictation } from '@shared/ui/dictation/dictation';

import { taskHints } from './bora-chip';

@Component({
  selector: 'app-bora-composer',
  imports: [BoraField],
  template: `
    <app-bora-field
      label="Ask Bora"
      [draft]="bora.conversation()?.draft ?? ''"
      [placeholder]="placeholder()"
      [busy]="bora.busy()"
      [off]="bora.ended()"
      [mic]="mic()"
      (draftChange)="bora.type($event)"
      (send)="send()"
      (dictate)="dictation.toggle()"
    />
  `,
})
export class BoraComposer {
  protected readonly bora = inject(BoraStore);
  private readonly fleet = inject(ListProjectsStore);
  private readonly field = viewChild.required(BoraField);

  readonly sent = output();

  protected readonly dictation = dictation(
    () => this.bora.conversation()?.draft ?? '',
    (draft) => this.bora.type(draft),
    () => taskHints(this.bora.conversation()?.about, this.fleet.summaries()),
    () => this.bora.prefs().language,
  );
  protected readonly mic = computed(() =>
    this.dictation.supported() ? this.dictation.state() : null,
  );
  protected readonly placeholder = computed(() =>
    this.mic() === 'recording'
      ? 'Listening…'
      : this.bora.conversation()?.messages.at(-1)?.choices.length
        ? 'Or type your own answer'
        : this.bora.conversation()?.messages.length
          ? 'Ask a follow-up'
          : 'Ask Bora',
  );

  constructor() {
    effect(() => this.bora.listening.set(this.mic() === 'recording'));
  }

  protected send(): void {
    // Sending ends a take: a later result would refill the emptied field.
    this.dictation.cancel();
    this.bora.reply(this.bora.conversation()?.draft ?? '');
    this.sent.emit();
  }

  focus(): void {
    this.field().focus();
  }
}
