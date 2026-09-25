import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { marked } from 'marked';
import { of } from 'rxjs';

import { DEFAULT_SERVER_URL } from '@shared/config/server-config.store';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';

interface Doc {
  readonly title: string;
  readonly file: string;
}

/* Unguarded public URLs: the store listings link straight to them. */
const LEGAL_DOCS: Readonly<Record<string, Doc>> = {
  terms: { title: 'Terms of Service', file: 'terms' },
  privacy: { title: 'Privacy Policy', file: 'privacy' },
  'open-source': { title: 'Open-source licences', file: 'open-source' },
  help: { title: 'Help', file: 'help' },
};

@Component({
  selector: 'app-legal-doc-page',
  imports: [ErrorState, IonBackButton, IonButton, IonButtons, PAGE_CHROME],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button [defaultHref]="backLink" /></ion-buttons>
        <ion-title>{{ title() }}</ion-title>
        @if (entry()) {
          <ion-buttons slot="end">
            <ion-button [href]="publicUrl()" target="_blank" aria-label="Open in browser">
              <span
                slot="icon-only"
                class="icon-[regular--arrow-up-right-from-square] text-accent"
                aria-hidden="true"
              ></span>
            </ion-button>
          </ion-buttons>
        }
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="mx-auto max-w-(--app-column)">
        <ion-header collapse="condense">
          <ion-toolbar
            ><ion-title size="large">{{ title() }}</ion-title></ion-toolbar
          >
        </ion-header>
        @if (page().updated) {
          <p class="updated">Last updated {{ page().updated }}</p>
        }
        @if (!entry()) {
          <app-error-state
            class="m-5 block"
            title="Unknown document"
            message="That page does not exist."
            [retryable]="false"
          />
        } @else if (content.error()) {
          <app-error-state
            class="m-5 block"
            title="Unable to load"
            message="The document could not be read from this build."
            (retry)="content.reload()"
          />
        } @else {
          <!-- Plain [innerHTML]: the sanitizer is the point, never bypass it. -->
          <article class="doc" [innerHTML]="page().html"></article>
        }
      </div>
    </ion-content>
  `,
  styles: `
    /* Starts on the 20px edge of the date line and the card. */
    ion-title[size='large'] {
      padding-inline-start: 1rem;
    }

    .updated {
      margin: 0 1.25rem 1.125rem;
      font-size: 0.9375rem;
      color: var(--app-text-tertiary);
    }

    .doc {
      display: block;
      margin: 0 1.25rem 2rem;
      border-radius: var(--radius-card);
      padding: 1rem 1.375rem 1.25rem;
      background: var(--ion-item-background);
      font-size: 1rem;
      line-height: 1.5rem;
      color: var(--app-text-secondary);
      overflow-wrap: anywhere;
    }

    /* ::ng-deep: [innerHTML] content carries no _ngcontent attribute. */
    :host ::ng-deep .doc :first-child {
      margin-block-start: 0;
    }

    :host ::ng-deep .doc h1 {
      margin: 1.25rem 0 0;
      font-size: 1.375rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--app-text-primary);
    }

    :host ::ng-deep .doc h2 {
      margin: 1.875rem 0 0;
      font-size: 1.125rem;
      line-height: 1.4375rem;
      font-weight: 700;
      color: var(--app-text-primary);
    }

    :host ::ng-deep .doc h3 {
      margin: 1.25rem 0 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--app-text-primary);
    }

    :host ::ng-deep .doc p,
    :host ::ng-deep .doc ul,
    :host ::ng-deep .doc ol {
      margin: 0.7rem 0 0;
    }

    :host ::ng-deep .doc ul,
    :host ::ng-deep .doc ol {
      padding-inline-start: 1.25rem;
    }

    :host ::ng-deep .doc li {
      margin-block-start: 0.3rem;
    }

    :host ::ng-deep .doc a {
      color: var(--app-text-action);
    }

    :host ::ng-deep .doc strong {
      color: var(--app-text-primary);
      font-weight: 600;
    }

    :host ::ng-deep .doc code {
      border-radius: 0.375rem;
      padding: 0.0625rem 0.3125rem;
      background: var(--app-background-neutral-1);
      font-family: var(--app-font-mono);
      font-size: 0.875rem;
      color: var(--app-text-primary);
    }

    :host ::ng-deep .doc pre {
      margin: 0.7rem 0 0;
      border-radius: var(--app-radius-m);
      padding: 0.75rem 0.875rem;
      background: var(--app-code-bg);
      overflow-x: auto;
    }

    :host ::ng-deep .doc pre code {
      padding: 0;
      background: none;
      font-size: 0.75rem;
      line-height: 1.55;
      white-space: pre;
    }

    /* Three columns cannot fit a phone: each storage-table row stacks into a list entry. */
    :host ::ng-deep .doc table,
    :host ::ng-deep .doc tbody,
    :host ::ng-deep .doc tr,
    :host ::ng-deep .doc td {
      display: block;
      padding: 0;
    }

    :host ::ng-deep .doc table {
      margin-block-start: 0.75rem;
    }

    :host ::ng-deep .doc thead {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
    }

    :host ::ng-deep .doc tr {
      padding: 0.625rem 0;
      line-height: 1.1875rem;
    }

    :host ::ng-deep .doc tr + tr {
      border-block-start: 1px solid var(--app-border-normal);
    }

    :host ::ng-deep .doc td + td {
      display: inline;
      font-size: 0.875rem;
      line-height: 1.1875rem;
      color: var(--app-text-secondary);
    }

    /* marked's newline between cells already renders as the space after the comma. */
    :host ::ng-deep .doc td:nth-child(2)::after {
      content: ',';
    }

    :host ::ng-deep .doc td code {
      padding: 0;
      background: none;
    }

    :host ::ng-deep .doc hr {
      margin: 1.5rem 0 0;
      border: 0;
      border-block-start: 1px solid var(--app-border-normal);
    }
  `,
})
export class LegalDocPage {
  private readonly http = inject(HttpClient);
  private readonly documentTitle = inject(Title);

  readonly doc = input('');

  protected readonly backLink = '/settings/about';
  protected readonly entry = computed(() => LEGAL_DOCS[this.doc()]);
  protected readonly publicUrl = computed(() => `${DEFAULT_SERVER_URL}/legal/${this.doc()}`);
  protected readonly title = computed(() => this.entry()?.title ?? 'Not found');

  constructor() {
    /* The route cannot name the document, so the page titles the tab. */
    effect(() => this.documentTitle.setTitle(`${this.title()} | Boreas`));
  }

  /* Relative URL: the docs ship with the build and read offline. */
  protected readonly content = rxResource({
    params: () => this.entry()?.file,
    stream: ({ params }) =>
      params ? this.http.get(`legal/${params}.md`, { responseType: 'text' }) : of(''),
  });

  /* The title and date line render above the card, so strip them from the body. */
  protected readonly page = computed(() => {
    const source = (this.content.hasValue() ? this.content.value() : '').replace(/^#\s.*\r?\n/, '');
    const updated = /^\*\*Last updated:\*\*\s*(.+)$/m.exec(source);
    return {
      updated: updated?.[1] ?? '',
      html: marked.parse(updated ? source.replace(updated[0], '') : source, {
        async: false,
        gfm: true,
      }),
    };
  });
}
