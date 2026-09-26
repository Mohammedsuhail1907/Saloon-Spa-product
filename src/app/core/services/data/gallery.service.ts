import { Injectable, computed, inject } from '@angular/core';
import { DATA_RESOURCES } from '../../constants/app.constants';
import { SERVICE_TYPES } from '../../constants/domain.constants';
import { GalleryData } from '../../models/catalog.model';
import { BusinessConfigService } from '../config/business-config.service';
import { FeatureConfigService } from '../config/feature-config.service';
import { DATA_PROVIDER } from './data-provider';
import { createDataStore } from './data-store';

const EMPTY: GalleryData = { categories: [], items: [], beforeAfterCategories: [], beforeAfter: [] };

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly business = inject(BusinessConfigService);
  private readonly features = inject(FeatureConfigService);
  private readonly store = createDataStore<GalleryData>(
    inject(DATA_PROVIDER),
    DATA_RESOURCES.gallery,
    EMPTY
  );

  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly items = computed(() =>
    this.store.data().items.filter((g) => {
      if (g.type === 'BOTH') return true;
      return g.type === SERVICE_TYPES.SALON
        ? this.business.isSalonEnabled()
        : this.business.isSpaEnabled();
    })
  );

  /** Configured categories that still have at least one visible item. */
  readonly categories = computed(() => {
    const present = new Set(this.items().map((i) => i.category));
    if (this.business.isSalonEnabled()) present.add('Salon');
    if (this.business.isSpaEnabled()) present.add('Spa');
    return this.store.data().categories.filter((c) => c === 'All' || present.has(c));
  });

  readonly beforeAfter = computed(() =>
    this.features.isBeforeAfterEnabled()
      ? this.store.data().beforeAfter.filter((b) =>
          b.type === SERVICE_TYPES.SALON
            ? this.business.isSalonEnabled()
            : this.business.isSpaEnabled()
        )
      : []
  );

  readonly beforeAfterCategories = computed(() => {
    const present = new Set(this.beforeAfter().map((i) => i.category));
    return this.store.data().beforeAfterCategories.filter((c) => c === 'All' || present.has(c));
  });

  load(): Promise<void> {
    return this.store.load();
  }
}
