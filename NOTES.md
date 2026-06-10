# Notes — AI Tools & Design Decisions

## AI Tools Used

- **Claude Code (Anthropic)** — used to scaffold the project structure (Vite + Vue 3 + TypeScript + Sass + Pinia), generate component boilerplate, and iterate on the SCSS styling. All product logic decisions (state shape, caching strategy, filter behavior) were reviewed and directed by me; AI accelerated the typing, not the thinking.

## Architecture

```
src/
├── api/sportsdb.ts        # thin fetch wrapper around TheSportsDB endpoints
├── stores/leagues.ts      # Pinia store: leagues, filters, badge cache
├── components/
│   ├── SearchBar.vue      # name filter (v-model)
│   ├── SportFilter.vue    # sport dropdown (options derived from data)
│   ├── LeagueList.vue     # responsive grid + empty state
│   └── LeagueCard.vue     # league entity, click → season badge
├── types/league.ts        # API contracts + badge cache types
└── styles/                # Sass variables + global reset
```

## Key Decisions

- **Pinia (setup-store style) as single source of truth.** Leagues, filter state, and the badge cache all live in one store. Components stay presentational; `App.vue` wires filters to the store via `storeToRefs`.
- **Caching.**
  - The leagues list is fetched once per session (guarded by a `leaguesLoaded` flag), so re-renders/filter changes never re-hit the API.
  - Badges are cached per `idLeague` in a reactive map. Successful results **and** "no badge available" results are cached and never re-fetched; only `error` entries can be retried by clicking again. This satisfies the "responses should be cached to avoid repeat calls" requirement without an extra library.
- **Badge selection:** the API returns all seasons; the card shows the **first season that actually has a badge** (some entries return seasons with `strBadge: null`), along with the season label.
- **Derived dropdown options:** the sport list is computed from the fetched data (`Set` of `strSport`), so it always matches what's actually displayable instead of being hardcoded.
- **Filtering** combines both criteria (AND): search matches `strLeague` *or* `strLeagueAlternate` (case-insensitive), and the dropdown narrows by exact sport.
- **Responsiveness:** CSS grid with `auto-fill, minmax(260px, 1fr)` for the cards; the filter row stacks vertically below 640px. No UI framework — plain Sass with a small variables partial, BEM-ish naming, dark "bookmaker" palette.
- **Accessibility:** cards are keyboard-operable (`role="button"`, `tabindex`, Enter/Space handlers, `aria-expanded`); inputs have `aria-label`s.
- **Theming:** colors are CSS custom properties switched via a `data-theme` attribute on `<html>` (Sass variables alias them, so component styles stay theme-agnostic). A small Pinia store owns the theme state — it defaults to the OS `prefers-color-scheme` and persists the user's choice in `localStorage`. `color-scheme` is set per theme so native controls (select, scrollbars) follow along.

## Caveats Observed

- The free test API key (`/v1/json/3/`) currently returns a reduced dataset (10 soccer leagues) and omits `strLeagueAlternate`. The code handles the full documented contract: the field is typed as optional and rendered only when present, and the sport dropdown populates with whatever sports the API returns.
- Loading, error (with retry), and empty-filter states are all handled explicitly.
