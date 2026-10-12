import { ProjectRole } from '@shared/api/role';

export interface BoraActionDto {
  op: string;
  project: string;
  task?: string;
  reason?: string;
  user_id?: string;
  username?: string;
  role?: ProjectRole;
  name?: string;
  description?: string;
  note?: string;
  dev_status?: 'blocked' | 'in_progress' | 'ready';
  image?: string;
  port?: number;
  auto_restart?: boolean;
  volumes?: Record<string, string>;
  registry_credential_id?: string;
  default_image?: string;
  default_port?: number;
  set?: Record<string, string>;
  unset?: string[];
  default_env_set?: Record<string, string>;
  default_env_unset?: string[];
}

export interface BoraMessageDto {
  index: number;
  role: 'user' | 'assistant';
  content: string;
  say?: string;
  actions?: BoraActionDto[] | null;
  choices?: string[] | null;
  sources?: { repo: string; path: string; url?: string }[] | null;
  ran?: string[] | null;
  at?: string;
}

/** `kind` plus the fields that kind takes. */
export type BoraAboutDto = Record<string, string>;

export interface BoraListItemDto {
  id: string;
  title: string;
  about: BoraAboutDto;
  updated_at: string;
  answering: boolean;
  snippet?: string;
}

export interface BoraListDto {
  conversations: BoraListItemDto[] | null;
  next?: string | null;
}

export interface BoraThreadDto {
  conversation: {
    id: string;
    title: string;
    about: BoraAboutDto;
    answering: { question: string; since: string } | null;
    messages: BoraMessageDto[] | null;
  };
}
