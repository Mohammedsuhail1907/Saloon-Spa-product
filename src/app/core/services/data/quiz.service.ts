import { Injectable, computed, inject } from '@angular/core';
import { DATA_RESOURCES } from '../../constants/app.constants';
import { QuizData } from '../../models/catalog.model';
import { DATA_PROVIDER } from './data-provider';
import { createDataStore } from './data-store';

const EMPTY: QuizData = { goals: [], times: [], budgets: [] };

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly store = createDataStore<QuizData>(inject(DATA_PROVIDER), DATA_RESOURCES.quiz, EMPTY);

  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly goals = computed(() => this.store.data().goals);
  readonly times = computed(() => this.store.data().times);
  readonly budgets = computed(() => this.store.data().budgets);

  load(): Promise<void> {
    return this.store.load();
  }
}
