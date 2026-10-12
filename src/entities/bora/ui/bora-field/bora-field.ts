import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';

import { desktopScreen } from '@shared/ui/breakpoint/wide-screen';
import type { DictationState } from '@shared/ui/dictation/dictation';

import { QUESTION_MAX, questionLength } from '../../model/bora';

const COUNT_FROM = 1800;
/* Ids stay unique when more than one field renders. */
let composers = 0;

@Component({
  selector: 'app-bora-field',
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
        [attr.aria-invalid]="over() || null"
        [attr.aria-describedby]="length() >= COUNT_FROM ? countId : null"
        (input)="draftChange.emit(field.value)"
        (keydown.enter)="enter($event)"
      ></textarea>
      <span class="side">
        @if (length() >= COUNT_FROM) {
          <span class="count tabular" [id]="countId" [class.text-danger]="over()">
            {{ length().toLocaleString('en') }} / {{ MAX.toLocaleString('en') }}
            <span class="sr-only">
              characters{{
                over() ? ', ' + (length() - MAX).toLocaleString('en') + ' too many' : ''
              }}
            </span>
          </span>
        }
        @if (mic(); as state) {
          <button
            type="button"
            class="send mic"
            aria-label="Dictate"
            [attr.aria-pressed]="state === 'recording'"
            [disabled]="off()"
            (click)="dictate.emit()"
          >
            @if (state === 'recording') {
              <span class="icon-[solid--stop]" aria-hidden="true"></span>
            } @else {
              <span class="icon-[regular--microphone]" aria-hidden="true"></span>
            }
          </button>
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
  `,
  styles: `
    :host {
      position: relative;
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
      align-items: flex-end;
      gap: 0.375rem;
    }

    .count {
      position: absolute;
      inset-block-end: calc(100% + 0.375rem);
      inset-inline-end: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      background: var(--color-glass);
      box-shadow: var(--shadow-glass);
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 600;
      color: var(--app-text-tertiary);
      white-space: nowrap;
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

    .mic {
      background: var(--app-fill);
      color: var(--app-text-primary);
    }

    .mic[aria-pressed='true'] {
      background: var(--color-danger-soft);
      color: var(--ion-color-danger);
    }

    .send:disabled {
      background: var(--app-fill);
      color: var(--app-text-tertiary);
      cursor: default;
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
export class BoraField {
  readonly draft = input('');
  readonly placeholder = input('');
  readonly label = input.required<string>();
  readonly busy = input(false);
  readonly off = input(false);
  /** Null hides the mic. */
  readonly mic = input<DictationState | null>(null);

  readonly draftChange = output<string>();
  readonly send = output();
  readonly dictate = output();

  protected readonly COUNT_FROM = COUNT_FROM;
  protected readonly MAX = QUESTION_MAX;
  private readonly desktop = desktopScreen();
  private readonly field = viewChild.required<ElementRef<HTMLTextAreaElement>>('field');

  protected readonly countId = `composer-count-${composers++}`;
  protected readonly length = computed(() => questionLength(this.draft()));
  protected readonly over = computed(() => this.length() > QUESTION_MAX);
  protected readonly ready = computed(
    () => !this.busy() && !this.off() && this.length() > 0 && this.length() <= QUESTION_MAX,
  );

  constructor() {
    /* An effect, not the input handler: a suggestion, Send and a failure set the text too. */
    afterRenderEffect(() => {
      this.draft();
      const field = this.field().nativeElement;
      field.style.height = 'auto';
      // An overlay renders before its layout: 0 would pin the field shut until the next keystroke.
      if (field.scrollHeight) field.style.height = `${field.scrollHeight}px`;
    });
  }

  focus(): void {
    const field = this.field().nativeElement;
    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);
  }

  /* Return sends on desktop only; an IME (Telex) commits its word with Enter first. */
  protected enter(event: Event): void {
    if (!this.desktop() || (event instanceof KeyboardEvent && event.isComposing)) return;
    event.preventDefault();
    if (this.ready()) this.send.emit();
  }
}
