<template lang="pug">
section
  h1 Willkommen
  p Diese App erklaert moderne Technik in einfachen Schritten.
  ul
    li Nutze die Suche, um eine Anleitung zu finden.
    li Probiere die Tastatur: TAB zum Navigieren, Enter zum Auswählen.
  NuxtLink(to="/about") Mehr erfahren
</template>

<script setup lang="ts">
import "~/assets/styles/base.less";
defineOptions({ name: "DefaultLayout" });
</script>
