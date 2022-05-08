<template>
  <div v-if="homepage" class="home">
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

const { data: homepage } = useAsyncData("homepage", () =>
  useStrapi3().find<HomePage>("home-page")
);
useHead({
  title: homepage.value?.meta_title,
  meta: [
    {
      hid: "description",
      name: "description",
      content: homepage.value?.meta_description,
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
  window.addEventListener("scroll", showSectionTitleOnScroll);
});
onMounted(() => {
  setTimeout(showSectionTitleOnScroll, 100);
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
