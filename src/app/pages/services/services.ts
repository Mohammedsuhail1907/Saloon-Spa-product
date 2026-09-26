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
import { Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { Service } from '../../core/models/catalog.model';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { CatalogService } from '../../core/services/catalog.service';
import { ServiceCard } from '../../shared/components/service-card/service-card';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

type TypeFilter = 'ALL' | 'SALON' | 'SPA';

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
    ServiceCard,
    RevealDirective,
    PricePipe
  ],
  templateUrl: './services.html'
})
export class ServicesPage {
  protected readonly config = inject(BusinessConfigService);
  protected readonly catalog = inject(CatalogService);
  private readonly bookingState = inject(BookingService);
  private readonly router = inject(Router);

  /** Bound from query params via withComponentInputBinding. */
  readonly type = input<string>();
  readonly service = input<string>();

  protected readonly search = signal('');
  protected readonly selectedCategory = signal('all');

  protected readonly selectedType = linkedSignal<TypeFilter>(() => {
    const t = this.type()?.toUpperCase();
    return t === 'SALON' || t === 'SPA' ? t : 'ALL';
  });

  /** Service opened in the detail dialog (auto-opens from ?service=<id>). */
  protected readonly detail = linkedSignal<Service | null>(() => {
    const id = Number(this.service());
    return id ? this.catalog.serviceById(id) ?? null : null;
  });

  protected readonly typeOptions = computed(() => {
    if (!this.config.isBothEnabled()) return [];
    return [
      { label: 'All', value: 'ALL' as TypeFilter },
      { label: 'Salon', value: 'SALON' as TypeFilter },
      { label: 'Spa', value: 'SPA' as TypeFilter }
    ];
  });

  protected readonly categories = computed(() => {
    const type = this.selectedType();
    return this.catalog
      .categories()
      .filter((c) => type === 'ALL' || c.type === type);
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
    return s ? this.catalog.addonsFor(s.type).slice(0, 3) : [];
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
