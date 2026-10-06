export interface CodeSource {
  readonly repo: string;
  readonly path: string;
  readonly url?: string;
}

export interface ChatMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly sources: readonly CodeSource[];
  readonly at: Date;
}

/** `messages` is empty in list results. */
export interface Chat {
  readonly id: string;
  readonly project: string;
  readonly title: string;
  readonly messages: readonly ChatMessage[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** The server's cap on a question, in code points after trimming. */
export const QUESTION_MAX = 2000;

export function questionLength(text: string): number {
  return [...text.trim()].length;
}
