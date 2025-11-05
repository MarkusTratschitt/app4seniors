import type { OSFamily } from "../types/content";

export type IntentDictionary = Record<string, string[]>;

export type IntentResolution =
  | {
      intent: string;
      keywords: string[];
    }
  | null;

export const DEFAULT_INTENTS: IntentDictionary = {
  screenshot: [
    "screenshot",
    "bildschirmfoto",
    "screen shot",
    "bildschirm foto",
    "screenhot",
  ],
  update: [
    "update",
    "aktualisieren",
    "system update",
    "software update",
  ],
  sharing: [
    "teilen",
    "weitergeben",
    "airdrop",
    "veröffentlichen",
  ],
};

export function resolveIntent(query: string, dictionary: IntentDictionary = DEFAULT_INTENTS): IntentResolution {
  const normalized = normalize(query);
  if (!normalized) {
    return null;
  }

  for (const intent of Object.keys(dictionary)) {
    const variants = dictionary[intent] ?? [];
    const normalizedVariants = variants
      .map((variant) => normalize(variant))
      .filter((value) => value.length > 0);
    if (normalizedVariants.includes(normalized)) {
      return {
        intent,
        keywords: normalizedVariants,
      };
    }
  }

  return null;
}

export function expandByIntent(query: string, dictionary: IntentDictionary = DEFAULT_INTENTS): string[] {
  const resolution = resolveIntent(query, dictionary);
  const normalizedQuery = normalize(query);
  if (!resolution) {
    return normalizedQuery ? [normalizedQuery] : [];
  }

  const terms = [normalizedQuery, ...resolution.keywords].filter((value) => value.length > 0);
  return Array.from(new Set(terms));
}

export function intentSupportsOS(intent: string, os: OSFamily): boolean {
  if (intent === "screenshot") {
    return ["ios", "ipados", "android", "windows", "macos"].includes(os);
  }

  return true;
}

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
