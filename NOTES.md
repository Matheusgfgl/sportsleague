# Notes — AI Tools & Design Decisions

## AI Tools Used

- **Claude Code (Anthropic)** — used to scaffold the project structure (Vite + Vue 3 + TypeScript + Sass + Pinia), generate component boilerplate, and iterate on the SCSS styling. All product logic decisions (state shape, caching strategy, filter behavior) were reviewed and directed by me; AI accelerated the typing, not the thinking.

## Architecture

```
src/
├── api/sportsdb.ts        # thin fetch wrapper around TheSportsDB endpoints
├── stores/
│   ├── leagues.ts         # Pinia store: leagues, filters, badge cache, persistence
│   └── theme.ts           # dark/light theme state
├── composables/
│   └── useDebounce.ts     # generic debounced ref
├── components/
│   ├── SearchBar.vue      # name filter (v-model)
│   ├── SportFilter.vue    # sport dropdown (options derived from data)
│   ├── LeagueList.vue     # responsive grid + empty state
│   ├── LeagueCard.vue     # league entity, click → season badge
│   ├── SkeletonCard.vue   # shimmer placeholder while loading
│   └── ThemeToggle.vue    # dark/light switch
├── types/league.ts        # API contracts + badge cache types
└── styles/                # Sass variables/mixins + theme custom properties
```

## Key Decisions

- **Pinia (setup-store style) as single source of truth.** Leagues, filter state, and the badge cache all live in one store. Components stay presentational; `App.vue` wires filters to the store via `storeToRefs`.
- **Caching.**
  - The leagues list is fetched once per session (guarded by a `leaguesLoaded` flag), so re-renders/filter changes never re-hit the API.
  - Badges are cached per `idLeague` in a reactive map. Successful results **and** "no badge available" results are cached and never re-fetched; only `error` entries can be retried by clicking again. This satisfies the "responses should be cached to avoid repeat calls" requirement without an extra library.
  - Both caches are **persisted to `sessionStorage`** and hydrated on store creation, so the cache also survives page reloads. `sessionStorage` (not `localStorage`) was chosen deliberately: league data changes over time, so a tab-scoped lifetime is a reasonable implicit TTL.
- **Debounced search:** the input updates immediately, but filtering runs on a 250ms-debounced copy of the query (generic `useDebounce` composable), avoiding wasted re-filters of a potentially ~1000-item list on every keystroke.
- **Filters in the URL:** `?q=...&sport=...` are read on store init and written back via `history.replaceState`, so filtered views are shareable and survive refresh — without pulling in vue-router for a single-view app.
- **Badge selection:** the API returns all seasons; the card shows the **first season that actually has a badge** (some entries return seasons with `strBadge: null`), along with the season label.
- **Derived dropdown options:** the sport list is computed from the fetched data (`Set` of `strSport`), so it always matches what's actually displayable instead of being hardcoded.
- **Filtering** combines both criteria (AND): search matches `strLeague` *or* `strLeagueAlternate` (case-insensitive), and the dropdown narrows by exact sport.
- **Responsiveness:** CSS grid with `auto-fill, minmax(260px, 1fr)` for the cards; the filter row stacks vertically below 640px. No UI framework — plain Sass with a small variables partial, BEM-ish naming, dark "bookmaker" palette.
- **Accessibility:** cards are keyboard-operable (`role="button"`, `tabindex`, Enter/Space handlers, `aria-expanded`); inputs have `aria-label`s.
- **Theming:** colors are CSS custom properties switched via a `data-theme` attribute on `<html>` (Sass variables alias them, so component styles stay theme-agnostic). A small Pinia store owns the theme state — it defaults to the OS `prefers-color-scheme` and persists the user's choice in `localStorage`. `color-scheme` is set per theme so native controls (select, scrollbars) follow along.

- **Loading UX:** skeleton cards (shared shimmer mixin) replace spinner text for both the league grid and the badge area, keeping layout stable while content loads.

## Testing & Tooling

- **Vitest + @vue/test-utils + happy-dom** — 19 tests focused on product logic: filter combinations, debounce timing (fake timers), badge cache guarantees (one fetch per league, negative results cached, retry after error), sessionStorage hydration, and URL sync; plus `LeagueCard` component tests (render fields, click → badge, empty state).
- **ESLint (flat config: vue recommended + vue/typescript) and Prettier** keep style consistent; `npm run lint` is part of CI.
- **CI/CD:** GitHub Actions runs lint + tests + build on every push to `main` and deploys the bundle to GitHub Pages.

## Possible Next Steps

- List virtualization (`vue-virtual-scroller`) if the full ~1000-league dataset returns — with the current reduced API response it would be premature.
- Cache TTL/stale-while-revalidate strategy if data freshness mattered more.
- E2E smoke test (Playwright) for the happy path.

## Caveats Observed

- The free test API key (`/v1/json/3/`) currently returns a reduced dataset (10 soccer leagues) and omits `strLeagueAlternate`. The code handles the full documented contract: the field is typed as optional and rendered only when present, and the sport dropdown populates with whatever sports the API returns.
- Loading, error (with retry), and empty-filter states are all handled explicitly.
