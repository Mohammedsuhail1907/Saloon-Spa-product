import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';
import { ConfigLoadError } from './core/models/client-config.model';
import { ConfigLoaderService } from './core/services/config/config-loader.service';

/** Stand-in for the real loader so specs don't fetch assets/config over HTTP. */
function loaderStub(error: ConfigLoadError | null): Partial<ConfigLoaderService> {
  const failed = !!error;
  return {
    load: () => Promise.resolve(),
    status: signal(failed ? 'error' : 'ready').asReadonly(),
    error: signal(error).asReadonly(),
    isReady: signal(!failed).asReadonly(),
    hasFailed: signal(failed).asReadonly()
  } as Partial<ConfigLoaderService>;
}

describe('App', () => {
  async function setup(error: ConfigLoadError | null = null) {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers, { provide: ConfigLoaderService, useValue: loaderStub(error) }]
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture;
  }

  it('should create the app shell', async () => {
    const fixture = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the header and main outlet when configuration loaded', async () => {
    const fixture = await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-header')).toBeTruthy();
    expect(el.querySelector('main')).toBeTruthy();
  });

  it('should show a calm error state with developer details when configuration failed', async () => {
    const fixture = await setup({
      message: 'Active client configuration "CLIENT_XYZ" was not found.',
      details: ['Available clients:', 'CLIENT_SALON_001']
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.config-error')).toBeTruthy();
    expect(el.querySelector('app-header')).toBeNull();
    expect(el.textContent).toContain('CLIENT_XYZ');
    // Karma runs in dev mode, so the developer hints are rendered.
    expect(el.querySelector('.config-error__details')?.textContent).toContain('CLIENT_SALON_001');
  });
});
