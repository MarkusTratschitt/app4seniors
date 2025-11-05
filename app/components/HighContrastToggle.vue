<template lang="pug">
div.high-contrast-toggle
  button.toggle-button(
    type="button"
    @click="onToggle"
    :aria-pressed="String(isHighContrast)"
    :title="buttonText"
  )
    span.toggle-text {{ buttonText }}
    span.toggle-indicator(:data-state="isHighContrast ? 'on' : 'off'") {{ stateText }}
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAppStore } from "../../stores/app";

const appStore = useAppStore();
const { highContrast } = storeToRefs(appStore);

const isHighContrast = computed<boolean>(() => highContrast.value);

const buttonText = computed<string>(() =>
  isHighContrast.value ? "Hochkontrast ausschalten" : "Hochkontrast einschalten",
);

const stateText = computed<string>(() => (isHighContrast.value ? "Aktiv" : "Aus"));

const onToggle = () => {
  appStore.toggleContrast();
};

onMounted(() => {
  appStore.initContrast();
});
</script>

<style scoped lang="less">
.high-contrast-toggle {
  display: flex;
  align-items: center;
}

.toggle-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  background-color: var(--color-surface-muted);
  color: var(--color-text);
  padding: var(--space-2) var(--space-4);
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.toggle-button:hover {
  background-color: var(--color-surface);
  border-color: var(--color-accent);
}

.toggle-button:focus-visible {
  border-color: var(--color-accent);
}

.toggle-indicator {
  min-width: 3.5rem;
  text-align: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-accent);
  color: var(--color-accent-contrast);
  transition: background-color var(--transition-base), color var(--transition-base);
}

.toggle-indicator[data-state="off"] {
  background-color: var(--color-border);
  color: var(--color-background);
}
</style>
