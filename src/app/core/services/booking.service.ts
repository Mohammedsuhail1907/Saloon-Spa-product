import { Injectable, computed, inject, signal } from '@angular/core';
import { storageKeys } from '../constants/app.constants';
import {
  Appointment,
  BookedAddon,
  BookingDraft,
  CustomerDetails,
  StoredGiftCard
} from '../models/booking.model';
import { Professional, Service } from '../models/catalog.model';
import { BusinessConfigService } from './config/business-config.service';
import { ClientConfigService } from './config/client-config.service';
import { ServiceCatalogService } from './data/service-catalog.service';

/**
 * Client-side booking state. Appointments live in localStorage (namespaced
 * per client id) so the demo survives reloads; swap the persistence for
 * POST/PUT/DELETE /appointments once a backend exists.
 */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly business = inject(BusinessConfigService);
  private readonly catalog = inject(ServiceCatalogService);
  private readonly keys = storageKeys(inject(ClientConfigService).getActiveClientKey());

  /** In-progress selection, shared across pages and the booking stepper. */
  private readonly _draft = signal<BookingDraft>({ addOnIds: [] });
  readonly draft = this._draft.asReadonly();

  private readonly _appointments = signal<Appointment[]>(this.read(this.keys.appointments, []));
  readonly appointments = this._appointments.asReadonly();

  private readonly _favorites = signal<number[]>(this.read(this.keys.favorites, []));
  readonly favorites = this._favorites.asReadonly();

  private readonly _giftCards = signal<StoredGiftCard[]>(this.read(this.keys.giftCards, []));
  readonly giftCards = this._giftCards.asReadonly();

  private readonly _membership = signal<string | null>(this.read(this.keys.membership, null));
  readonly membership = this._membership.asReadonly();

  readonly upcoming = computed(() =>
    this._appointments()
      .filter((a) => a.status === 'CONFIRMED' && new Date(a.dateTime) >= this.startOfToday())
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
  );

  readonly past = computed(() =>
    this._appointments()
      .filter((a) => a.status !== 'CONFIRMED' || new Date(a.dateTime) < this.startOfToday())
      .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
  );

  /* ------------------------------ draft ------------------------------ */

  startBooking(service?: Service, professional?: Professional): void {
    this._draft.set({
      service,
      professional: professional ?? null,
      anyProfessional: false,
      addOnIds: []
    });
  }

  updateDraft(patch: Partial<BookingDraft>): void {
    this._draft.update((d) => ({ ...d, ...patch }));
  }

  clearDraft(): void {
    this._draft.set({ addOnIds: [] });
  }

  /* --------------------------- appointments --------------------------- */

  book(customer: CustomerDetails): Appointment | null {
    const d = this._draft();
    if (!d.service || !d.date || !d.time) return null;

    const addOns: BookedAddon[] = this.catalog
      .addonsByIds(d.addOnIds)
      .map((a) => ({ name: a.name, price: a.price, duration: a.duration }));

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      ref: `${this.refPrefix()}-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      serviceId: d.service.id,
      serviceName: d.service.name,
      serviceType: d.service.type,
      professionalId: d.professional?.id,
      professionalName: d.anyProfessional
        ? 'Any available professional'
        : d.professional?.name ?? 'Any available professional',
      date: d.date,
      time: d.time,
      dateTime: `${d.date}T${d.time}:00`,
      durationMinutes: d.service.duration + addOns.reduce((t, a) => t + a.duration, 0),
      price: d.service.price + addOns.reduce((t, a) => t + a.price, 0),
      addOns,
      customer,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    this._appointments.update((list) => [appointment, ...list]);
    this.write(this.keys.appointments, this._appointments());
    this.clearDraft();
    return appointment;
  }

  reschedule(id: string, date: string, time: string): Appointment | undefined {
    let updated: Appointment | undefined;
    this._appointments.update((list) =>
      list.map((a) => {
        if (a.id !== id) return a;
        updated = { ...a, date, time, dateTime: `${date}T${time}:00` };
        return updated;
      })
    );
    this.write(this.keys.appointments, this._appointments());
    return updated;
  }

  cancel(id: string): void {
    this._appointments.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' as const } : a))
    );
    this.write(this.keys.appointments, this._appointments());
  }

  /** iCalendar text for “Add to calendar”. */
  toIcs(a: Appointment): string {
    const name = this.business.name();
    const start = `${a.date.replaceAll('-', '')}T${a.time.replace(':', '')}00`;
    const endDate = new Date(a.dateTime);
    endDate.setMinutes(endDate.getMinutes() + a.durationMinutes);
    const end =
      `${endDate.getFullYear()}${`${endDate.getMonth() + 1}`.padStart(2, '0')}` +
      `${`${endDate.getDate()}`.padStart(2, '0')}T` +
      `${`${endDate.getHours()}`.padStart(2, '0')}${`${endDate.getMinutes()}`.padStart(2, '0')}00`;
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SalonSpa//Booking//EN',
      'BEGIN:VEVENT',
      `UID:${a.ref}@salon-spa`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${a.serviceName} — ${name}`,
      `DESCRIPTION:With ${a.professionalName} · Ref ${a.ref}`,
      `LOCATION:${this.business.addressLine() || this.business.city()}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  /* ----------------------------- favorites ---------------------------- */

  isFavorite(serviceId: number): boolean {
    return this._favorites().includes(serviceId);
  }

  toggleFavorite(serviceId: number): boolean {
    const added = !this.isFavorite(serviceId);
    this._favorites.update((ids) =>
      added ? [...ids, serviceId] : ids.filter((id) => id !== serviceId)
    );
    this.write(this.keys.favorites, this._favorites());
    return added;
  }

  /* ------------------------ gift cards & plans ------------------------ */

  addGiftCard(card: Omit<StoredGiftCard, 'id' | 'createdAt'>): StoredGiftCard {
    const stored: StoredGiftCard = {
      ...card,
      id: `GC-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      createdAt: new Date().toISOString()
    };
    this._giftCards.update((list) => [stored, ...list]);
    this.write(this.keys.giftCards, this._giftCards());
    return stored;
  }

  activateMembership(planName: string): void {
    this._membership.set(planName);
    this.write(this.keys.membership, planName);
  }

  /* ------------------------------ helpers ----------------------------- */

  /** Booking reference prefix derived from the brand initials, e.g. "MC" for "Maison Coiffure". */
  private refPrefix(): string {
    const initials = this.business
      .name()
      .split(/\s+/)
      .map((w) => w.replace(/[^A-Za-z0-9]/g, '')[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 3);
    return initials || 'BK';
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private write(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable (private mode) — demo state just won't persist.
    }
  }
}
