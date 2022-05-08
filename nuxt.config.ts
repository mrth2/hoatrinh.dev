import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  env: {
    strapiBaseUri: process.env.HTD_API || 'http://localhost:1337'
  },
  ssr: false,
  target: 'static',
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
  css: [
    "~/assets/css/tailwind.css",
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  build: {
    postcss: {
      postcssOptions: {
        plugins: {
          // tailwindcss: {},
          // autoprefixer: {},
          'postcss-import': {},
          'tailwindcss/nesting': {},
          tailwindcss: {},
          autoprefixer: {},
        },
      },
    },
  },
  plugins: [
    // {
    //   src: '@/plugins/dom-utils.ts',
    //   mode: 'client'
    // },
    // {
    //   src: '@/plugins/markdownit.ts',
    //   mode: 'client'
    // }
  ],
  modules: [],
  loading: {
    color: 'green',
    height: '2px'
  },

  buildModules: [
    '@nuxtjs/strapi',
    '@pinia/nuxt'
  ],
  strapi: {
    url: process.env.HTD_API || 'http://localhost:1337',
    // prefix: '/api',
    version: 'v3',
    cookie: {}
  },

  vite: {
    optimizeDeps: {
      // include fontawesome library to optimize to avoid commonjs deps
      include: ['@fortawesome/fontawesome-svg-core']
    }
  }
})
