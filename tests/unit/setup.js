import Vue from 'vue';
import MockDate from 'mockdate';
import Buefy from 'buefy';

Vue.use(Buefy);

Vue.config.productionTip = false;

MockDate.set(1534341842684);

window.alert = () => {};
window.matchMedia = () => ({});
window.scrollTo = () => {};
