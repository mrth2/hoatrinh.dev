<template>
  <section id="blog" class="container section">
    <div class="row">
      <div class="md:w-full">
        <h2 id="blog" class="section__title">Latest Posts_</h2>
      </div>
    </div>

    <div class="row post-cards">
      <div v-for="blog in blogs" :key="blog._id" class="post-cards__col">
        <a v-if="blog" href="#" :aria-label="`Read more about ${blog.title}`">
          <div class="post-cards__card">
            <div class="post-cards__img">
              <img :src="blog.thumbnail.url" alt="blog_img" />
            </div>
            <div class="post-cards__info">
              <p class="post-cards__date">
                {{ parseCreatedAt(blog.createdAt) }}
              </p>
              <h3 class="post-cards__title">{{ blog.title }}</h3>
              <p class="post-cards__description">
                {{ blog.content.substring(0, 60) + "..." }}
              </p>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BlogPost } from "@nuxt/types";

const blogs = await queryContent<BlogPost>("/blogs")
  .limit(3)
  .sort({
    createdAt: -1,
  })
  .find();

function parseCreatedAt(createdAt: number): string {
  const date = new Date(createdAt);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}`;
}
</script>

<style lang="postcss" scoped>
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
</style>
