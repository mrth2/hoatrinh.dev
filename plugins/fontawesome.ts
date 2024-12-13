import { defineNuxtPlugin } from '#app'
import { library, config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faWordpress, faGithub, faFacebookSquare, faSkype, faLaravel, faVuejs } from '@fortawesome/free-brands-svg-icons';
import { faBars, faClose, faSpinner, faExclamationCircle, faCheckCircle, faQuoteRight, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

config.autoAddCss = false;
// brand icons
library.add(faWordpress, faGithub, faFacebookSquare, faSkype, faLaravel, faVuejs);
// solid icons
library.add(faBars, faClose, faSpinner, faExclamationCircle, faCheckCircle, faQuoteRight, faTimesCircle);

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.component('FaIcon', FontAwesomeIcon);
});