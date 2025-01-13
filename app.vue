<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "HoaTrinh.dev",
  link: [
    {
      rel: "icon",
      type: "image/png",
      href: "/favicon.png",
    },
  ],
  meta: [
    {
      name: "description",
      content:
        "Welcome to my service world. Checkout what I can do for you and be my client today!",
    },
  ],
});
</script>
