import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { NotificationService } from '../../core/services/notification.service';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-contact-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    RevealDirective
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class ContactPage {
  protected readonly config = inject(BusinessConfigService);
  private readonly notify = inject(NotificationService);

  protected readonly subjects = computed(() => {
    const subjects = ['General enquiry', 'Booking help', 'Feedback'];
    if (this.config.isMembershipEnabled()) subjects.push('Membership');
    if (this.config.isGiftCardEnabled()) subjects.push('Gift cards');
    subjects.push('Bridal & events');
    return subjects.map((s) => ({ label: s, value: s }));
  });

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly subject = signal('General enquiry');
  protected readonly message = signal('');

  protected readonly valid = computed(
    () =>
      this.name().trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email().trim()) &&
      this.message().trim().length >= 5
  );

  send(): void {
    if (!this.valid()) {
      this.notify.warn('Almost there', 'Please fill in your name, email and message.');
      return;
    }
    this.notify.success('Message sent', 'We’ll get back to you within a day. (Demo — not actually sent.)');
    this.name.set('');
    this.email.set('');
    this.message.set('');
  }
}
