import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonPopover } from '@ionic/angular/ion-popover';
import { IonRouterOutlet } from '@ionic/angular/ion-router-outlet';
import { NavController } from '@ionic/angular/nav-controller';
import { Editor } from '@tiptap/core';
import Blockquote from '@tiptap/extension-blockquote';
import Bold from '@tiptap/extension-bold';
import Code from '@tiptap/extension-code';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import { BulletList, ListItem, ListKeymap, OrderedList } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Placeholder, UndoRedo } from '@tiptap/extensions';
import { filter } from 'rxjs';

import { ControlTaskStore } from '@features/control-task';
import { ViewTaskStore } from '@features/view-task';
import { noteToHtml, noteToMarkdown } from '@shared/lib/markdown/note-markdown';
import { wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { NotifyService } from '@shared/ui/notify/notify';
import { PAGE_CHROME } from '@shared/ui/page-chrome/page-chrome';

interface BlockStyle {
  readonly id: string;
  readonly label: string;
}

interface Tool {
  readonly mark: string;
  readonly icon: string;
  readonly label: string;
  readonly run: (editor: Editor) => void;
}

const HEADING_LEVELS = [1, 2, 3, 4, 5] as const;

const BODY = 'body';

let instances = 0;

const BLOCK_STYLES: readonly BlockStyle[] = [
  ...HEADING_LEVELS.map((level) => ({ id: `h${level}`, label: `H${level}` })),
  { id: BODY, label: 'Body' },
];

const TOOLS: readonly Tool[] = [
  {
    mark: 'bold',
    icon: 'icon-[regular--bold]',
    label: 'Bold',
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    mark: 'italic',
    icon: 'icon-[regular--italic]',
    label: 'Italic',
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    mark: 'code',
    icon: 'icon-[regular--code]',
    label: 'Code',
    run: (e) => e.chain().focus().toggleCode().run(),
  },
  {
    mark: 'bulletList',
    icon: 'icon-[regular--list-ul]',
    label: 'Bullet list',
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    mark: 'blockquote',
    icon: 'icon-[regular--block-quote]',
    label: 'Quote',
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
];

@Component({
  selector: 'app-task-note-page',
  imports: [IonButton, IonButtons, IonItem, IonLabel, IonList, IonPopover, PAGE_CHROME],
  providers: [ViewTaskStore, ControlTaskStore],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <!-- Not a back button: leaving must go through the discard confirmation. -->
        <!-- One button either way: two clear buttons would merge into one theme capsule. -->
        <ion-buttons slot="start">
          <ion-button [attr.aria-label]="wide() ? null : 'Cancel'" (click)="cancel()">
            @if (wide()) {
              Cancel
            } @else {
              <span slot="icon-only" class="icon-[regular--xmark]" aria-hidden="true"></span>
            }
          </ion-button>
        </ion-buttons>
        <ion-title
          >Note · <span class="font-mono font-medium">{{ name() }}</span></ion-title
        >
        <ion-buttons slot="end">
          <ion-button
            fill="solid"
            color="primary"
            [attr.aria-label]="wide() ? null : 'Save note'"
            [disabled]="saving()"
            (click)="done()"
          >
            @if (wide()) {
              Done
            } @else {
              <span slot="icon-only" class="icon-[regular--check]" aria-hidden="true"></span>
            }
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="mx-auto max-w-(--app-column)">
        <div class="note__card">
          <div #host class="note__surface"></div>

          <div class="note__bar" role="toolbar" aria-label="Format">
            <button
              type="button"
              class="note__tool note__tool--wide"
              aria-label="Text style"
              aria-haspopup="dialog"
              [id]="stylesId"
            >
              Aa
              <span class="note__chevron icon-[regular--angle-down]" aria-hidden="true"></span>
            </button>
            <span class="note__divider" aria-hidden="true"></span>

            <!-- Pointers apply on pointerdown; Enter and Space arrive as a click with detail 0. -->
            @for (tool of tools; track tool.mark) {
              <button
                type="button"
                class="note__tool"
                [class.note__tool--on]="active().has(tool.mark)"
                [attr.aria-label]="tool.label"
                [attr.aria-pressed]="active().has(tool.mark)"
                (pointerdown)="apply($event, tool)"
                (click)="$event.detail === 0 && apply($event, tool)"
              >
                <span class="text-[1.25rem]" [class]="tool.icon" aria-hidden="true"></span>
              </button>
            }
          </div>
        </div>
      </div>
    </ion-content>

    <ion-popover
      side="top"
      alignment="start"
      style="--width: 13.75rem"
      aria-label="Text style"
      [trigger]="stylesId"
      [dismissOnSelect]="true"
    >
      <ng-template>
        <ion-list aria-label="Text style">
          @for (style of blockStyles; track style.id) {
            <ion-item
              button
              lines="none"
              class="panel__row"
              [detail]="false"
              [attr.aria-current]="active().has(style.id) ? 'true' : null"
              (click)="applyStyle(style.id)"
            >
              <span
                slot="start"
                class="panel__check icon-[regular--check]"
                [style.visibility]="active().has(style.id) ? 'visible' : 'hidden'"
                aria-hidden="true"
              ></span>
              <ion-label class="panel__label" [attr.data-style]="style.id">
                {{ style.label }}
              </ion-label>
            </ion-item>
          }
        </ion-list>
      </ng-template>
    </ion-popover>
  `,
  styles: `
    /* Never glass: it would be glass-on-glass with the bar. */
    /* The field scrolls, not the content, so the format bar stays in view however long the note. */
    .note__card {
      display: flex;
      flex-direction: column;
      block-size: calc(
        100dvh - var(--offset-top, 0px) -
          0.5rem - max(var(--ion-safe-area-bottom, 0px), 1rem) - var(--app-keyboard, 0px)
      );
      margin: 0.5rem 1rem 0;
      border-radius: var(--radius-card);
      overflow: hidden;
      background: var(--app-background-base);
    }

    .note__surface {
      flex: 1;
      min-block-size: 0;
      padding: 1.375rem 1.375rem 0.75rem;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    .note__bar {
      display: flex;
      flex: none;
      align-items: center;
      gap: 2px;
      block-size: 3.5rem;
      /* HIG: a formatting bar scrolls rather than truncating. */
      overflow-x: auto;
      scrollbar-width: none;
      padding: 0 0.5rem;
      border-block-start: 1px solid var(--app-border-normal);
    }

    .note__divider {
      flex: none;
      inline-size: 1px;
      block-size: 1.5rem;
      background: var(--app-border-normal);
    }

    .note__tool {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      inline-size: 2.75rem;
      block-size: 2.75rem;
      margin: 0;
      border: 0;
      border-radius: 0.875rem;
      background: none;
      font: inherit;
      color: var(--app-text-primary);
      cursor: pointer;
    }

    .note__tool--wide {
      gap: 0.125rem;
      inline-size: 3.5rem;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .note__tool .note__chevron {
      font-size: 0.625rem;
      color: var(--app-text-tertiary);
    }

    .note__tool--on {
      background: var(--app-accent-soft);
      color: var(--ion-color-primary);
    }

    :host ::ng-deep .note__surface .ProseMirror {
      outline: none;
      font-size: 1.0625rem;
      line-height: 1.5625rem;
      color: var(--app-text-primary);
      caret-color: var(--ion-color-primary);
      min-block-size: 8rem;
    }

    :host ::ng-deep .note__surface .ProseMirror p {
      margin: 0 0 0.75rem;
    }

    :host ::ng-deep .note__surface .ProseMirror p:last-child {
      margin-block-end: 0;
    }

    :host ::ng-deep .note__surface .ProseMirror ul,
    :host ::ng-deep .note__surface .ProseMirror ol {
      margin: 0 0 0.75rem;
      padding-inline-start: 1.375rem;
    }

    :host ::ng-deep .note__surface .ProseMirror li {
      margin-block-end: 0.25rem;
    }

    .panel__row {
      --min-height: 2.75rem;
    }

    .panel__check {
      color: var(--ion-color-primary);
    }

    /* Bold at every level, so H5 reads as a heading, not as disabled text. */
    .panel__label[data-style^='h'] {
      font-weight: 700;
      letter-spacing: -0.015em;
      color: var(--app-text-primary);
    }

    .panel__label[data-style='h1'] {
      font-size: 1.5rem;
      line-height: 1.875rem;
    }

    .panel__label[data-style='h2'] {
      font-size: 1.3125rem;
    }

    .panel__label[data-style='h3'] {
      font-size: 1.1875rem;
    }

    .panel__label[data-style='h4'] {
      font-size: 1.0625rem;
    }

    .panel__label[data-style='h5'] {
      font-size: 0.9375rem;
    }

    :host ::ng-deep .note__surface .ProseMirror h1,
    :host ::ng-deep .note__surface .ProseMirror h2,
    :host ::ng-deep .note__surface .ProseMirror h3,
    :host ::ng-deep .note__surface .ProseMirror h4,
    :host ::ng-deep .note__surface .ProseMirror h5 {
      margin: 1.375rem 0 0.5rem;
      font-weight: 700;
      line-height: 1.3;
    }

    :host ::ng-deep .note__surface .ProseMirror h1 {
      margin-block-end: 0.625rem;
      font-size: 1.625rem;
      line-height: 2rem;
    }

    :host ::ng-deep .note__surface .ProseMirror h2 {
      font-size: 1.25rem;
      line-height: 1.625rem;
    }

    :host ::ng-deep .note__surface .ProseMirror h3 {
      font-size: 1.0625rem;
    }

    :host ::ng-deep .note__surface .ProseMirror h4,
    :host ::ng-deep .note__surface .ProseMirror h5 {
      font-size: 1rem;
      color: var(--app-text-secondary);
    }

    :host ::ng-deep .note__surface .ProseMirror :first-child {
      margin-block-start: 0;
    }

    :host ::ng-deep .note__surface .ProseMirror blockquote {
      margin: 0 0 0.75rem;
      border-inline-start: 3px solid var(--app-background-neutral-2);
      padding: 0.125rem 0 0.125rem 0.875rem;
      color: var(--app-text-secondary);
    }

    :host ::ng-deep .note__surface .ProseMirror code {
      font-family: var(--app-font-mono);
      font-size: 0.875rem;
      border-radius: 0.375rem;
      padding: 0.0625rem 0.3125rem;
      background: var(--app-background-neutral-1);
    }

    :host ::ng-deep .note__surface .ProseMirror a {
      color: var(--ion-color-primary);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    :host ::ng-deep .note__surface .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: inline-start;
      block-size: 0;
      pointer-events: none;
      color: var(--app-text-tertiary);
    }
  `,
})
export class TaskNotePage {
  readonly slug = input('');
  readonly name = input('');

  private readonly detail = inject(ViewTaskStore);
  private readonly commands = inject(ControlTaskStore);
  private readonly confirmations = inject(ConfirmActionService);
  private readonly notify = inject(NotifyService);
  private readonly navCtrl = inject(NavController);
  private readonly outlet = inject(IonRouterOutlet, { optional: true });
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');

  /* Link goes after the three inline marks, before the block tools. */
  protected readonly tools: readonly Tool[] = [
    ...TOOLS.slice(0, 3),
    { mark: 'link', icon: 'icon-[regular--link]', label: 'Link', run: (e) => this.toggleLink(e) },
    ...TOOLS.slice(3),
  ];

  protected readonly stylesId = `note-styles-${(instances += 1)}`;
  protected readonly wide = wideScreen();
  protected readonly active = signal<ReadonlySet<string>>(new Set());
  protected readonly blockStyles = BLOCK_STYLES;
  protected readonly saving = computed(() => this.commands.isPending(this.name()));
  private readonly taskPath = computed(() => `/projects/${this.slug()}/tasks/${this.name()}`);

  private editor?: Editor;
  private seeded = '';

  constructor() {
    const destroyRef = inject(DestroyRef);
    const root = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    this.detail.track(this.slug, this.name);

    effect(() => {
      const task = this.detail.task();
      if (!task || !this.editor || this.seeded) return;
      this.seeded = task.note ?? '';
      if (this.seeded) this.editor.commands.setContent(noteToHtml(this.seeded));
    });

    afterNextRender(() => {
      this.editor = new Editor({
        element: this.host().nativeElement,
        extensions: [
          Document,
          Paragraph,
          Text,
          HardBreak,
          /* Every level the schema lacks is silently flattened on load and then lost on save. */
          Heading.configure({ levels: [...HEADING_LEVELS] }),
          Blockquote,
          Bold,
          Italic,
          Code,
          BulletList,
          OrderedList,
          ListItem,
          ListKeymap,
          UndoRedo,
          /* openOnClick would navigate the webview away and destroy the app's state. */
          Link.configure({
            openOnClick: false,
            autolink: true,
            protocols: ['http', 'https', 'mailto'],
          }),
          Placeholder.configure({ placeholder: 'Context, links, anything the next person needs.' }),
        ],
        /* tiptap gives the surface role="textbox" but no name. */
        editorProps: { attributes: { 'aria-label': 'Note', 'aria-multiline': 'true' } },
        onTransaction: ({ editor }) => this.syncTools(editor),
      });

      const view = this.host().nativeElement.ownerDocument.defaultView;
      const viewport = view?.visualViewport;
      const track = () => {
        const gap = viewport ? view!.innerHeight - viewport.height - viewport.offsetTop : 0;
        root.style.setProperty('--app-keyboard', `${Math.max(gap, 0)}px`);
      };
      viewport?.addEventListener('resize', track);
      viewport?.addEventListener('scroll', track);
      track();

      destroyRef.onDestroy(() => {
        viewport?.removeEventListener('resize', track);
        viewport?.removeEventListener('scroll', track);
        this.editor?.destroy();
      });
    });
  }

  /* A swipe back would pop the editor past the discard confirmation and lose the draft. */
  ionViewDidEnter(): void {
    if (this.outlet) this.outlet.swipeGesture = false;
  }

  ionViewWillLeave(): void {
    if (this.outlet) this.outlet.swipeGesture = true;
  }

  /* preventDefault: the editor must keep the selection the tool acts on. */
  protected apply(event: Event, tool: Tool): void {
    event.preventDefault();
    if (this.editor) tool.run(this.editor);
  }

  protected cancel(): void {
    if (!this.dirty()) {
      this.leave();
      return;
    }

    this.confirmations
      .confirm({
        title: 'Discard changes?',
        message: 'This note goes back to what it was before you opened it.',
        confirmLabel: 'Discard',
        cancelLabel: 'Keep editing',
        destructive: true,
      })
      .pipe(filter(Boolean))
      .subscribe(() => this.leave());
  }

  protected done(): void {
    const task = this.detail.task();
    if (!task || !this.editor) return;

    if (!this.dirty()) {
      this.leave();
      return;
    }

    this.commands.setNote(this.slug(), task, this.markdown()).subscribe((result) => {
      this.notify.result(result);
      if (result.success) this.leave();
    });
  }

  private leave(): void {
    void this.navCtrl.navigateBack(this.taskPath());
  }

  private markdown(): string {
    return this.editor ? noteToMarkdown(this.editor.getJSON()) : '';
  }

  private dirty(): boolean {
    return this.markdown() !== this.seeded;
  }

  protected applyStyle(id: string): void {
    const editor = this.editor;
    if (!editor) return;

    const chain = editor.chain().focus();
    const level = HEADING_LEVELS.find((candidate) => `h${candidate}` === id);

    /* setHeading, not toggleHeading: a picker states the level, it does not flip it. */
    if (level) chain.setHeading({ level }).run();
    else chain.setParagraph().run();
  }

  private syncTools(editor: Editor): void {
    const next = new Set<string>();
    for (const tool of this.tools) {
      if (editor.isActive(tool.mark)) next.add(tool.mark);
    }

    const level = HEADING_LEVELS.find((candidate) =>
      editor.isActive('heading', { level: candidate }),
    );
    next.add(level ? `h${level}` : BODY);
    this.active.set(next);
  }

  private toggleLink(editor: Editor): void {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const href = this.host()
      .nativeElement.ownerDocument.defaultView?.prompt('Link URL', 'https://')
      ?.trim();
    if (!href || !/^(https?:|mailto:)/i.test(href)) return;

    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }
}
