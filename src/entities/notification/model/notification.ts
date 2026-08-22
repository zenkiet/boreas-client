export type NotificationStatus = 'success' | 'failure';

/** One recorded deploy outcome; the server only writes these from /deploy calls. */
export interface Notification {
  readonly id: string;
  readonly taskName: string;
  readonly status: NotificationStatus;
  readonly title: string;
  /** Digest on success, the raw docker error on failure; may be empty. */
  readonly body: string;
  readonly createdAt: Date;
}
