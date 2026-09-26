import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FeatureFlags } from '../models/business-config.model';
import { BusinessConfigService } from '../services/business-config.service';

/** Blocks routes whose feature flag is disabled in the business config. */
export const featureGuard = (flag: keyof FeatureFlags): CanActivateFn => () => {
  const config = inject(BusinessConfigService);
  const router = inject(Router);
  return config.hasFeature(flag) ? true : router.createUrlTree(['/']);
};
