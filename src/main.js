import Vue from 'vue';
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';

import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './utils/plugins/i18n';
import iframessa from 'iframessa';
import UnnnicDivider from './components/Divider.vue';
import UnnnicIntelligenceHeader from './components/unnnic-intelligence/Header.vue';
import UnnnicIntelligenceText from './components/unnnic-intelligence/Text.vue';
import UnnnicSystemPlugin from './utils/UnnnicSystemPlugin.js';

iframessa.register('ai');

Vue.use(UnnnicSystemPlugin);

Vue.component('unnnic-divider', UnnnicDivider);
Vue.component('UnnnicDivider', UnnnicDivider);

Vue.component('unnnic-intelligence-header', UnnnicIntelligenceHeader);
Vue.component('UnnnicIntelligenceHeader', UnnnicIntelligenceHeader);

Vue.component('unnnic-intelligence-text', UnnnicIntelligenceText);
Vue.component('UnnnicIntelligenceText', UnnnicIntelligenceText);

Vue.config.productionTip = false;

if (
  runtimeVariables.get('VITE_BOTHUB_WEBAPP_USE_SENTRY') &&
  runtimeVariables.get('VITE_BOTHUB_WEBAPP_SENTRY')
) {
  Sentry.init({
    dsn: runtimeVariables.get('VITE_BOTHUB_WEBAPP_SENTRY'),
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
  i18n,
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
