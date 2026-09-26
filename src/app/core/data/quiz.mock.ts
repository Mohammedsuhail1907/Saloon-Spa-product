import { ExperienceTag } from '../models/catalog.model';

export interface QuizChoice<T> {
  id: string;
  label: string;
  icon: string;
  value: T;
  hint?: string;
}

/** Question 1 — intent, mapped to catalogue tags. */
export const QUIZ_GOALS: QuizChoice<ExperienceTag>[] = [
  { id: 'relax', label: 'Relaxation', icon: 'pi pi-moon', value: 'relax', hint: 'Slow everything down' },
  { id: 'glow', label: 'Glow', icon: 'pi pi-sun', value: 'glow', hint: 'Skin that lights up' },
  { id: 'hair', label: 'Hair transformation', icon: 'pi pi-sparkles', value: 'hair', hint: 'A whole new mood' },
  { id: 'occasion', label: 'Special occasion', icon: 'pi pi-star', value: 'occasion', hint: 'Something to celebrate' },
  { id: 'self-care', label: 'Self-care', icon: 'pi pi-heart', value: 'self-care', hint: 'Time for you' },
  { id: 'wellness', label: 'Wellness', icon: 'pi pi-asterisk', value: 'wellness', hint: 'Feel restored' }
];

/** Question 2 — time available, mapped to max duration in minutes. */
export const QUIZ_TIMES: QuizChoice<number>[] = [
  { id: 't30', label: '30 minutes', icon: 'pi pi-clock', value: 30, hint: 'A quick escape' },
  { id: 't60', label: '60 minutes', icon: 'pi pi-clock', value: 60, hint: 'A proper pause' },
  { id: 't90', label: '90+ minutes', icon: 'pi pi-clock', value: 999, hint: 'The full journey' }
];

/** Question 3 — budget, mapped to max price. */
export const QUIZ_BUDGETS: QuizChoice<number>[] = [
  { id: 'b1000', label: '₹1,000', icon: 'pi pi-wallet', value: 1000 },
  { id: 'b2500', label: '₹2,500', icon: 'pi pi-wallet', value: 2500 },
  { id: 'b5000', label: '₹5,000+', icon: 'pi pi-wallet', value: 99999 }
];
