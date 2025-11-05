import type { PlatformId, VoiceAdapter, VoiceListenOptions, VoicePermissionState } from "../../types/platform";

type RecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  error?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

type ExtendedWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };

export class WebVoiceAdapter implements VoiceAdapter {
  readonly id: PlatformId = "web";
  private recognition: SpeechRecognitionLike | null = null;
  private activeOptions: VoiceListenOptions | null = null;

  isAvailable(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    const win = window as ExtendedWindow;
    const recognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
    return Boolean(recognitionCtor) && "speechSynthesis" in win;
  }

  async requestPermission(): Promise<VoicePermissionState> {
    if (typeof navigator === "undefined") {
      return "unknown";
    }

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        return "granted";
      } catch (error) {
        if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError")) {
          return "denied";
        }
        return "denied";
      }
    }

    if (navigator.permissions?.query) {
      try {
        const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
        return (status.state as VoicePermissionState) ?? "unknown";
      } catch {
        return "unknown";
      }
    }

    return "unknown";
  }

  startListening(options: VoiceListenOptions): Promise<void> {
    const recognition = this.ensureRecognition();
    if (!recognition) {
      return Promise.reject(new Error("Web Speech Recognition API is not available."));
    }

    this.activeOptions = options;
    recognition.lang = options.lang ?? this.detectLang();
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const { onResult } = options;
      if (!onResult) {
        return;
      }

      Array.from(event.results).forEach((result) => {
        if (!result.length) {
          return;
        }

        const transcript = result[0]?.transcript ?? "";
        if (!transcript.trim()) {
          return;
        }

        onResult({
          transcript,
          isFinal: result.isFinal === true,
        });
      });
    };

    recognition.onerror = (event) => {
      options.onError?.(new Error(event.error ?? "Speech recognition error"));
    };

    recognition.onend = () => {
      options.onEnd?.();
      this.activeOptions = null;
    };

    recognition.start();
    return Promise.resolve();
  }

  stopListening(): Promise<void> {
    if (!this.recognition) {
      return Promise.resolve();
    }

    this.recognition.onresult = null;
    this.recognition.onerror = null;
    const pendingEnd = this.recognition.onend;
    this.recognition.onend = null;

    try {
      this.recognition.stop();
      this.recognition.abort();
    } catch {
      // Ignore errors when stopping the recognition session.
    } finally {
      pendingEnd?.();
      this.activeOptions = null;
    }
    return Promise.resolve();
  }

  async announce(text: string): Promise<void> {
    if (typeof window === "undefined" || !text.trim()) {
      return;
    }

    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.detectLang();

    await new Promise<void>((resolve) => {
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      try {
        synth.cancel();
        synth.speak(utterance);
      } catch {
        resolve();
      }
    });
  }

  private detectLang(): string {
    if (typeof navigator !== "undefined" && navigator.language) {
      return navigator.language;
    }
    return "de-DE";
  }

  private ensureRecognition(): SpeechRecognitionLike | null {
    if (typeof window === "undefined") {
      return null;
    }

    if (this.recognition) {
      return this.recognition;
    }

    const win = window as ExtendedWindow;
    const recognitionCtor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!recognitionCtor) {
      return null;
    }

    this.recognition = new recognitionCtor();
    return this.recognition;
  }
}

export const webVoiceAdapter = new WebVoiceAdapter();
