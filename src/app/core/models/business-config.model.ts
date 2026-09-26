export type BusinessMode = 'SALON_ONLY' | 'SPA_ONLY' | 'SALON_AND_SPA';

export interface BusinessInfo {
  name: string;
  tagline: string;
  logo?: string;
  favicon?: string;
  location: string;
  address?: string;
  phone: string;
  email: string;
  currency: string;
  instagram?: string;
  hoursLabel?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  surfaceColor: string;
  textColor: string;
  accentColor?: string;
}

export interface FeatureFlags {
  onlineBooking: boolean;
  slotBooking: boolean;
  stylistSelection: boolean;
  therapistSelection: boolean;
  servicePackages: boolean;
  membership: boolean;
  giftCards: boolean;
  beforeAfterGallery: boolean;
  beautyQuiz: boolean;
  reviews: boolean;
  offers: boolean;
  products: boolean;
  gallery: boolean;
  liveStatus: boolean;
  relaxationMode: boolean;
  aiAssistant: boolean;
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

/** Opening rules used by the (mock) availability engine. */
export interface BookingRules {
  openingHour: number;
  closingHour: number;
  slotMinutes: number;
  /** 0 = Sunday … 6 = Saturday */
  closedWeekdays: number[];
  /** ISO dates (yyyy-MM-dd) on which the studio is closed. */
  holidays: string[];
  maxAdvanceDays: number;
}

export interface BusinessConfig {
  businessMode: BusinessMode;
  business: BusinessInfo;
  theme: ThemeConfig;
  features: FeatureFlags;
  salon: SalonSection;
  spa: SpaSection;
  booking: BookingRules;
}

/** Fallback used until the JSON config loads (or if it cannot be fetched). */
export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  businessMode: 'SALON_AND_SPA',
  business: {
    name: 'Luxe & Aura',
    tagline: 'Beauty. Wellness. You.',
    logo: 'assets/images/logo.svg',
    location: 'Chennai',
    phone: '+91 98400 12345',
    email: 'hello@luxeaura.in',
    currency: 'INR',
    hoursLabel: 'Open daily 10:00 AM – 8:00 PM · Closed Sundays'
  },
  theme: {
    primaryColor: '#B08D57',
    secondaryColor: '#F5EFE6',
    surfaceColor: '#FFFFFF',
    textColor: '#242424',
    accentColor: '#6F7D5C'
  },
  features: {
    onlineBooking: true,
    slotBooking: true,
    stylistSelection: true,
    therapistSelection: true,
    servicePackages: true,
    membership: true,
    giftCards: true,
    beforeAfterGallery: true,
    beautyQuiz: true,
    reviews: true,
    offers: true,
    products: true,
    gallery: true,
    liveStatus: true,
    relaxationMode: true,
    aiAssistant: false
  },
  salon: { enabled: true, servicesEnabled: true, stylistsEnabled: true },
  spa: { enabled: true, servicesEnabled: true, therapistsEnabled: true },
  booking: {
    openingHour: 10,
    closingHour: 20,
    slotMinutes: 30,
    closedWeekdays: [0],
    holidays: [],
    maxAdvanceDays: 30
  }
};
