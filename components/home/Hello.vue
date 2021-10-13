<template>
  <section id="hello" class="container section">
    <div class="row">
      <div class="max-w-10/12 md:max-w-full">
        <h2 id="hello_header" class="section__title">
          Hi_
        </h2>
        <p
          class="section__description mb-8"
          v-html="$md.render(introduction)"
        />
        <a :href="contactLink" class="section_btn site-btn mr-1">
          <i class="fa fa-wordpress" />
          Optimize Wordpress
        </a>
        <a :href="contactLink" class="section_btn site-btn mr-1">
          <i class="fab fa-laravel" />
          Backend Development
        </a>
        <a :href="contactLink" class="section_btn site-btn">
          <i class="fab fa-vuejs" />
          Frontend Development
        </a>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    introduction: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      contactLink: '/#contact'
    }
  }
}
</script>
