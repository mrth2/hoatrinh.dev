<template>
  <div v-if="loaded" id="testimonials" class="section">
    <div class="background relative slider-carousel review-bg">
      <div class="container">
        <div v-swiper="swiperOptions">
          <div class="swiper-wrapper">
            <div v-for="testimonial in testimonials" :key="testimonial.id" class="swiper-slide">
              <div>
                <div class="md:w-10/12 sm:w-10/12 w-10/12 mr-auto ml-auto">
                  <p class="slider-carousel__title">
                    {{ testimonial.name }}
                  </p>
                  <p class="slider-carousel__caption">
                    Project: {{ testimonial.project }}
                  </p>
                  <hr>
                  <p class="slider-carousel__description">
                    {{ testimonial.reviews }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div slot="button-prev" class="swiper-button-prev" />
          <div slot="button-next" class="swiper-button-next" />
        </div>
        <div class="slider-carousel__circle">
          <p><i class="fa fa-quote-right" aria-hidden="true" /></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { directive as swiper } from 'vue-awesome-swiper'
import { Testimonial } from '@nuxt/types'

export default Vue.extend({
  directives: {
    swiper
  },
  data () {
    return {
      loaded: false,
      testimonials: [] as Testimonial[]
    }
  },
  async fetch () {
    this.testimonials = await this.$strapi.find<Testimonial[]>('testimonials')
    this.loaded = true
  },
  computed: {
    ...mapState('config', ['swiperOptions'])
  }
})
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

  .swiper-button-prev, .swiper-button-next {
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
    color: theme('colors.green.500');
    padding-top: var(--circle-radius);
  }
}
</style>
