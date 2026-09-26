import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_THEME, ThemeDefinition } from '../../models/theme-config.model';
import { ThemeConfigService } from './theme-config.service';

const MIDNIGHT: ThemeDefinition = {
  ...DEFAULT_THEME,
  themeKey: 'MIDNIGHT_LUXURY',
  name: 'Midnight Luxury',
  colors: {
    ...DEFAULT_THEME.colors,
    primary: '#C9A961',
    onPrimary: '#1A1710',
    background: '#14141A',
    surface: '#1E1E26',
    text: '#F2EDE4'
  },
  typography: { headingFont: 'Playfair Display', bodyFont: 'Inter' },
  shape: { borderRadius: '12px', cardRadius: '20px', buttonRadius: '999px' }
};

describe('ThemeConfigService', () => {
  let theme: ThemeConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    theme = TestBed.inject(ThemeConfigService);
  });

  afterEach(() => {
    // Leave the test document as we found it.
    theme.applyTheme(DEFAULT_THEME);
  });

  it('accepts a catalog and looks themes up by key', () => {
    const problems = theme.setCatalog({ defaultThemeKey: 'MIDNIGHT_LUXURY', themes: [DEFAULT_THEME, MIDNIGHT] });
    expect(problems).toEqual([]);
    expect(theme.themeKeys()).toEqual(['LUXURY_GOLD', 'MIDNIGHT_LUXURY']);
    expect(theme.defaultThemeKey()).toBe('MIDNIGHT_LUXURY');
    expect(theme.getTheme('MIDNIGHT_LUXURY')?.name).toBe('Midnight Luxury');
    expect(theme.hasTheme('NOPE')).toBeFalse();
  });

  it('drops invalid catalog entries and reports why', () => {
    const broken = { ...MIDNIGHT, themeKey: 'BROKEN', colors: { ...MIDNIGHT.colors, primary: 'gold' } };
    const problems = theme.setCatalog({ defaultThemeKey: 'BROKEN', themes: [DEFAULT_THEME, broken] });
    expect(problems.length).toBe(1);
    expect(problems[0]).toContain('BROKEN');
    expect(theme.hasTheme('BROKEN')).toBeFalse();
    // Default falls back to a valid theme.
    expect(theme.defaultThemeKey()).toBe('LUXURY_GOLD');
  });

  it('validate() lists every missing required colour', () => {
    const issues = theme.validate({ ...MIDNIGHT, colors: { primary: '#000' } as never });
    expect(issues.some((i) => i.includes('colors.background is missing'))).toBeTrue();
    expect(issues.some((i) => i.includes('colors.danger is missing'))).toBeTrue();
  });

  it('activate() writes the theme contract onto <html> and flags dark schemes', () => {
    theme.setCatalog({ defaultThemeKey: 'LUXURY_GOLD', themes: [DEFAULT_THEME, MIDNIGHT] });
    expect(theme.activate('MIDNIGHT_LUXURY')).toBeTrue();

    const root = document.documentElement;
    expect(theme.activeThemeKey()).toBe('MIDNIGHT_LUXURY');
    expect(root.style.getPropertyValue('--color-primary')).toBe('#C9A961');
    expect(root.style.getPropertyValue('--color-on-primary')).toBe('#1A1710');
    expect(root.style.getPropertyValue('--radius-button')).toBe('999px');
    expect(root.dataset['theme']).toBe('MIDNIGHT_LUXURY');
    expect(root.dataset['colorScheme']).toBe('dark');
    expect(theme.isDark()).toBeTrue();
  });

  it('activate() returns false for unknown keys and keeps the current theme', () => {
    theme.setCatalog({ defaultThemeKey: 'LUXURY_GOLD', themes: [DEFAULT_THEME] });
    expect(theme.activate('NOPE')).toBeFalse();
    expect(theme.activeThemeKey()).toBe('LUXURY_GOLD');
  });
});
