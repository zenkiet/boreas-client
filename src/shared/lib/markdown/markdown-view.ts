import { Component, computed, input } from '@angular/core';

import { noteToPreviewHtml } from './note-markdown';

/** The caller sets padding, size and colour on the host. */
@Component({
  selector: 'app-markdown',
  /* Plain [innerHTML], never bypassed: the sanitizer backs up the escaping renderer. */
  template: `<div class="md" [innerHTML]="html()"></div>`,
  styles: `
    :host {
      display: block;
      overflow-wrap: anywhere;
    }

    /* ::ng-deep: [innerHTML] content carries no _ngcontent attribute. */
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

    /* A wrapped span keeps its padding and corners on each line. */
    :host ::ng-deep .md code {
      -webkit-box-decoration-break: clone;
      box-decoration-break: clone;
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
  `,
})
export class MarkdownView {
  readonly text = input('');

  protected readonly html = computed(() => noteToPreviewHtml(this.text()));
}
