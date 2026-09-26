import { Pipe, PipeTransform, inject } from '@angular/core';
import { BusinessConfigService } from '../../core/services/config/business-config.service';

/** Formats amounts in the configured business currency and locale, e.g. ₹1,999. */
@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  private readonly business = inject(BusinessConfigService);

  transform(value: number | null | undefined): string {
    return value == null ? '' : this.business.formatPrice(value);
  }
}
