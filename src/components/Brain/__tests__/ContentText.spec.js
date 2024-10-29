import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import ContentText from '@/components/Brain/ContentText.vue';
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      Brain: {
        contentText: {
          uuid: null,
          current: '',
          old: '',
        },
      },
    };
  },

  getters: {
    actionsTypesAvailable() {
      return [];
    },
  },

  actions: {
    async loadActions({ state: { Actions: state } }) {
      if (state.status !== null) {
        return;
      }

      try {
        state.status = 'loading';

        const { data } = mockItems;

        state.data = data;

        state.status = 'complete';
      } catch (error) {
        state.status = 'error';
      }
    },
  },
});

describe('ContentText.vue', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    wrapper = mount(ContentText, {
      props: {
        modelValue: { current: 'Initial text' },
        ...props,
      },

      global: {
        plugins: [store],
      },
    });
  };

  beforeEach(() => {
    createWrapper();
  });

  describe('when isLoading is true', () => {
    beforeEach(() => {
      createWrapper({ isLoading: true });
    });

    it('renders the skeleton loader', () => {
      const skeletonLoader = wrapper.findComponent({
        name: 'UnnnicSkeletonLoading',
      });
      expect(skeletonLoader.exists()).toBeTruthy();
    });

    it('does not render the textarea', () => {
      const textarea = wrapper.find('textarea');
      expect(textarea.exists()).toBeFalsy();
    });
  });

  describe('when isLoading is false', () => {
    beforeEach(() => {
      createWrapper({ isLoading: false });
    });

    it('renders the textarea with the correct initial value', () => {
      const textarea = wrapper.find('textarea');
      expect(textarea.exists()).toBeTruthy();
      expect(textarea.element.value).toBe('Initial text');
    });

    it('renders the header with the description text', () => {
      const headerText = wrapper.find('header p');
      expect(headerText.exists()).toBeTruthy();
      expect(headerText.text()).toBe(
        wrapper.vm.$t('content_bases.text.description'),
      );
    });
  });
});
