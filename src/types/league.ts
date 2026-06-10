export interface League {
  idLeague: string
  strLeague: string
  strSport: string
  // the free test API key omits this field on some responses
  strLeagueAlternate?: string | null
}

export interface AllLeaguesResponse {
  leagues: League[] | null
}

export interface Season {
  strSeason: string
  strBadge: string | null
}

export interface SeasonsResponse {
  seasons: Season[] | null
}

export type BadgeStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'empty'

export interface BadgeEntry {
  status: BadgeStatus
  url: string | null
  season: string | null
}
