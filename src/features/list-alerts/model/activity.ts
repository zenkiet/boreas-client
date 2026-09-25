import type { NotificationKind } from '@entities/notification';
import { DEV_STATUSES, DEV_STATUS_LABEL } from '@entities/task/model';
import { ProjectAlert } from './list-alerts.store';

export type ActivityChip = 'all' | 'failures' | 'deploys' | 'status' | 'created';

export const ACTIVITY_CHIPS: readonly { readonly key: ActivityChip; readonly label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'failures', label: 'Failures' },
  { key: 'deploys', label: 'Deploys' },
  { key: 'status', label: 'Status' },
  { key: 'created', label: 'New tasks' },
];

const CHIP_KINDS: Record<ActivityChip, readonly NotificationKind[] | null> = {
  all: null,
  failures: ['deploy_failed'],
  deploys: ['deployed', 'deploy_failed'],
  status: ['status_changed'],
  created: ['task_created'],
};

export function matchesChip(alert: ProjectAlert, chip: ActivityChip): boolean {
  const kinds = CHIP_KINDS[chip];
  return !kinds || kinds.includes(alert.kind);
}

/** Row copy in words, never the API's emoji title. */
export interface AlertDescription {
  readonly title: string;
  readonly detail: string;
  readonly image?: string;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

export function describeAlert(alert: ProjectAlert): AlertDescription {
  switch (alert.kind) {
    case 'deploy_failed':
      return {
        title: 'Deploy failed',
        detail: alert.detail
          .replace(/^Failed at \d{1,2}:\d{2}\s?[AP]M:\s*/i, '')
          .replace(/sha256:([0-9a-f]{12})[0-9a-f]{52}/g, 'sha256:$1'),
      };
    case 'deployed':
      /* "Task completed at 10:42AM" only repeats the time column. */
      return { title: 'Deployed', detail: '' };
    case 'status_changed': {
      const move = /^(.+?)\s*[➔→]\s*(.+)$/.exec(alert.detail);
      if (!move) return { title: 'Status changed', detail: alert.detail };
      const [from, to] = [devLabel(move[1]), devLabel(move[2])];
      return { title: `Moved to ${to}`, detail: `${from} → ${to}` };
    }
    case 'task_created':
      return { title: 'Task created', detail: '', image: alert.detail };
    case 'task_assigned':
      return { title: 'Task assigned', detail: capitalise(alert.detail) };
    default:
      return {
        title: alert.title.replace(/^[^\p{L}]+/u, '').replace(/ • .*$/, '') || 'Activity',
        detail: alert.detail,
      };
  }
}

export function dayLabel(date: Date): string {
  const today = new Date();
  if (sameDay(date, today)) return 'Today';

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(date, yesterday)) return 'Yesterday';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  }).format(date);
}

export function timeLabel(date: Date): string {
  const elapsed = Date.now() - date.getTime();
  if (!sameDay(date, new Date())) return clock(date);
  if (elapsed < MINUTE_MS) return 'now';
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}m`;
  return `${Math.floor(elapsed / HOUR_MS)}h`;
}

export function whenLabel(date: Date): string {
  const at = `${dayLabel(date)} at ${clock(date)}`;
  if (!sameDay(date, new Date())) return at;

  const elapsed = Date.now() - date.getTime();
  const minutes = Math.floor(elapsed / MINUTE_MS);
  const hours = Math.floor(elapsed / HOUR_MS);
  const ago =
    minutes < 1
      ? 'just now'
      : minutes < 60
        ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
        : `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  return `${at} · ${ago}`;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function clock(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/* The server writes "In Progress"; the app's own labels are sentence case. */
function devLabel(raw: string): string {
  const status = DEV_STATUSES.find(
    (key) => DEV_STATUS_LABEL[key].toLowerCase() === raw.trim().toLowerCase(),
  );
  return status ? DEV_STATUS_LABEL[status] : raw.trim();
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
