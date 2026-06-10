<template>
  <div class="search-bar">
    <span class="search-bar__icon" aria-hidden="true">🔍</span>
    <input
      v-model="model"
      type="search"
      placeholder="Search leagues by name..."
      aria-label="Search leagues by name"
    />
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>({ required: true })
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.search-bar {
  position: relative;
  flex: 1;
  min-width: 220px;

  &__icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.85rem;
    pointer-events: none;
  }

  input {
    width: 100%;
    padding: 0.65rem 0.9rem 0.65rem 2.4rem;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius;
    color: $color-text;
    outline: none;
    transition: border-color 0.15s;

    &::placeholder {
      color: $color-text-muted;
    }

    &:focus {
      border-color: $color-accent;
    }
  }
}
</style>
