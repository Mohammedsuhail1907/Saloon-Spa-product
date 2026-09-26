import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { palette, updatePreset } from '@primeuix/themes';
import { firstValueFrom } from 'rxjs';
import { CONFIG_URL } from '../constants/app.constants';
import {
  BusinessConfig,
  DEFAULT_BUSINESS_CONFIG,
  FeatureFlags
} from '../models/business-config.model';

/**
 * Single source of truth for the business configuration.
 * Loaded once at bootstrap; every component reads mode/feature state from here
 * instead of touching the JSON directly.
 */
@Injectable({ providedIn: 'root' })
export class BusinessConfigService {
  private readonly http = inject(HttpClient);
  private readonly _config = signal<BusinessConfig>(DEFAULT_BUSINESS_CONFIG);

  readonly config = this._config.asReadonly();
  readonly mode = computed(() => this._config().businessMode);
  readonly business = computed(() => this._config().business);
  readonly currency = computed(() => this._config().business.currency);
  readonly bookingRules = computed(() => this._config().booking);
  readonly features = computed(() => this._config().features);

  /** Sections */
  readonly isSalonEnabled = computed(
    () => this.mode() !== 'SPA_ONLY' && this._config().salon.enabled
  );
  readonly isSpaEnabled = computed(
    () => this.mode() !== 'SALON_ONLY' && this._config().spa.enabled
  );
  readonly isBothEnabled = computed(() => this.isSalonEnabled() && this.isSpaEnabled());
  readonly isSalonServicesEnabled = computed(
    () => this.isSalonEnabled() && this._config().salon.servicesEnabled
  );
  readonly isSpaServicesEnabled = computed(
    () => this.isSpaEnabled() && this._config().spa.servicesEnabled
  );
  readonly isSalonStaffEnabled = computed(
    () => this.isSalonEnabled() && this._config().salon.stylistsEnabled
  );
  readonly isSpaStaffEnabled = computed(
    () => this.isSpaEnabled() && this._config().spa.therapistsEnabled
  );

  /** Features */
  readonly isBookingEnabled = computed(() => this.features().onlineBooking);
  readonly isSlotBookingEnabled = computed(
    () => this.features().onlineBooking && this.features().slotBooking
  );
  readonly isStylistSelectionEnabled = computed(
    () => this.isSalonStaffEnabled() && this.features().stylistSelection
  );
  readonly isTherapistSelectionEnabled = computed(
    () => this.isSpaStaffEnabled() && this.features().therapistSelection
  );
  readonly isPackagesEnabled = computed(() => this.features().servicePackages);
  readonly isMembershipEnabled = computed(() => this.features().membership);
  readonly isGiftCardEnabled = computed(() => this.features().giftCards);
  readonly isBeforeAfterEnabled = computed(() => this.features().beforeAfterGallery);
  readonly isBeautyQuizEnabled = computed(() => this.features().beautyQuiz);
  readonly isReviewsEnabled = computed(() => this.features().reviews);
  readonly isOffersEnabled = computed(() => this.features().offers);
  readonly isProductsEnabled = computed(() => this.features().products);
  readonly isGalleryEnabled = computed(() => this.features().gallery);
  readonly isLiveStatusEnabled = computed(() => this.features().liveStatus);
  readonly isRelaxationModeEnabled = computed(
    () => this.isSpaEnabled() && this.features().relaxationMode
  );

  hasFeature(flag: keyof FeatureFlags): boolean {
    return this.features()[flag];
  }

  /** Wording that flips between salon / spa / combined variants. */
  readonly servicesLabel = computed(() =>
    this.mode() === 'SPA_ONLY' ? 'Experiences' : 'Services'
  );
  readonly professionalsLabel = computed(() => {
    if (this.mode() === 'SALON_ONLY') return 'Stylists';
    if (this.mode() === 'SPA_ONLY') return 'Therapists';
    return 'Professionals';
  });
  readonly heroWords = computed<string[]>(() => {
    switch (this.mode()) {
      case 'SALON_ONLY':
        return ['BEAUTY.', 'STYLE.', 'YOU.'];
      case 'SPA_ONLY':
        return ['CALM.', 'WELLNESS.', 'YOU.'];
      default:
        return ['BEAUTY.', 'WELLNESS.', 'YOU.'];
    }
  });

  /** Loads the JSON config; falls back to defaults if it cannot be fetched. */
  async load(): Promise<void> {
    try {
      const json = await firstValueFrom(
        this.http.get<Partial<BusinessConfig>>(CONFIG_URL)
      );
      this._config.set(this.merge(json));
    } catch {
      // Keep DEFAULT_BUSINESS_CONFIG — the app must still boot without the file.
    }
    this.applyTheme();
  }

  private merge(json: Partial<BusinessConfig>): BusinessConfig {
    const base = DEFAULT_BUSINESS_CONFIG;
    return {
      businessMode: json.businessMode ?? base.businessMode,
      business: { ...base.business, ...json.business },
      theme: { ...base.theme, ...json.theme },
      features: { ...base.features, ...json.features },
      salon: { ...base.salon, ...json.salon },
      spa: { ...base.spa, ...json.spa },
      booking: { ...base.booking, ...json.booking }
    };
  }

  /** Pushes config colours into PrimeNG's preset and our CSS variables. */
  private applyTheme(): void {
    const cfg = this._config();
    const style = document.documentElement.style;
    style.setProperty('--brand-primary', cfg.theme.primaryColor);
    style.setProperty('--brand-secondary', cfg.theme.secondaryColor);
    style.setProperty('--brand-surface', cfg.theme.surfaceColor);
    style.setProperty('--brand-text', cfg.theme.textColor);
    style.setProperty('--brand-accent', cfg.theme.accentColor ?? cfg.theme.primaryColor);

    updatePreset({ semantic: { primary: palette(cfg.theme.primaryColor) } });

    document.title = `${cfg.business.name} — ${cfg.business.tagline}`;
    if (cfg.business.favicon) {
      const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (link) link.href = cfg.business.favicon;
    }
  }
}
