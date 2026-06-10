<template>
  <div class="app">
    <header class="app__header">
      <div>
        <h1>Sports Leagues</h1>
        <p>Browse leagues and click one to reveal its season badge.</p>
      </div>
      <ThemeToggle />
    </header>

    <div class="app__filters">
      <SearchBar v-model="searchQuery" />
      <SportFilter v-model="selectedSport" :sports="sports" />
    </div>

    <main class="app__content">
      <p v-if="loading" class="app__status">Loading leagues...</p>
      <div v-else-if="error" class="app__status app__status--error">
        <p>{{ error }}</p>
        <button @click="store.loadLeagues()">Retry</button>
      </div>
      <template v-else>
        <p class="app__count">
          {{ filteredLeagues.length }} league{{ filteredLeagues.length === 1 ? '' : 's' }}
        </p>
        <LeagueList :leagues="filteredLeagues" />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useLeaguesStore } from '@/stores/leagues'
import SearchBar from '@/components/SearchBar.vue'
import SportFilter from '@/components/SportFilter.vue'
import LeagueList from '@/components/LeagueList.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const store = useLeaguesStore()
const { loading, error, searchQuery, selectedSport, sports, filteredLeagues } =
  storeToRefs(store)

onMounted(() => {
  store.loadLeagues()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.app {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.25rem 4rem;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;

    h1 {
      margin: 0 0 0.35rem;
      font-size: 1.6rem;
    }

    p {
      margin: 0;
      color: $color-text-muted;
      font-size: 0.95rem;
    }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;

    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
    }
  }

  &__count {
    margin: 0 0 1rem;
    color: $color-text-muted;
    font-size: 0.85rem;
  }

  &__status {
    text-align: center;
    color: $color-text-muted;
    padding: 3rem 0;

    &--error {
      color: $color-danger;

      button {
        margin-top: 0.75rem;
        padding: 0.5rem 1.25rem;
        background: $color-accent;
        color: #fff;
        border: none;
        border-radius: $radius;
        cursor: pointer;

        &:hover {
          filter: brightness(1.1);
        }
      }
    }
  }
}
</style>
