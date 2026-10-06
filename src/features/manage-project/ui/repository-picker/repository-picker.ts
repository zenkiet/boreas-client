import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonCheckbox } from '@ionic/angular/ion-checkbox';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { ModalController } from '@ionic/angular/modal-controller';
import { finalize } from 'rxjs';

import { splitRepo } from '@shared/lib/format/repo';
import { Callout } from '@shared/ui/callout/callout';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { SHEET_DONE } from '@shared/ui/sheet/sheet.service';
import { RepositorySearchStore } from '../../model/repository-search.store';

/* The server's cap per project. */
const LIMIT = 20;

@Component({
  selector: 'app-repository-picker',
  imports: [
    Callout,
    InsetGroup,
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonSearchbar,
    IonSpinner,
    IonTitle,
    IonToolbar,
    NgTemplateOutlet,
  ],
  providers: [RepositorySearchStore],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button aria-label="Cancel" (click)="cancel()">
            <span slot="icon-only" class="icon-[regular--xmark]" aria-hidden="true"></span>
          </ion-button>
        </ion-buttons>
        <ion-title>
          <span class="head">
            Repositories
            <span class="head__sub tabular">{{ picked().length }} of {{ limit }} chosen</span>
          </span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            color="primary"
            [disabled]="!changed() || saving()"
            [attr.aria-label]="saving() ? 'Saving' : 'Save'"
            (click)="save()"
          >
            @if (saving()) {
              <ion-spinner slot="icon-only" name="lines-small" />
            } @else {
              <span slot="icon-only" class="icon-[regular--check]" aria-hidden="true"></span>
            }
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      @if (!search.off()) {
        <ion-toolbar>
          <ion-searchbar
            aria-label="Search Sourcebot"
            placeholder="Search Sourcebot"
            autocapitalize="off"
            [spellcheck]="false"
            [debounce]="300"
            (ionInput)="search.query.set($event.detail.value ?? '')"
          />
        </ion-toolbar>
      }
    </ion-header>

    <ion-content>
      @if (saveError(); as message) {
        <app-callout class="m-4" tone="negative" role="alert">{{ message }}</app-callout>
      }

      @if (search.off()) {
        <app-callout class="m-4" tone="info">Code search is not set up on this server.</app-callout>
      } @else if (!search.query().trim()) {
        @if (chosenRows().length || !picked().length) {
          <app-inset-group label="Chosen">
            @for (name of chosenRows(); track name) {
              <ng-container *ngTemplateOutlet="row; context: { $implicit: name }" />
            } @empty {
              <ion-item><ion-label class="muted">Nothing chosen yet.</ion-label></ion-item>
            }
          </app-inset-group>
        }
        <app-inset-group label="In Sourcebot" trailing="first 20">
          @for (name of browseRows(); track name) {
            <ng-container *ngTemplateOutlet="row; context: { $implicit: name }" />
          }
          <ng-container *ngTemplateOutlet="says" />
        </app-inset-group>
      } @else {
        <app-inset-group label="Results" [trailing]="found()">
          @for (name of search.results(); track name) {
            <ng-container *ngTemplateOutlet="row; context: { $implicit: name }" />
          }
          <ng-container *ngTemplateOutlet="says" />
          @if (!search.loading() && !search.failed() && search.results().length === 0) {
            <ion-item>
              <ion-label class="ion-text-wrap muted">
                No indexed repository matches “{{ search.query().trim() }}”
              </ion-label>
            </ion-item>
          }
        </app-inset-group>
      }

      @if (full()) {
        <p class="foot">A project can have {{ limit }} repositories. Uncheck one to add another.</p>
      }
      <p class="foot">
        Chat reads the default branch of each one. Save replaces the whole list; closing the sheet
        keeps the old one.
      </p>
    </ion-content>

    <ng-template #row let-name>
      <ion-item>
        <ion-checkbox
          justify="start"
          labelPlacement="end"
          [checked]="picked().includes(name)"
          [disabled]="full() && !picked().includes(name)"
          (ionChange)="toggle(name)"
        >
          <span class="name block truncate">{{ repo(name).name }}</span>
          <span class="owner block truncate">{{ repo(name).owner }}</span>
        </ion-checkbox>
      </ion-item>
    </ng-template>

    <ng-template #says>
      @if (search.loading()) {
        <ion-item><ion-label class="muted">Searching Sourcebot…</ion-label></ion-item>
      } @else if (search.failed()) {
        <ion-item>
          <ion-label class="ion-text-wrap" color="danger">
            Sourcebot is not reachable, try again
          </ion-label>
          <ion-button slot="end" fill="clear" (click)="search.retry()">Try again</ion-button>
        </ion-item>
      }
    </ng-template>
  `,
  styles: `
    /* Ionic's label colour outranks Tailwind's layered utilities. */
    .muted {
      color: var(--app-text-tertiary);
    }

    .head {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.25rem;
    }

    .head__sub {
      font-size: 0.75rem;
      line-height: 1rem;
      font-weight: 400;
      color: var(--app-text-tertiary);
    }

    ion-checkbox {
      inline-size: 100%;
    }

    ion-checkbox::part(label) {
      min-inline-size: 0;
    }

    .name {
      font-family: var(--app-font-mono);
      font-size: 0.9375rem;
      line-height: 1.25rem;
      font-weight: 600;
    }

    .owner {
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      line-height: 1rem;
      color: var(--app-text-tertiary);
    }

    .foot {
      margin: 0.5rem 2.25rem 0;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-tertiary);
    }

    .foot:last-child {
      margin-block-end: 1.5rem;
    }
  `,
})
export class RepositoryPicker {
  protected readonly search = inject(RepositorySearchStore);
  private readonly modals = inject(ModalController);

  readonly project = input.required<string>();
  readonly chosen = input<readonly string[]>([]);

  protected readonly limit = LIMIT;
  protected readonly picked = linkedSignal<readonly string[]>(() => this.chosen());
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | undefined>(undefined);

  protected readonly full = computed(() => this.picked().length >= LIMIT);
  protected readonly changed = computed(() => {
    const saved = this.chosen();
    const picked = this.picked();
    return picked.length !== saved.length || picked.some((name) => !saved.includes(name));
  });

  /* Rows never move under a tick: a pick found by an earlier search joins the saved ones. */
  protected readonly chosenRows = computed(() => {
    const saved = this.chosen();
    const shown = new Set(this.search.results());
    return [...saved, ...this.picked().filter((name) => !saved.includes(name) && !shown.has(name))];
  });

  protected readonly browseRows = computed(() =>
    this.search.results().filter((name) => !this.chosen().includes(name)),
  );

  protected readonly found = computed(() =>
    this.search.loading() || this.search.failed() ? '' : `${this.search.results().length} found`,
  );

  protected repo(full: string): { readonly name: string; readonly owner: string } {
    return splitRepo(full);
  }

  protected toggle(name: string): void {
    this.saveError.set(undefined);
    this.picked.update((picked) =>
      picked.includes(name) ? picked.filter((each) => each !== name) : [...picked, name],
    );
  }

  protected cancel(): void {
    void this.modals.dismiss();
  }

  protected save(): void {
    this.saving.set(true);
    this.saveError.set(undefined);
    this.search
      .save(this.project(), this.picked())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe((problem) => {
        if (problem) this.saveError.set(problem);
        else void this.modals.dismiss(true, SHEET_DONE);
      });
  }
}
