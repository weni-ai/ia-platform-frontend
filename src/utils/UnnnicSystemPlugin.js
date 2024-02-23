import * as UnnnicSystem from '@weni/unnnic-system';

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default {
  install(Vue) {
    for (const componentName in UnnnicSystem) {
      Vue.component(capitalize(componentName), UnnnicSystem[componentName]);
    }
  },
};
