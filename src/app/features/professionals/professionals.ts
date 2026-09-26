import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PROFESSIONAL_TYPES } from '../../core/constants/domain.constants';
import { Professional, ProfessionalType } from '../../core/models/catalog.model';
import { AvailabilityService } from '../../core/services/availability.service';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/config/business-config.service';
import { ContentConfigService } from '../../core/services/config/content-config.service';
import { FeatureConfigService } from '../../core/services/config/feature-config.service';
import { ProfessionalService } from '../../core/services/data/professional.service';
import { ServiceCatalogService } from '../../core/services/data/service-catalog.service';
import { DataState } from '../../shared/components/data-state/data-state';
import { ProfessionalCard } from '../../shared/components/professional-card/professional-card';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

type TypeFilter = 'ALL' | ProfessionalType;

@Component({
  selector: 'app-professionals-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AvatarModule,
    ButtonModule,
    ChipModule,
    DialogModule,
    SelectButtonModule,
    DataState,
    ProfessionalCard,
    RevealDirective,
    PricePipe
  ],
  templateUrl: './professionals.html'
})
export class ProfessionalsPage {
  protected readonly business = inject(BusinessConfigService);
  protected readonly features = inject(FeatureConfigService);
  protected readonly content = inject(ContentConfigService);
  protected readonly professionalService = inject(ProfessionalService);
  private readonly catalog = inject(ServiceCatalogService);
  private readonly availability = inject(AvailabilityService);
  private readonly bookingState = inject(BookingService);
  private readonly router = inject(Router);

  /** Bound from ?pro=<id> via withComponentInputBinding. */
  readonly pro = input<string>();

  protected readonly selectedType = linkedSignal<TypeFilter>(() => 'ALL');

  protected readonly profile = linkedSignal<Professional | null>(() => {
    const id = Number(this.pro());
    return id ? this.professionalService.professionalById(id) ?? null : null;
  });

  constructor() {
    void this.professionalService.load();
    void this.catalog.load();
  }

  protected readonly pageHero = computed(() => this.content.page('professionals'));

  protected readonly typeOptions = computed(() => {
    if (!(this.business.isSalonStaffEnabled() && this.business.isSpaStaffEnabled())) return [];
    return [
      { label: 'Everyone', value: 'ALL' as TypeFilter },
      { label: 'Stylists', value: PROFESSIONAL_TYPES.STYLIST as TypeFilter },
      { label: 'Therapists', value: PROFESSIONAL_TYPES.THERAPIST as TypeFilter }
    ];
  });

  protected readonly filtered = computed(() => {
    const type = this.selectedType();
    return this.professionalService
      .professionals()
      .filter((p) => type === 'ALL' || p.type === type);
  });

  protected readonly profileServices = computed(() => {
    const p = this.profile();
    return p ? this.catalog.servicesOf(p).slice(0, 4) : [];
  });

  protected readonly profileSlots = computed(() => {
    const p = this.profile();
    if (!p) return { dayLabel: '', slots: [] };
    return this.availability.nextAvailable(p.id, 4);
  });

  openProfile(professional: Professional): void {
    this.profile.set(professional);
  }

  closeProfile(): void {
    this.profile.set(null);
    void this.router.navigate([], { queryParams: { pro: null }, queryParamsHandling: 'merge' });
  }

  book(professional: Professional): void {
    this.bookingState.startBooking(undefined, professional);
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

  firstName(name: string): string {
    return name.split(' ')[0];
  }
}
