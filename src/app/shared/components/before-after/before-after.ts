import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { BeforeAfterItem } from '../../../core/models/catalog.model';

/**
 * Touch-friendly, keyboard-accessible before/after comparison. The invisible
 * range input on top of the frame drives the divider for mouse, touch and
 * arrow keys alike.
 */
@Component({
  selector: 'app-before-after',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './before-after.html',
  styleUrl: './before-after.scss'
})
export class BeforeAfter {
  readonly item = input.required<BeforeAfterItem>();
  readonly position = signal(50);

  onSlide(event: Event): void {
    this.position.set(Number((event.target as HTMLInputElement).value));
  }
}
