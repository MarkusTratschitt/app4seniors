<template lang="pug">
section.voice-search(:data-state="state")
  header.voice-search__header
    h2.voice-search__title Sprachsuche
    p.voice-search__description Sprich deinen Suchbegriff. Wir füllen das Textfeld automatisch aus.
  button.voice-search__button(
    type="button"
    :disabled="!canActivate"
    :aria-pressed="isListening ? 'true' : 'false'"
    @click="toggleListening"
  )
    span.voice-search__indicator(:data-active="isListening")
    span.voice-search__label {{ buttonLabel }}
  p.voice-search__status(role="status" aria-live="polite") {{ statusText }}
  AppAlert.voice-search__hint(v-if="showHint") {{ hintText }}
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import AppAlert from "@/components/AppAlert.vue";
import type { VoiceAdapter, VoicePermissionState } from "../../types/platform";
import { getVoiceAdapter } from "../../lib/voice";

const props = defineProps<{
  modelValue: string;
  lang?: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "search", value: string): void;
}>();

const adapter = ref<VoiceAdapter | null>(null);
const permission = ref<VoicePermissionState>("unknown");
const isListening = ref(false);
const isRequesting = ref(false);
const lastError = ref<string | null>(null);

const available = computed(() => adapter.value?.isAvailable() === true);
const state = computed(() => {
  if (!available.value) {
    return "unavailable";
  }
  if (permission.value === "denied") {
    return "denied";
  }
  if (lastError.value) {
    return "error";
  }
  if (isRequesting.value) {
    return "requesting";
  }
  if (isListening.value) {
    return "listening";
  }
  return "idle";
});

const canActivate = computed(() => available.value && permission.value !== "denied" && !isRequesting.value);
const showHint = computed(() => !available.value || permission.value === "denied");

const buttonLabel = computed(() => {
  if (!available.value) {
    return "Sprachsuche nicht verfügbar";
  }
  if (permission.value === "denied") {
    return "Mikrofon erlaubt? Bitte prüfen";
  }
  if (isListening.value) {
    return "Spracheingabe läuft – tippen zum Stoppen";
  }
  if (isRequesting.value) {
    return "Mikrofon wird vorbereitet";
  }
  return "Sprachsuche starten";
});

const statusText = computed(() => {
  switch (state.value) {
    case "unavailable":
      return "Die Sprachsuche wird auf diesem Gerät nicht unterstützt.";
    case "denied":
      return "Mikrofonzugriff wurde verweigert.";
    case "error":
      return lastError.value ?? "Es ist ein Fehler bei der Sprachsuche aufgetreten.";
    case "requesting":
      return "Wir bereiten die Sprachsuche vor …";
    case "listening":
      return "Wir hören zu. Sprich jetzt deinen Suchbegriff.";
    default:
      return "Tippe auf den Mikrofon-Knopf, um die Sprachsuche zu starten.";
  }
});

const hintText = computed(() => {
  if (!available.value) {
    return "Dein Gerät unterstützt keine Sprachsuche. Nutze bitte die Texteingabe.";
  }
  return "Bitte erlaube den Mikrofonzugriff im Browser oder verwende die Texteingabe.";
});

async function toggleListening() {
  if (!adapter.value || !available.value) {
    return;
  }

  if (isListening.value) {
    await stopListening();
    return;
  }

  await startListening();
}

async function startListening() {
  if (!adapter.value) {
    return;
  }

  isRequesting.value = true;
  lastError.value = null;

  try {
    const permissionState = await adapter.value.requestPermission();
    permission.value = permissionState;

    if (permissionState === "denied") {
      return;
    }

    isListening.value = true;

    await adapter.value.startListening({
      lang: props.lang,
      onResult(result) {
        emit("update:modelValue", result.transcript.trim());
        if (result.isFinal) {
          emit("search", result.transcript.trim());
        }
      },
      onError(error) {
        lastError.value = error.message;
      },
      onEnd() {
        isListening.value = false;
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Die Sprachsuche konnte nicht gestartet werden.";
    lastError.value = message;
    isListening.value = false;
  } finally {
    isRequesting.value = false;
  }
}

async function stopListening() {
  if (!adapter.value) {
    return;
  }

  isListening.value = false;
  lastError.value = null;

  await adapter.value.stopListening();
}

onMounted(() => {
  if (typeof window === "undefined") {
    return;
  }
  adapter.value = getVoiceAdapter();
});

onBeforeUnmount(() => {
  if (isListening.value) {
    void stopListening();
  }
});
</script>

<style scoped lang="less">
.voice-search {
  display: grid;
  gap: var(--space-3);
  border-radius: var(--radius-md);
  border: var(--border-width) solid var(--color-border);
  padding: var(--space-4);
  background-color: var(--color-surface-muted);
}

.voice-search__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.voice-search__title {
  margin: 0;
  font-size: var(--font-size-lg);
}

.voice-search__description {
  margin: 0;
  color: var(--color-text-muted);
}

.voice-search__button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border-radius: var(--radius-full);
  border: var(--border-width) solid var(--color-accent);
  background-color: var(--color-surface);
  color: var(--color-text);
  padding: var(--space-2) var(--space-4);
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-base), color var(--transition-base), transform var(--transition-base);
}

.voice-search__button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.voice-search__button:not([disabled]):hover,
.voice-search__button:not([disabled]):focus-visible {
  background-color: var(--color-accent);
  color: var(--color-accent-contrast);
  transform: translateY(-1px);
}

.voice-search__indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: var(--radius-full);
  background-color: var(--color-border);
  display: inline-block;
}

.voice-search__indicator[data-active="true"] {
  background-color: var(--color-accent);
  animation: voice-search__pulse 1.6s ease-in-out infinite;
}

.voice-search__label {
  white-space: nowrap;
}

.voice-search__status {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.voice-search__hint {
  display: inline-block;
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

@keyframes voice-search__pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.25);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
