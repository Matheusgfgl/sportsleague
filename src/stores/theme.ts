import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'sportsleague-theme'

const initialTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(initialTheme())

  watchEffect(() => {
    document.documentElement.dataset.theme = theme.value
    localStorage.setItem(STORAGE_KEY, theme.value)
  })

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggleTheme }
})
