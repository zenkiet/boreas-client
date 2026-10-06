/** Eight ANSI hues fold onto the theme tokens that pass AA. */
export type LogTone = 'danger' | 'ok' | 'warn' | 'accent' | 'muted';

export interface LogSpan {
  readonly text: string;
  readonly tone?: LogTone;
  readonly bold?: boolean;
}

export interface LogEntry {
  readonly timestamp: string;
  /** Plain text, escapes stripped: what filters, searches and screen readers get. */
  readonly message: string;
  readonly spans: readonly LogSpan[];
}

/* Black, red, green, yellow, blue, magenta, cyan, white; white stays the default ink. */
const HUES: readonly (LogTone | undefined)[] = [
  'muted',
  'danger',
  'ok',
  'warn',
  'accent',
  'accent',
  'accent',
  undefined,
];

/* CSI (SGR when it ends in m), OSC (hyperlinks, titles) or a two-byte escape. */
const ESCAPE =
  // eslint-disable-next-line no-control-regex -- ANSI sequences are control characters
  /\u001b(?:\[([0-?]*)[ -/]*([@-~])|\][^\u0007\u001b]*(?:\u0007|\u001b\\)?|[@-Z\\-_])/g;

/** Keeps SGR foreground colours and bold; backgrounds go, as they break AA. */
export function parseAnsi(raw: string): Pick<LogEntry, 'message' | 'spans'> {
  if (!raw.includes('\u001b')) return { message: raw, spans: [{ text: raw }] };

  const spans: LogSpan[] = [];
  let tone: LogTone | undefined;
  let bold = false;
  let from = 0;
  const add = (end: number) => {
    const text = raw.slice(from, end);
    if (text) spans.push({ text, tone, bold });
  };

  for (const match of raw.matchAll(ESCAPE)) {
    add(match.index);
    from = match.index + match[0].length;
    if (match[2] !== 'm') continue;

    const codes = (match[1] || '0').split(';').map(Number);
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      if (code === 0) [tone, bold] = [undefined, false];
      else if (code === 1) bold = true;
      else if (code === 2) tone = 'muted';
      else if (code === 22) [tone, bold] = [tone === 'muted' ? undefined : tone, false];
      else if (code === 39) tone = undefined;
      else if (code === 38 || code === 48) {
        /* 256-colour and truecolour fall back to the default ink; skip their arguments. */
        if (code === 38) tone = undefined;
        i += codes[i + 1] === 5 ? 2 : 4;
      } else if (code >= 30 && code <= 37) tone = HUES[code - 30];
      else if (code >= 90 && code <= 97) tone = HUES[code - 90];
    }
  }
  add(raw.length);

  return { message: spans.map(({ text }) => text).join(''), spans };
}
