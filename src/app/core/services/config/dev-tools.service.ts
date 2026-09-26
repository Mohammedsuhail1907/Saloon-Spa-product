import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, isDevMode, signal } from '@angular/core';
import { DEV_OVERRIDE_KEYS } from '../../constants/app.constants';
import { AppConfigService } from './app-config.service';
import { ThemeConfigService } from './theme-config.service';

/**
 * Development-only client/theme switcher state. Overrides live in
 * sessionStorage (gone when the tab closes) so testing never rewrites
 * client-selector.json — that file stays the source of truth.
 */
@Injectable({ providedIn: 'root' })
export class DevToolsService {
  private readonly app = inject(AppConfigService);
  private readonly theme = inject(ThemeConfigService);
  private readonly document = inject(DOCUMENT);
  private readonly _hasOverrides = signal(this.readOverrides());

  /** Never true in a production build or a PRODUCTION environment. */
  readonly enabled = computed(() => isDevMode() && !this.app.isProduction());
  readonly hasOverrides = this._hasOverrides.asReadonly();

  clientOverride(): string | null {
    return this.enabled() ? this.read(DEV_OVERRIDE_KEYS.client) : null;
  }

  themeOverride(): string | null {
    return this.enabled() ? this.read(DEV_OVERRIDE_KEYS.theme) : null;
  }

  /** Switching clients changes data paths and menus, so the app reloads. */
  switchClient(clientKey: string): void {
    this.write(DEV_OVERRIDE_KEYS.client, clientKey);
    this.reload();
  }

  /** Themes are pure CSS/PrimeNG tokens, so they apply immediately. */
  switchTheme(themeKey: string): boolean {
    if (!this.theme.activate(themeKey)) return false;
    this.write(DEV_OVERRIDE_KEYS.theme, themeKey);
    return true;
  }

  clearClientOverride(): void {
    this.remove(DEV_OVERRIDE_KEYS.client);
  }

  /** Back to exactly what the JSON files say. */
  reset(): void {
    this.remove(DEV_OVERRIDE_KEYS.client);
    this.remove(DEV_OVERRIDE_KEYS.theme);
    this.reload();
  }

  private reload(): void {
    this.document.defaultView?.location.reload();
  }

  private readOverrides(): boolean {
    return !!(this.read(DEV_OVERRIDE_KEYS.client) || this.read(DEV_OVERRIDE_KEYS.theme));
  }

  private read(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // sessionStorage unavailable — the switch still applies for this page.
    }
    this._hasOverrides.set(true);
  }

  private remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
    this._hasOverrides.set(this.readOverrides());
  }
}
