import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { BusinessConfigService } from './core/services/config/business-config.service';
import { ConfigLoaderService } from './core/services/config/config-loader.service';
import { ContentConfigService } from './core/services/config/content-config.service';
import { FeatureConfigService } from './core/services/config/feature-config.service';
import { UiStateService } from './core/services/ui-state.service';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, Header, Footer, ToastModule, ConfirmDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly configLoader = inject(ConfigLoaderService);
  protected readonly business = inject(BusinessConfigService);
  protected readonly features = inject(FeatureConfigService);
  protected readonly content = inject(ContentConfigService);
  protected readonly ui = inject(UiStateService);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: '/' }
  );

  /** Sticky mobile CTA everywhere except inside the booking flow itself. */
  protected readonly showStickyCta = computed(
    () =>
      !this.url().startsWith('/booking') &&
      (this.features.isBookingEnabled() ||
        this.features.isWhatsappBookingEnabled() ||
        this.features.isCallBookingEnabled())
  );

  protected readonly whatsappHref = computed(
    () => `https://wa.me/${this.business.whatsappNumber()}`
  );
  protected readonly phoneHref = computed(
    () => `tel:${this.business.contact().phone.replace(/[^\d+]/g, '')}`
  );

  reload(): void {
    window.location.reload();
  }
}
