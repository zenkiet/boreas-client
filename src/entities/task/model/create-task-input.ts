import { DevStatus } from './task';

export interface CreateTaskInput {
  readonly name: string;
  readonly image: string;
  readonly port: number;
  readonly description?: string;
  readonly environment?: Readonly<Record<string, string>>;
}

/** Only present fields are sent; image, port, labels or env changes recreate the container. */
export interface UpdateTaskInput {
  readonly description?: string;
  readonly note?: string;
  readonly devStatus?: DevStatus;
  readonly image?: string;
  readonly port?: number;
  readonly labels?: Readonly<Record<string, string>>;
  readonly environment?: Readonly<Record<string, string>>;
  readonly autoRestart?: boolean;
}
