import { Injectable, computed, inject } from '@angular/core';
import { DATA_RESOURCES } from '../../constants/app.constants';
import { PROFESSIONAL_TYPES } from '../../constants/domain.constants';
import { Professional } from '../../models/catalog.model';
import { BusinessConfigService } from '../config/business-config.service';
import { DATA_PROVIDER } from './data-provider';
import { createDataStore } from './data-store';

/** Stylists and therapists, filtered by which studios the client runs. */
@Injectable({ providedIn: 'root' })
export class ProfessionalService {
  private readonly business = inject(BusinessConfigService);
  private readonly store = createDataStore<Professional[]>(
    inject(DATA_PROVIDER),
    DATA_RESOURCES.professionals,
    []
  );

  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly professionals = computed(() =>
    this.store.data().filter((p) => p.enabled !== false && this.typeEnabled(p))
  );
  readonly stylists = computed(() =>
    this.professionals().filter((p) => p.type === PROFESSIONAL_TYPES.STYLIST)
  );
  readonly therapists = computed(() =>
    this.professionals().filter((p) => p.type === PROFESSIONAL_TYPES.THERAPIST)
  );

  load(): Promise<void> {
    return this.store.load();
  }

  professionalById(id: number): Professional | undefined {
    return this.professionals().find((p) => p.id === id);
  }

  private typeEnabled(p: Professional): boolean {
    return p.type === PROFESSIONAL_TYPES.STYLIST
      ? this.business.isSalonStaffEnabled()
      : this.business.isSpaStaffEnabled();
  }
}
