import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import LeagueCard from '@/components/LeagueCard.vue'
import type { League } from '@/types/league'

const league: League = {
  idLeague: '4328',
  strLeague: 'English Premier League',
  strSport: 'Soccer',
  strLeagueAlternate: 'EPL',
}

const mountCard = () =>
  mount(LeagueCard, {
    props: { league },
    global: { plugins: [createPinia()] },
  })

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('LeagueCard', () => {
  it('renders the required league fields', () => {
    const wrapper = mountCard()

    expect(wrapper.text()).toContain('English Premier League')
    expect(wrapper.text()).toContain('Soccer')
    expect(wrapper.text()).toContain('EPL')
  })

  it('loads and displays the season badge on click', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              seasons: [{ strSeason: '2023-2024', strBadge: 'https://img/badge.png' }],
            }),
        } as Response)
      )
    )
    const wrapper = mountCard()

    await wrapper.trigger('click')
    await flushPromises()

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://img/badge.png')
    expect(wrapper.text()).toContain('Season 2023-2024')
  })

  it('shows the empty state when no badge exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ seasons: null }),
        } as Response)
      )
    )
    const wrapper = mountCard()

    await wrapper.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('No badge available')
  })
})
