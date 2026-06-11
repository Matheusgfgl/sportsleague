# Sports Leagues

Single-page application for the Sporty Group technical test — browse sports leagues from [TheSportsDB](https://www.thesportsdb.com/free_sports_api), filter by name/sport, and click a league to reveal its season badge.

**Live demo:** https://matheusgfgl.github.io/sportsleague/

**Stack:** Vue 3 (Composition API) · TypeScript · Vite · Pinia · Sass · Vitest

## Running

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check (vue-tsc) + production build
npm run preview  # serve the production build
npm test         # run the Vitest suite (19 tests)
npm run lint     # ESLint (vue + typescript flat config)
npm run format   # Prettier
```

## Features

- Fetches and displays all leagues (`strLeague`, `strSport`, `strLeagueAlternate`)
- Search bar filtering leagues by name (debounced 250ms, also matches alternate names)
- Sport dropdown derived from the actual API data
- Filters synced to the URL (`?q=premier&sport=Soccer`) — shareable and refresh-proof
- Click a league card to load and display its season badge
- All API responses cached in the Pinia store **and persisted to `sessionStorage`** (no repeat calls, survives reloads)
- Skeleton loaders for the list and badges
- Responsive grid layout, error/empty states, keyboard accessible cards
- Dark/light theme toggle (persisted, defaults to system preference)
- CI on GitHub Actions: lint + tests + build, deployed to GitHub Pages on every push

## Testing

Unit tests cover the product logic in the Pinia store (filter combinations, debounce, badge cache including the "never re-fetch" guarantee, error retry, sessionStorage hydration, URL sync) plus component tests for `LeagueCard`.

See [NOTES.md](./NOTES.md) for AI tool usage and design decisions.
