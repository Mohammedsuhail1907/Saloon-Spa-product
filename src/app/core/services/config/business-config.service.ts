import { Injectable, computed, signal } from '@angular/core';
import { BUSINESS_MODES } from '../../constants/domain.constants';
import { BusinessConfig, DEFAULT_BUSINESS_CONFIG } from '../../models/business-config.model';

/**
 * Who the client is and which studios they run. Business-level switches take
 * precedence over feature flags and menus (see FeatureConfigService /
 * AccessService), so "spa disabled" hides spa everywhere regardless of menus.
 */
@Injectable({ providedIn: 'root' })
export class BusinessConfigService {
  private readonly _config = signal<BusinessConfig>(DEFAULT_BUSINESS_CONFIG);

  readonly config = this._config.asReadonly();
  readonly mode = computed(() => this._config().businessMode);
  readonly business = computed(() => this._config().business);

  /* ------------------------------ branding ----------------------------- */

  readonly name = computed(() => this.business().name);
  readonly shortName = computed(() => this.business().shortName ?? this.business().name);
  readonly tagline = computed(() => this.business().tagline);
  readonly description = computed(() => this.business().description ?? '');
  readonly logo = computed(() => this.business().logo);
  readonly favicon = computed(() => this.business().favicon);

  /* ------------------------------ locale ------------------------------- */

  readonly currency = computed(() => this.business().currency);
  readonly currencySymbol = computed(() => this.business().currencySymbol ?? '');
  readonly locale = computed(() => this.business().locale || 'en-IN');

  /** Formats an amount in the client's currency/locale, e.g. ₹1,999. */
  formatPrice(value: number): string {
    return new Intl.NumberFormat(this.locale(), {
      style: 'currency',
      currency: this.currency(),
      maximumFractionDigits: 0
    }).format(value);
  }

  /* ------------------------------ contact ------------------------------ */

  readonly contact = computed(() => this.business().contact);
  readonly address = computed(() => this.business().address);
  readonly socialMedia = computed(() => this.business().socialMedia);
  readonly hoursLabel = computed(() => this.business().hoursLabel);

  /** "line1, line2, City PostalCode" — skips blank parts. */
  readonly addressLine = computed(() => {
    const a = this.address();
    const cityLine = [a.city, a.postalCode].filter(Boolean).join(' ');
    return [a.line1, a.line2, cityLine].filter(Boolean).join(', ');
  });
  readonly city = computed(() => this.address().city);

  /** Digits-only WhatsApp number, falling back to the phone line. */
  readonly whatsappNumber = computed(() =>
    (this.contact().whatsapp || this.contact().phone).replace(/[^\d]/g, '')
  );

  /** Social links that actually have a URL, ready for the footer. */
  readonly socialLinks = computed(() => {
    const s = this.socialMedia();
    const all: { id: keyof typeof s; icon: string; url?: string }[] = [
      { id: 'instagram', icon: 'pi pi-instagram', url: s.instagram },
      { id: 'facebook', icon: 'pi pi-facebook', url: s.facebook },
      { id: 'youtube', icon: 'pi pi-youtube', url: s.youtube },
      { id: 'twitter', icon: 'pi pi-twitter', url: s.twitter }
    ];
    return all.filter((l): l is typeof l & { url: string } => !!l.url);
  });

  /* ------------------------------ sections ----------------------------- */

  readonly isSalonEnabled = computed(
    () => this.mode() !== BUSINESS_MODES.SPA_ONLY && this._config().salon.enabled
  );
  readonly isSpaEnabled = computed(
    () => this.mode() !== BUSINESS_MODES.SALON_ONLY && this._config().spa.enabled
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
  readonly isAnyStaffEnabled = computed(
    () => this.isSalonStaffEnabled() || this.isSpaStaffEnabled()
  );

  /** Called once by ConfigLoaderService. */
  set(config: BusinessConfig): void {
    this._config.set(config);
  }
}
