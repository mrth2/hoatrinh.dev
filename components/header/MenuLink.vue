<template>
  <ul>
    <li>
      <NuxtLink :to="{path:'/', hash:'hello'}">
        Hello
      </NuxtLink>
    </li>
    <li>
      <NuxtLink :to="{path: '/', hash: '#resume'}">
        Resume
      </NuxtLink>
    </li>
    <li>
      <NuxtLink :to="{path: '/', hash: '#portfolio'}">
        Portfolio
      </NuxtLink>
    </li>
    <li>
      <NuxtLink :to="{path: '/', hash: '#testimonials'}">
        Testimonials
      </NuxtLink>
    </li>
    <li>
      <NuxtLink :to="{path: '/', hash: '#blog'}">
        Blog
      </NuxtLink>
    </li>
    <li>
      <NuxtLink :to="{path: '/', hash: '#contact'}">
        Contact
      </NuxtLink>
    </li>
  </ul>
</template>
