/* POSIX names start with a letter or underscore, followed by alphanumerics or underscores. */
const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export interface ParsedEnvironment {
  readonly env: Record<string, string>;
  readonly errors: readonly string[];
}

/** Sorted so a round-trip through the editor does not reshuffle the buffer. */
export function toEnvText(environment: Readonly<Record<string, string>>): string {
  return Object.entries(environment)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

/** Per-line errors; skips blanks/comments, tolerates `export `, strips one quote pair. */
export function parseEnvText(text: string): ParsedEnvironment {
  const env: Record<string, string> = {};
  const errors: string[] = [];
  const seen = new Set<string>();

  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim().replace(/^export\s+/, '');
    if (!line || line.startsWith('#')) return;

    const separator = line.indexOf('=');
    const at = `Line ${index + 1}`;

    if (separator < 0) {
      errors.push(`${at}: expected KEY=value.`);
      return;
    }

    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^(["'])([\s\S]*)\1$/, '$2');

    if (!KEY_PATTERN.test(key)) {
      errors.push(`${at}: "${key}" is not a valid variable name.`);
      return;
    }

    if (seen.has(key)) {
      errors.push(`${at}: "${key}" is set more than once.`);
      return;
    }

    seen.add(key);
    env[key] = value;
  });

  return { env, errors };
}
