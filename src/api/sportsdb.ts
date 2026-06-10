import type { AllLeaguesResponse, SeasonsResponse } from '@/types/league'

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3'

const request = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${BASE_URL}${path}`)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export const fetchAllLeagues = (): Promise<AllLeaguesResponse> =>
  request<AllLeaguesResponse>('/all_leagues.php')

export const fetchSeasonBadges = (leagueId: string): Promise<SeasonsResponse> =>
  request<SeasonsResponse>(`/search_all_seasons.php?badge=1&id=${leagueId}`)
