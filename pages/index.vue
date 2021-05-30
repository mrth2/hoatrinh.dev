<template>
  <div class="home">
    <!--Hello-->
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
    <!--Hello-->
    <hr>

    <!--Resume-->
    <section id="resume" class="container section">
      <div class="row">
        <div class="md:w-10/12">
          <h2 id="resume_header" class="section__title">
            Resume_
          </h2>
          <p class="section__description">
            Lorem ipsum dolor sit amet, <i><b>communication</b></i> adipisicing elit, <i><b>helpful</b></i> eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud <i><b>sence of
              humour</b></i> ullamco laboris nisi ut <i><b>honest</b></i> ea commodo consequat. Duis aute irure dolor in
            upper-intermediate english level velit dolore eu ivivdtevoluptatem ontend developer.
          </p>
        </div>
      </div>
      <div class="row">
        <div class="md:w-8/12 section__resume resume-list">
          <h3 class="resume-list_title">
            education
          </h3>
          <div class="resume-list__block">
            <p class="resume-list__block-title">
              University of Minnesota Twin Cities
            </p>
            <p class="resume-list__block-date">
              2006 - 2010
            </p>
            <p>
              Bachelor Computer Engineering Lorem
            </p>
          </div>
          <div class="resume-list__block">
            <p class="resume-list__block-title">
              School of Informational technologies
            </p>
            <p class="resume-list__block-date">
              2004 - 2005
            </p>
            <p>
              Awesome student, lorem ipsum dolor sit amet, conse ctetur adipisicing elit, sed do eius-
              mod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
            </p>
          </div>
          <div class="resume-list__block">
            <p class="resume-list__block-title">
              Lorem Ipsum School
            </p>
            <p class="resume-list__block-date">
              2003 - 2006
            </p>
            <p>
              Student, Lorem ipsum dolor sit amet, consecte tur adipisicing elit, sed do eiusmod tempor
              incididunt ut
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
              Apple
            </p>
            <p class="resume-list__block-date">
              2006 - 2010
            </p>
            <p>
              Senior Full Stack Developer
            </p>
          </div>
          <div class="resume-list__block">
            <p class="resume-list__block-title">
              Tech university
            </p>
            <p class="resume-list__block-date">
              2004 - 2005
            </p>
            <p>
              Awesome developer, lorem ipsum dolor sit amet, conse ctetur adipisicing elit, sed do eius-
              mod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
            </p>
          </div>
          <div class="resume-list__block">
            <p class="resume-list__block-title">
              Molly’s studio
            </p>
            <p class="resume-list__block-date">
              2003 - 2006
            </p>
            <p>
              Programmer Lorem ipsum dolor sit amet, consecte tur adipisicing elit, sed do eiusmod tempor
              incididunt ut
            </p>
          </div>
        </div>
      </div>
      <div ref="progressList" class="row section__resume progress-list js-progress-list">
        <div class="md:w-full">
          <h3 class="progress-list__title">
            general skills
          </h3>
        </div>
        <div class="md:w-5/12 mr-auto">
          <div class="progress-list__skill">
            <p>
              <span class="progress-list__skill-title">html5</span>
              <span class="progress-list__skill-value">80%</span>
            </p>
            <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" />
            </div>
          </div>
          <div class="progress-list__skill">
            <p>
              <span class="progress-list__skill-title">css3</span>
              <span class="progress-list__skill-value">70%</span>
            </p>
            <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" />
            </div>
          </div>
          <div class="progress-list__skill">
            <p>
              <span class="progress-list__skill-title">java script</span>
              <span class="progress-list__skill-value">90%</span>
            </p>
            <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100" />
            </div>
          </div>
          <div class="progress-list__skill">
            <p>
              <span class="progress-list__skill-title">jquery</span>
              <span class="progress-list__skill-value">80%</span>
            </p>
            <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" />
            </div>
          </div>
        </div>
        <div class="md:w-5/12 mr-auto">
          <div class="progress-list__skill">
            <p>
              <span class="progress-list__skill-title">bootstrap 3</span>
              <span class="progress-list__skill-value">80%</span>
            </p>
            <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" />
            </div>
          </div>
          <div class="progress-list__skill">
            <p>
              <span class="progress-list__skill-title">grunt</span>
              <span class="progress-list__skill-value">60%</span>
            </p>
            <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" />
            </div>
          </div>
          <div class="progress-list__skill">
            <p>
              <span class="progress-list__skill-title">git</span>
              <span class="progress-list__skill-value">90%</span>
            </p>
            <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100" />
            </div>
          </div>
          <div class="progress-list__skill">
            <p>
              <span class="progress-list__skill-title">adobe photoshop</span>
              <span class="progress-list__skill-value">80%</span>
            </p>
            <div class="progress">
              <div class="progress-bar" role="progressbar" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100" />
            </div>
          </div>
        </div>
      </div>
    </section>
    <!--Resume-->

    <!--Portfolio-->
    <section id="portfolio" class="container section">
      <div class="row">
        <div class="md:w-full">
          <h2 id="portfolio_header" class="section__title">
            My projects_
          </h2>
        </div>
      </div>
      <div class="row portfolio-menu">
        <div class="md:w-full">
          <nav>
            <ul>
              <li><a href="" data-portfolio-target-tag="all">all</a></li>
              <li><a href="" data-portfolio-target-tag="mobile apps">mobile apps</a></li>
              <li><a href="" data-portfolio-target-tag="web-sites">web-sites</a></li>
              <li><a href="" data-portfolio-target-tag="landing-pages">landing pages</a></li>
            </ul>
          </nav>
        </div>
      </div>
      <div class="portfolio-cards">
        <div class="row project-card" data-toggle="modal" data-target="#portfolioModal" data-portfolio-tag="web-sites">
          <div class="md:w-6/12 lg:w-5/12 project-card__img">
            <img class="" src="assets/img/img_project_1_mono.png" alt="project-img">
          </div>
          <div class="md:w-6/12 lg:w-7/12 project-card__info">
            <h3 class="project-card__title">
              Mobile and desktop app for London hostel store
            </h3>
            <p class="project-card__description">
              Do answered bachelor occasion in of offended no concerns. Supply worthy warmth branch of no ye.
              Voice tried known to as my to. Though wished merits or be. Alone visit use these smart rooms ham.
            </p>
            <p class="project-card__stack">
              Used stack:
            </p>
            <ul class="tags">
              <li>html5</li>
              <li>css3</li>
              <li>JavaScript</li>
              <li>bower</li>
              <li>grunt</li>
            </ul>
            <a href="" class="project-card__link">www.superapp.com</a>
          </div>
        </div>
        <div
          class="row project-card"
          data-toggle="modal"
          data-target="#portfolioModal"
          data-portfolio-tag="mobile apps"
        >
          <div class="md:w-6/12 lg:w-5/12 project-card__img">
            <img class="" src="assets/img/img_project_2_mono.png" alt="project-img">
          </div>
          <div class="md:w-6/12 lg:w-7/12 project-card__info">
            <h3 class="project-card__title">
              Web app page for trevel company
            </h3>
            <p class="project-card__description">
              Preference any astonished unreserved mrs. Prosperous understood middletons in conviction an
              uncommonly do. Supposing so be resolving breakfast am or perfectly. Is drew am hill from mr.
            </p>
            <p class="project-card__stack">
              Used stack:
            </p>
            <ul class="tags">
              <li>html5</li>
              <li>css3</li>
              <li>JavaScript</li>
              <li>BEM</li>
              <li>bower</li>
              <li>grunt</li>
            </ul>
            <a href="" class="project-card__link">www.travellend.com</a>
          </div>
        </div>
        <div
          class="row project-card"
          data-toggle="modal"
          data-target="#portfolioModal"
          data-portfolio-tag="landing-pages"
        >
          <div class="md:w-6/12 lg:w-5/12 project-card__img">
            <img class="" src="assets/img/img_project_3_mono.png" alt="project-img">
          </div>
          <div class="md:w-6/12 lg:w-7/12 project-card__info">
            <h3 class="project-card__title">
              Admin template for Photo Service
            </h3>
            <p class="project-card__description">
              Do answered bachelor occasion in of offended no concerns. Supply worthy warmth branch of no ye.
              Voice tried known to as my to. Though wished merits or be. Alone visit use these smart rooms ham.
            </p>
            <p class="project-card__stack">
              Used stack:
            </p>
            <ul class="tags">
              <li>html5</li>
              <li>css3</li>
              <li>JavaScript</li>
              <li>BEM</li>
              <li>bower</li>
              <li>grunt</li>
            </ul>
            <a href="" class="project-card__link">www.coolphoto.com</a>
          </div>
        </div>
      </div>
    </section>
    <!--Portfolio-->

    <!--Testimonials-->
    <div v-if="testimonialsLoaded" id="testimonials" class="section">
      <div class="background relative slider-carousel" :style="{backgroundImage: `url(${reviewBG})`}">
        <div class="container">
          <div v-swiper="testimonialOptions">
            <div class="swiper-wrapper">
              <div v-for="testimonial in testimonials" :key="testimonial._id" class="swiper-slide">
                <div>
                  <div class="md:w-10/12 sm:w-10/12 w-10/12 mr-auto ml-auto">
                    <p class="slider-carousel__title">
                      {{ testimonial.name }}
                    </p>
                    <p class="slider-carousel__caption">
                      Project: {{ testimonial.project }}
                    </p>
                    <hr>
                    <p class="slider-carousel__description">
                      {{ testimonial.reviews }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div slot="button-prev" class="swiper-button-prev" />
            <div slot="button-next" class="swiper-button-next" />
          </div>
        </div>
      </div>
    </div>
    <!--Testimonials-->

    <!--Blog-->
    <section id="blog" class="container section">
      <div class="row">
        <div class="md:w-full">
          <h2 id="blog_header" class="section__title">
            Latest Posts_
          </h2>
        </div>
      </div>

      <div class="row post-cards">
        <div v-for="blog in blogs" :key="blog._id" class="post-cards__col">
          <a href="#">
            <div class="post-cards__card">
              <div class="post-cards__img">
                <img :src="blog.thumbnail.url" alt="blog_img">
              </div>
              <div class="post-cards__info">
                <p class="post-cards__date">{{ parseCreatedAt(blog.createdAt) }}</p>
                <h3 class="post-cards__title">{{ blog.title }}</h3>
                <p class="post-cards__description">{{ blog.content.substring(0, 60) + '...' }}</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
    <!--Blog-->

    <!--Contact-->
    <div class="background" :style="{backgroundImage: `url(${reviewBG})`}">
      <div id="contact" class="container section">
        <div class="row">
          <div class="md:w-full">
            <p id="contacts_header" class="section__title">
              Get in touch_
            </p>
          </div>
        </div>
        <div class="row contacts">
          <div class="md:w-5/12 lg:w-4/12">
            <div class="contacts__list">
              <dl class="contact-list">
                <dt>Phone:</dt>
                <dd><a href="tel:82344563333">8 (234) 456-33-33</a></dd>
                <dt>Skype:</dt>
                <dd><a href="skype:iamivanovivan">iamivanovivan</a></dd>
                <dt>Email:</dt>
                <dd><a href="mailto:mail@mail.com">mail@mail.com</a></dd>
              </dl>
            </div>
            <div class="contacts__social">
              <ul>
                <li><a href="">Facebook</a></li>
                <li><a href="">Linkedin</a></li>
                <li><a href="">GitHub</a></li>
                <li><a href="">Bitbucket</a></li>
              </ul>
            </div>
          </div>
          <div class="md:w-7/12 lg:w-5/12">
            <div class="contacts__form">
              <p class="contacts__form-title">
                Or just write me a letter here_
              </p>
              <form class="js-form">
                <div class="form-group">
                  <input class="form-field js-field-name" type="text" placeholder="Your name" required>
                  <span class="form-validation" />
                  <span class="form-invalid-icon"><i class="fa fa-close" /><i
                    class="mdi mdi-close"
                    aria-hidden="true"
                  /></span>
                </div>
                <div class="form-group">
                  <input class="form-field js-field-email" type="email" placeholder="Your e-mail" required>
                  <span class="form-validation" />
                  <span class="form-invalid-icon"><i class="fa fa-close" aria-hidden="true" /></span>
                </div>
                <div class="form-group">
                  <textarea class="form-field js-field-message" placeholder="Type the message here" required />
                  <span class="form-validation" />
                  <span class="form-invalid-icon"><i class="fa fa-close" aria-hidden="true" /></span>
                </div>
                <button class="site-btn site-btn--form" type="submit" value="Send">
                  Send
                </button>
              </form>
            </div>
            <div class="footer">
              <p>© 2016 Ivan Susanin. All Rights Reserved</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--Contact-->

    <!-- Portfolio Modal -->
    <div id="portfolioModal" class="modal fade portfolio-modal" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body md:w-11/12 lg:w-9/12 ml-auto mr-auto">
            <p class="portfolio-modal__title">
              Mobile and desktop app for London hostel store
            </p>
            <img class="portfolio-modal__img" src="assets/img/img_project_1_mono.png" alt="modal_img">
            <p class="portfolio-modal__description">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt utlabore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamcolaboris nisi ut aliquip ex
              ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum. Sed ut perspiciatis undeomnis iste natus error sit voluptatem accusantium doloremque
              laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae
              vitae
              dicta sunt explicabo.Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
              conse.
            </p>
            <div class="portfolio-modal__link">
              <a href="">www.superapp.com</a>
            </div>
            <div class="portfolio-modal__stack">
              <p class="portfolio-modal__stack-title">
                Using stack:
              </p>
              <ul class="tags">
                <li>html5</li>
                <li>css3</li>
                <li>JavaScript</li>
                <li>bower</li>
                <li>grunt</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Portfolio Modal -->
  </div>
</template>

<script>
import { directive } from 'vue-awesome-swiper'
import reviewBG from '~/assets/img/reviews-bg.jpg'

export default {
  directives: {
    swiper: directive
  },
  data () {
    return {
      reviewBG,
      upworkProfile: 'https://upwork.com/fl/hoatrinhhai',
      progressUpdated: false,
      // testimonials
      testimonialsLoaded: false,
      testimonials: [],
      testimonialOptions: {
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }
      },
      // blogs
      blogsLoaded: false,
      blogs: []
    }
  },
  beforeMount () {
    window.addEventListener('scroll', this.showProgressOnScroll)
    window.addEventListener('scroll', this.showSectionTitleOnScroll)

    // testimonials
    this.$strapi
      .find('testimonials')
      .then((res) => {
        this.testimonials = res
        this.testimonialsLoaded = true
      })
    // blogs
    this.$strapi
      .find('blogs', { _limit: 3 })
      .then((res) => {
        this.blogs = res
        this.blogsLoaded = true
      })
  },
  mounted () {
    this.showProgressOnScroll()
    this.showSectionTitleOnScroll()
  },
  methods: {
    isInViewport (element) {
      const distance = element.getBoundingClientRect()
      return (
        distance.top >= 0 && distance.left >= 0 && distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) && distance.right <= (window.innerWidth || document.documentElement.clientWidth)
      )
    },
    // section title
    clearSectionTitle () {
      document.querySelectorAll('.section__title').forEach((title) => {
        title.style.color = 'transparent'
      })
    },
    typeWriter (textElement, text, currentAt) {
      if (currentAt < text.length) {
        textElement.innerHTML += text.charAt(currentAt)
        currentAt++
        setTimeout(() => {
          this.typeWriter(textElement, text, currentAt)
        }, 50)
      } else {
        textElement.classList.add('typed')
      }
    },
    showSectionTitleOnScroll () {
      document.querySelectorAll('.section__title:not(.typed)').forEach((title) => {
        if (this.isInViewport(title) && !title.classList.contains('typed')) {
          const text = title.innerHTML
          title.innerHTML = ''
          title.style.color = null
          this.typeWriter(title, text, 0)
        }
      })
    },
    // progress list
    showProgressOnScroll () {
      const progressList = document.querySelector('.progress-list')
      if (this.isInViewport(progressList)) {
        progressList.querySelectorAll('.progress-bar').forEach((bar) => {
          this.showProgressBar(bar)
        })
        this.progressUpdated = true
        window.removeEventListener('scroll', this.showProgressOnScroll)
      }
    },
    showProgressBar (bar) {
      const min = parseInt(bar.getAttribute('aria-valuemin'))
      let now = parseInt(bar.getAttribute('aria-valuenow'))
      const max = parseInt(bar.getAttribute('aria-valuemax'))
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
    },
    // date
    parseCreatedAt (createdAt) {
      const date = new Date(createdAt)
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      return `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}`
    }
  }
}
</script>

<style scoped lang="postcss">
.section {
  &__description {
    strong {
      @apply text-black;
    }
  }
}

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

/* projects */
.project-card {
  @apply ml-0 mb-10 mr-0;
  transition: box-shadow .3s;

  &:hover {
    box-shadow: 0 1px 31px rgb(0 0 0 / 9%);
    cursor: pointer;
  }

  &__img {
    @apply px-0;

    img {
      @apply w-full h-full object-cover;
    }
  }

  &__info {
    border: 1px solid #f1f1f1;
    padding: 50px 50px 40px 30px;
  }

  &__title {
    @apply text-lg leading-7 font-heading uppercase mb-4 font-bold;
  }

  &__description {
    @apply text-base leading-5 mb-11;
  }

  &__stack {
    @apply font-heading text-xs leading-3 font-bold uppercase mb-4;
  }

  &__link {
    @apply mt-14 font-heading text-sm leading-4 float-right;
  }
}

.tags {
  li {
    @apply inline-block text-sm leading-4 bg-white shadow-sm py-1.5 px-2.5 mr-2.5;
  }
}

/* testimonials */
.slider-carousel {
  .swiper-container {
    position: relative;
  }

  .slider-carousel__title {
    @apply uppercase font-heading mt-20 mb-2.5;
  }

  .slider-carousel__caption {
    @apply text-base leading-5 italic opacity-70 mb-5;
  }

  hr {
    @apply mb-5;
    border-top: 1px solid #fff;
  }

  .slider-carousel__description {
    @apply mb-16;
  }

  .swiper-button-prev, .swiper-button-next {
    --swiper-theme-color: #ffffff;
    --swiper-navigation-size: 20px;
  }
}

/* blogs */
.post-cards {
  @apply mb-10;

  a:hover {
    text-decoration: none;
  }

  &__col {
    @apply md:w-4/12 md:flex relative w-full px-4;
    min-width: 1px;
  }

  &__card {
    @apply transition-all delay-300;

    &:hover {
      box-shadow: 0 1px 31px rgb(0 0 0 / 9%);
    }
  }

  &__img {
    @apply relative border;
    border-bottom: none;
    border-color: #f1f1f1;
    padding-top: 100%;

    img {
      @apply absolute w-full h-full object-cover top-0;
    }
  }

  &__info {
    @apply pt-5 pr-10 pb-10 pl-5;
    border: 1px solid #f1f1f1;
  }

  &__date {
    @apply text-xs leading-5 uppercase mb-5;
    color: #999;
  }

  &__title {
    @apply font-heading text-sm leading-6 uppercase mb-6 font-bold;
    color: #555;
  }

  &__description {
    @apply text-sm leading-6 mb-0;
    color: #999;
  }
}

/* contacts */
.contacts {
  @apply mt-10;

  &__list {
    @apply mb-12;
  }

  .contact-list {
    @apply text-base leading-7 font-heading;

    dt {
      @apply float-left font-bold uppercase;
    }

    dd {
      @apply pl-24 mb-4;

      a {
        color: #fff;
      }
    }
  }

  &__social {
    @apply text-base leading-6;

    li {
      @apply mb-5;
    }

    a {
      @apply underline py-1.5 px-0 transition-all delay-300;
      color: #fff;
    }
  }

  &__form {
    &-title {
      @apply text-base leading-6 font-heading mb-5;
    }

    .form-group {
      @apply mb-4 relative;

      .form-validation {
        @apply absolute inset-0 rounded-sm border-2 border-green-800 pointer-events-none  opacity-0 transition-all delay-300;
      }

      span {
        color: #fff;
        @apply absolute top-2.5 text-right opacity-0 z-0 right-5;
      }
    }

    input {
      @apply w-full bg-transparent border rounded-sm border-white p-2.5 text-base leading-6 font-heading;
      color: #fff;

      :invalid {
        outline: none;
      }
    }
  }
}

/* buttons */
.site-btn {
  @apply bg-green-500 h-14 rounded-lg text-sm leading-5 uppercase p-4 text-center inline-block font-semibold overflow-hidden;
  color: #fff;
  min-width: 170px;

  &.site-btn--form {
    @apply w-full border-none shadow-md relative;
  }
}
</style>
