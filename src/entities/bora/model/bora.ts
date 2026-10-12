import { ProjectRole } from '@shared/api/role';

/** Each is a marker in public/animations/bora.json. */
export type BoraState =
  'idle' | 'heads' | 'listen' | 'think' | 'speak' | 'talk' | 'done' | 'sorry' | 'sleep';

export type BoraShadow = 'rest' | 'none';

export type BoraAbout =
  | { readonly kind: 'fleet' }
  | { readonly kind: 'project'; readonly project: string }
  | { readonly kind: 'task'; readonly project: string; readonly task: string }
  | { readonly kind: 'alert'; readonly id: string; readonly project: string }
  | { readonly kind: 'build'; readonly project: string; readonly task: string }
  | {
      readonly kind: 'log';
      readonly project: string;
      readonly task: string;
      readonly at: string;
      readonly line: string;
    };

const LINE_MAX = 1000;

/** Cut to what the server accepts; a blank line asks about the task. */
export function logSubject(project: string, task: string, at: string, line: string): BoraAbout {
  const text = line.replace(/\s+/g, ' ').trim().slice(0, LINE_MAX);
  return text ? { kind: 'log', project, task, at, line: text } : { kind: 'task', project, task };
}

export function defaultQuestion(about: BoraAbout): string {
  switch (about.kind) {
    case 'fleet':
      return 'What needs my attention here?';
    case 'project':
      return 'How is this project doing?';
    case 'task':
      return 'How is this task doing?';
    case 'alert':
    case 'build':
      return 'Why did this fail?';
    case 'log':
      return 'What does this line mean?';
  }
}

export type BoraOp =
  | 'task.start'
  | 'task.stop'
  | 'task.restart'
  | 'task.create'
  | 'task.delete'
  | 'task.update'
  | 'task.env'
  | 'member.add'
  | 'member.role'
  | 'member.remove'
  | 'grant.add'
  | 'grant.remove'
  | 'project.update'
  | 'project.delete';

export const BORA_OPS: ReadonlySet<string> = new Set<BoraOp>([
  'task.start',
  'task.stop',
  'task.restart',
  'task.create',
  'task.delete',
  'task.update',
  'task.env',
  'member.add',
  'member.role',
  'member.remove',
  'grant.add',
  'grant.remove',
  'project.update',
  'project.delete',
]);

export type BoraDevStatus = 'blocked' | 'in_progress' | 'ready';

export interface BoraAction {
  readonly op: BoraOp;
  readonly project: string;
  readonly task?: string;
  readonly reason: string;
  readonly userId?: string;
  readonly username?: string;
  readonly role?: ProjectRole;
  readonly fields: Readonly<{
    name?: string;
    description?: string;
    note?: string;
    devStatus?: BoraDevStatus;
    image?: string;
    port?: number;
    autoRestart?: boolean;
    volumes?: Readonly<Record<string, string>>;
    registryCredentialId?: string;
  }>;
  readonly set: Readonly<Record<string, string>>;
  readonly unset: readonly string[];
}

export interface BoraSource {
  readonly repo: string;
  readonly path: string;
  readonly url?: string;
}

export interface BoraMessage {
  /** Its place in the saved conversation, from 0; -1 until the server has saved it. */
  readonly index: number;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly say: string;
  readonly actions: readonly BoraAction[];
  readonly choices: readonly string[];
  readonly sources: readonly BoraSource[];
  readonly at: Date;
  readonly ran?: readonly string[];
}

export function screenAbout(url: string): BoraAbout {
  const [, project, task] =
    /^\/projects\/(?!new(?:[/?#]|$))([^/?#]+)(?:\/tasks\/(?!new(?:[/?#]|$))([^/?#]+))?/.exec(url) ??
    [];
  if (project && task) {
    return { kind: 'task', project: decodeURIComponent(project), task: decodeURIComponent(task) };
  }
  return project ? { kind: 'project', project: decodeURIComponent(project) } : { kind: 'fleet' };
}

/** The server's cap on a question, in code points after trimming. */
export const QUESTION_MAX = 2000;

export function questionLength(text: string): number {
  return [...text.trim()].length;
}

export interface BoraListItem {
  readonly id: string;
  readonly title: string;
  readonly about: BoraAbout;
  readonly updatedAt: Date;
  readonly answering: boolean;
  readonly snippet?: string;
}

export interface BoraThread {
  readonly id: string;
  readonly title: string;
  readonly about: BoraAbout;
  readonly messages: readonly BoraMessage[];
  readonly answering: { readonly question: string; readonly since: Date } | null;
}
