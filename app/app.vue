<template>
  <div id="__app">
    <!-- screenreader-announce bei routewechsel -->
    <NuxtRouteAnnouncer />
    <!-- layout bestimmt header/footer; pages liefern inhalt -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// hier bleibt es still. logik gehoert in layouts/pages/components.
</script>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
