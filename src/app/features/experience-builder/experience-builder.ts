import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { SERVICE_TYPES } from '../../core/constants/domain.constants';
import { Service } from '../../core/models/catalog.model';
import { BookingService } from '../../core/services/booking.service';
import { ContentConfigService } from '../../core/services/config/content-config.service';
import { FeatureConfigService } from '../../core/services/config/feature-config.service';
import { ServiceCatalogService } from '../../core/services/data/service-catalog.service';
import { NotificationService } from '../../core/services/notification.service';
import { BookingSummary } from '../../shared/components/booking-summary/booking-summary';
import { DataState } from '../../shared/components/data-state/data-state';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-experience-builder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    SelectModule,
    BookingSummary,
    DataState,
    RevealDirective,
    PricePipe
  ],
  templateUrl: './experience-builder.html',
  styleUrl: './experience-builder.scss'
})
export class ExperienceBuilderPage {
  protected readonly features = inject(FeatureConfigService);
  protected readonly content = inject(ContentConfigService);
  protected readonly catalog = inject(ServiceCatalogService);
  private readonly bookingState = inject(BookingService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly pageHero = computed(() => this.content.page('packageBuilder'));

  protected readonly base = signal<Service | null>(null);
  protected readonly addOnIds = signal<number[]>([]);

  constructor() {
    void this.catalog.load();
    void this.catalog.loadAddons();
  }

  protected readonly serviceGroups = computed(() =>
    [
      { label: 'Salon', items: this.catalog.servicesByType(SERVICE_TYPES.SALON) },
      { label: 'Spa', items: this.catalog.servicesByType(SERVICE_TYPES.SPA) }
    ].filter((g) => g.items.length)
  );

  protected readonly addons = computed(() => {
    const base = this.base();
    return base ? this.catalog.addonsFor(base.type) : [];
  });

  protected readonly selectedAddons = computed(() =>
    this.addons().filter((a) => this.addOnIds().includes(a.id))
  );

  protected readonly totalPrice = computed(
    () => (this.base()?.price ?? 0) + this.selectedAddons().reduce((t, a) => t + a.price, 0)
  );

  protected readonly totalDuration = computed(
    () =>
      (this.base()?.duration ?? 0) +
      this.selectedAddons().reduce((t, a) => t + a.duration, 0)
  );

  onBaseChange(service: Service | null): void {
    this.base.set(service);
    this.addOnIds.set([]);
  }

  toggleAddon(id: number, checked: boolean): void {
    this.addOnIds.update((ids) => (checked ? [...ids, id] : ids.filter((x) => x !== id)));
  }

  bookExperience(): void {
    const base = this.base();
    if (!base) {
      this.notify.warn('Pick a base treatment first');
      return;
    }
    this.bookingState.startBooking(base);
    this.bookingState.updateDraft({ addOnIds: this.addOnIds() });
    void this.router.navigate(['/booking']);
  }
}
