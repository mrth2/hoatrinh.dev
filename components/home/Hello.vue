<template>
  <section id="hello" class="container section">
    <div class="row">
      <div class="max-w-10/12 md:max-w-full">
        <h2 id="hello_header" class="section__title">Hi_</h2>
        <!-- <p
          class="section__description mb-8"
          v-html="$md.render(introduction)"
        /> -->
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
withDefaults(
  defineProps<{
    type: string;
  }>(),
  {
    type: "",
  }
);
const contactLink = ref("/#contact");
const { $md, $sleep } = useNuxtApp();
</script>

<style scoped lang="postcss">
.section_btn.site-btn {
  @apply flex flex-row items-center gap-2 !h-auto rounded-full py-2.5;
}
</style>
