import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DATA_BASE_PATH, DataResource } from '../../constants/app.constants';
import { AppConfigService } from '../config/app-config.service';

/**
 * The seam between domain services and where data physically lives.
 * Domain services only ever call `fetch(resource)`; which provider answers
 * is decided once from app-config.json (`dataSource`).
 */
export interface DataProvider {
  fetch<T>(resource: DataResource): Observable<T>;
}

/** Reads `assets/data/<resource>.json`. */
@Injectable({ providedIn: 'root' })
export class AssetDataProvider implements DataProvider {
  private readonly http = inject(HttpClient);

  fetch<T>(resource: DataResource): Observable<T> {
    return this.http.get<T>(`${DATA_BASE_PATH}/${resource}.json`);
  }
}

/** Reads `${apiBaseUrl}/<resource>` — same resource names, real backend. */
@Injectable({ providedIn: 'root' })
export class ApiDataProvider implements DataProvider {
  private readonly http = inject(HttpClient);
  private readonly app = inject(AppConfigService);

  fetch<T>(resource: DataResource): Observable<T> {
    return this.http.get<T>(`${this.app.apiBaseUrl()}/${resource}`);
  }
}

export const DATA_PROVIDER = new InjectionToken<DataProvider>('DATA_PROVIDER', {
  providedIn: 'root',
  factory: () =>
    inject(AppConfigService).dataSource() === 'API'
      ? inject(ApiDataProvider)
      : inject(AssetDataProvider)
});
