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
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { Service } from '../../core/models/catalog.model';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { CatalogService } from '../../core/services/catalog.service';
import { NotificationService } from '../../core/services/notification.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-experience-builder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    CheckboxModule,
    DividerModule,
    SelectModule,
    RevealDirective,
    PricePipe
  ],
  templateUrl: './experience-builder.html'
})
export class ExperienceBuilderPage {
  protected readonly config = inject(BusinessConfigService);
  protected readonly catalog = inject(CatalogService);
  private readonly bookingState = inject(BookingService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly base = signal<Service | null>(null);
  protected readonly addOnIds = signal<number[]>([]);

  protected readonly serviceGroups = computed(() => {
    const services = this.catalog.services();
    return [
      { label: 'Salon', items: services.filter((s) => s.type === 'SALON') },
      { label: 'Spa', items: services.filter((s) => s.type === 'SPA') }
    ].filter((g) => g.items.length);
  });

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
