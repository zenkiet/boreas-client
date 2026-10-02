/** The API's type; one this client does not know yet is `other`. */
export type NotificationKind =
  | 'deploy_failed'
  | 'build_failed'
  | 'deployed'
  | 'status_changed'
  | 'task_created'
  | 'task_assigned'
  | 'other';

export interface Notification {
  readonly id: string;
  /** Project slug. */
  readonly project: string;
  readonly taskName: string;
  readonly kind: NotificationKind;
  readonly title: string;
  /** The body without the "task: " prefix it repeats. */
  readonly detail: string;
  readonly seen: boolean;
  readonly createdAt: Date;
}
