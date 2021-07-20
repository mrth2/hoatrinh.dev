<template>
  <section id="hello" class="container section">
    <div class="row">
      <div class="max-w-10/12 md:max-w-full">
        <h2 id="hello_header" class="section__title">
          Hi_
        </h2>
        <p class="section__description mb-8">
          I am a <strong>WordPress Speed Expert</strong> - if you have wanted to build fast WordPress pages or own
          slow WordPress
          sites, join my world. I upgrade hundreds of websites from 7-8s loading to 2-3s. By understanding the core
          web vitals, with the quality of coding in mind, I satisfied many site owners. Who doesn't want a
          fast-loading web which can bring <strong>many sales</strong> and <strong>improve life</strong>? Are you?
          <br><br>
          While WordPress Optimization is my audit, <strong>Full Stack Developer</strong> is the reason I was born. I
          specialized with Laravel, PHP, NodeJS, VueJS, NuxtJS, TailwindCSS, Bootstrap, Strapi, and ElectronJS. I
          dedicate myself to making fast web & native applications that are well-structured, scalable, and testable.
          I'm a fast learner,
          hard worker, and team player who is proficient in the world of web. I always put <strong>customer
            satisfaction</strong> in my
          mind, so it's always a win-win working with me!
        </p>
        <a :href="upworkProfile" class="section_btn site-btn mr-1">
          <i class="fa fa-wordpress" />
          Optimize Wordpress
        </a>
        <a :href="upworkProfile" class="section_btn site-btn mr-1">
          <i class="fab fa-laravel" />
          Backend Development
        </a>
        <a :href="upworkProfile" class="section_btn site-btn">
          <i class="fab fa-vuejs" />
          Frontend Development
        </a>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data () {
    return {
      upworkProfile: 'https://upwork.com/fl/hoatrinhhai'
    }
  }
}
</script>
