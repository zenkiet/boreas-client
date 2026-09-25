import { Directive, ElementRef, effect, inject, model } from '@angular/core';

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
  private readonly searchbar =
    inject<ElementRef<{ value?: string | null; setFocus(): Promise<void> }>>(ElementRef);

  readonly query = model('');

  constructor() {
    /* A host [value] binding is rejected on the custom element, so the value is pushed in. */
    effect(() => (this.searchbar.nativeElement.value = this.query()));
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
