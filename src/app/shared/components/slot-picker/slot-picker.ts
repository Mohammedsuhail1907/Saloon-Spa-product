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

@Component({
  selector: 'app-slot-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipModule],
  template: `
    @if (day().closed) {
      <div class="slot-closed">
        <i class="pi pi-moon" aria-hidden="true"></i>
        <p>{{ day().reason ?? 'The studio is closed on this day.' }}</p>
        <span>Please pick another date.</span>
      </div>
    } @else {
      @for (group of groups(); track group.period) {
        <div class="slot-group">
          <h4 class="slot-group__title">{{ group.period }}</h4>
          <div class="slot-grid" role="listbox" aria-label="Available time slots">
            @for (slot of group.slots; track slot.time) {
              <button
                type="button"
                class="slot-chip"
                role="option"
                [class.is-selected]="slot.time === selected()"
                [class.is-booked]="slot.status === 'booked'"
                [class.is-waitlist]="slot.status === 'waitlist'"
                [class.is-disabled]="slot.status === 'disabled'"
                [disabled]="slot.status !== 'available'"
                [attr.aria-selected]="slot.time === selected()"
                [pTooltip]="tooltipFor(slot)"
                tooltipPosition="top"
                (click)="pick(slot)"
              >
                {{ slot.label }}
              </button>
            }
          </div>
        </div>
      }
      <div class="slot-legend" aria-hidden="true">
        <span><i class="legend-dot legend-dot--available"></i>Available</span>
        <span><i class="legend-dot legend-dot--selected"></i>Selected</span>
        <span><i class="legend-dot legend-dot--booked"></i>Booked</span>
        <span><i class="legend-dot legend-dot--waitlist"></i>Waitlist</span>
      </div>
    }
  `
})
export class SlotPicker {
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
