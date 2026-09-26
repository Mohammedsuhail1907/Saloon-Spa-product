export type ButtonStyle = 'rounded' | 'soft' | 'square';

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  /** Google Fonts family names; loaded at runtime. */
  headingFont: string;
  bodyFont: string;
  /** Base radius for cards/dialogs; smaller radii are derived from it. */
  borderRadius: string;
  buttonStyle: ButtonStyle;
}

export interface ThemeConfig {
  theme: Theme;
}

export const DEFAULT_THEME: Theme = {
  primaryColor: '#B08D57',
  secondaryColor: '#F5EFE6',
  accentColor: '#6F7D5C',
  backgroundColor: '#FAF7F1',
  surfaceColor: '#FFFFFF',
  textColor: '#242424',
  headingFont: 'Playfair Display',
  bodyFont: 'Jost',
  borderRadius: '22px',
  buttonStyle: 'rounded'
};
