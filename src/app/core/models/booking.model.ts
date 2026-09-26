import { Professional, Service } from './catalog.model';

export type SlotStatus = 'available' | 'booked' | 'waitlist' | 'disabled';

export type DayPeriod = 'Morning' | 'Afternoon' | 'Evening';

export interface AvailabilitySlot {
  /** 24h time, e.g. "16:30". */
  time: string;
  /** Display label, e.g. "4:30 PM". */
  label: string;
  status: SlotStatus;
  period: DayPeriod;
}

export interface DayAvailability {
  /** ISO date, yyyy-MM-dd. */
  date: string;
  closed: boolean;
  reason?: string;
  slots: AvailabilitySlot[];
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface BookedAddon {
  name: string;
  price: number;
  duration: number;
}

export type AppointmentStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: string;
  ref: string;
  serviceId: number;
  serviceName: string;
  serviceType: string;
  professionalId?: number;
  professionalName: string;
  /** ISO date, yyyy-MM-dd. */
  date: string;
  /** 24h time, e.g. "16:30". */
  time: string;
  /** Local date-time string usable with the date pipe. */
  dateTime: string;
  durationMinutes: number;
  price: number;
  addOns: BookedAddon[];
  customer: CustomerDetails;
  status: AppointmentStatus;
  createdAt: string;
}

/** In-progress booking selection shared between pages and the booking flow. */
export interface BookingDraft {
  service?: Service;
  professional?: Professional | null;
  /** True when the guest chose “any available professional”. */
  anyProfessional?: boolean;
  date?: string;
  time?: string;
  addOnIds: number[];
}

export interface StoredGiftCard {
  id: string;
  amount: number;
  experience: string;
  to: string;
  from: string;
  message?: string;
  createdAt: string;
}
