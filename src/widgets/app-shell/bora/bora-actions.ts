import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular/nav-controller';
import { Observable, defer, filter, map, switchMap, tap } from 'rxjs';

import { BoraAction, BoraDevStatus, confirmsFirst } from '@entities/bora';
import { ProjectApi } from '@entities/project';
import { TaskApi } from '@entities/task/api';
import { ControlTaskStore } from '@features/control-task';
import { CommandResult, toCommandResult } from '@shared/api/command';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';

export interface BoraOutcome extends CommandResult {
  readonly undo?: () => Observable<CommandResult>;
}

const merge = (
  env: Readonly<Record<string, string>>,
  set: Readonly<Record<string, string>>,
  unset: readonly string[],
) => Object.fromEntries(Object.entries({ ...env, ...set }).filter(([key]) => !unset.includes(key)));

@Injectable()
export class BoraRunner {
  private readonly control = inject(ControlTaskStore);
  private readonly tasks = inject(TaskApi);
  private readonly projects = inject(ProjectApi);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly router = inject(Router);
  private readonly nav = inject(NavController);

  /** Completes empty when a confirmation is declined; `started` fires once the command runs. */
  run(action: BoraAction, started: () => void, was?: BoraDevStatus): Observable<BoraOutcome> {
    const command = defer(() => {
      started();
      return this.command(action, was);
    });
    return confirmsFirst(action.op)
      ? this.confirmations.confirm(this.confirmation(action)).pipe(
          filter(Boolean),
          switchMap(() => command),
        )
      : command;
  }

  private command(action: BoraAction, was?: BoraDevStatus): Observable<BoraOutcome> {
    const { project, task = '', fields, set, unset } = action;
    const named = { name: task };
    switch (action.op) {
      case 'task.start':
      case 'task.stop':
      case 'task.restart': {
        const verb =
          action.op === 'task.start' ? 'start' : action.op === 'task.stop' ? 'stop' : 'restart';
        const back = verb === 'start' ? 'stop' : verb === 'stop' ? 'start' : null;
        return this.control.changeState(project, named, verb).pipe(
          map((result) => ({
            ...result,
            undo:
              result.success && back
                ? () => this.control.changeState(project, named, back)
                : undefined,
          })),
        );
      }
      case 'task.create':
        return this.control.create(project, task, fields);
      case 'task.delete':
        return this.control
          .delete(project, named)
          .pipe(
            tap(
              ({ success }) =>
                success && this.leave(`/projects/${project}/tasks/${task}`, `/projects/${project}`),
            ),
          );
      case 'task.update': {
        const { devStatus, description, note, image, port, autoRestart, volumes } = fields;
        if (devStatus && Object.keys(fields).length === 1) {
          return this.control.setDevStatus(project, named, devStatus).pipe(
            map((result) => ({
              ...result,
              undo:
                result.success && was && was !== devStatus
                  ? () => this.control.setDevStatus(project, named, was)
                  : undefined,
            })),
          );
        }
        return toCommandResult(
          this.tasks.update(project, task, {
            devStatus,
            description,
            note,
            image,
            port,
            autoRestart,
            volumes,
          }),
          `Task ${task} saved.`,
        );
      }
      case 'task.env':
        return toCommandResult(
          this.tasks
            .get(project, task)
            .pipe(
              switchMap(({ env }) =>
                this.tasks.update(project, task, { environment: merge(env, set, unset) }),
              ),
            ),
          `Environment applied to ${task}.`,
        );
      case 'member.add':
      case 'member.role':
        return toCommandResult(
          this.projects.addMember(project, {
            userId: action.userId ?? '',
            role: action.role ?? 'viewer',
          }),
          `${action.username} is now ${action.role} in ${project}.`,
        );
      case 'member.remove':
        return toCommandResult(
          this.projects.removeMember(project, action.userId ?? ''),
          `${action.username} removed from ${project}.`,
        );
      case 'grant.add':
        return toCommandResult(
          this.projects.addGrant(project, task, {
            userId: action.userId ?? '',
            role: action.role ?? 'viewer',
          }),
          `${action.username} is now ${action.role} on ${task}.`,
        );
      case 'grant.remove':
        return toCommandResult(
          this.projects.removeGrant(project, task, action.userId ?? ''),
          `${action.username}’s access to ${task} revoked.`,
        );
      case 'project.update':
        return toCommandResult(
          this.projects.get(project).pipe(
            switchMap(({ defaults }) =>
              this.projects.update(project, {
                name: fields.name,
                registryCredentialId: fields.registryCredentialId,
                defaults:
                  fields.image !== undefined ||
                  fields.port !== undefined ||
                  Object.keys(set).length ||
                  unset.length
                    ? {
                        image: fields.image ?? defaults.image,
                        port: fields.port ?? defaults.port,
                        env: merge(defaults.env, set, unset),
                      }
                    : undefined,
              }),
            ),
          ),
          `${project} settings saved.`,
        );
      case 'project.delete':
        return toCommandResult(this.projects.delete(project), `Project ${project} deleted.`).pipe(
          tap(({ success }) => success && this.leave(`/projects/${project}`, '/projects', true)),
        );
    }
  }

  private confirmation(action: BoraAction) {
    switch (action.op) {
      case 'member.remove':
        return {
          title: `Remove ${action.username}?`,
          message: 'They lose access to this project immediately.',
          confirmLabel: 'Remove member',
          destructive: true,
        };
      case 'grant.remove':
        return {
          title: `Revoke access for ${action.username}?`,
          message: 'They lose this task immediately; their project role is untouched.',
          confirmLabel: 'Revoke access',
          destructive: true,
        };
      case 'project.delete':
        return {
          title: `Delete ${action.project}?`,
          message: 'The project and its member list will be deleted. Tasks must be deleted first.',
          confirmLabel: 'Delete project',
          destructive: true,
        };
      default:
        return {
          title: `Delete ${action.task}?`,
          message:
            'The container, its variables and its proxy route are removed. This can’t be undone.',
          confirmLabel: 'Delete task',
          destructive: true,
        };
    }
  }

  /* Off a page whose subject is gone, as the pages themselves do after a delete. */
  private leave(page: string, to: string, root = false): void {
    if (!this.router.url.split(/[?#]/)[0].startsWith(page)) return;
    void (root ? this.nav.navigateRoot(to) : this.nav.navigateBack(to));
  }
}
