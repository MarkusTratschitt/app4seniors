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

