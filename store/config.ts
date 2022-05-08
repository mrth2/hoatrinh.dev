import { defineStore } from "pinia";

export const useConfigStore = defineStore('config', {
  state: () => ({
    swiperOptions: {
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }
    }
  })
})