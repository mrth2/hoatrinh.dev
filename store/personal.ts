import { defineStore } from "pinia";

export const usePersonalStore = defineStore('personal', {
  state: () => ({
    age: new Date().getFullYear() - 1990,
    email: 'hoatrinhdev@gmail.com',
    github: 'mrth2',
    skype: 'trinh.hai.hoa',
    facebook: 'trinhhaihoa',
    upwork: 'hoatrinhhai'
  }),
  getters: {
    getGithub(state) {
      return `https://github.com/${state.github}`
    },
    getSkype(state) {
      return `skype:${state.skype}?chat`
    },
    getFacebook(state) {
      return `https://facebook.com/${state.facebook}`
    },
    getUpwork(state) {
      return `https://upworks.com/fl/${state.upwork}`
    },
    getEmail(state) {
      return `mailto:${state.email}`
    }
  }
})