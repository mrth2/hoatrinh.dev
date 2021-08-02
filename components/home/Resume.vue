<template>
  <section id="resume" class="container section">
    <div class="row">
      <div class="md:w-10/12">
        <h2 id="resume_header" class="section__title">
          Resume_
        </h2>
        <p class="section__description" v-html="$md.render(resumeSummary)" />
      </div>
    </div>
    <div class="row">
      <div class="md:w-8/12 section__resume resume-list">
        <h3 class="resume-list_title">
          education
        </h3>
        <div class="resume-list__block">
          <p class="resume-list__block-title">
            University of Engineering and Technology
          </p>
          <p class="resume-list__block-date">
            2008 - 2012
          </p>
          <p>
            Bachelor of Computer Science
          </p>
        </div>
        <div class="resume-list__block">
          <p class="resume-list__block-title">
            Informatica Class - Tran Phu Gifted High School
          </p>
          <p class="resume-list__block-date">
            2005 - 2008
          </p>
          <p>
            Distinction Grade
          </p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="md:w-8/12 section__resume resume-list">
        <h3 class="resume-list_title">
          employment
        </h3>
        <div class="resume-list__block">
          <p class="resume-list__block-title">
            Upwork Freelancer
          </p>
          <p class="resume-list__block-date">
            2020 - now
          </p>
          <p>
            Senior Full Stack Developer. Specialized with VueJS & Laravel/NodeJS Stack
          </p>
        </div>
        <div class="resume-list__block">
          <p class="resume-list__block-title">
            DesignBold
          </p>
          <p class="resume-list__block-date">
            2020 - 2021
          </p>
          <p>
            <b>Team Leader</b><br>
            - maintain application performance and release roadmap.
          </p>
        </div>
        <div class="resume-list__block">
          <p class="resume-list__block-title">
            DesignBold
          </p>
          <p class="resume-list__block-date">
            2016 - 2019
          </p>
          <p>
            <b>Full Stack Developer</b><br>
            - manage backend services, Restful API, and system management to serve 500K monthly users.<br>
            - develop useful frontend features with UX in mind.
          </p>
        </div>
        <div class="resume-list__block">
          <p class="resume-list__block-title">
            NETLINK
          </p>
          <p class="resume-list__block-date">
            2012 - 2016
          </p>
          <p>
            <b>Backend Developer</b><br>
            - Develop SEO optimized online magazine and newspaper. <br>
            - Build crawler for big text & video processing.
          </p>
        </div>
      </div>
    </div>
    <div ref="progressList" class="row section__resume progress-list js-progress-list">
      <div class="md:w-full">
        <h3 class="progress-list__title">
          programming skills
        </h3>
      </div>
      <div class="md:w-5/12 mr-auto">
        <div class="progress-list__skill">
          <p>
            <span class="progress-list__skill-title">VueJS</span>
            <span class="progress-list__skill-value">80%</span>
          </p>
          <div class="progress">
            <div class="progress-bar" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" />
          </div>
        </div>
        <div class="progress-list__skill">
          <p>
            <span class="progress-list__skill-title">NuxtJS</span>
            <span class="progress-list__skill-value">75%</span>
          </p>
          <div class="progress">
            <div class="progress-bar" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" />
          </div>
        </div>
        <div class="progress-list__skill">
          <p>
            <span class="progress-list__skill-title">Laravel</span>
            <span class="progress-list__skill-value">80%</span>
          </p>
          <div class="progress">
            <div class="progress-bar" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" />
          </div>
        </div>
        <div class="progress-list__skill">
          <p>
            <span class="progress-list__skill-title">ExpressJS</span>
            <span class="progress-list__skill-value">60%</span>
          </p>
          <div class="progress">
            <div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" />
          </div>
        </div>
      </div>
      <div class="md:w-5/12 mr-auto">
        <div class="progress-list__skill">
          <p>
            <span class="progress-list__skill-title">Javascript</span>
            <span class="progress-list__skill-value">90%</span>
          </p>
          <div class="progress">
            <div class="progress-bar" role="progressbar" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100" />
          </div>
        </div>
        <div class="progress-list__skill">
          <p>
            <span class="progress-list__skill-title">PHP</span>
            <span class="progress-list__skill-value">85%</span>
          </p>
          <div class="progress">
            <div class="progress-bar" role="progressbar" aria-valuenow="85" aria-valuemin="0" aria-valuemax="100" />
          </div>
        </div>
        <div class="progress-list__skill">
          <p>
            <span class="progress-list__skill-title">CSS3</span>
            <span class="progress-list__skill-value">75%</span>
          </p>
          <div class="progress">
            <div class="progress-bar" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" />
          </div>
        </div>
        <div class="progress-list__skill">
          <p>
            <span class="progress-list__skill-title">HTML5</span>
            <span class="progress-list__skill-value">90%</span>
          </p>
          <div class="progress">
            <div class="progress-bar" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    resumeSummary: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      progressUpdated: false
    }
  },
  beforeMount () {
    window.addEventListener('scroll', this.showProgressOnScroll)
  },
  mounted () {
    this.showProgressOnScroll()
  },
  methods: {
    showProgressOnScroll (): void {
      const progressList = document.querySelector<HTMLElement>('.progress-list')
      if (progressList && this.$isInViewport(progressList)) {
        progressList.querySelectorAll<HTMLElement>('.progress-bar').forEach((bar) => {
          this.showProgressBar(bar)
        })
        this.progressUpdated = true
        window.removeEventListener('scroll', this.showProgressOnScroll)
      }
    },
    showProgressBar (bar: HTMLElement): void {
      const min = parseInt(String(bar.getAttribute('aria-valuemin')))
      let now = parseInt(String(bar.getAttribute('aria-valuenow')))
      const max = parseInt(String(bar.getAttribute('aria-valuemax')))
      if (isNaN(min) || isNaN(max) || isNaN(now)) {
        return
      }
      if (!this.progressUpdated) {
        now = min
      }
      if (now >= min && now <= max) {
        bar.style.width = `${now}%`
      }
      if (now < max) {
        now++
        setTimeout(() => {
          this.showProgressBar(bar)
        }, 200)
      }
    }
  }
})
</script>

<style scoped lang="postcss">
/* resume */
.resume-list {
  @apply my-7 flex-initial relative;

  &_title {
    @apply text-sm leading-6 uppercase font-heading font-semibold mb-8;
    letter-spacing: 5px;
    color: #999;
  }

  &__block {
    @apply border-l-2 border-green-500 pl-8 pb-10;

    &:before {
      content: "";
      @apply w-3 h-3 border-2 border-green-400 rounded-full absolute bg-white;
      left: -5px;
    }

    &:last-child {
      @apply pb-0;
    }

    p {
      @apply m-0;
    }

    &-title {
      @apply uppercase text-sm leading-5 font-heading font-bold pb-2;
      color: green;
    }

    &-date {
      @apply font-secondary text-sm leading-6 pb-2;
      color: #999;
    }
  }
}

/* skills */
.progress-list {
  @apply mt-8;

  p {
    @apply w-full font-secondary mb-2;
  }

  &__title, p {
    @apply text-sm leading-6 uppercase;
  }

  &__title {
    @apply font-heading font-bold mb-12;
    color: #999;
    letter-spacing: 5px;
  }

  .progress {
    @apply h-2 mb-10 flex overflow-hidden text-xs leading-4 text-center bg-gray-100 rounded;

    &-bar {
      @apply bg-green-500 h-4 leading-4 text-white;
      transition: width .6s ease;
    }
  }
}
</style>
