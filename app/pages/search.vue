<template lang="pug">
section.search-page
  header.search-page__header
    h1.search-page__title Suche nach Anleitungen
    p.search-page__lead Finde hilfreiche Schritte für dein Gerät. Du kannst Begriffe wie "Screenshot", "Update" oder "teilen" eingeben.
    SearchBar(v-model="input" @search="handleSearch")
  div.search-page__status(role="status" aria-live="polite")
    span(v-if="results.items.length") {{ results.items.length }} Treffer für "{{ results.normalizedQuery }}"
    span(v-else-if="results.normalizedQuery") Keine Treffer für "{{ results.normalizedQuery }}"
  ul.search-page__results(v-if="results.items.length")
    li.search-page__result(v-for="item in results.items" :key="item.howTo.id")
      NuxtLink.search-page__link(:to="`/howto/${item.howTo.slug}`")
        span.search-page__os {{ item.howTo.os.toUpperCase() }}
        h2.search-page__result-title {{ item.howTo.title }}
        p.search-page__summary {{ item.howTo.summary }}
        span.search-page__keywords Schlagwörter: {{ item.howTo.keywords.slice(0, 5).join(", ") }}
        span.search-page__score(:aria-label="`Relevanz ${item.score}`") Relevanz: {{ item.score.toFixed(2) }}
  div.search-page__suggestions(v-else-if="results.suggestions.length")
    h2 Hast du das gemeint?
    ul
      li(v-for="suggestion in results.suggestions" :key="suggestion")
        button.search-page__suggestion(type="button" @click="applySuggestion(suggestion)") {{ suggestion }}
  div.search-page__empty(v-else)
    p Gib einen Suchbegriff ein, um passende Anleitungen zu finden.
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "#imports";
import type { HowTo } from "../../types/content";
import SearchBar from "@/components/SearchBar.vue";
import { searchHowTos, type SearchResponse } from "../../lib/search";

definePageMeta({
  name: "SearchPage",
});

const route = useRoute();
const router = useRouter();
const input = ref(typeof route.query.q === "string" ? route.query.q : "");
const howToModules = import.meta.glob<HowTo>("../../content/howtos/**/*.json", { eager: true, import: "default" });
const allHowTos = computed(() => Object.values(howToModules));

const results = reactive<SearchResponse>({
  normalizedQuery: "",
  items: [],
  suggestions: [],
  intent: undefined,
});

if (input.value) {
  handleSearch(input.value);
}

watch(
  () => route.query.q,
  (value) => {
    if (typeof value === "string") {
      if (value !== input.value) {
        input.value = value;
      }
      if (value !== results.normalizedQuery) {
        handleSearch(value);
      }
    } else if (results.normalizedQuery) {
      Object.assign(results, {
        normalizedQuery: "",
        items: [],
        suggestions: [],
        intent: undefined,
      });
    }
  },
);

function handleSearch(query: string) {
  const response = searchHowTos(query, allHowTos.value);
  Object.assign(results, response);
  const sanitized = response.normalizedQuery ? response.normalizedQuery : undefined;
  const currentQuery = typeof route.query.q === "string" ? route.query.q : undefined;
  if (sanitized !== currentQuery) {
    router.replace({
      query: { q: sanitized },
    });
  }
}

function applySuggestion(suggestion: string) {
  input.value = suggestion;
  handleSearch(suggestion);
}
</script>

<style scoped lang="less">
.search-page {
  display: grid;
  gap: var(--space-5);
}

.search-page__header {
  display: grid;
  gap: var(--space-3);
}

.search-page__title {
  margin: 0;
  font-size: clamp(2rem, 1.6rem + 1vw, 2.75rem);
}

.search-page__lead {
  font-size: var(--font-size-lg);
  margin: 0;
}

.search-page__status {
  font-weight: 600;
}

.search-page__results {
  display: grid;
  gap: var(--space-4);
  list-style: none;
  margin: 0;
  padding: 0;
}

.search-page__result {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  transition: border-color var(--transition-base), transform var(--transition-base);
}

.search-page__link {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-4);
  color: inherit;
  text-decoration: none;
}

.search-page__result:hover,
.search-page__result:focus-within {
  border-color: var(--color-accent);
  transform: translateY(-2px);
}

.search-page__os {
  font-size: var(--font-size-sm);
  font-weight: 700;
  background-color: var(--color-surface-muted);
  border-radius: var(--radius-sm);
  padding: 0 var(--space-2);
  width: fit-content;
}

.search-page__result-title {
  margin: 0;
}

.search-page__summary {
  margin: 0;
  font-size: var(--font-size-lg);
}

.search-page__keywords,
.search-page__score {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.search-page__suggestions {
  display: grid;
  gap: var(--space-3);
}

.search-page__suggestion {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-surface-muted);
}

.search-page__empty {
  border-radius: var(--radius-md);
  border: var(--border-width) dashed var(--color-border);
  padding: var(--space-4);
  color: var(--color-text-muted);
}
</style>
