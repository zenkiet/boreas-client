/** Delete is excluded because this type mirrors only PUT /state actions. */

export const TASK_STATE_ACTIONS = ['start', 'stop', 'restart'] as const;

export type TaskStateAction = (typeof TASK_STATE_ACTIONS)[number];

export function describeCompletedAction(action: TaskStateAction): string {
  switch (action) {
    case 'start':
      return 'started';
    case 'stop':
      return 'stopped';
    case 'restart':
      return 'restarted';
  }
}
