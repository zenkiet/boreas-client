export type UserRoleDto = 'admin' | 'user';

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: UserRoleDto;
  disabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserResponseDto {
  user: UserDto;
}

export interface UsersResponseDto {
  users: UserDto[] | null;
  total: number;
}

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: UserDto;
}

export interface CreateUserRequestDto {
  username: string;
  email: string;
  password: string;
  role?: UserRoleDto;
}

export interface UpdateUserRequestDto {
  email?: string;
  password?: string;
  role?: UserRoleDto;
  disabled?: boolean;
}
