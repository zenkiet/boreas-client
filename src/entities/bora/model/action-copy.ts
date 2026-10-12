import type { ProjectRole } from '@shared/api/role';

import type { BoraAction, BoraDevStatus, BoraOp } from './bora';

/* Apart from bora.ts, which the shell loads at start: only an answer needs these words. */
const STATUS: Record<BoraDevStatus, string> = {
  blocked: 'Blocked',
  in_progress: 'In progress',
  ready: 'Ready',
};
const article = (role: ProjectRole) => (role === 'operator' || role === 'owner' ? 'an' : 'a');
const VALUE_MAX = 40;
const clip = (value: string) =>
  value.length > VALUE_MAX ? `${value.slice(0, VALUE_MAX - 1)}…` : value;

/* Every value the tap writes: the model chose them, so the user reads them before tapping. */
function writes({ op, fields, set }: BoraAction): string {
  const field = op === 'project.update' ? 'default ' : '';
  const { name, devStatus, description, note, image, port, volumes } = fields;
  return [
    name !== undefined && `name ${clip(name)}`,
    devStatus && `status ${STATUS[devStatus]}`,
    description !== undefined &&
      (description ? `description “${clip(description)}”` : 'no description'),
    note !== undefined && (note ? `note “${clip(note)}”` : 'no note'),
    image !== undefined && `${field}image ${image || 'none'}`,
    port !== undefined && `${field}port ${port}`,
    volumes &&
      `volumes ${
        Object.entries(volumes)
          .map(([path, folder]) => `${folder} at ${path}`)
          .join(', ') || 'none'
      }`,
    'registryCredentialId' in fields && 'another registry credential',
    ...Object.entries(set).map(([key, value]) => `${key}=${clip(value)}`),
  ]
    .filter(Boolean)
    .join(', ');
}

/** The button's words, from the op and its target alone: never from the answer's text. */
export function actionLabel(action: BoraAction): string {
  const { task = '', username = '', role = 'viewer', fields, set, unset } = action;
  switch (action.op) {
    case 'task.start':
      return `Start ${task}`;
    case 'task.stop':
      return `Stop ${task}`;
    case 'task.restart':
      return `Restart ${task}`;
    case 'task.create':
      return `Create ${task}`;
    case 'task.delete':
      return `Delete ${task}`;
    case 'task.update':
      return fields.devStatus && Object.keys(fields).length === 1
        ? `Mark ${task} ${STATUS[fields.devStatus]}`
        : `Edit ${task}`;
    case 'task.env': {
      const keys = [...Object.keys(set), ...unset];
      return keys.length === 1
        ? unset.length
          ? `Remove ${keys[0]} from ${task}`
          : `Set ${keys[0]} on ${task}`
        : `Change ${keys.length} variables on ${task}`;
    }
    case 'member.add':
      return `Add ${username} as ${article(role)} ${role}`;
    case 'member.role':
      return `Make ${username} ${article(role)} ${role}`;
    case 'member.remove':
      return `Remove ${username}`;
    case 'grant.add':
      return `Give ${username} ${role} on ${task}`;
    case 'grant.remove':
      return `Revoke ${username} on ${task}`;
    case 'project.update':
      return `Update ${action.project}’s settings`;
    case 'project.delete':
      return `Delete ${action.project}`;
  }
}

export function actionEffect(action: BoraAction): string {
  const { fields, unset } = action;
  const recreates = 'image' in fields || 'port' in fields || 'volumes' in fields;
  const values = writes(action);
  const sets = values ? `Sets ${values}.` : '';
  const removes = unset.length ? ` Removes ${unset.join(', ')}.` : '';
  switch (action.op) {
    case 'task.start':
      return 'Starts the container. Its App URL answers again in a few seconds.';
    case 'task.stop':
      return 'Stops the container. Its App URL stops answering.';
    case 'task.restart':
      return 'Stops and starts the container; a few seconds without answers.';
    case 'task.create':
      return `Creates ${action.task} from ${action.project}’s defaults${values ? `, with ${values}` : ''}.`;
    case 'task.delete':
      return 'Removes the container, its variables and its proxy route.';
    case 'task.update':
      // auto_restart is when, not a setting: false holds the change for the next start.
      return `${sets} ${
        !recreates
          ? 'The container keeps running.'
          : fields.autoRestart === false
            ? 'Applies at the next start.'
            : 'Recreates the container.'
      }`.trim();
    case 'task.env':
      return `${sets}${removes} Recreates the container.`.trim();
    case 'member.add':
    case 'member.role':
      return `${action.username} gets ${action.role} access to ${action.project}.`;
    case 'member.remove':
      return `${action.username} loses access to ${action.project}.`;
    case 'grant.add':
      return `Raises ${action.username}’s access to ${action.task} only.`;
    case 'grant.remove':
      return `${action.username} keeps only the project role on ${action.task}.`;
    case 'project.update':
      return `${sets}${removes} Existing tasks stay as they are.`.trim();
    case 'project.delete':
      return 'Removes the project. The server refuses while it still has tasks.';
  }
}

export const confirmsFirst = (op: BoraOp): boolean =>
  op === 'task.delete' ||
  op === 'project.delete' ||
  op === 'member.remove' ||
  op === 'grant.remove';
