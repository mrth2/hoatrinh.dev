module.exports = {
  mode: 'jit',
  theme: {
    fontFamily: {
      body: ['Roboto', 'sans-serif'],
      heading: ['Roboto Mono', 'monospace', 'sans-serif'],
      secondary: ['Inconsolata', 'monospace', 'sans-serif']
    },
    extend: {
      screens: {
        xsm: '480px'
      }
    }
  },
  variants: {},
  plugins: [],
  purge: {
    content: [
      'components/**/*.{vue,js}',
      'layouts/**/*.vue',
      'pages/**/*.vue',
      'plugins/**/*.{js,ts}',
      'nuxt.config.{js,ts}'
    ]
  }
}
