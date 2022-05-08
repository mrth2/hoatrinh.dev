<template>
  <div class="home">
    <HomeHello :introduction="homepage.introduction" />
    <hr />

    <HomeResume :resume-summary="homepage.resume_summary" />

    <HomePortfolio />

    <HomeTestimonial />

    <HomeBlog />

    <HomeContact />
  </div>
</template>

<script setup lang="ts">
import { HomePage } from "@nuxt/types";

// Import Swiper styles
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";

const { data: homepage } = useAsyncData("homepage", () =>
  useStrapi3().find<HomePage>("home-page")
);
const meta_title = computed(() => homepage.value?.meta_title);
const meta_description = computed(() => homepage.value?.meta_description);
useHead({
  title: meta_title.value,
  meta: [
    {
      hid: "description",
      name: "description",
      content: meta_description.value,
    },
  ],
});
const { $isInViewport } = useNuxtApp();
function clearSectionTitle() {
  document.querySelectorAll<HTMLElement>(".section__title").forEach((title) => {
    title.style.color = "transparent";
  });
}
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
  // window.addEventListener("scroll", showSectionTitleOnScroll);
});
onMounted(() => {
  // setTimeout(showSectionTitleOnScroll, 100);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", showSectionTitleOnScroll);
});
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
  @apply bg-green-500 rounded-lg text-sm leading-5 uppercase px-4 py-3 text-center inline-block font-semibold overflow-hidden;
  color: #fff;
  min-width: 170px;
}
</style>
