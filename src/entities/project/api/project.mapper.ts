import { AddMemberInput, Member } from '../model/member';
import {
  CreateProjectInput,
  DEFAULT_TASK_PORT,
  Project,
  TaskDefaultsInput,
  UpdateProjectInput,
} from '../model/project';
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
    defaults: {
      image: dto.default_image ?? '',
      port: dto.default_port || DEFAULT_TASK_PORT,
      env: dto.default_env ?? {},
    },
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

export function toCreateProjectRequestDto(input: CreateProjectInput): CreateProjectRequestDto {
  return {
    slug: input.slug,
    name: input.name || undefined,
    registry_credential_id: input.registryCredentialId,
    ...toDefaultsRequestDto(input.defaults),
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

  return { ...body, ...toDefaultsRequestDto(input.defaults) };
}

type DefaultsRequestDto = Pick<
  UpdateProjectRequestDto,
  'default_image' | 'default_port' | 'default_env'
>;

function toDefaultsRequestDto(defaults: TaskDefaultsInput | undefined): DefaultsRequestDto {
  if (!defaults) return {};

  const body: DefaultsRequestDto = {};

  if (defaults.image !== undefined) body.default_image = defaults.image;
  if (defaults.port !== undefined) body.default_port = defaults.port;
  if (defaults.env !== undefined) body.default_env = { ...defaults.env };

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
