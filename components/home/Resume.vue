<template>
  <section id="resume" class="container section">
    <div class="row">
      <div class="md:w-10/12">
        <h2 id="resume" class="section__title">Resume_</h2>
        <ContentRendererMarkdown
          class="section__description"
          :value="resumeSummary"
        />
      </div>
    </div>
    <div class="row">
      <div class="md:w-8/12 section__resume resume-list">
        <h3 class="resume-list_title">education</h3>
        <div
          v-for="item in educationList"
          :key="item.title"
          class="resume-list__block"
        >
          <p class="resume-list__block-title">
            {{ item.title }}
          </p>
          <p class="resume-list__block-date">{{ item.date }}</p>
          <p class="text-base">{{ item.description }}</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="md:w-9/12 section__resume resume-list">
        <h3 class="resume-list_title">Employment</h3>
        <div
          v-for="item in employmentList"
          :key="item.title"
          class="resume-list__block"
        >
          <p class="resume-list__block-title">{{ item.title }}</p>
          <p class="resume-list__block-date">{{ item.date }}</p>
          <p>
            <strong>{{ item.role }}</strong>
          </p>
          <ul class="text-base">
            <li v-for="task in item.tasks" :key="task">- {{ task }}</li>
          </ul>
        </div>
      </div>
    </div>
    <div
      ref="progressList"
      class="row section__resume progress-list js-progress-list"
    >
      <div class="md:w-full">
        <h3 class="progress-list__title">programming skills</h3>
      </div>
      <div class="w-full lg:w-9/12 grid md:grid-cols-2 gap-x-10">
        <div
          v-for="item in skillList"
          :key="item.label"
          class="progress-list__skill"
        >
          <p>
            <span class="progress-list__skill-title">{{ item.label }}</span>
            <span class="progress-list__skill-value">{{ item.progress }}%</span>
          </p>
          <div class="progress">
            <div
              class="progress-bar"
              role="progressbar"
              :aria-valuenow="item.progress"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="item.label"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const resumeSummary = await queryContent("/about/resume-summary").findOne();

type TEducation = {
  title: string;
  date: string;
  description: string;
};
const educationList: TEducation[] = [
  {
    title: "University of Engineering and Technology",
    date: "2008 - 2012",
    description: "Bachelor of Computer Science",
  },
  {
    title: "Informatica Class - Tran Phu Gifted High School",
    date: "2005 - 2008",
    description: "Distinction Grade",
  },
];

type TEmployment = {
  title: string;
  date: string;
  role: string;
  tasks: string[];
};
const employmentList: TEmployment[] = [
  {
    title: "Upwork Freelancer",
    date: "2020 - now",
    role: "Senior Full Stack Developer",
    tasks: [
      "Specialized with MEVN Stack, plus Laravel.",
      "SaaS Platform Development.",
      "Wordpress & Shopfiy Site Speed Optimization.",
    ],
  },
  {
    title: "InferenceCloud",
    date: "2023 - 2025",
    role: "Senior Frontend Engineer",
    tasks: [
      "Focus on TypeScript, Vue.js, Nuxt.js, Tailwind CSS, and D3.js.",
      "Developed a comprehensive AI generative product ecosystem for a SaaS platform.",
      "Implemented end-to-end testing and a CI/CD pipeline.",
    ],
  },
  {
    title: "StoryRoom",
    date: "2021 - 2023",
    role: "Senior Frontend Developer",
    tasks: [
      "Focus on Vue.js, Nuxt.js, Tailwind CSS, and D3.js.",
      "Produce visualizations and data-driven charts for the product.",
      "Develop and maintain the admin dashboard and user interface.",
    ],
  },
  {
    title: "DesignBold",
    date: "2020 - 2021",
    role: "Development Team Leader",
    tasks: [
      "Maintain application performance and the release roadmap.",
      "Ensure thorough product testing.",
      "Analyze customer behavior and engagement metrics.",
    ],
  },
  {
    title: "DesignBold",
    date: "2016 - 2019",
    role: "Full Stack Developer",
    tasks: [
      "Develop a user-friendly drag-and-drop platform that allows non-technical users to create online graphics easily.",
      "Optimize backend services, RESTful APIs, and system management to efficiently accommodate 500,000 monthly users.",
    ],
  },
  {
    title: "NETLINK",
    date: "2012 - 2016",
    role: "Backend Developer",
    tasks: [
      "Develop an SEO-optimized online magazine and newspaper.",
      "Build a crawler for processing large text and video.",
    ],
  },
];

const progressUpdated = ref(false);
const { $isInViewport } = useNuxtApp();

type TSkillProgress = {
  label: string;
  progress: number;
};
const skillList: TSkillProgress[] = [
  { label: "VueJS", progress: 95 },
  { label: "NuxtJS", progress: 90 },
  { label: "ReactJS", progress: 75 },
  { label: "NextJS", progress: 60 },
  { label: "TypeScript", progress: 90 },
  { label: "NodeJS", progress: 60 },
  { label: "Tailwind CSS", progress: 90 },
  { label: "Laravel", progress: 80 },
  { label: "Javascript", progress: 90 },
  { label: "PHP", progress: 85 },
  { label: "CSS3", progress: 80 },
  { label: "HTML5", progress: 90 },
];

const showProgressOnScroll = useDebounce(() => {
  const progressList = document.querySelector<HTMLElement>(".progress-list");
  if (!progressList) return;
  const progressListTitle = progressList.querySelector<HTMLElement>(
    ".progress-list__title"
  );
  if (progressListTitle && $isInViewport(progressListTitle)) {
    progressList
      .querySelectorAll<HTMLElement>(".progress-bar")
      .forEach((bar) => {
        showProgressBar(bar);
      });
    progressUpdated.value = true;
    window.removeEventListener("scroll", showProgressOnScroll);
  }
}, 100);

function showProgressBar(bar: HTMLElement) {
  const min = parseInt(String(bar.getAttribute("aria-valuemin")));
  let now = parseInt(String(bar.getAttribute("aria-valuenow")));
  const max = parseInt(String(bar.getAttribute("aria-valuemax")));
  if (isNaN(min) || isNaN(max) || isNaN(now)) {
    return;
  }
  if (!progressUpdated.value) {
    now = min;
  }
  if (now >= min && now <= max) {
    bar.style.width = `${now}%`;
  }
  if (now < max) {
    now++;
    setTimeout(() => {
      showProgressBar(bar);
    }, 200);
  }
}

onBeforeMount(() => {
  window.addEventListener("scroll", showProgressOnScroll);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", showProgressOnScroll);
});
onMounted(() => {
  showProgressOnScroll();
});
</script>

<style scoped lang="postcss">
/* resume */
.resume-list {
  @apply my-7 flex-initial relative;

  &_title {
    @apply text-sm leading-6 uppercase font-heading font-semibold mb-8 tracking-wide text-neutral-600;
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
      @apply font-secondary text-sm leading-6 pb-2 text-neutral-600;
    }
  }
}

/* skills */
.progress-list {
  @apply mt-8;

  p {
    @apply w-full font-secondary mb-2;
  }

  &__title,
  p {
    @apply text-base leading-6 uppercase;
  }
  &__title {
    @apply text-lg;
  }

  &__title {
    @apply font-heading font-bold mb-12 tracking-wide text-neutral-600;
  }

  &__skill {
    &-value {
      @apply ml-2;
    }
  }

  .progress {
    @apply h-2 mb-10 flex overflow-hidden text-xs leading-4 text-center bg-gray-100 rounded;

    &-bar {
      @apply bg-green-500 leading-4 text-white rounded-r;
      transition: width 0.6s ease;
    }
  }
}
</style>
