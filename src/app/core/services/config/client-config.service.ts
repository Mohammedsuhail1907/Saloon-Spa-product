import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { isRouteKey } from '../../config/route-access.config';
import { CONFIG_BASE_PATH, DATA_BASE_PATH, DataResource } from '../../constants/app.constants';
import { BUSINESS_MODES } from '../../constants/domain.constants';
import {
  ClientConfig,
  ClientRegistry,
  ClientRegistryEntry,
  ClientValidation
} from '../../models/client-config.model';
import { DEFAULT_FEATURE_FLAGS } from '../../models/feature-config.model';

/**
 * Knows which clients exist (client-selector.json), which one is active, and
 * how to fetch a client's configuration. Nothing outside the config layer
 * should ever compare client keys — consume the resolved services instead.
 *
 * API-ready: the two fetches map 1:1 onto `GET /clients` and
 * `GET /clients/{key}`.
 */
@Injectable({ providedIn: 'root' })
export class ClientConfigService {
  private readonly http = inject(HttpClient);
  private readonly _registry = signal<ClientRegistry | null>(null);
  private readonly _active = signal<ClientConfig | null>(null);
  private readonly cache = new Map<string, Promise<ClientConfig>>();

  readonly registry = this._registry.asReadonly();
  readonly activeClient = this._active.asReadonly();
  readonly availableClientKeys = computed(
    () => this._registry()?.clients.map((c) => c.key) ?? []
  );
  /** Key of the client in use; the registry's default until a client is loaded. */
  readonly activeClientKey = computed(
    () => this._active()?.clientKey ?? this._registry()?.activeClientKey ?? 'DEFAULT'
  );

  getActiveClientKey(): string {
    return this.activeClientKey();
  }

  getActiveClientConfig(): ClientConfig | null {
    return this._active();
  }

  hasClient(key: string): boolean {
    return this.availableClientKeys().includes(key);
  }

  /** Fetches (and memoises) one client's configuration file. */
  getClientConfig(key: string): Promise<ClientConfig> {
    const entry = this.entryFor(key);
    if (!entry) return Promise.reject(new Error(`Unknown client "${key}"`));
    let pending = this.cache.get(key);
    if (!pending) {
      pending = firstValueFrom(
        this.http.get<ClientConfig>(`${CONFIG_BASE_PATH}/${entry.file}`)
      ).catch((err) => {
        this.cache.delete(key); // allow a retry
        throw err;
      });
      this.cache.set(key, pending);
    }
    return pending;
  }

  /** Every registered client — used only by the development switcher. */
  loadAllClients(): Promise<ClientConfig[]> {
    return Promise.all(this.availableClientKeys().map((k) => this.getClientConfig(k)));
  }

  /** Folder a data resource is read from: the client's own, or the shared one. */
  dataPathFor(resource: DataResource): string {
    const data = this._active()?.data;
    return data?.path && data.clientResources?.includes(resource) ? data.path : DATA_BASE_PATH;
  }

  /** Called by ConfigLoaderService. */
  setRegistry(registry: ClientRegistry): void {
    this._registry.set(registry);
  }

  /** Called by ConfigLoaderService once the client passed validation. */
  setActive(config: ClientConfig): void {
    this._active.set(config);
  }

  /**
   * Structural validation. `errors` stop the app (a clear error state);
   * `warnings` are logged in dev mode and the value falls back to a default.
   */
  validate(config: ClientConfig, expectedKey: string, themeKeys: readonly string[]): ClientValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config || typeof config !== 'object') {
      return { errors: ['Client configuration file is empty or not an object.'], warnings };
    }
    if (config.clientKey !== expectedKey) {
      errors.push(`clientKey "${config.clientKey}" does not match registry key "${expectedKey}".`);
    }
    if (!Object.values(BUSINESS_MODES).includes(config.businessMode)) {
      errors.push(
        `businessMode "${config.businessMode}" is not one of ${Object.values(BUSINESS_MODES).join(', ')}.`
      );
    }
    if (!config.business?.name?.trim()) errors.push('business.name is required.');
    if (!config.business?.tagline?.trim()) warnings.push('business.tagline is empty.');
    if (!config.business?.currency) errors.push('business.currency is required.');

    if (!config.theme?.themeKey) {
      warnings.push('theme.themeKey is missing — the default theme will be used.');
    } else if (!themeKeys.includes(config.theme.themeKey)) {
      warnings.push(
        `theme.themeKey "${config.theme.themeKey}" is not in themes.json — the default theme will be used. ` +
          `Available: ${themeKeys.join(', ')}.`
      );
    }

    if (config.features !== undefined) {
      if (typeof config.features !== 'object' || Array.isArray(config.features)) {
        errors.push('features must be an object of boolean flags.');
      } else {
        for (const [key, value] of Object.entries(config.features)) {
          if (!(key in DEFAULT_FEATURE_FLAGS)) warnings.push(`features.${key} is not a known feature flag.`);
          else if (typeof value !== 'boolean') errors.push(`features.${key} must be true or false.`);
        }
      }
    }

    if (config.menus !== undefined) {
      if (!Array.isArray(config.menus)) {
        errors.push('menus must be an array of menu items.');
      } else {
        config.menus.forEach((m, i) => {
          if (!m?.id) errors.push(`menus[${i}] has no id.`);
          else if (!isRouteKey(m.id)) warnings.push(`menus[${i}].id "${m.id}" has no route access rule.`);
        });
      }
    }

    return { errors, warnings };
  }

  private entryFor(key: string): ClientRegistryEntry | undefined {
    return this._registry()?.clients.find((c) => c.key === key);
  }
}
