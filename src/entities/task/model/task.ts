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
  readonly projectId: string;
  readonly name: string;
  readonly description?: string;
  readonly note?: string;
  readonly image: string;
  readonly status: TaskStatus;
  readonly devStatus: DevStatus;
  readonly port: number;
  readonly containerId?: string;
  readonly containerIp?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly labels: Readonly<Record<string, string>>;
  readonly env: Readonly<Record<string, string>>;
  readonly error?: string;
  readonly pendingRecreate: boolean;
}

export function sortByDevStatus(tasks: readonly Task[]): readonly Task[] {
  return [...tasks].sort(
    (a, b) =>
      DEV_STATUSES.indexOf(a.devStatus) - DEV_STATUSES.indexOf(b.devStatus) ||
      b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
}

/** A task mid-transition rejects further commands until it settles. */
export function isTransitioningTask(task: Task): boolean {
  return task.status === 'creating' || task.status === 'starting';
}

export function countByDevStatus(tasks: readonly Task[]): Record<DevStatus, number> {
  const counts: Record<DevStatus, number> = { blocked: 0, in_progress: 0, ready: 0 };
  for (const task of tasks) counts[task.devStatus] += 1;
  return counts;
}

export function describeDevStatus(tasks: readonly Task[], separator = ' · '): string {
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
