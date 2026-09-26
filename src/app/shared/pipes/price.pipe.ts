import { Pipe, PipeTransform, inject } from '@angular/core';
import { BusinessConfigService } from '../../core/services/business-config.service';

/** Formats amounts in the configured business currency, e.g. ₹1,999. */
@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  private readonly config = inject(BusinessConfigService);

  transform(value: number | null | undefined): string {
    if (value == null) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: this.config.currency(),
      maximumFractionDigits: 0
    }).format(value);
  }
}
