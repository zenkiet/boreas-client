export type NotificationStatusDto = 'success' | 'failure' | 'info';

export interface NotificationDto {
  id: string;
  task_name: string;
  status: NotificationStatusDto;
  title: string;
  body?: string;
  seen?: boolean;
  created_at: string;
}

export interface NotificationsResponseDto {
  notifications: NotificationDto[] | null;
  total: number;
}
