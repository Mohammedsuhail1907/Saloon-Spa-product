import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ClientConfig, ClientRegistry } from '../../models/client-config.model';
import { DEFAULT_THEME, ThemeCatalog, ThemeDefinition } from '../../models/theme-config.model';
import { BusinessConfigService } from './business-config.service';
import { ConfigLoaderService } from './config-loader.service';
import { ThemeConfigService } from './theme-config.service';

const MIDNIGHT: ThemeDefinition = {
  ...DEFAULT_THEME,
  themeKey: 'MIDNIGHT_LUXURY',
  name: 'Midnight Luxury',
  colors: { ...DEFAULT_THEME.colors, primary: '#C9A961', background: '#14141A', text: '#F2EDE4' }
};

const THEMES: ThemeCatalog = { defaultThemeKey: 'LUXURY_GOLD', themes: [DEFAULT_THEME, MIDNIGHT] };

const CLIENT: ClientConfig = {
  clientKey: 'CLIENT_SALON_001',
  businessMode: 'SALON_ONLY',
  business: {
    name: 'Luxe Hair Studio',
    tagline: 'Style. Confidence. You.',
    currency: 'INR',
    locale: 'en-IN',
    contact: { phone: '', email: '' },
    address: { line1: '', city: '' },
    socialMedia: {}
  },
  theme: { themeKey: 'LUXURY_GOLD' }
};

const REGISTRY: ClientRegistry = {
  activeClientKey: 'CLIENT_SALON_001',
  activeThemeKey: '',
  clients: [{ key: 'CLIENT_SALON_001', file: 'clients/client-salon-001.json' }]
};

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('ConfigLoaderService', () => {
  let loader: ConfigLoaderService;
  let theme: ThemeConfigService;
  let business: BusinessConfigService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear(); // no dev-tools overrides leaking between specs
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    loader = TestBed.inject(ConfigLoaderService);
    theme = TestBed.inject(ThemeConfigService);
    business = TestBed.inject(BusinessConfigService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    theme.applyTheme(DEFAULT_THEME);
    http.verify();
  });

  /** Drives the loader through its request sequence with the given files. */
  async function run(registry: ClientRegistry, client: ClientConfig = CLIENT): Promise<void> {
    const done = loader.load();
    await tick();
    http.expectOne('assets/config/app-config.json').flush({
      environment: 'LOCAL',
      dataSource: 'ASSETS',
      apiBaseUrl: '',
      defaultRoute: '/'
    });
    await tick();
    http.expectOne('assets/config/client-selector.json').flush(registry);
    await tick();
    for (const req of http.match(() => true)) {
      const url = req.request.url;
      if (url.endsWith('client-salon-001.json')) req.flush(client);
      else if (url.endsWith('themes.json')) req.flush(THEMES);
      else req.flush(null, { status: 404, statusText: 'Not Found' }); // optional defaults
    }
    await done;
  }

  it("applies the client's own theme when activeThemeKey is empty", async () => {
    await run(REGISTRY);
    expect(loader.isReady()).toBeTrue();
    expect(business.name()).toBe('Luxe Hair Studio');
    expect(theme.activeThemeKey()).toBe('LUXURY_GOLD');
  });

  it('lets client-selector.json activeThemeKey override the client theme', async () => {
    await run({ ...REGISTRY, activeThemeKey: 'MIDNIGHT_LUXURY' });
    expect(loader.isReady()).toBeTrue();
    expect(theme.activeThemeKey()).toBe('MIDNIGHT_LUXURY');
    expect(document.documentElement.dataset['colorScheme']).toBe('dark');
  });

  it("falls back to the client's theme for an unknown activeThemeKey", async () => {
    await run({ ...REGISTRY, activeThemeKey: 'NOPE' });
    expect(loader.isReady()).toBeTrue();
    expect(theme.activeThemeKey()).toBe('LUXURY_GOLD');
  });

  it('reports an unknown activeClientKey with the available clients', async () => {
    await run({ ...REGISTRY, activeClientKey: 'CLIENT_XYZ' });
    expect(loader.hasFailed()).toBeTrue();
    expect(loader.error()?.message).toContain('CLIENT_XYZ');
    expect(loader.error()?.details).toContain('CLIENT_SALON_001');
  });
});
