import { Injectable, computed, inject } from '@angular/core';
import { DATA_RESOURCES } from '../../constants/app.constants';
import { SERVICE_TYPES } from '../../constants/domain.constants';
import { Offer } from '../../models/catalog.model';
import { BusinessConfigService } from '../config/business-config.service';
import { DATA_PROVIDER } from './data-provider';
import { createDataStore } from './data-store';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly business = inject(BusinessConfigService);
  private readonly store = createDataStore<Offer[]>(inject(DATA_PROVIDER), DATA_RESOURCES.offers, []);

  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly offers = computed(() =>
    this.store.data().filter((o) => {
      if (o.type === 'BOTH') return this.business.isSalonEnabled() || this.business.isSpaEnabled();
      return o.type === SERVICE_TYPES.SALON
        ? this.business.isSalonServicesEnabled()
        : this.business.isSpaServicesEnabled();
    })
  );

  load(): Promise<void> {
    return this.store.load();
  }
}
