<template>
  <div>
    <section id="portfolio" class="container section">
      <div class="row">
        <div class="md:w-full">
          <h2 id="portfolio" class="section__title">My projects_</h2>
        </div>
      </div>
      <div class="row portfolio-menu">
        <div class="md:w-full">
          <nav>
            <ul>
              <li>
                <a
                  href="#"
                  aria-label="Show all projects"
                  @click="filterProjects('all')"
                >
                  all
                </a>
              </li>
              <li v-for="category in categories" :key="category.id">
                <a
                  href="#"
                  :aria-label="`Show ${category.name} projects`"
                  @click="filterProjects(category.name)"
                >
                  {{ category.name }}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div class="portfolio-cards">
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
            <Swiper
              v-if="project.images.length"
              :autoplay="swiperOptions.autoplay"
              :loop="true"
              class="h-full"
            >
              <SwiperSlide
                v-for="(image, key) in project.images"
                :key="`${project.id}-image-${key}`"
                class="swiper-slide"
              >
                <img :src="image.url" alt="project-img" />
              </SwiperSlide>
            </Swiper>
          </div>
          <div class="md:w-6/12 lg:w-7/12 project-card__info">
            <h3 class="project-card__title">
              {{ project.name }}
            </h3>
            <p class="project-card__description">
              {{ project.description }}
            </p>
            <p class="project-card__stack">Used stack:</p>
            <BaseTag
              :list="getProjectTags(project)"
              id-key="id"
              content-key="name"
            />
            <a
              :href="project.link"
              target="_blank"
              aria-label="view project"
              class="project-card__link"
            >
              {{ getProjectLink(project.link) }}
            </a>
          </div>
        </div>
      </div>
    </section>
    <!-- Portfolio Modal -->
    <BaseModal v-if="viewingProject" @close="viewingProject = undefined">
      <template #body>
        <p class="portfolio-modal__title">
          {{ viewingProject.name }}
        </p>
        <Swiper
          v-if="viewingProject.images.length"
          :options="swiperOptions"
          class="h-full mb-8"
        >
          <SwiperSlide
            v-for="(image, key) in viewingProject.images"
            :key="`${viewingProject.id}-image-${key}`"
          >
            <img :src="image.url" alt="project-img" />
          </SwiperSlide>
        </Swiper>
        <p class="portfolio-modal__description">
          {{ viewingProject.description }}
        </p>
        <div class="portfolio-modal__link">
          <a
            :href="viewingProject.link"
            target="_blank"
            aria-label="view project"
          >
            {{ getProjectLink(viewingProject.link) }}
          </a>
        </div>
        <div class="portfolio-modal__stack">
          <p class="portfolio-modal__stack-title">Using stack:</p>
          <BaseTag
            :list="getProjectTags(viewingProject)"
            id-key="id"
            content-key="name"
          />
        </div>
      </template>
    </BaseModal>
    <!-- Portfolio Modal -->
  </div>
</template>

<script setup lang="ts">
import type { Project, ProjectCategory } from "@nuxt/types";
// import BaseModal from "@/components/base/Modal.vue";
import { useConfigStore } from "~~/store/config";
import { Swiper, SwiperSlide } from "swiper/vue";

async function fetchProjects() {
  return await queryContent<Project>("/projects").find();
}
const projects = await fetchProjects();

const categories = computed<ProjectCategory[]>(() => {
  let _categories: ProjectCategory[] = [];
  for (const project of projects) {
    for (const category of project.project_categories) {
      if (!_categories.some((c) => c.name === category.name)) {
        _categories.push(category);
      }
    }
  }
  return _categories
    .filter((value, index, self) => {
      return self.indexOf(value) === index;
    })
    .sort((a, b) => {
      return a.name < b.name ? 1 : -1;
    });
});

const swiperOptions = computed(() => useConfigStore().swiperOptions);

function getProjectLink(link: string): string {
  return new URL(link).hostname;
}
const categoryId = ref("all");
function filterProjects(_category: string): void {
  categoryId.value = _category;
}
const filteredProjects = computed(() => {
  if (categoryId.value === "all") {
    return projects;
  } else {
    return projects.filter((project) =>
      project.project_categories.find(
        (category: any) => category.name === categoryId.value
      )
    );
  }
});
const viewingProject = ref<Project>();
function viewProject(project: Project): void {
  viewingProject.value = project;
}
function getProjectTags(project: Project): Array<Object> {
  return [
    ...project.platforms,
    ...project.frameworks,
    ...project.programing_languages,
    ...project.databases,
  ];
}
onBeforeUnmount(() => {
  viewingProject.value = undefined;
});
</script>

<style scoped lang="postcss">
/* projects */
.project-card {
  @apply ml-0 mb-10 mr-0 border;
  border-color: #f1f1f1;
  transition: box-shadow 0.3s;

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
