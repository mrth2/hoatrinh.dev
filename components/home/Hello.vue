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
            Optimize Wordpress
          </a>
          <a :href="contactLink" class="section_btn site-btn">
            <FaIcon :icon="['fab', 'laravel']" />
            Backend Development
          </a>
          <a :href="contactLink" class="section_btn site-btn">
            <FaIcon :icon="['fab', 'vuejs']" />
            Frontend Development
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
