import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { ModalController } from '@ionic/angular/modal-controller';
import { NavController } from '@ionic/angular/nav-controller';

import { CreateProjectInput } from '@entities/project';
import { ListProjectsStore } from '@features/list-projects';
import { ManageProjectStore, ProjectForm } from '@features/manage-project';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { SHEET_DONE } from '@shared/ui/sheet/sheet.service';

@Component({
  selector: 'app-project-create-page',
  imports: [IonButton, IonButtons, IonSpinner, PAGE_CHROME, ProjectForm],
  providers: [ManageProjectStore],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button aria-label="Cancel" (click)="cancel()">
            <span slot="icon-only" class="icon-[regular--xmark]" aria-hidden="true"></span>
          </ion-button>
        </ion-buttons>
        <ion-title>New project</ion-title>
        <!-- Never validity-disabled: submitting empty fields must reveal their errors. -->
        <ion-buttons slot="end">
          <ion-button
            type="submit"
            form="create-project-form"
            fill="solid"
            color="primary"
            aria-label="Create project"
            [disabled]="manage.busy()"
          >
            <span slot="icon-only" class="icon-[regular--check]" aria-hidden="true"></span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="mx-auto max-w-(--app-column)">
        <app-project-form
          formId="create-project-form"
          [creating]="manage.busy()"
          [error]="manage.createError()"
          [credentials]="manage.credentials()"
          [proxyHost]="config.host()"
          (submitted)="createProject($event)"
        />
        <div class="mx-5 mt-6 mb-10">
          <ion-button
            type="submit"
            form="create-project-form"
            expand="block"
            class="cta"
            [disabled]="manage.busy()"
          >
            @if (manage.busy()) {
              <ion-spinner name="lines-small" />
              Creating
            } @else {
              Create project
            }
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
})
export class ProjectCreatePage {
  /** Set when iPad presents this page as a dialog over Home instead of pushing it. */
  readonly dialog = input(false);

  protected readonly manage = inject(ManageProjectStore);
  protected readonly modals = inject(ModalController);
  protected readonly config = inject(ServerConfigStore);
  private readonly fleet = inject(ListProjectsStore);
  private readonly router = inject(Router);
  private readonly navCtrl = inject(NavController);

  protected cancel(): void {
    if (this.dialog()) void this.modals.dismiss();
    else void this.navCtrl.navigateBack('/projects');
  }

  protected createProject(input: CreateProjectInput): void {
    this.manage.create(input).subscribe((project) => {
      if (!project) return;

      this.fleet.invalidate();
      if (this.dialog()) void this.modals.dismiss(project, SHEET_DONE);
      void this.router.navigate(['/projects', project.slug], {
        state: { projectName: project.name },
      });
    });
  }
}
