/* Eager entry: through the root barrel TaskMenu would ride into the initial bundle. */
export {
  DEV_STATUSES,
  DEV_STATUS_DOT,
  DEV_STATUS_LABEL,
  failedToday,
  isActiveBuild,
  isBuilding,
  isDown,
  isFailing,
  isQuietBuild,
  isTransitioningTask,
  newestDeploy,
  taskKey,
} from './task';
export type { Build, DeployOutcome, DevStatus, FleetProject, Task, TaskSummary } from './task';
export { describeCompletedAction } from './task-state-action';
export type { TaskStateAction } from './task-state-action';
