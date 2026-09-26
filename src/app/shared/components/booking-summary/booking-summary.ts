import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { ExperienceAddon, Service } from '../../../core/models/catalog.model';
import { PricePipe } from '../../pipes/price.pipe';

/**
 * Sticky "Your experience" summary card. Purely presentational: the owning
 * feature computes labels and totals and can project a CTA (e.g. a Book
 * button) as content.
 */
@Component({
  selector: 'app-booking-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DividerModule, PricePipe],
  templateUrl: './booking-summary.html',
  styleUrl: './booking-summary.scss'
})
export class BookingSummary {
  readonly service = input<Service | null>(null);
  readonly professionalLabel = input<string | null>(null);
  readonly dateLabel = input<string | null>(null);
  readonly timeLabel = input<string | null>(null);
  readonly addons = input<ExperienceAddon[]>([]);
  /** Show "+price" next to each add-on row (used by the package builder). */
  readonly showAddonPrices = input(false);
  readonly totalDuration = input(0);
  readonly totalPrice = input(0);
  readonly emptyText = input('Choose a service to begin.');
  readonly hint = input<string | null>(null);
}
