import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

/**
 * Loading / error / empty presentation for any data-backed list. The owning
 * page projects its real content and this component decides whether to show
 * skeletons, a soft error, an empty message, or the projected content.
 */
@Component({
  selector: 'app-data-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkeletonModule],
  templateUrl: './data-state.html',
  styleUrl: './data-state.scss'
})
export class DataState {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly empty = input(false);

  readonly skeletons = input(3);
  readonly skeletonHeight = input('20rem');
  readonly skeletonGrid = input<'2' | '3' | '4'>('3');

  readonly emptyIcon = input('pi pi-sparkles');
  readonly emptyTitle = input('Nothing here yet');
  readonly emptyText = input('Please check back soon.');

  readonly errorTitle = input('This section is taking a moment');

  protected readonly skeletonItems = computed(() =>
    Array.from({ length: this.skeletons() }, (_, i) => i)
  );
}
