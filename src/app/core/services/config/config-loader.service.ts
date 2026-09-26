import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, isDevMode, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CONFIG_BASE_PATH, CONFIG_FILES } from '../../constants/app.constants';
import { AppConfig, DEFAULT_APP_CONFIG } from '../../models/app-config.model';
import { BookingConfig, DEFAULT_BOOKING_RULES } from '../../models/booking-config.model';
import { BusinessConfig, DEFAULT_BUSINESS_CONFIG } from '../../models/business-config.model';
import { ContentConfig, DEFAULT_CONTENT_CONFIG } from '../../models/content-config.model';
import { DEFAULT_FEATURE_FLAGS, FeatureConfig } from '../../models/feature-config.model';
import { DEFAULT_MENU_CONFIG, MenuConfig } from '../../models/menu-config.model';
import {
  DEFAULT_PERMISSION_CONFIG,
  PermissionConfig
} from '../../models/permission-config.model';
import { DEFAULT_THEME, ThemeConfig } from '../../models/theme-config.model';
import { AppConfigService } from './app-config.service';
import { BookingConfigService } from './booking-config.service';
import { BusinessConfigService } from './business-config.service';
import { ContentConfigService } from './content-config.service';
import { FeatureConfigService } from './feature-config.service';
import { MenuConfigService } from './menu-config.service';
import { PermissionConfigService } from './permission-config.service';
import { ThemeConfigService } from './theme-config.service';

export type ConfigStatus = 'loading' | 'ready' | 'error';

type ConfigFile = keyof typeof CONFIG_FILES;

/**
 * Loads every configuration file exactly once at bootstrap (wired through
 * provideAppInitializer) and hands each section to its owning service.
 *
 * Failure policy: app-config and business-config are required — without them
 * the shell renders an error state instead of a half-configured product.
 * Every other file falls back to neutral defaults with a dev-mode warning.
 */
@Injectable({ providedIn: 'root' })
export class ConfigLoaderService {
  private readonly http = inject(HttpClient);
  private readonly app = inject(AppConfigService);
  private readonly business = inject(BusinessConfigService);
  private readonly menu = inject(MenuConfigService);
  private readonly features = inject(FeatureConfigService);
  private readonly booking = inject(BookingConfigService);
  private readonly theme = inject(ThemeConfigService);
  private readonly permissions = inject(PermissionConfigService);
  private readonly content = inject(ContentConfigService);

  private readonly _status = signal<ConfigStatus>('loading');
  private readonly _error = signal<string | null>(null);
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

      // Business config is mandatory: no brand, no product.
      const businessConfig = await this.fetch<Partial<BusinessConfig>>('business');
      this.business.set(this.mergeBusiness(businessConfig));

      const [menu, features, booking, theme, permissions, content] = await Promise.all([
        this.fetchOptional<MenuConfig>('menu', DEFAULT_MENU_CONFIG),
        this.fetchOptional<FeatureConfig>('feature', { features: DEFAULT_FEATURE_FLAGS }),
        this.fetchOptional<BookingConfig>('booking', { booking: DEFAULT_BOOKING_RULES }),
        this.fetchOptional<ThemeConfig>('theme', { theme: DEFAULT_THEME }),
        this.fetchOptional<PermissionConfig>('permission', DEFAULT_PERMISSION_CONFIG),
        this.fetchOptional<ContentConfig>('content', DEFAULT_CONTENT_CONFIG)
      ]);

      this.menu.set({ menus: menu.menus ?? [] });
      this.features.set({ ...DEFAULT_FEATURE_FLAGS, ...features.features });
      this.booking.set({
        ...DEFAULT_BOOKING_RULES,
        ...booking.booking,
        workingHours: { ...DEFAULT_BOOKING_RULES.workingHours, ...booking.booking?.workingHours }
      });
      this.theme.set({ ...DEFAULT_THEME, ...theme.theme });
      this.permissions.set({ ...DEFAULT_PERMISSION_CONFIG, ...permissions });
      this.content.set({
        ...DEFAULT_CONTENT_CONFIG,
        ...content,
        labels: { ...DEFAULT_CONTENT_CONFIG.labels, ...content.labels },
        hero: { ...DEFAULT_CONTENT_CONFIG.hero, ...content.hero },
        pages: { ...DEFAULT_CONTENT_CONFIG.pages, ...content.pages }
      });

      this.theme.apply();
      this._status.set('ready');
    } catch (err) {
      this._error.set(this.describe(err));
      this._status.set('error');
      if (isDevMode()) console.error('[config] Failed to load configuration', err);
    }
  }

  private mergeBusiness(json: Partial<BusinessConfig>): BusinessConfig {
    const base = DEFAULT_BUSINESS_CONFIG;
    return {
      businessMode: json.businessMode ?? base.businessMode,
      business: {
        ...base.business,
        ...json.business,
        contact: { ...base.business.contact, ...json.business?.contact },
        address: { ...base.business.address, ...json.business?.address },
        socialMedia: { ...base.business.socialMedia, ...json.business?.socialMedia }
      },
      salon: { ...base.salon, ...json.salon },
      spa: { ...base.spa, ...json.spa }
    };
  }

  private fetch<T>(file: ConfigFile): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${CONFIG_BASE_PATH}/${CONFIG_FILES[file]}`));
  }

  private async fetchOptional<T>(file: ConfigFile, fallback: T): Promise<T> {
    try {
      return await this.fetch<T>(file);
    } catch (err) {
      if (isDevMode()) {
        console.warn(`[config] ${CONFIG_FILES[file]} unavailable — using defaults`, err);
      }
      return fallback;
    }
  }

  private describe(err: unknown): string {
    const status = (err as { status?: number })?.status;
    return status
      ? `Configuration could not be loaded (HTTP ${status}).`
      : 'Configuration could not be loaded.';
  }
}
