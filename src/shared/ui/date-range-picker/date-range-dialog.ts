import { Component } from '@angular/core';
import { TuiMobileCalendar } from '@taiga-ui/addon-mobile';
import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';
import { injectContext } from '@taiga-ui/polymorpheus';

export interface DateRangeDialogData {
  readonly min: TuiDay;
  readonly max: TuiDay;
  readonly value: TuiDayRange | null;
}

/** Hosts Taiga's full-height obile calendar; its own header supplies Cancel and Done. */
@Component({
  selector: 'app-date-range-dialog',
  imports: [TuiMobileCalendar],
  template: `
    <tui-mobile-calendar
      [max]="context.data.max"
      [min]="context.data.min"
      [single]="false"
      [value]="context.data.value"
      (cancel)="context.$implicit.complete()"
      (confirm)="pick($event)"
    />
  `,
  styles: `
    :host {
      display: block;
      block-size: 100%;
    }
  `,
})
export class DateRangeDialog {
  protected readonly context = injectContext<{
    readonly data: DateRangeDialogData;
    readonly $implicit: { next(value: TuiDayRange): void; complete(): void };
  }>();

  protected pick(value: TuiDay | TuiDayRange | readonly TuiDay[]): void {
    const range = toRange(value);

    if (range) {
      this.context.$implicit.next(range);
    }

    this.context.$implicit.complete();
  }
}

function toRange(value: TuiDay | TuiDayRange | readonly TuiDay[]): TuiDayRange | null {
  if (Array.isArray(value)) {
    return null;
  }

  const single = value as TuiDay;

  return 'from' in value && 'to' in value
    ? (value as TuiDayRange)
    : new TuiDayRange(single, single);
}
