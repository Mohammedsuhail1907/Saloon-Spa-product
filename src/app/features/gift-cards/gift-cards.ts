import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/config/business-config.service';
import { ContentConfigService } from '../../core/services/config/content-config.service';
import { GiftCardService } from '../../core/services/data/gift-card.service';
import { NotificationService } from '../../core/services/notification.service';
import { DataState } from '../../shared/components/data-state/data-state';
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
    DataState,
    RevealDirective,
    PricePipe
  ],
  templateUrl: './gift-cards.html',
  styleUrl: './gift-cards.scss'
})
export class GiftCardsPage {
  protected readonly business = inject(BusinessConfigService);
  protected readonly content = inject(ContentConfigService);
  protected readonly giftCards = inject(GiftCardService);
  private readonly bookingState = inject(BookingService);
  private readonly notify = inject(NotificationService);

  protected readonly pageHero = computed(() => this.content.page('giftCards'));

  constructor() {
    void this.giftCards.load();
  }

  protected readonly amountOptions = computed(() => [
    ...this.giftCards.amounts().map((a) => ({ label: this.business.formatPrice(a), value: a })),
    { label: 'Custom', value: 0 }
  ]);

  protected readonly experiences = this.giftCards.experiences;

  /** Defaults to the middle preset once amounts arrive. */
  protected readonly amountChoice = linkedSignal<number>(() => {
    const amounts = this.giftCards.amounts();
    return amounts[Math.floor(amounts.length / 2)] ?? 0;
  });
  protected readonly customAmount = signal<number | null>(null);
  protected readonly experience = linkedSignal<string>(() => this.experiences()[0]?.id ?? '');
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
      this.effectiveAmount() >= this.giftCards.minimumAmount() &&
      this.to().trim().length >= 2 &&
      this.from().trim().length >= 2
  );

  create(): void {
    if (!this.valid()) {
      this.notify.warn(
        'Almost there',
        `Add names and an amount of at least ${this.business.formatPrice(this.giftCards.minimumAmount())}.`
      );
      return;
    }
    const card = this.bookingState.addGiftCard({
      amount: this.effectiveAmount(),
      experience: this.experienceLabel(),
      to: this.to().trim(),
      from: this.from().trim(),
      message: this.message().trim() || undefined
    });
    this.notify.success('Gift card created', `${card.id} — find it under My Appointments.`);
  }
}
