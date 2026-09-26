import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DataResource } from '../../constants/app.constants';
import { AppConfigService } from '../config/app-config.service';
import { ClientConfigService } from '../config/client-config.service';

/**
 * The seam between domain services and where data physically lives.
 * Domain services only ever call `fetch(resource)`; which provider answers
 * is decided once from app-config.json (`dataSource`), and which client's
 * data comes back is decided by the active client configuration.
 */
export interface DataProvider {
  fetch<T>(resource: DataResource): Observable<T>;
}

/** Reads `<client data path or assets/data>/<resource>.json`. */
@Injectable({ providedIn: 'root' })
export class AssetDataProvider implements DataProvider {
  private readonly http = inject(HttpClient);
  private readonly clients = inject(ClientConfigService);

  fetch<T>(resource: DataResource): Observable<T> {
    return this.http.get<T>(`${this.clients.dataPathFor(resource)}/${resource}.json`);
  }
}

/** Reads `${apiBaseUrl}/<resource>` for the active client — same resource names, real backend. */
@Injectable({ providedIn: 'root' })
export class ApiDataProvider implements DataProvider {
  private readonly http = inject(HttpClient);
  private readonly app = inject(AppConfigService);
  private readonly clients = inject(ClientConfigService);

  fetch<T>(resource: DataResource): Observable<T> {
    return this.http.get<T>(`${this.app.apiBaseUrl()}/${resource}`, {
      headers: { 'X-Client-Key': this.clients.getActiveClientKey() }
    });
  }
}

export const DATA_PROVIDER = new InjectionToken<DataProvider>('DATA_PROVIDER', {
  providedIn: 'root',
  factory: () =>
    inject(AppConfigService).dataSource() === 'API'
      ? inject(ApiDataProvider)
      : inject(AssetDataProvider)
});
