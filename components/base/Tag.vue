<template>
  <ul class="tags">
    <li v-for="item in list" :key="idKey ? item[idKey] : item">
      <slot>
        {{ contentKey ? item[contentKey] : item }}
      </slot>
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  list: any[];
  idKey?: string;
  contentKey?: string;
}>();
</script>

<style scoped>
.tags {
  @apply -mt-2.5;
  li {
    @apply inline-block text-sm leading-4 bg-white border border-gray-200 rounded-sm shadow-sm py-1.5 px-2.5 mr-2.5 mt-2.5;
  }
}
</style>
