import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { Professional } from '../../../core/models/catalog.model';
import { AvailabilityService } from '../../../core/services/availability.service';
import { BusinessConfigService } from '../../../core/services/business-config.service';

@Component({
  selector: 'app-professional-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarModule, ButtonModule, ChipModule],
  templateUrl: './professional-card.html',
  styleUrl: './professional-card.scss'
})
export class ProfessionalCard {
  private readonly availability = inject(AvailabilityService);
  private readonly config = inject(BusinessConfigService);

  readonly professional = input.required<Professional>();
  readonly profile = output<Professional>();
  readonly book = output<Professional>();

  readonly bookingEnabled = computed(() => this.config.isBookingEnabled());
  readonly next = computed(() => this.availability.nextAvailable(this.professional().id));
  readonly firstName = computed(() => this.professional().name.split(' ')[0]);
  readonly initials = computed(() =>
    this.professional()
      .name.split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  );
}
