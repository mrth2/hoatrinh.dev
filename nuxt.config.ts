export default defineNuxtConfig({
  compatibilityDate: "2025-01-09",
  runtimeConfig: {
    public: {},
  },
  ssr: true,
  app: {
    head: {
      title: "Hi, I'm Hoa - Yet another nerd developer",
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          hid: "description",
          name: "description",
          content:
            "Welcome to my service world. Checkout what I can do for you and be my client today!",
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght:400;700&family=Inconsolata:wght@400;700&display=swap",
        },
      ],
    },
  },
  css: [
    "~/assets/css/tailwind.css",
    "@fortawesome/fontawesome-svg-core/styles.css",
  ],
  plugins: [],
  modules: ["@pinia/nuxt", "@nuxt/content", "nuxt-lodash"],

  vite: {
    optimizeDeps: {
      // include fontawesome library to optimize to avoid commonjs deps
      include: ["@fortawesome/fontawesome-svg-core"],
    },
  },
  content: {},
  postcss: {
    plugins: {
      "postcss-import": {},
      "tailwindcss/nesting": {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },
});
