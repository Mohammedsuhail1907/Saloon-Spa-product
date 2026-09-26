/**
 * Client-side access hints only. This shapes the UI (what is shown / which
 * routes open) and is NOT a security boundary — a real backend must enforce
 * authorization independently.
 */
export interface RoleDefinition {
  label: string;
  permissions: string[];
}

export interface PermissionConfig {
  /** Role the visitor is treated as until a real auth layer exists. */
  currentRole: string;
  roles: Record<string, RoleDefinition>;
}

/** Well-known permission strings referenced by route rules and menus. */
export const PERMISSIONS = {
  catalogView: 'catalog:view',
  bookingCreate: 'booking:create',
  appointmentsView: 'appointments:view',
  membershipView: 'membership:view',
  giftCardsCreate: 'giftcards:create'
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const DEFAULT_PERMISSION_CONFIG: PermissionConfig = {
  currentRole: 'GUEST',
  roles: {
    GUEST: {
      label: 'Guest',
      permissions: Object.values(PERMISSIONS)
    }
  }
};
