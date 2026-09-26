import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DayAvailability, DayPeriod } from '../../../../core/models/booking.model';
import { SlotSelector } from '../../../../shared/components/slot-selector/slot-selector';

export interface PeriodOption {
  label: DayPeriod;
  value: DayPeriod;
}

/**
 * Step 4 — pick an exact slot (slot booking) or just a preferred time of
 * day when slot booking is disabled in the configuration.
 */
@Component({
  selector: 'app-slot-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, SelectButtonModule, SlotSelector],
  templateUrl: './slot-selection.html'
})
export class SlotSelection {
  readonly day = input<DayAvailability | null>(null);
  readonly slotBooking = input(true);
  readonly slot = input<string | null>(null);
  readonly periodOptions = input<PeriodOption[]>([]);
  readonly preferredPeriod = input<DayPeriod | null>(null);
  readonly slotLabel = input('');

  readonly slotChange = output<string | null>();
  readonly periodChange = output<DayPeriod>();
}
