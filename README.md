# Luxe & Aura — Salon & Spa Booking Platform

A configuration-driven, premium salon & spa booking experience built with
**Angular 20 (standalone components, signals, zoneless)** and **PrimeNG 20**.

One codebase serves three business modes — switch by editing a single JSON file:

```text
SALON_ONLY  ·  SPA_ONLY  ·  SALON_AND_SPA
```

## Quick start

```bash
npm install
npm start           # ng serve → http://localhost:4200
ng serve --port 5000  # or any port you prefer
```

Build and test:

```bash
npm run build       # production build → dist/
npm test            # Karma/Jasmine unit tests
```

## Configuration

Everything brand- and business-specific lives in:

```text
src/assets/config/salon-spa-config.json
```

- `businessMode` — `SALON_ONLY`, `SPA_ONLY` or `SALON_AND_SPA`. Navigation,
  services, professionals, quiz content and page sections adapt automatically.
- `business` — name, tagline, logo, contact details, currency.
- `theme` — brand colours; applied at runtime to CSS variables **and** the
  PrimeNG theme preset (`BusinessConfigService.applyTheme`).
- `features` — feature flags (onlineBooking, slotBooking, membership,
  giftCards, beautyQuiz, offers, gallery, …). Disabled features disappear from
  navigation and their routes are blocked by `featureGuard`.
- `salon` / `spa` — per-section toggles for services and staff.
- `booking` — opening hours, slot length, closed weekdays, holidays.

The config is fetched once at bootstrap via `provideAppInitializer` +
`HttpClient`; components read it through the signal-based
`BusinessConfigService` and never touch the JSON directly.

## Architecture

```text
src/
├── app/
│   ├── core/                 # singletons — no UI
│   │   ├── constants/        # API base URL, config URL, storage keys
│   │   ├── data/             # mock catalogue data (swap for API calls)
│   │   ├── guards/           # featureGuard — blocks disabled feature routes
│   │   ├── models/           # BusinessConfig, Service, Professional,
│   │   │                     # Appointment, AvailabilitySlot, …
│   │   └── services/         # BusinessConfigService, CatalogService,
│   │                         # AvailabilityService, BookingService,
│   │                         # NotificationService (PrimeNG Toast), UiState
│   ├── shared/               # reusable presentational building blocks
│   │   ├── components/       # service-card, professional-card,
│   │   │                     # slot-selector, booking-summary, before-after
│   │   ├── directives/       # appReveal (IntersectionObserver reveal)
│   │   └── pipes/            # price (config-driven currency)
│   ├── layout/               # header (config-driven nav) + footer
│   ├── features/             # one folder per lazy-loaded route
│   │   ├── home/             # hero, moods, featured, stories, promos
│   │   ├── services/         # catalogue with filters + detail dialog
│   │   ├── professionals/    # stylists & therapists + profile dialog
│   │   ├── booking/          # 6-step wizard (see below)
│   │   ├── appointments/     # upcoming/past, reschedule, cancel, details
│   │   ├── beauty-quiz/      # 3-question recommendation quiz
│   │   ├── experience-builder/ # package builder (base + add-ons)
│   │   ├── membership/  offers/  gift-cards/  gallery/  contact/
│   ├── app.routes.ts         # lazy routes, all guarded by feature flags
│   └── app.config.ts         # providers: router, http, PrimeNG theme,
│                             # app initializer (config load)
├── assets/config/            # salon-spa-config.json
├── environments/             # environment.ts / environment.development.ts
├── styles/                   # global SCSS partials (tokens, base, layout,
│                             # art palettes, forms, shared patterns, PrimeNG)
└── styles.scss               # aggregator only — page CSS lives per component
```

### Booking flow

`features/booking` is a thin container that owns the wizard state (signals)
and composes presentational step components:

```text
booking.ts / booking.html          # state + PrimeNG Stepper + navigation
└── components/
    ├── service-selection/         # step 1
    ├── professional-selection/    # step 2 (skipped if disabled in config)
    ├── date-selection/            # step 3 — inline PrimeNG DatePicker
    ├── slot-selection/            # step 4 — slot grid or period picker
    ├── customer-details/          # step 5 — details + add-ons
    ├── booking-review/            # step 6 — final recap
    └── booking-confirmation/      # success screen + product suggestions
```

The sticky summary aside is the shared `app-booking-summary` component,
reused by the experience builder.

### API readiness

There is no backend yet — availability is generated deterministically and
appointments persist to `localStorage` (clearly labelled as demo data in the
UI). The seams for a real API are already in place:

- `AvailabilityService.getDayAvailability(date, professionalId)`
  → `GET /availability`
- `BookingService.book / reschedule / cancel` → `POST/PUT/DELETE /appointments`
- `CatalogService` computed lists → `GET /services`, `GET /professionals`
- `environment.apiBaseUrl` + `core/constants/app.constants.ts` hold the base URL.

### Styling

- Global design tokens and cross-feature patterns: `src/styles/_*.scss`
- Per-component styles: next to each component (`*.scss`)
- PrimeNG internals reached via `styleClass` are styled either in
  `_primeng.scss` (app-wide) or with `:host ::ng-deep` in the owning component.
