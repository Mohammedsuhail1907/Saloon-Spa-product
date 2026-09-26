import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StepperModule } from 'primeng/stepper';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { Appointment, DayPeriod } from '../../core/models/booking.model';
import { Professional, Service } from '../../core/models/catalog.model';
import { AvailabilityService } from '../../core/services/availability.service';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { CatalogService } from '../../core/services/catalog.service';
import { NotificationService } from '../../core/services/notification.service';
import { SlotPicker } from '../../shared/components/slot-picker/slot-picker';
import { PricePipe } from '../../shared/pipes/price.pipe';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[0-9+\-() ]{8,16}$/;

@Component({
  selector: 'app-booking-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    AvatarModule,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    DividerModule,
    InputTextModule,
    MessageModule,
    SelectButtonModule,
    StepperModule,
    TagModule,
    TextareaModule,
    SlotPicker,
    PricePipe
  ],
  templateUrl: './booking.html'
})
export class BookingPage {
  protected readonly config = inject(BusinessConfigService);
  protected readonly catalog = inject(CatalogService);
  protected readonly availability = inject(AvailabilityService);
  protected readonly bookingState = inject(BookingService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly step = signal(1);
  protected readonly booked = signal<Appointment | null>(null);

  /* --------------------------- selections --------------------------- */

  protected readonly service = signal<Service | null>(
    this.bookingState.draft().service ?? null
  );
  protected readonly professional = signal<Professional | null>(
    this.bookingState.draft().professional ?? null
  );
  protected readonly anyProfessional = signal(false);
  protected readonly date = signal<Date | null>(null);
  protected readonly slot = signal<string | null>(null);
  protected readonly preferredPeriod = signal<DayPeriod | null>(null);
  protected readonly addOnIds = signal<number[]>(this.bookingState.draft().addOnIds ?? []);

  /* ------------------------ customer details ------------------------ */

  protected readonly name = signal('');
  protected readonly phone = signal('');
  protected readonly email = signal('');
  protected readonly notes = signal('');
  protected readonly triedSubmit = signal(false);

  protected readonly nameValid = computed(() => this.name().trim().length >= 2);
  protected readonly phoneValid = computed(() => PHONE_RE.test(this.phone().trim()));
  protected readonly emailValid = computed(() => EMAIL_RE.test(this.email().trim()));
  protected readonly detailsValid = computed(
    () => this.nameValid() && this.phoneValid() && this.emailValid()
  );

  /* ---------------------------- catalogue ---------------------------- */

  protected readonly serviceGroups = computed(() => {
    const services = this.catalog.services();
    const pro = this.professional();
    const list = pro
      ? services.filter((s) => s.professionalIds.includes(pro.id))
      : services;
    const groups = [
      { label: 'Salon', items: list.filter((s) => s.type === 'SALON') },
      { label: 'Spa', items: list.filter((s) => s.type === 'SPA') }
    ].filter((g) => g.items.length);
    return groups;
  });

  protected readonly professionalOptions = computed(() => {
    const s = this.service();
    return s ? this.catalog.professionalsFor(s) : this.catalog.professionals();
  });

  /** Professional choice may be disabled per type via feature flags. */
  protected readonly canChooseProfessional = computed(() => {
    const s = this.service();
    if (!s) return true;
    return s.type === 'SALON'
      ? this.config.isStylistSelectionEnabled()
      : this.config.isTherapistSelectionEnabled();
  });

  protected readonly slotBooking = computed(() => this.config.isSlotBookingEnabled());

  protected readonly dayAvailability = computed(() => {
    const d = this.date();
    if (!d) return null;
    return this.availability.getDayAvailability(d, this.professional()?.id ?? 0);
  });

  protected readonly availableCount = computed(
    () => this.dayAvailability()?.slots.filter((s) => s.status === 'available').length ?? 0
  );

  protected readonly periodOptions = computed(() => {
    const day = this.dayAvailability();
    if (!day) return [];
    const periods: DayPeriod[] = ['Morning', 'Afternoon', 'Evening'];
    return periods
      .filter((p) => day.slots.some((s) => s.period === p && s.status === 'available'))
      .map((p) => ({ label: p, value: p }));
  });

  protected readonly addons = computed(() => {
    const s = this.service();
    return s ? this.catalog.addonsFor(s.type) : [];
  });

  protected readonly selectedAddons = computed(() =>
    this.addons().filter((a) => this.addOnIds().includes(a.id))
  );

  protected readonly totalPrice = computed(
    () =>
      (this.service()?.price ?? 0) +
      this.selectedAddons().reduce((t, a) => t + a.price, 0)
  );

  protected readonly totalDuration = computed(
    () =>
      (this.service()?.duration ?? 0) +
      this.selectedAddons().reduce((t, a) => t + a.duration, 0)
  );

  protected readonly slotLabel = computed(() => {
    const t = this.slot();
    return t ? this.availability.labelFor(t) : '';
  });

  protected readonly recommendedProducts = computed(() => {
    const s = this.booked() ? this.catalog.serviceById(this.booked()!.serviceId) : this.service();
    return this.config.isProductsEnabled() && s ? this.catalog.productsForTags(s.tags) : [];
  });

  protected readonly minDate = this.availability.minDate();
  protected readonly maxDate = this.availability.maxDate();
  protected readonly disabledDays = this.availability.disabledDays();
  protected readonly disabledDates = this.availability.disabledDates();

  /* ----------------------------- guards ------------------------------ */

  protected readonly canNext = computed(() => {
    switch (this.step()) {
      case 1:
        return !!this.service();
      case 2:
        return !!this.professional() || this.anyProfessional();
      case 3:
        return !!this.date() && !this.dayAvailability()?.closed && this.availableCount() > 0;
      case 4:
        return !!this.slot();
      case 5:
        return this.detailsValid();
      default:
        return true;
    }
  });

  /* ----------------------------- actions ----------------------------- */

  selectService(service: Service): void {
    this.service.set(service);
    const pro = this.professional();
    if (pro && !service.professionalIds.includes(pro.id)) {
      this.professional.set(null);
      this.anyProfessional.set(false);
    }
    this.slot.set(null);
    this.addOnIds.set([]);
  }

  selectProfessional(professional: Professional | null): void {
    this.professional.set(professional);
    this.anyProfessional.set(professional === null);
    this.slot.set(null);
  }

  onDateChange(date: Date | null): void {
    this.date.set(date);
    this.slot.set(null);
    this.preferredPeriod.set(null);
  }

  onPeriodChange(period: DayPeriod): void {
    this.preferredPeriod.set(period);
    const day = this.dayAvailability();
    const first = day?.slots.find((s) => s.period === period && s.status === 'available');
    this.slot.set(first?.time ?? null);
  }

  toggleAddon(id: number, checked: boolean): void {
    this.addOnIds.update((ids) =>
      checked ? [...ids, id] : ids.filter((x) => x !== id)
    );
  }

  next(): void {
    if (!this.canNext()) return;
    let target = this.step() + 1;
    // Skip the professional step when selection is disabled by configuration.
    if (target === 2 && !this.canChooseProfessional()) {
      this.anyProfessional.set(true);
      target = 3;
    }
    this.step.set(Math.min(target, 6));
  }

  back(): void {
    let target = this.step() - 1;
    if (target === 2 && !this.canChooseProfessional()) target = 1;
    this.step.set(Math.max(target, 1));
  }

  confirm(): void {
    this.triedSubmit.set(true);
    const service = this.service();
    const date = this.date();
    if (!service || !date || !this.slot() || !this.detailsValid()) return;

    this.bookingState.updateDraft({
      service,
      professional: this.professional(),
      anyProfessional: this.anyProfessional(),
      date: this.availability.toIsoDate(date),
      time: this.slot()!,
      addOnIds: this.addOnIds()
    });

    const appointment = this.bookingState.book({
      name: this.name().trim(),
      phone: this.phone().trim(),
      email: this.email().trim(),
      notes: this.notes().trim() || undefined
    });

    if (appointment) {
      this.booked.set(appointment);
      this.notify.success('Appointment booked successfully', `Ref ${appointment.ref}`);
    } else {
      this.notify.error('Something went wrong', 'Please review your selections.');
    }
  }

  downloadIcs(): void {
    const a = this.booked();
    if (!a) return;
    const blob = new Blob([this.bookingState.toIcs(a)], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${a.ref}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  viewBookings(): void {
    void this.router.navigate(['/my-experiences']);
  }

  bookAnother(): void {
    this.bookingState.clearDraft();
    this.booked.set(null);
    this.service.set(null);
    this.professional.set(null);
    this.anyProfessional.set(false);
    this.date.set(null);
    this.slot.set(null);
    this.addOnIds.set([]);
    this.triedSubmit.set(false);
    this.step.set(1);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
