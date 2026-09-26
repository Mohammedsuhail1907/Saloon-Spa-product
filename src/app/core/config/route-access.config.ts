import { ServiceType } from '../constants/domain.constants';
import { FeatureKey } from '../models/feature-config.model';
import { PERMISSIONS, Permission } from '../models/permission-config.model';

/**
 * Single source of truth for "may this destination be reached?". Consumed by
 * the route guard AND the menu service, so a disabled feature disappears
 * from navigation and is blocked on direct URL entry with the same rule.
 */
export interface RouteAccessRule {
  /** Feature flag that must be on. */
  feature?: FeatureKey;
  /** Studio that must be enabled by business mode/config. */
  section?: ServiceType;
  /** Requires at least one professional type to be enabled. */
  staff?: boolean;
  /** Booking rules must have `enabled: true`. */
  booking?: boolean;
  permission?: Permission;
}

export const ROUTE_ACCESS = {
  home: {},
  services: { permission: PERMISSIONS.catalogView },
  salon: { section: 'SALON', permission: PERMISSIONS.catalogView },
  spa: { section: 'SPA', permission: PERMISSIONS.catalogView },
  professionals: { staff: true, permission: PERMISSIONS.catalogView },
  booking: { feature: 'onlineBooking', booking: true, permission: PERMISSIONS.bookingCreate },
  quiz: { feature: 'beautyQuiz' },
  gallery: { feature: 'gallery' },
  offers: { feature: 'offers' },
  membership: { feature: 'membership', permission: PERMISSIONS.membershipView },
  'gift-cards': { feature: 'giftCards', permission: PERMISSIONS.giftCardsCreate },
  'experience-builder': { feature: 'customPackageBuilder' },
  appointments: { feature: 'customerDashboard', permission: PERMISSIONS.appointmentsView },
  contact: {}
} as const satisfies Record<string, RouteAccessRule>;

export type RouteKey = keyof typeof ROUTE_ACCESS;

export const ROUTE_KEYS = Object.keys(ROUTE_ACCESS) as RouteKey[];

export function isRouteKey(value: string): value is RouteKey {
  return value in ROUTE_ACCESS;
}
