import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SERVICE_TYPES } from '../../core/constants/domain.constants';
import { ContentConfigService } from '../../core/services/config/content-config.service';
import { FeatureConfigService } from '../../core/services/config/feature-config.service';
import { GalleryService } from '../../core/services/data/gallery.service';
import { BeforeAfter } from '../../shared/components/before-after/before-after';
import { DataState } from '../../shared/components/data-state/data-state';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-gallery-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BeforeAfter, DataState, RevealDirective],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss'
})
export class GalleryPage {
  protected readonly features = inject(FeatureConfigService);
  protected readonly content = inject(ContentConfigService);
  protected readonly gallery = inject(GalleryService);

  protected readonly category = signal('All');
  protected readonly baCategory = signal('All');

  protected readonly pageHero = computed(() => this.content.page('gallery'));

  constructor() {
    void this.gallery.load();
  }

  protected readonly items = computed(() => {
    const cat = this.category();
    return this.gallery.items().filter((i) => {
      if (cat === 'All') return true;
      if (cat === 'Salon') return i.type === SERVICE_TYPES.SALON;
      if (cat === 'Spa') return i.type === SERVICE_TYPES.SPA;
      return i.category === cat;
    });
  });

  protected readonly baItems = computed(() => {
    const cat = this.baCategory();
    return this.gallery.beforeAfter().filter((i) => cat === 'All' || i.category === cat);
  });
}
