export interface ThemeColors {
  primary: string;
  /** Text placed on `primary` (buttons, CTAs). Derived from luminance when omitted. */
  onPrimary?: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
}

export interface ThemeTypography {
  /** Google Fonts family names; loaded at runtime. */
  headingFont: string;
  bodyFont: string;
}

export interface ThemeShape {
  /** General radius for inputs, chips, small panels. */
  borderRadius: string;
  cardRadius: string;
  buttonRadius: string;
}

export interface ThemeEffects {
  /** Box-shadow used by cards and floating panels. */
  shadow: string;
  /** Scale factor applied to cards on hover, e.g. "1.02". */
  hoverScale: string;
}

/** One entry of assets/config/themes.json. */
export interface ThemeDefinition {
  themeKey: string;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  shape: ThemeShape;
  effects: ThemeEffects;
}

export interface ThemeCatalog {
  /** Used when a client names no theme, or an unknown one in production. */
  defaultThemeKey: string;
  themes: ThemeDefinition[];
}

/** Colour keys every theme must define (checked by ThemeConfigService.validate). */
export const REQUIRED_THEME_COLORS: (keyof ThemeColors)[] = [
  'primary',
  'secondary',
  'accent',
  'background',
  'surface',
  'text',
  'mutedText',
  'border',
  'success',
  'warning',
  'danger'
];

/** Compile-time fallback so the first paint is styled even before the catalog loads. */
export const DEFAULT_THEME: ThemeDefinition = {
  themeKey: 'LUXURY_GOLD',
  name: 'Luxury Gold',
  colors: {
    primary: '#A47E45',
    onPrimary: '#FFFFFF',
    secondary: '#F5EFE6',
    accent: '#D4AF37',
    background: '#FAF8F4',
    surface: '#FFFFFF',
    text: '#292524',
    mutedText: '#78716C',
    border: '#E7E0D5',
    success: '#4D7C5A',
    warning: '#C0841A',
    danger: '#B91C1C'
  },
  typography: { headingFont: 'Playfair Display', bodyFont: 'Jost' },
  shape: { borderRadius: '14px', cardRadius: '22px', buttonRadius: '999px' },
  effects: { shadow: '0 18px 45px -18px rgba(94, 74, 42, 0.22)', hoverScale: '1.02' }
};

export const DEFAULT_THEME_CATALOG: ThemeCatalog = {
  defaultThemeKey: DEFAULT_THEME.themeKey,
  themes: [DEFAULT_THEME]
};
