import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { Appointment } from '../../core/models/booking.model';
import { AvailabilityService } from '../../core/services/availability.service';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { CatalogService } from '../../core/services/catalog.service';
import { NotificationService } from '../../core/services/notification.service';
import { SlotSelector } from '../../shared/components/slot-selector/slot-selector';
import { PricePipe } from '../../shared/pipes/price.pipe';

/** Customer appointments: upcoming, past, reschedule, cancel, details. */
@Component({
  selector: 'app-appointments-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    TabsModule,
    TagModule,
    SlotSelector,
    PricePipe
  ],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss'
})
export class AppointmentsPage {
  protected readonly config = inject(BusinessConfigService);
  protected readonly catalog = inject(CatalogService);
  protected readonly bookingState = inject(BookingService);
  protected readonly availability = inject(AvailabilityService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly favoriteServices = computed(() =>
    this.bookingState
      .favorites()
      .map((id) => this.catalog.serviceById(id))
      .filter((s) => !!s)
  );

  /* --------------------------- reschedule --------------------------- */

  protected readonly rescheduling = signal<Appointment | null>(null);
  protected readonly newDate = signal<Date | null>(null);
  protected readonly newSlot = signal<string | null>(null);

  protected readonly minDate = this.availability.minDate();
  protected readonly maxDate = this.availability.maxDate();
  protected readonly disabledDays = this.availability.disabledDays();
  protected readonly disabledDates = this.availability.disabledDates();

  protected readonly rescheduleDay = computed(() => {
    const d = this.newDate();
    const appt = this.rescheduling();
    if (!d || !appt) return null;
    return this.availability.getDayAvailability(d, appt.professionalId ?? 0);
  });

  openReschedule(appointment: Appointment): void {
    this.rescheduling.set(appointment);
    this.newDate.set(null);
    this.newSlot.set(null);
  }

  onRescheduleDate(date: Date | null): void {
    this.newDate.set(date);
    this.newSlot.set(null);
  }

  confirmReschedule(): void {
    const appt = this.rescheduling();
    const date = this.newDate();
    const slot = this.newSlot();
    if (!appt || !date || !slot) return;
    this.bookingState.reschedule(appt.id, this.availability.toIsoDate(date), slot);
    this.rescheduling.set(null);
    this.notify.success(
      'Appointment rescheduled',
      `${appt.serviceName} — ${this.availability.labelFor(slot)}`
    );
  }

  /* ------------------------------ cancel ----------------------------- */

  cancel(appointment: Appointment): void {
    this.confirmation.confirm({
      header: 'Cancel appointment',
      message: `Are you sure you want to cancel ${appointment.serviceName}?`,
      acceptLabel: 'Cancel Appointment',
      rejectLabel: 'Keep Appointment',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.bookingState.cancel(appointment.id);
        this.notify.info('Appointment cancelled', `Ref ${appointment.ref}`);
      }
    });
  }

  /* ------------------------------ misc ------------------------------- */

  protected readonly viewing = signal<Appointment | null>(null);

  downloadIcs(appointment: Appointment): void {
    const blob = new Blob([this.bookingState.toIcs(appointment)], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appointment.ref}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }

  bookAgain(serviceId: number): void {
    this.bookingState.startBooking(this.catalog.serviceById(serviceId));
    void this.router.navigate(['/booking']);
  }

  goBook(): void {
    void this.router.navigate(['/booking']);
  }

  statusSeverity(appointment: Appointment): 'success' | 'danger' | 'secondary' {
    if (appointment.status === 'CANCELLED') return 'danger';
    if (appointment.status === 'CONFIRMED') return 'success';
    return 'secondary';
  }
}
