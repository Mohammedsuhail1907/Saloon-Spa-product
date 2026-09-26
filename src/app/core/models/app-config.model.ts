export type DataSource = 'ASSETS' | 'API';

export type AppEnvironment = 'LOCAL' | 'DEV' | 'STAGING' | 'PRODUCTION';

/**
 * Deployment-level settings. Which client is active is NOT here — that is
 * assets/config/client-selector.json, the one value a tester changes.
 */
export interface AppConfig {
  environment: AppEnvironment;
  /** ASSETS reads JSON from assets/data; API calls `${apiBaseUrl}/…`. */
  dataSource: DataSource;
  apiBaseUrl: string;
  /** Route users land on and are sent to when access is denied. */
  defaultRoute: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  environment: 'LOCAL',
  dataSource: 'ASSETS',
  apiBaseUrl: '',
  defaultRoute: '/'
};
