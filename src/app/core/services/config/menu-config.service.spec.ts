import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_BUSINESS_CONFIG } from '../../models/business-config.model';
import { DEFAULT_FEATURE_FLAGS } from '../../models/feature-config.model';
import { MenuItem } from '../../models/menu-config.model';
import { BusinessConfigService } from './business-config.service';
import { FeatureConfigService } from './feature-config.service';
import { MenuConfigService } from './menu-config.service';

const MENUS: MenuItem[] = [
  { id: 'contact', label: 'Contact', route: '/contact', enabled: true, order: 9 },
  { id: 'home', label: 'Home', route: '/', enabled: true, order: 1 },
  { id: 'spa', label: 'Spa', route: '/spa', enabled: true, order: 3 },
  { id: 'salon', label: 'Salon', route: '/salon', enabled: true, order: 2 },
  { id: 'membership', label: 'Membership', route: '/membership', enabled: true, order: 8 },
  { id: 'gallery', label: 'Gallery', route: '/gallery', enabled: false, order: 7 },
  { id: 'booking', label: 'Book', route: '/booking', enabled: true, order: 20, group: 'secondary' }
];

describe('MenuConfigService', () => {
  let menus: MenuConfigService;
  let business: BusinessConfigService;
  let features: FeatureConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    menus = TestBed.inject(MenuConfigService);
    business = TestBed.inject(BusinessConfigService);
    features = TestBed.inject(FeatureConfigService);
    menus.set({ menus: MENUS });
    business.set(DEFAULT_BUSINESS_CONFIG);
    features.set({ ...DEFAULT_FEATURE_FLAGS, membership: true, gallery: true });
  });

  it('sorts by order and drops `enabled: false` items', () => {
    expect(menus.enabledMenus().map((m) => m.id)).toEqual([
      'home',
      'salon',
      'spa',
      'membership',
      'contact',
      'booking'
    ]);
    expect(menus.isMenuEnabled('gallery')).toBeFalse();
  });

  it('hides a menu whose feature is off even when the menu says enabled', () => {
    features.set({ ...DEFAULT_FEATURE_FLAGS, membership: false });
    expect(menus.isMenuEnabled('membership')).toBeFalse();
  });

  it('hides Spa in SALON_ONLY and Salon in SPA_ONLY', () => {
    business.set({ ...DEFAULT_BUSINESS_CONFIG, businessMode: 'SALON_ONLY' });
    expect(menus.isMenuEnabled('spa')).toBeFalse();
    expect(menus.isMenuEnabled('salon')).toBeTrue();

    business.set({ ...DEFAULT_BUSINESS_CONFIG, businessMode: 'SPA_ONLY' });
    expect(menus.isMenuEnabled('salon')).toBeFalse();
    expect(menus.isMenuEnabled('spa')).toBeTrue();
  });

  it('splits primary and secondary groups', () => {
    expect(menus.primaryMenus().some((m) => m.id === 'booking')).toBeFalse();
    expect(menus.secondaryMenus().map((m) => m.id)).toEqual(['booking']);
  });

  it('reflects label changes from configuration alone', () => {
    menus.set({ menus: MENUS.map((m) => (m.id === 'salon' ? { ...m, label: 'Hair Studio' } : m)) });
    expect(menus.getMenu('salon')?.label).toBe('Hair Studio');
  });
});
