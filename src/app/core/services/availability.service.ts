import { Injectable, inject } from '@angular/core';
import { AvailabilitySlot, DayAvailability, DayPeriod } from '../models/booking.model';
import { BookingConfigService } from './config/booking-config.service';
import { BusinessConfigService } from './config/business-config.service';

/**
 * MOCK availability engine driven by booking-config.json. Slot states are
 * generated deterministically from (date, professional, time) so the demo
 * feels stable, but nothing here is real-time. Replace the body of
 * `getDayAvailability` with `GET /availability?date=…&professionalId=…`.
 */
@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly booking = inject(BookingConfigService);
  private readonly business = inject(BusinessConfigService);

  toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  labelFor(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${`${m}`.padStart(2, '0')} ${suffix}`;
  }

  /** Whether the studio is open right now according to working hours. */
  isOpenNow(now = new Date()): boolean {
    const day = this.booking.workingDay(now);
    if (!day || this.booking.isHoliday(this.toIsoDate(now))) return false;
    const minutes = now.getHours() * 60 + now.getMinutes();
    return minutes >= this.toMinutes(day.open) && minutes < this.toMinutes(day.close);
  }

  getDayAvailability(date: Date, professionalId = 0): DayAvailability {
    const iso = this.toIsoDate(date);
    const day = this.booking.workingDay(date);

    if (!day) {
      return { date: iso, closed: true, reason: 'Closed on this day', slots: [] };
    }
    if (this.booking.isHoliday(iso)) {
      return { date: iso, closed: true, reason: 'Closed for a holiday', slots: [] };
    }

    const now = new Date();
    const isToday = this.toIsoDate(now) === iso;
    const cutoff =
      now.getHours() * 60 + now.getMinutes() + this.booking.minimumAdvanceHours() * 60;

    const slots: AvailabilitySlot[] = [];
    const step = this.booking.slotDuration();
    for (let minutes = this.toMinutes(day.open); minutes < this.toMinutes(day.close); minutes += step) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const time = `${`${h}`.padStart(2, '0')}:${`${m}`.padStart(2, '0')}`;
      const r = this.rand01(this.hash(`${iso}|${professionalId}|${time}`));

      let status: AvailabilitySlot['status'] =
        r < 0.3 ? 'booked' : r < 0.38 ? 'waitlist' : 'available';
      if (isToday && minutes <= cutoff) status = 'disabled';

      slots.push({ time, label: this.labelFor(time), status, period: this.periodOf(h) });
    }
    return { date: iso, closed: false, slots };
  }

  /** First bookable slots for a professional today (or the next open day). */
  nextAvailable(professionalId: number, count = 2): { dayLabel: string; slots: AvailabilitySlot[] } {
    const cursor = new Date();
    for (let i = 0; i < 7; i++) {
      const day = this.getDayAvailability(cursor, professionalId);
      const open = day.slots.filter((s) => s.status === 'available').slice(0, count);
      if (!day.closed && open.length) {
        const dayLabel =
          i === 0
            ? 'Today'
            : i === 1
              ? 'Tomorrow'
              : cursor.toLocaleDateString(this.business.locale(), { weekday: 'long' });
        return { dayLabel, slots: open };
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return { dayLabel: 'This week', slots: [] };
  }

  minDate(): Date {
    return new Date();
  }

  maxDate(): Date {
    const d = new Date();
    d.setDate(d.getDate() + this.booking.maximumAdvanceDays());
    return d;
  }

  disabledDays(): number[] {
    return this.booking.closedWeekdays();
  }

  disabledDates(): Date[] {
    return this.booking.holidays().map((h) => new Date(`${h}T00:00:00`));
  }

  private toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  private periodOf(hour: number): DayPeriod {
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  private hash(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  private rand01(seed: number): number {
    let t = seed + 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
