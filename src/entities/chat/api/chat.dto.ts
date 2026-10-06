export interface ChatMessageDto {
  role: 'user' | 'assistant';
  content: string;
  sources?: { repo: string; path: string; url?: string }[] | null;
  at: string;
}

export interface ChatDto {
  id: string;
  project: string;
  title: string;
  messages?: ChatMessageDto[] | null;
  created_at: string;
  updated_at: string;
}

export interface ChatResponseDto {
  chat: ChatDto;
}

export interface ChatsResponseDto {
  chats: ChatDto[] | null;
}

export interface ChatMessagesResponseDto {
  messages: ChatMessageDto[] | null;
}
