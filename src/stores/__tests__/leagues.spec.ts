import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { useLeaguesStore } from '@/stores/leagues'
import type { League, Season } from '@/types/league'

const leaguesFixture: League[] = [
  {
    idLeague: '1',
    strLeague: 'English Premier League',
    strSport: 'Soccer',
    strLeagueAlternate: 'EPL',
  },
  {
    idLeague: '2',
    strLeague: 'NBA',
    strSport: 'Basketball',
    strLeagueAlternate: 'National Basketball Association',
  },
  {
    idLeague: '3',
    strLeague: 'Formula 1',
    strSport: 'Motorsport',
    strLeagueAlternate: null,
  },
]

const okResponse = (payload: unknown) =>
  ({ ok: true, status: 200, json: () => Promise.resolve(payload) }) as Response

const mockFetch = (payload: unknown) => vi.fn(() => Promise.resolve(okResponse(payload)))

const setSearch = async (store: ReturnType<typeof useLeaguesStore>, query: string) => {
  store.searchQuery = query
  await nextTick()
  vi.advanceTimersByTime(250)
  await nextTick()
}

beforeEach(() => {
  setActivePinia(createPinia())
  sessionStorage.clear()
  history.replaceState(null, '', '/')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('loadLeagues', () => {
  it('fetches and stores the leagues list', async () => {
    vi.stubGlobal('fetch', mockFetch({ leagues: leaguesFixture }))
    const store = useLeaguesStore()
    await store.loadLeagues()

    expect(store.leagues).toHaveLength(3)
    expect(store.leagues[0].strLeague).toBe('English Premier League')
    expect(store.error).toBeNull()
  })

  it('only hits the API once (cached)', async () => {
    const fetchMock = mockFetch({ leagues: leaguesFixture })
    vi.stubGlobal('fetch', fetchMock)
    const store = useLeaguesStore()

    await store.loadLeagues()
    await store.loadLeagues()

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('exposes an error message when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network down')))
    )
    const store = useLeaguesStore()
    await store.loadLeagues()

    expect(store.error).toBe('network down')
    expect(store.leagues).toHaveLength(0)
  })

  it('persists leagues to sessionStorage and hydrates a fresh store without fetching', async () => {
    vi.stubGlobal('fetch', mockFetch({ leagues: leaguesFixture }))
    const store = useLeaguesStore()
    await store.loadLeagues()

    const fetchMock = mockFetch({ leagues: [] })
    vi.stubGlobal('fetch', fetchMock)
    setActivePinia(createPinia())
    const rehydrated = useLeaguesStore()
    await rehydrated.loadLeagues()

    expect(rehydrated.leagues).toHaveLength(3)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('filters', () => {
  const setup = async () => {
    vi.stubGlobal('fetch', mockFetch({ leagues: leaguesFixture }))
    const store = useLeaguesStore()
    await store.loadLeagues()
    vi.useFakeTimers()
    return store
  }

  it('derives a unique sorted sport list', async () => {
    const store = await setup()
    expect(store.sports).toEqual(['Basketball', 'Motorsport', 'Soccer'])
  })

  it('filters by league name (debounced)', async () => {
    const store = await setup()
    await setSearch(store, 'premier')
    expect(store.filteredLeagues.map((l) => l.idLeague)).toEqual(['1'])
  })

  it('matches the alternate league name', async () => {
    const store = await setup()
    await setSearch(store, 'national basketball')
    expect(store.filteredLeagues.map((l) => l.idLeague)).toEqual(['2'])
  })

  it('does not filter before the debounce delay elapses', async () => {
    const store = await setup()
    store.searchQuery = 'premier'
    await nextTick()
    expect(store.filteredLeagues).toHaveLength(3)
  })

  it('filters by sport', async () => {
    const store = await setup()
    store.selectedSport = 'Motorsport'
    await nextTick()
    expect(store.filteredLeagues.map((l) => l.idLeague)).toEqual(['3'])
  })

  it('combines search and sport filters', async () => {
    const store = await setup()
    store.selectedSport = 'Basketball'
    await setSearch(store, 'formula')
    expect(store.filteredLeagues).toHaveLength(0)
  })

  it('syncs filters to the URL query string', async () => {
    const store = await setup()
    store.searchQuery = 'premier'
    store.selectedSport = 'Soccer'
    await nextTick()

    const params = new URLSearchParams(window.location.search)
    expect(params.get('q')).toBe('premier')
    expect(params.get('sport')).toBe('Soccer')
  })

  it('initializes filters from the URL', async () => {
    history.replaceState(null, '', '/?q=nba&sport=Basketball')
    setActivePinia(createPinia())
    const store = useLeaguesStore()

    expect(store.searchQuery).toBe('nba')
    expect(store.selectedSport).toBe('Basketball')
  })
})

describe('loadBadge', () => {
  const seasons: Season[] = [
    { strSeason: '1992-1993', strBadge: null },
    { strSeason: '1993-1994', strBadge: 'https://img/badge.png' },
  ]

  it('stores the first season that has a badge', async () => {
    vi.stubGlobal('fetch', mockFetch({ seasons }))
    const store = useLeaguesStore()
    await store.loadBadge('1')

    expect(store.badges['1']).toEqual({
      status: 'loaded',
      url: 'https://img/badge.png',
      season: '1993-1994',
    })
  })

  it('caches the response and never re-fetches', async () => {
    const fetchMock = mockFetch({ seasons })
    vi.stubGlobal('fetch', fetchMock)
    const store = useLeaguesStore()

    await store.loadBadge('1')
    await store.loadBadge('1')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('caches the "no badge available" result too', async () => {
    const fetchMock = mockFetch({ seasons: null })
    vi.stubGlobal('fetch', fetchMock)
    const store = useLeaguesStore()

    await store.loadBadge('1')
    await store.loadBadge('1')

    expect(store.badges['1'].status).toBe('empty')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('allows retrying after a failed request', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(okResponse({ seasons }))
    vi.stubGlobal('fetch', fetchMock)
    const store = useLeaguesStore()

    await store.loadBadge('1')
    expect(store.badges['1'].status).toBe('error')

    await store.loadBadge('1')
    expect(store.badges['1'].status).toBe('loaded')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
