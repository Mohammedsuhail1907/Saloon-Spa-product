import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model
} from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import {
  AvailabilitySlot,
  DayAvailability,
  DayPeriod
} from '../../../core/models/booking.model';

const PERIODS: DayPeriod[] = ['Morning', 'Afternoon', 'Evening'];

/**
 * Reusable time-slot grid. Renders one day's availability grouped by period
 * and reports the picked slot through the `selected` model.
 */
@Component({
  selector: 'app-slot-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipModule],
  templateUrl: './slot-selector.html',
  styleUrl: './slot-selector.scss'
})
export class SlotSelector {
  readonly day = input.required<DayAvailability>();
  readonly selected = model<string | null>(null);

  readonly groups = computed(() =>
    PERIODS.map((period) => ({
      period,
      slots: this.day().slots.filter((s) => s.period === period)
    })).filter((g) => g.slots.length > 0)
  );

  pick(slot: AvailabilitySlot): void {
    if (slot.status === 'available') {
      this.selected.set(slot.time);
    }
  }

  tooltipFor(slot: AvailabilitySlot): string | undefined {
    switch (slot.status) {
      case 'booked':
        return 'Already booked';
      case 'waitlist':
        return 'Waitlist only — call the studio';
      case 'disabled':
        return 'Too soon to book online';
      default:
        return undefined;
    }
  }
}
