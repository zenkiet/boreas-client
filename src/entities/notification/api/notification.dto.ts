export type NotificationStatusDto = 'success' | 'failure';

export interface NotificationDto {
  id: string;
  task_name: string;
  status: NotificationStatusDto;
  title: string;
  body?: string;
  created_at: string;
}

export interface NotificationsResponseDto {
  notifications: NotificationDto[] | null;
  total: number;
}
