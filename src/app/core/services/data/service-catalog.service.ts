import { Injectable, computed, inject } from '@angular/core';
import { DATA_RESOURCES } from '../../constants/app.constants';
import { SERVICE_TYPE_FOR_PROFESSIONAL, SERVICE_TYPES } from '../../constants/domain.constants';
import {
  ExperienceAddon,
  ExperienceTag,
  MoodOption,
  Professional,
  Service,
  ServiceCategory,
  ServiceType
} from '../../models/catalog.model';
import { BusinessConfigService } from '../config/business-config.service';
import { DATA_PROVIDER } from './data-provider';
import { combineStores, createDataStore } from './data-store';
import { ProfessionalService } from './professional.service';

/**
 * Treatment catalogue: services, categories, add-ons and mood tags. Everything
 * is pre-filtered by business mode so components never re-implement that.
 */
@Injectable({ providedIn: 'root' })
export class ServiceCatalogService {
  private readonly business = inject(BusinessConfigService);
  private readonly professionalService = inject(ProfessionalService);
  private readonly provider = inject(DATA_PROVIDER);

  private readonly servicesStore = createDataStore<Service[]>(
    this.provider,
    DATA_RESOURCES.services,
    []
  );
  private readonly categoriesStore = createDataStore<ServiceCategory[]>(
    this.provider,
    DATA_RESOURCES.serviceCategories,
    []
  );
  private readonly addonsStore = createDataStore<ExperienceAddon[]>(
    this.provider,
    DATA_RESOURCES.addons,
    []
  );
  private readonly moodsStore = createDataStore<MoodOption[]>(
    this.provider,
    DATA_RESOURCES.moods,
    []
  );

  private readonly core = combineStores(this.servicesStore, this.categoriesStore);

  readonly loading = this.core.loading;
  readonly error = this.core.error;

  readonly services = computed(() =>
    this.servicesStore.data().filter((s) => s.enabled !== false && this.typeEnabled(s.type))
  );
  readonly categories = computed(() =>
    this.categoriesStore.data().filter((c) => this.typeEnabled(c.type))
  );
  readonly popularServices = computed(() => this.services().filter((s) => s.popular));

  /** Moods that have at least one matching service in the current catalogue. */
  readonly moods = computed(() => {
    const tags = new Set(this.services().flatMap((s) => s.tags));
    return this.moodsStore.data().filter((m) => tags.has(m.tag));
  });

  /** Services + categories. Add-ons and moods load on demand. */
  load(): Promise<void> {
    return this.core.load();
  }

  loadAddons(): Promise<void> {
    return this.addonsStore.load();
  }

  loadMoods(): Promise<void> {
    return this.moodsStore.load();
  }

  serviceById(id: number): Service | undefined {
    return this.services().find((s) => s.id === id);
  }

  categoryLabel(categoryId: string): string {
    return this.categories().find((c) => c.id === categoryId)?.label ?? categoryId;
  }

  professionalsFor(service: Service): Professional[] {
    const pros = this.professionalService.professionals();
    return service.professionalIds
      .map((id) => pros.find((p) => p.id === id))
      .filter((p): p is Professional => !!p);
  }

  servicesOf(professional: Professional): Service[] {
    return this.services().filter((s) => s.professionalIds.includes(professional.id));
  }

  servicesByType(type: ServiceType): Service[] {
    return this.services().filter((s) => s.type === type);
  }

  servicesByTag(tag: ExperienceTag, limit = 3): Service[] {
    return this.services()
      .filter((s) => s.tags.includes(tag))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  addonsFor(type: ServiceType): ExperienceAddon[] {
    return this.addonsStore.data().filter((a) => a.appliesTo.includes(type));
  }

  addonsByIds(ids: number[]): ExperienceAddon[] {
    return this.addonsStore.data().filter((a) => ids.includes(a.id));
  }

  /** Which studio a professional's services belong to. */
  serviceTypeOf(professional: Professional): ServiceType {
    return SERVICE_TYPE_FOR_PROFESSIONAL[professional.type];
  }

  /** Quiz / recommendation engine over the live catalogue. */
  recommend(
    tag: ExperienceTag,
    maxDuration: number,
    maxPrice: number
  ): { best: Service | undefined; alternates: Service[] } {
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

  private typeEnabled(type: ServiceType): boolean {
    return type === SERVICE_TYPES.SALON
      ? this.business.isSalonServicesEnabled()
      : this.business.isSpaServicesEnabled();
  }
}
