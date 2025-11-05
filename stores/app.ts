import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    highContrast: false as boolean,
  }),
  actions: {
    toggleContrast() {
      this.highContrast = !this.highContrast;
    },
  },
});
