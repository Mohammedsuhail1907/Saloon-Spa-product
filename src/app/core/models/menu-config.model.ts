import { RouteKey } from '../config/route-access.config';

/**
 * Where a menu item is rendered. Header shows `primary`; the mobile drawer
 * shows both; the footer splits them into its two link columns.
 */
export type MenuGroup = 'primary' | 'secondary';

export interface MenuItem {
  /** Must match a RouteKey so access rules can be resolved. */
  id: RouteKey;
  label: string;
  route: string;
  icon?: string;
  enabled: boolean;
  order: number;
  group?: MenuGroup;
  /** Optional query params, e.g. { type: "SALON" }. */
  queryParams?: Record<string, string>;
  /** Extra permission required on top of the route's own rule. */
  permission?: string;
}

export interface MenuConfig {
  menus: MenuItem[];
}

export const DEFAULT_MENU_CONFIG: MenuConfig = { menus: [] };
