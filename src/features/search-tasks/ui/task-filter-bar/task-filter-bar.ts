import { Directive, ElementRef, effect, inject, model } from '@angular/core';
import { from } from 'rxjs';

@Directive({
  selector: 'ion-searchbar[appTaskFilterBar]',
  host: {
    'aria-keyshortcuts': '/',
    '(ionInput)': 'onInput($event)',
    '(keydown.escape)': 'query.set("")',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class TaskFilterBar {
  private readonly searchbar = inject<
    ElementRef<{
      value?: string | null;
      setFocus(): Promise<void>;
      getInputElement(): Promise<HTMLInputElement>;
    }>
  >(ElementRef);

  readonly query = model('');

  constructor() {
    /* A host [value] binding is rejected on the custom element, so the value is pushed in. */
    effect(() => (this.searchbar.nativeElement.value = this.query()));
    /* Ionic hard-codes "search text" and "reset"; Stencil leaves an unchanged attribute alone. */
    from(this.searchbar.nativeElement.getInputElement()).subscribe((input) => {
      input.setAttribute('aria-label', 'Search tasks and projects');
      input
        .closest('ion-searchbar')
        ?.querySelector('.searchbar-clear-button')
        ?.setAttribute('aria-label', 'Clear search');
    });
  }

  protected onInput(event: Event): void {
    this.query.set((event as CustomEvent<{ value?: string | null }>).detail.value ?? '');
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    /* Do not steal the shortcut while another editable control has focus. */
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable]')) {
      return;
    }

    event.preventDefault();
    void this.searchbar.nativeElement.setFocus();
  }
}
