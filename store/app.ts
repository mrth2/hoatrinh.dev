import { defineStore } from "pinia";

export const useAppStore = defineStore('app', {
  state: () => ({
    modalOpen: false
  }),
  actions: {
    toggleModal() {
      this.modalOpen = !this.modalOpen
    },
    showModal() {
      this.modalOpen = true
    },
    hideModal() {
      this.modalOpen = false
    }
  }
})