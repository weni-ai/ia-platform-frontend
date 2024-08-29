import { mount } from '@vue/test-utils';
import Describe from '../Describe.vue';

describe('Describe.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Describe, {
      props: {
        description: 'Initial Description',
        actionType: 'custom',
        currentActions: [
          { actionType: 'custom' },
          { actionType: 'whatsapp_cart' },
        ],
      },
    });
  });

  describe('when the user changes the description textarea', () => {
    it('emits update:description', async () => {
      const textarea = wrapper.findComponent(
        '[data-test="description-textarea"]',
      );
      await textarea.vm.$emit('update:modelValue', 'Updated Description');

      expect(wrapper.emitted('update:description')).toContainEqual([
        'Updated Description',
      ]);
    });
  });

  describe('proper rendering of elements', () => {
    it('sets the correct props on UnnnicTextArea', () => {
      const textarea = wrapper.findComponent(
        '[data-test="description-textarea"]',
      );
      expect(textarea.props('placeholder')).toBe(
        wrapper.vm.$t(
          'modals.actions.add.steps.describe.inputs.description.placeholder',
        ),
      );
    });
  });
});
