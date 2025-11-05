import { describe, expect, it } from "vitest";
import { searchHowTos } from "../../lib/search";
import type { HowTo } from "../../types/content";

const SAMPLE_HOWTOS: HowTo[] = [
  {
    id: "ios-screen",
    slug: "ios-screen",
    os: "ios",
    osVersion: { min: "15" },
    title: "Bildschirmfoto auf dem iPhone",
    summary: "So speicherst du ein Bild deines iPhone-Bildschirms.",
    keywords: ["screenshot", "bildschirmfoto", "ios"],
    estimatedMinutes: 3,
    steps: [],
  },
  {
    id: "ipados-screen",
    slug: "ipados-screen",
    os: "ipados",
    osVersion: { min: "15" },
    title: "Screenshot auf dem iPad",
    summary: "Bildschirmfotos mit iPad erstellen.",
    keywords: ["screenshot", "ipad", "bildschirmfoto"],
    estimatedMinutes: 3,
    steps: [],
  },
  {
    id: "android-screen",
    slug: "android-screen",
    os: "android",
    osVersion: { min: "12" },
    title: "Android Screenshot",
    summary: "Bei Android ein Bildschirmfoto sichern.",
    keywords: ["screenshot", "android", "bildschirmfoto"],
    estimatedMinutes: 3,
    steps: [],
  },
  {
    id: "windows-screen",
    slug: "windows-screen",
    os: "windows",
    osVersion: { min: "10" },
    title: "Windows Screenshot erstellen",
    summary: "Nutze das Snipping Tool für Bildschirmfotos.",
    keywords: ["screenshot", "snipping tool", "windows"],
    estimatedMinutes: 4,
    steps: [],
  },
  {
    id: "macos-screen",
    slug: "macos-screen",
    os: "macos",
    osVersion: { min: "12" },
    title: "macOS Bildschirmfoto",
    summary: "macOS Werkzeuge für Screenshots.",
    keywords: ["screenshot", "mac", "bildschirmfoto"],
    estimatedMinutes: 3,
    steps: [],
  },
];

describe("searchHowTos", () => {
  it("findet für den Intent 'screenshot' ein Ergebnis pro Betriebssystem", () => {
    const response = searchHowTos("screenshot", SAMPLE_HOWTOS);
    expect(response.items).toHaveLength(5);

    const osSet = new Set(response.items.map((item) => item.howTo.os));
    expect(osSet.size).toBe(5);
  });

  it("ist tolerant gegenüber Tippfehlern", () => {
    const response = searchHowTos("screnshot", SAMPLE_HOWTOS);
    expect(response.items.length).toBeGreaterThan(0);
  });

  it("liefert Vorschläge, wenn keine Treffer vorhanden sind", () => {
    const response = searchHowTos("unbekannt", SAMPLE_HOWTOS);
    expect(response.items).toHaveLength(0);
    expect(response.suggestions.length).toBeGreaterThan(0);
  });
});
