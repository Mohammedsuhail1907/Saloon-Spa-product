/** Every switchable product capability. Keys double as the JSON schema. */
export interface FeatureFlags {
  onlineBooking: boolean;
  slotBooking: boolean;

  stylistSelection: boolean;
  therapistSelection: boolean;

  /** Add-ons offered inside the booking flow. */
  servicePackages: boolean;
  /** The standalone "build your experience" page. */
  customPackageBuilder: boolean;

  membership: boolean;
  giftCards: boolean;

  offers: boolean;
  reviews: boolean;
  gallery: boolean;
  beforeAfterGallery: boolean;

  beautyQuiz: boolean;
  /** Mood picker + "also lovely" suggestions. */
  recommendations: boolean;

  customerDashboard: boolean;
  appointmentHistory: boolean;
  appointmentReschedule: boolean;
  appointmentCancellation: boolean;

  whatsappBooking: boolean;
  callBooking: boolean;

  /** "Today's studio" live status strip on the home page. */
  liveAvailability: boolean;

  products: boolean;
  productRecommendations: boolean;

  notifications: boolean;
  /** Spa-only ambient relaxation toggle. */
  relaxationMode: boolean;
}

export type FeatureKey = keyof FeatureFlags;

export interface FeatureConfig {
  features: FeatureFlags;
}

/** Conservative defaults: core browsing works, optional modules are off. */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  onlineBooking: true,
  slotBooking: true,
  stylistSelection: true,
  therapistSelection: true,
  servicePackages: false,
  customPackageBuilder: false,
  membership: false,
  giftCards: false,
  offers: false,
  reviews: false,
  gallery: false,
  beforeAfterGallery: false,
  beautyQuiz: false,
  recommendations: false,
  customerDashboard: true,
  appointmentHistory: true,
  appointmentReschedule: true,
  appointmentCancellation: true,
  whatsappBooking: false,
  callBooking: false,
  liveAvailability: false,
  products: false,
  productRecommendations: false,
  notifications: true,
  relaxationMode: false
};
