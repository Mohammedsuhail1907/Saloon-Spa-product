import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { palette, updatePreset } from '@primeuix/themes';
import { DEFAULT_THEME, Theme } from '../../models/theme-config.model';
import { BusinessConfigService } from './business-config.service';

const FONT_LINK_ID = 'brand-fonts';

/**
 * Pushes the configured brand into CSS custom properties (consumed by every
 * SCSS file via var(--brand-*)) and into PrimeNG's runtime preset.
 */
@Injectable({ providedIn: 'root' })
export class ThemeConfigService {
  private readonly document = inject(DOCUMENT);
  private readonly business = inject(BusinessConfigService);
  private readonly _theme = signal<Theme>(DEFAULT_THEME);

  readonly theme = this._theme.asReadonly();
  readonly primaryColor = computed(() => this._theme().primaryColor);

  /** Called once by ConfigLoaderService. */
  set(theme: Theme): void {
    this._theme.set(theme);
  }

  /** Applies colours, fonts, radii and document metadata. Idempotent. */
  apply(): void {
    const t = this._theme();
    const root = this.document.documentElement;
    const style = root.style;

    style.setProperty('--brand-primary', t.primaryColor);
    style.setProperty('--brand-secondary', t.secondaryColor);
    style.setProperty('--brand-accent', t.accentColor);
    style.setProperty('--brand-background', t.backgroundColor);
    style.setProperty('--brand-surface', t.surfaceColor);
    style.setProperty('--brand-text', t.textColor);

    style.setProperty('--font-serif', `'${t.headingFont}', Georgia, 'Times New Roman', serif`);
    style.setProperty('--font-sans', `'${t.bodyFont}', 'Segoe UI', system-ui, sans-serif`);

    const radius = parseFloat(t.borderRadius) || 22;
    const unit = t.borderRadius.replace(/[\d.\s]/g, '') || 'px';
    style.setProperty('--radius-lg', `${radius}${unit}`);
    style.setProperty('--radius-md', `${Math.round(radius * 0.72)}${unit}`);
    style.setProperty('--radius-sm', `${Math.round(radius * 0.45)}${unit}`);

    root.dataset['buttonStyle'] = t.buttonStyle;

    updatePreset({ semantic: { primary: palette(t.primaryColor) } });

    this.loadFonts([t.headingFont, t.bodyFont]);
    this.applyDocumentMeta();
  }

  private loadFonts(families: string[]): void {
    const unique = [...new Set(families.filter(Boolean))];
    if (!unique.length) return;
    const params = unique
      .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@300;400;500;600;700`)
      .join('&');
    const href = `https://fonts.googleapis.com/css2?${params}&display=swap`;

    let link = this.document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.id = FONT_LINK_ID;
      link.rel = 'stylesheet';
      this.document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  }

  private applyDocumentMeta(): void {
    const name = this.business.name();
    const tagline = this.business.tagline();
    this.document.title = tagline ? `${name} — ${tagline}` : name;

    const favicon = this.business.favicon();
    const iconLink = this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon && iconLink) iconLink.href = favicon;

    const themeMeta = this.document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = this._theme().primaryColor;

    const description = this.business.description();
    const descMeta = this.document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description && descMeta) descMeta.content = description;
  }
}
