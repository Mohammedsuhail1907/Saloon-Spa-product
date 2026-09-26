import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DividerModule } from 'primeng/divider';
import { BusinessConfigService } from '../../core/services/config/business-config.service';
import { ContentConfigService } from '../../core/services/config/content-config.service';
import { MenuConfigService } from '../../core/services/config/menu-config.service';

/** Footer: brand block, the two menu groups, contact details and socials. */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DividerModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  protected readonly business = inject(BusinessConfigService);
  protected readonly content = inject(ContentConfigService);
  protected readonly menus = inject(MenuConfigService);
  protected readonly year = new Date().getFullYear();
}
