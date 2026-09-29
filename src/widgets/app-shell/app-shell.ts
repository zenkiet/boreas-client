import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  linkedSignal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { IonBadge } from '@ionic/angular/ion-badge';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonFab } from '@ionic/angular/ion-fab';
import { IonFabButton } from '@ionic/angular/ion-fab-button';
import { IonFooter } from '@ionic/angular/ion-footer';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonItem } from '@ionic/angular/ion-item';
import { IonItemGroup } from '@ionic/angular/ion-item-group';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonMenu } from '@ionic/angular/ion-menu';
import { IonRouterLink } from '@ionic/angular/ion-router-link';
import { IonRouterOutlet } from '@ionic/angular/ion-router-outlet';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { IonSplitPane } from '@ionic/angular/ion-split-pane';
import { IonTabBar } from '@ionic/angular/ion-tab-bar';
import { IonTabButton } from '@ionic/angular/ion-tab-button';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { NavController } from '@ionic/angular/nav-controller';
import {
  attachTabBarSearchable,
  registerTabBarEffect,
  TabBarSearchableType,
  type TabBarSearchableFunction,
} from '@rdlabo/ionic-theme-ios27';
import { filter, map } from 'rxjs';

import { SessionStore } from '@features/auth';
import { ListAlertsStore } from '@features/list-alerts/model';
import { ListProjectsStore, type ProjectSummary } from '@features/list-projects/model';
import { PinnedProjectsStore } from '@features/pin-project';
import { SearchTasksStore, TaskFilterBar } from '@features/search-tasks/model';
import { AuthTokenStore } from '@shared/api/auth-token.store';
import { ServerConfigStore } from '@shared/config/server-config.store';
import { desktopScreen, WIDE_QUERY, wideScreen } from '@shared/ui/breakpoint/wide-screen';

import { CommandPaletteLauncher } from './command-palette/palette-launcher';
import { NAV, TABS, type NavItem } from './nav';

@Component({
  selector: 'app-shell',
  host: { '(document:keydown)': 'onShortcut($event)' },
  imports: [
    IonBadge,
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonFooter,
    IonIcon,
    IonItem,
    IonItemGroup,
    IonLabel,
    IonList,
    IonMenu,
    IonRouterLink,
    IonRouterOutlet,
    IonSearchbar,
    IonSplitPane,
    IonTabBar,
    IonTabButton,
    IonToolbar,
    RouterLink,
    TaskFilterBar,
  ],
  template: `
    <ion-split-pane contentId="main" [when]="wideQuery" [disabled]="chromeless()">
      <ion-menu contentId="main" type="overlay" [swipeGesture]="false" [disabled]="chromeless()">
        <ion-content>
          <div class="side">
            <div class="side__brand">
              <img src="icon.svg" width="30" height="30" alt="" />
              <span>Boreas</span>
            </div>
            <ion-list [inset]="true" aria-label="Sections">
              <ion-item-group>
                @for (item of nav; track item.link) {
                  @if (item.link === '/search' && desktop()) {
                    <!-- Desktop reaches the search page from the palette's first row. -->
                    <ion-item
                      button
                      lines="none"
                      [detail]="false"
                      [class.nav-active]="navActive() === item.link"
                      (click)="palette.open()"
                    >
                      <span slot="start" [class]="item.icon" aria-hidden="true"></span>
                      <ion-label>{{ item.label }}</ion-label>
                      <kbd slot="end" class="side__kbd" aria-hidden="true">{{
                        palette.shortcut
                      }}</kbd>
                    </ion-item>
                  } @else {
                    <ion-item
                      [routerLink]="item.link"
                      routerDirection="root"
                      lines="none"
                      [detail]="false"
                      [class.nav-active]="navActive() === item.link"
                      [attr.aria-current]="navActive() === item.link ? 'page' : null"
                    >
                      <span slot="start" [class]="item.icon" aria-hidden="true"></span>
                      <ion-label>
                        {{ item.label }}
                        @if (item.link === '/notifications' && unseen()) {
                          <span class="sr-only">, {{ unseen() }} new</span>
                        }
                      </ion-label>
                      @if (item.link === '/search') {
                        <kbd slot="end" class="side__kbd" aria-hidden="true">/</kbd>
                      }
                      @if (item.link === '/notifications' && unseen()) {
                        <ion-badge slot="end" class="count" aria-hidden="true">{{
                          unseen()
                        }}</ion-badge>
                      }
                    </ion-item>
                  }
                }
              </ion-item-group>
            </ion-list>
            @if (pinned().length) {
              <h2 id="side-pinned" class="side__label">Pinned</h2>
              <ion-list [inset]="true" class="pins" aria-labelledby="side-pinned">
                <ion-item-group>
                  @for (pin of pinned(); track pin.slug) {
                    <ion-item
                      class="pin"
                      [routerLink]="['/projects', pin.slug]"
                      routerDirection="root"
                      lines="none"
                      [detail]="false"
                      [class.nav-active]="openSlug() === pin.slug"
                      [attr.aria-current]="openSlug() === pin.slug ? 'page' : null"
                    >
                      <i slot="start" class="pin__dot" [class]="pin.dot" aria-hidden="true"></i>
                      <ion-label>{{ pin.name }}</ion-label>
                      @if (pin.note) {
                        <span slot="end" class="pin__note">{{ pin.note }}</span>
                      }
                    </ion-item>
                  }
                </ion-item-group>
              </ion-list>
            }
            @if (session.user(); as user) {
              <ion-item
                class="side__account"
                routerLink="/settings"
                routerDirection="root"
                lines="none"
                [detail]="false"
              >
                <span slot="start" class="side__avatar" aria-hidden="true">{{
                  user.username.slice(0, 2)
                }}</span>
                <ion-label>
                  <span class="side__user">{{ user.username }}</span>
                  <span class="side__host">{{ serverHost() }}</span>
                </ion-label>
              </ion-item>
            }
          </div>
        </ion-content>
      </ion-menu>

      <div class="ion-page" id="main">
        <ion-router-outlet />
        <!-- Hidden, never destroyed: the lens and the search morph are bound to these elements. -->
        <ion-tab-bar
          slot="bottom"
          [class.tabs-hidden]="!tabs()"
          [inert]="searching()"
          [selectedTab]="tab().link"
        >
          @for (item of tabItems; track item.link) {
            <ion-tab-button [tab]="item.link" (click)="open(item.link)">
              <!-- ion-icon, not a span: the theme's search morph looks that tag up. -->
              <ion-icon [class]="item.tab" aria-hidden="true" />
              <ion-label>
                {{ item.label }}
                @if (item.link === '/notifications' && unseen()) {
                  <span class="sr-only">, {{ unseen() }} new</span>
                }
              </ion-label>
              @if (item.link === '/notifications' && unseen()) {
                <ion-badge class="count" aria-hidden="true">
                  {{ unseen() > 99 ? '99+' : unseen() }}
                </ion-badge>
              }
            </ion-tab-button>
          }
        </ion-tab-bar>
        <!-- Off the first paint: the search field and fab are ~110 kB of Ionic. -->
        @defer (on idle) {
          <ion-fab
            vertical="bottom"
            horizontal="end"
            [class.tabs-hidden]="!tabs()"
            [inert]="searching()"
          >
            <ion-fab-button #searchFab aria-label="Search" (click)="open('/search')">
              <ion-icon class="icon-[regular--magnifying-glass]" aria-hidden="true" />
            </ion-fab-button>
          </ion-fab>
          <ion-footer
            #searchFooter
            [translucent]="true"
            [class.tabs-hidden]="!tabs()"
            [inert]="!searching()"
          >
            <ion-toolbar>
              <ion-buttons slot="start">
                <ion-button
                  #searchClose
                  fill="default"
                  aria-label="Close search"
                  (click)="open(tab().link)"
                >
                  <ion-icon slot="icon-only" [class]="tab().tab" aria-hidden="true" />
                </ion-button>
              </ion-buttons>
              <ion-searchbar
                #searchField
                appTaskFilterBar
                placeholder="Tasks, projects, is:blocked"
                [(query)]="search.query"
              />
            </ion-toolbar>
          </ion-footer>
        }
      </div>
    </ion-split-pane>
  `,
  styles: `
    /* One red in both schemes: the dark palette's pink danger would need black text. */
    .count {
      --background: #d70015;
      --color: #fff;
    }

    /* Size it through --ios-theme-menu-width (styles.css): it also sets the main-pane inset. */
    ion-menu::part(container) {
      border: 0;
      background: var(--ion-background-color);
    }

    ion-menu ion-content {
      --background: transparent;
    }

    /* The theme floats the menu's scroll box; the panel below already floats, 10px in. */
    ion-menu ion-content::part(scroll) {
      margin: 0;
    }

    .side {
      display: flex;
      flex-direction: column;
      min-block-size: calc(100% - 1.25rem);
      margin: 0.625rem;
      border-radius: 1.75rem;
      padding: 0.75rem;
      background: var(--app-sheet);
      --lens: rgba(120, 120, 128, 0.16);
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.9),
        0 0 0 0.5px rgba(15, 23, 42, 0.1),
        0 8px 24px rgba(15, 23, 42, 0.1);
    }

    :host-context(.ion-palette-dark) .side {
      --lens: rgba(255, 255, 255, 0.13);
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.12),
        0 0 0 0.5px rgba(255, 255, 255, 0.08),
        0 8px 24px rgba(0, 0, 0, 0.45);
    }

    .side__brand {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      block-size: 2.75rem;
      margin-inline: 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .side__brand img {
      border-radius: 0.4375rem;
    }

    /* No inset rounding: it clipped the first and last rows' lens into a different shape. */
    ion-menu ion-list.list-inset {
      margin: 0.875rem 0 0;
      border-radius: 0;
      overflow: visible;
    }

    ion-menu ion-list ion-item {
      --min-height: 2.75rem;
      font-size: 1.0625rem;
    }

    /* Rows sit 12px in: Ionic pads 16px, the theme's inset-group rule 18px on the right. */
    ion-menu ion-list.list-inset.ios > ion-item-group > ion-item {
      --padding-start: 0.75rem;
    }

    /* Every row, not just the selected one: the focus ring must match the lens. */
    ion-menu ion-list.list-inset.ios > ion-item-group > ion-item::part(native) {
      padding-right: 0.75rem;
      border-radius: 0.875rem;
    }

    ion-menu ion-item > [slot='start'][class*='icon-['] {
      font-size: 1.375rem;
      margin-inline-end: 0.75rem;
    }

    .side__kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-inline-size: 1.375rem;
      block-size: 1.375rem;
      padding: 0 0.375rem;
      border-radius: 0.375rem;
      background: var(--app-fill);
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--app-text-secondary);
    }

    .side__label {
      margin: 1.375rem 0.75rem 0.375rem;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      font-weight: 600;
      color: var(--app-text-tertiary);
    }

    ion-menu ion-list.list-inset.pins {
      margin-top: 0;
    }

    ion-menu ion-list ion-item.pin {
      --min-height: 2.5rem;
      font-size: 0.9375rem;
    }

    ion-menu ion-list ion-item.pin.nav-active::part(native) {
      border-radius: 0.75rem;
    }

    .pin__dot {
      inline-size: 0.5rem;
      block-size: 0.5rem;
      margin-inline: 0.4375rem 1.0625rem;
      border-radius: 999px;
    }

    .pin__note {
      font-size: 0.8125rem;
      color: var(--app-text-tertiary);
    }

    ion-menu ion-item + ion-item {
      margin-block-start: 2px;
    }

    .side .count {
      min-inline-size: 1.375rem;
      block-size: 1.375rem;
      border-radius: 0.6875rem;
      padding: 0 0.4375rem;
      font-size: 0.8125rem;
      line-height: 1.375rem;
    }

    ion-tab-button .count {
      font-size: 0.6875rem;
    }

    ion-tab-button ion-label {
      font-weight: 600;
    }

    .side__account {
      margin: auto 0 0;
    }

    .side__avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      inline-size: 2.25rem;
      block-size: 2.25rem;
      border-radius: 999px;
      background: linear-gradient(160deg, #3b82f6, #4f46e5);
      color: #fff;
      font-size: 0.8125rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .side__user {
      display: block;
      font-size: 0.9375rem;
      font-weight: 600;
    }

    .side__host {
      display: block;
      font-family: var(--app-font-mono);
      font-size: 0.75rem;
      color: var(--app-text-tertiary);
    }

    /* The theme clears menu items' --background, so the selection paints the native part. */
    .nav-active::part(native) {
      border-radius: 0.875rem;
      background: var(--lens);
      color: var(--ion-color-primary);
      font-weight: 600;
    }

    ion-footer {
      position: absolute;
      bottom: 0;
    }

    .tabs-hidden {
      display: none;
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) {
      ion-tab-bar,
      ion-fab,
      ion-footer {
        display: none;
      }
    }
  `,
})
export class AppShell {
  private readonly navCtrl = inject(NavController);
  private readonly router = inject(Router);
  private readonly alerts = inject(ListAlertsStore);
  private readonly tokens = inject(AuthTokenStore);
  protected readonly session = inject(SessionStore);
  private readonly config = inject(ServerConfigStore);
  protected readonly serverHost = this.config.host;
  private readonly destroyRef = inject(DestroyRef);
  protected readonly search = inject(SearchTasksStore);
  protected readonly palette = inject(CommandPaletteLauncher);
  private readonly fleet = inject(ListProjectsStore);
  private readonly pins = inject(PinnedProjectsStore);
  private readonly document = inject(DOCUMENT);
  private readonly wide = wideScreen();
  protected readonly wideQuery = WIDE_QUERY;
  protected readonly desktop = desktopScreen();

  /* String refs: a class token would drag the deferred components back into main. */
  private readonly tabBar = viewChild.required(IonTabBar, { read: ElementRef });
  private readonly fab = viewChild('searchFab', { read: ElementRef });
  private readonly footer = viewChild('searchFooter', { read: ElementRef });
  private readonly closeSearch = viewChild('searchClose', { read: ElementRef });
  private readonly searchField = viewChild('searchField', { read: ElementRef });

  protected readonly nav = NAV;
  protected readonly tabItems = TABS;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly chromeless = computed(() => /^\/(welcome|login)/.test(this.url()));

  protected readonly tabs = computed(
    () => !this.chromeless() && !/^\/(projects|settings)\/.|^\/legal\//.test(this.url()),
  );

  /* A pushed page keeps its root, so search stays open under a task opened from it. */
  protected readonly root = linkedSignal<string, string>({
    source: this.url,
    computation: (url, previous) => {
      const within = (at: string) => NAV.find(({ link }) => at.split(/[?#]/)[0].startsWith(link));
      /* A cold load starts from "/", which has no section: then the page's own section wins. */
      return (
        NAV.find(({ link }) => url.split(/[?#]/)[0] === link)?.link ??
        (previous && within(previous.source) ? previous.value : undefined) ??
        within(url)?.link ??
        NAV[0].link
      );
    },
  });

  protected readonly searching = computed(() => this.root() === '/search');

  /* A project screen belongs to no section; its pinned row, if any, is the selection. */
  protected readonly openSlug = computed(
    () => /^\/projects\/(?!new(?:[/?#]|$))([^/?#]+)/.exec(this.url())?.[1],
  );
  protected readonly navActive = computed(() => (this.openSlug() ? undefined : this.root()));

  /* Only projects the current fleet lists, so another account's pin names never render. */
  protected readonly pinned = computed(() => {
    const bySlug = new Map(
      this.fleet.summaries().map((summary) => [summary.project.slug, summary]),
    );
    return this.pins.slugs().flatMap((slug) => {
      const summary = bySlug.get(slug);
      return summary ? [pinRow(summary)] : [];
    });
  });

  /* While searching, the collapsed bar still names the tab search was opened from. */
  protected readonly tab = linkedSignal<string, NavItem>({
    source: this.root,
    computation: (root, previous) =>
      TABS.find(({ link }) => link === root) ?? previous?.value ?? TABS[0],
  });

  protected readonly unseen = this.alerts.unseenCount;

  private searchable?: TabBarSearchableFunction;
  private searchOpen = false;

  constructor() {
    /* Untracked: ensureFresh reads isLoading, so a failing load would re-fire this in a loop. */
    effect(() => {
      if (this.tokens.authenticated()) untracked(() => this.alerts.ensureFresh());
    });
    /* The sidebar's pins need the fleet even when the app cold-starts away from Home. */
    effect(() => {
      if (this.tokens.authenticated() && this.wide() && this.pins.slugs().length) {
        untracked(() => this.fleet.ensureFresh());
      }
    });
    effect(() => {
      this.searching();
      untracked(() => this.morph());
    });
    afterNextRender(() => {
      const bar: HTMLElement = this.tabBar().nativeElement;
      let lens: { destroy(): void } | undefined;
      const stop = whenHydrated(bar, () => (lens = registerTabBarEffect(bar)));
      this.destroyRef.onDestroy(() => {
        stop();
        lens?.destroy();
      });
    });
    effect((onCleanup) => {
      const [bar, fab, footer, field] = [
        this.tabBar(),
        this.fab(),
        this.footer(),
        this.searchField(),
      ];
      if (!fab || !footer || !field) return;
      const stop = untracked(() =>
        whenHydrated(field.nativeElement, () => {
          this.searchable = attachTabBarSearchable(
            bar.nativeElement,
            fab.nativeElement,
            footer.nativeElement,
          );
          this.morph();
        }),
      );
      onCleanup(stop);
    });
  }

  /* The URL owns search; the morph only follows it, so deep links and back land right. */
  private morph(): void {
    const open = this.searching();
    const close = this.closeSearch();
    const fab = this.fab();
    if (!this.searchable || !close || !fab || open === this.searchOpen) return;
    this.searchOpen = open;
    const target = (open ? fab : close).nativeElement;
    void this.searchable(
      { target } as unknown as Event,
      open ? TabBarSearchableType.Enter : TabBarSearchableType.Leave,
    );
  }

  protected open(link: string): void {
    void this.navCtrl.navigateRoot(link);
  }

  protected onShortcut(event: KeyboardEvent): void {
    const command = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    const slash = event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey;
    if ((!command && !slash) || this.chromeless()) return;

    /* From iPad width ⌘K is the palette, but never over another overlay that owns the keys. */
    if (command && this.wide() && this.tokens.authenticated()) {
      if (this.document.querySelector(OPEN_OVERLAY)) return;
      event.preventDefault();
      this.palette.open();
      return;
    }

    if (this.url().startsWith('/search')) return;
    const target = event.target instanceof Element ? event.target : null;
    if (slash && target?.closest('input, textarea, select, [contenteditable]')) return;
    event.preventDefault();
    this.open('/search');
  }
}

/* Kept-mounted pickers wait in the DOM with .overlay-hidden. */
const OPEN_OVERLAY =
  'ion-alert:not(.overlay-hidden), ion-modal:not(.overlay-hidden), ion-popover:not(.overlay-hidden)';

interface PinRow {
  readonly slug: string;
  readonly name: string;
  readonly note: string;
  readonly dot: string;
}

/* Rule order is the design's: worst state first. */
function pinRow({ project, tasks }: ProjectSummary): PinRow {
  const blocked = tasks.filter((task) => task.devStatus === 'blocked').length;
  const rules: readonly (readonly [boolean, string, string])[] = [
    [tasks.some((task) => task.lastDeploy?.failed), 'failed', 'bg-danger'],
    [tasks.some((task) => task.status === 'error'), 'error', 'bg-danger'],
    [blocked > 0, `${blocked} blocked`, 'bg-blocked'],
    [tasks.some((task) => task.status === 'stopped'), 'stopped', 'bg-label-3'],
    [tasks.some((task) => task.devStatus === 'in_progress'), '', 'bg-progress'],
    [tasks.length > 0, '', 'bg-ready'],
  ];
  const [, note, dot] = rules.find(([hit]) => hit) ?? [true, '', 'bg-fill'];
  return { slug: project.slug, name: project.name, note, dot };
}

/* The theme needs the rendered element; custom-elements Ionic has no componentOnReady(). */
function whenHydrated(el: HTMLElement, run: () => void): () => void {
  if (el.classList.contains('hydrated')) {
    run();
    return () => undefined;
  }
  const observer = new MutationObserver(() => {
    if (!el.classList.contains('hydrated')) return;
    observer.disconnect();
    run();
  });
  observer.observe(el, { attributeFilter: ['class'] });
  return () => observer.disconnect();
}
