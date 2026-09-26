import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ExperienceAddon } from '../../../../core/models/catalog.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

/** Step 5 — guest details plus optional add-ons. Validation lives upstream. */
@Component({
  selector: 'app-customer-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CheckboxModule, InputTextModule, TextareaModule, PricePipe],
  templateUrl: './customer-details.html'
})
export class CustomerDetails {
  readonly name = model('');
  readonly phone = model('');
  readonly email = model('');
  readonly notes = model('');

  readonly triedSubmit = input(false);
  readonly nameValid = input(false);
  readonly phoneValid = input(false);
  readonly emailValid = input(false);

  readonly addons = input<ExperienceAddon[]>([]);
  readonly addOnIds = input<number[]>([]);
  readonly addonToggle = output<{ id: number; checked: boolean }>();
}
