import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import HowToSteps from "@/components/HowToSteps.vue";
import type { HowTo } from "../../types/content";

const baseHowTo: HowTo = {
  id: "test-howto",
  slug: "test-howto",
  os: "ios",
  osVersion: { min: "1.0" },
  title: "Test Anleitung",
  summary: "Kurze Zusammenfassung für den Test.",
  keywords: ["test", "anleitung"],
  estimatedMinutes: 3,
  steps: [
    {
      id: "step-1",
      order: 1,
      title: "Erster Schritt",
      description: "Beschreibung für Schritt eins.",
      media: [
        {
          id: "media-1",
          type: "image",
          src: "https://example.com/image.png",
          alt: "Ein Beispielbild.",
        },
      ],
    },
    {
      id: "step-2",
      order: 2,
      title: "Zweiter Schritt",
      description: "Beschreibung für Schritt zwei.",
      tips: ["Ein hilfreicher Tipp."],
    },
  ],
};

describe("HowToSteps", () => {
  beforeEach(() => {
    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("zeigt Schrittinformationen und reagiert auf Tastaturbefehle", async () => {
    const wrapper = mount(HowToSteps, {
      props: {
        howTo: baseHowTo,
      },
      attachTo: document.body,
    });

    expect(wrapper.text()).toContain("Test Anleitung");
    expect(wrapper.text()).toContain("Schritt 1 von 2");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "j" }));
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Schritt 2 von 2");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "f" }));
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Gut gemacht!");

    wrapper.unmount();
  });

  it("zeigt Alternativtext, wenn das Bild nicht geladen werden kann", async () => {
    const wrapper = mount(HowToSteps, {
      props: {
        howTo: baseHowTo,
      },
      attachTo: document.body,
    });

    const image = wrapper.find("img");
    expect(image.exists()).toBe(true);

    await image.trigger("error");
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Alternativtext:");
    expect(wrapper.text()).toContain("Ein Beispielbild.");

    wrapper.unmount();
  });
});
