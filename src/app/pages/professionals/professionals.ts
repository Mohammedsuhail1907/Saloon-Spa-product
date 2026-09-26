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
import { Professional } from '../../core/models/catalog.model';
import { AvailabilityService } from '../../core/services/availability.service';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ProfessionalCard } from '../../shared/components/professional-card/professional-card';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

type TypeFilter = 'ALL' | 'SALON' | 'SPA';

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
    ProfessionalCard,
    RevealDirective,
    PricePipe
  ],
  templateUrl: './professionals.html'
})
export class ProfessionalsPage {
  protected readonly config = inject(BusinessConfigService);
  protected readonly catalog = inject(CatalogService);
  private readonly availability = inject(AvailabilityService);
  private readonly bookingState = inject(BookingService);
  private readonly router = inject(Router);

  /** Bound from ?pro=<id> via withComponentInputBinding. */
  readonly pro = input<string>();

  protected readonly selectedType = linkedSignal<TypeFilter>(() => 'ALL');

  protected readonly profile = linkedSignal<Professional | null>(() => {
    const id = Number(this.pro());
    return id ? this.catalog.professionalById(id) ?? null : null;
  });

  protected readonly typeOptions = computed(() => {
    if (!(this.config.isSalonStaffEnabled() && this.config.isSpaStaffEnabled())) return [];
    return [
      { label: 'Everyone', value: 'ALL' as TypeFilter },
      { label: 'Stylists', value: 'SALON' as TypeFilter },
      { label: 'Therapists', value: 'SPA' as TypeFilter }
    ];
  });

  protected readonly filtered = computed(() => {
    const type = this.selectedType();
    return this.catalog
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
