export type DataSource = 'ASSETS' | 'API';

export type AppEnvironment = 'LOCAL' | 'DEV' | 'STAGING' | 'PRODUCTION';

/** Deployment-level settings: which client, where data comes from. */
export interface AppConfig {
  clientId: string;
  environment: AppEnvironment;
  /** ASSETS reads JSON from assets/data; API calls `${apiBaseUrl}/…`. */
  dataSource: DataSource;
  apiBaseUrl: string;
  /** Route users land on and are sent to when access is denied. */
  defaultRoute: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  clientId: 'DEFAULT',
  environment: 'LOCAL',
  dataSource: 'ASSETS',
  apiBaseUrl: '',
  defaultRoute: '/'
};
