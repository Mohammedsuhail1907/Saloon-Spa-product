import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { StepperModule } from 'primeng/stepper';
import { QUIZ_BUDGETS, QUIZ_GOALS, QUIZ_TIMES, QuizChoice } from '../../core/data/quiz.mock';
import { ExperienceTag, Service } from '../../core/models/catalog.model';
import { BookingService } from '../../core/services/booking.service';
import { BusinessConfigService } from '../../core/services/business-config.service';
import { CatalogService } from '../../core/services/catalog.service';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-quiz-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, ProgressBarModule, StepperModule, PricePipe],
  templateUrl: './quiz.html'
})
export class QuizPage {
  protected readonly config = inject(BusinessConfigService);
  private readonly catalog = inject(CatalogService);
  private readonly bookingState = inject(BookingService);
  private readonly router = inject(Router);

  protected readonly goals = QUIZ_GOALS;
  protected readonly times = QUIZ_TIMES;
  protected readonly budgets = QUIZ_BUDGETS;

  protected readonly step = signal(1);
  protected readonly goal = signal<QuizChoice<ExperienceTag> | null>(null);
  protected readonly time = signal<QuizChoice<number> | null>(null);
  protected readonly budget = signal<QuizChoice<number> | null>(null);
  protected readonly showResult = signal(false);

  protected readonly progress = computed(() => (this.step() - 1) * 34);

  protected readonly recommendation = computed(() => {
    const goal = this.goal();
    const time = this.time();
    const budget = this.budget();
    if (!goal || !time || !budget) return { best: undefined, alternates: [] as Service[] };
    return this.catalog.recommend(goal.value, time.value, budget.value);
  });

  pickGoal(choice: QuizChoice<ExperienceTag>): void {
    this.goal.set(choice);
    this.step.set(2);
  }

  pickTime(choice: QuizChoice<number>): void {
    this.time.set(choice);
    this.step.set(3);
  }

  pickBudget(choice: QuizChoice<number>): void {
    this.budget.set(choice);
    this.showResult.set(true);
  }

  restart(): void {
    this.step.set(1);
    this.goal.set(null);
    this.time.set(null);
    this.budget.set(null);
    this.showResult.set(false);
  }

  backOne(): void {
    if (this.showResult()) {
      this.showResult.set(false);
      return;
    }
    this.step.update((s) => Math.max(1, s - 1));
  }

  book(service: Service): void {
    this.bookingState.startBooking(service);
    void this.router.navigate(['/booking']);
  }
}
