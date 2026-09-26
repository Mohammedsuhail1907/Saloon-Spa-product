import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { Professional, ServiceType } from '../../../../core/models/catalog.model';

/** Step 2 — pick a stylist/therapist, or "any available professional". */
@Component({
  selector: 'app-professional-selection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarModule],
  templateUrl: './professional-selection.html'
})
export class ProfessionalSelection {
  readonly options = input.required<Professional[]>();
  readonly selectedId = input<number | null>(null);
  readonly anySelected = input(false);
  /** Type of the chosen service — drives the heading wording. */
  readonly serviceType = input<ServiceType | null>(null);

  /** Emits the professional, or null for "any available professional". */
  readonly professionalSelect = output<Professional | null>();

  initials(name: string): string {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
