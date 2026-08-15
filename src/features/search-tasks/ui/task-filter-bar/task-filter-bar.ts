import { ChangeDetectionStrategy, Component, ElementRef, model, viewChild } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';

@Component({
  selector: 'app-task-filter-bar',
  imports: [FormField, TuiButton, TuiIcon, TuiTextfield],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  template: `
    <search>
      <tui-textfield
        tuiTextfieldSize="m"
        iconStart="@tui.search"
        class="w-full"
        [tuiTextfieldCleaner]="false"
      >
        <input
          #search
          tuiInput
          type="search"
          autocomplete="off"
          aria-label="Search tasks by ID or image"
          aria-keyshortcuts="/"
          placeholder="Search task ID or image"
          [formField]="field"
          (keydown.escape)="clear()"
        />
        @if (query()) {
          <button
            tuiIconButton
            type="button"
            size="s"
            appearance="flat-grayscale"
            aria-label="Clear search"
            (click)="clear()"
          >
            <tui-icon class="icon-sm" icon="@tui.x" />
          </button>
        }
      </tui-textfield>
    </search>
  `,
  /* Hide WebKit's native cancel so only the explicit clear action remains. */
  styles: `
    input[type='search']::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
    }
  `,
})
export class TaskFilterBar {
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');

  readonly query = model('');
  protected readonly field = form(this.query);

  protected clear(): void {
    this.query.set('');
    this.search()?.nativeElement.focus();
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
    this.search()?.nativeElement.focus();
  }
}
