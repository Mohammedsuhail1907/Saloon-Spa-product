import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RouteKey } from '../config/route-access.config';
import { AccessService } from '../services/config/access.service';
import { AppConfigService } from '../services/config/app-config.service';

/**
 * Blocks direct URL access to destinations the configuration has switched
 * off, using the same rule the menus use. Redirects to the configured
 * default route. This is a UX layer, not a security boundary.
 */
export const accessGuard =
  (key: RouteKey): CanActivateFn =>
  () => {
    const access = inject(AccessService);
    const router = inject(Router);
    const app = inject(AppConfigService);
    return access.canAccess(key) ? true : router.parseUrl(app.defaultRoute());
  };
