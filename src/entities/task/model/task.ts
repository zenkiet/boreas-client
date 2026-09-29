import { ProjectRole } from '@shared/api/role';

export type TaskStatus = 'creating' | 'starting' | 'running' | 'stopped' | 'error' | 'unknown';

/* Severity order; lists sort by it so blockers surface first. */
export const DEV_STATUSES = ['blocked', 'in_progress', 'ready'] as const;

export type DevStatus = (typeof DEV_STATUSES)[number];

export const DEV_STATUS_LABEL: Record<DevStatus, string> = {
  blocked: 'Blocked',
  in_progress: 'In progress',
  ready: 'Ready',
};

/* Literal class names, so Tailwind generates them. */
export const DEV_STATUS_DOT: Record<DevStatus, string> = {
  blocked: 'bg-blocked',
  in_progress: 'bg-progress',
  ready: 'bg-ready',
};

/** Identified by name within its project; the id is only a stable tracking key. */
export interface Task {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly note?: string;
  readonly image: string;
  readonly status: TaskStatus;
  readonly devStatus: DevStatus;
  readonly port: number;
  readonly updatedAt: Date;
  readonly env: Readonly<Record<string, string>>;
  readonly pendingRecreate: boolean;
  /** Project role, raised by a grant on this task. */
  readonly myRole: ProjectRole;
}

/** When a task last deployed, and whether that deploy failed. */
export interface DeployOutcome {
  readonly at: Date;
  readonly failed: boolean;
}

/** A task as the fleet embeds it: enough for rows, dots, search and the palette's verbs. */
export interface TaskSummary {
  readonly name: string;
  readonly description?: string;
  readonly image: string;
  readonly status: TaskStatus;
  readonly devStatus: DevStatus;
  readonly myRole: ProjectRole;
  readonly lastDeploy?: DeployOutcome;
}

/** One project of GET /projects; entities cannot import each other, so it names its own fields. */
export interface FleetProject {
  readonly project: {
    readonly id: string;
    readonly slug: string;
    readonly name: string;
    readonly myRole: ProjectRole;
    readonly registryCredentialId?: string;
  };
  readonly tasks: readonly TaskSummary[];
}

export function newestDeploy(tasks: readonly TaskSummary[]): DeployOutcome | undefined {
  return tasks.reduce<DeployOutcome | undefined>(
    (newest, { lastDeploy }) =>
      lastDeploy && (!newest || lastDeploy.at > newest.at) ? lastDeploy : newest,
    undefined,
  );
}

/** Its newest deploy failed on the local today; nothing ticks at midnight, the next load does. */
export function failedToday(task: TaskSummary): boolean {
  return (
    !!task.lastDeploy?.failed && task.lastDeploy.at.toDateString() === new Date().toDateString()
  );
}

export function sortByDevStatus(tasks: readonly Task[]): readonly Task[] {
  return [...tasks].sort(
    (a, b) =>
      DEV_STATUSES.indexOf(a.devStatus) - DEV_STATUSES.indexOf(b.devStatus) ||
      b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
}

/** A task mid-transition rejects further commands until it settles. */
export function isTransitioningTask(task: TaskSummary): boolean {
  return task.status === 'creating' || task.status === 'starting';
}

export function countByDevStatus(tasks: readonly TaskSummary[]): Record<DevStatus, number> {
  const counts: Record<DevStatus, number> = { blocked: 0, in_progress: 0, ready: 0 };
  for (const task of tasks) counts[task.devStatus] += 1;
  return counts;
}

export function describeDevStatus(tasks: readonly TaskSummary[], separator = ' · '): string {
  const counts = countByDevStatus(tasks);
  const parts = DEV_STATUSES.filter((status) => counts[status] > 0).map(
    (status) => `${counts[status]} ${DEV_STATUS_LABEL[status].toLowerCase()}`,
  );
  return parts.length > 0 ? parts.join(separator) : '0 tasks';
}

/** Task names are only unique inside a project. */
export function taskKey(project: string, name: string): string {
  return `${project}/${name}`;
}
