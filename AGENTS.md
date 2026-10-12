# Boreas client

Angular 22 (zoneless, signals) + Ionic 9 (iOS mode, `@rdlabo/ionic-theme-ios27`) + Tailwind v4 + Capacitor 8. It manages a Boreas server: projects, their tasks (containers), live metrics, logs, activity, and Bora, the assistant.

- `pnpm start`, `pnpm build`, `pnpm verify` (typecheck, lint, jscpd, build). jscpd counts runs of 60+ tokens and ignores DTOs and mappers.
- Initial bundle: ~1.20 MB raw, ~257 kB transfer (budget 2 MB). Check growth against it.
- Commits: `<type>(scope): <emoji> subject` (`scripts/validate-commit-msg.sh`).
- Every screen passes AXE and WCAG AA (focus, contrast, ARIA).

## Code

- Standalone components without `standalone: true`; OnPush is the default, so never set `changeDetection`. Use `input()`/`output()`, `host: {}`, `[class]`/`[style]`, `@if`/`@for`/`@switch`. Templates can't reach globals such as `new Date()`.
- Strict TypeScript, no `any` (use `unknown`). State is signals: `computed()`, `set`/`update`, never `mutate`.
- Zoneless: no `NgZone`. Only signal writes render, so a plain field set in an Ionic hook never shows.
- Declarative, no `async`/`await` or hand-made Promises:
  - reads are `rxResource` in stores; read `value()` through `hasValue()`, since it throws on error;
  - writes are one-shot Observables that never error and return a result the page toasts;
  - bridge promises with `from()`/`defer()`. The only allowed promise shims are lazy `import().then`, Signal Forms `submit()`, and fire-and-forget overlay presentation.
- `@Service()` for root singletons, `@Injectable()` for page stores, always `inject()`.
- Comment only a non-obvious why, in one line. JSDoc only on exported API.
- Reuse `listView()`, `describeDevStatus()`/`countByDevStatus()`, `age()`, `reduced()`.

## Forms

- Signal Forms only: `form()`, `[formField]`, schema validators.
  - Initial values are `''`, `0` or `[]`.
  - The schema owns `min`, `max`, `disabled` and `readonly`.
- Import `FieldStatus` next to `FormField` in every form. Ionic shows `errorText` only through the `ng-*` classes, and it drops the `pattern` that FormField passes.
- Never declare a `formField` input on another directive: FormField silently stops wiring the value accessor.
- Clear a form with `draft().reset(value)`, never by writing the model, which leaves every field touched and showing its error.
- Numbers use `<ion-input type="number">`. Dates are ISO `YYYY-MM-DD` strings; pickers are `ion-datetime-button` + `ion-datetime` in `<ion-modal [keepContentsMounted]="true">`.

## Architecture (FSD)

- Layers: `app > pages > widgets > features > entities > shared`, imported downward only (`eslint-plugin-boundaries`). Each `shared/*` segment imports only from itself.
- Enter a slice through its `index.ts`, or `<slice>-page.ts` for a page. Eager code uses a second entry (`model/index.ts`, `api/index.ts`) so a barrel's UI stays out of the initial bundle.
- `entities/*/model` is plain TypeScript. `api/` owns the DTOs and mappers and is the only place `HttpClient` appears; SSE uses `fetch` in `shared/api/sse.ts`.
- `ui/` components are dumb. The page provides the stores and wires the outputs.
- Stores are page-provided. Root is only for:
  - the server address, theme and session;
  - `*Api` classes;
  - `ListProjectsStore`, `ListAlertsStore`, `SearchTasksStore` and `BoraStore`.
- Cross-route caches are keyed on the auth token, load on sign-in, and reload on change events or pull-to-refresh.
- Settings stores sit on the settings parent route; each page calls `load()` on entry.
- UI shared by several features lives in the entity that owns its vocabulary (`entities/task/ui`).
- `MIGRATION_PLAN.md` records the v2 API move.

## Ionic and the theme

- iOS mode everywhere: `provideIonicAngular({ mode: 'ios', useSetInputAPI: true })`. No second component library.
- CSS order (`angular.json`): Ionic core, structure, the dark palette, the theme, then `src/styles.css`.
  - Ionic's `normalize`/`typography` are not loaded.
  - Ionic and the theme stay unlayered, which is why `styles.css` needs its `!important`s.
  - The window never scrolls; each page scrolls inside its `ion-content`.
- Import Ionic per component (`@ionic/angular/ion-button`). The barrel is for `import type` only, or every component lands in one chunk.
- `patches/` are required and pinned:
  - `@rdlabo/ionic-theme-utils` is pointed at `@ionic/core/components`, which avoids a second Ionic runtime (~1 MB);
  - `@rdlabo/ionic-theme-ios27` shims `@stencil/core` and drops an `ionicons` import;
  - `@ionic/core` gets the AXE roles and names.

  Re-check all three on every bump.
- AXE under Ionic 9: no `aria-live` inside a list, non-row content in a list carries `role="listitem"`, and every dialog and popover is named.
- Colours: tokens are on `:root` and `.ion-palette-dark` in `styles.css`; templates use the Tailwind tokens.
  - Dark mode is `ion-palette-dark` on `<html>`, owned by `ThemeStore`.
  - A modal with that class is dark whatever the theme.
- "iPad" means `WIDE_QUERY`: 64rem wide and 31.25rem tall. It drives the split pane, `wideScreen()`, dialogs and `wide-only`/`narrow-only`. Desktop is 80rem (`desktopScreen()`). Tailwind's `md:` is for cosmetic sizes only.

### Shell

- On iPad: `ion-split-pane` with an `ion-menu` sidebar. On phones: a floating `ion-tab-bar` (Home, Activity, Settings) plus the Search fab.
- One navigation stack: tabs and sidebar rows use `navigateRoot`, pushed pages hide the tab bar, and `/welcome` and `/login` have no chrome.
- Never destroy the tab bar: the theme's drag lens is bound to it.
  - Register `registerTabBarEffect` once the bar has the `ios` class.
  - Tab buttons carry `href` so they take keyboard focus.
- Search is the theme's search tab and the URL (`/search`) owns it. The fab and footer are `@defer (on idle)`, queried by template ref, and need real `ion-icon`s for the morph.
- An overlay hides only `ion-router-outlet` from screen readers. The shell watches that `aria-hidden` and makes the tab bar, fab, footer and sidebar `inert`.
- Settings on iPad is a split view (`app/settings-split.ts`, `?pane=`). A pane never sees Ionic's lifecycle, so the host runs `onReturn`.

### Pages

- The template is `ion-header` + `ion-content` as direct children; import `PAGE_CHROME`. Its `PageTitle` makes `ion-title` the h1, so a page whose h1 sits in its content marks the bar title `aria-hidden`.
- Root pages: translucent header, fullscreen content, and a `max-w-(--app-column)` column with a `collapse="condense"` large title. Never pull the title up with a margin: Ionic's collapse observer would miss it.
- Pushed pages use `ion-back-button [defaultHref]`. On project and task pages:
  - the title block and section switch live in `ng-template`s (the header on iPad, the content top on phones);
  - `?section=` is written with `replaceUrl`;
  - the phone switch carries `appPhoneSwitch`;
  - a tab's own action lives in its content.
- Never change a fullscreen header's height on scroll.
- Header actions are icon discs on phones and `fill="solid" class="act"` capsules on iPad.
- A form's Save is a toolbar `type="submit"` with `[form]`, plus a `.cta` pill. Creation forms close with ✕ (`navigateBack`).
- On iPad, New project and New task are dialogs (`NEW_PROJECT_DIALOG`/`NEW_TASK_DIALOG`) that name both buttons.

### Components

- **Lists:** `app-inset-group` with `ion-item` rows.
  - A footer `ion-note` needs its own control-flow block.
  - Size rows and buttons with `--row-min-height` and `--button-*`, never `!important`.
  - Skeletons are real `ion-item`s; tables use `table-layout: fixed`.
- **Controls:**
  - `ion-toggle` snaps back when the app refuses the change;
  - `ion-select interface="popover"`, `ion-segment`;
  - `ion-item-sliding` with Start `success` and Stop `warning`;
  - a busy button holds `ion-spinner name="lines-small" aria-hidden="true"` and keeps its label in `sr-only`;
  - small buttons are 44px tall on a coarse pointer;
  - a section holding a draft or a scroll position is hidden, never destroyed;
  - data fields use `value-input`, image references `value-tail`.
- **Overlays:**
  - `ConfirmActionService`;
  - `NotifyService`: a toast plus a haptic;
  - `SheetService`: `open()` emits only on `SHEET_DONE`, and a `detent` above 1 is in px;
  - menus are `ion-popover`s with unique trigger ids, or `popoverAnchor(event)` for row menus;
  - no action sheets, since their red fails AA.
- **Icons:** Font Awesome through `@iconify/tailwind4` (`public/icons/*.json`).
  - Write whole literal classes. Never name a class after a Tailwind utility (`ring`, `grow`) unless you mean it.
  - `boreas.json` is the app's own set, drawn on Light's 512 grid in 32-unit round strokes. Restart `ng serve` after editing it.
  - Light beside text; regular in discs, the fab, at 16px or less and for chevrons; solid where iOS uses `.fill`.
  - `styles.css` paints Ionic's own glyphs, and SVG-URL props read `shared/ui/glyph-urls.ts`. There is no `ionicons`.
- **Dynamic Type:** `provideDynamicType()` follows iOS's body size, capped at xxLarge.
- **Motion** lives in `shared/ui/motion`:
  - `motion.ts`: tokens, springs and `settled()`;
  - `effects.ts`: lazy WAAPI;
  - `page-motion.ts`, `numeric-text.ts`;
  - `symbol.ts`: lazy only;
  - `flip.ts`: GSAP; lint keeps it and GSAP out of eager code.
- **Motion rules:**
  - Entrances go only through `animate.enter`, gated by `settled()`/`entrance()`: a CSS animation replays whenever Ionic shows a cached page. Nothing moves during a page transition.
  - `fx` marks what Reduce Motion keeps: a 120 ms crossfade. WAAPI reads `reduced()` per call. Reduce Motion also stills Ionic's transitions and overlays (`app/reduced-motion.ts`).
  - Lists move with `relayout()`. Measure new rows two microtasks after the render: a new `ion-item` is 0 px tall until Stencil renders it.
  - A regroup takes two beats: fade what goes, then close the gaps. Angular removes a leaving node as soon as its template node renders elsewhere. A write at once holds the height with an inert spacer.
  - List pages turn off scroll anchoring.
  - GSAP needs `autoRound: false` on both ends.
  - Start tweens with `nextFrame()`.
  - `settled()`/`rendered()` are style reads: read before you write, never right after a render. `:has()` makes forced styles expensive.
  - A large blurred surface moves on transform and opacity only, since clip-path repaints.
  - An outcome without a toast goes through `Announcer`, never from inside a list.
- **Focus and settings:** focus rings use Ionic's `ion-focused`. Reduce Transparency and Reduce Motion each have one `!important` block at the end of `styles.css`.

### Ionic lifecycle traps

- Pages are cached. Re-read on return with `onReturn(fn)`/`ionViewWillEnter()`. Long streams follow `onScreen()`, since HTTP/1.1 allows six connections per host.
- A covered page's change detection is detached, so its effects and `rxResource` loaders freeze; use `onScreen()`. Never pause a stream by making its params `undefined`.
- Pull-to-refresh: `<ion-refresher [appRefresh]="pull">`.
- "Up" is `navigateBack`. Sign-in, sign-out, a server change and a 401 use `navigateRoot`.
- Android back is handled in `app/android-back-button.ts`. A failed lazy chunk reloads at its target online and toasts offline (`app/navigation-error.ts`).
- The theme's Native UI Shell is off. Test on iOS 26+ before calling `enableNativeUIShell()`.

## Interaction

- Confirm only what can't be undone. Start, stop and restart don't confirm; a toast reports them.
- What the state forbids is disabled, with the reason shown. What the role forbids is hidden.
- Whole rows are targets. Task rows open on tap and swipe to Start|Stop, Restart and Delete. On iPad and desktop the same actions show on hover or focus, and `R` restarts. No page-wide single-key shortcuts.
- No buttons inside an `ion-item button`. Disclosures are native `button.disclose`.
- `/` opens Search. `⌘K`/`Ctrl+K` opens the command palette (Search on phones).
- The palette is lazy (`CommandPaletteLauncher`): nothing eager imports `ModalController`, `SheetService` or the palette.
- A disabled user's row dims to 55%. It is the one AA exception.

## Domain and API

- **Auth:** a bearer token (`POST /auth/login`, 30 days) kept in `AuthTokenStore`. `authInterceptor` adds it to `/api/v1/` requests and sends a 401 to `/login`. Guards: `serverConfiguredGuard`, `authenticatedGuard`, `welcomeSeenGuard`.
- **Scope:** everything is project-scoped (`/projects/:slug/tasks/:name`), so key tasks by project + name. `GET /projects` is the fleet: projects, roles, tasks, the last deploy and `bora`. Read it through `ListProjectsStore`.
- **Roles:**
  - `viewer < operator < member < owner` (`atLeastRole`); admins are owner everywhere. `IS_ADMIN` is `undefined` until `/auth/me` answers.
  - 404 means invisible; 403 means the rank is too low.
  - Hide what the role can't do. Owner-only lists load only for owners and admin-only ones while `IS_ADMIN() !== false`, so nobody collects a 403. Counts describe what the caller can see.
- Changing a user's password, role or disabled flag revokes their tokens; say so first.

### Streams

- SSE uses `fetch` (`SseClient`, `sseEvents()`).
  - 45 s of silence means the connection is dead.
  - `reconnect()` retries after 3 s, except on 401, 403 and 404.
  - A 401 runs `expireSession()`.
- Nothing polls:
  - `/events/stream` signals every write;
  - `ListProjectsStore.changes` shares one connection, and pages refetch with `whileOnScreen(…)` and still `onReturn`;
  - `fleet.live` turns false after 5 s of silence, which shows the status pill.
- Stores load by bumping a param, not with `reload()`, which is ignored while a load runs.
- Logs resume with `since`. `parseAnsi` keeps SGR colours and bold. Rows track by entry under the 2,000-line cap.
- `LiveMetricsStore` is page-provided and driven by `onScreen()`.
  - A project's stream carries only the tasks running when it opens, so the store reopens it when that set changes.
  - The folding rules are in `entities/system-stats/model/live-metrics.ts`.
  - Never gate a stream on `document.hidden`.
- The chart is `@defer (on idle)` and is the only importer of `shared/lib/chart` (d3).

### Tasks

- `dev_status` tracks the code, not the container. The list dots show it (`sortByDevStatus`).
- The task page has Overview | Environment | Logs, hidden rather than destroyed, with `?section=`.
  - A log stream that is down says why and offers Start.
  - Call `ViewTaskStore.track()` from the constructor.
  - The proxy URL is the "App URL".
- The env editor is a textarea over a coloured mirror.
  - Their font metrics must match exactly or the caret drifts (`MIRROR = false` turns the mirror off).
  - Secrets are masked while unfocused.
  - Apply recreates the container and names the changed keys (`describeEnvChange`, never the values).
- Edits send only the changed fields; the name is immutable. `POST /tasks/{name}/deploy` is the pipelines'.
- Project defaults only prefill the new-task form. `""` clears the image and `{}` the env; the port can't be unset (80 means untouched).
- Volumes are read-only mounts (`{ containerPath: folder }`), and a PATCH replaces the whole map. `mountPathError()` mirrors the server's 400.
- `build` is the pipeline's report (`PUT …/build`) and is read from the fleet only. A build quiet for 60 min stops being live (`isQuietBuild`); lists show active builds only (`isActiveBuild`).
- Notes are markdown stored verbatim, so stored XSS is real.
  - The preview escapes HTML, keeps http/https/mailto links, and binds plain `[innerHTML]`.
  - `app-markdown` renders notes and Bora's answers.
  - The tiptap schema is the allowlist: removing an extension deletes stored content.
  - `Link` keeps `openOnClick: false`, since a tap would navigate the WebView away. Swipe-back is off on the editor.

### Code and voice

- `repositories` are set by admins and searched in Sourcebot (`GET /code/repositories`, which returns 409 without Sourcebot).
- Dictation (`shared/ui/dictation`) runs one take app-wide, in Bora's language (Settings › Bora, English by default).
  - It uses the device's recognizer (`@capgo/capacitor-speech-recognition`) or Web Speech. Boreas only gets text.
  - Natively it passes `preferLegacyRecognizer`, since iOS 26's SpeechAnalyzer may never send partials, and task names as `contextualStrings`.
  - The field's mic never sends. Bora's world sends on a pause (`hear()` + `endpoint()`).
- iOS needs the microphone and speech-recognition usage strings. Android 11+ needs the `RecognitionService` and `TTS_SERVICE` `<queries>`.

### Bora

- Bora is the only assistant. It answers from the running system and, where a project has repositories, from its code (`sources`). It asks back (`choices`) and proposes `actions`. The fleet's `bora` gates it per project.
- Conversations are saved on the server.
  - A turn streams over `SseClient.events`: `conversation`, `step`, `say`, `delta`, `reset`, `done`, `error`, `stopped`.
  - The client sends only the question.
  - A dropped stream re-attaches; only Stop cancels.
  - `ran` is posted at the tap.
- `BoraStore` is root and eager: the open conversation, the prefs (`boreas-bora`) and the shell state. `BoraHistory` is Recent: the newest 50, search, delete. The chip picks the scope, and a new scope starts a new conversation.
- Questions are counted in code points (`questionLength`, at most 2,000). Return sends only on desktop and never while `isComposing` (Telex).
- 403 and 409 turn the composer off; 404 toasts and closes.
- Closing keeps a question in flight; an answer that lands while closed shows `unread`.
- The subject is the screen (`screenAbout`). Failures and log lines carry Ask Bora buttons; `logSubject()` cuts a line to 1,000.
- Phones get Bora's world (`BoraWorld`), a full-screen modal that is always dark and preloaded on idle.
  - Tap Bora to talk; a pause sends.
  - Bora reads `say` aloud (`shared/ui/speech`) with a karaoke caption. After a spoken question it listens 5 s more.
  - Typed questions stay silent, with Read aloud.
  - Its speaker button mutes it, chimes included (`aloud`, which Settings doesn't show). VoiceOver silences the voice.
  - `worldAnimation` flies Bora from its spot to the centre and lands it, on transform and opacity only.
    - Its keyframes also reset the wrapper that iOS parks below the screen.
    - The landing keeps no end state, since typing scales Bora and the voice drives the halo.
- iPad and desktop get the corner panel (`BoraPanel`), toggled by Bora and closed with Esc.
  - It grows out of Bora and shrinks back into it.
  - Bora stays while its panel is open, even where it otherwise hides.
- Actions run only on their tap, through the app's routes (`BoraRunner`).
  - Labels come from the op and the target, never from the answer.
  - Deletes confirm; start↔stop and a dev status offer Undo.
- `public/animations/bora.json` comes from `scripts/bora-lottie.ts`. Never hand-edit it, and bump the `?v=` the figure loads it with when a marker changes.

### Activity, tokens, search

- Activity (route `/notifications`) is one feed: 100 rows a page, `?project=` filters, and `matchesChip(alert, 'failures')` is the failure test. Opening it POSTs `/notifications/seen`; stub that when automating against a live server.
- API tokens need a login session. The plaintext shows once, never behind a dismissible sheet or an animation. A range that starts today sends `new Date()`, since local today can be yesterday in UTC.
- The search grammar (`parseQuery`) is `is:…`, `project:<slug>` and free text; `is:down` is `isDown`, `is:failed` is `isFailing`. The field's name is set on Ionic's input.

## Server and release

- There is no dev proxy. The API origin is `ServerConfigStore` (default `https://boreas.zenkiet.dev`); never hardcode a URL. A server change health-checks first and clears the token.
- Welcome shows once (`welcomeSeenGuard`, `?step=`). Never import the onboarding barrel eagerly: it pulls in dotlottie. Its Lottie JSON is hand-edited.
- About stays thin: no diagnostics or clear-data actions. The problem-report mailto never carries the token.
- Legal docs are Markdown in `public/legal/`.
  - `/legal/:doc` stays unguarded, since store review needs the privacy URL.
  - A new `boreas-*` key gets a `privacy.md` row; a new dependency gets an `open-source.md` line.
- The version comes from `shared/config/app-info.ts`. JetBrains Mono is self-hosted.
- Boreas first shipped under Apache-2.0; the proprietary `LICENSE` binds later releases only.
- Brand:
  - `public/icon.svg` is the source, and the rasters are hand-made; never run `capacitor-assets generate`.
  - `provideSplash()` lifts the splash, never `whenStable()`, since the streams keep the app busy.
  - A push tap opens Activity, and the payload carries only the title, body and type.
