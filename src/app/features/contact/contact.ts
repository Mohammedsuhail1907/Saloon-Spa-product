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
import { BusinessConfigService } from '../../core/services/config/business-config.service';
import { ContentConfigService } from '../../core/services/config/content-config.service';
import { FeatureConfigService } from '../../core/services/config/feature-config.service';
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
  protected readonly business = inject(BusinessConfigService);
  protected readonly features = inject(FeatureConfigService);
  protected readonly content = inject(ContentConfigService);
  private readonly notify = inject(NotificationService);

  protected readonly pageHero = computed(() => this.content.page('contact'));

  /** Client subjects plus module-specific ones when those modules are on. */
  protected readonly subjects = computed(() => {
    const subjects = [...this.content.contactSubjects()];
    if (this.features.isMembershipEnabled()) subjects.push('Membership');
    if (this.features.isGiftCardEnabled()) subjects.push('Gift cards');
    return [...new Set(subjects)].map((s) => ({ label: s, value: s }));
  });

  protected readonly whatsappHref = computed(
    () => `https://wa.me/${this.business.whatsappNumber()}`
  );
  protected readonly phoneHref = computed(
    () => `tel:${this.business.contact().phone.replace(/[^\d+]/g, '')}`
  );
  protected readonly mailHref = computed(() => `mailto:${this.business.contact().email}`);

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly subject = signal(this.subjects()[0]?.value ?? '');
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
