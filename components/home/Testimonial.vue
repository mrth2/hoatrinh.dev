<template>
  <div v-if="loaded" id="testimonials" class="section">
    <div class="background relative slider-carousel review-bg">
      <div class="container">
        <div ref="slider" class="swiper">
          <div class="swiper-wrapper">
            <div
              class="swiper-slide"
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
            </div>
          </div>
          <div class="swiper-button-prev" @click="goPrev" />
          <div class="swiper-button-next" @click="goNext" />
        </div>
        <div class="slider-carousel__circle">
          <p><FaIcon icon="quote-right" aria-hidden="true" /></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Testimonial } from "@nuxt/types";
import { Swiper, Autoplay } from "swiper";
import { useConfigStore } from "~~/store/config";
Swiper.use([Autoplay]);

const { data: testimonials, pending } = useLazyAsyncData("testimonials", () =>
  useStrapi3().find<Testimonial[]>("testimonials")
);
const loaded = computed(() => !pending.value);
const slider = ref<HTMLElement>();

const swiperOptions = computed(() => useConfigStore().swiperOptions);
const swiper = ref<Swiper>();
onMounted(() => {
  swiper.value = new Swiper(slider.value, swiperOptions.value);
});
function goPrev() {
  if (swiper.value) swiper.value.slidePrev();
}
function goNext() {
  if (swiper.value) swiper.value.slideNext();
}
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
