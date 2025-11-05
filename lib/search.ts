import type { HowTo } from "../types/content";
import { expandByIntent, resolveIntent, DEFAULT_INTENTS, intentSupportsOS } from "./intent";

export type SearchOptions = {
  maxDistance?: number;
  limit?: number;
  dictionary?: typeof DEFAULT_INTENTS;
};

export type SearchMatch = {
  howTo: HowTo;
  score: number;
  matches: string[];
};

export type SearchResponse = {
  normalizedQuery: string;
  items: SearchMatch[];
  intent?: string;
  suggestions: string[];
};

const DEFAULT_MAX_DISTANCE = 2;
const DEFAULT_LIMIT = 20;

export function searchHowTos(query: string, howTos: HowTo[], options: SearchOptions = {}): SearchResponse {
  const normalizedQuery = normalize(query);
  const maxDistance = options.maxDistance ?? DEFAULT_MAX_DISTANCE;
  const limit = options.limit ?? DEFAULT_LIMIT;
  const dictionary = options.dictionary ?? DEFAULT_INTENTS;

  if (!normalizedQuery) {
    return {
      normalizedQuery,
      items: [],
      suggestions: ["Bitte gib einen Suchbegriff ein."],
    };
  }

  const intentResolution = resolveIntent(normalizedQuery, dictionary);
  const searchTerms = expandByIntent(normalizedQuery, dictionary);
  const matches: SearchMatch[] = [];

  for (const howTo of howTos) {
    if (intentResolution && !intentSupportsOS(intentResolution.intent, howTo.os)) {
      continue;
    }

    const sourceTokens = collectTokens(howTo);
    const best = evaluateMatch(searchTerms, sourceTokens, maxDistance);

    if (!best) {
      continue;
    }

    matches.push({
      howTo,
      score: best.score,
      matches: best.matches,
    });
  }

  matches.sort((a, b) => {
    if (b.score === a.score) {
      return a.howTo.estimatedMinutes - b.howTo.estimatedMinutes;
    }
    return b.score - a.score;
  });

  const limited = matches.slice(0, limit);

  if (limited.length > 0) {
    return {
      normalizedQuery,
      items: limited,
      intent: intentResolution?.intent,
      suggestions: [],
    };
  }

  return {
    normalizedQuery,
    items: [],
    intent: intentResolution?.intent,
    suggestions: buildSuggestions(normalizedQuery, howTos),
  };
}

type MatchEvaluation = {
  score: number;
  matches: string[];
} | null;

function evaluateMatch(terms: string[], sourceTokens: string[], maxDistance: number): MatchEvaluation {
  let bestScore = 0;
  const matched: Set<string> = new Set();

  for (const term of terms) {
    for (const token of sourceTokens) {
      const distance = levenshtein(term, token);
      if (distance <= maxDistance || token.includes(term)) {
        const similarity = 1 - distance / Math.max(term.length, token.length, 1);
        const score = Math.max(similarity, token.includes(term) ? 1 : similarity);
        if (score > 0) {
          bestScore = Math.max(bestScore, score);
          matched.add(token);
        }
      }
    }
  }

  if (bestScore === 0) {
    return null;
  }

  return {
    score: Number(bestScore.toFixed(4)),
    matches: Array.from(matched),
  };
}

function collectTokens(howTo: HowTo): string[] {
  const tokens: string[] = [];
  tokens.push(normalize(howTo.title));
  tokens.push(normalize(howTo.summary));
  tokens.push(...howTo.keywords.map((keyword) => normalize(keyword)));
  tokens.push(...howTo.steps.map((step) => normalize(step.title)));
  return Array.from(new Set(tokens.filter(Boolean)));
}

function buildSuggestions(query: string, howTos: HowTo[]): string[] {
  const keywordSuggestions = new Set<string>();

  for (const howTo of howTos) {
    for (const keyword of howTo.keywords) {
      const normalized = normalize(keyword);
      if (normalized.startsWith(query.slice(0, 2))) {
        keywordSuggestions.add(keyword);
      }
      if (keywordSuggestions.size >= 5) {
        break;
      }
    }
    if (keywordSuggestions.size >= 5) {
      break;
    }
  }

  if (keywordSuggestions.size === 0) {
    return [
      "Versuche ein anderes Wort wie \"Screenshot\" oder \"Update\".",
      "Nutze den Namen des Geräts, z. B. \"iPad\" oder \"Windows\".",
    ];
  }

  return Array.from(keywordSuggestions);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) {
    const row = matrix[i];
    if (row) {
      row[0] = i;
    }
  }
  for (let j = 0; j <= b.length; j += 1) {
    const firstRow = matrix[0];
    if (firstRow) {
      firstRow[j] = j;
    }
  }

  for (let i = 1; i <= a.length; i += 1) {
    const currentRow = matrix[i];
    const previousRow = matrix[i - 1];
    if (!currentRow || !previousRow) {
      continue;
    }

    for (let j = 1; j <= b.length; j += 1) {
      const left = currentRow[j - 1];
      const up = previousRow[j];
      const diag = previousRow[j - 1];
      if (left === undefined || up === undefined || diag === undefined) {
        continue;
      }

      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(up + 1, left + 1, diag + cost);
    }
  }

  const resultRow = matrix[a.length];
  return resultRow?.[b.length] ?? Math.max(a.length, b.length);
}

function normalize(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
