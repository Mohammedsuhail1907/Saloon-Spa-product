import { Injectable, computed, inject } from '@angular/core';
import { DATA_RESOURCES } from '../../constants/app.constants';
import { SERVICE_TYPES } from '../../constants/domain.constants';
import { CustomerStory } from '../../models/catalog.model';
import { BusinessConfigService } from '../config/business-config.service';
import { DATA_PROVIDER } from './data-provider';
import { createDataStore } from './data-store';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly business = inject(BusinessConfigService);
  private readonly store = createDataStore<CustomerStory[]>(
    inject(DATA_PROVIDER),
    DATA_RESOURCES.reviews,
    []
  );

  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly stories = computed(() =>
    this.store.data().filter((s) =>
      s.type === SERVICE_TYPES.SALON ? this.business.isSalonEnabled() : this.business.isSpaEnabled()
    )
  );

  readonly averageRating = computed(() => {
    const list = this.stories();
    if (!list.length) return null;
    const avg = list.reduce((t, s) => t + s.rating, 0) / list.length;
    return Math.round(avg * 10) / 10;
  });

  load(): Promise<void> {
    return this.store.load();
  }
}
