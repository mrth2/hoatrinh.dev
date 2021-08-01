<template>
  <div>
    <!--Main menu-->
    <div class="menu" :class="{'menu--active': topBarActive}">
      <div class="container">
        <div class="row">
          <div class="menu__wrapper hidden lg:block">
            <nav class="">
              <HeaderMenuLink />
            </nav>
          </div>
          <div class="menu__wrapper lg:hidden">
            <button type="button" class="menu__mobile-button" @click="toggleMobileMenu">
              <span><i class="fa fa-bars" /></span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!--Main menu-->

    <!-- Mobile menu -->
    <div class="mobile-menu lg:hidden" :class="{active:mobileMenuActive, 'mobile-menu--active': topBarActive}">
      <div class="container">
        <div class="mobile-menu__close" @click="toggleMobileMenu">
          <span><i class="fa fa-times-circle-o" /></span>
        </div>
        <nav class="mobile-menu__wrapper">
          <HeaderMenuLink />
        </nav>
      </div>
    </div>
    <!-- Mobile menu -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data () {
    return {
      topBarActive: false,
      mobileMenuActive: false
    }
  },
  beforeMount () {
    window.addEventListener('scroll', this.toggleTopBar)
    this.toggleTopBar()
  },
  destroyed () {
    window.removeEventListener('scroll', this.toggleTopBar)
  },
  methods: {
    toggleTopBar (): void {
      this.topBarActive = window.pageYOffset > 70
    },
    toggleMobileMenu (): void {
      this.mobileMenuActive = !this.mobileMenuActive
    }
  }
})
</script>

<style lang="postcss">
nav {
  @apply mb-9;

  ul li a {
    :after {
      content: "";
      height: 2px;
      @apply absolute w-0.5 opacity-0 transition-all duration-300 bg-green-50;
    }
  }
}

.menu {
  @apply fixed p-0 h-16 w-full top-0 transition-all duration-500 z-50;

  &--active {
    @apply bg-white shadow-md;
  }

  &--active &__mobile-button {
    @apply text-gray-900 opacity-90 -mt-1;
  }

  &--active &__wrapper {
    @apply mt-5;
    a {
      color: #555 !important;
      @apply opacity-100;
    }
  }

  &__wrapper {
    @apply z-10 mt-12 transition-all duration-300 md:w-full flex-1;

    nav {
      @apply font-heading leading-6 text-sm uppercase font-bold;

      ul li {
        @apply inline-block;

        a {
          @apply text-white opacity-100 pr-14;

          :hover {
            @apply no-underline transition-all duration-150 opacity-50;
          }
        }
      }
    }
  }

  &__mobile-button {
    @apply text-white opacity-50 transition-all duration-300 bg-transparent border-none;

    &:hover {
      @apply opacity-100;
    }
  }
}

.mobile-menu {
  @apply fixed top-6 left-0 w-0 h-0 bg-gray-900 bg-opacity-90 overflow-hidden text-center transition-all duration-75;
  z-index: 9999;

  &.active {
    @apply h-full w-full top-0 opacity-100;
  }

  &__close {
    @apply text-white transition-all duration-300 absolute top-12 -ml-5 bg-transparent border-none;
  }

  &--active &__close {
    @apply top-5;
  }

  &__wrapper {
    @apply h-full overflow-auto text-sm leading-6 font-heading font-bold uppercase mt-16;

    ul {
      @apply py-9 m-0 flex flex-col justify-center min-h-full;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -ms-flex-direction: column;
      -webkit-box-pack: center;
      -ms-flex-pack: center;

      li {
        @apply p-1;

        a {
          @apply text-white inline-block p-3 relative;

          :after {
            @apply bg-white bottom-4;
            right: 1px;
          }
        }
      }
    }
  }
}
</style>
