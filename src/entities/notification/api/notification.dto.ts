export type NotificationStatusDto = 'success' | 'failure' | 'info';

export type NotificationTypeDto =
  | 'deployed'
  | 'deploy_failed'
  | 'build_failed'
  | 'status_changed'
  | 'task_created'
  | 'task_assigned';

export interface NotificationDto {
  id: string;
  project: string;
  task_name: string;
  type: NotificationTypeDto;
  status: NotificationStatusDto;
  title: string;
  body?: string;
  seen: boolean;
  created_at: string;
}

export interface NotificationsResponseDto {
  notifications: NotificationDto[] | null;
  total: number;
}
