# Migration: flat tasks → auth + projects (Boreas API v2)

Decided 2026-08-17 from the mockup round (Direction B — drill-down, Projects as home).
The old backend served a flat, unauthenticated `/api/v1/tasks/{id}`; the new one is
token-guarded and nests tasks under projects.

## Decisions

- **Direction B**: home lists projects; a project pushes to a segmented page
  (Tasks | Members | About); tasks push from there. Dock stays Home/Search/Alerts/Settings.
- **Search** is fleet-wide (fan-out per project), results carry the project slug.
- **Alerts** keeps its coming-soon slot.
- **Admin** (users, registry credentials) lives under Settings, hidden from non-admins.
- **Routes** use the full vocabulary: `/projects/:slug/tasks/:name`.
- **Login** is a standalone chromeless `/login` route rather than a fourth onboarding
  step; connect hands off to it, and every 401 returns to it.

## Old → new map

| Old                                           | New                                                                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `pages/dashboard`                             | `pages/projects` (home) + `pages/project-detail`                                                                     |
| `features/list-tasks/model/list-tasks.store`  | `features/list-projects` (projects + stats + per-project tasks)                                                      |
| `features/list-tasks/ui/dashboard-skeleton`   | deleted (inline skeleton rows)                                                                                       |
| `Task.id` (slug-like)                         | `Task.name` within `project`; `Task.id` is a UUID kept for tracking                                                  |
| `Task.cpuNano/memoryBytes/lastAccessed`       | removed by the API                                                                                                   |
| —                                             | `Task.description`, `Task.projectId`                                                                                 |
| `EventSource` log stream                      | HttpClient progressive-text SSE (bearer header) in `TaskLogApi.stream`                                               |
| download `<a href>`                           | blob fetch through the interceptor (`LogStreamStore.download`)                                                       |
| `SystemStats.maxContainers/containerMemoryMb` | `totalProjects`; memory tile shows host total                                                                        |
| —                                             | `entities/user`, `entities/project`, `entities/registry-credential`                                                  |
| —                                             | `features/auth` (SessionStore, LoginStore), `shared/api/auth-token.store`, `auth.interceptor`, `authenticated.guard` |
| —                                             | `pages/login`, `pages/project-create`, `pages/users`, `pages/registries`                                             |

## API v1.1 (2026-08-18): PATCH /tasks/{name}

- The `/env` endpoints are gone: env reads from `task.env`, env writes and the
  edit-task feature both ride `PATCH /tasks/{name}` (`UpdateTaskInput`). The task
  page saves one request (no separate env fetch).
- Edit task = Direction A: `features/edit-task` + `pages/task-edit` at
  `/projects/:slug/tasks/:name/edit`, entered from the task menu (`edit` action)
  and the desktop action row. The form diffs against the task and sends only
  changed fields; `auto_restart` is a visible "Restart to apply" toggle
  (default on) and is only sent with container-affecting changes. Name is
  immutable (proxy URL identity).
- The `pending_recreate` callout carries a "Restart now" action.
- Env apply keeps `auto_restart: true` (unchanged behaviour; the toggle lives
  only on the edit form).

## API v1.2 (2026-08-20): project task defaults

- Project gained `default_image` / `default_port` / `default_env`, mapped to
  `Project.defaults` (`TaskDefaults`) and written through `TaskDefaultsInput` on
  both create and PATCH. They only prefill the new-task form.
- Verified against the API: `""` clears the image, `{}` clears the env,
  `default_port: 0` is a 400 and `null` is a no-op, and a bare project answers
  with port 80 — so the port is never "unset" in the UI.
- Three touch points: an optional "Task defaults" group on project create, an
  inline group in the project About tab (`ProjectDefaultsForm`, one Save for the
  trio, shown only while the draft differs from the server), and seeding in
  `TaskForm` fed by one `GET /projects/{slug}` in `CreateTaskStore`.

## API v1.3 (2026-08-22): deploy notifications

- `GET /projects/{project}/notifications` (limit 1-200, default 50, newest
  first) records deploy successes and failures; retried identical deploys
  record nothing. Verified live: success body = the digest, failure body =
  the multi-line docker error.
- `pages/alerts` replaces the coming-soon page at `/notifications` (dock label
  was already "Alerts"). `entities/notification` + `features/list-alerts`:
  root-provided fan-out store (no global endpoint), day-grouped feed with
  expandable bodies, filter via TuiResponsiveDialogService (tui-sheet-dialog
  on mobile, dialog on desktop; project / date range / status) with live
  result count and removable chips. Round 2 minimalised rows: one line per
  alert from structured fields (server title unused), failures alone carry
  their first error line, unseen = bold instead of a dot.
- Unseen tracking is client-side (`boreas-alerts-seen`); dock badge dot and
  desktop nav dot come from the same `unseenCount`, loaded by the shell after
  sign-in. `GlassSegmentedItem` gained `dotLabel` so the badge does not
  announce "Unsaved changes".

## Known follow-ups

- Members add for non-admin owners requires a raw user id (the API's
  `AddMemberRequest` wants a UUID and `/users` is admin-only).
- The SSE transport re-emits the cumulative body; the store reconnects past ~1.5MB.
  If the backend ever accepts `?token=` or a cookie, `EventSource` could return.
- Project role badges on the home list would cost one members call per project;
  skipped deliberately.
- Labels are editable via the API but exposed in neither Create nor Edit,
  deliberately, until something needs them.
