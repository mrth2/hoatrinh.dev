import { defineStore } from "pinia";
import { SwiperOptions } from "swiper/types";

export const useConfigStore = defineStore('config', {
  state: () => ({
    swiperOptions: {
      slidesPerView: 1,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false
      },
      pagination: true,
      navigation: true
    } as SwiperOptions
  })
})