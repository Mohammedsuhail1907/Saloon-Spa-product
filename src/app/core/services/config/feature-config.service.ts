import { Injectable, computed, inject, signal } from '@angular/core';
import { DEFAULT_FEATURE_FLAGS, FeatureFlags, FeatureKey } from '../../models/feature-config.model';
import { BookingConfigService } from './booking-config.service';
import { BusinessConfigService } from './business-config.service';

/**
 * Feature switches. Getters here already fold in business-mode and booking
 * rule precedence, so components ask one question and get the final answer.
 */
@Injectable({ providedIn: 'root' })
export class FeatureConfigService {
  private readonly business = inject(BusinessConfigService);
  private readonly booking = inject(BookingConfigService);
  private readonly _flags = signal<FeatureFlags>(DEFAULT_FEATURE_FLAGS);

  readonly flags = this._flags.asReadonly();

  /** Raw flag lookup; prefer the typed getters below in components. */
  isEnabled(key: FeatureKey): boolean {
    return this._flags()[key];
  }

  /* ------------------------------ booking ------------------------------ */

  readonly isBookingEnabled = computed(
    () => this._flags().onlineBooking && this.booking.isEnabled()
  );
  readonly isSlotBookingEnabled = computed(
    () => this.isBookingEnabled() && this._flags().slotBooking && this.booking.isSlotMode()
  );
  readonly isStylistSelectionEnabled = computed(
    () =>
      this.business.isSalonStaffEnabled() &&
      this._flags().stylistSelection &&
      this.booking.allowStylistSelection()
  );
  readonly isTherapistSelectionEnabled = computed(
    () =>
      this.business.isSpaStaffEnabled() &&
      this._flags().therapistSelection &&
      this.booking.allowTherapistSelection()
  );
  readonly isWhatsappBookingEnabled = computed(
    () => this._flags().whatsappBooking && !!this.business.whatsappNumber()
  );
  readonly isCallBookingEnabled = computed(
    () => this._flags().callBooking && !!this.business.contact().phone
  );

  /* ---------------------------- appointments --------------------------- */

  readonly isCustomerDashboardEnabled = computed(() => this._flags().customerDashboard);
  readonly isAppointmentHistoryEnabled = computed(
    () => this.isCustomerDashboardEnabled() && this._flags().appointmentHistory
  );
  readonly isRescheduleEnabled = computed(
    () => this._flags().appointmentReschedule && this.booking.allowReschedule()
  );
  readonly isCancellationEnabled = computed(
    () => this._flags().appointmentCancellation && this.booking.allowCancellation()
  );

  /* ------------------------------ modules ------------------------------ */

  readonly isPackagesEnabled = computed(() => this._flags().servicePackages);
  readonly isPackageBuilderEnabled = computed(() => this._flags().customPackageBuilder);
  readonly isMembershipEnabled = computed(() => this._flags().membership);
  readonly isGiftCardEnabled = computed(() => this._flags().giftCards);
  readonly isOffersEnabled = computed(() => this._flags().offers);
  readonly isReviewsEnabled = computed(() => this._flags().reviews);
  readonly isGalleryEnabled = computed(() => this._flags().gallery);
  readonly isBeforeAfterEnabled = computed(
    () => this._flags().beforeAfterGallery && this.business.isSalonEnabled()
  );
  readonly isBeautyQuizEnabled = computed(() => this._flags().beautyQuiz);
  readonly isRecommendationsEnabled = computed(() => this._flags().recommendations);
  readonly isLiveAvailabilityEnabled = computed(() => this._flags().liveAvailability);
  readonly isProductsEnabled = computed(() => this._flags().products);
  readonly isProductRecommendationsEnabled = computed(
    () => this.isProductsEnabled() && this._flags().productRecommendations
  );
  readonly isNotificationsEnabled = computed(() => this._flags().notifications);
  readonly isRelaxationModeEnabled = computed(
    () => this.business.isSpaEnabled() && this._flags().relaxationMode
  );

  /** Called once by ConfigLoaderService. */
  set(flags: FeatureFlags): void {
    this._flags.set(flags);
  }
}
