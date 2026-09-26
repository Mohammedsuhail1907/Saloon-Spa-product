import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import {
  BEFORE_AFTER_CATEGORIES,
  GALLERY_CATEGORIES
} from '../../core/data/gallery.mock';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { CatalogService } from '../../core/services/catalog.service';
import { BeforeAfter } from '../../shared/components/before-after/before-after';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-gallery-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BeforeAfter, RevealDirective],
  templateUrl: './gallery.html'
})
export class GalleryPage {
  protected readonly config = inject(BusinessConfigService);
  protected readonly catalog = inject(CatalogService);

  protected readonly category = signal('All');
  protected readonly baCategory = signal('All');

  protected readonly categories = computed(() => {
    const present = new Set(this.catalog.galleryItems().map((i) => i.category));
    if (this.config.isSalonEnabled()) present.add('Salon');
    if (this.config.isSpaEnabled()) present.add('Spa');
    return GALLERY_CATEGORIES.filter((c) => c === 'All' || present.has(c));
  });

  protected readonly items = computed(() => {
    const cat = this.category();
    return this.catalog.galleryItems().filter((i) => {
      if (cat === 'All') return true;
      if (cat === 'Salon') return i.type === 'SALON';
      if (cat === 'Spa') return i.type === 'SPA';
      return i.category === cat;
    });
  });

  protected readonly baCategories = computed(() => {
    const present = new Set(this.catalog.beforeAfterItems().map((i) => i.category));
    return BEFORE_AFTER_CATEGORIES.filter((c) => c === 'All' || present.has(c));
  });

  protected readonly baItems = computed(() => {
    const cat = this.baCategory();
    return this.catalog
      .beforeAfterItems()
      .filter((i) => cat === 'All' || i.category === cat);
  });
}
