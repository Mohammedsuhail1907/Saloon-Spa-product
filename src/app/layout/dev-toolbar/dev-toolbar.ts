import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ClientConfigService } from '../../core/services/config/client-config.service';
import { DevToolsService } from '../../core/services/config/dev-tools.service';
import { ThemeConfigService } from '../../core/services/config/theme-config.service';

interface Option {
  label: string;
  value: string;
}

/**
 * Development-only switcher for the active client and theme. Rendered by the
 * app shell only when DevToolsService.enabled() is true, so production users
 * never see it. Selections live in sessionStorage — client-selector.json and
 * the client's themeKey remain the source of truth.
 */
@Component({
  selector: 'app-dev-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonModule, SelectModule, TooltipModule],
  templateUrl: './dev-toolbar.html',
  styleUrl: './dev-toolbar.scss'
})
export class DevToolbar {
  protected readonly devTools = inject(DevToolsService);
  protected readonly theme = inject(ThemeConfigService);
  protected readonly clients = inject(ClientConfigService);

  protected readonly open = signal(false);
  protected readonly clientOptions = signal<Option[]>([]);
  protected readonly loadingClients = signal(false);

  protected readonly themeOptions = computed<Option[]>(() =>
    this.theme.themes().map((t) => ({ label: t.name, value: t.themeKey }))
  );

  toggle(): void {
    this.open.update((o) => !o);
    if (this.open() && !this.clientOptions().length) void this.loadClients();
  }

  onClientChange(clientKey: string): void {
    if (clientKey && clientKey !== this.clients.activeClientKey()) this.devTools.switchClient(clientKey);
  }

  onThemeChange(themeKey: string): void {
    if (themeKey) this.devTools.switchTheme(themeKey);
  }

  reset(): void {
    this.devTools.reset();
  }

  private async loadClients(): Promise<void> {
    this.loadingClients.set(true);
    try {
      const all = await this.clients.loadAllClients();
      this.clientOptions.set(all.map((c) => ({ label: c.business.name, value: c.clientKey })));
    } catch {
      // Fall back to bare keys so the switcher still works.
      this.clientOptions.set(this.clients.availableClientKeys().map((k) => ({ label: k, value: k })));
    } finally {
      this.loadingClients.set(false);
    }
  }
}
