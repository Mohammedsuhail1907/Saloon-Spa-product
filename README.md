# Salon & Spa — White-label Booking Product

One Angular 20 + PrimeNG 20 application (standalone, signals, zoneless) that
becomes a different salon, spa or salon-and-spa business purely through
configuration. A client is a JSON file, a theme is a catalog entry, and the
only thing you change to switch clients is one key.

```text
client-selector.json ─► clients/<key>.json ─► themes.json ─► data JSON ─► Angular services ─► UI
        (activeClientKey)   business · features · menus   15 themes     per-client or shared
```

## Quick start

```bash
npm install
npm start          # ng serve → http://localhost:4200
npm run build      # production build → dist/
npm test           # Karma/Jasmine: client validation, theme catalog, access rules, app shell
```

### Switch client — change ONE value

`src/assets/config/client-selector.json`

```json
{ "activeClientKey": "CLIENT_SALON_001" }
```

| Key | Business | Mode | Theme |
| --- | --- | --- | --- |
| `CLIENT_SALON_001` | Luxe Hair Studio | `SALON_ONLY` | `LUXURY_GOLD` |
| `CLIENT_SPA_001` | Serenity Wellness Spa | `SPA_ONLY` | `SAGE_SERENITY` |
| `CLIENT_BOTH_001` | Aura Beauty & Wellness | `SALON_AND_SPA` | `ROSE_ELEGANCE` |

Reload the browser. Brand, logo, colours, fonts, navigation, enabled features,
routes, opening hours, copy and catalogue data all follow. No TypeScript changes.

### Switch theme — same file, or per client

Quick test (applies to whichever client is active), in `client-selector.json`:

```json
{ "activeClientKey": "CLIENT_SALON_001", "activeThemeKey": "MIDNIGHT_LUXURY" }
```

Leave `activeThemeKey` empty to use the client's own theme, which lives in
`clients/client-salon-001.json` → `"theme": { "themeKey": "LUXURY_GOLD" }`.
Precedence: dev switcher › `activeThemeKey` › client `themeKey` › catalog default.

Any of the 15 catalog keys works: `LUXURY_GOLD`, `ROSE_ELEGANCE`, `NATURAL_WELLNESS`,
`MIDNIGHT_LUXURY`, `PEARL_WHITE`, `CHAMPAGNE_DREAM`, `SAGE_SERENITY`, `BLUSH_BEAUTY`,
`ROYAL_PURPLE`, `OCEAN_WELLNESS`, `TERRACOTTA_SPA`, `EMERALD_LUXURY`, `SOFT_LAVENDER`,
`COCOA_ELEGANCE`, `MODERN_MONOCHROME`.

### Development switcher (dev builds only)

`ng serve` shows a small **Dev** pill bottom-left with a Client and a Theme
dropdown. Themes apply instantly; switching client reloads. Selections are kept
in `sessionStorage` for the tab only — `client-selector.json` stays the source of
truth, and **Reset** returns to it. The pill never renders in production builds
or when `app-config.json` says `"environment": "PRODUCTION"`.

## Configuration (`src/assets/config/`)

```text
config/
├── app-config.json          deployment: environment, dataSource (ASSETS|API), apiBaseUrl, defaultRoute
├── client-selector.json     activeClientKey + registry of client files
├── clients/
│   ├── client-salon-001.json
│   ├── client-spa-001.json
│   └── client-both-001.json
├── themes.json              catalog of 15 themes + defaultThemeKey
├── feature-config.json      ┐
├── menu-config.json         │ product DEFAULTS — every client overrides
├── booking-config.json      │ these section by section
├── permission-config.json   │
└── content-config.json      ┘
```

### A client file

| Section | Required | Notes |
| --- | --- | --- |
| `clientKey` | yes | must equal the registry key |
| `businessMode` | yes | `SALON_ONLY` \| `SPA_ONLY` \| `SALON_AND_SPA` |
| `business` | `name`, `currency` | tagline, description, logo, favicon, locale, contact, address, socialMedia, hoursLabel |
| `theme.themeKey` | yes* | *unknown key → warning + catalog default, never a crash |
| `features` | no | any subset of the flags in `feature-config.json` |
| `menus` | no | entries merged onto `menu-config.json` **by id** — set `label`, `enabled`, `order`, `group` |
| `booking` | no | partial `BookingRules`; `workingHours` merged per weekday |
| `content` | no | hero, page heroes, labels, journey, FAQs, contact subjects, footer note |
| `permissions` | no | role/permission overrides |
| `data` | no | `path` + `clientResources` the client owns; the rest comes from `assets/data` |

Validation runs at bootstrap (`ClientConfigService.validate`). Errors — unknown
`activeClientKey`, bad business mode, missing name/currency, non-boolean flags,
menu items without an id — render a calm error state; in dev builds the details
are listed (e.g. *Available clients: CLIENT_SALON_001, …*). Unknown theme keys
and unknown feature/menu ids are warnings.

### Themes

Each entry in `themes.json` defines `colors` (primary, onPrimary, secondary,
accent, background, surface, text, mutedText, border, success, warning, danger),
`typography` (heading/body Google Fonts), `shape` (borderRadius, cardRadius,
buttonRadius) and `effects` (shadow, hoverScale). `ThemeConfigService.applyTheme`
writes them to CSS custom properties on `<html>` —

```css
--color-primary  --color-on-primary  --color-secondary  --color-accent
--color-background  --color-surface  --color-text  --color-muted-text  --color-border
--font-heading  --font-body   --radius-base  --radius-card  --radius-button
--shadow-card  --hover-scale
```

— regenerates PrimeNG's primary and surface palettes, loads the fonts, and sets
`data-theme` / `data-color-scheme` on `<html>`. `styles/_tokens.scss` aliases the
legacy `--brand-*`, `--ink*`, `--line`, `--radius-*` names to this contract, so
component SCSS needs no theme knowledge. Dark themes (Midnight Luxury) work
because PrimeNG's surface scale is interpolated from the theme's own surface →
text colours.

### Visibility resolution

```text
Business config + Feature flags + Booking rules + Permissions → AccessService.canAccess(routeKey)
```

`core/config/route-access.config.ts` is the single rule table used by both the
`accessGuard` and `MenuConfigService`, so a switched-off destination vanishes
from navigation **and** redirects to `defaultRoute` when typed into the URL.
`/salon`, `/spa`, `/stylists` and `/therapists` reuse the services and
professionals pages with a pinned filter.

## Data (`src/assets/data/`)

```text
data/
├── *.json                       shared catalogue (addons, moods, quiz, memberships, gift-cards, products, …)
└── clients/
    ├── client-salon-001/        services, professionals, offers, gallery, reviews
    ├── client-spa-001/
    └── client-both-001/
```

A client's `data.clientResources` lists which resources come from its folder;
everything else is shared, so nothing is duplicated needlessly. Components never
read JSON — domain services (`ServiceCatalogService`, `ProfessionalService`,
`OfferService`, …) go through the `DATA_PROVIDER` token:

```text
AssetDataProvider → <client path | assets/data>/<resource>.json     (today)
ApiDataProvider   → ${apiBaseUrl}/<resource>  + X-Client-Key header  (set dataSource: "API")
```

### Adding a client

1. Copy `clients/client-salon-001.json` → `clients/client-new-001.json`, edit it.
2. Register it in `client-selector.json` under `clients`.
3. Optionally add `assets/images/clients/client-new-001/` (logo, favicon, hero) and
   `assets/data/clients/client-new-001/` for its own catalogue.
4. Set `activeClientKey`. No Angular code changes.

## Project structure

```text
src/app/
├── core/
│   ├── config/route-access.config.ts     one rule table for guards + menus
│   ├── constants/                        config/data paths, domain enums, storage keys
│   ├── guards/access.guard.ts
│   ├── models/                           client-config, theme-config, *-config, catalog, booking
│   └── services/
│       ├── config/                       ConfigLoader, ClientConfig, Business, Feature, Menu, Booking,
│       │                                 Permission, Content, Theme, Access, DevTools
│       ├── data/                         DataProvider, DataStore, domain services
│       ├── availability.service.ts       mock slot engine driven by booking rules
│       ├── booking.service.ts            draft, appointments, favourites (localStorage per client)
│       └── notification.service.ts
├── shared/                               cards, slot selector, booking summary, data-state, reveal, price pipe
├── layout/                               header + footer (menus from config), dev-toolbar (dev only)
└── features/                             lazy pages
```
