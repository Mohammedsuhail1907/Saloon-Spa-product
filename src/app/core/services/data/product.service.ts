import { Injectable, inject } from '@angular/core';
import { DATA_RESOURCES } from '../../constants/app.constants';
import { ExperienceTag, Product } from '../../models/catalog.model';
import { DATA_PROVIDER } from './data-provider';
import { createDataStore } from './data-store';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly store = createDataStore<Product[]>(
    inject(DATA_PROVIDER),
    DATA_RESOURCES.products,
    []
  );

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly products = this.store.data;

  load(): Promise<void> {
    return this.store.load();
  }

  productsForTags(tags: ExperienceTag[], limit = 4): Product[] {
    return this.products()
      .filter((p) => p.forTags.some((t) => tags.includes(t)))
      .slice(0, limit);
  }
}
