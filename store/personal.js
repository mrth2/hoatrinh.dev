export const state = () => ({
  age: new Date().getFullYear() - 1990,
  email: 'hi@hoatrinh.dev',
  github: 'mrth2',
  skype: 'trinh.hai.hoa',
  facebook: 'trinhhaihoa',
  upwork: 'hoatrinhhai'
})

export const getters = {
  getGithub (state) {
    return `https://github.com/${state.github}`
  },
  getSkype (state) {
    return `skype:${state.skype}?chat`
  },
  getFacebook (state) {
    return `https://facebook.com/${state.facebook}`
  },
  getUpwork (state) {
    return `https://upworks.com/fl/${state.upwork}`
  },
  getEmail (state) {
    return `mailto:${state.email}`
  }
}
