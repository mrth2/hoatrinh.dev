<template>
  <div class="container mx-auto p-12">
    <div v-if="error" class="bg-red-400">
      {{ error }}
    </div>
    <div v-else class="frameworks grid gap-10 grid-cols-3">
      <div v-for="framework in frameworks" :key="framework.id" class="shadow-md rounded max-w-sm mb-10">
        <div class="block bg-green-50 p-5">
          <img class="object-contain md:object-scale-down h-52 w-full" :src="getThumbnail(framework.thumbnail)" />
        </div>
        <div class="mt-5 p-5">
          <span class="block font-bold title">{{ framework.name }}</span>
          <span class="block mt-5">{{ framework.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CloudinaryMedia, Framework } from "@nuxt/types";

const error = ref("");
const frameworks = ref<Framework[]>([]);
try {
  frameworks.value = await queryContent<Framework>("/frameworks").find();
} catch (e: any) {
  error.value = e.message;
}

function getThumbnail(thumbnail: CloudinaryMedia) {
  if (thumbnail)
    return thumbnail.url;
  return "https://via.placeholder.com/150"
}
</script>
