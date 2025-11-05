<template lang="pug">
section
  h1 Willkommen
  p Diese App erklaert moderne Technik in einfachen Schritten.
  NuxtLink(to="/about") Mehr erfahren
</template>

<script setup lang="ts">
import "~/assets/styles/base.less";

const appConfig = useAppConfig();
</script>
