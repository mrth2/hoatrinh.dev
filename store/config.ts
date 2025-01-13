import { defineStore } from "pinia";
import type { SwiperOptions } from "swiper/types";

export const useConfigStore = defineStore("config", {
  state: () => ({
    swiperOptions: {
      slidesPerView: 1,
      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: true,
      navigation: true,
    } as Partial<SwiperOptions>,
  }),
});
