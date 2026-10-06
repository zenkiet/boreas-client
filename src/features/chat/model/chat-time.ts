import { age } from '@shared/lib/format/age';

const DAY = 86_400_000;
const WEEKDAY = new Intl.DateTimeFormat('en', { weekday: 'short' });
const DATE = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

export function chatDay(at: Date, now = new Date()): string {
  /* Rounded: a day across a DST change is 23 or 25 hours long. */
  const days = Math.round(
    (new Date(now).setHours(0, 0, 0, 0) - new Date(at).setHours(0, 0, 0, 0)) / DAY,
  );
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return days < 7 ? WEEKDAY.format(at) : DATE.format(at);
}

export function chatWhen(at: Date, now = new Date()): string {
  const day = chatDay(at, now);
  return day === 'Today' ? age(at, now.getTime()) : day;
}
