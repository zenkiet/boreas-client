import { CreateUserInput, Session, UpdateUserInput, User } from '../model/user';
import {
  CreateUserRequestDto,
  LoginResponseDto,
  UpdateUserRequestDto,
  UserDto,
} from './user.dto';

export function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    role: dto.role,
    disabled: dto.disabled,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

export function toSession(dto: LoginResponseDto): Session {
  return { token: dto.token, user: toUser(dto.user) };
}

export function toCreateUserRequestDto(input: CreateUserInput): CreateUserRequestDto {
  return {
    username: input.username,
    email: input.email,
    password: input.password,
    role: input.role,
  };
}

export function toUpdateUserRequestDto(input: UpdateUserInput): UpdateUserRequestDto {
  return {
    email: input.email,
    password: input.password,
    role: input.role,
    disabled: input.disabled,
  };
}
