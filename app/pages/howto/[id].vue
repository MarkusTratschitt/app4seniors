<template lang="pug">
section.howto-page
  div.howto-page__error(v-if="hasError")
    p {{ errorMessage }}
  template(v-else-if="activeHowTo")
    p.howto-page__meta
      span.howto-page__os Kennzeichnung: {{ activeHowTo.os.toUpperCase() }}
      span.howto-page__duration Dauer: {{ activeHowTo.estimatedMinutes }} Minuten
    HowToSteps(:how-to="activeHowTo" @completed="handleCompleted" @step-change="handleStepChange")
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useHead, useRoute } from "#imports";
import type { HowTo } from "../../../types/content";
import HowToSteps from "@/components/HowToSteps.vue";

definePageMeta({
  name: "HowToDetailPage",
});

const route = useRoute();
const howToModules = import.meta.glob<HowTo>("../../../../content/howtos/**/*.json", {
  import: "default",
  eager: true,
});

const howToIndex = Object.values(howToModules).reduce<Record<string, HowTo>>((accumulator, entry) => {
  accumulator[entry.slug] = entry;
  return accumulator;
}, {});

const slug = computed(() => String(route.params.id ?? ""));
const activeHowTo = computed<HowTo | null>(() => howToIndex[slug.value] ?? null);

const errorMessage = computed(() => {
  if (!slug.value) {
    return "Kein How-To angegeben.";
  }

  if (!activeHowTo.value) {
    return `Für den Pfad ${slug.value} wurde kein How-To gefunden.`;
  }

  return "";
});

const hasError = computed(() => Boolean(errorMessage.value));

watchEffect(() => {
  if (activeHowTo.value) {
    useHead({
      title: `${activeHowTo.value.title} – Senioren Tech Hilfe`,
      meta: [
        { name: "description", content: activeHowTo.value.summary },
        { name: "keywords", content: activeHowTo.value.keywords.join(", ") },
      ],
    });
  }
});

function handleCompleted(payload: { howToId: string }) {
  console.info("How-To abgeschlossen:", payload.howToId);
}

function handleStepChange(payload: { howToId: string; stepId: string; index: number }) {
  console.debug("Schritt gewechselt:", payload);
}
</script>
