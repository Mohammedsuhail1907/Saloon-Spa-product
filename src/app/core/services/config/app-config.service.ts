import { Injectable, computed, signal } from '@angular/core';
import { ENV_API_BASE_URL } from '../../constants/app.constants';
import { AppConfig, DEFAULT_APP_CONFIG } from '../../models/app-config.model';

/** Deployment settings (client id, data source, API root, default route). */
@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly _config = signal<AppConfig>(DEFAULT_APP_CONFIG);

  readonly config = this._config.asReadonly();
  readonly clientId = computed(() => this._config().clientId);
  readonly environment = computed(() => this._config().environment);
  readonly dataSource = computed(() => this._config().dataSource);
  readonly defaultRoute = computed(() => this._config().defaultRoute || '/');
  /** Runtime value wins; the build-time environment is only a fallback. */
  readonly apiBaseUrl = computed(
    () => (this._config().apiBaseUrl || ENV_API_BASE_URL).replace(/\/+$/, '')
  );
  readonly isProduction = computed(() => this._config().environment === 'PRODUCTION');

  /** Called once by ConfigLoaderService. */
  set(config: AppConfig): void {
    this._config.set(config);
  }
}
