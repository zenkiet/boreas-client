import type { JSONContent } from '@tiptap/core';
import type { Token } from 'marked';
import { Marked, marked } from 'marked';

/* Escaped so a round trip through the editor cannot invent syntax. */
const ESCAPE = /([\\`*_[\]])/g;

const MARK_WRAP: Record<string, string> = { bold: '**', italic: '*', code: '`' };

/** For the editor's `setContent`: its schema drops any node it lacks. */
export function noteToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false, breaks: true, gfm: true });
}

export function noteToMarkdown(doc: JSONContent): string {
  return blocks(doc.content ?? []).trim();
}

const SAFE_HREF = /^(?:https?:|mailto:)/i;

/* A second instance: marked.use() would change the legal pages and the editor's parse too. */
const preview = new Marked({
  async: false,
  breaks: true,
  gfm: true,
  renderer: {
    /* Angular's sanitizer keeps class and remote img, so raw HTML and images never reach it. */
    html: ({ text }) => escapeHtml(text),
    image: ({ text }) => escapeHtml(text),
    /* Escaped as marked does, with a break after each slash for long paths. */
    codespan: ({ text }) => `<code>${escapeHtml(text).replaceAll('/', '/<wbr>')}</code>`,
    link(token) {
      return SAFE_HREF.test(token.href) ? false : this.parser.parseInline(token.tokens);
    },
  },
  hooks: {
    /* The page owns h1: note headings start at h2 and close up, so no level is ever skipped. */
    processAllTokens(tokens) {
      const headings = collectHeadings(tokens);
      const levels = [...new Set(headings.map((heading) => heading.depth))].sort();
      for (const heading of headings) {
        heading.depth = Math.min(levels.indexOf(heading.depth) + 2, 6);
      }
      return tokens;
    },
    /* Every anchor left is marked's own; a same-window link would navigate the WebView away. */
    postprocess: (html) =>
      html.replaceAll('<a href=', '<a target="_blank" rel="noopener noreferrer" href='),
  },
});

/** Bind through plain `[innerHTML]`, never bypassSecurityTrustHtml: the sanitizer is layer two. */
export function noteToPreviewHtml(markdown: string): string {
  return preview.parse(markdown) as string;
}

function collectHeadings(tokens: readonly Token[]): { depth: number }[] {
  return tokens.flatMap((token) => [
    ...(token.type === 'heading' ? [token as { depth: number }] : []),
    ...('tokens' in token && token.tokens ? collectHeadings(token.tokens) : []),
    ...(token.type === 'list' ? collectHeadings(token.items) : []),
  ]);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function blocks(nodes: readonly JSONContent[]): string {
  return nodes
    .map((node) => block(node))
    .filter(Boolean)
    .join('\n\n');
}

function block(node: JSONContent): string {
  switch (node.type) {
    case 'heading':
      return `${'#'.repeat(Number(node.attrs?.['level']) || 1)} ${inline(node.content ?? [])}`;
    case 'blockquote':
      return quote(blocks(node.content ?? []));
    case 'bulletList':
      return list(node, () => '- ');
    case 'orderedList':
      return list(node, (i) => `${i + 1}. `);
    case 'listItem':
      /* Nested blocks are flattened: the schema allows only paragraphs here. */
      return blocks(node.content ?? []).replace(/\n\n/g, ' ');
    default:
      return inline(node.content ?? []);
  }
}

function quote(body: string): string {
  return body
    .split('\n')
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n');
}

function list(node: JSONContent, marker: (index: number) => string): string {
  return (node.content ?? []).map((item, i) => marker(i) + block(item)).join('\n');
}

function inline(nodes: readonly JSONContent[]): string {
  return nodes.map(leaf).join('');
}

function leaf(node: JSONContent): string {
  if (node.type === 'hardBreak') return '\n';
  if (node.type !== 'text' || !node.text) return '';

  const marks = node.marks ?? [];
  const code = marks.some((mark) => mark.type === 'code');
  const escaped = code ? node.text : node.text.replace(ESCAPE, '\\$1');

  /* Whitespace stays outside the delimiters: emphasis cannot open or close on it. */
  const [, lead, core, trail] = /^(\s*)([\s\S]*?)(\s*)$/.exec(escaped) ?? [];
  if (!core) return escaped;

  let out = core;
  /* Innermost first, so `code` sits inside emphasis and the link wraps everything. */
  for (const type of ['code', 'italic', 'bold']) {
    if (marks.some((mark) => mark.type === type)) out = MARK_WRAP[type] + out + MARK_WRAP[type];
  }

  const link = marks.find((mark) => mark.type === 'link');
  if (link) out = `[${out}](${String(link.attrs?.['href'] ?? '')})`;

  return lead + out + trail;
}
