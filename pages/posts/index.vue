<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: "blog",
  scrollToTop: true,
});
const { $axios } = useNuxtApp();
const { data: posts } = useFetch(() => $axios.get("/posts"));
const { data: postPage } = useFetch(() => $axios.get("/posts-page"));
</script>
