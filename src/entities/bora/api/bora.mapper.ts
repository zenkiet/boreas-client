import type { ApiError, ApiErrorKind } from '@shared/api/api-error';
import {
  BORA_OPS,
  BoraAbout,
  BoraAction,
  BoraListItem,
  BoraMessage,
  BoraOp,
  BoraThread,
} from '../model/bora';
import {
  BoraAboutDto,
  BoraActionDto,
  BoraListItemDto,
  BoraMessageDto,
  BoraThreadDto,
} from './bora.dto';

/* Only what the dto carries: absent keys stay absent, so a label never names a field nobody set. */
const present = <T extends object>(object: T) =>
  Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as T;

/** Unknown ops and actions without a target are dropped: the client runs only what it can label. */
function toBoraAction(dto: BoraActionDto): BoraAction | null {
  if (!BORA_OPS.has(dto.op) || !dto.project) return null;
  const op = dto.op as BoraOp;
  if (op.startsWith('task.') || op.startsWith('grant.')) {
    if (!dto.task) return null;
  }
  if ((op.startsWith('member.') || op.startsWith('grant.')) && !(dto.user_id && dto.username)) {
    return null;
  }
  const project = op === 'project.update';
  return {
    op,
    project: dto.project,
    task: dto.task,
    reason: (dto.reason ?? '').slice(0, 200),
    userId: dto.user_id,
    username: dto.username,
    role: dto.role,
    fields: present({
      name: dto.name,
      description: dto.description,
      note: dto.note,
      devStatus: dto.dev_status,
      image: project ? dto.default_image : dto.image,
      port: project ? dto.default_port : dto.port,
      autoRestart: dto.auto_restart,
      volumes: dto.volumes,
      registryCredentialId: dto.registry_credential_id,
    }),
    set: (project ? dto.default_env_set : dto.set) ?? {},
    unset: (project ? dto.default_env_unset : dto.unset) ?? [],
  };
}

function toBoraMessage(dto: BoraMessageDto): BoraMessage {
  const choices = (dto.choices ?? []).filter((choice) => typeof choice === 'string');
  return {
    index: dto.index,
    role: dto.role,
    content: dto.content ?? '',
    say: dto.say ?? '',
    // A clarifying question carries no actions.
    actions: choices.length
      ? []
      : (dto.actions ?? [])
          .map(toBoraAction)
          .filter((action): action is BoraAction => action !== null),
    choices,
    sources: dto.sources ?? [],
    ran: dto.ran ?? [],
    at: dto.at ? new Date(dto.at) : new Date(),
  };
}

/* The server sends back what the client sent, or what an earlier client did. */
const toBoraAbout = (dto: BoraAboutDto) => dto as unknown as BoraAbout;

export function toBoraListItem(dto: BoraListItemDto): BoraListItem {
  return {
    id: dto.id,
    title: dto.title,
    about: toBoraAbout(dto.about),
    updatedAt: new Date(dto.updated_at),
    answering: dto.answering,
    snippet: dto.snippet || undefined,
  };
}

export function toBoraThread({ conversation }: BoraThreadDto): BoraThread {
  return {
    id: conversation.id,
    title: conversation.title,
    about: toBoraAbout(conversation.about),
    messages: (conversation.messages ?? []).map(toBoraMessage),
    answering: conversation.answering && {
      question: conversation.answering.question,
      since: new Date(conversation.answering.since),
    },
  };
}

export type BoraEvent =
  | { readonly type: 'conversation'; readonly id: string }
  | { readonly type: 'step' | 'say' | 'delta'; readonly text: string }
  | { readonly type: 'reset' | 'stopped' }
  | { readonly type: 'done'; readonly message: BoraMessage; readonly title?: string }
  | { readonly type: 'error'; readonly problem: ApiError };

const KINDS = new Set<string>([
  'invalid-input',
  'unauthorized',
  'forbidden',
  'not-found',
  'conflict',
  'rate-limited',
  'server',
  'network',
]);

/** Null for heartbeats and events added later. */
export function toBoraEvent(event: string, data: string): BoraEvent | null {
  const body = (data ? JSON.parse(data) : {}) as Record<string, unknown>;
  switch (event) {
    case 'conversation':
      return { type: event, id: String(body['id']) };
    case 'step':
    case 'say':
    case 'delta':
      return { type: event, text: String(body['text'] ?? '') };
    case 'reset':
    case 'stopped':
      return { type: event };
    case 'done':
      return {
        type: event,
        message: toBoraMessage(body['message'] as BoraMessageDto),
        title: (body['title'] as string | undefined) || undefined,
      };
    case 'error': {
      const kind = String(body['kind']);
      return {
        type: event,
        problem: {
          kind: (KINDS.has(kind) ? kind : 'unknown') as ApiErrorKind,
          message: String(body['message'] ?? ''),
        },
      };
    }
    default:
      return null;
  }
}
