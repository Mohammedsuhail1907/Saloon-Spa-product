import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DividerModule } from 'primeng/divider';
import { BusinessConfigService } from '../../core/services/business-config.service';

interface FooterLink {
  label: string;
  link: string;
}

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DividerModule],
  templateUrl: './footer.html'
})
export class Footer {
  protected readonly config = inject(BusinessConfigService);
  protected readonly year = new Date().getFullYear();

  protected readonly exploreLinks = computed<FooterLink[]>(() => {
    const c = this.config;
    const links: FooterLink[] = [{ label: c.servicesLabel(), link: '/services' }];
    if (c.isSalonStaffEnabled() || c.isSpaStaffEnabled()) {
      links.push({ label: c.professionalsLabel(), link: '/professionals' });
    }
    if (c.isOffersEnabled()) links.push({ label: 'Offers', link: '/offers' });
    if (c.isGalleryEnabled()) links.push({ label: 'Gallery', link: '/gallery' });
    return links;
  });

  protected readonly experienceLinks = computed<FooterLink[]>(() => {
    const c = this.config;
    const links: FooterLink[] = [];
    if (c.isBookingEnabled()) links.push({ label: 'Book an Appointment', link: '/booking' });
    if (c.isBeautyQuizEnabled()) links.push({ label: 'Find Your Experience', link: '/quiz' });
    if (c.isPackagesEnabled()) links.push({ label: 'Experience Builder', link: '/experience-builder' });
    if (c.isMembershipEnabled()) links.push({ label: 'Membership', link: '/membership' });
    if (c.isGiftCardEnabled()) links.push({ label: 'Gift Cards', link: '/gift-cards' });
    links.push({ label: 'My Experiences', link: '/my-experiences' });
    return links;
  });
}
