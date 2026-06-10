<template>
  <select v-model="model" class="sport-filter" aria-label="Filter by sport">
    <option value="">All sports</option>
    <option v-for="sport in sports" :key="sport" :value="sport">
      {{ sport }}
    </option>
  </select>
</template>

<script setup lang="ts">
defineProps<{
  sports: string[]
}>()

const model = defineModel<string>({ required: true })
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.sport-filter {
  padding: 0.65rem 2.2rem 0.65rem 0.9rem;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius;
  color: $color-text;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b949e' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  transition: border-color 0.15s;

  &:focus {
    border-color: $color-accent;
  }
}
</style>
