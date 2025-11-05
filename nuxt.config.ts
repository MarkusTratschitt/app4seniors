import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: false },
  modules: ["@pinia/nuxt", "@nuxtjs/google-fonts"],
  typescript: { strict: true, typeCheck: true },
  css: ["@/assets/styles/base.less"],
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: "Senioren Tech Hilfe",
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          name: "theme-color",
          content: "#005fcc",
        },
      ],
      link: [
        {
          rel: "manifest",
          href: "/manifest.webmanifest",
        },
        {
          rel: "icon",
          href: "/assets/favicon.ico",
        },
      ],
      htmlAttrs: {
        lang: "de",
        "data-contrast": "base",
      },
    },
  },
  googleFonts: {
    families: {
      Roboto: [400, 500, 700],
    },
    display: "swap",
  },
  vite: {
    vue: {
      customElement: true,
    },
    vueJsx: {
      mergeProps: true,
    },
  },
})
