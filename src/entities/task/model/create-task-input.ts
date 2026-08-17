export interface CreateTaskInput {
  readonly name: string;
  readonly image: string;
  readonly port: number;
  readonly description?: string;
  readonly environment?: Readonly<Record<string, string>>;
}

export interface UpdateEnvironmentInput {
  readonly environment: Readonly<Record<string, string>>;
}

export interface EnvironmentUpdateResult {
  readonly message: string;
  readonly status: string;
}
