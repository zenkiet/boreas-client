import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonRouterLink, IonRouterLinkWithHref } from '@ionic/angular/ion-router-link';

import { age } from '@shared/lib/format/age';
import { MarkdownView } from '@shared/lib/markdown/markdown-view';

@Component({
  selector: 'app-task-note-card',
  imports: [IonItem, IonLabel, IonRouterLink, IonRouterLinkWithHref, MarkdownView, RouterLink],
  /* Inside the group's role="list"; the Add note row is a listitem of its own. */
  host: { '[attr.role]': "hasNote() ? 'listitem' : null" },
  template: `
    @if (hasNote()) {
      <article aria-label="Note">
        <app-markdown [text]="note()" />
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

    app-markdown {
      padding: 1.125rem 1.25rem 1rem;
      font-size: 1rem;
      line-height: 1.5;
      color: var(--app-text-secondary);
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
      app-markdown {
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
      app-markdown {
        position: relative;
        max-block-size: 12.5rem;
        overflow: hidden;
        padding: 0.875rem 1rem 0.75rem;
        font-size: 0.875rem;
        line-height: 1.5;
      }

      app-markdown::after {
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

  protected readonly hasNote = computed(() => this.note().trim() !== '');

  /* No note author or timestamp exists; updated_at moves with any change to the task. */
  protected readonly updated = computed(() => `${age(this.updatedAt())} ago`);
}
