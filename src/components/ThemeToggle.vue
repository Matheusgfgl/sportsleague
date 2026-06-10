<template>
  <button
    class="theme-toggle"
    type="button"
    :title="`Switch to ${nextTheme} theme`"
    :aria-label="`Switch to ${nextTheme} theme`"
    @click="store.toggleTheme()"
  >
    {{ theme === 'dark' ? '☀️' : '🌙' }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'

const store = useThemeStore()
const { theme } = storeToRefs(store)

const nextTheme = computed(() => (theme.value === 'dark' ? 'light' : 'dark'))
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius;
  font-size: 1.1rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    background: $color-surface-hover;
    border-color: $color-accent;
  }

  &:focus-visible {
    outline: 2px solid $color-accent;
    outline-offset: 2px;
  }
}
</style>
