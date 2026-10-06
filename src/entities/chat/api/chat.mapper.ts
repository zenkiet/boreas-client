import { Chat, ChatMessage } from '../model/chat';
import { ChatDto, ChatMessageDto } from './chat.dto';

export function toChatMessage(dto: ChatMessageDto): ChatMessage {
  return {
    role: dto.role,
    content: dto.content,
    sources: dto.sources ?? [],
    at: new Date(dto.at),
  };
}

export function toChat(dto: ChatDto): Chat {
  return {
    id: dto.id,
    project: dto.project,
    title: dto.title,
    messages: (dto.messages ?? []).map(toChatMessage),
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}
