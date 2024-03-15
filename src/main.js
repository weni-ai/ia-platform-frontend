import Vue from 'vue';
import Buefy from 'buefy';
import VueMoment from 'vue-moment';
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';
import VueTour from 'vue-tour';
import App from './App';
import router from './router';
import store from './store';
import applyFilters from './utils/filters';
import API from './utils/plugins/API';
import i18n from './utils/plugins/i18n';
import '@mdi/font/css/materialdesignicons.css';
import VueHighlightJS from 'vue-highlightjs';
import LogRocket from 'logrocket';
import VShowSlide from 'v-show-slide';
import iframessa from 'iframessa';
import UnnnicDivider from './components/Divider';
import UnnnicIntelligenceHeader from './components/unnnic-intelligence/Header';
import UnnnicIntelligenceText from './components/unnnic-intelligence/Text';

iframessa.register('ai');

LogRocket.init(runtimeVariables.get('VUE_APP_LOGROCKET_ID'), {
  mergeIframes: true,
  parentDomain: runtimeVariables.get('VUE_APP_LOGROCKET_PARENT_DOMAIN'),
});

Vue.use(Buefy);
Vue.use(VueMoment);
Vue.use(API);
Vue.use(VueTour);
Vue.use(VueHighlightJS);
Vue.use(VShowSlide);

Vue.component('unnnic-divider', UnnnicDivider);
Vue.component('unnnic-intelligence-header', UnnnicIntelligenceHeader);
Vue.component('unnnic-intelligence-text', UnnnicIntelligenceText);

Vue.config.productionTip = false;

applyFilters(Vue);

if ((runtimeVariables.get('VUE_APP_BOTHUB_WEBAPP_USE_SENTRY'))
&& runtimeVariables.get('VUE_APP_BOTHUB_WEBAPP_SENTRY')) {
  Sentry.init({
    dsn: runtimeVariables.get('VUE_APP_BOTHUB_WEBAPP_SENTRY'),
    integrations: [new VueIntegration({ Vue, attachProps: true })],
    environment: runtimeVariables.get('SENTRY_ENVIRONMENT'),
    logErrors: true,

    beforeSend: (event) => {
      if (window.location.hostname === 'localhost') {
        return null;
      }
      return event;
    },
  });
}

new Vue({
  el: '#app',
  i18n,
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
