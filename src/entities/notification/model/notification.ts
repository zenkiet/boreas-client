export type NotificationStatus = 'success' | 'failure' | 'info';

/** Deploy outcomes plus lifecycle events (created / assigned / status changed). */
export interface Notification {
  readonly id: string;
  readonly taskName: string;
  readonly status: NotificationStatus;
  readonly title: string;
  readonly body: string;
  readonly seen: boolean;
  readonly createdAt: Date;
}
