export const state = () => ({
  modalOpen: false
})

export const mutations = {
  toggleModal (state) {
    state.modalOpen = !state.modalOpen
  },
  showModal (state) {
    state.modalOpen = true
  },
  hideModal (state) {
    state.modalOpen = false
  }
}
