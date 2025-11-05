<template lang="pug">
section.page-about
  h1.page-about__title Über diese App
  p.page-about__text Wir erklären Technik in kleinen Schritten und in einfacher Sprache. Jede Anleitung ist prüfbar, offline verfügbar und mit klarer Tastatursteuerung nutzbar.
</template>

<script setup lang="ts">
defineOptions({ name: "AboutPage" });
</script>

<style scoped lang="less">
.page-about {
  display: grid;
  gap: var(--space-4);
  color: var(--color-text);
}

.page-about__title {
  margin: 0;
}

.page-about__text {
  font-size: var(--font-size-lg);
}
</style>
