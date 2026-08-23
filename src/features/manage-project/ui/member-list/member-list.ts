import { DatePipe } from '@angular/common';
import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

import { AddMemberInput, Member, PROJECT_ROLES, ProjectRole } from '@entities/project';
import { User } from '@entities/user';
import { GlassSelect, GlassSelectOption } from '@shared/ui/glass-select/glass-select';

@Component({
  selector: 'app-member-list',
  imports: [DatePipe, GlassSelect, TuiButton, TuiIcon],
  template: `
    @for (member of members(); track member.userId) {
      <div class="row row-divider relative">
        <span class="row__avatar" aria-hidden="true">{{ initials(member.username) }}</span>
        <span class="min-w-0 flex-1">
          <span class="row__name">{{ member.username }}</span>
          <span class="row__sub">{{ dateVerb() }} {{ member.createdAt | date: 'MMM d, y' }}</span>
        </span>
        <span class="row__role" [attr.data-role]="member.role">{{ member.role }}</span>
        <button
          tuiIconButton
          type="button"
          size="s"
          appearance="flat-grayscale"
          [disabled]="busy()"
          [attr.aria-label]="'Remove ' + member.username"
          (click)="removeRequested.emit(member)"
        >
          <tui-icon class="icon-sm" icon="@tui.x" />
        </button>
      </div>
    }

    <!-- Non-admins cannot resolve usernames to ids, so they paste the user id. -->
    <form class="add row-divider relative" (submit)="submit($event)">
      @if (candidates() !== null) {
        <app-glass-select
          class="add__picker"
          placeholder="Select a user…"
          ariaLabel="User to add"
          align="start"
          [options]="userOptions()"
          [value]="draftUserId()"
          [disabled]="busy()"
          (valueChange)="draftUserId.set($event)"
        />
      } @else {
        <input
          class="add__field"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="User ID (UUID)"
          aria-label="User ID to add"
          [value]="draftUserId()"
          (input)="typeUser($event)"
        />
      }

      <app-glass-select
        ariaLabel="Role"
        [options]="roleOptions()"
        [value]="draftRole()"
        [disabled]="busy()"
        (valueChange)="pickRole($event)"
      />

      <button
        tuiButton
        type="submit"
        size="s"
        appearance="secondary"
        [disabled]="busy() || !draftUserId()"
      >
        Add
      </button>
    </form>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6875rem 1rem;
      min-block-size: 3.5rem;
    }

    .row__avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 1.875rem;
      block-size: 1.875rem;
      flex: none;
      border-radius: 999px;
      background: var(--app-accent-soft);
      color: var(--app-accent-text);
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .row__name {
      display: block;
      overflow: hidden;
      font-size: 1rem;
      font-weight: 600;
      color: var(--tui-text-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .row__sub {
      display: block;
      font-size: 0.8125rem;
      color: var(--tui-text-tertiary);
    }

    .row__role {
      flex: none;
      border-radius: 999px;
      padding: 0.125rem 0.5625rem;
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--tui-text-tertiary);
      background: var(--tui-background-neutral-1);
    }

    .row__role[data-role='owner'] {
      color: var(--app-accent-text);
      background: var(--app-accent-soft);
    }

    .add {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
    }

    /* Match the borderless inset-row fields the create form established. */
    .add__field {
      flex: 1;
      min-inline-size: 0;
      margin: 0;
      border: 0;
      padding: 0.375rem 0;
      background: none;
      font: inherit;
      font-size: 0.9375rem;
      color: var(--tui-text-primary);
    }

    .add__field:focus {
      outline: none;
    }

    .add__field::placeholder {
      color: var(--tui-text-tertiary);
      opacity: 0.6;
    }

    .add__picker {
      flex: 1;
      min-inline-size: 0;
    }
  `,
})
export class MemberList {
  readonly members = input.required<readonly Member[]>();
  /** null when the viewer may not list users; the form falls back to a raw id field. */
  readonly users = input.required<readonly User[] | null>();
  readonly busy = input(false);
  /** Grants reuse this list with the owner rung removed. */
  readonly roles = input<readonly ProjectRole[]>(PROJECT_ROLES);
  readonly defaultRole = input<ProjectRole>('member');
  readonly dateVerb = input('Joined');
  readonly addRequested = output<AddMemberInput>();
  readonly removeRequested = output<Member>();

  protected readonly draftUserId = signal('');
  protected readonly draftRole = linkedSignal(() => this.defaultRole());

  protected readonly roleOptions = computed<readonly GlassSelectOption[]>(() =>
    this.roles().map((role) => ({ value: role, label: role })),
  );

  protected readonly candidates = computed(() => {
    const users = this.users();
    if (!users) return null;

    const taken = new Set(this.members().map((member) => member.userId));
    return users.filter((user) => !taken.has(user.id) && !user.disabled);
  });

  protected readonly userOptions = computed<readonly GlassSelectOption[]>(
    () => this.candidates()?.map((user) => ({ value: user.id, label: user.username })) ?? [],
  );

  protected initials(username: string): string {
    return username.slice(0, 2);
  }

  protected typeUser(event: Event): void {
    this.draftUserId.set((event.target as HTMLInputElement).value.trim());
  }

  protected pickRole(value: string): void {
    this.draftRole.set(value as ProjectRole);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const userId = this.draftUserId();
    if (!userId) return;

    this.addRequested.emit({ userId, role: this.draftRole() });
    this.draftUserId.set('');
    this.draftRole.set(this.defaultRole());
  }
}
