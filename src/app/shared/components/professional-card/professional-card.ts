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
  template: `
    <article class="pro-card">
      <div class="pro-card__top">
        <p-avatar
          [label]="initials()"
          shape="circle"
          size="xlarge"
          styleClass="pro-avatar {{ professional().palette }}"
        />
        <div class="pro-card__id">
          <h3 class="pro-card__name">{{ professional().name }}</h3>
          <p class="pro-card__role">{{ professional().role }}</p>
          <p class="pro-card__stats">
            <span>{{ professional().experienceYears }} yrs experience</span>
            <span class="rating-inline"
              ><i class="pi pi-star-fill"></i>{{ professional().rating }}</span
            >
          </p>
        </div>
      </div>

      <div class="pro-card__specialties">
        @for (s of professional().specialties; track s) {
          <p-chip [label]="s" styleClass="soft-chip" />
        }
      </div>

      <div class="pro-card__avail">
        @if (next().slots.length) {
          <span class="pro-card__avail-label">
            <i class="pi pi-circle-fill dot-open"></i>Available {{ next().dayLabel.toLowerCase() }}
          </span>
          <div class="pro-card__slots">
            @for (slot of next().slots; track slot.time) {
              <span class="slot-chip slot-chip--mini">{{ slot.label }}</span>
            }
          </div>
        } @else {
          <span class="pro-card__avail-label muted">Fully booked this week</span>
        }
      </div>

      <div class="pro-card__actions">
        <p-button label="View Profile" [text]="true" size="small" (onClick)="profile.emit(professional())" />
        @if (bookingEnabled()) {
          <p-button
            label="Book with {{ firstName() }}"
            [rounded]="true"
            size="small"
            (onClick)="book.emit(professional())"
          />
        }
      </div>
    </article>
  `
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
