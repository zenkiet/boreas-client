import { Service, inject } from '@angular/core';
import { TuiDay, TuiDayRange } from '@taiga-ui/cdk';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';

import { DateRangeDialog, DateRangeDialogData } from './date-range-dialog';

@Service()
export class DateRangePickerService {
  private readonly dialogs = inject(TuiDialogService);

  pick(data: DateRangeDialogData): Observable<TuiDayRange> {
    return this.dialogs.open<TuiDayRange>(new PolymorpheusComponent(DateRangeDialog), {
      appearance: 'fullscreen',
      closable: false,
      data,
      size: 'l',
    });
  }
}

export function toUtcStartOfDay(day: TuiDay): Date {
  return new Date(Date.UTC(day.year, day.month, day.day));
}
