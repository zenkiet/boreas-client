import { Notification } from '../model/notification';
import { NotificationDto } from './notification.dto';

export function toNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    taskName: dto.task_name,
    status: dto.status,
    title: dto.title,
    body: dto.body ?? '',
    seen: dto.seen ?? true,
    createdAt: new Date(dto.created_at),
  };
}
