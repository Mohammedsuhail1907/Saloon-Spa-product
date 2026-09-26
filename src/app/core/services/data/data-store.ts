import { Signal, computed, isDevMode, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DataResource } from '../../constants/app.constants';
import { DataProvider } from './data-provider';

export type DataStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Signal-backed, lazily loaded resource. `load()` runs the fetch once and
 * memoises it; a failure keeps the fallback value so the UI can render an
 * empty/error state instead of crashing.
 */
export interface DataStore<T> {
  readonly data: Signal<T>;
  readonly status: Signal<DataStatus>;
  readonly loading: Signal<boolean>;
  readonly error: Signal<string | null>;
  load(): Promise<void>;
}

export function createDataStore<T>(
  provider: DataProvider,
  resource: DataResource,
  fallback: T
): DataStore<T> {
  const data = signal<T>(fallback);
  const status = signal<DataStatus>('idle');
  const error = signal<string | null>(null);
  let inFlight: Promise<void> | undefined;

  const load = (): Promise<void> => {
    if (status() === 'loaded') return Promise.resolve();
    return (inFlight ??= (async () => {
      status.set('loading');
      try {
        data.set(await firstValueFrom(provider.fetch<T>(resource)));
        error.set(null);
        status.set('loaded');
      } catch (err) {
        error.set(`Could not load ${resource}.`);
        status.set('error');
        inFlight = undefined; // allow a retry on the next load()
        if (isDevMode()) console.warn(`[data] ${resource} failed to load`, err);
      }
    })());
  };

  return {
    data: data.asReadonly(),
    status: status.asReadonly(),
    loading: computed(() => status() === 'loading'),
    error: error.asReadonly(),
    load
  };
}

/** Combine several stores into one loading/error view for a page. */
export function combineStores(...stores: DataStore<unknown>[]) {
  return {
    loading: computed(() => stores.some((s) => s.loading())),
    error: computed(() => stores.map((s) => s.error()).find((e) => !!e) ?? null),
    load: () => Promise.all(stores.map((s) => s.load())).then(() => undefined)
  };
}
