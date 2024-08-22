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

  describe('when the user selects a different action type', () => {
    it('emits update:actionType', async () => {
      const radios = wrapper.findAllComponents('[data-test="radio-option"]');
      await radios[1].vm.$emit('update:modelValue', 'whatsapp_cart');

      expect(wrapper.emitted('update:actionType')).toContainEqual([
        'whatsapp_cart',
      ]);
    });

    it('updates the description when actionType is "whatsapp_cart"', async () => {
      const radios = wrapper.findAllComponents('[data-test="radio-option"]');
      await radios[1].vm.$emit('update:modelValue', 'whatsapp_cart');

      const textarea = wrapper
        .find('[data-test="description-textarea"]')
        .find('textarea');

      expect(textarea.element.value).toBe(
        wrapper.vm.$t(
          'modals.actions.add.steps.describe.inputs.description.aux_text_whatsapp_cart',
        ),
      );
    });

    it('clears the description when actionType is "custom"', async () => {
      await wrapper.setProps({ actionType: 'whatsapp_cart' });
      const radios = wrapper.findAllComponents('[data-test="radio-option"]');
      await radios[0].vm.$emit('update:modelValue', 'custom');

      const textarea = wrapper
        .find('[data-test="description-textarea"]')
        .find('textarea');
      expect(textarea.element.value).toBe('');
    });
  });

  describe('hasCartAction function', () => {
    it('returns true if currentActions contains actionType "whatsapp_cart"', () => {
      expect(wrapper.vm.hasCartAction()).toBe(true);
    });

    it('returns false if currentActions does not contain actionType "whatsapp_cart"', async () => {
      await wrapper.setProps({ currentActions: [{ actionType: 'custom' }] });
      expect(wrapper.vm.hasCartAction()).toBe(false);
    });
  });

  describe('conditional rendering and behavior of radio buttons', () => {
    it('disables the "whatsapp_cart" radio button when hasCartAction is true', async () => {
      const radios = wrapper.findAllComponents('[data-test="radio-option"]');
      expect(radios[1].props('disabled')).toBe(true);
    });

    it('enables the "whatsapp_cart" radio button when hasCartAction is false', async () => {
      await wrapper.setProps({ currentActions: [{ actionType: 'custom' }] });
      const radios = wrapper.findAllComponents('[data-test="radio-option"]');
      expect(radios[1].props('disabled')).toBe(false);
    });

    it('enables the UnnnicToolTip for the "whatsapp_cart" radio button when hasCartAction is true', async () => {
      const radios = wrapper.findAllComponents('[data-test="radio-option"]');
      const cartRadio = radios[1];
      const tooltip = cartRadio.findComponent('[data-test="radio-tooltip"]');
      expect(tooltip.exists()).toBe(true);
      expect(tooltip.props('enabled')).toBe(true);
    });

    it('disables the UnnnicToolTip for the "whatsapp_cart" radio button when hasCartAction is false', async () => {
      await wrapper.setProps({ currentActions: [{ actionType: 'custom' }] });
      const radios = wrapper.findAllComponents('[data-test="radio-option"]');
      const cartRadio = radios[1];
      const tooltip = cartRadio.findComponent('[data-test="radio-tooltip"]');

      expect(tooltip.exists()).toBe(true);
      expect(tooltip.props('enabled')).toBe(false);
    });
  });

  describe('proper rendering of elements', () => {
    it('renders the correct number of radio options', () => {
      const radios = wrapper.findAllComponents('[data-test="radio-option"]');
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
      expect(radios[0].props('value')).toBe('custom');
      expect(radios[1].props('value')).toBe('whatsapp_cart');
    });
  });
});
