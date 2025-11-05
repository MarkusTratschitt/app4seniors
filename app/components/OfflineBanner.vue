<template lang="pug">
transition(name="offline-banner")
  div.offline-banner(v-if="!isOnline" role="status" aria-live="polite" data-testid="offline-banner")
    span.offline-banner__icon aria-hidden="true" 🔌
    span.offline-banner__message Du bist offline. Gespeicherte Inhalte bleiben verfügbar.
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const isOnline = ref(typeof navigator === "undefined" ? true : navigator.onLine);

function updateStatus() {
  if (typeof navigator !== "undefined") {
    isOnline.value = navigator.onLine;
  }
}

onMounted(() => {
  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);
});

onBeforeUnmount(() => {
  window.removeEventListener("online", updateStatus);
  window.removeEventListener("offline", updateStatus);
});
</script>

<style scoped lang="less">
.offline-banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: #ffe766;
  color: #1b1b1f;
  border-bottom: var(--border-width) solid #d1a500;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.offline-banner__icon {
  font-size: 1.25rem;
}

.offline-banner-enter-active,
.offline-banner-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.offline-banner-enter-from,
.offline-banner-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
