export type PlatformId = "web" | "capacitor" | "tauri";

export type VoicePermissionState = "granted" | "denied" | "prompt" | "unknown";

export type VoiceResult = {
  transcript: string;
  isFinal: boolean;
};

export type VoiceListenOptions = {
  lang?: string;
  onResult: (result: VoiceResult) => void;
  onError?: (error: Error) => void;
  onEnd?: () => void;
};

export interface VoiceAdapter {
  readonly id: PlatformId;
  isAvailable(): boolean;
  requestPermission(): Promise<VoicePermissionState>;
  startListening(options: VoiceListenOptions): Promise<void>;
  stopListening(): Promise<void>;
  announce(text: string): Promise<void>;
}
