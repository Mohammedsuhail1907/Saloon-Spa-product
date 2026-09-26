import { environment } from '../../../environments/environment';

/**
 * Compile-time fallback for the API root. The runtime value comes from
 * assets/config/app-config.json (`apiBaseUrl`), which wins when set.
 */
export const ENV_API_BASE_URL = environment.apiBaseUrl;

/** Folder holding every configuration file. */
export const CONFIG_BASE_PATH = 'assets/config';

/**
 * Configuration files loaded at bootstrap (see ConfigLoaderService).
 * `app` and `clientSelector` are required; the `*-config.json` files are the
 * product defaults that the active client's JSON overrides section by section.
 */
export const CONFIG_FILES = {
  app: 'app-config.json',
  clientSelector: 'client-selector.json',
  themes: 'themes.json',
  feature: 'feature-config.json',
  menu: 'menu-config.json',
  booking: 'booking-config.json',
  permission: 'permission-config.json',
  content: 'content-config.json'
} as const;

/**
 * Logical data resources. With dataSource=ASSETS these map to
 * `<client data path>/<name>.json` when the client owns the resource, else
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

/** Shared catalogue used by every client that does not override a resource. */
export const DATA_BASE_PATH = 'assets/data';

/** localStorage keys, namespaced per client so two clients never collide. */
export const storageKeys = (clientKey: string) =>
  ({
    appointments: `${clientKey}.appointments`,
    favorites: `${clientKey}.favorites`,
    giftCards: `${clientKey}.giftcards`,
    membership: `${clientKey}.membership`
  }) as const;

/** sessionStorage keys for the development-only client/theme switcher. */
export const DEV_OVERRIDE_KEYS = {
  client: 'salon-spa.dev.clientKey',
  theme: 'salon-spa.dev.themeKey'
} as const;
