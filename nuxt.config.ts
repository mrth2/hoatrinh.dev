// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      strapi: {
        url: process.env.HTD_API || 'http://localhost:1337',
        version: 'v3'
      }
    }
  },
  ssr: true,
  app: {
    head: {
      title: 'Hi, I\'m Hoa - Yet another nerd developer',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1'
        },
        {
          hid: 'description',
          name: 'description',
          content: 'Welcome to my service world. Checkout what I can do for you and be my client today!'
        }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Inconsolata&display=swap'
        }
      ]
    },
  },
  css: [
    "~/assets/css/tailwind.css",
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  plugins: [],
  modules: [
    '@pinia/nuxt',
    "@nuxt/content",
    '@nuxtjs/strapi',
  ],

  vite: {
    optimizeDeps: {
      // include fontawesome library to optimize to avoid commonjs deps
      include: ['@fortawesome/fontawesome-svg-core']
    }
  },
  content: { },
  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': {},
      tailwindcss: {},
      autoprefixer: {},
    }
  }
})
