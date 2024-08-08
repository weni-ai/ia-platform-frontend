import { config } from '@vue/test-utils';
import i18n from '@/utils/plugins/i18n';
import UnnnicSystemPlugin from '@/utils/UnnnicSystemPlugin.js';
import UnnnicDivider from '@/components/Divider.vue';
import UnnnicIntelligenceHeader from '@/components/unnnic-intelligence/Header.vue';
import UnnnicIntelligenceText from '@/components/unnnic-intelligence/Text.vue';

class IntersectionObserverMock {
  observe() {}

  unobserve() {}

  disconnect() {}
}

global.IntersectionObserver = IntersectionObserverMock;

global.runtimeVariables = {
  get(name) {
    return {
      VITE_SUPPORTED_LANGUAGES: 'en:English|fr:French|es:Spanish',
      VITE_OPTIONS_WENIGPT:
        '[{"name": "golfinho-1", "description": "router.tunings.fields.golfinho-1", "model": "golfinho-1"}, {"name": "shark-1", "description": "router.tunings.fields.shark-1", "model": "shark-1"}]',
    }[name];
  },
};

config.global.plugins = [i18n, UnnnicSystemPlugin];
config.global.components = {
  UnnnicDivider,
  UnnnicIntelligenceHeader,
  UnnnicIntelligenceText,
};
