import { Injectable, inject } from '@angular/core';
import { ROUTE_ACCESS, RouteAccessRule, RouteKey } from '../../config/route-access.config';
import { BookingConfigService } from './booking-config.service';
import { BusinessConfigService } from './business-config.service';
import { FeatureConfigService } from './feature-config.service';
import { PermissionConfigService } from './permission-config.service';

/**
 * Resolves Business + Feature + Booking + Permission configuration into one
 * yes/no per destination. Used by both the route guard and the menu service
 * so navigation and URL access can never disagree.
 */
@Injectable({ providedIn: 'root' })
export class AccessService {
  private readonly business = inject(BusinessConfigService);
  private readonly features = inject(FeatureConfigService);
  private readonly booking = inject(BookingConfigService);
  private readonly permissions = inject(PermissionConfigService);

  canAccess(key: RouteKey): boolean {
    return this.evaluate(ROUTE_ACCESS[key]);
  }

  private evaluate(rule: RouteAccessRule): boolean {
    if (rule.section === 'SALON' && !this.business.isSalonEnabled()) return false;
    if (rule.section === 'SPA' && !this.business.isSpaEnabled()) return false;
    if (rule.staff && !this.business.isAnyStaffEnabled()) return false;
    if (rule.booking && !this.booking.isEnabled()) return false;
    if (rule.feature && !this.features.isEnabled(rule.feature)) return false;
    return this.permissions.hasPermission(rule.permission);
  }
}
