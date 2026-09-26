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
import { FeatureConfigService } from '../../../core/services/config/feature-config.service';

@Component({
  selector: 'app-professional-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarModule, ButtonModule, ChipModule],
  templateUrl: './professional-card.html',
  styleUrl: './professional-card.scss'
})
export class ProfessionalCard {
  private readonly availability = inject(AvailabilityService);
  private readonly features = inject(FeatureConfigService);

  readonly professional = input.required<Professional>();
  readonly profile = output<Professional>();
  readonly book = output<Professional>();

  readonly bookingEnabled = computed(() => this.features.isBookingEnabled());
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
