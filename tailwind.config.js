module.exports = {
  mode: 'jit',
  content: [
    './assets/**/*.{vue,js,css}',
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    fontFamily: {
      // body: ['Roboto', 'sans-serif'],
      body: ['Roboto Mono', 'monospace', 'sans-serif'],
      heading: ['Roboto Mono', 'monospace', 'sans-serif'],
      secondary: ['Inconsolata', 'monospace', 'sans-serif']
    },
    extend: {
      screens: {
        xsm: '480px'
      }
    }
  },
  plugins: [],
}
