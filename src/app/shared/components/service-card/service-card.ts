import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Service } from '../../../core/models/catalog.model';
import { BookingService } from '../../../core/services/booking.service';
import { BusinessConfigService } from '../../../core/services/business-config.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-service-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarModule, AvatarGroupModule, ButtonModule, TagModule, TooltipModule, PricePipe],
  templateUrl: './service-card.html',
  styleUrl: './service-card.scss'
})
export class ServiceCard {
  private readonly catalog = inject(CatalogService);
  private readonly bookingState = inject(BookingService);
  private readonly config = inject(BusinessConfigService);
  private readonly notify = inject(NotificationService);

  readonly service = input.required<Service>();
  readonly view = output<Service>();
  readonly book = output<Service>();

  readonly bookingEnabled = computed(() => this.config.isBookingEnabled());
  readonly professionals = computed(() => this.catalog.professionalsFor(this.service()));
  readonly isFavorite = computed(() =>
    this.bookingState.favorites().includes(this.service().id)
  );
  readonly categoryLabel = computed(
    () =>
      this.catalog.categories().find((c) => c.id === this.service().category)?.label ??
      this.service().category
  );

  initials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  onFavorite(): void {
    const added = this.bookingState.toggleFavorite(this.service().id);
    added
      ? this.notify.success('Added to favourites', this.service().name)
      : this.notify.info('Removed from favourites', this.service().name);
  }
}
