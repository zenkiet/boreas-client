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
import { Router } from '@angular/router';
import { TuiButton, TuiDataList, TuiDropdown, TuiIcon, TuiOption } from '@taiga-ui/core';
import { TuiAppBar } from '@taiga-ui/layout';
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
import { BackLink } from '@shared/ui/back-link/back-link';
import { ConfirmActionService } from '@shared/ui/confirm-action/confirm-action';
import { GlassIconButton } from '@shared/ui/glass-icon-button/glass-icon-button';
import { NotifyService } from '@shared/ui/notify/notify';
import { PageHeader } from '@shared/ui/page-header/page-header';

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

/* Apple's format panel: every row is rendered in the style it applies, so the label only has to
   name the level. Lists and quote are toolbar buttons, not rows here. */
const BLOCK_STYLES: readonly BlockStyle[] = [
  ...HEADING_LEVELS.map((level) => ({ id: `h${level}`, label: `H${level}` })),
  { id: BODY, label: 'Body' },
];

const TOOLS: readonly Tool[] = [
  {
    mark: 'bold',
    icon: '@tui.bold',
    label: 'Bold',
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    mark: 'italic',
    icon: '@tui.italic',
    label: 'Italic',
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    mark: 'code',
    icon: '@tui.code',
    label: 'Code',
    run: (e) => e.chain().focus().toggleCode().run(),
  },
  {
    mark: 'blockquote',
    icon: '@tui.quote',
    label: 'Quote',
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    mark: 'bulletList',
    icon: '@tui.list',
    label: 'Bullet list',
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
];

@Component({
  selector: 'app-task-note-page',
  imports: [
    BackLink,
    GlassIconButton,
    PageHeader,
    TuiAppBar,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiIcon,
    TuiOption,
  ],
  providers: [ViewTaskStore, ControlTaskStore],
  template: `
    <div class="mx-auto grid w-full max-w-160 grid-cols-1 gap-3.5 md:gap-4">
      <div
        class="scroll-edge sticky top-0 z-10 -mx-4 -mt-[max(1rem,env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] md:hidden"
      >
        <tui-app-bar tuiAppBarSize>
          <button
            tuiSlot="start"
            tuiAppBarBack
            type="button"
            aria-label="Back to task"
            (click)="cancel()"
          ></button>
          Note
          <button
            tuiSlot="end"
            appGlassIconButton
            icon="@tui.check"
            type="button"
            aria-label="Save note"
            [disabled]="saving()"
            (click)="done()"
          ></button>
        </tui-app-bar>
      </div>

      <div class="hidden md:block">
        <app-back-link [link]="taskPath()" [label]="name()" />
        <div class="mt-1.5">
          <app-page-header title="Note">
            <button tuiButton type="button" size="s" appearance="secondary" (click)="cancel()">
              Cancel
            </button>
            <button
              tuiButton
              type="button"
              size="s"
              appearance="primary"
              [disabled]="saving()"
              (click)="done()"
            >
              Save note
            </button>
          </app-page-header>
        </div>
      </div>

      <div class="note__card">
        <div #host class="note__surface"></div>

        <div class="note__bar">
          <button
            type="button"
            class="note__tool note__tool--wide"
            aria-label="Text style"
            [tuiDropdown]="styles"
            [(tuiDropdownOpen)]="stylesOpen"
          >
            Aa
          </button>

          <ng-template #styles>
            <tui-data-list class="panel" aria-label="Text style">
              @for (style of blockStyles; track style.id) {
                <button
                  tuiOption
                  type="button"
                  class="panel__row"
                  [attr.aria-selected]="active().has(style.id)"
                  (click)="applyStyle(style.id)"
                >
                  <tui-icon
                    class="panel__check icon-sm"
                    icon="@tui.check"
                    aria-hidden="true"
                    [style.visibility]="active().has(style.id) ? 'visible' : 'hidden'"
                  />
                  <span class="panel__label" [attr.data-style]="style.id">{{ style.label }}</span>
                </button>
              }
            </tui-data-list>
          </ng-template>

          @for (tool of tools; track tool.mark) {
            <button
              type="button"
              class="note__tool"
              [class.note__tool--on]="active().has(tool.mark)"
              [attr.aria-label]="tool.label"
              [attr.aria-pressed]="active().has(tool.mark)"
              (pointerdown)="apply($event, tool)"
            >
              <tui-icon class="icon-sm" [icon]="tool.icon" />
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    /* Content layer: standard material, never glass (glass-on-glass with the bar). */
    .note__card {
      border-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
    }

    /* The field scrolls, not the page: that keeps the card inside the viewport so its toolbar
       stays under the text. Sticky cannot do this job — app-shell is the scroll container. */
    .note__surface {
      padding: 0.875rem 1rem;
      max-block-size: calc(100dvh - 15rem - var(--app-keyboard, 0px));
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    /* Anchored to the field it formats, never to the viewport edge. */
    .note__bar {
      display: flex;
      gap: 0.25rem;
      /* HIG: a formatting bar scrolls rather than truncating when the row runs out of room. */
      overflow-x: auto;
      scrollbar-width: none;
      padding: 0.25rem 0.5rem;
      border-block-start: 1px solid var(--tui-border-normal);
      border-end-start-radius: var(--tui-radius-l);
      border-end-end-radius: var(--tui-radius-l);
      background: var(--tui-background-base);
    }

    .note__tool {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-inline-size: 2.75rem;
      min-block-size: 2.75rem;
      margin: 0;
      border: 0;
      border-radius: 999px;
      background: none;
      color: var(--tui-text-secondary);
      cursor: pointer;
    }

    .note__tool--wide {
      font-size: 0.9375rem;
      font-weight: 600;
    }

    .note__tool--on {
      background: var(--app-segment-thumb-fill);
      color: var(--tui-text-primary);
    }

    :host ::ng-deep .note__surface .ProseMirror {
      outline: none;
      font-size: 1.0625rem;
      line-height: 1.55;
      color: var(--tui-text-primary);
      min-block-size: 8rem;
    }

    :host ::ng-deep .note__surface .ProseMirror p {
      margin: 0 0 0.625rem;
    }

    :host ::ng-deep .note__surface .ProseMirror p:last-child {
      margin-block-end: 0;
    }

    :host ::ng-deep .note__surface .ProseMirror ul,
    :host ::ng-deep .note__surface .ProseMirror ol {
      margin: 0 0 0.625rem;
      padding-inline-start: 1.25rem;
    }

    .panel {
      min-inline-size: 14rem;
    }

    /* Leading checkmark column, the iOS panel shape; every label previews its own style. */
    .panel__row {
      justify-content: flex-start;
      gap: 0.5rem;
    }

    .panel__check {
      flex: none;
      color: var(--tui-text-action);
    }

    /* Weight says "heading", size says which level — so the deepest one still reads as a heading
       rather than as disabled text. */
    .panel__label[data-style^='h'] {
      font-weight: 700;
      letter-spacing: -0.015em;
      color: var(--tui-text-primary);
    }

    .panel__label[data-style='h1'] {
      font-size: 1.375rem;
    }

    .panel__label[data-style='h2'] {
      font-size: 1.1875rem;
    }

    .panel__label[data-style='h3'] {
      font-size: 1.0625rem;
    }

    .panel__label[data-style='h4'] {
      font-size: 1rem;
    }

    .panel__label[data-style='h5'] {
      font-size: 0.9375rem;
    }

    :host ::ng-deep .note__surface .ProseMirror h1,
    :host ::ng-deep .note__surface .ProseMirror h2,
    :host ::ng-deep .note__surface .ProseMirror h3,
    :host ::ng-deep .note__surface .ProseMirror h4,
    :host ::ng-deep .note__surface .ProseMirror h5 {
      margin: 1rem 0 0.375rem;
      font-weight: 650;
      letter-spacing: -0.01em;
      line-height: 1.3;
    }

    :host ::ng-deep .note__surface .ProseMirror h1 {
      font-size: 1.3125rem;
    }

    :host ::ng-deep .note__surface .ProseMirror h2 {
      font-size: 1.1875rem;
    }

    :host ::ng-deep .note__surface .ProseMirror h3 {
      font-size: 1.0625rem;
    }

    :host ::ng-deep .note__surface .ProseMirror h4,
    :host ::ng-deep .note__surface .ProseMirror h5 {
      font-size: 1rem;
      color: var(--tui-text-secondary);
    }

    :host ::ng-deep .note__surface .ProseMirror :first-child {
      margin-block-start: 0;
    }

    :host ::ng-deep .note__surface .ProseMirror blockquote {
      margin: 0 0 0.625rem;
      border-inline-start: 2px solid var(--tui-border-normal);
      padding-inline-start: 0.75rem;
      color: var(--tui-text-secondary);
    }

    :host ::ng-deep .note__surface .ProseMirror code {
      font-family: var(--app-font-mono);
      font-size: 0.875rem;
      border-radius: 0.3125rem;
      padding: 0.0625rem 0.3125rem;
      background: var(--tui-background-neutral-1);
    }

    :host ::ng-deep .note__surface .ProseMirror a {
      color: var(--tui-text-action);
    }

    :host ::ng-deep .note__surface .ProseMirror p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: inline-start;
      block-size: 0;
      pointer-events: none;
      color: var(--tui-text-tertiary);
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
  private readonly router = inject(Router);
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');

  protected readonly tools: readonly Tool[] = [
    ...TOOLS,
    { mark: 'link', icon: '@tui.link', label: 'Link', run: (e) => this.toggleLink(e) },
  ];

  protected readonly active = signal<ReadonlySet<string>>(new Set());
  protected readonly blockStyles = BLOCK_STYLES;
  protected readonly stylesOpen = signal(false);
  protected readonly saving = computed(() => this.commands.isPending(this.name()));
  protected readonly taskLink = computed(() => ['/projects', this.slug(), 'tasks', this.name()]);
  protected readonly taskPath = computed(() => this.taskLink().join('/'));

  private editor?: Editor;
  private seeded = '';

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.detail.track(this.slug, this.name);

    /* The editor mounts once; the fetched note seeds it as soon as it lands. */
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
        onTransaction: ({ editor }) => this.syncTools(editor),
      });

      const root = inject(ElementRef).nativeElement as HTMLElement;
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

  /* pointerdown, not click: the editor must keep the selection the tool acts on. */
  protected apply(event: Event, tool: Tool): void {
    event.preventDefault();
    if (this.editor) tool.run(this.editor);
  }

  protected cancel(): void {
    if (!this.dirty()) {
      void this.router.navigate(this.taskLink());
      return;
    }

    this.confirmations
      .confirm({
        title: 'Discard changes?',
        message: 'This note goes back to what it was before you opened it.',
        confirmLabel: 'Discard',
        destructive: true,
      })
      .pipe(filter(Boolean))
      .subscribe(() => void this.router.navigate(this.taskLink()));
  }

  protected done(): void {
    const task = this.detail.task();
    if (!task || !this.editor) return;

    if (!this.dirty()) {
      void this.router.navigate(this.taskLink());
      return;
    }

    this.commands.setNote(this.slug(), task, this.markdown()).subscribe((result) => {
      this.notify.result(result);
      if (result.success) void this.router.navigate(this.taskLink());
    });
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

    this.stylesOpen.set(false);
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
