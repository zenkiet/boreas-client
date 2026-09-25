/** Derived by the mapper: the API has no type field. */
export type NotificationKind =
  'deploy_failed' | 'deployed' | 'status_changed' | 'task_created' | 'task_assigned' | 'other';

export interface Notification {
  readonly id: string;
  readonly taskName: string;
  readonly kind: NotificationKind;
  readonly title: string;
  /** The body without the "task: " prefix it repeats. */
  readonly detail: string;
  /** From the title's " • " suffix (the payload has no project field); '' when it has none. */
  readonly projectName: string;
  readonly seen: boolean;
  readonly createdAt: Date;
}

export interface DeployOutcome {
  readonly at: Date;
  readonly failed: boolean;
}

export function isDeploy(notification: Notification): boolean {
  return notification.kind === 'deployed' || notification.kind === 'deploy_failed';
}
