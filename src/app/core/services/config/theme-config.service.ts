import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { palette, updatePreset } from '@primeuix/themes';
import {
  DEFAULT_THEME,
  DEFAULT_THEME_CATALOG,
  REQUIRED_THEME_COLORS,
  ThemeCatalog,
  ThemeDefinition
} from '../../models/theme-config.model';
import { BusinessConfigService } from './business-config.service';

const FONT_LINK_ID = 'brand-fonts';
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Theme catalog + the active theme. A theme is applied as CSS custom
 * properties on <html> (consumed by every SCSS file through the aliases in
 * styles/_tokens.scss) and pushed into PrimeNG's runtime preset, so no
 * component stylesheet knows about any particular theme.
 */
@Injectable({ providedIn: 'root' })
export class ThemeConfigService {
  private readonly document = inject(DOCUMENT);
  private readonly business = inject(BusinessConfigService);
  private readonly _catalog = signal<ThemeCatalog>(DEFAULT_THEME_CATALOG);
  private readonly _active = signal<ThemeDefinition>(DEFAULT_THEME);

  readonly catalog = this._catalog.asReadonly();
  readonly themes = computed(() => this._catalog().themes);
  readonly themeKeys = computed(() => this.themes().map((t) => t.themeKey));
  readonly defaultThemeKey = computed(() => this._catalog().defaultThemeKey);
  readonly activeTheme = this._active.asReadonly();
  readonly activeThemeKey = computed(() => this._active().themeKey);
  /** True when the background is darker than the text (e.g. Midnight Luxury). */
  readonly isDark = computed(() => isDarkColor(this._active().colors.background));

  getTheme(themeKey: string): ThemeDefinition | undefined {
    return this.themes().find((t) => t.themeKey === themeKey);
  }

  hasTheme(themeKey: string): boolean {
    return !!this.getTheme(themeKey);
  }

  getActiveTheme(): ThemeDefinition {
    return this._active();
  }

  /** Called by ConfigLoaderService. Invalid entries are dropped, never applied. */
  setCatalog(catalog: ThemeCatalog): string[] {
    const problems: string[] = [];
    const valid = (catalog.themes ?? []).filter((t) => {
      const issues = this.validate(t);
      problems.push(...issues.map((i) => `${t?.themeKey ?? '(no key)'}: ${i}`));
      return issues.length === 0;
    });
    this._catalog.set({
      defaultThemeKey:
        valid.some((t) => t.themeKey === catalog.defaultThemeKey)
          ? catalog.defaultThemeKey
          : valid[0]?.themeKey ?? DEFAULT_THEME.themeKey,
      themes: valid.length ? valid : [DEFAULT_THEME]
    });
    return problems;
  }

  /** Makes a catalog theme active and applies it. Returns false for unknown keys. */
  activate(themeKey: string): boolean {
    const theme = this.getTheme(themeKey);
    if (!theme) return false;
    this._active.set(theme);
    this.applyTheme(theme);
    return true;
  }

  /** Structural check: every required colour present and a valid hex value. */
  validate(theme: ThemeDefinition): string[] {
    const issues: string[] = [];
    if (!theme?.themeKey) issues.push('themeKey is required');
    if (!theme?.name) issues.push('name is required');
    for (const key of REQUIRED_THEME_COLORS) {
      const value = theme?.colors?.[key];
      if (!value) issues.push(`colors.${key} is missing`);
      else if (!HEX_RE.test(value)) issues.push(`colors.${key} "${value}" is not a hex colour`);
    }
    if (theme?.colors?.onPrimary && !HEX_RE.test(theme.colors.onPrimary)) {
      issues.push(`colors.onPrimary "${theme.colors.onPrimary}" is not a hex colour`);
    }
    if (!theme?.typography?.headingFont || !theme?.typography?.bodyFont) {
      issues.push('typography.headingFont and typography.bodyFont are required');
    }
    if (!theme?.shape?.borderRadius || !theme?.shape?.cardRadius || !theme?.shape?.buttonRadius) {
      issues.push('shape.borderRadius, shape.cardRadius and shape.buttonRadius are required');
    }
    if (!theme?.effects?.shadow) issues.push('effects.shadow is required');
    return issues;
  }

  /** Writes the theme into CSS variables, PrimeNG and the document head. Idempotent. */
  applyTheme(theme: ThemeDefinition): void {
    const c = theme.colors;
    const onPrimary = c.onPrimary ?? (isDarkColor(c.primary) ? '#FFFFFF' : c.text);
    const root = this.document.documentElement;
    const style = root.style;

    style.setProperty('--color-primary', c.primary);
    style.setProperty('--color-on-primary', onPrimary);
    style.setProperty('--color-secondary', c.secondary);
    style.setProperty('--color-accent', c.accent);
    style.setProperty('--color-background', c.background);
    style.setProperty('--color-surface', c.surface);
    style.setProperty('--color-text', c.text);
    style.setProperty('--color-muted-text', c.mutedText);
    style.setProperty('--color-border', c.border);
    style.setProperty('--color-success', c.success);
    style.setProperty('--color-warning', c.warning);
    style.setProperty('--color-danger', c.danger);

    style.setProperty(
      '--font-heading',
      `'${theme.typography.headingFont}', Georgia, 'Times New Roman', serif`
    );
    style.setProperty(
      '--font-body',
      `'${theme.typography.bodyFont}', 'Segoe UI', system-ui, sans-serif`
    );

    style.setProperty('--radius-base', theme.shape.borderRadius);
    style.setProperty('--radius-card', theme.shape.cardRadius);
    style.setProperty('--radius-button', theme.shape.buttonRadius);

    style.setProperty('--shadow-card', theme.effects.shadow);
    style.setProperty('--hover-scale', theme.effects.hoverScale || '1');

    root.dataset['theme'] = theme.themeKey;
    root.dataset['colorScheme'] = isDarkColor(c.background) ? 'dark' : 'light';

    updatePreset({
      semantic: {
        primary: palette(c.primary),
        colorScheme: {
          light: {
            primary: {
              color: '{primary.500}',
              contrastColor: onPrimary,
              hoverColor: '{primary.600}',
              activeColor: '{primary.700}'
            },
            surface: surfacePalette(c.surface, c.background, c.text)
          }
        }
      }
    });

    this.loadFonts([theme.typography.headingFont, theme.typography.bodyFont]);
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
    if (themeMeta) themeMeta.content = this._active().colors.primary;

    const description = this.business.description();
    const descMeta = this.document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description && descMeta) descMeta.content = description;
  }
}

/* ------------------------------ colour maths ------------------------------ */

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex([r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t]);
}

function isDarkColor(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.35;
}

/**
 * PrimeNG picks surface shades by index (0 = component background,
 * 200 = borders, 700 = text, …). Interpolating from the theme's surface
 * towards its text colour keeps those roles correct for light AND dark themes.
 */
function surfacePalette(surface: string, background: string, text: string) {
  const steps: Record<number, number> = {
    100: 0.06,
    200: 0.14,
    300: 0.26,
    400: 0.4,
    500: 0.54,
    600: 0.66,
    700: 0.78,
    800: 0.88,
    900: 0.95
  };
  const result: Record<number, string> = { 0: surface, 50: background, 950: text };
  for (const [shade, t] of Object.entries(steps)) result[Number(shade)] = mix(background, text, t);
  return result;
}
