import { Injectable, computed, signal } from '@angular/core';
import {
  DEFAULT_PERMISSION_CONFIG,
  Permission,
  PermissionConfig
} from '../../models/permission-config.model';

/**
 * Role/permission hints for the UI. Purely a UX layer: it decides what to
 * render and which routes to open, never what a backend will accept.
 */
@Injectable({ providedIn: 'root' })
export class PermissionConfigService {
  private readonly _config = signal<PermissionConfig>(DEFAULT_PERMISSION_CONFIG);

  readonly config = this._config.asReadonly();
  readonly role = computed(() => this._config().currentRole);
  readonly roleLabel = computed(
    () => this._config().roles[this.role()]?.label ?? this.role()
  );
  readonly permissions = computed<ReadonlySet<string>>(
    () => new Set(this._config().roles[this.role()]?.permissions ?? [])
  );

  hasPermission(permission: Permission | string | undefined): boolean {
    return !permission || this.permissions().has(permission);
  }

  /** Called once by ConfigLoaderService. */
  set(config: PermissionConfig): void {
    this._config.set(config);
  }
}
