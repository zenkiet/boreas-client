import { Component, computed, effect, inject, input } from '@angular/core';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { NavController } from '@ionic/angular/nav-controller';

import { UpdateTaskInput } from '@entities/task';
import { EditTaskStore, TaskEditForm } from '@features/edit-task';
import { ListProjectsStore } from '@features/list-projects';
import { ViewTaskStore } from '@features/view-task';
import { wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { NotifyService } from '@shared/ui/notify/notify';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

@Component({
  selector: 'app-task-edit-page',
  imports: [
    ErrorState,
    InsetGroup,
    IonBackButton,
    IonButton,
    IonButtons,
    IonSpinner,
    PAGE_CHROME,
    SkeletonRows,
    TaskEditForm,
  ],
  providers: [ViewTaskStore, EditTaskStore],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            [defaultHref]="taskPath()"
            [text]="name()"
            [attr.aria-label]="'Back to ' + name()"
          />
        </ion-buttons>
        <ion-title>Edit task</ion-title>
        <ion-buttons slot="end">
          <!-- Mounts with the form: an ion-button rendered before its form never submits it.
               Never validity-disabled: submitting empty fields must reveal their errors. -->
          @if (detail.task()) {
            <ion-button
              type="submit"
              fill="solid"
              color="primary"
              form="edit-task-form"
              [attr.aria-label]="wide() ? null : 'Save changes'"
              [disabled]="edit.saving()"
            >
              @if (edit.saving()) {
                <ion-spinner name="lines-small" />
              } @else if (wide()) {
                Save
              } @else {
                <span slot="icon-only" class="icon-[regular--check]" aria-hidden="true"></span>
              }
            </ion-button>
          }
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="mx-auto max-w-(--app-column)">
        @if (detail.error() && !detail.hasLoaded()) {
          <app-error-state
            class="m-5"
            title="Unable to load task"
            [message]="detail.error()!"
            (retry)="reload()"
          />
        } @else if (detail.task(); as task) {
          <app-task-edit-form
            formId="edit-task-form"
            [task]="task"
            [folders]="edit.folders()"
            [saving]="edit.saving()"
            [error]="edit.error()"
            (submitted)="save($event)"
          />
        } @else {
          <app-inset-group label="Container">
            <app-skeleton-rows variant="task" label="Loading task" />
          </app-inset-group>
        }
      </div>
    </ion-content>
  `,
})
export class TaskEditPage {
  protected readonly wide = wideScreen();
  protected readonly detail = inject(ViewTaskStore);
  protected readonly edit = inject(EditTaskStore);
  private readonly fleet = inject(ListProjectsStore);
  private readonly notifications = inject(NotifyService);
  private readonly navCtrl = inject(NavController);

  readonly slug = input('');
  readonly name = input('');

  protected readonly taskPath = computed(() => `/projects/${this.slug()}/tasks/${this.name()}`);

  constructor() {
    this.detail.track(this.slug, this.name);
    effect(() => this.edit.loadFolders(this.slug()));
  }

  protected reload(): void {
    if (this.slug() && this.name()) this.detail.refresh(this.slug(), this.name());
  }

  protected save(input: UpdateTaskInput): void {
    if (Object.keys(input).length === 0) {
      void this.navCtrl.navigateBack(this.taskPath());
      return;
    }
    this.edit.update(this.slug(), this.name(), input).subscribe((task) => {
      if (!task) return;

      this.fleet.invalidate();
      this.notifications.success(`Task ${task.name} updated.`);
      void this.navCtrl.navigateBack(this.taskPath());
    });
  }
}
