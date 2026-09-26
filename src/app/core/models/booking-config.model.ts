export type BookingMode = 'SLOT' | 'REQUEST';

export type Weekday =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

/** Index matches `Date.prototype.getDay()`. */
export const WEEKDAYS: Weekday[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
];

export interface WorkingDay {
  enabled: boolean;
  /** 24h "HH:mm". */
  open: string;
  close: string;
}

export interface BookingRules {
  enabled: boolean;
  /** SLOT = pick an exact time; REQUEST = pick a preferred period only. */
  bookingMode: BookingMode;
  allowStylistSelection: boolean;
  allowTherapistSelection: boolean;
  allowReschedule: boolean;
  allowCancellation: boolean;
  minimumAdvanceBookingHours: number;
  maximumAdvanceBookingDays: number;
  /** Minutes. */
  slotDuration: number;
  workingHours: Record<Weekday, WorkingDay>;
  /** ISO dates (yyyy-MM-dd) the studio is closed. */
  holidays: string[];
}

export interface BookingConfig {
  booking: BookingRules;
}

const OPEN: WorkingDay = { enabled: true, open: '10:00', close: '20:00' };

export const DEFAULT_BOOKING_RULES: BookingRules = {
  enabled: true,
  bookingMode: 'SLOT',
  allowStylistSelection: true,
  allowTherapistSelection: true,
  allowReschedule: true,
  allowCancellation: true,
  minimumAdvanceBookingHours: 1,
  maximumAdvanceBookingDays: 30,
  slotDuration: 30,
  workingHours: {
    sunday: { enabled: false, open: '10:00', close: '18:00' },
    monday: OPEN,
    tuesday: OPEN,
    wednesday: OPEN,
    thursday: OPEN,
    friday: OPEN,
    saturday: OPEN
  },
  holidays: []
};
