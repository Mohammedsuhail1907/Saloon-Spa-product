import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling
} from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { ConfigLoaderService } from './core/services/config/config-loader.service';

/**
 * Neutral warm preset. The primary palette is re-derived at runtime from
 * theme-config.json (see ThemeConfigService.apply), so this is only the
 * compile-time default that shows for the first paint.
 */
const SalonSpaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#faf6ee',
      100: '#f3e9d7',
      200: '#e6d3b3',
      300: '#d6b98a',
      400: '#c4a36c',
      500: '#b08d57',
      600: '#9a7847',
      700: '#7d603a',
      800: '#654e30',
      900: '#533f28',
      950: '#2e2216'
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#faf8f4',
          100: '#f5efe6',
          200: '#eae1d3',
          300: '#d8ccb8',
          400: '#b3a48c',
          500: '#8d7f6a',
          600: '#6b6152',
          700: '#4f4840',
          800: '#37322c',
          900: '#242220',
          950: '#151312'
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
    ),
    providePrimeNG({
      ripple: true,
      theme: { preset: SalonSpaPreset, options: { darkModeSelector: 'none' } }
    }),
    MessageService,
    ConfirmationService,
    // All client configuration is loaded once, before the first route renders.
    provideAppInitializer(() => inject(ConfigLoaderService).load())
  ]
};
