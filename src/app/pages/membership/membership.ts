import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MembershipPlan } from '../../core/models/catalog.model';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { CatalogService } from '../../core/services/catalog.service';
import { NotificationService } from '../../core/services/notification.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-membership-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AccordionModule, ButtonModule, TagModule, RevealDirective, PricePipe],
  templateUrl: './membership.html'
})
export class MembershipPage {
  protected readonly config = inject(BusinessConfigService);
  protected readonly catalog = inject(CatalogService);
  protected readonly bookingState = inject(BookingService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notify = inject(NotificationService);

  protected readonly faqs = [
    {
      q: 'How do monthly credits work?',
      a: 'Credits refresh on your billing date and can be used on any eligible treatment. Unused credits roll over for one month.'
    },
    {
      q: 'Can I share my membership?',
      a: 'The Elite Ritual plan includes guest passes; other plans are personal to you.'
    },
    {
      q: 'Can I pause or cancel?',
      a: 'Anytime — memberships pause from your next billing cycle with a single message to the studio.'
    },
    {
      q: 'Do discounts stack with offers?',
      a: 'Product discounts always apply. For treatment offers, the better price wins — we never make you do the math.'
    }
  ];

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
