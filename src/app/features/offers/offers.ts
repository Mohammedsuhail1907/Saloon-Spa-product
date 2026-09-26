import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Offer } from '../../core/models/catalog.model';
import { BookingService } from '../../core/services/booking.service';
import { ContentConfigService } from '../../core/services/config/content-config.service';
import { FeatureConfigService } from '../../core/services/config/feature-config.service';
import { OfferService } from '../../core/services/data/offer.service';
import { ServiceCatalogService } from '../../core/services/data/service-catalog.service';
import { DataState } from '../../shared/components/data-state/data-state';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-offers-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, TagModule, DataState, RevealDirective, PricePipe],
  templateUrl: './offers.html'
})
export class OffersPage {
  protected readonly features = inject(FeatureConfigService);
  protected readonly content = inject(ContentConfigService);
  protected readonly offerService = inject(OfferService);
  private readonly catalog = inject(ServiceCatalogService);
  private readonly bookingState = inject(BookingService);
  private readonly router = inject(Router);

  protected readonly pageHero = computed(() => this.content.page('offers'));

  constructor() {
    void this.offerService.load();
    // Needed to preselect the offer's service when booking.
    if (this.features.isBookingEnabled()) void this.catalog.load();
  }

  book(offer: Offer): void {
    const service = offer.serviceId ? this.catalog.serviceById(offer.serviceId) : undefined;
    this.bookingState.startBooking(service);
    void this.router.navigate(['/booking']);
  }
}
