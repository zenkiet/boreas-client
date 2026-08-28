import type { JSONContent } from '@tiptap/core';
import { marked } from 'marked';

/* Escaped so a round trip through the editor cannot invent syntax. */
const ESCAPE = /([\\`*_[\]])/g;

const MARK_WRAP: Record<string, string> = { bold: '**', italic: '*', code: '`' };

/** Markdown to HTML for `setContent`; the editor schema drops anything it has no node for. */
export function noteToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false, breaks: true, gfm: true });
}

/** Editor document back to markdown, the format the API stores. */
export function noteToMarkdown(doc: JSONContent): string {
  return blocks(doc.content ?? []).trim();
}

/** One-line projection for list rows and previews; never produces HTML. */
export function noteToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}\d+\.\s+/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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

  /* Emphasis cannot open or close on whitespace, so the padding moves outside the delimiters —
     which also keeps adjacent runs from fusing into one unparseable `****`. */
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
