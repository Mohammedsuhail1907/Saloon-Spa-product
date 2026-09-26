import { Injectable, computed, inject } from '@angular/core';
import { DATA_RESOURCES } from '../../constants/app.constants';
import { SERVICE_TYPES } from '../../constants/domain.constants';
import { GiftCardData } from '../../models/catalog.model';
import { BusinessConfigService } from '../config/business-config.service';
import { DATA_PROVIDER } from './data-provider';
import { createDataStore } from './data-store';

const EMPTY: GiftCardData = { amounts: [], minimumAmount: 0, maximumAmount: 0, experiences: [] };

@Injectable({ providedIn: 'root' })
export class GiftCardService {
  private readonly business = inject(BusinessConfigService);
  private readonly store = createDataStore<GiftCardData>(
    inject(DATA_PROVIDER),
    DATA_RESOURCES.giftCards,
    EMPTY
  );

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly amounts = computed(() => this.store.data().amounts);
  readonly minimumAmount = computed(() => this.store.data().minimumAmount);
  readonly maximumAmount = computed(() => this.store.data().maximumAmount);

  /** Only experiences the client can actually deliver. */
  readonly experiences = computed(() =>
    this.store.data().experiences.filter((e) => {
      if (e.type === 'BOTH') return this.business.isBothEnabled();
      return e.type === SERVICE_TYPES.SALON
        ? this.business.isSalonEnabled()
        : this.business.isSpaEnabled();
    })
  );

  load(): Promise<void> {
    return this.store.load();
  }
}
