import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/google-fonts', 'nuxt-chatgpt'],
  typescript: { strict: true, typeCheck: true },
  css: ['@/assets/styles/base.less'],
  app: { 
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Senioren Tech Hilfe', 
      meta: [{ 
        name: 'viewport', 
        content: 'width=device-width, initial-scale=1' }], 
      htmlAttrs: {
        lang: 'de',
        'data-contrast': 'base',
      },
    }
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
