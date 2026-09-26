import { environment } from '../../../environments/environment';

/**
 * Compile-time fallback for the API root. The runtime value comes from
 * assets/config/app-config.json (`apiBaseUrl`), which wins when set.
 */
export const ENV_API_BASE_URL = environment.apiBaseUrl;

/** Folder holding every per-client configuration file. */
export const CONFIG_BASE_PATH = 'assets/config';

/** Configuration files loaded once at bootstrap (see ConfigLoaderService). */
export const CONFIG_FILES = {
  app: 'app-config.json',
  business: 'business-config.json',
  menu: 'menu-config.json',
  feature: 'feature-config.json',
  booking: 'booking-config.json',
  theme: 'theme-config.json',
  permission: 'permission-config.json',
  content: 'content-config.json'
} as const;

/**
 * Logical data resources. With dataSource=ASSETS these map to
 * `assets/data/<name>.json`; with API they become `${apiBaseUrl}/<name>`.
 */
export const DATA_RESOURCES = {
  services: 'services',
  serviceCategories: 'service-categories',
  addons: 'addons',
  moods: 'moods',
  quiz: 'quiz',
  professionals: 'professionals',
  offers: 'offers',
  memberships: 'memberships',
  giftCards: 'gift-cards',
  gallery: 'gallery',
  reviews: 'reviews',
  products: 'products'
} as const;
export type DataResource = (typeof DATA_RESOURCES)[keyof typeof DATA_RESOURCES];

export const DATA_BASE_PATH = 'assets/data';

/** localStorage keys, namespaced per client so two configs never collide. */
export const storageKeys = (clientId: string) =>
  ({
    appointments: `${clientId}.appointments`,
    favorites: `${clientId}.favorites`,
    giftCards: `${clientId}.giftcards`,
    membership: `${clientId}.membership`
  }) as const;
