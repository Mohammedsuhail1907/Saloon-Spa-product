import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ClientConfig } from '../../models/client-config.model';
import { ClientConfigService } from './client-config.service';

const REGISTRY = {
  activeClientKey: 'CLIENT_SALON_001',
  clients: [
    { key: 'CLIENT_SALON_001', file: 'clients/client-salon-001.json' },
    { key: 'CLIENT_SPA_001', file: 'clients/client-spa-001.json' }
  ]
};

const THEMES = ['LUXURY_GOLD', 'SAGE_SERENITY'];

function client(overrides: Partial<ClientConfig> = {}): ClientConfig {
  return {
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
    theme: { themeKey: 'LUXURY_GOLD' },
    ...overrides
  };
}

describe('ClientConfigService', () => {
  let service: ClientConfigService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ClientConfigService);
    http = TestBed.inject(HttpTestingController);
    service.setRegistry(REGISTRY);
  });

  it('exposes the registry and the active key', () => {
    expect(service.availableClientKeys()).toEqual(['CLIENT_SALON_001', 'CLIENT_SPA_001']);
    expect(service.hasClient('CLIENT_SPA_001')).toBeTrue();
    expect(service.hasClient('CLIENT_XYZ')).toBeFalse();
    expect(service.getActiveClientKey()).toBe('CLIENT_SALON_001');
  });

  it('fetches a client file once and memoises it', async () => {
    const first = service.getClientConfig('CLIENT_SPA_001');
    const second = service.getClientConfig('CLIENT_SPA_001');
    const req = http.expectOne('assets/config/clients/client-spa-001.json');
    req.flush(client({ clientKey: 'CLIENT_SPA_001', businessMode: 'SPA_ONLY' }));
    expect((await first).clientKey).toBe('CLIENT_SPA_001');
    expect(await second).toBe(await first);
    http.verify();
  });

  it('rejects unknown keys without a request', async () => {
    await expectAsync(service.getClientConfig('CLIENT_XYZ')).toBeRejected();
    http.expectNone(() => true);
  });

  it('routes data reads to the client folder only for listed resources', () => {
    expect(service.dataPathFor('services')).toBe('assets/data');
    service.setActive(
      client({ data: { path: 'assets/data/clients/client-salon-001', clientResources: ['services'] } })
    );
    expect(service.dataPathFor('services')).toBe('assets/data/clients/client-salon-001');
    expect(service.dataPathFor('addons')).toBe('assets/data');
  });

  describe('validate', () => {
    it('accepts a well-formed client', () => {
      const result = service.validate(client(), 'CLIENT_SALON_001', THEMES);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('reports key mismatch, bad business mode and missing name as errors', () => {
      const bad = client({
        clientKey: 'CLIENT_OTHER',
        businessMode: 'HOTEL' as never,
        business: { ...client().business, name: '' }
      });
      const { errors } = service.validate(bad, 'CLIENT_SALON_001', THEMES);
      expect(errors.some((e) => e.includes('does not match'))).toBeTrue();
      expect(errors.some((e) => e.includes('businessMode'))).toBeTrue();
      expect(errors.some((e) => e.includes('business.name'))).toBeTrue();
    });

    it('treats an unknown theme key as a warning so production falls back safely', () => {
      const { errors, warnings } = service.validate(
        client({ theme: { themeKey: 'NOPE' } }),
        'CLIENT_SALON_001',
        THEMES
      );
      expect(errors).toEqual([]);
      expect(warnings.some((w) => w.includes('NOPE'))).toBeTrue();
    });

    it('validates feature flag types and menu ids', () => {
      const { errors, warnings } = service.validate(
        client({
          features: { membership: 'yes' as never, unicorns: true } as never,
          menus: [{ id: 'home' }, { id: 'nowhere' as never }, {} as never]
        }),
        'CLIENT_SALON_001',
        THEMES
      );
      expect(errors.some((e) => e.includes('features.membership'))).toBeTrue();
      expect(errors.some((e) => e.includes('menus[2] has no id'))).toBeTrue();
      expect(warnings.some((w) => w.includes('features.unicorns'))).toBeTrue();
      expect(warnings.some((w) => w.includes('"nowhere"'))).toBeTrue();
    });
  });
});
