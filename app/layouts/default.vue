<template lang="pug">
div.app
  a.skiplink(href="#main") Zum Inhalt springen
  header.app-header(role="banner")
    div.app-header__inner
      div.app-header__top
        h1.app-title Senioren Tech Hilfe
        HighContrastToggle/
      nav.app-nav(aria-label="Hauptnavigation")
        ul.app-nav__list
          li.app-nav__item
            NuxtLink.app-nav__link(to="/") Start
  main#main.app-main
    div.app-main__inner
      NuxtPage/
  footer.app-footer(role="contentinfo")
    div.app-footer__inner
      small © #{new Date().getFullYear()} Hilfe ohne Rumgetue
</template>

<script setup lang="ts">
import HighContrastToggle from "@/components/HighContrastToggle.vue";

defineOptions({ name: "DefaultLayout" });
</script>

<style lang="less" scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  color: var(--color-text);
}

.app-header {
  background-color: var(--color-surface);
  border-bottom: var(--border-width) solid var(--color-border);
}

.app-header__inner {
  margin: 0 auto;
  max-width: 70rem;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.app-header__top {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

@media (min-width: 50rem) {
  .app-header__top {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.app-title {
  margin: 0;
  font-size: clamp(1.75rem, 1.2rem + 2vw, 2.25rem);
  color: var(--color-text);
}

.app-nav__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.app-nav__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  border: var(--border-width) solid transparent;
  background-color: transparent;
  color: var(--color-text);
  text-decoration: none;
  font-weight: 600;
  transition: background-color var(--transition-base), border-color var(--transition-base), color var(--transition-base);
}

.app-nav__link:hover,
.app-nav__link:focus-visible,
.app-nav__link[aria-current="page"] {
  border-color: var(--color-accent);
  background-color: var(--color-surface-muted);
  color: var(--color-text);
}

.app-main {
  flex: 1;
  width: 100%;
  padding: var(--space-5) var(--space-4);
  background-color: var(--color-background);
}

.app-main__inner {
  max-width: 70rem;
  margin: 0 auto;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  padding: var(--space-5);
}

.app-footer {
  background-color: var(--color-surface);
  border-top: var(--border-width) solid var(--color-border);
}

.app-footer__inner {
  margin: 0 auto;
  max-width: 70rem;
  padding: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
