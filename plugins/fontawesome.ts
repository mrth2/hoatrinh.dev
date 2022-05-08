import { library, config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faWordpress, faGithub, faFacebookSquare, faSkype, faLaravel, faVuejs } from '@fortawesome/free-brands-svg-icons';
import { faBars, faClose, faSpinner, faExclamationCircle, faCheckCircle, faQuoteRight } from '@fortawesome/free-solid-svg-icons';

export default defineNuxtPlugin(nuxtApp => {
  config.autoAddCss = false;
  // brand icons
  library.add(faWordpress, faGithub, faFacebookSquare, faSkype, faLaravel, faVuejs);
  // solid icons
  library.add(faBars, faClose, faSpinner, faExclamationCircle, faCheckCircle, faQuoteRight);

  nuxtApp.vueApp.component('FaIcon', FontAwesomeIcon);
});