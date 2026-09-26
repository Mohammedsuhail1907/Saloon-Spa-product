# Salon & Spa — White-label Booking Product

A configuration-driven salon & spa product built with **Angular 20 (standalone,
signals, zoneless)** and **PrimeNG 20**. One compiled application serves any
number of clients; a client is nothing more than a folder of JSON.

```text
Angular product  →  Configuration layer  →  Data services  →  Assets JSON (today) / REST API (later)
```

## Quick start

```bash
npm install
npm start                     # ng serve → http://localhost:4200
npm run build                 # production build → dist/
npm test                      # Karma/Jasmine (config resolution + app shell)
```

### Try a different client without touching TypeScript

```bash
npm run config:use -- salon-only      # Maison Coiffure — hair salon, no spa/membership/gift cards
npm run config:use -- spa-only        # Stillwater Spa  — spa, membership, AED pricing
npm run config:use -- salon-and-spa   # Luxe & Aura     — everything on (the default)
```

Each command copies `src/assets/config/examples/<name>/*.json` over
`src/assets/config/`. With `ng serve` running, just reload the browser: brand,
colours, fonts, navigation, enabled features, opening hours and copy all change.

## Configuration (`src/assets/config/`)

| File | Owner service | Controls |
| --- | --- | --- |
| `app-config.json` | `AppConfigService` | `clientId`, `environment`, `dataSource` (`ASSETS` \| `API`), `apiBaseUrl`, `defaultRoute` |
| `business-config.json` | `BusinessConfigService` | `businessMode` (`SALON_ONLY` \| `SPA_ONLY` \| `SALON_AND_SPA`), name, logo, favicon, tagline, currency/locale, contact, address, social links, per-studio toggles |
| `feature-config.json` | `FeatureConfigService` | every switchable module (booking, slots, membership, gift cards, offers, reviews, gallery, quiz, dashboard, WhatsApp/call booking, products, …) |
| `menu-config.json` | `MenuConfigService` | navigation items: label, route, icon, `enabled`, `order`, `group` (`primary` = header, `secondary` = drawer/footer) |
| `booking-config.json` | `BookingConfigService` | booking mode, professional selection, reschedule/cancel, advance-booking limits, slot duration, working hours per weekday, holidays |
| `theme-config.json` | `ThemeConfigService` | colours, heading/body fonts (loaded from Google Fonts at runtime), border radius, button shape |
| `permission-config.json` | `PermissionConfigService` | current role and the permissions each role has (UX layer only — not security) |
| `content-config.json` | `ContentConfigService` | hero copy, page heroes, journey steps, membership FAQs, contact subjects, footer note, label overrides |

All files are loaded **once** at bootstrap by `ConfigLoaderService`
(`provideAppInitializer`). `app-config` and `business-config` are mandatory —
if either fails the shell renders a calm error state instead of a half-configured
product. The other files fall back to neutral defaults with a dev-mode warning.

### How visibility is decided

```text
Business config  +  Feature config  +  Booking rules  +  Permissions   →   AccessService.canAccess(routeKey)
```

`core/config/route-access.config.ts` is the single rule table. Both the route
guard (`accessGuard`) and `MenuConfigService` consult it, so a destination that
is switched off disappears from navigation **and** redirects to `defaultRoute`
when typed into the URL. Business-level switches win over menus and features:
`spa.enabled = false` hides Spa even if the menu says `enabled: true`.

## Data (`src/assets/data/`)

`services`, `service-categories`, `addons`, `moods`, `quiz`, `professionals`,
`offers`, `memberships`, `gift-cards`, `gallery`, `reviews`, `products`.

Components never read JSON. They talk to domain services
(`ServiceCatalogService`, `ProfessionalService`, `OfferService`,
`MembershipService`, `GiftCardService`, `GalleryService`, `ReviewService`,
`ProductService`, `QuizService`), which pre-filter by business mode and expose
signals plus `loading` / `error` state. Each service owns lazily-loaded
`DataStore`s and is only asked to `load()` by pages whose feature is enabled, so
a client without membership never fetches `memberships.json`.

### Switching to an API

```text
Component → Domain service → DATA_PROVIDER → AssetDataProvider   (assets/data/<resource>.json)
                                          └→ ApiDataProvider     (${apiBaseUrl}/<resource>)
```

Set `"dataSource": "API"` and `"apiBaseUrl"` in `app-config.json`. The
`DATA_PROVIDER` token picks the provider; nothing in `features/` or `shared/`
changes. Resource names live in `core/constants/app.constants.ts`.

## Project structure

```text
src/
├── app/
│   ├── core/
│   │   ├── config/route-access.config.ts   # one rule table for guards + menus
│   │   ├── constants/                      # config/data paths, domain enums, storage keys
│   │   ├── guards/access.guard.ts
│   │   ├── models/                         # *-config.model.ts, catalog.model.ts, booking.model.ts
│   │   └── services/
│   │       ├── config/                     # loader + one service per config file + AccessService
│   │       ├── data/                       # DataProvider, DataStore, domain services
│   │       ├── availability.service.ts     # mock slot engine driven by booking-config
│   │       ├── booking.service.ts          # draft, appointments, favourites (localStorage per clientId)
│   │       └── notification.service.ts     # PrimeNG toasts, honours `notifications` flag
│   ├── shared/                             # cards, slot selector, booking summary, data-state, reveal, price pipe
│   ├── layout/                             # header + footer (menus come from MenuConfigService)
│   └── features/                           # lazy pages; /salon and /spa reuse the services page
├── assets/
│   ├── config/                             # active client + examples/{salon-only,spa-only,salon-and-spa}
│   ├── data/                               # catalogue JSON
│   └── images/logo/
├── styles/                                 # tokens (overwritten at runtime), base, layout, art, forms, shared, primeng
└── styles.scss
tools/use-client-config.mjs                 # `npm run config:use -- <example>`
```

## Booking flow

`features/booking` owns the wizard state and composes presentational step
components (service → professional → date → slot/period → details → review →
confirmation). Steps and behaviour follow configuration: the professional step
is skipped when selection is disabled, slot vs. period picking follows
`bookingMode`, add-ons appear only with `servicePackages`, product suggestions
only with `productRecommendations`, and reschedule/cancel honour both feature
flags and booking rules.

## Styling

Brand values are CSS custom properties (`--brand-*`, `--font-*`, `--radius-*`)
set by `ThemeConfigService`; every SCSS file consumes them, so a client's colours
apply without recompiling. PrimeNG's primary palette is regenerated at runtime
from `primaryColor`. Animations respect `prefers-reduced-motion`.
