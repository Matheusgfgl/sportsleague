<template>
  <article
    class="league-card"
    :class="{ 'league-card--expanded': expanded }"
    role="button"
    tabindex="0"
    :aria-expanded="expanded"
    @click="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
  >
    <header class="league-card__header">
      <h2 class="league-card__title">{{ league.strLeague }}</h2>
      <span class="league-card__sport">{{ league.strSport }}</span>
    </header>

    <p v-if="league.strLeagueAlternate" class="league-card__alternate">
      {{ league.strLeagueAlternate }}
    </p>

    <div v-if="expanded" class="league-card__badge">
      <span
        v-if="!badge || badge.status === 'loading'"
        class="league-card__badge-skeleton"
        role="status"
        aria-label="Loading badge"
      ></span>
      <template v-else-if="badge.status === 'loaded' && badge.url">
        <img :src="badge.url" :alt="`${league.strLeague} season badge`" loading="lazy" />
        <span v-if="badge.season" class="league-card__season"
          >Season {{ badge.season }}</span
        >
      </template>
      <p v-else-if="badge.status === 'empty'" class="league-card__badge-status">
        No badge available for this league.
      </p>
      <p v-else class="league-card__badge-status league-card__badge-status--error">
        Failed to load badge. Click to retry.
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLeaguesStore } from '@/stores/leagues'
import type { League } from '@/types/league'

const props = defineProps<{
  league: League
}>()

const store = useLeaguesStore()
const expanded = ref(false)

const badge = computed(() => store.badges[props.league.idLeague])

const toggle = () => {
  expanded.value = !expanded.value
  if (expanded.value) {
    store.loadBadge(props.league.idLeague)
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.league-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.1rem;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s,
    transform 0.15s;

  &:hover {
    background: $color-surface-hover;
    border-color: $color-accent;
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid $color-accent;
    outline-offset: 2px;
  }

  &--expanded {
    border-color: $color-accent;
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
  }

  &__sport {
    flex-shrink: 0;
    padding: 0.2rem 0.6rem;
    background: $color-accent-soft;
    color: $color-accent;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__alternate {
    margin: 0;
    color: $color-text-muted;
    font-size: 0.85rem;
  }

  &__badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.5rem;
    padding-top: 0.85rem;
    border-top: 1px solid $color-border;

    img {
      max-width: 120px;
      max-height: 120px;
      object-fit: contain;
    }
  }

  &__badge-skeleton {
    @include shimmer;
    width: 120px;
    height: 120px;
    border-radius: $radius;
  }

  &__season {
    color: $color-text-muted;
    font-size: 0.8rem;
  }

  &__badge-status {
    margin: 0;
    color: $color-text-muted;
    font-size: 0.85rem;

    &--error {
      color: $color-danger;
    }
  }
}
</style>
