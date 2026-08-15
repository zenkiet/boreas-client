import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiAppBar } from '@taiga-ui/layout';

import { Reveal } from '@shared/lib/motion/reveal.directive';
import { BackLink } from '@shared/ui/back-link/back-link';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { CreateTaskInput } from '@entities/task';
import { CreateTaskStore, TaskForm } from '@features/create-task';

@Component({
  selector: 'app-task-create-page',
  imports: [BackLink, GlassIconButton, PageHeader, Reveal, RouterLink, TaskForm, TuiAppBar],
  providers: [CreateTaskStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div appReveal class="mx-auto grid max-w-[56rem] grid-cols-1 gap-3.5 md:gap-4">
      <!-- The scroll edge prevents content showing through Taiga's transparent app bar. -->
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <a tuiSlot="start" tuiAppBarBack routerLink="/dashboard" aria-label="Back to tasks"></a>
          New task
          <!-- Keep validation-enabled: submitting empty fields must reveal their errors. -->
          <button
            tuiSlot="end"
            appGlassIconButton
            icon="@tui.check"
            type="submit"
            form="create-task-form"
            aria-label="Create task"
            [disabled]="create.creating()"
          ></button>
        </tui-app-bar>
      </div>

      <div class="hidden md:block">
        <app-back-link link="/dashboard" label="Tasks" />
        <div class="mt-1.5">
          <app-page-header
            title="New task environment"
            description="Boreas assigns the proxy route once the container is ready."
          />
        </div>
      </div>

      <app-task-form
        formId="create-task-form"
        [creating]="create.creating()"
        [error]="create.error()"
        (submitted)="createTask($event)"
      />
    </div>
  `,
})
export class TaskCreatePage {
  protected readonly create = inject(CreateTaskStore);
  private readonly router = inject(Router);

  protected createTask(input: CreateTaskInput): void {
    this.create.create(input).subscribe((task) => {
      if (task) void this.router.navigate(['/tasks', task.id]);
    });
  }
}
