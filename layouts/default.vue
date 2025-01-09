<template>
  <div class="w-screen">
    <TheHeader />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~~/store/app";

const appStore = useAppStore();
const isModalOpen = computed(() => appStore.modalOpen);
watch(isModalOpen, () => {
  useHead({
    bodyAttrs: {
      class: isModalOpen.value ? "modal-open" : "",
    },
  });
});
</script>

<style lang="postcss">
@screen sm {
  .container {
    max-width: 540px;
  }
}
@screen md {
  .container {
    max-width: 720px;
  }
}
@screen lg {
  .container {
    max-width: 1140px;
  }
}

.background {
  @apply bg-green-50 h-full bg-no-repeat bg-cover relative;
  background-position: 50%;
  color: #fff;

  &:before {
    background: linear-gradient(
      54deg,
      rgb(2 77 4 / 95%) 34%,
      rgb(59 130 246 / 50%)
    );
    @apply h-full inset-0 absolute;
    content: "";
    z-index: 0;
  }
}

.section {
  @apply py-14;

  &__title {
    @apply mb-9 text-4xl leading-10 font-heading font-medium;
  }
}

.site-btn {
  @apply bg-green-600 text-white rounded-3xl leading-6 text-sm uppercase px-5 py-2 text-center inline-block font-semibold overflow-hidden;
  min-width: 170px;

  i {
    color: white;
    font-size: 1rem;
  }
}

.portfolio-menu {
  nav {
    @apply text-sm leading-5 font-heading uppercase font-bold mb-12 block;

    ul li {
      @apply inline-block;

      a {
        @apply pr-20;
        color: #999;
      }
    }
  }
}

.modal-open {
  @apply overflow-hidden;
}
</style>
