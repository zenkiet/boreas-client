import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';

import { QUESTION_MAX, questionLength } from '@entities/chat';
import { desktopScreen } from '@shared/ui/breakpoint/wide-screen';

const COUNT_FROM = 1800;

@Component({
  selector: 'app-chat-composer',
  template: `
    <div class="box">
      <textarea
        #field
        class="field"
        rows="1"
        [value]="draft()"
        [placeholder]="placeholder()"
        [disabled]="off()"
        [attr.aria-label]="label()"
        (input)="draftChange.emit(field.value)"
        (keydown.enter)="enter($event)"
      ></textarea>
      <span class="side">
        @if (length() >= COUNT_FROM) {
          <span class="count tabular" [class.text-danger]="length() > MAX">
            {{ length().toLocaleString('en') }} / {{ MAX.toLocaleString('en') }}
          </span>
        }
        <button
          type="button"
          class="send"
          [disabled]="!ready()"
          [attr.aria-label]="busy() ? 'Waiting for the answer' : 'Send'"
          (click)="send.emit()"
        >
          <span class="icon-[regular--arrow-up]" aria-hidden="true"></span>
        </button>
      </span>
    </div>
    <p class="hint desk-only">
      <kbd>↩</kbd> to send <span aria-hidden="true">·</span> <kbd>⇧</kbd><kbd>↩</kbd> for a new line
    </p>
  `,
  styles: `
    :host {
      display: block;
    }

    .box {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      min-block-size: 3.25rem;
      padding: 0.375rem 0.375rem 0.375rem 1.125rem;
      border-radius: 1.625rem;
      background: var(--color-glass);
      box-shadow: var(--shadow-glass);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      backdrop-filter: blur(20px) saturate(180%);
    }

    .field {
      flex-grow: 1;
      box-sizing: border-box;
      min-inline-size: 0;
      max-block-size: 9.375rem;
      margin: 0;
      padding: 0.5625rem 0;
      border: 0;
      outline: none;
      background: none;
      font: inherit;
      font-size: 1.0625rem;
      line-height: 1.375rem;
      color: inherit;
      resize: none;
    }

    .field::placeholder {
      color: var(--app-text-tertiary);
    }

    .side {
      display: flex;
      flex: none;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.375rem;
    }

    .count {
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 600;
      color: var(--app-text-tertiary);
    }

    .count.text-danger {
      color: var(--ion-color-danger);
    }

    .send {
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 2.5rem;
      block-size: 2.5rem;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: var(--ion-color-primary);
      font-size: 1.25rem;
      color: var(--ion-color-primary-contrast);
      cursor: pointer;
    }

    .send:disabled {
      background: var(--app-fill);
      color: var(--app-text-tertiary);
      cursor: default;
    }

    .hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      margin: 0.5rem 0 0;
      font-size: 0.75rem;
      color: var(--app-text-tertiary);
    }

    kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-inline-size: 1.25rem;
      block-size: 1.25rem;
      padding: 0 0.3125rem;
      border-radius: 0.3125rem;
      background: var(--app-fill);
      font-family: var(--app-font-mono);
      font-size: 0.6875rem;
      color: var(--app-text-secondary);
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) {
      .box {
        background: var(--ion-item-background);
        box-shadow:
          0 0 0 0.5px var(--app-border-normal),
          0 8px 24px rgba(15, 23, 42, 0.06);
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }

      .field {
        font-size: 1rem;
      }
    }
  `,
})
export class ChatComposer {
  readonly draft = input('');
  readonly placeholder = input('');
  readonly label = input.required<string>();
  readonly busy = input(false);
  readonly off = input(false);

  readonly draftChange = output<string>();
  readonly send = output();

  protected readonly COUNT_FROM = COUNT_FROM;
  protected readonly MAX = QUESTION_MAX;
  private readonly desktop = desktopScreen();
  private readonly field = viewChild.required<ElementRef<HTMLTextAreaElement>>('field');

  protected readonly length = computed(() => questionLength(this.draft()));
  protected readonly ready = computed(
    () => !this.busy() && !this.off() && this.length() > 0 && this.length() <= QUESTION_MAX,
  );

  constructor() {
    /* An effect, not the input handler: a suggestion, Send and a failure set the text too. */
    afterRenderEffect(() => {
      this.draft();
      const field = this.field().nativeElement;
      field.style.height = 'auto';
      field.style.height = `${field.scrollHeight}px`;
    });
  }

  /* Return sends on desktop only; an IME (Telex) commits its word with Enter first. */
  protected enter(event: Event): void {
    if (!this.desktop() || (event instanceof KeyboardEvent && event.isComposing)) return;
    event.preventDefault();
    if (this.ready()) this.send.emit();
  }
}
