<template>
  <div
    class="background review-bg"
    :style="{
      backgroundImage: `url(~/assets/img/footer-bg.jpeg)`,
    }"
  >
    <div id="contact" class="container section">
      <div class="row">
        <div class="md:w-full">
          <p id="contacts_header" class="section__title text-white">
            Get in touch_
          </p>
        </div>
      </div>
      <div class="row contacts">
        <div class="md:w-5/12 lg:w-4/12">
          <div class="contacts__list">
            <dl class="contact-list">
              <dt>Skype:</dt>
              <dd>
                <a :href="getSkype">{{ skype }}</a>
              </dd>
              <dt>Email:</dt>
              <dd>
                <a :href="getEmail">{{ email }}</a>
              </dd>
            </dl>
          </div>
          <div class="contacts__social">
            <ul>
              <li>
                <a :href="getFacebook">Facebook</a>
              </li>
              <li>
                <a :href="getGithub">GitHub</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="md:w-7/12 lg:w-5/12">
          <div class="contacts__form">
            <p class="contacts__form-title">Or just write me a letter here_</p>
            <form
              ref="contactForm"
              class="js-form"
              @submit.prevent="sendContact"
            >
              <div class="form-group">
                <input
                  class="form-field js-field-name"
                  type="text"
                  placeholder="Your name"
                  required
                />
                <span class="form-validation" />
                <span class="form-invalid-icon">
                  <FaIcon icon="close" />
                </span>
              </div>
              <div class="form-group">
                <input
                  class="form-field js-field-email"
                  type="email"
                  placeholder="Your e-mail"
                  required
                />
                <span class="form-validation" />
                <span class="form-invalid-icon">
                  <FaIcon icon="close" />
                </span>
              </div>
              <div class="form-group">
                <textarea
                  class="form-field js-field-message"
                  placeholder="Type the message here"
                  required
                />
                <span class="form-validation" />
                <span class="form-invalid-icon">
                  <FaIcon icon="close" />
                </span>
              </div>
              <button
                class="site-btn"
                type="submit"
                value="Send"
                :disabled="sending"
              >
                Send
                <FaIcon v-show="sending" icon="spinner" pulse />
              </button>
              <p v-if="error" class="text-xs mt-2 underline text-center">
                <FaIcon icon="exclamation-circle" aria-hidden="true" />
                {{ error }}
              </p>
              <p v-if="success" class="text-xs mt-2 text-center">
                <FaIcon icon="check-circle" aria-hidden="true" />
                {{ success }}
              </p>
            </form>
          </div>
        </div>
      </div>
      <div class="footer mt-24 text-center">
        <p>© {{ new Date().getFullYear() }} From Hoa Trinh with ♥</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePersonalStore } from "~~/store/personal";

const sending = ref(false);
const error = ref<string | boolean>(false);
const success = ref<string | boolean>(false);

const personalStore = usePersonalStore();
const skype = computed(() => personalStore.skype);
const email = computed(() => personalStore.email);
const getSkype = computed(() => personalStore.getSkype);
const getFacebook = computed(() => personalStore.getFacebook);
const getEmail = computed(() => personalStore.getEmail);
const getGithub = computed(() => personalStore.getGithub);

const contactForm = ref<HTMLFormElement>();

const { $sleep } = useNuxtApp();
async function sendContact() {
  if (!contactForm.value) return;
  const formData = new FormData(contactForm.value);

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  error.value = false;
  sending.value = true;
  try {
    await $sleep(2000);
    await useStrapi3().create("contacts", { name, email, message });
    success.value =
      "Thank you for contacting me! I will reach out to you asap!";
    contactForm.value.reset();
  } catch (err) {
    error.value =
      "Can not submit your message. Please check your input and try again.";
  }
  sending.value = false;
}
</script>

<style scoped lang="postcss">
#contact {
  @apply text-white relative pb-4;
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

    input,
    textarea {
      color: theme("colors.white");

      &:invalid {
        outline: none;
      }

      &::placeholder {
        color: theme("colors.white");
      }
    }
    input {
      @apply w-full bg-transparent border rounded-sm border-white p-2.5 text-base leading-6 font-heading;
    }

    textarea {
      @apply w-full bg-transparent border border-white p-3 text-base leading-6 font-heading rounded-sm;
      height: 115px;
    }

    .site-btn {
      @apply w-full border-none relative uppercase text-sm leading-5 text-center p-4 inline-block font-semibold overflow-hidden bg-green-700;
      box-shadow: 0 1px 29px rgb(0 0 0 /16%);
      height: 50px;
      border-radius: 25px;
      min-width: 170px;

      &:hover {
        @apply bg-green-600;
      }
    }
  }
}
</style>
