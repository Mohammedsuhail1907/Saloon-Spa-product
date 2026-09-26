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
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { MoodOption, Professional, Service } from '../../core/models/catalog.model';
import { AvailabilityService } from '../../core/services/availability.service';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/config/business-config.service';
import { ContentConfigService } from '../../core/services/config/content-config.service';
import { FeatureConfigService } from '../../core/services/config/feature-config.service';
import { GalleryService } from '../../core/services/data/gallery.service';
import { MembershipService } from '../../core/services/data/membership.service';
import { OfferService } from '../../core/services/data/offer.service';
import { ProfessionalService } from '../../core/services/data/professional.service';
import { ReviewService } from '../../core/services/data/review.service';
import { ServiceCatalogService } from '../../core/services/data/service-catalog.service';
import { BeforeAfter } from '../../shared/components/before-after/before-after';
import { ProfessionalCard } from '../../shared/components/professional-card/professional-card';
import { ServiceCard } from '../../shared/components/service-card/service-card';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonModule,
    TagModule,
    CarouselModule,
    SkeletonModule,
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
  protected readonly business = inject(BusinessConfigService);
  protected readonly features = inject(FeatureConfigService);
  protected readonly copy = inject(ContentConfigService);
  protected readonly catalog = inject(ServiceCatalogService);
  protected readonly professionalService = inject(ProfessionalService);
  protected readonly offerService = inject(OfferService);
  protected readonly membershipService = inject(MembershipService);
  protected readonly reviewService = inject(ReviewService);
  private readonly galleryService = inject(GalleryService);
  private readonly availability = inject(AvailabilityService);
  private readonly bookingState = inject(BookingService);
  private readonly router = inject(Router);

  protected readonly selectedMood = signal<MoodOption | null>(null);

  constructor() {
    // Only fetch what this client's configuration will actually render.
    void this.catalog.load();
    if (this.business.isAnyStaffEnabled()) void this.professionalService.load();
    if (this.features.isRecommendationsEnabled()) void this.catalog.loadMoods();
    if (this.features.isOffersEnabled()) void this.offerService.load();
    if (this.features.isMembershipEnabled()) void this.membershipService.load();
    if (this.features.isReviewsEnabled()) void this.reviewService.load();
    if (this.features.isBeforeAfterEnabled()) void this.galleryService.load();
  }

  protected readonly featuredServices = computed(() => {
    const services = this.catalog.services();
    const popular = services.filter((s) => s.popular);
    return (popular.length >= 6 ? popular : services).slice(0, 6);
  });

  protected readonly featuredProfessionals = computed(() =>
    this.professionalService.professionals().slice(0, 4)
  );

  protected readonly moodServices = computed(() => {
    const mood = this.selectedMood();
    return mood ? this.catalog.servicesByTag(mood.tag, 3) : [];
  });

  protected readonly featuredOffers = computed(() => this.offerService.offers().slice(0, 3));

  protected readonly firstBeforeAfter = computed(() => this.galleryService.beforeAfter()[0]);

  protected readonly highlightPlan = computed(() => this.membershipService.highlightPlan());

  protected readonly stories = computed(() => this.reviewService.stories());

  protected readonly averageRating = computed(() => this.reviewService.averageRating());

  /* ----- “Today’s studio” (sample data, clearly labelled in the UI) ----- */

  protected readonly isOpenNow = computed(() => this.availability.isOpenNow());

  protected readonly studios = computed(() => {
    const list: { name: string; detail: string; icon: string }[] = [];
    if (this.business.isSalonEnabled()) {
      list.push({
        name: 'Salon',
        detail: `${this.professionalService.stylists().length} professionals available`,
        icon: 'pi pi-sparkles'
      });
    }
    if (this.business.isSpaEnabled()) {
      list.push({
        name: 'Spa',
        detail: `${this.professionalService.therapists().length} therapists available`,
        icon: 'pi pi-moon'
      });
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
