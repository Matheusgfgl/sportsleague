<template>
  <p v-if="leagues.length === 0" class="league-list__empty">
    No leagues match your filters.
  </p>
  <div v-else class="league-list">
    <LeagueCard v-for="league in leagues" :key="league.idLeague" :league="league" />
  </div>
</template>

<script setup lang="ts">
import LeagueCard from '@/components/LeagueCard.vue'
import type { League } from '@/types/league'

defineProps<{
  leagues: League[]
}>()
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.league-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;

  &__empty {
    text-align: center;
    color: $color-text-muted;
    padding: 3rem 0;
  }
}
</style>
