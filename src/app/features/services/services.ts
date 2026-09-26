import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { SERVICE_TYPES } from '../../core/constants/domain.constants';
import { Service, ServiceType } from '../../core/models/catalog.model';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/config/business-config.service';
import { ContentConfigService } from '../../core/services/config/content-config.service';
import { FeatureConfigService } from '../../core/services/config/feature-config.service';
import { ProfessionalService } from '../../core/services/data/professional.service';
import { ServiceCatalogService } from '../../core/services/data/service-catalog.service';
import { DataState } from '../../shared/components/data-state/data-state';
import { ServiceCard } from '../../shared/components/service-card/service-card';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

type TypeFilter = 'ALL' | ServiceType;

/**
 * Service catalogue. Also serves /salon and /spa: the route's `data.type`
 * pins the studio filter so one component covers all three destinations.
 */
@Component({
  selector: 'app-services-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AvatarModule,
    ButtonModule,
    ChipModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectButtonModule,
    TagModule,
    DataState,
    ServiceCard,
    RevealDirective,
    PricePipe
  ],
  templateUrl: './services.html'
})
export class ServicesPage {
  protected readonly business = inject(BusinessConfigService);
  protected readonly features = inject(FeatureConfigService);
  protected readonly content = inject(ContentConfigService);
  protected readonly catalog = inject(ServiceCatalogService);
  private readonly professionalService = inject(ProfessionalService);
  private readonly bookingState = inject(BookingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Bound from query params via withComponentInputBinding. */
  readonly type = input<string>();
  readonly service = input<string>();

  /** Studio pinned by the route (/salon, /spa); undefined on /services. */
  private readonly routeType = toSignal(
    this.route.data.pipe(map((d) => d['type'] as ServiceType | undefined)),
    { initialValue: undefined }
  );

  protected readonly search = signal('');
  protected readonly selectedCategory = signal('all');

  protected readonly selectedType = linkedSignal<TypeFilter>(() => {
    const t = (this.routeType() ?? this.type())?.toUpperCase();
    return t === SERVICE_TYPES.SALON || t === SERVICE_TYPES.SPA ? t : 'ALL';
  });

  /** Service opened in the detail dialog (auto-opens from ?service=<id>). */
  protected readonly detail = linkedSignal<Service | null>(() => {
    const id = Number(this.service());
    return id ? this.catalog.serviceById(id) ?? null : null;
  });

  constructor() {
    void this.catalog.load();
    if (this.features.isPackagesEnabled()) void this.catalog.loadAddons();
    if (this.business.isAnyStaffEnabled()) void this.professionalService.load();
  }

  protected readonly pageHero = computed(() => {
    const fixed = this.routeType();
    if (fixed === SERVICE_TYPES.SALON) return { ...this.content.page('services'), title: 'Salon' };
    if (fixed === SERVICE_TYPES.SPA) return { ...this.content.page('services'), title: 'Spa' };
    return this.content.page('services');
  });

  /** Studio toggle only when both studios exist and the route isn't pinned. */
  protected readonly typeOptions = computed(() => {
    if (this.routeType() || !this.business.isBothEnabled()) return [];
    return [
      { label: 'All', value: 'ALL' as TypeFilter },
      { label: 'Salon', value: SERVICE_TYPES.SALON as TypeFilter },
      { label: 'Spa', value: SERVICE_TYPES.SPA as TypeFilter }
    ];
  });

  protected readonly categories = computed(() => {
    const type = this.selectedType();
    return this.catalog.categories().filter((c) => type === 'ALL' || c.type === type);
  });

  protected readonly filtered = computed(() => {
    const type = this.selectedType();
    const category = this.selectedCategory();
    const term = this.search().trim().toLowerCase();
    return this.catalog.services().filter((s) => {
      if (type !== 'ALL' && s.type !== type) return false;
      if (category !== 'all' && s.category !== category) return false;
      if (term && !`${s.name} ${s.description}`.toLowerCase().includes(term)) return false;
      return true;
    });
  });

  protected readonly detailProfessionals = computed(() => {
    const s = this.detail();
    return s ? this.catalog.professionalsFor(s) : [];
  });

  protected readonly detailAddons = computed(() => {
    const s = this.detail();
    return s && this.features.isPackagesEnabled() ? this.catalog.addonsFor(s.type).slice(0, 3) : [];
  });

  onTypeChange(type: TypeFilter): void {
    this.selectedType.set(type);
    this.selectedCategory.set('all');
  }

  openDetail(service: Service): void {
    this.detail.set(service);
  }

  closeDetail(): void {
    this.detail.set(null);
    // Drop the ?service param so re-opening from a stale URL doesn't stick.
    void this.router.navigate([], { queryParams: { service: null }, queryParamsHandling: 'merge' });
  }

  book(service: Service): void {
    this.bookingState.startBooking(service);
    void this.router.navigate(['/booking']);
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
