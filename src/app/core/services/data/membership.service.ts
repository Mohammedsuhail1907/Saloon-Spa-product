import { Injectable, computed, inject } from '@angular/core';
import { DATA_RESOURCES } from '../../constants/app.constants';
import { MembershipPlan } from '../../models/catalog.model';
import { DATA_PROVIDER } from './data-provider';
import { createDataStore } from './data-store';

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private readonly store = createDataStore<MembershipPlan[]>(
    inject(DATA_PROVIDER),
    DATA_RESOURCES.memberships,
    []
  );

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly plans = this.store.data;
  readonly highlightPlan = computed(() => this.plans().find((p) => p.highlight) ?? this.plans()[0]);

  load(): Promise<void> {
    return this.store.load();
  }
}
