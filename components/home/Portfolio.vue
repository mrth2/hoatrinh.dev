<template>
  <div>
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
              <li><a @click="filterProjects('all')">all</a></li>
              <li v-for="category in categories" :key="category.id">
                <a @click="filterProjects(category.id)">{{ category.name }}</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div v-if="loaded" class="portfolio-cards">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="row project-card"
          data-toggle="modal"
          data-target="#portfolioModal"
          data-portfolio-tag="web-sites"
          @click="viewProject(project)"
        >
          <div class="w-full md:w-6/12 lg:w-5/12 project-card__img">
            <div v-if="project.images.length" v-swiper="swiperOptions" class="h-full">
              <div class="swiper-wrapper">
                <div
                  v-for="(image,key) in project.images"
                  :key="`${project.id}-image-${key}`"
                  class="swiper-slide"
                >
                  <img :src="image.url" alt="project-img">
                </div>
              </div>
            </div>
          </div>
          <div class="md:w-6/12 lg:w-7/12 project-card__info">
            <h3 class="project-card__title">
              {{ project.name }}
            </h3>
            <p class="project-card__description">
              {{ project.description }}
            </p>
            <p class="project-card__stack">
              Used stack:
            </p>
            <BaseTag :list="getProjectTags(project)" id-key="id" content-key="name" />
            <a :href="project.link" target="_blank" class="project-card__link">{{ getProjectLink(project.link) }}</a>
          </div>
        </div>
      </div>
    </section>
    <!-- Portfolio Modal -->
    <BaseModal
      v-if="viewingProject.id"
      :close-text="null"
      :action-text="null"
      @close="viewingProject = null"
    >
      <template #body>
        <p class="portfolio-modal__title">
          {{ viewingProject.name }}
        </p>
        <div v-if="viewingProject.images.length" v-swiper="swiperOptions" class="h-full mb-8">
          <div class="swiper-wrapper">
            <div
              v-for="(image,key) in viewingProject.images"
              :key="`${viewingProject.id}-image-${key}`"
              class="swiper-slide"
            >
              <img :src="image.url" alt="project-img">
            </div>
          </div>
        </div>
        <p class="portfolio-modal__description">
          {{ viewingProject.description }}
        </p>
        <div class="portfolio-modal__link">
          <a :href="viewingProject.link" target="_blank">{{ getProjectLink(viewingProject.link) }}</a>
        </div>
        <div class="portfolio-modal__stack">
          <p class="portfolio-modal__stack-title">
            Using stack:
          </p>
          <BaseTag :list="getProjectTags(viewingProject)" id-key="id" content-key="name" />
        </div>
      </template>
    </BaseModal>
    <!-- Portfolio Modal -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { directive as swiper } from 'vue-awesome-swiper'
import { Project, ProjectCategory } from '@nuxt/types'

export default Vue.extend({
  directives: {
    swiper
  },
  data () {
    return {
      loaded: false,
      projects: [] as Project[],
      filteredProjects: [] as Project[],
      categories: [] as ProjectCategory[],
      viewingProject: {} as Project
    }
  },
  async fetch () {
    this.projects = await this.$strapi.find<Project[]>('projects')
    let categories = [] as ProjectCategory[]
    this.projects.forEach((project) => {
      categories = [...project.project_categories]
    })
    this.filteredProjects = this.projects
    this.categories = categories.filter((value, index, self) => {
      return self.indexOf(value) === index
    }).sort((a, b) => {
      return a.name < b.name ? 1 : -1
    })
    this.loaded = true
  },
  computed: {
    ...mapState('config', ['swiperOptions'])
  },
  methods: {
    getProjectLink (link: string): string {
      return new URL(link).hostname
    },
    filterProjects (categoryId: string): void {
      if (categoryId === 'all') {
        this.filteredProjects = this.projects
      } else {
        this.filteredProjects = this.projects.filter((project) => {
          return project.project_categories.find(category => category.id === categoryId)
        })
      }
    },
    viewProject (project: Project): void {
      this.viewingProject = project
    },
    getProjectTags (project: Project): Array<Object> {
      return [...project.platforms, ...project.frameworks, ...project.programing_languages, ...project.databases]
    }
  }
})
</script>

<style scoped lang="postcss">
/* projects */
.project-card {
  @apply ml-0 mb-10 mr-0 border;
  border-color: #f1f1f1;
  transition: box-shadow .3s;

  &:hover {
    box-shadow: 0 1px 31px rgb(0 0 0 / 9%);
    cursor: pointer;
  }

  &__img {
    @apply px-0;

    img {
      @apply w-full h-full object-contain bg-gray-200;
    }
  }

  &__info {
    @apply md:border-0 md:border-l border-t;
    border-color: #f1f1f1;
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

.portfolio-modal {
  &__title {
    @apply font-heading mb-8;
  }

  &__description {
    @apply text-base leading-6 mb-0;
  }

  &__link {
    @apply font-heading text-sm leading-5 mt-10;
  }

  &__stack {
    @apply flex mt-10;

    &-title {
      @apply font-heading text-xs font-bold leading-4 uppercase mr-4 pt-2;
    }
  }
}
</style>
