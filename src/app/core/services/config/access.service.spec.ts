import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_BOOKING_RULES } from '../../models/booking-config.model';
import { BusinessConfig, DEFAULT_BUSINESS_CONFIG } from '../../models/business-config.model';
import { DEFAULT_FEATURE_FLAGS, FeatureFlags } from '../../models/feature-config.model';
import { DEFAULT_PERMISSION_CONFIG } from '../../models/permission-config.model';
import { AccessService } from './access.service';
import { BookingConfigService } from './booking-config.service';
import { BusinessConfigService } from './business-config.service';
import { FeatureConfigService } from './feature-config.service';
import { PermissionConfigService } from './permission-config.service';

/** Applies a scenario the same way ConfigLoaderService would. */
function configure(
  business: Partial<BusinessConfig>,
  features: Partial<FeatureFlags>,
  booking: Partial<typeof DEFAULT_BOOKING_RULES> = {}
): void {
  TestBed.inject(BusinessConfigService).set({ ...DEFAULT_BUSINESS_CONFIG, ...business });
  TestBed.inject(FeatureConfigService).set({ ...DEFAULT_FEATURE_FLAGS, ...features });
  TestBed.inject(BookingConfigService).set({ ...DEFAULT_BOOKING_RULES, ...booking });
  TestBed.inject(PermissionConfigService).set(DEFAULT_PERMISSION_CONFIG);
}

describe('AccessService', () => {
  let access: AccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    access = TestBed.inject(AccessService);
  });

  describe('Scenario 1 — SALON_ONLY, booking on, membership/gift cards off', () => {
    beforeEach(() =>
      configure(
        { businessMode: 'SALON_ONLY' },
        { onlineBooking: true, membership: false, giftCards: false }
      )
    );

    it('opens salon and blocks spa', () => {
      expect(access.canAccess('salon')).toBeTrue();
      expect(access.canAccess('spa')).toBeFalse();
    });

    it('allows booking but not membership or gift cards', () => {
      expect(access.canAccess('booking')).toBeTrue();
      expect(access.canAccess('membership')).toBeFalse();
      expect(access.canAccess('gift-cards')).toBeFalse();
    });

    it('still lists professionals because stylists are enabled', () => {
      expect(access.canAccess('professionals')).toBeTrue();
    });
  });

  describe('Scenario 2 — SPA_ONLY, booking on, membership on', () => {
    beforeEach(() => configure({ businessMode: 'SPA_ONLY' }, { onlineBooking: true, membership: true }));

    it('opens spa and blocks salon', () => {
      expect(access.canAccess('spa')).toBeTrue();
      expect(access.canAccess('salon')).toBeFalse();
    });

    it('allows membership', () => {
      expect(access.canAccess('membership')).toBeTrue();
    });
  });

  describe('Scenario 3 — SALON_AND_SPA with every module on', () => {
    beforeEach(() =>
      configure(
        { businessMode: 'SALON_AND_SPA' },
        {
          onlineBooking: true,
          membership: true,
          giftCards: true,
          customPackageBuilder: true,
          gallery: true,
          offers: true
        }
      )
    );

    it('opens every destination', () => {
      for (const key of [
        'salon',
        'spa',
        'booking',
        'membership',
        'gift-cards',
        'experience-builder',
        'gallery',
        'offers'
      ] as const) {
        expect(access.canAccess(key)).withContext(key).toBeTrue();
      }
    });
  });

  describe('precedence', () => {
    it('business config wins over feature flags (spa disabled in section config)', () => {
      configure(
        {
          businessMode: 'SALON_AND_SPA',
          spa: { enabled: false, servicesEnabled: true, therapistsEnabled: true }
        },
        {}
      );
      expect(access.canAccess('spa')).toBeFalse();
    });

    it('booking rules win over the onlineBooking flag', () => {
      configure({}, { onlineBooking: true }, { enabled: false });
      expect(access.canAccess('booking')).toBeFalse();
    });

    it('blocks professionals when no staff type is enabled', () => {
      configure(
        {
          salon: { enabled: true, servicesEnabled: true, stylistsEnabled: false },
          spa: { enabled: true, servicesEnabled: true, therapistsEnabled: false }
        },
        {}
      );
      expect(access.canAccess('professionals')).toBeFalse();
    });

    it('honours permissions', () => {
      configure({}, { customerDashboard: true });
      TestBed.inject(PermissionConfigService).set({
        currentRole: 'KIOSK',
        roles: { KIOSK: { label: 'Kiosk', permissions: ['catalog:view', 'booking:create'] } }
      });
      expect(access.canAccess('appointments')).toBeFalse();
      expect(access.canAccess('booking')).toBeTrue();
    });
  });
});
