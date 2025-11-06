<template lang="pug">
section.page-home
  h1.page-home__title Willkommen
  p.page-home__lead Diese App erklaert moderne Technik in einfachen Schritten.
  ul.page-home__features
    li Nutze die Suche, um eine Anleitung zu finden.
    li Probiere die Tastatur: TAB zum Navigieren, Enter zum Auswählen.
  ul
    li 
      NuxtLink.page-home__link(to="/about") Mehr erfahren
    li 
      NuxtLink.page-home__link(to="/howto-steps") HowToSteps
</template>

<script setup lang="ts">
defineOptions({ name: "HomePage" });
</script>

<style scoped lang="less">
.page-home {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  color: var(--color-text);
}

.page-home__title {
  margin: 0;
}

.page-home__lead {
  font-size: var(--font-size-lg);
}

.page-home__features {
  margin: 0;
  padding-left: var(--space-5);
}

.page-home__link {
  align-self: flex-start;
  border-radius: var(--radius-sm);
  border: var(--border-width) solid var(--color-accent);
  background-color: var(--color-accent);
  color: var(--color-accent-contrast);
  padding: var(--space-2) var(--space-4);
  font-weight: 700;
  text-decoration: none;
  transition: background-color var(--transition-base), color var(--transition-base);
}

.page-home__link:hover,
.page-home__link:focus-visible {
  background-color: var(--color-link-hover);
  color: var(--color-accent-contrast);
}
</style>
