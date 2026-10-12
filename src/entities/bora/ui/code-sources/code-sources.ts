import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';

import { pathParts } from '@shared/lib/format/path';
import { splitRepo } from '@shared/lib/format/repo';
import type { BoraSource } from '../../model/bora';

/** The files an answer read, each linked to its repository when it can be; full bleed by `--bleed`. */
@Component({
  selector: 'app-code-sources',
  imports: [NgTemplateOutlet],
  template: `
    <section aria-label="Sources">
      <h3>Sources</h3>
      @for (source of sources(); track $index) {
        @if (source.url) {
          <a class="file" target="_blank" rel="noopener noreferrer" [href]="source.url">
            <ng-container *ngTemplateOutlet="file; context: { $implicit: source }" />
            <span
              class="icon-[regular--arrow-up-right] flex-none text-accent"
              aria-hidden="true"
            ></span>
          </a>
        } @else {
          <span class="file text-label-3">
            <ng-container *ngTemplateOutlet="file; context: { $implicit: source }" />
          </span>
        }
      }
    </section>
    <ng-template #file let-source>
      <span class="grow"
        ><b>{{ repo(source.repo) }}</b> ·
        @for (part of parts(source.path); track $index) {
          <span>{{ part }}</span
          ><wbr />
        }
      </span>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
      margin: 0.25rem calc(-1 * var(--bleed, 1rem)) 0;
      padding: 0.5rem var(--bleed, 1rem) 0.125rem;
      border-block-start: 1px solid var(--app-border-normal);
    }

    h3 {
      margin: 0 0 0.125rem;
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 600;
      color: var(--app-text-tertiary);
    }

    .file {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      min-block-size: 2.5rem;
      padding: 0.1875rem 0;
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      line-height: 1.0625rem;
      color: var(--app-text-primary);
      text-decoration: none;
      overflow-wrap: anywhere;
    }

    .file + .file {
      border-block-start: 1px solid var(--app-border-normal);
    }

    .file b {
      font-weight: 600;
    }

    .grow {
      flex-grow: 1;
      min-inline-size: 0;
    }
  `,
})
export class CodeSources {
  readonly sources = input.required<readonly BoraSource[]>();

  protected readonly parts = pathParts;

  protected repo(full: string): string {
    return splitRepo(full).name;
  }
}
