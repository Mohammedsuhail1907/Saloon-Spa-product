import { DataResource } from '../constants/app.constants';
import { BookingRules } from './booking-config.model';
import { BusinessInfo, SalonSection, SpaSection } from './business-config.model';
import { BusinessMode } from '../constants/domain.constants';
import { ContentConfig } from './content-config.model';
import { FeatureFlags } from './feature-config.model';
import { MenuItem } from './menu-config.model';
import { PermissionConfig } from './permission-config.model';

/** One row of client-selector.json → which file holds a client. */
export interface ClientRegistryEntry {
  key: string;
  /** Path relative to the config folder, e.g. "clients/client-salon-001.json". */
  file: string;
}

/**
 * client-selector.json — the one file a tester edits: which client is active
 * (`activeClientKey`), optionally which theme to force (`activeThemeKey`),
 * plus the registry of every client this build ships.
 */
export interface ClientRegistry {
  activeClientKey: string;
  /**
   * Theme to apply regardless of the client's own `theme.themeKey`.
   * Empty or omitted → the client's theme. Unknown key → warning + client's theme.
   */
  activeThemeKey?: string | null;
  clients: ClientRegistryEntry[];
}

/** Where a client's catalogue lives; unlisted resources use the shared data folder. */
export interface ClientDataConfig {
  /** Folder with this client's own JSON, e.g. "assets/data/clients/client-salon-001". */
  path?: string;
  /** Resources that exist in `path`; everything else falls back to assets/data. */
  clientResources?: DataResource[];
}

/**
 * A complete client. Only `clientKey`, `businessMode`, `business` and
 * `theme.themeKey` are required; every other section overrides the product
 * defaults in assets/config/*-config.json and may be omitted.
 */
export interface ClientConfig {
  clientKey: string;
  businessMode: BusinessMode;
  business: BusinessInfo;
  salon?: Partial<SalonSection>;
  spa?: Partial<SpaSection>;
  theme: { themeKey: string };
  features?: Partial<FeatureFlags>;
  /** Merged onto the default menus by `id`; a client lists only what differs. */
  menus?: Partial<MenuItem>[];
  booking?: Partial<BookingRules>;
  content?: Partial<ContentConfig>;
  permissions?: Partial<PermissionConfig>;
  data?: ClientDataConfig;
}

/** Outcome of validating a client against the registry and theme catalog. */
export interface ClientValidation {
  errors: string[];
  warnings: string[];
}

/**
 * A configuration failure. `message` is safe to show anyone; `details` are
 * developer hints and are only rendered in dev mode.
 */
export interface ConfigLoadError {
  message: string;
  details: string[];
}
