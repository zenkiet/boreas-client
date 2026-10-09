import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, effect, inject, input, signal } from '@angular/core';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { defer, from } from 'rxjs';

import { Announcer } from '../notify/announcer';
import { coast, replaced, rotate, swap } from './effects';
import { reduced } from './motion';

@Component({
  selector: 'app-symbol',
  imports: [IonSpinner],
  host: { 'aria-hidden': 'true', '[class]': "shown() ?? 'fx-busy'" },
  template: `@if (shown() === null) {
    <ion-spinner name="lines-small" [paused]="still" />
  }`,
})
export class SymbolGlyph {
  /** A whole icon class (Tailwind only sees literals); null is the busy spinner. */
  readonly name = input.required<string | null>();
  readonly spin = input(false);

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly shown = replaced(this.name, () => this.host);
  protected readonly still = reduced();

  constructor() {
    // Only a spin leaves an angle to coast from: reading one on every new glyph forces a style pass.
    let spun = false;
    effect(() => {
      const spin = this.spin();
      if (spin) rotate(this.host);
      else if (spun) coast(this.host);
      spun = spin;
    });
  }
}

/** Words that fade out, then the new ones in, when they change on a settled page; `data-text` follows them. */
@Component({
  selector: 'app-swap-text',
  host: { '[attr.data-text]': 'shown()' },
  template: '{{ shown() }}',
})
export class SwapText {
  readonly text = input.required<string>();

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly shown = replaced(this.text, () => this.host, swap);
}

const COPY_HOLD = 1600;

/** Copy → Check: `copied` holds after each success, a repeat extends it, "Copied" is said once. */
export function clipboardCopy(failed: () => void) {
  const view = inject(DOCUMENT).defaultView;
  const announcer = inject(Announcer);
  const copied = signal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    copied: copied.asReadonly(),
    copy(text: string): void {
      defer(() => from(view!.navigator.clipboard.writeText(text))).subscribe({
        next: () => {
          if (!copied()) announcer.say('Copied');
          copied.set(true);
          clearTimeout(timer);
          timer = setTimeout(() => copied.set(false), COPY_HOLD);
        },
        error: failed,
      });
    },
  };
}
