import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TuiAppBar } from '@taiga-ui/layout';

import { CreateProjectInput } from '@entities/project';
import { ManageProjectStore, ProjectForm } from '@features/manage-project';
import { Reveal } from '@shared/lib/motion/reveal.directive';
import { BackLink } from '@shared/ui/back-link/back-link';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  selector: 'app-project-create-page',
  imports: [BackLink, GlassIconButton, PageHeader, ProjectForm, Reveal, RouterLink, TuiAppBar],
  providers: [ManageProjectStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div appReveal class="mx-auto grid max-w-[40rem] grid-cols-1 gap-3.5 md:gap-4">
      <!-- The scroll edge prevents content showing through Taiga's transparent app bar. -->
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <a tuiSlot="start" tuiAppBarBack routerLink="/projects" aria-label="Back to projects"></a>
          New project
          <!-- Keep validation-enabled: submitting empty fields must reveal their errors. -->
          <button
            tuiSlot="end"
            appGlassIconButton
            icon="@tui.check"
            type="submit"
            form="create-project-form"
            aria-label="Create project"
            [disabled]="manage.busy()"
          ></button>
        </tui-app-bar>
      </div>

      <div class="hidden md:block">
        <app-back-link link="/projects" label="Projects" />
        <div class="mt-1.5">
          <app-page-header
            title="New project"
            description="Tasks live inside projects and are served at /project/task/."
          />
        </div>
      </div>

      <app-project-form
        formId="create-project-form"
        [creating]="manage.busy()"
        [error]="manage.createError()"
        [credentials]="manage.credentials()"
        (submitted)="createProject($event)"
      />
    </div>
  `,
})
export class ProjectCreatePage {
  protected readonly manage = inject(ManageProjectStore);
  private readonly router = inject(Router);

  protected createProject(input: CreateProjectInput): void {
    this.manage.create(input).subscribe((project) => {
      if (project) void this.router.navigate(['/projects', project.slug]);
    });
  }
}
