// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  typescript: { strict: true, typeCheck: true },
  css: ['@/assets/styles/base.less'],
  app: { head: { title: 'Senioren Tech Hilfe', meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }] } }
})
