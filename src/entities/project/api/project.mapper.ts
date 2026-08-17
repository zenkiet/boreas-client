import { AddMemberInput, Member } from '../model/member';
import { CreateProjectInput, Project, UpdateProjectInput } from '../model/project';
import {
  AddMemberRequestDto,
  CreateProjectRequestDto,
  MemberDto,
  ProjectDto,
  UpdateProjectRequestDto,
} from './project.dto';

export function toProject(dto: ProjectDto): Project {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name || dto.slug,
    registryCredentialId: dto.registry_credential_id,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

export function toCreateProjectRequestDto(input: CreateProjectInput): CreateProjectRequestDto {
  return {
    slug: input.slug,
    name: input.name || undefined,
    registry_credential_id: input.registryCredentialId,
  };
}

export function toUpdateProjectRequestDto(input: UpdateProjectInput): UpdateProjectRequestDto {
  const body: UpdateProjectRequestDto = {};

  if (input.name !== undefined) {
    body.name = input.name;
  }

  /* null detaches the credential; an omitted key leaves it unchanged. */
  if (input.registryCredentialId !== undefined) {
    body.registry_credential_id = input.registryCredentialId;
  }

  return body;
}

export function toMember(dto: MemberDto): Member {
  return {
    userId: dto.user_id,
    username: dto.username,
    role: dto.role,
    createdAt: new Date(dto.created_at),
  };
}

export function toAddMemberRequestDto(input: AddMemberInput): AddMemberRequestDto {
  return { user_id: input.userId, role: input.role };
}
