# Sports Leagues

Single-page application for the Sporty Group technical test — browse sports leagues from [TheSportsDB](https://www.thesportsdb.com/free_sports_api), filter by name/sport, and click a league to reveal its season badge.

**Stack:** Vue 3 (Composition API) · TypeScript · Vite · Pinia · Sass

## Running

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check (vue-tsc) + production build
npm run preview  # serve the production build
```

## Features

- Fetches and displays all leagues (`strLeague`, `strSport`, `strLeagueAlternate`)
- Search bar filtering leagues by name (also matches alternate names)
- Sport dropdown derived from the actual API data
- Click a league card to load and display its season badge
- All API responses cached in the Pinia store (no repeat calls)
- Responsive grid layout, loading/error/empty states, keyboard accessible cards
- Dark/light theme toggle (persisted, defaults to system preference)

See [NOTES.md](./NOTES.md) for AI tool usage and design decisions.
