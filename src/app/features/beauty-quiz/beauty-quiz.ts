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
import { ExperienceTag, QuizChoice, Service } from '../../core/models/catalog.model';
import { BookingService } from '../../core/services/booking.service';
import { ContentConfigService } from '../../core/services/config/content-config.service';
import { FeatureConfigService } from '../../core/services/config/feature-config.service';
import { QuizService } from '../../core/services/data/quiz.service';
import { ServiceCatalogService } from '../../core/services/data/service-catalog.service';
import { DataState } from '../../shared/components/data-state/data-state';
import { PricePipe } from '../../shared/pipes/price.pipe';

/** Sentinel budget meaning "no upper limit" in quiz.json. */
const NO_BUDGET_CAP = 99999;

/** Beauty/wellness quiz: mood → time → budget → recommendation. */
@Component({
  selector: 'app-beauty-quiz-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonModule, ProgressBarModule, StepperModule, DataState, PricePipe],
  templateUrl: './beauty-quiz.html',
  styleUrl: './beauty-quiz.scss'
})
export class BeautyQuizPage {
  protected readonly features = inject(FeatureConfigService);
  protected readonly content = inject(ContentConfigService);
  protected readonly quiz = inject(QuizService);
  private readonly catalog = inject(ServiceCatalogService);
  private readonly bookingState = inject(BookingService);
  private readonly router = inject(Router);

  protected readonly pageHero = computed(() => this.content.page('quiz'));

  constructor() {
    void this.quiz.load();
    void this.catalog.load();
  }

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

  isUncapped(choice: QuizChoice<number>): boolean {
    return choice.value >= NO_BUDGET_CAP;
  }

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
