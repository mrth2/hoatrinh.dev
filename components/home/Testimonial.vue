<template>
  <div id="testimonials" class="section">
    <div class="background relative slider-carousel review-bg">
      <div class="container">
        <Swiper
          :modules="[Controller, Autoplay, Navigation]"
          :options="swiperOptions"
          :autoplay="swiperOptions.autoplay"
          :navigation="{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }"
        >
          <SwiperSlide
            v-for="testimonial in testimonials"
            :key="testimonial.id"
          >
            <div>
              <div class="md:w-10/12 sm:w-10/12 w-10/12 mr-auto ml-auto">
                <p class="slider-carousel__title">
                  {{ testimonial.name }}
                </p>
                <p class="slider-carousel__caption">
                  Project: {{ testimonial.project }}
                </p>
                <hr />
                <p class="slider-carousel__description">
                  {{ testimonial.reviews }}
                </p>
              </div>
            </div>
          </SwiperSlide>

          <div class="swiper-button-prev" />
          <div class="swiper-button-next" />
        </Swiper>
        <div class="slider-carousel__circle">
          <p>
            <FontAwesomeIcon :icon="faQuoteRight" />
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { faQuoteRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { Swiper, SwiperSlide, useSwiper } from "swiper/vue";
import { Autoplay, Navigation, Controller } from "swiper/modules";
import { useConfigStore } from "~~/store/config";
import type { Testimonial } from "@nuxt/types";

const testimonials = await queryContent<Testimonial>("/testimonials").find();
const swiperOptions = computed(() => useConfigStore().swiperOptions);
</script>

<style scoped lang="postcss">
/* testimonials */
.slider-carousel {
  ::v-deep(.swiper-container) {
    position: relative;
  }

  &__title {
    @apply uppercase font-heading mt-20 mb-2.5;
  }

  &__caption {
    @apply text-base leading-5 italic opacity-70 mb-5;
  }

  hr {
    @apply mb-5;
    border-top: 1px solid #fff;
  }

  &__description {
    @apply mb-16;
  }

  .swiper-button-prev,
  .swiper-button-next {
    --swiper-theme-color: #ffffff;
    --swiper-navigation-size: 20px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  }

  .swiper-button-prev {
    left: 20px;
  }

  .swiper-button-next {
    right: 20px;
  }

  &__circle {
    --circle-radius: 44px;

    @apply rounded-full bg-white text-center absolute;
    top: calc(var(--circle-radius) * -1);
    right: calc(50% - var(--circle-radius));
    height: calc(var(--circle-radius) * 2);
    width: calc(var(--circle-radius) * 2);
    color: theme("colors.green.500");
    padding-top: var(--circle-radius);
  }
}
</style>
