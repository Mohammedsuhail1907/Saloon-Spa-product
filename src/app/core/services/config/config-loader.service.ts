import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, isDevMode, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CONFIG_BASE_PATH, CONFIG_FILES } from '../../constants/app.constants';
import { AppConfig, DEFAULT_APP_CONFIG } from '../../models/app-config.model';
import { BookingConfig, BookingRules, DEFAULT_BOOKING_RULES } from '../../models/booking-config.model';
import { BusinessConfig, DEFAULT_BUSINESS_CONFIG } from '../../models/business-config.model';
import { ClientConfig, ClientRegistry, ConfigLoadError } from '../../models/client-config.model';
import { ContentConfig, DEFAULT_CONTENT_CONFIG } from '../../models/content-config.model';
import { DEFAULT_FEATURE_FLAGS, FeatureConfig } from '../../models/feature-config.model';
import { DEFAULT_MENU_CONFIG, MenuConfig, MenuItem } from '../../models/menu-config.model';
import {
  DEFAULT_PERMISSION_CONFIG,
  PermissionConfig
} from '../../models/permission-config.model';
import { DEFAULT_THEME_CATALOG, ThemeCatalog } from '../../models/theme-config.model';
import { AppConfigService } from './app-config.service';
import { BookingConfigService } from './booking-config.service';
import { BusinessConfigService } from './business-config.service';
import { ClientConfigService } from './client-config.service';
import { ContentConfigService } from './content-config.service';
import { DevToolsService } from './dev-tools.service';
import { FeatureConfigService } from './feature-config.service';
import { MenuConfigService } from './menu-config.service';
import { PermissionConfigService } from './permission-config.service';
import { ThemeConfigService } from './theme-config.service';

export type ConfigStatus = 'loading' | 'ready' | 'error';

type ConfigFile = keyof typeof CONFIG_FILES;

class ConfigError extends Error {
  constructor(
    message: string,
    readonly details: string[] = []
  ) {
    super(message);
  }
}

/**
 * Bootstrap pipeline (runs once via provideAppInitializer):
 *
 *   app-config.json → client-selector.json → clients/<active>.json
 *                                          → themes.json + *-config.json defaults
 *   validate → merge defaults ← client → hand each section to its service
 *   → resolve theme key against the catalog → apply.
 *
 * app-config, client-selector and the active client file are required; the
 * defaults and the theme catalog fall back to built-in values with a warning.
 */
@Injectable({ providedIn: 'root' })
export class ConfigLoaderService {
  private readonly http = inject(HttpClient);
  private readonly app = inject(AppConfigService);
  private readonly clients = inject(ClientConfigService);
  private readonly business = inject(BusinessConfigService);
  private readonly menu = inject(MenuConfigService);
  private readonly features = inject(FeatureConfigService);
  private readonly booking = inject(BookingConfigService);
  private readonly theme = inject(ThemeConfigService);
  private readonly permissions = inject(PermissionConfigService);
  private readonly content = inject(ContentConfigService);
  private readonly devTools = inject(DevToolsService);

  private readonly _status = signal<ConfigStatus>('loading');
  private readonly _error = signal<ConfigLoadError | null>(null);
  private loadPromise?: Promise<void>;

  readonly status = this._status.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isReady = computed(() => this._status() === 'ready');
  readonly hasFailed = computed(() => this._status() === 'error');

  /** Safe to call repeatedly; the work happens once. Never rejects. */
  load(): Promise<void> {
    return (this.loadPromise ??= this.loadOnce());
  }

  private async loadOnce(): Promise<void> {
    try {
      const appConfig = await this.fetch<AppConfig>('app');
      this.app.set({ ...DEFAULT_APP_CONFIG, ...appConfig });

      const registry = await this.fetch<ClientRegistry>('clientSelector');
      if (!Array.isArray(registry?.clients) || !registry.clients.length) {
        throw new ConfigError('No clients are registered.', [
          `${CONFIG_FILES.clientSelector} must list at least one client under "clients".`
        ]);
      }
      this.clients.setRegistry(registry);
      const clientKey = this.resolveClientKey(registry);

      const [client, themes, features, menu, booking, permissions, content] = await Promise.all([
        this.clients.getClientConfig(clientKey),
        this.fetchOptional<ThemeCatalog>('themes', DEFAULT_THEME_CATALOG),
        this.fetchOptional<FeatureConfig>('feature', { features: DEFAULT_FEATURE_FLAGS }),
        this.fetchOptional<MenuConfig>('menu', DEFAULT_MENU_CONFIG),
        this.fetchOptional<BookingConfig>('booking', { booking: DEFAULT_BOOKING_RULES }),
        this.fetchOptional<PermissionConfig>('permission', DEFAULT_PERMISSION_CONFIG),
        this.fetchOptional<ContentConfig>('content', DEFAULT_CONTENT_CONFIG)
      ]);

      this.warn(this.theme.setCatalog(themes).map((p) => `[themes] ${p}`));

      const validation = this.clients.validate(client, clientKey, this.theme.themeKeys());
      this.warn(validation.warnings.map((w) => `[client ${clientKey}] ${w}`));
      if (validation.errors.length) {
        throw new ConfigError(`Client configuration "${clientKey}" is invalid.`, validation.errors);
      }

      this.business.set(this.mergeBusiness(client));
      this.features.set({ ...DEFAULT_FEATURE_FLAGS, ...features.features, ...client.features });
      this.menu.set({ menus: this.mergeMenus(menu.menus ?? [], client.menus) });
      this.booking.set(this.mergeBooking(booking.booking, client.booking));
      this.permissions.set({
        ...DEFAULT_PERMISSION_CONFIG,
        ...permissions,
        ...client.permissions,
        roles: { ...DEFAULT_PERMISSION_CONFIG.roles, ...permissions.roles, ...client.permissions?.roles }
      });
      this.content.set(this.mergeContent(content, client.content));
      this.clients.setActive(client);

      this.applyTheme(client, registry);
      this._status.set('ready');
    } catch (err) {
      this._error.set(this.describe(err));
      this._status.set('error');
      if (isDevMode()) console.error('[config] Failed to load configuration', err);
    }
  }

  /** Registry value, or a valid dev-tools override; unknown keys are an error. */
  private resolveClientKey(registry: ClientRegistry): string {
    let key = registry.activeClientKey;
    const override = this.devTools.clientOverride();
    if (override) {
      if (this.clients.hasClient(override)) key = override;
      else {
        this.devTools.clearClientOverride();
        this.warn([`[dev] client override "${override}" is not registered — ignored.`]);
      }
    }
    if (!this.clients.hasClient(key)) {
      throw new ConfigError(`Active client configuration "${key}" was not found.`, [
        'Available clients:',
        ...this.clients.availableClientKeys()
      ]);
    }
    return key;
  }

  /**
   * Precedence: dev-tools override → client-selector `activeThemeKey` →
   * the client's own `theme.themeKey` → catalog default. Never unthemed.
   */
  private applyTheme(client: ClientConfig, registry: ClientRegistry): void {
    const selectorKey = registry.activeThemeKey?.trim() || undefined;
    if (selectorKey && !this.theme.hasTheme(selectorKey)) {
      this.warn([
        `[client-selector] activeThemeKey "${selectorKey}" is not in themes.json — using the client's theme. ` +
          `Available themes: ${this.theme.themeKeys().join(', ')}.`
      ]);
    }
    const candidates = [
      this.devTools.themeOverride(),
      selectorKey,
      client.theme?.themeKey,
      this.theme.defaultThemeKey()
    ];
    for (const key of candidates) {
      if (key && this.theme.activate(key)) return;
    }
    this.theme.applyTheme(this.theme.getActiveTheme());
  }

  /* -------------------------------- merges -------------------------------- */

  private mergeBusiness(client: ClientConfig): BusinessConfig {
    const base = DEFAULT_BUSINESS_CONFIG;
    return {
      businessMode: client.businessMode,
      business: {
        ...base.business,
        ...client.business,
        contact: { ...base.business.contact, ...client.business.contact },
        address: { ...base.business.address, ...client.business.address },
        socialMedia: { ...base.business.socialMedia, ...client.business.socialMedia }
      },
      salon: { ...base.salon, ...client.salon },
      spa: { ...base.spa, ...client.spa }
    };
  }

  /** Client menu entries override the defaults by id; unknown ids are appended. */
  private mergeMenus(defaults: MenuItem[], overrides?: Partial<MenuItem>[]): MenuItem[] {
    const byId = new Map<string, MenuItem>(defaults.map((m) => [m.id, { ...m }]));
    for (const o of overrides ?? []) {
      if (!o.id) continue;
      const base = byId.get(o.id);
      if (base) byId.set(o.id, { ...base, ...o });
      else if (o.label && o.route) byId.set(o.id, { enabled: true, order: 999, ...o } as MenuItem);
    }
    return [...byId.values()];
  }

  private mergeBooking(defaults?: Partial<BookingRules>, client?: Partial<BookingRules>): BookingRules {
    return {
      ...DEFAULT_BOOKING_RULES,
      ...defaults,
      ...client,
      workingHours: {
        ...DEFAULT_BOOKING_RULES.workingHours,
        ...defaults?.workingHours,
        ...client?.workingHours
      }
    };
  }

  private mergeContent(defaults: Partial<ContentConfig>, client?: Partial<ContentConfig>): ContentConfig {
    const base = DEFAULT_CONTENT_CONFIG;
    return {
      ...base,
      ...defaults,
      ...client,
      labels: { ...base.labels, ...defaults.labels, ...client?.labels },
      hero: { ...base.hero, ...defaults.hero, ...client?.hero },
      pages: { ...base.pages, ...defaults.pages, ...client?.pages }
    };
  }

  /* -------------------------------- helpers ------------------------------- */

  private fetch<T>(file: ConfigFile): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${CONFIG_BASE_PATH}/${CONFIG_FILES[file]}`));
  }

  private async fetchOptional<T>(file: ConfigFile, fallback: T): Promise<T> {
    try {
      return await this.fetch<T>(file);
    } catch (err) {
      this.warn([`[config] ${CONFIG_FILES[file]} unavailable — using defaults`]);
      if (isDevMode()) console.warn(err);
      return fallback;
    }
  }

  private warn(messages: string[]): void {
    if (isDevMode()) messages.forEach((m) => console.warn(m));
  }

  private describe(err: unknown): ConfigLoadError {
    if (err instanceof ConfigError) return { message: err.message, details: err.details };
    const status = (err as { status?: number; url?: string })?.status;
    const url = (err as { url?: string })?.url;
    return {
      message: status
        ? `Configuration could not be loaded (HTTP ${status}).`
        : 'Configuration could not be loaded.',
      details: url ? [`Request: ${url}`] : []
    };
  }
}
