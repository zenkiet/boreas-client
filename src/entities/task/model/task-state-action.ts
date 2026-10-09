/** PUT /state actions only; delete is its own endpoint. */

export type TaskStateAction = 'start' | 'stop' | 'restart';

export const PENDING_LABEL: Readonly<Record<TaskStateAction, string>> = {
  start: 'starting…',
  stop: 'stopping…',
  restart: 'restarting…',
};

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
