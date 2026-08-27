# Boreas Client

Angular web and mobile client (Capacitor) for the Boreas container platform.

## Quick start

Requires Node.js 24+ and [pnpm](https://pnpm.io) (one-time: `corepack enable pnpm`).

```bash
pnpm install && pnpm start
```

That is the whole setup: the dev server comes up at `http://localhost:4200/` with live reload, and the app talks to the default Boreas server out of the box — there is no proxy or environment file to configure. Point it at another backend from the app's own Settings → server address.

## Commands

| Command          | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `pnpm start`     | Dev server on `http://localhost:4200/` with live reload |
| `pnpm build`     | Production build into `dist/boreas-client`              |
| `pnpm typecheck` | `tsc --noEmit` over the app project                     |
| `pnpm lint`      | ESLint (includes the FSD layer-boundary rules)          |
| `pnpm verify`    | typecheck + lint + build — what pre-push runs           |

There is no unit-test target yet; `pnpm verify` is the gate a change must pass.

Run `pnpm build` after template changes — `pnpm typecheck` does not type-check templates.

## Mobile (Capacitor)

The iOS and Android shells live in `ios/` and `android/` and load the built web app:

```bash
pnpm build && pnpm exec cap sync
pnpm exec cap open ios      # or: android
```

App icons and splash screens are generated, never hand-edited — see the brand pipeline notes in `AGENTS.md`.

## Architecture

`src/` is layered Feature-Sliced Design (`app > pages > widgets > features > entities > shared`); imports only point downward and ESLint enforces the graph. `AGENTS.md` carries the full coding guidelines and hard-won platform notes; `MIGRATION_PLAN.md` records the decisions and the old-to-new file map.
