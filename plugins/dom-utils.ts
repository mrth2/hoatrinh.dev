export default defineNuxtPlugin(() => {
  return {
    provide: {
      isInViewport: (element: HTMLElement) => {
        const distance = element.getBoundingClientRect()
        return (
          distance.top >= 0 &&
          distance.left >= 0 &&
          distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          distance.right <= (window.innerWidth || document.documentElement.clientWidth)
        )
      },
      sleep: (ms: number | undefined) => {
        return new Promise(resolve => setTimeout(resolve, ms))
      }
    }
  }
})