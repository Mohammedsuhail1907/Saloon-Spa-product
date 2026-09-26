import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IsActiveMatchOptions, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { NotificationService } from '../../core/services/notification.service';
import { UiStateService } from '../../core/services/ui-state.service';

interface NavItem {
  label: string;
  link: string;
  query?: Record<string, string>;
  icon?: string;
}

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, ButtonModule, DrawerModule, TooltipModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  protected readonly config = inject(BusinessConfigService);
  protected readonly ui = inject(UiStateService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  protected readonly homeMatch: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'exact',
    matrixParams: 'ignored',
    fragment: 'ignored'
  };
  protected readonly subsetMatch: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'subset',
    matrixParams: 'ignored',
    fragment: 'ignored'
  };

  /** Primary navigation, derived entirely from the business configuration. */
  protected readonly navItems = computed<NavItem[]>(() => {
    const c = this.config;
    const items: NavItem[] = [{ label: 'Home', link: '/', icon: 'pi pi-home' }];

    if (c.isBothEnabled()) {
      items.push(
        { label: 'Salon', link: '/services', query: { type: 'SALON' }, icon: 'pi pi-sparkles' },
        { label: 'Spa', link: '/services', query: { type: 'SPA' }, icon: 'pi pi-moon' }
      );
    } else {
      items.push({ label: c.servicesLabel(), link: '/services', icon: 'pi pi-sparkles' });
    }
    if (c.isSalonStaffEnabled() || c.isSpaStaffEnabled()) {
      items.push({ label: c.professionalsLabel(), link: '/professionals', icon: 'pi pi-users' });
    }
    if (c.isOffersEnabled()) items.push({ label: 'Offers', link: '/offers', icon: 'pi pi-tag' });
    if (c.isGalleryEnabled()) items.push({ label: 'Gallery', link: '/gallery', icon: 'pi pi-images' });
    if (c.isMembershipEnabled()) {
      items.push({ label: 'Membership', link: '/membership', icon: 'pi pi-star' });
    }
    items.push({ label: 'Contact', link: '/contact', icon: 'pi pi-map-marker' });
    return items;
  });

  /** Extra destinations surfaced in the mobile drawer. */
  protected readonly drawerExtras = computed<NavItem[]>(() => {
    const c = this.config;
    const items: NavItem[] = [];
    if (c.isBeautyQuizEnabled()) {
      items.push({ label: 'Find Your Experience', link: '/quiz', icon: 'pi pi-compass' });
    }
    if (c.isPackagesEnabled()) {
      items.push({ label: 'Experience Builder', link: '/experience-builder', icon: 'pi pi-sliders-h' });
    }
    if (c.isGiftCardEnabled()) {
      items.push({ label: 'Gift Cards', link: '/gift-cards', icon: 'pi pi-gift' });
    }
    items.push({ label: 'My Appointments', link: '/appointments', icon: 'pi pi-user' });
    return items;
  });

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }

  bookNow(): void {
    this.menuOpen.set(false);
    void this.router.navigate(['/booking']);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleRelax(): void {
    const on = this.ui.toggleRelaxMode();
    on
      ? this.notify.info('Relaxation mode on', 'Softer colours, slower pace. Breathe.')
      : this.notify.info('Relaxation mode off');
  }
}
