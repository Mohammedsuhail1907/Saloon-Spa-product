import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Service } from '../../../../core/models/catalog.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

export interface ServiceGroup {
  label: string;
  items: Service[];
}

/** Step 1 — pick the treatment. Purely presentational. */
@Component({
  selector: 'app-service-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PricePipe],
  templateUrl: './service-selection.html'
})
export class ServiceSelection {
  readonly groups = input.required<ServiceGroup[]>();
  readonly selectedId = input<number | null>(null);
  /** Name of the professional the list is filtered by, if any. */
  readonly filteredBy = input<string | null>(null);

  readonly serviceSelect = output<Service>();
  readonly showAll = output<void>();
}
