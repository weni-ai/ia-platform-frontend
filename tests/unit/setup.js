import Vue from 'vue';
import Buefy from 'buefy';

Vue.use(Buefy);

Vue.config.productionTip = false;

const runtimeVariables = {
  VUE_APP_SUPPORTED_LANGUAGES: 'en|pt',
  VUE_APP_VERSION: '0.0.0',
  VUE_APP_BOTHUB_NLP_BASE_URL: 'http://localhost:2657/',
  VUE_APP_BOTHUB_WEBAPP_BASE_URL: 'http://localhost:8080/',
  VUE_APP_OPTIONS_WENIGPT:
    '{"golfinho-1": "runpod", "boto-1": "ft:gpt-3.5-turbo-0125:weni:wenigpt:9Fpx8jej"}',
  get(name) {
    return this[name] || process.env[name];
  },
};

window.runtimeVariables = runtimeVariables;
window.alert = () => {};
window.matchMedia = () => ({});
window.scrollTo = () => {};
