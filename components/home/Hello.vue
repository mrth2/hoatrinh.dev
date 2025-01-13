<template>
  <section id="hello" class="container section">
    <div class="row">
      <div class="w-full max-w-10/12 md:max-w-full">
        <h2 id="hello" class="section__title">Hi_</h2>
        <ContentRendererMarkdown :value="introduction" />
        <div class="flex flex-row flex-wrap gap-2">
          <a
            :href="contactLink"
            class="section_btn site-btn"
            aria-label="Hire me as a Frontend Developer"
          >
            <FontAwesomeIcon :icon="faVuejs" />
            <span>Frontend Development</span>
          </a>
          <a
            :href="contactLink"
            class="section_btn site-btn"
            aria-label="Hire me as a Backend Developer"
          >
            <FontAwesomeIcon :icon="faLaravel" />
            <span>Backend Development</span>
          </a>
          <a
            :href="contactLink"
            class="section_btn site-btn"
            aria-label="Hire me as a Wordpress Developer"
          >
            <FontAwesomeIcon :icon="faWordpress" />
            <span>Optimize Wordpress</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  faLaravel,
  faVuejs,
  faWordpress,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const contactLink = "/#contact";
const introduction = await queryContent("/about/introduction").findOne();
</script>

<style scoped lang="postcss">
.section_btn.site-btn {
  @apply flex flex-row items-center gap-2 !h-auto rounded-full py-2.5;
}
</style>
