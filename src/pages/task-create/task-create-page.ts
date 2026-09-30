import { Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { ModalController } from '@ionic/angular/modal-controller';
import { NavController } from '@ionic/angular/nav-controller';

import { CreateTaskInput } from '@entities/task';
import { CreateTaskStore, TaskForm } from '@features/create-task';
import { ListProjectsStore } from '@features/list-projects';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { SHEET_DONE } from '@shared/ui/sheet/sheet.service';

@Component({
  selector: 'app-task-create-page',
  imports: [IonButton, IonButtons, IonSpinner, PAGE_CHROME, TaskForm],
  providers: [CreateTaskStore],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <!-- No discard confirm: only typing is lost, and only the irreversible is confirmed. -->
        <ion-buttons slot="start">
          <ion-button aria-label="Cancel" (click)="cancel()">
            <span slot="icon-only" class="icon-[regular--xmark]" aria-hidden="true"></span>
          </ion-button>
        </ion-buttons>
        <ion-title>New task</ion-title>
        <ion-buttons slot="end">
          <!-- Never validity-disabled: submitting empty fields must reveal their errors. -->
          <ion-button
            type="submit"
            fill="solid"
            color="primary"
            form="create-task-form"
            aria-label="Create task"
            [disabled]="create.creating()"
          >
            @if (create.creating()) {
              <ion-spinner name="lines-small" />
            } @else {
              <span slot="icon-only" class="icon-[regular--check]" aria-hidden="true"></span>
            }
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="mx-auto max-w-(--app-column)">
        <app-task-form
          formId="create-task-form"
          [creating]="create.creating()"
          [error]="create.error()"
          [defaults]="create.defaults()"
          [folders]="create.folders()"
          (submitted)="createTask($event)"
        />
        <!-- Wrapped: Ionic's unlayered button margins beat utilities on the button itself. -->
        <div class="mx-5 mt-6 mb-10">
          <ion-button
            type="submit"
            form="create-task-form"
            expand="block"
            class="cta"
            [disabled]="create.creating()"
          >
            @if (create.creating()) {
              <ion-spinner name="lines-small" />
              Creating
            } @else {
              Create task
            }
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
})
export class TaskCreatePage {
  protected readonly create = inject(CreateTaskStore);
  private readonly fleet = inject(ListProjectsStore);
  private readonly router = inject(Router);
  private readonly navCtrl = inject(NavController);
  private readonly modals = inject(ModalController);

  readonly slug = input('');
  /** True when iPad presents the page as a dialog over its project. */
  readonly dialog = input(false);

  protected readonly projectPath = computed(() => `/projects/${this.slug()}`);

  constructor() {
    effect(() => {
      const slug = this.slug();
      if (slug) this.create.loadDefaults(slug);
    });
  }

  protected cancel(): void {
    if (this.dialog()) void this.modals.dismiss();
    else void this.navCtrl.navigateBack(this.projectPath());
  }

  protected createTask(input: CreateTaskInput): void {
    this.create.create(this.slug(), input).subscribe((task) => {
      if (!task) return;

      this.fleet.invalidate();
      if (this.dialog()) void this.modals.dismiss(task, SHEET_DONE);
      /* A pushed form is replaced, so back from the new task lands on the project. */
      void this.router.navigate(['/projects', this.slug(), 'tasks', task.name], {
        replaceUrl: !this.dialog(),
      });
    });
  }
}
