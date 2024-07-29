import { mount } from '@vue/test-utils';
import Describe from '../Describe.vue';

describe('Describe.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Describe, {
      props: {
        description: 'Description',
      },
    });
  });

  describe('when the user changes the description textarea', () => {
    it('emits update:description', () => {
      const textarea = wrapper.findComponent(
        '[data-test="description-textarea"]',
      );

      textarea.vm.$emit('update:modelValue', 'Action Description');

      expect(wrapper.emitted('update:description')).toContainEqual([
        'Action Description',
      ]);
    });
  });
});
