import { Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiAppBar } from '@taiga-ui/layout';

import { UpdateTaskInput } from '@entities/task';
import { EditTaskStore, TaskEditForm } from '@features/edit-task';
import { ListProjectsStore } from '@features/list-projects';
import { ViewTaskStore } from '@features/view-task';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { BackLink } from '@shared/ui/back-link/back-link';
import { ErrorState } from '@shared/ui/error-state/error-state';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';
import { NotifyService } from '@shared/ui/notify/notify';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { SkeletonRows } from '@shared/ui/skeleton-rows/skeleton-rows';

@Component({
  selector: 'app-task-edit-page',
  imports: [
    BackLink,
    ErrorState,
    GlassIconButton,
    InsetGroup,
    PageHeader,
    Reveal,
    RouterLink,
    SkeletonRows,
    TaskEditForm,
    TuiAppBar,
  ],
  providers: [ViewTaskStore, EditTaskStore],
  template: `
    <div appReveal class="mx-auto grid max-w-160 grid-cols-1 gap-3.5 md:gap-4">
      <!-- The scroll edge prevents content showing through Taiga's transparent app bar. -->
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <a tuiSlot="start" tuiAppBarBack [routerLink]="taskLink()" aria-label="Back to task"></a>
          Edit task
          <!-- Keep validation-enabled: submitting empty fields must reveal their errors. -->
          <button
            tuiSlot="end"
            appGlassIconButton
            icon="@tui.check"
            type="submit"
            form="edit-task-form"
            aria-label="Save changes"
            [disabled]="edit.saving()"
          ></button>
        </tui-app-bar>
      </div>

      <div class="hidden md:block">
        <app-back-link [link]="taskPath()" [label]="name()" />
        <div class="mt-1.5">
          <app-page-header
            title="Edit task"
            description="Changing the image or port recreates the container."
          />
        </div>
      </div>

      @if (detail.error() && !detail.hasLoaded()) {
        <app-error-state
          title="Unable to load task"
          [message]="detail.error()!"
          (retry)="reload()"
        />
      } @else if (detail.task(); as task) {
        <app-task-edit-form
          formId="edit-task-form"
          [task]="task"
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
  `,
})
export class TaskEditPage {
  protected readonly detail = inject(ViewTaskStore);
  protected readonly edit = inject(EditTaskStore);
  private readonly fleet = inject(ListProjectsStore);
  private readonly notifications = inject(NotifyService);
  private readonly router = inject(Router);

  readonly slug = input('');
  readonly name = input('');

  protected readonly taskLink = computed(() => ['/projects', this.slug(), 'tasks', this.name()]);
  protected readonly taskPath = computed(() => `/projects/${this.slug()}/tasks/${this.name()}`);

  constructor() {
    effect(() => {
      const slug = this.slug();
      const name = this.name();
      if (slug && name) this.detail.refresh(slug, name);
    });
  }

  protected reload(): void {
    if (this.slug() && this.name()) this.detail.refresh(this.slug(), this.name());
  }

  protected save(input: UpdateTaskInput): void {
    this.edit.update(this.slug(), this.name(), input).subscribe((task) => {
      if (!task) return;

      this.fleet.invalidate();
      this.notifications.success(`Task ${task.name} updated.`);
      void this.router.navigate(['/projects', this.slug(), 'tasks', this.name()]);
    });
  }
}
