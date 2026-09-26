import { Injectable, signal } from '@angular/core';

/** Small cross-cutting UI state (ambient relaxation mode). */
@Injectable({ providedIn: 'root' })
export class UiStateService {
  private readonly _relaxMode = signal(false);
  readonly relaxMode = this._relaxMode.asReadonly();

  toggleRelaxMode(): boolean {
    const on = !this._relaxMode();
    this._relaxMode.set(on);
    document.body.classList.toggle('relax-mode', on);
    return on;
  }
}
