# Migration: flat tasks → Boreas API v2

The old backend served flat, unauthenticated `/api/v1/tasks/{id}`. v2 is token-guarded and nests tasks under projects. This file keeps the decisions of that move, what each API version changed, and what is still open; current behaviour lives in `AGENTS.md`.

## Decisions (2026-08-17)

- Home lists projects; a project pushes to Tasks | Members | About, and tasks push from there. Routes use the full vocabulary: `/projects/:slug/tasks/:name`.
- Search is fleet-wide (one request per project) and results carry the project slug.
- Admin surfaces (users, registry credentials) live under Settings, hidden from non-admins.
- Login is its own chromeless `/login` route; every 401 returns to it.

## Old → new

| Old                                              | New                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------ |
| `pages/dashboard`                                | `pages/projects` (Home) + `pages/project-detail`                         |
| `features/list-tasks` store                      | `features/list-projects` (projects, stats, one task list per project)    |
| `Task.id` (slug-like)                            | `Task.name` within its project; `Task.id` is a UUID kept for tracking    |
| `Task.cpuNano`, `memoryBytes`, `lastAccessed`    | removed by the API                                                       |
| —                                                | `Task.description`, `Task.projectId`                                     |
| `EventSource` log stream                         | HttpClient progressive SSE with the bearer header (`TaskLogApi.stream`)  |
| log download `<a href>`                          | blob fetch through the interceptor                                       |
| `SystemStats.maxContainers`, `containerMemoryMb` | `totalProjects`; memory shows the host total                             |
| —                                                | `entities/user`, `entities/project`, `entities/registry-credential`      |
| —                                                | `features/auth`; token store, interceptor and guards in `shared/api`     |
| —                                                | `pages/login`, `pages/project-create`, `pages/users`, `pages/registries` |

## API changes by version

- **v1.1**: `PATCH /tasks/{name}` replaced the `/env` endpoints; env writes and task edits ride one PATCH. `auto_restart` applies container-affecting changes, and `pending_recreate` marks a task still waiting for that restart.
- **v1.2**: projects gained `default_image`, `default_port` and `default_env`, which only prefill the new-task form. `""` clears the image and `{}` the env; `default_port: 0` is a 400 and `null` a no-op, and a bare project answers with port 80.
- **v1.3**: `GET /projects/{p}/notifications` (limit 1–200, default 50, newest first) records deploy successes (body: the digest) and failures (body: the docker error); an identical retried deploy records nothing. Later the feed added lifecycle `info` events (status changed, task created, task assigned), a `seen` flag and `POST …/{id}/seen`, which replaced the client-side seen store.
- **v1.4**: RBAC. Roles rank `viewer < operator < member < owner`; `POST /projects` is admin-only; 404 also means hidden, 403 outranked. The members list became owner-only, and task grants arrived (owner cannot be granted).
- **v1.5**: one metrics SSE stream per project; there is no global stream and query parameters are ignored, so all grouping is client-side.
- **v1.6**: `dev_status` (`blocked`, `in_progress`, `ready`). Create defaults to `in_progress`, old tasks were backfilled, the PATCH is metadata-only, and a bad value is a 400.
- **v1.9**: `Task.note`, markdown in both list and detail payloads, stored verbatim. `""` clears and `null` leaves it unchanged; it never recreates the container or notifies, but it does bump `updated_at`.
- `/health` reports the server `version` (1.11.0 when probed 2026-09-26); older servers omit it.

## Open follow-ups

- **BE, security**: a grantee's `GET /projects/{p}` blanks `default_env`, but `GET /projects` returns it intact, so secrets leak through the list (found 2026-08-23). The client cannot work around it: the fleet reads the list.
- **BE**: `boreas.zenkiet.dev` ends every metrics stream after ~60 s (an HTTP/2 protocol error on all projects at once). The 3 s reconnect hides it; SSE keep-alives or a longer proxy timeout would remove the churn.
- **BE**: a global `/metrics/stream` carrying a project field would collapse N connections into one.
- **BE**: accepting `?token=` or a cookie on the streams would let `EventSource` return; today the store reconnects past ~1.5 MB of cumulative body.
- **BE**: the problem report cannot carry the client IP without a server-provided field.
- Non-admin owners add members by raw user id, because `/users` is admin-only.
- Skipped on purpose: role badges on Home (one members call per project) and label editing (the API accepts labels; nothing needs them yet).
