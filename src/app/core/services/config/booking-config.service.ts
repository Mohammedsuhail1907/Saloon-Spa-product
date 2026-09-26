import { Injectable, computed, signal } from '@angular/core';
import {
  BookingRules,
  DEFAULT_BOOKING_RULES,
  WEEKDAYS,
  WorkingDay
} from '../../models/booking-config.model';

/** Opening hours and booking rules; the availability engine reads from here. */
@Injectable({ providedIn: 'root' })
export class BookingConfigService {
  private readonly _rules = signal<BookingRules>(DEFAULT_BOOKING_RULES);

  readonly rules = this._rules.asReadonly();
  readonly isEnabled = computed(() => this._rules().enabled);
  readonly isSlotMode = computed(() => this._rules().bookingMode === 'SLOT');
  readonly allowStylistSelection = computed(() => this._rules().allowStylistSelection);
  readonly allowTherapistSelection = computed(() => this._rules().allowTherapistSelection);
  readonly allowReschedule = computed(() => this._rules().allowReschedule);
  readonly allowCancellation = computed(() => this._rules().allowCancellation);
  readonly slotDuration = computed(() => Math.max(5, this._rules().slotDuration));
  readonly minimumAdvanceHours = computed(() => this._rules().minimumAdvanceBookingHours);
  readonly maximumAdvanceDays = computed(() => this._rules().maximumAdvanceBookingDays);
  readonly holidays = computed(() => this._rules().holidays);

  /** Weekday indexes (0 = Sunday) with no working hours. */
  readonly closedWeekdays = computed(() =>
    WEEKDAYS.map((day, index) => (this._rules().workingHours[day]?.enabled ? -1 : index)).filter(
      (i) => i >= 0
    )
  );

  workingDay(date: Date): WorkingDay | undefined {
    const day = this._rules().workingHours[WEEKDAYS[date.getDay()]];
    return day?.enabled ? day : undefined;
  }

  isHoliday(isoDate: string): boolean {
    return this._rules().holidays.includes(isoDate);
  }

  /** Called once by ConfigLoaderService. */
  set(rules: BookingRules): void {
    this._rules.set(rules);
  }
}
