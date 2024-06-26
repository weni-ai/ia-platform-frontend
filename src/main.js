import Vue from 'vue';
import * as Sentry from '@sentry/vue';

import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './utils/plugins/i18n';
import iframessa from 'iframessa';
import UnnnicDivider from './components/Divider.vue';
import UnnnicIntelligenceHeader from './components/unnnic-intelligence/Header.vue';
import UnnnicIntelligenceText from './components/unnnic-intelligence/Text.vue';
import UnnnicSystemPlugin from './utils/UnnnicSystemPlugin.js';

import './utils/HandlerObstructiveError.js';

iframessa.register('ai');

Vue.use(UnnnicSystemPlugin);

Vue.component('unnnic-divider', UnnnicDivider);
Vue.component('UnnnicDivider', UnnnicDivider);

Vue.component('unnnic-intelligence-header', UnnnicIntelligenceHeader);
Vue.component('UnnnicIntelligenceHeader', UnnnicIntelligenceHeader);

Vue.component('unnnic-intelligence-text', UnnnicIntelligenceText);
Vue.component('UnnnicIntelligenceText', UnnnicIntelligenceText);

Vue.config.productionTip = false;

if (runtimeVariables.get('VITE_BOTHUB_WEBAPP_SENTRY')) {
  Sentry.init({
    Vue,
    dsn: runtimeVariables.get('VITE_BOTHUB_WEBAPP_SENTRY'),
    environment: runtimeVariables.get('SENTRY_ENVIRONMENT'),
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration(),
    ],

    tracesSampleRate: 1.0,

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    trackComponents: true,

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
