// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  
  // CSS
  css: [
    '@/assets/scss/main.scss'
  ],
  
  // Modules
  modules: [
    '@pinia/nuxt',
  ],
  
  // Vite
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: ''
        }
      }
    }
  },
  
  // Runtime config
  runtimeConfig: {
    // Private keys (server-side)
    
    // Public keys (client-side)
    public: {
      yandexMapsApiKey: process.env.YANDEX_MAPS_API_KEY || '',
      apiBase: process.env.API_BASE || '/api'
    }
  },
  
  // App config
  app: {
    head: {
      title: 'Народный Контроль',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Интерактивная карта городских проблем' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css' }
      ]
    }
  }
})
