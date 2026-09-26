import { Injectable, computed, inject } from '@angular/core';
import { EXPERIENCE_ADDONS, MOOD_OPTIONS } from '../data/experience.mock';
import {
  BEFORE_AFTER_ITEMS,
  CUSTOMER_STORIES,
  GALLERY_ITEMS
} from '../data/gallery.mock';
import { MEMBERSHIP_PLANS } from '../data/membership.mock';
import { OFFERS } from '../data/offers.mock';
import { PRODUCTS } from '../data/products.mock';
import { PROFESSIONALS } from '../data/professionals.mock';
import { SERVICES, SERVICE_CATEGORIES } from '../data/services.mock';
import {
  ExperienceAddon,
  ExperienceTag,
  Professional,
  Service,
  ServiceType
} from '../models/catalog.model';
import { BusinessConfigService } from './business-config.service';

/**
 * Catalogue facade over the mock data layer. Everything is filtered by the
 * business configuration here, so components never re-implement mode logic.
 * Swap the mock constants for API calls to go live.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly config = inject(BusinessConfigService);

  private typeEnabled(type: ServiceType): boolean {
    return type === 'SALON'
      ? this.config.isSalonServicesEnabled()
      : this.config.isSpaServicesEnabled();
  }

  readonly services = computed(() => SERVICES.filter((s) => this.typeEnabled(s.type)));

  readonly categories = computed(() =>
    SERVICE_CATEGORIES.filter((c) => this.typeEnabled(c.type))
  );

  readonly professionals = computed(() =>
    PROFESSIONALS.filter((p) =>
      p.type === 'SALON'
        ? this.config.isSalonStaffEnabled()
        : this.config.isSpaStaffEnabled()
    )
  );

  readonly popularServices = computed(() => this.services().filter((s) => s.popular));

  readonly moods = computed(() => {
    const tags = new Set(this.services().flatMap((s) => s.tags));
    return MOOD_OPTIONS.filter((m) => tags.has(m.tag));
  });

  readonly offers = computed(() =>
    OFFERS.filter((o) =>
      o.type === 'BOTH'
        ? this.config.isSalonEnabled() || this.config.isSpaEnabled()
        : this.typeEnabled(o.type)
    )
  );

  readonly membershipPlans = computed(() => MEMBERSHIP_PLANS);

  readonly galleryItems = computed(() =>
    GALLERY_ITEMS.filter((g) => {
      if (g.type === 'BOTH') return true;
      return g.type === 'SALON' ? this.config.isSalonEnabled() : this.config.isSpaEnabled();
    })
  );

  readonly beforeAfterItems = computed(() =>
    this.config.isSalonEnabled() ? BEFORE_AFTER_ITEMS : []
  );

  readonly stories = computed(() =>
    CUSTOMER_STORIES.filter((s) =>
      s.type === 'SALON' ? this.config.isSalonEnabled() : this.config.isSpaEnabled()
    )
  );

  readonly products = computed(() => PRODUCTS);

  serviceById(id: number): Service | undefined {
    return this.services().find((s) => s.id === id);
  }

  professionalById(id: number): Professional | undefined {
    return this.professionals().find((p) => p.id === id);
  }

  professionalsFor(service: Service): Professional[] {
    const pros = this.professionals();
    return service.professionalIds
      .map((id) => pros.find((p) => p.id === id))
      .filter((p): p is Professional => !!p);
  }

  servicesOf(professional: Professional): Service[] {
    return this.services().filter((s) => s.professionalIds.includes(professional.id));
  }

  servicesByTag(tag: ExperienceTag, limit = 3): Service[] {
    return this.services()
      .filter((s) => s.tags.includes(tag))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  addonsFor(type: ServiceType): ExperienceAddon[] {
    return EXPERIENCE_ADDONS.filter((a) => a.appliesTo.includes(type));
  }

  productsForTags(tags: ExperienceTag[], limit = 4) {
    return this.products()
      .filter((p) => p.forTags.some((t) => tags.includes(t)))
      .slice(0, limit);
  }

  /** Quiz / recommendation engine — rules live in quiz.mock.ts. */
  recommend(tag: ExperienceTag, maxDuration: number, maxPrice: number): {
    best: Service | undefined;
    alternates: Service[];
  } {
    const matches = this.services()
      .filter((s) => s.tags.includes(tag) && s.duration <= maxDuration && s.price <= maxPrice)
      .sort((a, b) => b.rating - a.rating || b.price - a.price);
    const relaxed = matches.length
      ? matches
      : this.services()
          .filter((s) => s.tags.includes(tag))
          .sort((a, b) => a.price - b.price);
    return { best: relaxed[0], alternates: relaxed.slice(1, 3) };
  }
}
