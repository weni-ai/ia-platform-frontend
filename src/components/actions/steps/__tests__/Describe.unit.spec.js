import { mount } from '@vue/test-utils';
import Describe from '../Describe.vue';

describe('Describe.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Describe, {
      props: {
        description: 'Initial Description',
        actionType: 'normal',
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

  describe('when the user selects a different action type', () => {
    it('emits update:actionType', async () => {
      const radios = wrapper.findAllComponents('[data-test="radio-option"]');

      await radios[1].vm.$emit('update:modelValue', 'cart');

      expect(wrapper.emitted('update:actionType')).toContainEqual(['cart']);
    });
  });

  describe('proper rendering of elements', () => {
    it('renders the correct number of radio options', () => {
      const radios = wrapper.findAll('[data-test="radio-option"]');
      expect(radios).toHaveLength(2);
    });

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

    it('sets the correct props on UnnnicRadio', () => {
      const radios = wrapper.findAllComponents('[data-test="radio-option"]');
      expect(radios[0].props('value')).toBe('normal');
      expect(radios[1].props('value')).toBe('cart');
    });
  });
});
