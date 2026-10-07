import { DOCUMENT } from '@angular/common';
import {
  Component,
  OutputEmitterRef,
  WritableSignal,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { SelectCustomEvent } from '@ionic/angular';
import { IonButton } from '@ionic/angular/ion-button';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { EMPTY, defer, from } from 'rxjs';

import type { Build, DeployOutcome } from '@entities/task';
import {
  BuildStatus,
  DEV_STATUS_LABEL,
  DevStatus,
  Task,
  TaskVolumes,
  UNKNOWN_CONTAINER_HINT,
} from '@entities/task';
import { toByteSize } from '@shared/lib/format/bytes';
import { pathParts } from '@shared/lib/format/path';
import { wideScreen } from '@shared/ui/breakpoint/wide-screen';
import { InsetGroup } from '@shared/ui/inset-group/inset-group';

const COPIED_RESET_MS = 1600;

/* Workflow order, not severity order: the order a task moves through. */
const STATUS_OPTIONS = (
  [
    ['in_progress', 'Being built — the default for a new task'],
    ['blocked', 'Not fit for QA yet'],
    ['ready', 'QA can test this build'],
  ] as const
).map(([status, description]) => ({ status, description, label: DEV_STATUS_LABEL[status] }));

const STATUS_MENU = { header: 'Development status', alignment: 'end', cssClass: 'status-menu' };

@Component({
  selector: 'app-task-overview',
  imports: [
    BuildStatus,
    InsetGroup,
    IonButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    TaskVolumes,
  ],
  template: `
    <!-- Phones already say Overview in the section switch right above. -->
    <app-inset-group [label]="wide() ? 'Overview' : ''">
      <ion-item>
        @if (editable()) {
          <ion-select
            label="Status"
            interface="popover"
            [interfaceOptions]="statusMenu"
            [value]="task().devStatus"
            (ionChange)="statusChange.emit($event)"
          >
            @for (option of statusOptions; track option.status) {
              <ion-select-option [value]="option.status" [description]="option.description">
                {{ option.label }}
              </ion-select-option>
            }
          </ion-select>
        } @else {
          <!-- A label, not a disabled select: dimmed text fails AA. -->
          <ion-label class="row-label">Status</ion-label>
          <span class="value">{{ devLabel[task().devStatus] }}</span>
        }
      </ion-item>

      <!-- Caption over value, like About's URL prefix: the whole address fits on two lines. -->
      <ion-item>
        <ion-label class="stacked">
          <span class="caption">App URL</span>
          <!-- Named whole: the line-break spans would otherwise read as separate words. -->
          <a
            class="full value--link"
            rel="noopener"
            target="_blank"
            [href]="proxyUrl()"
            [attr.aria-label]="proxyParts().join('')"
          >
            @for (part of proxyParts(); track $index) {
              <span class="seg">{{ part }}</span
              ><wbr />
            }
          </a>
          <!-- A container that is not running answers 503: say so before the tap. -->
          @if (unreachable(); as why) {
            <span class="why">{{ why }}</span>
          }
        </ion-label>
        <ion-button
          slot="end"
          fill="clear"
          size="small"
          [attr.aria-label]="copied() ? 'Copied' : 'Copy app URL'"
          (click)="copyUrl()"
        >
          <span
            slot="icon-only"
            [class]="copied() ? 'icon-[light--check]' : 'icon-[light--copy]'"
            aria-hidden="true"
          ></span>
        </ion-button>
      </ion-item>

      <!-- Unknown explains itself in text: a tooltip is neither found nor read aloud. -->
      @if (task().status === 'unknown') {
        <ion-item>
          <ion-label class="stacked">
            <span class="caption">Container</span>
            <span class="full">unknown · {{ unknownHint }}</span>
          </ion-label>
        </ion-item>
      } @else {
        <ion-item>
          <ion-label class="row-label">Container</ion-label>
          <span class="value" [attr.data-state]="task().status">{{ task().status }}</span>
        </ion-item>
      }

      <ion-item>
        <ion-label class="stacked">
          <span class="caption">Image</span>
          <span class="sr-only">{{ imageParts().join('') }}</span>
          <span class="full font-mono" aria-hidden="true" [attr.title]="task().image">
            @for (part of imageParts(); track $index) {
              <span class="seg">{{ part }}</span
              ><wbr />
            }
          </span>
        </ion-label>
        <ion-button
          slot="end"
          fill="clear"
          size="small"
          [attr.aria-label]="copiedImage() ? 'Copied' : 'Copy full image reference'"
          (click)="copyImage()"
        >
          <span
            slot="icon-only"
            [class]="copiedImage() ? 'icon-[light--check]' : 'icon-[light--copy]'"
            aria-hidden="true"
          ></span>
        </ion-button>
      </ion-item>

      @if (lastDeploy(); as deploy) {
        <ion-item>
          <ion-label class="row-label">Last deploy</ion-label>
          <span class="value" [attr.data-state]="deploy.failed ? 'error' : null">
            {{ deployLabel(deploy) }}
          </span>
        </ion-item>
      }

      <!-- Stacked, so a wrapped stage stays beside its glyph. -->
      @if (build(); as build) {
        <ion-item>
          <ion-label class="stacked">
            <span class="caption">Build</span>
            <span class="full"><app-build-status mode="value" [build]="build" /></span>
          </ion-label>
          @if (build.url) {
            <ion-button
              slot="end"
              fill="clear"
              size="small"
              target="_blank"
              rel="noopener"
              aria-label="Open this run in CI"
              [href]="build.url"
            >
              <span
                slot="icon-only"
                class="icon-[light--arrow-up-right-from-square]"
                aria-hidden="true"
              ></span>
            </ion-button>
          }
        </ion-item>
      }

      <ion-item>
        <ion-label class="row-label">Port</ion-label>
        <span class="value tabular">{{ task().port }}</span>
      </ion-item>

      @if (usage(); as now) {
        <ion-item class="desk-only">
          <ion-label class="row-label">Usage</ion-label>
          <span class="value tabular">{{ usageLabel(now) }}</span>
        </ion-item>
      }
    </app-inset-group>

    @if (hasVolumes()) {
      <app-task-volumes [volumes]="task().volumes" />
    }
  `,
  styles: `
    .row-label {
      flex: none;
      white-space: nowrap;
    }

    .stacked {
      padding-block: 0.25rem;
    }

    .caption {
      display: block;
      font-size: 0.8125rem;
      color: var(--app-text-secondary);
    }

    .full {
      display: block;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: var(--app-text-tertiary);
      white-space: normal;
    }

    .why {
      display: block;
      margin-block-start: 0.125rem;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: var(--app-text-secondary);
    }

    /* Lines break after a slash only: "pos-portal" never splits at its hyphen. */
    .seg {
      white-space: nowrap;
    }

    .value {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      padding-inline-start: 0.75rem;
      font-size: 1rem;
      color: var(--app-text-tertiary);
      text-align: end;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .value--link,
    .value.font-mono {
      font-size: 0.875rem;
    }

    .value--link {
      font-family: var(--app-font-mono);
      color: var(--ion-color-primary);
      text-decoration: none;
    }

    .value[data-state='running'] {
      color: var(--app-status-positive);
    }

    .value[data-state='stopped'] {
      color: var(--app-text-primary);
    }

    .value[data-state='error'] {
      color: var(--ion-color-danger);
      font-weight: 600;
    }

    @media (min-width: 64rem) and (min-height: 31.25rem) {
      ion-item {
        --row-min-height: 3.125rem;
        font-size: 0.9375rem;
      }

      .value {
        font-size: 0.9375rem;
      }
    }
  `,
})
export class TaskOverview {
  private readonly document = inject(DOCUMENT);

  readonly task = input.required<Task>();
  readonly proxyUrl = input.required<string>();
  readonly lastDeploy = input<DeployOutcome | null>(null);
  readonly build = input<Build | null>(null);
  readonly usage = input<{ readonly cpu: number; readonly mem: number } | null>(null);
  /** Below member the status is shown, not offered. */
  readonly editable = input(true);
  readonly copyFailed = output<void>();
  readonly imageCopyFailed = output<void>();
  /** The raw event, so the page can flip the select back on a refused change. */
  readonly statusChange = output<SelectCustomEvent<DevStatus>>();

  protected readonly wide = wideScreen();
  protected readonly hasVolumes = computed(() => Object.keys(this.task().volumes).length > 0);
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly statusMenu = STATUS_MENU;
  protected readonly devLabel = DEV_STATUS_LABEL;
  protected readonly unknownHint = UNKNOWN_CONTAINER_HINT;

  /* Worded like the Container row; Ready gets "Can't test yet". */
  protected readonly unreachable = computed(() => {
    const { status, devStatus } = this.task();
    if (status === 'running') return '';
    if (status === 'creating' || status === 'starting') {
      return 'Answers once the container is running.';
    }
    const why =
      status === 'stopped'
        ? 'the container is stopped'
        : status === 'error'
          ? 'the container failed'
          : 'Boreas can’t find the container';
    return `${devStatus === 'ready' ? 'Can’t test yet' : 'Not reachable now'}: ${why}.`;
  });

  protected readonly proxyParts = computed(() =>
    pathParts(this.proxyUrl().replace(/^https?:\/\//, '')),
  );

  /* "ghcr.io/acme/storefront@9f86d0"; copy keeps the full digest. */
  protected readonly imageParts = computed(() =>
    pathParts(this.task().image.replace(/@sha256:([0-9a-f]{6})[0-9a-f]+$/, '@$1')),
  );

  protected readonly copied = signal(false);
  protected readonly copiedImage = signal(false);

  protected deployLabel(deploy: DeployOutcome): string {
    return `${formatDate(deploy.at)} · ${deploy.failed ? 'failed' : 'succeeded'}`;
  }

  protected usageLabel({ cpu, mem }: { readonly cpu: number; readonly mem: number }): string {
    const { value, unit } = toByteSize(mem);
    return `${cpu.toFixed(1)}% CPU · ${value} ${unit}`;
  }

  protected copyUrl(): void {
    this.copy(this.proxyUrl(), this.copied, this.copyFailed);
  }

  protected copyImage(): void {
    this.copy(this.task().image, this.copiedImage, this.imageCopyFailed);
  }

  private copy(text: string, done: WritableSignal<boolean>, failed: OutputEmitterRef<void>): void {
    defer(() =>
      from(this.document.defaultView?.navigator.clipboard.writeText(text) ?? EMPTY),
    ).subscribe({
      next: () => {
        done.set(true);
        this.document.defaultView?.setTimeout(() => done.set(false), COPIED_RESET_MS);
      },
      error: () => failed.emit(),
    });
  }
}

/* "Today 10:12": the row answers "how recent". */
function formatDate(date: Date): string {
  const time = date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
  const midnight = (at: Date) => new Date(at).setHours(0, 0, 0, 0);
  const days = Math.round((midnight(new Date()) - midnight(date)) / 86_400_000);
  if (days === 0) return `Today ${time}`;
  if (days === 1) return `Yesterday ${time}`;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  const day = date.toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
  return `${day} ${time}`;
}
