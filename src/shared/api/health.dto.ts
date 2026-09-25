export interface HealthDto {
  readonly status?: string;
  readonly service?: string;
  /* Absent before 1.11. */
  readonly version?: string;
}
