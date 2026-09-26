/**
 * Client-authored copy. Anything here is marketing text a client would want
 * to change; developer/UI labels (buttons, validation) stay in templates.
 */
export interface HeroContent {
  /** Rendered as animated words; falls back to a per-mode default when empty. */
  titleWords: string[];
  subtitle: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  backgroundImage?: string;
}

export interface PageHeroContent {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export type ContentPageKey =
  | 'services'
  | 'professionals'
  | 'booking'
  | 'quiz'
  | 'gallery'
  | 'offers'
  | 'membership'
  | 'giftCards'
  | 'packageBuilder'
  | 'appointments'
  | 'contact';

export interface JourneyStep {
  title: string;
  detail: string;
  icon: string;
}

export interface Faq {
  q: string;
  a: string;
}

/** Wording overrides; when omitted the business mode picks sensible defaults. */
export interface ContentLabels {
  services?: string;
  professionals?: string;
}

export interface ContentConfig {
  labels: ContentLabels;
  hero: HeroContent;
  pages: Partial<Record<ContentPageKey, PageHeroContent>>;
  journey: JourneyStep[];
  membershipFaqs: Faq[];
  contactSubjects: string[];
  footerNote?: string;
}

export const DEFAULT_CONTENT_CONFIG: ContentConfig = {
  labels: {},
  hero: {
    titleWords: [],
    subtitle: 'Where self-care becomes an experience.',
    primaryButtonText: 'Book Your Experience',
    secondaryButtonText: 'Explore Services'
  },
  pages: {
    services: { eyebrow: 'Our menu', title: 'Services' },
    professionals: { eyebrow: 'In expert hands', title: 'Our Experts' },
    booking: { eyebrow: 'Online booking', title: 'Book your experience' },
    quiz: { eyebrow: 'A minute of honesty', title: 'Find your perfect experience' },
    gallery: { eyebrow: 'Inside the studio', title: 'Gallery' },
    offers: { eyebrow: 'Current offers', title: 'Offers' },
    membership: { eyebrow: 'Membership', title: 'Make it a ritual' },
    giftCards: { eyebrow: 'Gift cards', title: 'Give an experience' },
    packageBuilder: { eyebrow: 'Package builder', title: 'Build your experience' },
    appointments: { eyebrow: 'Your space', title: 'My appointments' },
    contact: { eyebrow: 'Find us', title: 'Contact' }
  },
  journey: [],
  membershipFaqs: [],
  contactSubjects: ['General enquiry', 'Booking help', 'Feedback']
};
