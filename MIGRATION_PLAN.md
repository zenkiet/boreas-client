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
  result count and removable chips (status is a single "Failures only"
  switch). Rows print the API's own title; only a failure adds its body
  verbatim below, and success rows are inert — no expand, no task link.
  Unseen = bold instead of a dot.
- Unseen tracking is client-side (`boreas-alerts-seen`); dock badge dot and
  desktop nav dot come from the same `unseenCount`, loaded by the shell after
  sign-in. `GlassSegmentedItem` gained `dotLabel` so the badge does not
  announce "Unsaved changes".

## API v1.4 (2026-08-23): RBAC ranks + task grants

- `ProjectRole` viewer/operator/member/owner (ranked; `atLeastRole` in
  entities/project). `POST /projects` admin-only — every New-project entry
  point is gated on `session.isAdmin()` and the empty state explains it.
- 404 now also means "hidden from you"; 403 means "outranked". Error copy
  updated to match (404 stays silent about permissions).
- Members list turned owner-only, which makes `members() !== null` the
  owner signal — About editing, Task defaults, Danger zone and member
  management gate on it. Task actions stay optimistic on purpose: grants
  are invisible to their grantee, so the client cannot know per-task rank.
- Task grants: `ProjectApi.grants/addGrant/removeGrant`, `ManageGrantsStore`
  (grants 403→null doubles as the hide signal), and an owner-only Access
  panel on the task Info tab reusing a parametrized `MemberList`
  (`GRANTABLE_ROLES` = no owner; API 400s it).
- **Backend bug found while probing**: a grantee's `GET /projects/{p}`
  blanks `default_env`, but `GET /projects` (the list) returns it intact —
  secrets leak through the list endpoint. Needs a BE fix; FE cannot patch
  around it (the fleet fan-out reads the list).

## Onboarding v2 groundwork (2026-08-23)

- `DEFAULT_SERVER_URL = https://boreas.zenkiet.dev`: a fresh device skips the
  server step entirely and lands on /login. An explicit localStorage value
  still wins, so dev setups keep localhost.
- Change server became `ChangeServerSheet` (sheet on mobile, dialog on
  desktop) opened from Settings and the login header; saves only after a
  health check, and switching servers signs the device out.

## Welcome v2 (2026-08-23)

- Welcome rebuilt as a pitch, not a wizard: hero tagline ("Every branch, its
  own URL.") plus two swipe cards drawn as miniature real UI (curl deploy +
  alert row; log lines + glass dock). The capsule walks Continue -> Continue ->
  Sign in; "Use a different server" sits on the last step and opens
  ChangeServerSheet. The connect form is gone.
- Post-review tweaks: pull-to-refresh is route-opt-out
  (data.pullToRefresh: false on welcome/login; shell blocks the gesture in
  capture phase), the dock's alert dot became an iOS count badge on the bell
  icon, and the change-server sheet dropped its footnote.
- Shows exactly once per device: Sign in sets `boreas-welcomed`, and
  `welcomeSeenGuard` on /login bounces only flagless, tokenless visits to
  /welcome. Deep links (/welcome, /welcome/connect) still open the tour.
- Flag store + guard live in shared/api (not the onboarding feature): the
  barrel would pull the hero's dotlottie into the eager bundle (+59 kB raw),
  and shared segments cannot cross-import.
- ConnectFailedDialog deleted — the sheet's inline callout replaced it.
- Welcome redesign is mocked, not built:
  https://claude.ai/code/artifact/fa1a67da-6fe8-4141-877c-35d0fa91637c
  (hero + two optional cards, Sign in everywhere, show-once flag).

## Known follow-ups

- Members add for non-admin owners requires a raw user id (the API's
  `AddMemberRequest` wants a UUID and `/users` is admin-only).
- The SSE transport re-emits the cumulative body; the store reconnects past ~1.5MB.
  If the backend ever accepts `?token=` or a cookie, `EventSource` could return.
- Project role badges on the home list would cost one members call per project;
  skipped deliberately.
- Labels are editable via the API but exposed in neither Create nor Edit,
  deliberately, until something needs them.

## Live monitor card (v1.5 metrics SSE, 2026-08-24)

- Home "Running tasks" trend card replaced by app-live-monitor. Final shape
  (operator simplified option A after a C round): fleet-total CPU / Memory /
  Network vitals, one aggregate CPU chart, per-project figures behind a
  collapsed "By project" disclosure. Color only past thresholds (>=60% warn,
  >=90% danger; memory measured against host RAM from /stats).
- No BE aggregation exists (verified: only the two stream routes; query
  params ignored; no global stream). Grouping is client-side: one stream per
  project, 1s buckets summing that project's tasks; deltas for network,
  first-sample skip for cpu, >3.5s silence drops a task, silent projects age
  out of the 60s window.
- History is client-only: 60-point window in RAM plus a localStorage snapshot
  (boreas-monitor) so reloads repaint instantly (dimmed until live again).
- StatsTrend and StatsHistoryStore deleted; the /stats poll survives only for
  the stat tiles.
- BE nice-to-have noted: a global /metrics/stream with a project field would
  collapse N connections into one once fleets grow.

## Dev status (v1.6, 2026-08-24)

- Task.devStatus wired through entity/dto/mapper; list dots (project tasks,
  home per-task rows, search results) now show dev status, sorted
  blocked > in_progress > ready via one stable-sort helper. Container state
  moved into words (sub-line "· stopped", existing notes, Container row).
- Change UX = option A of the mockup deck: "Status" row in task Info opens
  DevStatusSheet (responsive sheet/dialog) with described options; PATCH via
  ControlTaskStore.setDevStatus, optimistic per RBAC precedent, fleet cache
  invalidated on success.
- Verified live: create defaults in_progress, old tasks backfilled, PATCH is
  metadata-only, bad value 400, full change flow (sheet -> toast -> dot).
