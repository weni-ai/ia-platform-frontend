import Vue from 'vue';
import MockDate from 'mockdate';
import Buefy from 'buefy';

Vue.use(Buefy);
Vue.config.productionTip = false;


runtimeVariables.VUE_APP_SUPPORTED_LANGUAGES = 'en|pt'
runtimeVariables.VUE_APP_VERSION = '0.0.0'
runtimeVariables.VUE_APP_BOTHUB_NLP_BASE_URL = 'http://localhost:2657/'
runtimeVariables.VUE_APP_BOTHUB_WEBAPP_BASE_URL = 'http://localhost:8080/'

MockDate.set(1534341842684);

window.alert = () => {};
window.matchMedia = () => ({});
window.scrollTo = () => {};
