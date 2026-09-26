import { Injectable, computed, inject, signal } from '@angular/core';
import { isRouteKey } from '../../config/route-access.config';
import { DEFAULT_MENU_CONFIG, MenuConfig, MenuItem } from '../../models/menu-config.model';
import { AccessService } from './access.service';
import { PermissionConfigService } from './permission-config.service';

/**
 * Navigation derived purely from menu-config.json, filtered through the
 * shared access rules. A menu entry whose destination is blocked by business
 * mode, feature flags or permissions is dropped even if `enabled: true`.
 */
@Injectable({ providedIn: 'root' })
export class MenuConfigService {
  private readonly access = inject(AccessService);
  private readonly permissions = inject(PermissionConfigService);
  private readonly _config = signal<MenuConfig>(DEFAULT_MENU_CONFIG);

  readonly allMenus = computed(() => this._config().menus);

  readonly enabledMenus = computed<MenuItem[]>(() =>
    this.allMenus()
      .filter((m) => m.enabled && this.isReachable(m))
      .sort((a, b) => a.order - b.order)
  );

  readonly primaryMenus = computed(() =>
    this.enabledMenus().filter((m) => (m.group ?? 'primary') === 'primary')
  );
  readonly secondaryMenus = computed(() =>
    this.enabledMenus().filter((m) => m.group === 'secondary')
  );

  isMenuEnabled(id: string): boolean {
    return this.enabledMenus().some((m) => m.id === id);
  }

  getMenu(id: string): MenuItem | undefined {
    return this.enabledMenus().find((m) => m.id === id);
  }

  private isReachable(menu: MenuItem): boolean {
    if (!this.permissions.hasPermission(menu.permission)) return false;
    // Unknown ids (e.g. a client-specific static page) are only gated by `enabled`.
    return isRouteKey(menu.id) ? this.access.canAccess(menu.id) : true;
  }

  /** Called once by ConfigLoaderService. */
  set(config: MenuConfig): void {
    this._config.set(config);
  }
}
