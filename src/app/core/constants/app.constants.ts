import { environment } from '../../../environments/environment';

/** Root of the (future) REST API. Mock services ignore it for now. */
export const API_BASE_URL = environment.apiBaseUrl;

/** Static business configuration shipped with the app. */
export const CONFIG_URL = 'assets/config/salon-spa-config.json';

/** localStorage keys for the client-side demo persistence. */
export const STORAGE_KEYS = {
  appointments: 'luxe-aura.appointments',
  favorites: 'luxe-aura.favorites',
  giftCards: 'luxe-aura.giftcards',
  membership: 'luxe-aura.membership'
} as const;
