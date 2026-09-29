import { Notification } from '../model/notification';
import { NotificationDto } from './notification.dto';

const KINDS: readonly string[] = [
  'deployed',
  'deploy_failed',
  'status_changed',
  'task_created',
  'task_assigned',
];

export function toNotification(dto: NotificationDto): Notification {
  const body = dto.body ?? '';
  const prefix = `${dto.task_name}: `;

  return {
    id: dto.id,
    project: dto.project,
    taskName: dto.task_name,
    kind: KINDS.includes(dto.type) ? dto.type : 'other',
    title: dto.title,
    detail: body.startsWith(prefix) ? body.slice(prefix.length) : body,
    seen: dto.seen,
    createdAt: new Date(dto.created_at),
  };
}
