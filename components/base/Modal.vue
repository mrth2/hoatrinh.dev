<template>
  <div class="modal">
    <div class="modal__dialog">
      <div class="modal__close">
        <button type="button" class="absolute top-2.5 right-2.5" @click="close">
          <span>×</span>
        </button>
      </div>
      <div class="modal__header">
        <slot name="title">
          <div class="modal__title">
            <h4>{{ title }}</h4>
          </div>
        </slot>
        <slot name="description">
          <div class="modal__description">
            <p>{{ description }}</p>
          </div>
        </slot>
      </div>
      <div class="modal__body">
        <slot name="body" />
      </div>
      <div class="modal__footer">
        <slot name="footer">
          <button
            v-if="closeText"
            type="button"
            class="cancel-btn"
            @click="close"
          >
            {{ closeText }}
          </button>
          <button
            v-if="actionText"
            type="button"
            class="action-btn"
            @click="$emit('action')"
          >
            {{ actionText }}
          </button>
        </slot>
      </div>
    </div>
    <div v-if="staticBackdrop" class="modal__backdrop" />
    <div v-else class="modal__backdrop" @click="close" />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "~~/store/app";

withDefaults(
  defineProps<{
    type: "general" | "confirm";
    title?: string;
    description?: string;
    closeText?: string;
    actionText?: string;
    staticBackdrop?: boolean;
  }>(),
  {
    type: "general",
    closeText: "Cancel",
    actionText: "OK",
    default: false,
  }
);
const emit = defineEmits(["close", "hidden", "shown", "action"]);

const appStore = useAppStore();
function show() {
  appStore.showModal();
  emit("shown", this);
}
function hide() {
  appStore.hideModal();
  emit("hidden", this);
}
function close() {
  hide();
  emit("close", this);
}
onMounted(show);
</script>

<style>
.modal-open .modal {
  @apply block !important;
}
</style>

<style scoped lang="postcss">
.modal {
  @apply fixed inset-0 overflow-y-auto overflow-x-hidden hidden;
  z-index: 100;

  &__backdrop {
    @apply bg-black bg-opacity-40 fixed inset-0;
  }
  &__dialog {
    @apply bg-white m-2 relative p-10 mx-auto my-8;
    max-width: 500px;
    z-index: 101;
  }
  &__title {
    @apply text-lg font-bold text-white;
  }
  &__close {
    button {
      @apply absolute top-5 right-5 text-xl font-light text-gray-400 opacity-50;
      text-shadow: 0 1px 0 #fff;
      width: 20px;
    }
  }
  &__footer {
    button {
      @apply border py-2 px-10 text-base text-white rounded;
      &.action-btn {
        @apply bg-green-500 border-green-500;
      }
      &.cancel-btn {
        @apply border-gray-500 text-gray-500;
      }
    }
  }
}

@screen md {
  .modal__dialog {
    max-width: 650px;
  }
}

@screen lg {
  .modal__dialog {
    max-width: 800px;
  }
}
</style>
