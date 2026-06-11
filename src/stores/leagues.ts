import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { fetchAllLeagues, fetchSeasonBadges } from '@/api/sportsdb'
import { useDebounce } from '@/composables/useDebounce'
import type { BadgeEntry, League } from '@/types/league'

const CACHE_KEY = 'sportsleague-cache-v1'

interface PersistedCache {
  leagues: League[]
  badges: Record<string, BadgeEntry>
}

const readCache = (): PersistedCache | null => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as PersistedCache) : null
  } catch {
    return null
  }
}

export const useLeaguesStore = defineStore('leagues', () => {
  const cached = readCache()

  // --- leagues list (hydrated from sessionStorage when available) ---
  const leagues = ref<League[]>(cached?.leagues ?? [])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let leaguesLoaded = leagues.value.length > 0

  // --- filters (initialized from the URL so filtered views are shareable) ---
  const urlParams = new URLSearchParams(window.location.search)
  const searchQuery = ref(urlParams.get('q') ?? '')
  const selectedSport = ref(urlParams.get('sport') ?? '')
  const debouncedQuery = useDebounce(searchQuery, 250)

  watch([searchQuery, selectedSport], ([query, sport]) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (sport) params.set('sport', sport)
    const qs = params.toString()
    history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  })

  // --- badge cache: leagueId -> BadgeEntry ---
  const badges = reactive<Record<string, BadgeEntry>>(cached?.badges ?? {})

  const persist = () => {
    try {
      // only settled badge entries are worth keeping across reloads
      const settled = Object.fromEntries(
        Object.entries(badges).filter(
          ([, entry]) => entry.status === 'loaded' || entry.status === 'empty'
        )
      )
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ leagues: leagues.value, badges: settled })
      )
    } catch {
      // storage unavailable/full — cache stays in-memory only
    }
  }

  const sports = computed(() => [...new Set(leagues.value.map((l) => l.strSport))].sort())

  const filteredLeagues = computed(() => {
    const query = debouncedQuery.value.trim().toLowerCase()
    return leagues.value.filter((league) => {
      const matchesSport = !selectedSport.value || league.strSport === selectedSport.value
      const matchesQuery =
        !query ||
        league.strLeague.toLowerCase().includes(query) ||
        (league.strLeagueAlternate ?? '').toLowerCase().includes(query)
      return matchesSport && matchesQuery
    })
  })

  const loadLeagues = async () => {
    // cached: the API is only hit once per session
    if (leaguesLoaded || loading.value) return
    loading.value = true
    error.value = null
    try {
      const data = await fetchAllLeagues()
      leagues.value = data.leagues ?? []
      leaguesLoaded = true
      persist()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load leagues'
    } finally {
      loading.value = false
    }
  }

  const loadBadge = async (leagueId: string) => {
    const cached = badges[leagueId]
    // cached results (including "no badge available") are never re-fetched
    if (cached && cached.status !== 'idle' && cached.status !== 'error') return

    badges[leagueId] = { status: 'loading', url: null, season: null }
    try {
      const data = await fetchSeasonBadges(leagueId)
      const firstWithBadge = data.seasons?.find((s) => s.strBadge)
      badges[leagueId] = firstWithBadge
        ? {
            status: 'loaded',
            url: firstWithBadge.strBadge,
            season: firstWithBadge.strSeason,
          }
        : { status: 'empty', url: null, season: null }
      persist()
    } catch {
      badges[leagueId] = { status: 'error', url: null, season: null }
    }
  }

  return {
    leagues,
    loading,
    error,
    searchQuery,
    selectedSport,
    badges,
    sports,
    filteredLeagues,
    loadLeagues,
    loadBadge,
  }
})
