import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonRouterLink, IonRouterLinkWithHref } from '@ionic/angular/ion-router-link';

import { age } from '@shared/lib/format/age';
import { noteToPreviewHtml } from '@shared/lib/markdown/note-markdown';

@Component({
  selector: 'app-task-note-card',
  imports: [IonItem, IonLabel, IonRouterLink, IonRouterLinkWithHref, RouterLink],
  /* Inside the group's role="list"; the Add note row is a listitem of its own. */
  host: { '[attr.role]': "html() ? 'listitem' : null" },
  template: `
    @if (html()) {
      <article aria-label="Note">
        <!-- Plain [innerHTML], never bypassed: the sanitizer backs up the escaping renderer. -->
        <div class="md" [innerHTML]="html()"></div>
        <div class="foot">
          <span class="grow">Updated {{ updated() }}</span>
          <!-- sr-only, not aria-label: the accessible name must match the visible text. -->
          @if (editLink(); as link) {
            <a class="edit" [routerLink]="link">
              <span class="icon-[regular--pencil]" aria-hidden="true"></span>
              <span>Edit<span class="sr-only xl:not-sr-only"> note</span></span>
            </a>
          }
        </div>
      </article>
    } @else if (editLink(); as link) {
      <ion-item [routerLink]="link">
        <ion-label color="primary">Add note</ion-label>
      </ion-item>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    /* ::ng-deep: [innerHTML] content carries no _ngcontent attribute. */
    :host ::ng-deep .md {
      padding: 1.125rem 1.25rem 1rem;
      font-size: 1rem;
      line-height: 1.5;
      color: var(--app-text-secondary);
      overflow-wrap: anywhere;
    }

    :host ::ng-deep .md > :last-child {
      margin-block-end: 0;
    }

    :host ::ng-deep .md :is(p, ol, ul, blockquote, pre) {
      margin: 0 0 0.8em;
    }

    :host ::ng-deep .md :is(h2, h3, h4, h5, h6) {
      margin: 0 0 0.3em;
      font-size: 1em;
      line-height: 1.3;
      font-weight: 600;
      color: var(--app-text-primary);
    }

    :host ::ng-deep .md h2 {
      font-size: 1.25em;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    :host ::ng-deep .md h3 {
      font-size: 1.125em;
      font-weight: 700;
    }

    :host ::ng-deep .md strong {
      font-weight: 600;
      color: var(--app-text-primary);
    }

    :host ::ng-deep .md code {
      padding: 1px 6px;
      border-radius: 7px;
      background: var(--app-fill);
      font-family: var(--app-font-mono);
      font-size: 0.84em;
      color: var(--app-text-primary);
    }

    :host ::ng-deep .md pre {
      padding: 0.625em 0.875em;
      border-radius: 0.75rem;
      background: var(--app-fill);
      overflow-x: auto;
    }

    :host ::ng-deep .md pre code {
      padding: 0;
      background: none;
    }

    /* Counter badges on block items: a flex li would split "Run <code>x</code> now" apart. */
    :host ::ng-deep .md ol {
      padding: 0;
      list-style: none;
      counter-reset: n;
    }

    :host ::ng-deep .md :is(ol, ul) > li + li {
      margin-block-start: 0.5em;
    }

    :host ::ng-deep .md ol > li {
      position: relative;
      padding-inline-start: 2em;
      counter-increment: n;
    }

    :host ::ng-deep .md ol > li::before {
      content: counter(n);
      position: absolute;
      inset-inline-start: 0;
      top: 0.1em;
      display: grid;
      place-items: center;
      inline-size: 1.375em;
      block-size: 1.375em;
      border-radius: 999px;
      background: var(--app-fill);
      font: 700 0.75em/1 var(--app-font-text);
      font-variant-numeric: tabular-nums;
      color: var(--app-text-secondary);
    }

    :host ::ng-deep .md ul {
      padding-inline-start: 2em;
    }

    :host ::ng-deep .md li::marker {
      color: var(--app-text-tertiary);
    }

    :host ::ng-deep .md li > p,
    :host ::ng-deep .md blockquote > :last-child {
      margin: 0;
    }

    :host ::ng-deep .md blockquote {
      padding: 0.625em 0.875em 0.625em 1em;
      border-radius: 0.875rem;
      background: var(--app-fill);
      box-shadow: inset 3px 0 0 var(--app-text-tertiary);
      font-size: 0.9375em;
    }

    :host ::ng-deep .md hr {
      margin: 0.875em 0;
      border: 0;
      border-block-start: 1px solid var(--app-border-normal);
    }

    /* Inline, not inline-flex: long link text has to wrap. */
    :host ::ng-deep .md a {
      font-weight: 500;
      color: var(--ion-color-primary);
      text-decoration: none;
    }

    :host ::ng-deep .md a::after {
      content: '';
      display: inline-block;
      inline-size: 0.875em;
      block-size: 0.875em;
      margin-inline-start: 3px;
      vertical-align: -0.1em;
      background: currentColor;
      mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M7 17L17 7M9 7h8v8'/%3E%3C/svg%3E")
        center / contain no-repeat;
    }

    .foot {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-block-size: 3.375rem;
      margin-inline-start: 1.25rem;
      padding-inline-end: 0.75rem;
      border-block-start: 1px solid var(--app-border-normal);
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-tertiary);
    }

    .edit {
      display: inline-flex;
      flex: none;
      align-items: center;
      gap: 0.375rem;
      block-size: 2.125rem;
      padding: 0 0.875rem 0 0.75rem;
      border-radius: 999px;
      background: var(--app-accent-soft);
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--app-accent-text);
      text-decoration: none;
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) {
      :host ::ng-deep .md {
        padding: 1rem 1.25rem 0.875rem;
        font-size: 0.9375rem;
        line-height: 1.4667;
      }

      .foot {
        min-block-size: 3.25rem;
      }

      .edit {
        block-size: 2rem;
      }
    }

    @media (min-width: 80rem) {
      :host ::ng-deep .md {
        position: relative;
        max-block-size: 12.5rem;
        overflow: hidden;
        padding: 0.875rem 1rem 0.75rem;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      :host ::ng-deep .md::after {
        content: '';
        position: absolute;
        inset: auto 0 0;
        block-size: 3rem;
        background: linear-gradient(transparent, var(--ion-item-background));
        pointer-events: none;
      }

      .foot {
        min-block-size: 2.875rem;
      }

      .edit {
        block-size: 1.875rem;
        font-size: 0.8125rem;
      }
    }
  `,
})
export class TaskNoteCard {
  readonly note = input('');
  readonly updatedAt = input.required<Date>();
  /** null hides Edit and Add note: the caller may not change the task. */
  readonly editLink = input.required<readonly string[] | null>();

  protected readonly html = computed(() =>
    this.note().trim() ? noteToPreviewHtml(this.note()) : '',
  );

  /* No note author or timestamp exists; updated_at moves with any change to the task. */
  protected readonly updated = computed(() => `${age(this.updatedAt())} ago`);
}
