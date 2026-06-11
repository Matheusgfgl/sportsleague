import { ref, watch, type Ref } from 'vue'

export const useDebounce = <T>(source: Ref<T>, delay = 250): Readonly<Ref<T>> => {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  return debounced
}
