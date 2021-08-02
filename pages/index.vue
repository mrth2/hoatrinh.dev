<template>
  <div class="home">
    <HomeHello :introduction="homepage.introduction" />
    <hr>

    <HomeResume :resume-summary="homepage.resume_summary" />

    <HomePortfolio />

    <HomeTestimonial />

    <HomeBlog />

    <HomeContact />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { HomePage } from '@nuxt/types'

export default Vue.extend({
  data () {
    return {
      homepage: {} as HomePage
    }
  },
  async fetch () {
    this.homepage = await this.$strapi.find('home-page')
  },
  head (): Object {
    return {
      title: this.homepage.meta_title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.homepage.meta_description
        }
      ]
    }
  },
  beforeMount () {
    window.addEventListener('scroll', this.showSectionTitleOnScroll)
  },
  mounted () {
    setTimeout(() => {
      this.showSectionTitleOnScroll()
    }, 100)
  },
  methods: {
    // section title
    clearSectionTitle (): void {
      document.querySelectorAll<HTMLElement>('.section__title').forEach((title) => {
        title.style.color = 'transparent'
      })
    },
    typeWriter (textElement: HTMLElement, text: string, currentAt: number): void {
      if (currentAt < text.length) {
        textElement.innerHTML += text.charAt(currentAt)
        currentAt++
        setTimeout(() => {
          this.typeWriter(textElement, text, currentAt)
        }, 50)
      } else {
        textElement.classList.remove('typing')
        textElement.classList.add('typed')
      }
    },
    showSectionTitleOnScroll (): void {
      document.querySelectorAll<HTMLElement>('.section__title:not(.typed)').forEach((title) => {
        if (this.$isInViewport(title) && !title.classList.contains('typed') && !title.classList.contains('typing')) {
          title.classList.add('typing')
          let text = title.innerHTML
          title.innerHTML = ''
          title.style.color = ''
          text = text.trim()
          this.typeWriter(title, text, 0)
        }
      })
    }
  }
})
</script>

<style scoped lang="postcss">
::v-deep(.section) {
  &__description {
    strong {
      @apply text-black;
    }
  }
}

::v-deep(.review-bg) {
  background-image: url(~/assets/img/reviews-bg.jpg);
}

/* buttons */
::v-deep(.site-btn) {
  @apply bg-green-500 h-14 rounded-lg text-sm leading-5 uppercase p-4 text-center inline-block font-semibold overflow-hidden;
  color: #fff;
  min-width: 170px;
}
</style>
