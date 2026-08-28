export const TASK_STATUSES = [
  'creating',
  'starting',
  'running',
  'stopped',
  'error',
  'unknown',
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

/* Severity order; lists sort by it so blockers surface first. */
export const DEV_STATUSES = ['blocked', 'in_progress', 'ready'] as const;

export type DevStatus = (typeof DEV_STATUSES)[number];

export const DEV_STATUS_LABEL: Record<DevStatus, string> = {
  blocked: 'Blocked',
  in_progress: 'In progress',
  ready: 'Ready',
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

/** Stable sort, so tasks keep their given order inside each severity group. */
export function sortByDevStatus(tasks: readonly Task[]): readonly Task[] {
  return [...tasks].sort(
    (a, b) => DEV_STATUSES.indexOf(a.devStatus) - DEV_STATUSES.indexOf(b.devStatus),
  );
}

/** A task mid-transition rejects further commands until it settles. */
export function isTransitioningTask(task: Task): boolean {
  return task.status === 'creating' || task.status === 'starting';
}
