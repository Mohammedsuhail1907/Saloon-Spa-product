import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { MoodOption, Professional, Service } from '../../core/models/catalog.model';
import { AvailabilityService } from '../../core/services/availability.service';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { CatalogService } from '../../core/services/catalog.service';
import { BeforeAfter } from '../../shared/components/before-after/before-after';
import { ProfessionalCard } from '../../shared/components/professional-card/professional-card';
import { ServiceCard } from '../../shared/components/service-card/service-card';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

interface JourneyStep {
  n: string;
  title: string;
  detail: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonModule,
    TagModule,
    CarouselModule,
    TimelineModule,
    ServiceCard,
    ProfessionalCard,
    BeforeAfter,
    RevealDirective,
    PricePipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  protected readonly config = inject(BusinessConfigService);
  protected readonly catalog = inject(CatalogService);
  private readonly availability = inject(AvailabilityService);
  private readonly bookingState = inject(BookingService);
  private readonly router = inject(Router);

  protected readonly selectedMood = signal<MoodOption | null>(null);

  protected readonly featuredServices = computed(() => {
    const services = this.catalog.services();
    const popular = services.filter((s) => s.popular);
    return (popular.length >= 6 ? popular : services).slice(0, 6);
  });

  protected readonly featuredProfessionals = computed(() =>
    this.catalog.professionals().slice(0, 4)
  );

  protected readonly moodServices = computed(() => {
    const mood = this.selectedMood();
    return mood ? this.catalog.servicesByTag(mood.tag, 3) : [];
  });

  protected readonly featuredOffers = computed(() => this.catalog.offers().slice(0, 3));

  protected readonly firstBeforeAfter = computed(
    () => this.catalog.beforeAfterItems()[0]
  );

  protected readonly highlightPlan = computed(
    () =>
      this.catalog.membershipPlans().find((p) => p.highlight) ??
      this.catalog.membershipPlans()[0]
  );

  protected readonly stories = computed(() => this.catalog.stories());

  protected readonly journey: JourneyStep[] = [
    { n: '01', title: 'Arrive', detail: 'Warm towels, herbal tea and a moment to land.', icon: 'pi pi-map-marker' },
    { n: '02', title: 'Relax', detail: 'Your consultation happens at your pace, not ours.', icon: 'pi pi-moon' },
    { n: '03', title: 'Transform', detail: 'Expert hands, premium products, unhurried care.', icon: 'pi pi-sparkles' },
    { n: '04', title: 'Glow', detail: 'The mirror moment — styled, polished, radiant.', icon: 'pi pi-sun' },
    { n: '05', title: 'Leave Renewed', detail: 'Home rituals and your next visit, planned.', icon: 'pi pi-heart' }
  ];

  /* ----- “Today’s studio” (sample data, clearly labelled in the UI) ----- */

  protected readonly isOpenNow = computed(() => {
    const rules = this.config.bookingRules();
    const now = new Date();
    if (rules.closedWeekdays.includes(now.getDay())) return false;
    return now.getHours() >= rules.openingHour && now.getHours() < rules.closingHour;
  });

  protected readonly studios = computed(() => {
    const list: { name: string; detail: string; icon: string }[] = [];
    if (this.config.isSalonEnabled()) {
      list.push(
        { name: 'Hair Studio', detail: '3 professionals available', icon: 'pi pi-sparkles' },
        { name: 'Nail Studio', detail: '1 slot available', icon: 'pi pi-star' }
      );
    }
    if (this.config.isSpaEnabled()) {
      list.push({ name: 'Spa Suites', detail: '2 rooms available', icon: 'pi pi-moon' });
    }
    return list;
  });

  protected readonly nextSlotLabel = computed(
    () => this.availability.nextAvailable(0, 1).slots[0]?.label ?? 'tomorrow morning'
  );

  /* ------------------------------ actions ------------------------------ */

  selectMood(mood: MoodOption): void {
    this.selectedMood.update((m) => (m?.id === mood.id ? null : mood));
  }

  bookService(service: Service): void {
    this.bookingState.startBooking(service);
    void this.router.navigate(['/booking']);
  }

  bookProfessional(professional: Professional): void {
    this.bookingState.startBooking(undefined, professional);
    void this.router.navigate(['/booking']);
  }

  viewService(service: Service): void {
    void this.router.navigate(['/services'], { queryParams: { service: service.id } });
  }

  viewProfessional(professional: Professional): void {
    void this.router.navigate(['/professionals'], { queryParams: { pro: professional.id } });
  }

  go(path: string): void {
    void this.router.navigate([path]);
  }
}
