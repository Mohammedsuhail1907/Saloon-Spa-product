import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal
} from '@angular/core';
import { IsActiveMatchOptions, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { BusinessConfigService } from '../../core/services/config/business-config.service';
import { FeatureConfigService } from '../../core/services/config/feature-config.service';
import { MenuConfigService } from '../../core/services/config/menu-config.service';
import { NotificationService } from '../../core/services/notification.service';
import { UiStateService } from '../../core/services/ui-state.service';

/**
 * Site header. Navigation comes entirely from MenuConfigService — this
 * component holds no knowledge of which pages exist or when they apply.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, ButtonModule, DrawerModule, TooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  protected readonly business = inject(BusinessConfigService);
  protected readonly features = inject(FeatureConfigService);
  protected readonly menus = inject(MenuConfigService);
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
