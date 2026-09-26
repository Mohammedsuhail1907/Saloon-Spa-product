import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';
import { ConfigLoaderService } from './core/services/config/config-loader.service';

/** Stand-in for the real loader so specs don't fetch assets/config over HTTP. */
function loaderStub(failed: boolean): Partial<ConfigLoaderService> {
  return {
    load: () => Promise.resolve(),
    status: signal(failed ? 'error' : 'ready').asReadonly(),
    error: signal(failed ? 'Configuration could not be loaded.' : null).asReadonly(),
    isReady: signal(!failed).asReadonly(),
    hasFailed: signal(failed).asReadonly()
  } as Partial<ConfigLoaderService>;
}

describe('App', () => {
  async function setup(failed = false) {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...appConfig.providers, { provide: ConfigLoaderService, useValue: loaderStub(failed) }]
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

  it('should show a calm error state instead of the shell when configuration failed', async () => {
    const fixture = await setup(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.config-error')).toBeTruthy();
    expect(el.querySelector('app-header')).toBeNull();
  });
});
