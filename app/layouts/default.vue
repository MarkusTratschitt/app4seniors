<template lang="pug">
div.app
  a.skiplink(href="#main") Zum Inhalt springen
  header.app-header(role="banner")
    h1 Senioren Tech Hilfe
    nav(aria-label="Hauptnavigation")
      NuxtLink(to="/") Start
  main#main
    NuxtPage/
  footer.app-footer
    small © #{new Date().getFullYear()} Hilfe ohne Rumgetue
</template>

<script setup lang="ts">
defineOptions({ name: "DefaultLayout" });
// nix hier, nur smoke-test
</script>

<style lang="less" scoped>
.app-header {
  border-bottom: 1px solid #ddd;
  padding: 12px 16px;
}

.app-footer {
  border-top: 1px solid #eee;
  padding: 12px 16px;
  margin-top: 24px;
}
</style>
