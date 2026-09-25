const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/* Match segments, not substrings: LICENSE_KEY is secret; AUTH_API_URL is not. */
const SECRET_SEGMENTS = new Set([
  'SECRET',
  'SECRETS',
  'TOKEN',
  'PASSWORD',
  'PASSWD',
  'PASS',
  'KEY',
  'APIKEY',
  'CREDENTIAL',
  'CREDENTIALS',
  'PRIVATE',
]);

/** A null `replace` deletes the line. */
export interface EnvFix {
  readonly line: number;
  readonly replace: string | null;
}

export interface EnvIssue {
  /** Zero-based line index. */
  readonly line: number;
  readonly kind: 'syntax' | 'name' | 'duplicate';
  readonly message: string;
  readonly fix?: EnvFix;
}

export interface ParsedEnvironment {
  readonly env: Record<string, string>;
  readonly issues: readonly EnvIssue[];
}

export interface EnvToken {
  readonly text: string;
  readonly tone: 'key' | 'eq' | 'value' | 'dim' | 'bad' | 'ghost';
}

/** Sorted so a round-trip through the editor does not reshuffle the buffer. */
export function toEnvText(environment: Readonly<Record<string, string>>): string {
  return Object.entries(environment)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

export function isSecretKey(key: string): boolean {
  return key
    .toUpperCase()
    .split('_')
    .some((segment) => SECRET_SEGMENTS.has(segment));
}

export function parseEnvText(text: string): ParsedEnvironment {
  const env: Record<string, string> = {};
  const issues: EnvIssue[] = [];
  const firstLine = new Map<string, number>();

  text.split(/\r?\n/).forEach((raw, line) => {
    const pair = splitPair(raw);
    if (pair === undefined) return;
    const n = line + 1;

    if (pair === null) {
      issues.push({ line, kind: 'syntax', message: `Line ${n} needs KEY=value` });
      return;
    }

    if (!KEY_PATTERN.test(pair.key)) {
      const fixed = pair.key
        .toUpperCase()
        .replace(/[^A-Z0-9_]+/g, '_')
        .replace(/^(\d)/, '_$1');
      issues.push({
        line,
        kind: 'name',
        message: `Line ${n}: names use letters, digits and _`,
        fix: KEY_PATTERN.test(fixed)
          ? { line, replace: `${fixed}=${raw.slice(raw.indexOf('=') + 1)}` }
          : undefined,
      });
      return;
    }

    const first = firstLine.get(pair.key);
    if (first !== undefined) {
      /* Dropping the earlier line lets the value typed or pasted last win. */
      issues.push({
        line,
        kind: 'duplicate',
        message: `Line ${n} repeats ${pair.key}`,
        fix: { line: first, replace: null },
      });
      return;
    }

    firstLine.set(pair.key, line);
    env[pair.key] = pair.value;
  });

  return { env, issues };
}

export function applyEnvFix(text: string, fix: EnvFix): string {
  const lines = text.split(/\r?\n/);
  if (fix.replace === null) lines.splice(fix.line, 1);
  else lines[fix.line] = fix.replace;
  return lines.join('\n');
}

/** A key already in the buffer is updated in place, never duplicated. */
export function mergeEnvText(
  text: string,
  incoming: string,
): { readonly text: string; readonly added: number; readonly updated: number } {
  const lines = text ? text.replace(/\n+$/, '').split(/\r?\n/) : [];
  let added = 0;
  let updated = 0;

  for (const raw of incoming.split(/\r?\n/)) {
    const pair = splitPair(raw);
    if (!pair || !KEY_PATTERN.test(pair.key)) continue;

    const entry = `${pair.key}=${pair.value}`;
    const at = lines.findIndex((line) => splitPair(line)?.key === pair.key);
    if (at < 0) {
      lines.push(entry);
      added += 1;
    } else if (lines[at] !== entry) {
      lines[at] = entry;
      updated += 1;
    }
  }

  return { text: lines.join('\n'), added, updated };
}

/** Runs must rebuild the raw line exactly and masks keep its length, or the caret drifts. */
export function envLineTokens(
  raw: string,
  issue: EnvIssue['kind'] | undefined,
  masked: boolean,
  last: boolean,
): readonly EnvToken[] {
  if (!raw.trim()) {
    return raw || !last ? [{ text: raw, tone: 'value' }] : [{ text: 'KEY=value', tone: 'ghost' }];
  }
  if (raw.trimStart().startsWith('#')) return [{ text: raw, tone: 'dim' }];

  const at = raw.indexOf('=');
  if (at < 0 || issue === 'syntax') return [{ text: raw, tone: 'bad' }];

  const key = raw.slice(0, at);
  const value = raw.slice(at + 1);
  const hide = masked && isSecretKey(key.trim().replace(/^export\s+/, ''));

  return [
    { text: key, tone: issue ? 'bad' : 'key' },
    { text: '=', tone: 'eq' },
    { text: hide ? '•'.repeat(value.length) : value, tone: hide ? 'dim' : 'value' },
  ];
}

/* undefined: blank or comment; null: not KEY=value. */
function splitPair(raw: string): { key: string; value: string } | null | undefined {
  const line = raw.trim().replace(/^export\s+/, '');
  if (!line || line.startsWith('#')) return undefined;

  const separator = line.indexOf('=');
  if (separator < 0) return null;

  return {
    key: line.slice(0, separator).trim(),
    value: line
      .slice(separator + 1)
      .trim()
      .replace(/^(["'])([\s\S]*)\1$/, '$2'),
  };
}
