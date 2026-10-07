import { Directive, ElementRef, afterRenderEffect, computed, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';

import { fieldError } from './field-error';

/**
 * Sets `ng-*` (Ionic rebuilds its classes from them) and `ion-*` (a submit fires no Ionic event).
 * Reads FormField's state: declaring a `formField` input here would stop value-accessor wiring.
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'ion-input[formField], ion-textarea[formField], ion-select[formField]',
  host: {
    '[class.ng-touched]': 'state().touched()',
    '[class.ng-invalid]': 'state().invalid()',
    '[class.ion-touched]': 'state().touched()',
    '[class.ion-invalid]': 'state().invalid()',
    '[attr.error-text]': 'error()',
  },
})
export class FieldStatus {
  protected readonly state = inject(FormField).state;
  protected readonly error = computed(() => fieldError(this.state()));
  private readonly host = inject<ElementRef<HTMLElement & { pattern?: string }>>(ElementRef);

  constructor() {
    /* Ionic writes FormField's RegExp array as a native pattern that fails valid text. */
    afterRenderEffect(() => {
      this.state().pattern();
      const element = this.host.nativeElement;
      if ('pattern' in element) element.pattern = undefined;
    });
  }
}
