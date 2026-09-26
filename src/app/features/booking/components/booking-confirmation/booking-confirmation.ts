import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Appointment } from '../../../../core/models/booking.model';
import { Product } from '../../../../core/models/catalog.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

/** Success screen shown once an appointment is confirmed. */
@Component({
  selector: 'app-booking-confirmation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ButtonModule, PricePipe],
  templateUrl: './booking-confirmation.html',
  styleUrl: './booking-confirmation.scss'
})
export class BookingConfirmation {
  readonly appointment = input.required<Appointment>();
  readonly products = input<Product[]>([]);
  /** Hide the "View Booking" CTA when the customer dashboard is disabled. */
  readonly showAppointments = input(true);

  readonly addToCalendar = output<void>();
  readonly viewAppointments = output<void>();
  readonly bookAnother = output<void>();
}
