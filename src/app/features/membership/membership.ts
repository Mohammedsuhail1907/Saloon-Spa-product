import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MembershipPlan } from '../../core/models/catalog.model';
import { BookingService } from '../../core/services/booking.service';
import { ContentConfigService } from '../../core/services/config/content-config.service';
import { MembershipService } from '../../core/services/data/membership.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataState } from '../../shared/components/data-state/data-state';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-membership-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccordionModule, ButtonModule, TagModule, DataState, RevealDirective, PricePipe],
  templateUrl: './membership.html',
  styleUrl: './membership.scss'
})
export class MembershipPage {
  protected readonly content = inject(ContentConfigService);
  protected readonly membershipService = inject(MembershipService);
  protected readonly bookingState = inject(BookingService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notify = inject(NotificationService);

  protected readonly pageHero = computed(() => this.content.page('membership'));
  protected readonly faqs = computed(() => this.content.membershipFaqs());

  constructor() {
    void this.membershipService.load();
  }

  activate(plan: MembershipPlan): void {
    this.confirmation.confirm({
      header: 'Activate membership',
      message: `Start the ${plan.name} plan for a demo membership? No payment is taken.`,
      acceptLabel: 'Activate',
      rejectLabel: 'Not now',
      accept: () => {
        this.bookingState.activateMembership(plan.name);
        this.notify.success('Membership activated', `Welcome to ${plan.name} ✨`);
      }
    });
  }
}
