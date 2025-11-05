import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VoiceSearch from "../../app/components/VoiceSearch.vue";
import type { VoiceAdapter } from "../../types/platform";
import { setVoiceAdapterForTesting } from "../../lib/voice";

describe("VoiceSearch fallback behaviour", () => {
  beforeEach(() => {
    setVoiceAdapterForTesting(null);
  });

  afterEach(() => {
    setVoiceAdapterForTesting(null);
  });

  it("shows a hint when voice adapter is unavailable", () => {
    const unavailableAdapter: VoiceAdapter = {
      id: "web",
      isAvailable: () => false,
      requestPermission: vi.fn().mockResolvedValue("unknown"),
      startListening: vi.fn().mockRejectedValue(new Error("not supported")),
      stopListening: vi.fn().mockResolvedValue(undefined),
      announce: vi.fn().mockResolvedValue(undefined),
    };

    setVoiceAdapterForTesting(unavailableAdapter);

    const wrapper = mount(VoiceSearch, {
      props: {
        modelValue: "",
      },
    });

    expect(wrapper.find(".voice-search__hint").text()).toContain("unterstützt keine Sprachsuche");
    expect(wrapper.find("button").attributes("disabled")).toBeDefined();
  });

  it("prompts the user to use text search when microphone permission is denied", async () => {
    const requestPermission = vi.fn().mockResolvedValue("denied");

    const adapter: VoiceAdapter = {
      id: "web",
      isAvailable: () => true,
      requestPermission,
      startListening: vi.fn().mockResolvedValue(undefined),
      stopListening: vi.fn().mockResolvedValue(undefined),
      announce: vi.fn().mockResolvedValue(undefined),
    };

    setVoiceAdapterForTesting(adapter);

    const wrapper = mount(VoiceSearch, {
      props: {
        modelValue: "",
      },
    });

    const button = wrapper.find("button");
    expect(button.attributes("disabled")).toBeUndefined();

    await button.trigger("click");
    await wrapper.vm.$nextTick();

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(wrapper.find(".voice-search__hint").text()).toContain("Bitte erlaube den Mikrofonzugriff");
  });
});
