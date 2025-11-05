import { defineStore } from "pinia";

const STORAGE_KEY = "app4seniors:contrast";

export const useAppStore = defineStore("app", {
  state: () => ({
    highContrast: false as boolean,
  }),
  actions: {
    setContrast(enabled: boolean) {
      this.highContrast = enabled;

      if (process.client) {
        const root = document?.documentElement;
        if (root) {
          root.dataset.contrast = enabled ? "high" : "base";
        }

        try {
          window.localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
        } catch {
          // Ignored: storage may be disabled (e.g., private mode or offline).
        }
      }
    },
    toggleContrast() {
      this.setContrast(!this.highContrast);
    },
    initContrast() {
      if (!process.client) {
        return;
      }

      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const prefersHigh = window.matchMedia?.("(prefers-contrast: more)").matches === true;

        if (stored === "1") {
          this.setContrast(true);
          return;
        }

        if (stored === "0") {
          this.setContrast(false);
          return;
        }

        this.setContrast(prefersHigh);
      } catch {
        this.setContrast(false);
      }
    },
  },
});
