import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $isInViewport(element: HTMLElement): boolean;
    $sleep(ms: number | undefined): Promise<any>;
  }
}

Vue.prototype.$isInViewport = (element: HTMLElement) => {
  const distance = element.getBoundingClientRect()
  return (
    distance.top >= 0 &&
    distance.left >= 0 &&
    distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    distance.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

Vue.prototype.$sleep = (ms: number | undefined) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
