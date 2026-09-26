import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import {
  GIFT_CARD_AMOUNTS,
  GIFT_CARD_EXPERIENCES
} from '../../core/data/membership.mock';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { NotificationService } from '../../core/services/notification.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-gift-cards-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectButtonModule,
    TextareaModule,
    RevealDirective,
    PricePipe
  ],
  templateUrl: './gift-cards.html'
})
export class GiftCardsPage {
  protected readonly config = inject(BusinessConfigService);
  private readonly bookingState = inject(BookingService);
  private readonly notify = inject(NotificationService);

  protected readonly amountOptions = [
    ...GIFT_CARD_AMOUNTS.map((a) => ({ label: `₹${a.toLocaleString('en-IN')}`, value: a })),
    { label: 'Custom', value: 0 }
  ];

  protected readonly experiences = computed(() =>
    GIFT_CARD_EXPERIENCES.filter((e) => {
      if (e.type === 'BOTH') return this.config.isSalonEnabled() && this.config.isSpaEnabled();
      return e.type === 'SALON' ? this.config.isSalonEnabled() : this.config.isSpaEnabled();
    })
  );

  protected readonly amountChoice = signal(2500);
  protected readonly customAmount = signal<number | null>(null);
  protected readonly experience = signal('');
  protected readonly to = signal('');
  protected readonly from = signal('');
  protected readonly message = signal('');

  protected readonly effectiveAmount = computed(() =>
    this.amountChoice() === 0 ? this.customAmount() ?? 0 : this.amountChoice()
  );

  protected readonly experienceLabel = computed(
    () =>
      this.experiences().find((e) => e.id === this.experience())?.label ??
      this.experiences()[0]?.label ??
      'Experience'
  );

  protected readonly valid = computed(
    () =>
      this.effectiveAmount() >= 500 &&
      this.to().trim().length >= 2 &&
      this.from().trim().length >= 2
  );

  create(): void {
    if (!this.valid()) {
      this.notify.warn('Almost there', 'Add names and an amount of at least ₹500.');
      return;
    }
    const card = this.bookingState.addGiftCard({
      amount: this.effectiveAmount(),
      experience: this.experienceLabel(),
      to: this.to().trim(),
      from: this.from().trim(),
      message: this.message().trim() || undefined
    });
    this.notify.success('Gift card created', `${card.id} — find it under My Experiences.`);
  }
}
