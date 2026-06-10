import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { fetchAllLeagues, fetchSeasonBadges } from '@/api/sportsdb'
import type { BadgeEntry, League } from '@/types/league'

export const useLeaguesStore = defineStore('leagues', () => {
  // --- leagues list ---
  const leagues = ref<League[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let leaguesLoaded = false

  // --- filters ---
  const searchQuery = ref('')
  const selectedSport = ref('')

  // --- badge cache: leagueId -> BadgeEntry ---
  const badges = reactive<Record<string, BadgeEntry>>({})

  const sports = computed(() =>
    [...new Set(leagues.value.map((l) => l.strSport))].sort()
  )

  const filteredLeagues = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    return leagues.value.filter((league) => {
      const matchesSport =
        !selectedSport.value || league.strSport === selectedSport.value
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
        ? { status: 'loaded', url: firstWithBadge.strBadge, season: firstWithBadge.strSeason }
        : { status: 'empty', url: null, season: null }
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
