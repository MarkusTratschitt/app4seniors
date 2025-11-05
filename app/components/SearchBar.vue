<template lang="pug">
form.search-bar(role="search" @submit.prevent="emitSearch")
  label.search-bar__label(:for="inputId") Suche nach Anleitungen
  div.search-bar__field
    input.search-bar__input(
      :id="inputId"
      :value="modelValue"
      type="search"
      inputmode="search"
      autocomplete="off"
      spellcheck="false"
      placeholder="z. B. Screenshot oder WLAN"
      @input="updateValue(($event.target as HTMLInputElement).value)"
    )
    button.search-bar__button(type="submit") Finden
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "search", value: string): void;
}>();

const inputId = `search-bar-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
const modelValue = computed(() => props.modelValue);

function updateValue(value: string) {
  emit("update:modelValue", value);
}

function emitSearch() {
  emit("search", modelValue.value.trim());
}
</script>

<style scoped lang="less">
.search-bar {
  display: grid;
  gap: var(--space-2);
}

.search-bar__label {
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.search-bar__field {
  display: flex;
  gap: var(--space-2);
}

.search-bar__input {
  flex: 1;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
}

.search-bar__button {
  border-radius: var(--radius-sm);
  border: var(--border-width) solid var(--color-accent);
  background-color: var(--color-accent);
  color: var(--color-accent-contrast);
  padding: var(--space-2) var(--space-4);
  font-weight: 700;
  transition: background-color var(--transition-base), color var(--transition-base);
}

.search-bar__button:hover,
.search-bar__button:focus-visible {
  background-color: var(--color-link-hover);
  color: var(--color-accent-contrast);
}
</style>
