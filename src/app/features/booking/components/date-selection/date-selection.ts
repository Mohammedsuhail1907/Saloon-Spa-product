import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { DayAvailability } from '../../../../core/models/booking.model';

/** Step 3 — pick a date; closed days/holidays come in pre-disabled. */
@Component({
  selector: 'app-date-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePickerModule, MessageModule],
  templateUrl: './date-selection.html'
})
export class DateSelection {
  readonly date = input<Date | null>(null);
  readonly minDate = input.required<Date>();
  readonly maxDate = input.required<Date>();
  readonly disabledDays = input<number[]>([]);
  readonly disabledDates = input<Date[]>([]);
  /** Availability of the selected date (null until a date is picked). */
  readonly day = input<DayAvailability | null>(null);
  readonly availableCount = input(0);

  readonly dateChange = output<Date | null>();
}
