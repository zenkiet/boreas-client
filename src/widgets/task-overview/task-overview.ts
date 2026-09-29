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

import type { DeployOutcome } from '@entities/task';
import { DEV_STATUS_LABEL, DevStatus, Task } from '@entities/task';
import { toByteSize } from '@shared/lib/format/bytes';
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
  imports: [InsetGroup, IonButton, IonItem, IonLabel, IonSelect, IonSelectOption],
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

      <ion-item>
        <ion-label class="row-label">Proxy URL</ion-label>
        <!-- min-width lets the nowrap link shrink; without it the copy button leaves the group. -->
        <a class="value value--link value--tail" rel="noopener" target="_blank" [href]="proxyUrl()"
          ><bdi>{{ proxyLabel() }}</bdi></a
        >
        <ion-button
          slot="end"
          fill="clear"
          size="small"
          [attr.aria-label]="copied() ? 'Copied' : 'Copy proxy URL'"
          (click)="copyUrl()"
        >
          <span
            slot="icon-only"
            [class]="copied() ? 'icon-[light--check]' : 'icon-[light--copy]'"
            aria-hidden="true"
          ></span>
        </ion-button>
      </ion-item>

      <ion-item>
        <ion-label class="row-label">Container</ion-label>
        <span class="value" [attr.data-state]="task().status">{{ task().status }}</span>
      </ion-item>

      <ion-item>
        <ion-label class="row-label">Image</ion-label>
        <span class="value value--tail font-mono" [attr.title]="task().image"
          ><bdi>{{ shortImage() }}</bdi></span
        >
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
  `,
  styles: `
    .row-label {
      flex: none;
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

    /* Clipped at the head, where rows are alike; in rtl, inline-end is the label's side. */
    .value--tail {
      direction: rtl;
      padding-inline: 0 0.75rem;
      text-align: start;
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
  readonly usage = input<{ readonly cpu: number; readonly mem: number } | null>(null);
  /** Below member the status is shown, not offered. */
  readonly editable = input(true);
  readonly copyFailed = output<void>();
  readonly imageCopyFailed = output<void>();
  /** The raw event, so the page can flip the select back on a refused change. */
  readonly statusChange = output<SelectCustomEvent<DevStatus>>();

  protected readonly wide = wideScreen();
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly statusMenu = STATUS_MENU;
  protected readonly devLabel = DEV_STATUS_LABEL;

  /* Every task shares the host; the path is what tells them apart. */
  protected readonly proxyLabel = computed(() => this.proxyUrl().replace(/^https?:\/\/[^/]+/, '…'));

  /* "…/storefront@9f86d0"; copy keeps the full reference. */
  protected readonly shortImage = computed(() => {
    const image = this.task().image.replace(/@sha256:([0-9a-f]{6})[0-9a-f]+$/, '@$1');
    const slash = image.lastIndexOf('/', image.includes('@') ? image.indexOf('@') : image.length);
    return slash < 0 ? image : `…${image.slice(slash)}`;
  });

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
