import { BUSINESS_MODES, BusinessMode } from '../constants/domain.constants';

export interface BusinessContact {
  phone: string;
  email: string;
  whatsapp?: string;
}

export interface BusinessAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
}

export interface BusinessInfo {
  name: string;
  shortName?: string;
  tagline: string;
  description?: string;
  logo?: string;
  favicon?: string;
  currency: string;
  currencySymbol?: string;
  /** BCP-47 locale used for currency/date formatting, e.g. "en-IN". */
  locale: string;
  contact: BusinessContact;
  address: BusinessAddress;
  socialMedia: SocialMedia;
  /** Human-readable opening hours shown in footer/contact. */
  hoursLabel?: string;
}

export interface SalonSection {
  enabled: boolean;
  servicesEnabled: boolean;
  stylistsEnabled: boolean;
}

export interface SpaSection {
  enabled: boolean;
  servicesEnabled: boolean;
  therapistsEnabled: boolean;
}

export interface BusinessConfig {
  businessMode: BusinessMode;
  business: BusinessInfo;
  salon: SalonSection;
  spa: SpaSection;
}

/** Neutral fallback — never client-specific. Used only if the JSON is missing keys. */
export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  businessMode: BUSINESS_MODES.SALON_AND_SPA,
  business: {
    name: 'Salon & Spa',
    tagline: 'Beauty. Wellness. You.',
    currency: 'INR',
    currencySymbol: '₹',
    locale: 'en-IN',
    contact: { phone: '', email: '' },
    address: { line1: '', city: '' },
    socialMedia: {}
  },
  salon: { enabled: true, servicesEnabled: true, stylistsEnabled: true },
  spa: { enabled: true, servicesEnabled: true, therapistsEnabled: true }
};
