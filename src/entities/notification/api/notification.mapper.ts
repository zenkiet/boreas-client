import { Notification, NotificationKind } from '../model/notification';
import { NotificationDto } from './notification.dto';

const PROJECT_SEPARATOR = ' • ';

export function toNotification(dto: NotificationDto): Notification {
  const body = dto.body ?? '';
  const prefix = `${dto.task_name}: `;
  const separator = dto.title.lastIndexOf(PROJECT_SEPARATOR);

  return {
    id: dto.id,
    taskName: dto.task_name,
    kind: toKind(dto),
    title: dto.title,
    detail: body.startsWith(prefix) ? body.slice(prefix.length) : body,
    projectName: separator < 0 ? '' : dto.title.slice(separator + PROJECT_SEPARATOR.length).trim(),
    seen: dto.seen ?? true,
    createdAt: new Date(dto.created_at),
  };
}

/* No type field: match the title's words, never its emoji; an unknown event lands in `other`. */
function toKind({ status, title }: NotificationDto): NotificationKind {
  if (status === 'failure') return 'deploy_failed';
  if (status === 'success') return 'deployed';

  const words = title.toLowerCase();
  if (words.includes('status changed')) return 'status_changed';
  if (words.includes('task created')) return 'task_created';
  if (words.includes('task assigned')) return 'task_assigned';
  return 'other';
}
