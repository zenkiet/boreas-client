# Boreas client

Angular 22 (zoneless, signals) + Ionic 9 in iOS mode with the `@rdlabo/ionic-theme-ios27` Liquid Glass theme, Tailwind v4, Capacitor 8 for iOS and Android. It manages a Boreas server: projects, their tasks (containers), live metrics, logs and activity.

- `pnpm start`, `pnpm build`, `pnpm verify` (typecheck, lint, jscpd, the SSE splitter check, build). jscpd's `minTokens` is 60 so the per-page Ionic import runs (kept apart for per-route chunks) never count; DTOs and mappers are ignored. The initial bundle warns past 1.15 MB (now ~1.11 MB, 28 kB of it the theme's inert Vertical Bars CSS): a new warning means real growth.
- Commits: `<type>(scope): <emoji> subject`, checked by `scripts/validate-commit-msg.sh`.
- Hard requirements: every screen passes AXE and WCAG AA (focus, contrast, ARIA).

## Code conventions

- Standalone components without `standalone: true`; OnPush is the project default, so never set `changeDetection`. `input()`/`output()`, `host: {}` instead of `@HostBinding`/`@HostListener`, `[class]`/`[style]` instead of `ngClass`/`ngStyle`, `@if`/`@for`/`@switch`, inline templates for small components. Templates cannot reach globals such as `new Date()`.
- Strict TypeScript, no `any` (use `unknown`). State is signals: `computed()` for derived values, `set`/`update`, never `mutate`.
- **Zoneless**: never write `NgZone.run`/`runOutsideAngular`; only signal writes schedule change detection, so a plain field set in an Ionic lifecycle hook never renders.
- **Declarative, no `async`/`await` or hand-made Promises.** Reads are `rxResource` in stores (read `value()` through `hasValue()`, it throws in the error state). Writes are one-shot Observables that never error: both outcomes come back as a result value that the page routes to a toast. Bridge promise APIs with `from()`/`defer()`. Allowed promise shims: lazy `import().then`, Signal Forms `submit()`, fire-and-forget overlay presentation.
- Root singletons use `@Service()`; page-provided stores `@Injectable()`; always `inject()`.
- Comments say WHY in one line; JSDoc only on exported API.
- Reuse the shared helpers instead of rewriting them: `listView()` (list stores), `describeDevStatus()`/`countByDevStatus()`, `age()`, `motionFlag()`.

## Forms (Signal Forms)

- `form()` + `[formField]` + schema validators; never `FormControl`/`FormGroup`/`FormBuilder`. Initial values are `''`, `0` or `[]`, never `null`/`undefined`. The schema owns `min`, `max`, `disabled` and `readonly`: never put them on the input.
- Import `FieldStatus` next to `FormField` in every form: Ionic shows `errorText` only on `.ion-touched.ion-invalid`, which it rebuilds from `ng-*` classes. Never declare a `formField` input on another directive, or FormField silently stops wiring the value accessor.
- Clear after a submit with `draft().reset(value)`, never by writing the model: the fields would stay touched and all show their errors.
- Numbers are `<ion-input type="number">`. Dates are ISO `YYYY-MM-DD` strings compared as strings; pickers are `ion-datetime-button` + `ion-datetime` in `<ion-modal [keepContentsMounted]="true">`.

## Architecture (FSD)

- Layers `app > pages > widgets > features > entities > shared`, imported downward only, never sideways within a layer. Aliases `@app` … `@shared`; `eslint-plugin-boundaries` enforces it.
- Enter a slice only through its public entry: `index.ts`, or `<slice>-page.ts` for a page. Eager code may use a second entry (`model/index.ts`, `api/index.ts`) so that a barrel's UI never lands in the initial bundle: esbuild ships whole files.
- `entities/*/model` is plain TypeScript. `api/` segments own the DTOs, map them to models, and are the only place `HttpClient` appears (SSE reads with `fetch` in `shared/api/sse.ts`).
- `ui/` components are dumb (inputs, outputs, no store, no api). The page is the container: it provides the stores, wires the outputs and passes URLs down.
- Stores (`features/*/model/*.store.ts`) are provided by the page that uses them. Root is reserved for the truly global: server address, theme, session, stateless `*Api` classes, and the cross-route caches `ListProjectsStore`, `ListAlertsStore` and `SearchTasksStore`.
- Cross-route caches are keyed on the auth token (a switched account never sees the old data), serve through `ensureFresh()` with a 30 s staleness window, reload on `load()`, and are `invalidate()`d by the page after any command that changes what Home shows.
- The settings stores (tokens, users, credentials) are provided on the settings parent route, so the list, the iPad panes and the pushed pages share one instance; each page calls `load()` on entry.
- UI used by several features lives in the entity that owns its vocabulary (`entities/task/ui`, `entities/environment/ui`).
- `MIGRATION_PLAN.md` records the v2 API move.

## Ionic and the iOS 27 theme

- iOS mode on every platform (`provideIonicAngular({ mode: 'ios', useSetInputAPI: true })`; the latter lets modal `componentProps` reach signal inputs). No second component library.
- CSS order in `angular.json`: Ionic core, structure and dark palette, the theme, then `src/styles.css`. Ionic's `normalize`/`typography` are not loaded (they override Tailwind). Ionic and the theme stay unlayered: inside a layer they lose to Stencil's runtime styles, which is also why `styles.css` needs its `!important`s. The window never scrolls; each page scrolls inside its `ion-content`.
- Import Ionic per component (`@ionic/angular/ion-button`, `@ionic/angular/modal-controller`); the `@ionic/angular` barrel is for `import type` only, or every component lands in one shared chunk.
- **`patches/` is required and pinned exactly.** The two theme packages import bare `'@ionic/core'` (the lazy-loader build: a second Ionic runtime, ~1 MB more JS) and `'@stencil/core'`; the patch points them at `@ionic/core/components`, and drops the search dismiss button's undeclared `ionicons/icons` import (`styles.css` paints its xmark). `@ionic/core` is patched for AXE (item-group and list roles, popover role and name). Re-check both on every bump; drop the theme patch once upstream imports `@ionic/core/components`.
- AXE under Ionic 9 roles: nothing with `aria-live` inside a list, non-row content in a list carries `role="listitem"`, and every dialog and popover has a name (`SheetService.open` requires `label`).
- Colours: `--ion-*` on `:root` and `:root.ion-palette-dark` in `styles.css`; templates use the Tailwind tokens (`bg-cell`, `text-label-2`, `text-danger`, `rounded-card` …), not `var(--app-…)`. Dark mode is the `ion-palette-dark` class on `<html>`, owned by `ThemeStore`.
- **"iPad" means `WIDE_QUERY`** (64rem wide and 31.25rem tall, `shared/ui/breakpoint`), shared by the split pane, `wideScreen()`, the dialogs and `wide-only`/`narrow-only`. Desktop is 80rem (`desktopScreen()`, `desk-only`/`desk-hide`). Tailwind's `md:` is for cosmetic sizes only, never for chrome.

### Shell (`widgets/app-shell`)

- iPad: `ion-split-pane` with the `ion-menu` sidebar (sized by `--ios-theme-menu-width`). Below that width: the floating `ion-tab-bar` (Home, Activity, Settings) and the Search glass fab. One navigation stack: tabs and sidebar rows `navigateRoot`, pushed pages hide the tab bar, `/welcome` and `/login` have no chrome.
- The tab bar element is never destroyed (the theme's drag lens is bound to it; pushed pages add `.tabs-hidden`). Register `registerTabBarEffect` once the bar carries the `ios` class, never after `componentOnReady()`, which the custom-elements build lacks. Size the bar through the theme.
- Search is the theme's search tab and the URL owns it: entering or leaving `/search` runs the morph. The fab and footer are `@defer (on idle)` and queried by template ref (a class token in `viewChild` pulls them into main). The morph needs real `ion-icon` elements in the tab buttons, the fab and the footer button.
- Settings on iPad is a split view (`app/settings-split.ts`, `?pane=`).

### Pages

- The routed template is `ion-header` + `ion-content` as direct children (the theme's push/pop transition queries them); import `PAGE_CHROME`.
- Root pages: translucent header, fullscreen content, a `max-w-(--app-column)` column that opens with a `collapse="condense"` large title. `styles.css` floats the bar so the title shares its row; never pull the title up with a margin, or Ionic's collapse observer never sees it.
- Pushed pages: `ion-back-button [defaultHref]`. Project and task keep their title block and section switch in `ng-template`s: in the header's second toolbar on iPad, at the top of the content on phones. Never change a fullscreen header's height on scroll: the content jumps.
- Header actions: icon discs on phones (`ion-buttons > ion-button > <span slot="icon-only" class="icon-[regular--…]">`), labelled capsules on iPad (`fill="solid" class="act"`, since clear buttons merge into one capsule). A form's Save is a toolbar `type="submit"` with `[form]`, plus a `.cta` pill under the form; creation forms close with ✕ (`navigateBack`, no discard confirm).
- On iPad, New project and New task open as dialogs through `NEW_PROJECT_DIALOG`/`NEW_TASK_DIALOG` (a page may not import a page).

### Components

- **Lists**: `app-inset-group`; rows are `ion-item`s (value row, link row with the automatic chevron, action row `button [detail]="false"`, two-line label + note). A footer `ion-note` needs its own control-flow block. Size rows with `--row-min-height` and buttons with `--button-font-size`/`--button-min-height`, never `!important`. Skeleton rows are real `ion-item`s; data tables use `table-layout: fixed`.
- **Controls**: `ion-toggle` (snap it back when the app refuses the change), `ion-select interface="popover"`, `ion-segment` (header switches; `seg-fill` inside content), `ion-item-sliding`, `ion-chip`, `ion-spinner name="lines-small"` in busy buttons. Sections that hold a draft or a scroll position are hidden with a class, never destroyed. Data fields take `value-input`, image references `value-tail`.
- **Overlays**: `ConfirmActionService` (alert, `destructive` role), `NotifyService` (toast), `SheetService` (sheet: only a `SHEET_DONE` dismissal emits, a swipe completes empty; a `detent` above 1 is a pixel height), `ion-popover` for menus (unique trigger ids, since Ionic keeps several pages in the DOM, or `[event]` for row menus). No action sheets: their red fails AA.
- **Icons**: Font Awesome Classic through `@iconify/tailwind4` (`public/icons/*.json`): `<span class="icon-[light--house]" aria-hidden="true">`. Write every class out whole, maps included: Tailwind only generates literal strings. The weight follows the text: light beside text, regular in discs, the fab, at 16px or less and for chevrons (`angle-*`), solid where iOS uses `.fill` (tab bar, swipe actions, toasts). Masks draw at 85% of the box. `styles.css` paints Ionic's own glyphs, and SVG-URL props read `shared/ui/glyph-urls.ts`. There is no `ionicons` dependency.
- Keyboard focus rings on Ionic's `ion-focused` class (`:focus-visible` never reaches shadow DOM). Reduce Transparency and reduced motion each have one block at the end of `styles.css`, the only places a user setting may use `!important` wholesale.

### Ionic lifecycle traps

- Ionic caches pages: going back does not rebuild them. Re-read on return with `onReturn(fn)` or `ionViewWillEnter()`; long-lived streams follow `onScreen()`, which ends them on `ionViewDidLeave` (HTTP/1.1 allows six connections per host).
- A covered page's change detection is detached, so its `effect()`s, `toObservable` and `rxResource` loaders freeze. Work that must run while covered uses `onScreen()`, an Observable of the page's DOM events. Never pause a stream by making `rxResource` params `undefined`: the last stream stays subscribed.
- Pull-to-refresh: `<ion-refresher [appRefresh]="pull">` with `PULL_REFRESH` and `pull = { busy, trigger }`.
- "Up" after an action is `navigateBack`; sign-in, sign-out, a server change and the 401 handler use `navigateRoot`.
- Android back lives in `app/android-back-button.ts`. A lazy chunk that fails online reloads at its target (a deploy renamed it); offline, a toast says so (`app/navigation-error.ts`).
- The theme's Native UI Shell plugin is built in but not enabled; test on an iOS 26+ device before calling `enableNativeUIShell()`.

## Interaction rules

- Confirm only what cannot be undone (delete). Start, stop and restart do not confirm; the toast reports the outcome. What the state forbids is disabled, with the reason shown; what the caller's role forbids is hidden.
- Whole rows are targets. Task rows open on tap and swipe to Start|Stop, Restart, Delete; on iPad and desktop the same actions appear on hover or focus, and `R` restarts the focused row. No page-wide single-key shortcuts (WCAG 2.1.4).
- No buttons inside an `ion-item button` (nested interactive content fails AXE). Disclosure rows are native `button.disclose`, because `aria-expanded` needs a real button.
- `/` goes to Search outside fields. `⌘K`/`Ctrl+K` opens the command palette from iPad width and Search on phones. Keep shortcuts on the component that owns the target.
- The command palette is lazy: `CommandPaletteLauncher` holds only the `import()`, so nothing eager may import `ModalController`, `SheetService` or the palette. It opens with `animated: false`, is an APG combobox (`aria-activedescendant`), and only starts, stops or restarts, optimistically, the tasks the caller operates.
- A disabled user's row dims to 55%: the one accepted AA exception, not a pattern to copy.

## Domain and API

### Auth, projects, roles

- Bearer token (`POST /auth/login`, 30 days) kept by `AuthTokenStore`; `authInterceptor` attaches it to `/api/v1/` requests and routes to `/login` on a 401. `SessionStore` derives the user from `/auth/me`. Routes chain `serverConfiguredGuard` then `authenticatedGuard`; `/login` adds `welcomeSeenGuard`.
- Everything is project-scoped: `/projects/:slug`, `/projects/:slug/tasks/:name`, served at `/{project}/{task}/`. Task names are unique per project only, so key tasks by project + name.
- `GET /projects` is the fleet: every project the caller reaches, with `my_role` and its tasks (status, dev status, role, last deploy). Home, Search, the palette, the pins and every "last deploy" read it through `ListProjectsStore`; only the metrics streams go per project.
- Roles rank `viewer < operator < member < owner`; compare with `atLeastRole`. 404 means invisible (names never leak), 403 means the rank is too low.
- Every project and task carries `my_role` (a grant raises a task's; admins are owner everywhere); `IS_ADMIN` (`shared/api/role.ts`) is `undefined` until `/auth/me` answers. Below the role an action is hidden: operator starts, stops and restarts; member edits, deletes, sets the status and note and applies the environment (read-only below); owner gets members, grants and project settings. Owner-only lists load only for owners and admin-only ones while `IS_ADMIN() !== false`, so nobody collects a 403. The server still decides, and counts describe what the caller can see, never totals.
- Picker stores collapse an admin list they may not read to `null`. `/projects/new` and `tasks/new` redirect once the role is known to be too low. Changing a user's password, role or disabled flag revokes their tokens; the UI says so first.

### Streams

- Logs and metrics are SSE read with `fetch` (`SseClient`), since EventSource cannot send the auth header; a 401 runs the interceptor's `expireSession()`. `sseData()` splits the frames (`scripts/check-sse.ts` checks it) and `reconnect()` retries after 3 s except on 401, 403 and 404. Downloads fetch a blob through the interceptor.
- Logs resume with `since` = the newest line's timestamp: the store keeps its lines for the same task, across leaving and returning, and starts over for another.
- `LiveMetricsStore` is page-provided: `onScreen()` drives the connections and the 1 s clock (an RxJS `scan`). The folding rules are pure functions in `entities/system-stats/model/live-metrics.ts`. Never gate a stream on `document.hidden` at call time. The task page's usage reads that task's own stream (`TaskUsageStore`).
- The chart (`app-live-chart`) is `@defer (on idle)` and the only importer of `shared/lib/chart` (d3); nothing may import a value from `live-chart.ts`.

### Tasks

- `dev_status` (`blocked`, `in_progress`, `ready`) tracks the code, not the container. List dots mean dev status, blockers first (`sortByDevStatus`); the container is named in words only when it is not running.
- The task page has Overview | Environment | Logs, hidden rather than destroyed, deep-linked by `?section=`. Call `ViewTaskStore.track()` from the page constructor so its effect dies with the page.
- The env editor is raw `.env` text: a textarea over a coloured mirror whose metrics must match exactly or the caret drifts (`MIRROR = false` is the kill switch). Secrets are masked while unfocused, and `environmentChange` fires only for a clean buffer. Applying recreates the container (`auto_restart: true`); only a success drops the draft.
- Editing sends only the changed fields; the name is immutable (it is the proxy URL). `POST /tasks/{name}/deploy` is for pipelines and has no UI.
- Project defaults (`default_image`, `default_port`, `default_env`) only prefill the new-task form; the server never applies them. `""` clears the image and `{}` the env; the port cannot be unset (80 means untouched).
- Volumes are `{ containerPath: folder }`, read-only mounts of the project's shared folders (`GET /projects/{p}/folders`, made by an admin on the host). The fleet omits them; a PATCH replaces the whole map and recreates the container, like the image. `mountPathError()` mirrors the server's 400 (its only reply is "invalid request"), checked by `scripts/check-volumes.ts`.
- `build` is the CI pipeline's latest report (`PUT …/build` is the pipeline's, never the app's), read from the fleet only, like `lastDeploy`. A running build quiet for 60 min is no longer live (`isQuietBuild`); pages poll the fleet with `pollOnScreen(fleet.building, …)` while one is. Lists show only running, quiet and failed builds (`isActiveBuild`), the task page every state; a failure never changes the container's words.
- Notes are markdown stored verbatim, so stored XSS is real. The preview (`noteToPreviewHtml`, its own `Marked` instance) escapes raw HTML, keeps only http/https/mailto links and binds through plain `[innerHTML]`, never `bypassSecurityTrustHtml`. The tiptap schema is the allowlist: removing an extension silently deletes stored content. `Link` keeps `openOnClick: false` (a tap would navigate the WebView and lose all state), and swipe-back is off on the editor.

### Activity, tokens, search

- Activity is the UI name; the route stays `/notifications`. It is one feed across projects, 100 rows a page (`before` = the last id) behind an infinite scroll; a filter that leaves the list short tops up at most 3 pages. Rows carry `type` (the `kind`; unknown types are `other`) and the project slug, and names come from the fleet. `matchesChip(alert, 'failures')` is the one failure test: `build_failed` links its run only while that task's build is still failing. Unseen comes from the server's `seen` and the badge counts the loaded pages; opening the page POSTs `/notifications/seen` in batches of up to 200 ids, so automation against the live server must stub that POST.
- API tokens are per-user (Settings › General) and need a login session (an API token gets 403). The plaintext exists only in the create response: never put the reveal behind a dismissible sheet or an animation. Revoke is a resident button; revoked rows stay forever. A range starting today sends `new Date()` (local today can still be yesterday in UTC), and the end is `validFrom + days`, within the 90-day cap.
- The search grammar (`parseQuery`): `is:blocked|progress|ready|running|stopped|error|failed`, `project:<slug>`, free text; an unknown `is:x` stays text. `is:failed` means the newest deploy failed today.

## Server, onboarding, release

- There is no dev proxy. The API origin lives in `ServerConfigStore` (default `https://boreas.zenkiet.dev`) and is read per request; never hardcode a URL. Changing servers health-checks for `{"status":"healthy"}` first, and the token is cleared when the address changed.
- Welcome shows once per device (`welcomeSeenGuard`, `boreas-welcomed`) and is one route whose `?step=` is the source of truth. Never import the onboarding barrel eagerly: it pulls in dotlottie. Its Lottie JSON is edited by hand (the generator is not in the repo).
- About is store-compliance surface and deliberately thin: do not bring back diagnostics or clear-data actions. The problem-report mailto must never carry the token.
- Legal docs are Markdown in `public/legal/`, rendered through plain `[innerHTML]`; `/legal/:doc` stays unguarded (store review needs the privacy URL). A new `boreas-*` storage key gets a row in `privacy.md`, a new bundled dependency a line in `open-source.md` (edited by hand).
- The version is a named JSON import from `package.json` (`shared/config/app-info.ts`), which plain `node` scripts cannot import. JetBrains Mono is self-hosted: nothing loads from a third party.
- Boreas first shipped under Apache-2.0; the proprietary `LICENSE` binds later releases only.
- Brand: `public/icon.svg` is the source and every raster is hand-made, with the mark optically centred; never run `capacitor-assets generate`. The native launch screen is flat `#0088FF`, the splash is inline in `index.html` and lifted by `provideSplash()` (never `whenStable()`: the streams keep the app busy). Android notifications use `ic_stat_boreas`.
