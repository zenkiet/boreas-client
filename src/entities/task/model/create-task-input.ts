export interface CreateTaskInput {
  readonly id: string;
  readonly image: string;
  readonly port: number;
  readonly environment?: Readonly<Record<string, string>>;
}

export interface UpdateEnvironmentInput {
  readonly environment: Readonly<Record<string, string>>;
}

export interface EnvironmentUpdateResult {
  readonly message: string;
  readonly status: string;
}
