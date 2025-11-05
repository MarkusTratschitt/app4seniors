import type { PlatformId, VoiceAdapter, VoicePermissionState } from "../../types/platform";
import { webVoiceAdapter } from "./webVoiceAdapter";

const stubMessage = "Sprachfunktionen sind auf dieser Plattform noch nicht verfügbar.";

const stubAdapter = (id: PlatformId): VoiceAdapter => ({
  id,
  isAvailable: () => false,
  requestPermission: async () => "unknown",
  startListening: async () => {
    throw new Error(stubMessage);
  },
  stopListening: async () => undefined,
  announce: async () => undefined,
});

const adapters: Record<PlatformId, VoiceAdapter> = {
  web: webVoiceAdapter,
  capacitor: stubAdapter("capacitor"),
  tauri: stubAdapter("tauri"),
};

let overrideAdapter: VoiceAdapter | null = null;

export const detectPlatform = (): PlatformId => {
  if (typeof window === "undefined") {
    return "web";
  }

  const context = window as typeof window & { __TAURI__?: unknown; Capacitor?: unknown };
  if (context.__TAURI__) {
    return "tauri";
  }
  if (context.Capacitor) {
    return "capacitor";
  }
  return "web";
};

export const getVoiceAdapter = (platform: PlatformId = detectPlatform()): VoiceAdapter => {
  if (overrideAdapter) {
    return overrideAdapter;
  }

  return adapters[platform];
};

export const setVoiceAdapterForTesting = (adapter: VoiceAdapter | null) => {
  overrideAdapter = adapter;
};

export const announce = async (text: string): Promise<void> => {
  if (!text.trim()) {
    return;
  }

  const adapter = getVoiceAdapter();
  await adapter.announce(text);
};

export const ensureVoicePermission = async (): Promise<VoicePermissionState> => {
  const adapter = getVoiceAdapter();
  if (!adapter.isAvailable()) {
    return "unknown";
  }
  return adapter.requestPermission();
};
