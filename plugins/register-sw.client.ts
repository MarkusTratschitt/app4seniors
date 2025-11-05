import { defineNuxtPlugin } from "#app";

const SW_URL = "/sw.js";

export default defineNuxtPlugin(() => {
  if (process.server || typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const promptForReload = async () => {
    const shouldReload = window.confirm("Eine aktualisierte Version ist verfügbar. Jetzt neu laden?");
    if (shouldReload) {
      try {
        const registration = await navigator.serviceWorker.getRegistration(SW_URL);
        registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
      } catch (error) {
        console.warn("[sw] Konnte wartenden Service Worker nicht informieren:", error);
      } finally {
        window.location.reload();
      }
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register(SW_URL);

      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "SW_ACTIVATED" && event.data.updated) {
          void promptForReload();
        }
      });

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) {
          return;
        }

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            void promptForReload();
          }
        });
      });
    } catch (error) {
      console.error("[sw] Registrierung fehlgeschlagen:", error);
    }
  };

  if (document.readyState === "complete") {
    void registerServiceWorker();
  } else {
    window.addEventListener("load", () => {
      void registerServiceWorker();
    });
  }
});
