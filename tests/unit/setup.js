import Vue from 'vue';
import MockDate from 'mockdate';
import Buefy from 'buefy';

Vue.use(Buefy);

Vue.config.productionTip = false;

MockDate.set(1534341842684);

const runtimeVariables = {
  VITE_SUPPORTED_LANGUAGES: 'en|pt',
  VITE_VERSION: '0.0.0',
  VITE_BOTHUB_NLP_BASE_URL: 'http://localhost:2657/',
  VITE_BOTHUB_WEBAPP_BASE_URL: 'http://localhost:8080/',
  get(name) {
    return this[name] || import.meta.env[name];
  },
};

window.runtimeVariables = runtimeVariables;
window.alert = () => {};
window.matchMedia = () => ({});
window.scrollTo = () => {};
