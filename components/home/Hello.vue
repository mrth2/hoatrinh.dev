<template>
  <section id="hello" class="container section">
    <div class="row">
      <div class="max-w-10/12 md:max-w-full">
        <h2 id="hello" class="section__title">Hi_</h2>
        <ContentRendererMarkdown :value="introduction" />
        <div class="flex flex-row gap-2">
          <a :href="contactLink" class="section_btn site-btn">
            <FaIcon :icon="['fab', 'wordpress']" />
            <span>Optimize Wordpress</span>
          </a>
          <a :href="contactLink" class="section_btn site-btn">
            <FaIcon :icon="['fab', 'laravel']" />
            <span>Backend Development</span>
          </a>
          <a :href="contactLink" class="section_btn site-btn">
            <FaIcon :icon="['fab', 'vuejs']" />
            <span>Frontend Development</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const contactLink = "/#contact";
const introduction = await queryContent('/about/introduction').findOne();
</script>

<style scoped lang="postcss">
.section_btn.site-btn {
  @apply flex flex-row items-center gap-2 !h-auto rounded-full py-2.5;
}
</style>
