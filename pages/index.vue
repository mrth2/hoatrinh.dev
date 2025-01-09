<template>
  <div class="home">
    <HomeHello />

    <HomeResume />

    <HomePortfolio />

    <HomeTestimonial />

    <HomeBlog />

    <HomeContact />
  </div>
</template>

<script setup lang="ts">
import type { About, SEO } from "@nuxt/types";

// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";

async function fetchSEO() {
  return await queryContent<SEO>("/seo/home").findOne();
}
const homeSEO = await fetchSEO();
const { meta_title, meta_description } = homeSEO;

useHead({
  title: meta_title,
  meta: [
    {
      hid: "description",
      name: "description",
      content: meta_description,
    },
  ],
});
const { $isInViewport } = useNuxtApp();
function typeWriter(textElement: HTMLElement, text: string, currentAt: number) {
  if (currentAt < text.length) {
    textElement.innerHTML += text.charAt(currentAt);
    currentAt++;
    setTimeout(() => {
      typeWriter(textElement, text, currentAt);
    }, 50);
  } else {
    textElement.classList.remove("typing");
    textElement.classList.add("typed");
  }
}
function showSectionTitleOnScroll() {
  document
    .querySelectorAll<HTMLElement>(".section__title:not(.typed)")
    .forEach((title) => {
      if (
        $isInViewport(title) &&
        !title.classList.contains("typed") &&
        !title.classList.contains("typing")
      ) {
        title.classList.add("typing");
        let text = title.innerHTML;
        title.innerHTML = "";
        title.style.color = "";
        text = text.trim();
        typeWriter(title, text, 0);
      }
    });
}
onBeforeMount(() => {
  window.addEventListener("scroll", showSectionTitleOnScroll);
});
// onMounted(showSectionTitleOnScroll);
onBeforeUnmount(() => {
  window.removeEventListener("scroll", showSectionTitleOnScroll);
});
</script>

<style scoped lang="postcss">
::v-deep(.section) {
  &[id] {
    scroll-margin-top: 50px;
  }
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
  @apply bg-green-500 rounded-lg text-sm leading-5 uppercase px-4 py-3 text-center inline-block font-semibold overflow-hidden;
  color: #fff;
  min-width: 170px;
}
</style>
