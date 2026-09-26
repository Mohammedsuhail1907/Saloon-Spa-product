import { Injectable, computed, inject, signal } from '@angular/core';
import { BUSINESS_MODES } from '../../constants/domain.constants';
import {
  ContentConfig,
  ContentPageKey,
  DEFAULT_CONTENT_CONFIG,
  PageHeroContent
} from '../../models/content-config.model';
import { BusinessConfigService } from './business-config.service';

const MODE_SERVICES_LABEL = {
  [BUSINESS_MODES.SALON_ONLY]: 'Services',
  [BUSINESS_MODES.SPA_ONLY]: 'Experiences',
  [BUSINESS_MODES.SALON_AND_SPA]: 'Services'
} as const;

const MODE_PROFESSIONALS_LABEL = {
  [BUSINESS_MODES.SALON_ONLY]: 'Stylists',
  [BUSINESS_MODES.SPA_ONLY]: 'Therapists',
  [BUSINESS_MODES.SALON_AND_SPA]: 'Professionals'
} as const;

const MODE_HERO_WORDS = {
  [BUSINESS_MODES.SALON_ONLY]: ['BEAUTY.', 'STYLE.', 'YOU.'],
  [BUSINESS_MODES.SPA_ONLY]: ['CALM.', 'WELLNESS.', 'YOU.'],
  [BUSINESS_MODES.SALON_AND_SPA]: ['BEAUTY.', 'WELLNESS.', 'YOU.']
} as const;

/** Client copy with business-mode-aware defaults for anything left blank. */
@Injectable({ providedIn: 'root' })
export class ContentConfigService {
  private readonly business = inject(BusinessConfigService);
  private readonly _content = signal<ContentConfig>(DEFAULT_CONTENT_CONFIG);

  readonly content = this._content.asReadonly();

  /** "Services" / "Experiences" — overridable per client. */
  readonly servicesLabel = computed(
    () => this._content().labels.services || MODE_SERVICES_LABEL[this.business.mode()]
  );
  /** "Stylists" / "Therapists" / "Professionals" — overridable per client. */
  readonly professionalsLabel = computed(
    () => this._content().labels.professionals || MODE_PROFESSIONALS_LABEL[this.business.mode()]
  );

  readonly hero = computed(() => this._content().hero);
  readonly heroWords = computed<readonly string[]>(() => {
    const words = this.hero().titleWords.filter(Boolean);
    return words.length ? words : MODE_HERO_WORDS[this.business.mode()];
  });
  readonly heroSecondaryButtonText = computed(
    () => this.hero().secondaryButtonText || `Explore ${this.servicesLabel()}`
  );

  readonly journey = computed(() => this._content().journey);
  readonly membershipFaqs = computed(() => this._content().membershipFaqs);
  readonly contactSubjects = computed(() => this._content().contactSubjects);
  readonly footerNote = computed(() => this._content().footerNote);

  /** Page hero copy; a blank title falls back to the mode-aware label. */
  page(key: ContentPageKey): PageHeroContent {
    const page = this._content().pages[key] ?? DEFAULT_CONTENT_CONFIG.pages[key];
    const fallbackTitle =
      key === 'services'
        ? this.servicesLabel()
        : key === 'professionals'
          ? this.professionalsLabel()
          : '';
    return {
      eyebrow: page?.eyebrow ?? '',
      title: page?.title || fallbackTitle,
      subtitle: page?.subtitle
    };
  }

  /** Called once by ConfigLoaderService. */
  set(content: ContentConfig): void {
    this._content.set(content);
  }
}
