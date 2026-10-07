import {
  DEV_STATUSES,
  FleetProject,
  TaskSummary,
  failedToday,
  isDown,
  isFailing,
} from '@entities/task/model';
import { FleetTask } from './search-tasks.store';

/** Dev or container states, plus `failed` (isFailing) and `down` (isDown). */
export type StateToken =
  | 'blocked'
  | 'progress'
  | 'ready'
  | 'running'
  | 'stopped'
  | 'error'
  | 'unknown'
  | 'down'
  | 'failed';

export interface SearchQuery {
  readonly text: string;
  readonly states: readonly StateToken[];
  readonly project: string;
}

export interface ProjectMatch {
  readonly project: FleetProject['project'];
  readonly note: string;
}

const STATES: Readonly<Record<string, StateToken>> = {
  blocked: 'blocked',
  progress: 'progress',
  in_progress: 'progress',
  ready: 'ready',
  running: 'running',
  stopped: 'stopped',
  error: 'error',
  unknown: 'unknown',
  down: 'down',
  failed: 'failed',
};

/** The `is:` filter meant by a status word typed without its prefix. */
export function statusToken(text: string): string | null {
  const word = text.split(/\s+/).find((candidate) => STATES[candidate]);
  return word ? `is:${word}` : null;
}

/** Why `is:failed` holds, in words for a result row. */
export function failureOf(task: TaskSummary): string {
  if (task.build?.state === 'failure') return 'build failed';
  return failedToday(task) ? 'deploy failed today' : '';
}

/* An unknown `is:x` stays text: a typo finds nothing, it never widens to everything. */
export function parseQuery(raw: string): SearchQuery {
  const words: string[] = [];
  const states: StateToken[] = [];
  let project = '';

  for (const word of raw.trim().split(/\s+/).filter(Boolean)) {
    const lower = word.toLowerCase();
    const state = lower.startsWith('is:') ? STATES[lower.slice(3)] : undefined;
    if (state) states.push(state);
    else if (lower.startsWith('project:') && lower.length > 8) project = lower.slice(8);
    else words.push(lower);
  }

  return { text: words.join(' '), states, project };
}

export function rankTasks(entries: readonly FleetTask[], query: SearchQuery): readonly FleetTask[] {
  return entries
    .filter(
      (entry) =>
        (!query.project || entry.project.slug.toLowerCase() === query.project) &&
        query.states.every((state) => holds(entry, state)),
    )
    .map((entry, order) => ({ entry, order, rank: rankOf(entry, query.text) }))
    .filter(({ rank }) => rank >= 0)
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        DEV_STATUSES.indexOf(a.entry.task.devStatus) -
          DEV_STATUSES.indexOf(b.entry.task.devStatus) ||
        a.order - b.order,
    )
    .map(({ entry }) => entry);
}

/** State tokens are about tasks, so any of them turns project matches off. */
export function matchProjects(
  summaries: readonly FleetProject[],
  query: SearchQuery,
): readonly ProjectMatch[] {
  if (query.states.length > 0 || (!query.text && !query.project)) return [];

  return summaries
    .filter(({ project }) =>
      query.project
        ? project.slug.toLowerCase() === query.project
        : project.slug.toLowerCase().includes(query.text) ||
          project.name.toLowerCase().includes(query.text),
    )
    .map(({ project, tasks }) => {
      const hits = query.text
        ? tasks.filter((task) => task.name.toLowerCase().includes(query.text)).slice(0, 3)
        : [];
      const detail = hits.length
        ? hits.map((task) => task.name).join(', ')
        : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;
      return { project, note: `/${project.slug} · ${detail}` };
    });
}

/** [before, match, after] around the first case-insensitive `needle`. */
export function splitMatch(value: string, needle: string): readonly [string, string, string] {
  const at = needle ? value.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (at < 0) return [value, '', ''];
  return [value.slice(0, at), value.slice(at, at + needle.length), value.slice(at + needle.length)];
}

function rankOf({ project, task }: FleetTask, text: string): number {
  if (!text) return 0;
  const name = task.name.toLowerCase();
  if (name === text) return 0;
  if (name.startsWith(text)) return 1;
  if (name.includes(text)) return 2;
  if (project.slug.toLowerCase().includes(text) || project.name.toLowerCase().includes(text)) {
    return 3;
  }
  if (
    (task.description ?? '').toLowerCase().includes(text) ||
    task.image.toLowerCase().includes(text)
  ) {
    return 4;
  }
  return -1;
}

function holds({ task }: FleetTask, state: StateToken): boolean {
  switch (state) {
    case 'blocked':
      return task.devStatus === 'blocked';
    case 'progress':
      return task.devStatus === 'in_progress';
    case 'ready':
      return task.devStatus === 'ready';
    case 'failed':
      return isFailing(task);
    case 'down':
      return isDown(task);
    default:
      return task.status === state;
  }
}
