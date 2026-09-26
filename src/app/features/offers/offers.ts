import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Offer } from '../../core/models/catalog.model';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { CatalogService } from '../../core/services/catalog.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-offers-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, TagModule, RevealDirective, PricePipe],
  templateUrl: './offers.html'
})
export class OffersPage {
  protected readonly config = inject(BusinessConfigService);
  protected readonly catalog = inject(CatalogService);
  private readonly bookingState = inject(BookingService);
  private readonly router = inject(Router);

  book(offer: Offer): void {
    const service = offer.serviceId ? this.catalog.serviceById(offer.serviceId) : undefined;
    this.bookingState.startBooking(service);
    void this.router.navigate(['/booking']);
  }
}
