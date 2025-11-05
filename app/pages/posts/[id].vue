<template lang="pug">
section.post-detail
  h1.post-detail__title Beitrag {{ postIdLabel }}
  p.post-detail__hint(v-if="!postId") Wir konnten keinen Beitrag finden. Bitte nutze die Übersicht.
  p.post-detail__hint(v-else) Der Beitrag {{ postIdLabel }} wird geladen. TODO: Inhalte nachreichen.
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "#imports";

defineOptions({ name: "PostDetailPage" });

type RouteParams = { id?: string | string[] };

const route = useRoute();

const params = computed<RouteParams>(() => route.params as RouteParams);

const postId = computed<string>(() => {
  const raw = params.value.id;

  if (Array.isArray(raw)) {
    return raw[0] ?? "";
  }

  return raw ?? "";
});

const postIdLabel = computed<string>(() => (postId.value ? `#${postId.value}` : "unbekannt"));
</script>

<style scoped lang="less">
.post-detail {
  display: grid;
  gap: var(--space-4);
}

.post-detail__title {
  margin: 0;
}

.post-detail__hint {
  font-size: var(--font-size-lg);
}
</style>
