<template lang="pug">
section.howto-steps(:aria-labelledby="headingId")
  header.howto-steps__header
    h2.howto-steps__title(:id="headingId" ref="headingRef" tabindex="-1") {{ howTo.title }}
    p.howto-steps__summary {{ howTo.summary }}
  nav.howto-steps__controls(aria-label="Schrittsteuerung")
    button.howto-steps__control(
      type="button"
      @click="goToPrevious"
      :disabled="!hasPrevious"
    ) Zurück (K)
    button.howto-steps__control(
      type="button"
      @click="goToNext"
      :disabled="!hasNext || finished"
    ) Weiter (J)
    button.howto-steps__control(
      type="button"
      @click="markFinished"
      :disabled="finished"
    ) Fertig (F)
  p.howto-steps__progress(role="status" aria-live="polite") {{ progressLabel }}
  article.howto-step-card(
    v-if="activeStep"
    :key="activeStep.id"
    aria-live="assertive"
    aria-atomic="true"
  )
    header.howto-step-card__header
      span.howto-step-card__number aria-hidden="true" {{ displayNumber }}
      h3.howto-step-card__title {{ activeStep.title }}
    p.howto-step-card__description {{ activeStep.description }}
    ul.howto-step-card__tips(v-if="activeStep.tips?.length")
      li(v-for="tip in activeStep.tips" :key="tip") {{ tip }}
    div.howto-step-card__media(v-if="activeStep.media?.length")
      template(v-for="item in activeStep.media" :key="item.id")
        figure.howto-media.howto-media--image(v-if="item.type === 'image' && !isMediaBroken(item.id)")
          img(
            :src="item.src"
            :alt="item.alt"
            :width="item.width"
            :height="item.height"
            @error="handleMediaError(item.id)"
          )
          figcaption(v-if="item.description") {{ item.description }}
        figure.howto-media.howto-media--audio(v-else-if="item.type === 'audio'")
          figcaption {{ item.alt }}
          audio(controls preload="metadata" :aria-label="item.alt")
            source(:src="item.src" type="audio/mpeg")
          p.howto-media__transcript(v-if="item.transcript") {{ item.transcript }}
        figure.howto-media.howto-media--video(v-else-if="item.type === 'video' && !isMediaBroken(item.id)")
          video(
            controls
            preload="metadata"
            :aria-label="item.alt"
            :poster="item.poster"
            @error="handleMediaError(item.id)"
          )
            source(:src="item.src" type="video/mp4")
            track(v-if="item.captions" kind="captions" :src="item.captions" label="Untertitel")
          figcaption(v-if="item.description") {{ item.description }}
        div.howto-media-fallback(role="note" v-else)
          strong Alternativtext:
          p {{ item.alt }}
  p.howto-steps__finished-message(v-if="finished" aria-live="polite")
    strong Gut gemacht!
    |  Du hast alle Schritte abgeschlossen.
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { HowTo } from "../../types/content";
import "@/assets/styles/howto.less";

type Props = {
  howTo: HowTo;
  initialStep?: number;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: "completed", payload: { howToId: string }): void;
  (event: "step-change", payload: { howToId: string; stepId: string; index: number }): void;
}>();

const headingId = `howto-title-${props.howTo.id}`;
const headingRef = ref<HTMLElement | null>(null);

const currentIndex = ref(Math.max(0, Math.min(props.initialStep ?? 0, props.howTo.steps.length - 1)));
const finished = ref(false);
const brokenMediaIds = ref(new Set<string>());

const totalSteps = computed(() => props.howTo.steps.length);
const activeStep = computed(() => props.howTo.steps[currentIndex.value]);

const hasPrevious = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < totalSteps.value - 1);
const displayNumber = computed(() => `${currentIndex.value + 1}`.padStart(2, "0"));

const progressLabel = computed(() => {
  if (finished.value) {
    return "Alle Schritte erledigt.";
  }

  const step = activeStep.value;
  if (!step) {
    return "Keine Schritte verfügbar.";
  }

  return `Schritt ${step.order} von ${totalSteps.value}: ${step.title}`;
});

watch(
  () => currentIndex.value,
  (index) => {
    const step = props.howTo.steps[index];
    if (step) {
      emit("step-change", { howToId: props.howTo.id, stepId: step.id, index });
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => {
          headingRef.value?.focus();
        });
      } else {
        headingRef.value?.focus();
      }
    }
  },
  { immediate: true },
);

function goToPrevious() {
  if (!hasPrevious.value) return;
  currentIndex.value -= 1;
  finished.value = false;
}

function goToNext() {
  if (!hasNext.value) {
    markFinished();
    return;
  }
  currentIndex.value += 1;
}

function markFinished() {
  if (finished.value) return;
  finished.value = true;
  emit("completed", { howToId: props.howTo.id });
}

function handleKeydown(event: KeyboardEvent) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  if (event.key.toLowerCase() === "j") {
    event.preventDefault();
    goToNext();
  }

  if (event.key.toLowerCase() === "k") {
    event.preventDefault();
    goToPrevious();
  }

  if (event.key.toLowerCase() === "f") {
    event.preventDefault();
    markFinished();
  }
}

function isMediaBroken(id: string) {
  return brokenMediaIds.value.has(id);
}

function handleMediaError(id: string) {
  brokenMediaIds.value.add(id);
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>
