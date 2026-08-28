import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TuiAppBar } from '@taiga-ui/layout';
import { marked } from 'marked';
import { of } from 'rxjs';

import { Reveal } from '@shared/lib/motion/reveal.directive';
import { BackLink } from '@shared/ui/back-link/back-link';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { PageHeader } from '@shared/ui/page-header/page-header';

interface Doc {
  readonly title: string;
  readonly file: string;
}

/* Public URLs: these routes carry no guard so the store listings can link straight to them. */
export const LEGAL_DOCS: Readonly<Record<string, Doc>> = {
  terms: { title: 'Terms of Service', file: 'terms' },
  privacy: { title: 'Privacy Policy', file: 'privacy' },
  'open-source': { title: 'Open Source Licenses', file: 'open-source' },
  help: { title: 'Help', file: 'help' },
};

@Component({
  selector: 'app-legal-doc-page',
  imports: [BackLink, ErrorState, InsetGroup, PageHeader, Reveal, RouterLink, TuiAppBar],
  template: `
    <div appReveal class="mx-auto grid w-full max-w-3xl grid-cols-1 gap-3.5 pb-16 md:gap-4 md:pb-0">
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <a tuiSlot="start" tuiAppBarBack [routerLink]="backLink" aria-label="Back"></a>
          <span class="doc__bar-title">{{ title() }}</span>
        </tui-app-bar>
      </div>

      <header class="hidden md:block">
        <app-back-link [link]="backLink" label="About" />
        <app-page-header [title]="title()" />
      </header>

      @if (!doc()) {
        <app-error-state title="Unknown document" message="That page does not exist." />
      } @else if (content.error()) {
        <app-error-state
          title="Unable to load"
          message="The document could not be read from this build."
          (retry)="content.reload()"
        />
      } @else {
        <app-inset-group>
          <!-- Plain [innerHTML]: Angular's sanitizer is the point, so nothing bypasses it. -->
          <article class="doc" [innerHTML]="html()"></article>
        </app-inset-group>
      }
    </div>
  `,
  styles: `
    .doc__bar-title {
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .doc {
      padding: 0.25rem 1.125rem 1.25rem;
      font-size: 0.9375rem;
      line-height: 1.62;
      color: var(--tui-text-secondary);
      overflow-wrap: anywhere;
    }

    .doc :first-child {
      margin-block-start: 0;
    }

    .doc h1 {
      margin: 1.25rem 0 0;
      font-size: 1.375rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--tui-text-primary);
    }

    .doc h2 {
      margin: 1.75rem 0 0;
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--tui-text-primary);
    }

    .doc h3 {
      margin: 1.25rem 0 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--tui-text-primary);
    }

    .doc p,
    .doc ul,
    .doc ol {
      margin: 0.7rem 0 0;
    }

    .doc ul,
    .doc ol {
      padding-inline-start: 1.25rem;
    }

    .doc li {
      margin-block-start: 0.3rem;
    }

    .doc a {
      color: var(--tui-text-action);
    }

    .doc strong {
      color: var(--tui-text-primary);
      font-weight: 600;
    }

    .doc code {
      font-family: var(--app-font-mono);
      font-size: 0.8125rem;
      color: var(--tui-text-primary);
    }

    .doc pre {
      margin: 0.7rem 0 0;
      border-radius: var(--tui-radius-m);
      padding: 0.75rem 0.875rem;
      background: var(--app-code-bg);
      overflow-x: auto;
    }

    .doc pre code {
      font-size: 0.75rem;
      line-height: 1.55;
      white-space: pre;
    }

    /* The privacy policy's storage table is the only one, and it must not widen the page. */
    .doc table {
      display: block;
      margin-block-start: 0.9rem;
      border-collapse: collapse;
      overflow-x: auto;
      font-size: 0.875rem;
    }

    .doc th,
    .doc td {
      border-block-end: 1px solid var(--tui-border-normal);
      padding: 0.5rem 0.75rem 0.5rem 0;
      text-align: start;
      vertical-align: top;
    }

    .doc th {
      color: var(--tui-text-primary);
      font-weight: 600;
      white-space: nowrap;
    }

    .doc hr {
      margin: 1.5rem 0 0;
      border: 0;
      border-block-start: 1px solid var(--tui-border-normal);
    }
  `,
})
export class LegalDocPage {
  private readonly http = inject(HttpClient);

  readonly doc = input('');

  protected readonly backLink = '/settings/about';
  protected readonly entry = computed(() => LEGAL_DOCS[this.doc()]);
  protected readonly title = computed(() => this.entry()?.title ?? 'Not found');

  /* Bundled with the app, so this resolves from the local build and works offline. */
  protected readonly content = rxResource({
    params: () => this.entry()?.file,
    stream: ({ params }) =>
      params ? this.http.get(`legal/${params}.md`, { responseType: 'text' }) : of(''),
  });

  /* The chrome already shows the title, so the file's own H1 would print it twice. */
  protected readonly html = computed(() =>
    marked.parse((this.content.value() ?? '').replace(/^#\s.*\r?\n/, ''), {
      async: false,
      gfm: true,
    }),
  );
}
