import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ExperienceAddon, Service } from '../../../../core/models/catalog.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

/** Step 6 — read-only recap before confirming. */
@Component({
  selector: 'app-booking-review',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, PricePipe],
  templateUrl: './booking-review.html'
})
export class BookingReview {
  readonly service = input<Service | null>(null);
  readonly professionalLabel = input('');
  readonly date = input<Date | null>(null);
  readonly slotLabel = input('');
  readonly addons = input<ExperienceAddon[]>([]);
  readonly totalDuration = input(0);
  readonly totalPrice = input(0);
  readonly guestLine = input('');
}
