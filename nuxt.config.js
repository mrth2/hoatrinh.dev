export default {
  env: {
    strapiBaseUri: process.env.API_URL || 'http://localhost:1337'
  },
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
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
        rel: 'icon',
        type: 'image/png',
        href: '/favicon.png'
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Roboto&family=Roboto+Mono&family=Inconsolata&display=swap'
      }
    ],
    script: [
      {
        type: 'module',
        src: 'https://kit.fontawesome.com/748bbdcbdf.js'
      }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    // swiper
    'swiper/css/swiper.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    {
      src: '@/plugins/nuxt-swiper-plugin.js',
      // mode: 'client'
      ssr: true
    },
    {
      src: '@/plugins/dom-utils.js',
      mode: 'client'
    }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxtjs/svg'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/strapi',
    // cloudinary
    '@nuxtjs/cloudinary'
  ],

  // Strapi API for nuxt
  strapi: {
    entities: ['frameworks', 'cms', 'databases', 'platforms'],
    url: process.env.PRODUCTION === 'true' && process.env.HTD_API ? process.env.HTD_API : 'http://localhost:1337'
  },

  // cloudinary config
  cloudinary: {
    cloudName: process.env.CLOUDINARY_NAME
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: '~/tailwind.config.js',
    exposeConfig: false,
    config: {}
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      plugins: {
        // Disable `postcss-url`
        'postcss-url': false,
        // Add some plugins
        'postcss-nested': {}
      },
      preset: {
        autoprefixer: {
          grid: true
        }
      }
    }
  },

  loading: {
    color: 'green',
    height: '2px'
  }
}
