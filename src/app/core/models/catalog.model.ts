import { ProfessionalType, ServiceType } from '../constants/domain.constants';

export type { ProfessionalType, ServiceType };

/** Mood / intent tags used by the mood picker, quiz and recommendations. */
export type ExperienceTag =
  | 'relax'
  | 'glow'
  | 'hair'
  | 'self-care'
  | 'occasion'
  | 'wellness'
  | 'nails';

export interface ServiceCategory {
  id: string;
  label: string;
  type: ServiceType;
  icon: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  type: ServiceType;
  /** Minutes. */
  duration: number;
  price: number;
  rating: number;
  popular?: boolean;
  isNew?: boolean;
  /** Defaults to true when omitted in data. */
  enabled?: boolean;
  tags: ExperienceTag[];
  benefits: string[];
  professionalIds: number[];
  /** CSS art palette class used for the card visual when no image is set. */
  art: string;
  icon: string;
  image?: string;
}

export interface Professional {
  id: number;
  name: string;
  role: string;
  type: ProfessionalType;
  experienceYears: number;
  specialties: string[];
  rating: number;
  reviewsCount: number;
  bio: string;
  enabled?: boolean;
  /** CSS art palette class for the avatar when no image is set. */
  palette: string;
  image?: string;
}

export interface ExperienceAddon {
  id: number;
  name: string;
  price: number;
  /** Extra minutes. */
  duration: number;
  /** Which service types this add-on suits. */
  appliesTo: ServiceType[];
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  savings: number;
  validity: string;
  type: ServiceType | 'BOTH';
  tag?: string;
  art: string;
  icon: string;
  /** Service to preselect when booking this offer. */
  serviceId?: number;
}

export interface MembershipPlan {
  id: number;
  name: string;
  pricePerMonth: number;
  perks: string[];
  highlight?: boolean;
  tag?: string;
}

export interface GiftCardExperience {
  id: string;
  label: string;
  type: ServiceType | 'BOTH';
}

export interface GiftCardData {
  amounts: number[];
  minimumAmount: number;
  maximumAmount: number;
  experiences: GiftCardExperience[];
}

export interface CustomerStory {
  id: number;
  customer: string;
  title: string;
  quote: string;
  rating: number;
  service: string;
  type: ServiceType;
  steps: string[];
  palette: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  type: ServiceType | 'BOTH';
  art: string;
  icon: string;
  image?: string;
}

export interface BeforeAfterItem {
  id: number;
  title: string;
  category: string;
  caption: string;
  type: ServiceType;
  beforeArt: string;
  afterArt: string;
}

export interface GalleryData {
  categories: string[];
  items: GalleryItem[];
  beforeAfterCategories: string[];
  beforeAfter: BeforeAfterItem[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  forTags: ExperienceTag[];
  icon: string;
  art: string;
}

export interface MoodOption {
  id: string;
  label: string;
  icon: string;
  tag: ExperienceTag;
  blurb: string;
}

export interface QuizChoice<T> {
  id: string;
  label: string;
  icon: string;
  value: T;
  hint?: string;
}

export interface QuizData {
  goals: QuizChoice<ExperienceTag>[];
  /** Max duration in minutes. */
  times: QuizChoice<number>[];
  /** Max price in business currency. */
  budgets: QuizChoice<number>[];
}
