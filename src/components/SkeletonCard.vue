<template>
  <div class="skeleton-card" aria-hidden="true">
    <div class="skeleton-card__row">
      <span class="skeleton-card__line skeleton-card__line--title"></span>
      <span class="skeleton-card__line skeleton-card__line--pill"></span>
    </div>
    <span class="skeleton-card__line skeleton-card__line--subtitle"></span>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 1rem 1.1rem;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__line {
    @include shimmer;
    height: 0.9rem;
    border-radius: 4px;

    &--title {
      flex: 1;
      max-width: 70%;
    }

    &--pill {
      width: 4.5rem;
      height: 1.3rem;
      border-radius: 999px;
    }

    &--subtitle {
      width: 50%;
      height: 0.75rem;
    }
  }
}
</style>
