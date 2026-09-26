import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FeatureConfigService } from './config/feature-config.service';

/**
 * Centralised toast handling on top of PrimeNG's MessageService. Informational
 * toasts respect the `notifications` feature flag; errors always show.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messages = inject(MessageService);
  private readonly features = inject(FeatureConfigService);

  success(summary: string, detail?: string): void {
    if (!this.features.isNotificationsEnabled()) return;
    this.messages.add({ severity: 'success', summary, detail, life: 4000 });
  }

  info(summary: string, detail?: string): void {
    if (!this.features.isNotificationsEnabled()) return;
    this.messages.add({ severity: 'info', summary, detail, life: 4000 });
  }

  warn(summary: string, detail?: string): void {
    this.messages.add({ severity: 'warn', summary, detail, life: 5000 });
  }

  error(summary: string, detail?: string): void {
    this.messages.add({ severity: 'error', summary, detail, life: 6000 });
  }
}
